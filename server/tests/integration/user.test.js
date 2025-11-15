// ============================================
// FILE: server/tests/integration/user.test.js
// ============================================
const request = require('supertest');
const app = require('../../src/app');
const tokenService = require('../../src/services/token.service');

describe('User API Integration Tests', () => {
  let accessToken;
  let user;

  beforeEach(async () => {
    user = await global.createTestUser('test15@example.com');
    accessToken = tokenService.generateAccessToken(user);
  });

  describe('GET /api/users/profile', () => {
    it('should get user profile', async () => {
      const res = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe(user.email);
    });

    it('should reject unauthenticated request', async () => {
      const res = await request(app)
        .get('/api/users/profile')
        .expect(401);

      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /api/users/profile', () => {
    it('should update user profile', async () => {
      const res = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          displayName: 'Updated Name',
          statusMessage: 'Hello World',
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.display_name).toBe('Updated Name');
      expect(res.body.data.status_message).toBe('Hello World');
    });
  });

  describe('GET /api/users/search', () => {
    it('should search users by email', async () => {
      const res = await request(app)
        .get('/api/users/search')
        .query({ q: 'test15' })
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });
});