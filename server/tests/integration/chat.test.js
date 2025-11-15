// ============================================
// FILE: server/tests/integration/chat.test.js
// ============================================
const request = require('supertest');
const app = require('../../src/app');
const tokenService = require('../../src/services/token.service');

describe('Chat API Integration Tests', () => {
  let accessToken;
  let user1;
  let user2;

  beforeEach(async () => {
    user1 = await global.createTestUser('test16@example.com');
    user2 = await global.createTestUser('test17@example.com');
    accessToken = tokenService.generateAccessToken(user1);
  });

  describe('POST /api/chats/conversations/direct', () => {
    it('should create direct conversation', async () => {
      const res = await request(app)
        .post('/api/chats/conversations/direct')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ contactId: user2.id })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.type).toBe('direct');
    });
  });

  describe('GET /api/chats/conversations', () => {
    it('should get user conversations', async () => {
      const res = await request(app)
        .get('/api/chats/conversations')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });
});