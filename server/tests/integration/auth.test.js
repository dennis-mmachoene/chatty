// ============================================
// FILE: server/tests/integration/auth.test.js
// ============================================
const request = require('supertest');
const app = require('../../src/app');
const { supabase } = require('../../src/config/database');

describe('Auth API Integration Tests', () => {
  describe('POST /api/auth/request-otp', () => {
    it('should send OTP for valid email', async () => {
      const res = await request(app)
        .post('/api/auth/request-otp')
        .send({ email: 'test10@example.com' })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('OTP sent');
    });

    it('should reject invalid email', async () => {
      const res = await request(app)
        .post('/api/auth/request-otp')
        .send({ email: 'invalid-email' })
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it('should rate limit OTP requests', async () => {
      const email = 'test11@example.com';

      // Send 3 OTPs
      for (let i = 0; i < 3; i++) {
        await request(app)
          .post('/api/auth/request-otp')
          .send({ email });
      }

      // 4th request should be rate limited
      const res = await request(app)
        .post('/api/auth/request-otp')
        .send({ email })
        .expect(429);

      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/verify-otp', () => {
    it('should authenticate with valid OTP', async () => {
      const email = 'test12@example.com';

      // Request OTP
      await request(app)
        .post('/api/auth/request-otp')
        .send({ email });

      // Get OTP from database
      const { data: otpData } = await supabase
        .from('otps')
        .select('code')
        .eq('email', email)
        .eq('used', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      // Verify OTP
      const res = await request(app)
        .post('/api/auth/verify-otp')
        .send({ email, code: otpData.code })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeTruthy();
      expect(res.body.data.refreshToken).toBeTruthy();
      expect(res.body.data.user.email).toBe(email);
    });

    it('should reject invalid OTP', async () => {
      const res = await request(app)
        .post('/api/auth/verify-otp')
        .send({ email: 'test13@example.com', code: '999999' })
        .expect(401);

      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should refresh access token', async () => {
      // Create user and get tokens
      const email = 'test14@example.com';
      await request(app)
        .post('/api/auth/request-otp')
        .send({ email });

      const { data: otpData } = await supabase
        .from('otps')
        .select('code')
        .eq('email', email)
        .eq('used', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      const authRes = await request(app)
        .post('/api/auth/verify-otp')
        .send({ email, code: otpData.code });

      const { refreshToken } = authRes.body.data;

      // Refresh token
      const res = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeTruthy();
      expect(res.body.data.refreshToken).toBeTruthy();
    });
  });
});