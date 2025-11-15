// ============================================
// FILE: server/tests/unit/services/auth.service.test.js
// ============================================
const authService = require('../../../src/services/auth.service');
const { supabase } = require('../../../src/config/database');
const { cache } = require('../../../src/config/redis');

describe('AuthService', () => {
  describe('generateOTP', () => {
    it('should generate a 6-digit OTP', async () => {
      const email = 'test@example.com';
      const otp = await authService.generateOTP(email, '127.0.0.1', 'test-agent');

      expect(otp).toHaveLength(6);
      expect(/^\d{6}$/.test(otp)).toBe(true);
    });

    it('should store OTP in database', async () => {
      const email = 'test2@example.com';
      const otp = await authService.generateOTP(email, '127.0.0.1', 'test-agent');

      const { data } = await supabase
        .from('otps')
        .select('*')
        .eq('email', email)
        .eq('code', otp)
        .single();

      expect(data).toBeTruthy();
      expect(data.code).toBe(otp);
    });

    it('should cache OTP', async () => {
      const email = 'test3@example.com';
      const otp = await authService.generateOTP(email, '127.0.0.1', 'test-agent');

      const cached = await cache.get(`otp:${email}:${otp}`);
      expect(cached).toBeTruthy();
    });
  });

  describe('checkOTPRateLimit', () => {
    it('should allow OTP generation within limits', async () => {
      const email = 'test4@example.com';
      const canSend = await authService.checkOTPRateLimit(email);
      expect(canSend).toBe(true);
    });

    it('should block OTP generation after limit exceeded', async () => {
      const email = 'test5@example.com';

      // Generate 3 OTPs
      for (let i = 0; i < 3; i++) {
        await authService.generateOTP(email, '127.0.0.1', 'test-agent');
      }

      const canSend = await authService.checkOTPRateLimit(email);
      expect(canSend).toBe(false);
    });
  });

  describe('verifyOTP', () => {
    it('should verify valid OTP', async () => {
      const email = 'test6@example.com';
      const otp = await authService.generateOTP(email, '127.0.0.1', 'test-agent');

      const user = await authService.verifyOTP(email, otp);
      expect(user).toBeTruthy();
      expect(user.email).toBe(email);
    });

    it('should reject invalid OTP', async () => {
      const email = 'test7@example.com';
      await authService.generateOTP(email, '127.0.0.1', 'test-agent');

      await expect(
        authService.verifyOTP(email, '999999')
      ).rejects.toThrow();
    });

    it('should mark OTP as used after verification', async () => {
      const email = 'test8@example.com';
      const otp = await authService.generateOTP(email, '127.0.0.1', 'test-agent');

      await authService.verifyOTP(email, otp);

      // Try to verify again
      await expect(
        authService.verifyOTP(email, otp)
      ).rejects.toThrow();
    });
  });
});