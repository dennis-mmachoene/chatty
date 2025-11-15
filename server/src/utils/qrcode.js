// ============================================
// FILE: server/src/utils/qrcode.js
// ============================================
const QRCode = require('qrcode');
const logger = require('./logger');

class QRCodeGenerator {
  static async generate(data, options = {}) {
    try {
      const defaultOptions = {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
        width: 300,
        ...options,
      };

      return await QRCode.toDataURL(data, defaultOptions);
    } catch (error) {
      logger.error('QR code generation error:', error);
      throw error;
    }
  }

  static async generateBuffer(data, options = {}) {
    try {
      return await QRCode.toBuffer(data, options);
    } catch (error) {
      logger.error('QR code buffer generation error:', error);
      throw error;
    }
  }

  static async generateContactQRCode(userId, email) {
    const contactData = JSON.stringify({
      type: 'contact',
      userId,
      email,
      timestamp: Date.now(),
    });

    return this.generate(contactData);
  }

  static parseContactQRCode(qrData) {
    try {
      const data = JSON.parse(qrData);
      if (data.type !== 'contact' || !data.userId || !data.email) {
        throw new Error('Invalid contact QR code');
      }
      return data;
    } catch (error) {
      logger.error('QR code parsing error:', error);
      throw new Error('Invalid QR code format');
    }
  }
}

module.exports = QRCodeGenerator;