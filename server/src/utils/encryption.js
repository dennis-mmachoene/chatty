// ============================================
// FILE: server/src/utils/encryption.js
// ============================================
const crypto = require('crypto');
const bcrypt = require('bcrypt');

const ALGORITHM = 'aes-256-gcm';
const SALT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS, 10) || 12;

class Encryption {
  static async hashPassword(password) {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  static async comparePassword(password, hash) {
    return bcrypt.compare(password, hash);
  }

  static hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  static generateRandomString(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  static generateOTP(length = 6) {
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
    return Math.floor(min + Math.random() * (max - min + 1)).toString();
  }

  static encrypt(text, key) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(key, 'hex'), iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      iv: iv.toString('hex'),
      encryptedData: encrypted,
      authTag: authTag.toString('hex'),
    };
  }

  static decrypt(encryptedData, key, iv, authTag) {
    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      Buffer.from(key, 'hex'),
      Buffer.from(iv, 'hex')
    );
    
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));
    
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  static createHmac(data, secret) {
    return crypto.createHmac('sha256', secret).update(data).digest('hex');
  }

  static verifyHmac(data, secret, signature) {
    const expected = this.createHmac(data, secret);
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  }
}

module.exports = Encryption;