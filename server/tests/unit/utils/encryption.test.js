// ============================================
// FILE: server/tests/unit/utils/encryption.test.js
// ============================================
const Encryption = require('../../../src/utils/encryption');

describe('Encryption', () => {
  describe('hashPassword', () => {
    it('should hash password', async () => {
      const password = 'testpassword123';
      const hash = await Encryption.hashPassword(password);

      expect(hash).toBeTruthy();
      expect(hash).not.toBe(password);
    });

    it('should generate different hashes for same password', async () => {
      const password = 'testpassword123';
      const hash1 = await Encryption.hashPassword(password);
      const hash2 = await Encryption.hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('comparePassword', () => {
    it('should verify correct password', async () => {
      const password = 'testpassword123';
      const hash = await Encryption.hashPassword(password);
      const isValid = await Encryption.comparePassword(password, hash);

      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'testpassword123';
      const hash = await Encryption.hashPassword(password);
      const isValid = await Encryption.comparePassword('wrongpassword', hash);

      expect(isValid).toBe(false);
    });
  });

  describe('generateOTP', () => {
    it('should generate OTP of correct length', () => {
      const otp = Encryption.generateOTP(6);
      expect(otp).toHaveLength(6);
      expect(/^\d+$/.test(otp)).toBe(true);
    });

    it('should generate different OTPs', () => {
      const otp1 = Encryption.generateOTP();
      const otp2 = Encryption.generateOTP();
      expect(otp1).not.toBe(otp2);
    });
  });

  describe('hashToken', () => {
    it('should hash token consistently', () => {
      const token = 'test-token-123';
      const hash1 = Encryption.hashToken(token);
      const hash2 = Encryption.hashToken(token);

      expect(hash1).toBe(hash2);
    });

    it('should generate different hashes for different tokens', () => {
      const hash1 = Encryption.hashToken('token1');
      const hash2 = Encryption.hashToken('token2');

      expect(hash1).not.toBe(hash2);
    });
  });
});