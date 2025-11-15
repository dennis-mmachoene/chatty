// ============================================
// FILE: server/tests/unit/services/token.service.test.js
// ============================================
const tokenService = require('../../../src/services/token.service');
const Encryption = require('../../../src/utils/encryption');

describe('TokenService', () => {
  const mockUser = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    display_name: 'Test User',
  };

  describe('generateAccessToken', () => {
    it('should generate valid JWT', () => {
      const token = tokenService.generateAccessToken(mockUser);
      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');
    });

    it('should include user data in token', () => {
      const token = tokenService.generateAccessToken(mockUser);
      const decoded = tokenService.verifyAccessToken(token);

      expect(decoded.userId).toBe(mockUser.id);
      expect(decoded.email).toBe(mockUser.email);
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate random string', () => {
      const token = tokenService.generateRefreshToken();
      expect(token).toBeTruthy();
      expect(token.length).toBe(128); // 64 bytes hex
    });

    it('should generate unique tokens', () => {
      const token1 = tokenService.generateRefreshToken();
      const token2 = tokenService.generateRefreshToken();
      expect(token1).not.toBe(token2);
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify valid token', () => {
      const token = tokenService.generateAccessToken(mockUser);
      const decoded = tokenService.verifyAccessToken(token);

      expect(decoded).toBeTruthy();
      expect(decoded.userId).toBe(mockUser.id);
    });

    it('should reject invalid token', () => {
      expect(() => {
        tokenService.verifyAccessToken('invalid-token');
      }).toThrow();
    });
  });

  describe('storeRefreshToken', () => {
    it('should store refresh token in database', async () => {
      const user = await global.createTestUser('test9@example.com');
      const refreshToken = tokenService.generateRefreshToken();

      const stored = await tokenService.storeRefreshToken(user.id, refreshToken);

      expect(stored).toBeTruthy();
      expect(stored.user_id).toBe(user.id);
    });
  });
});