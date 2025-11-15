// ============================================
// FILE: server/src/utils/sanitizer.js
// ============================================
const validator = require('validator');

class Sanitizer {
  static sanitizeString(str) {
    if (typeof str !== 'string') return str;
    
    return str
      .trim()
      .replace(/[\x00-\x1F\x7F-\x9F]/g, '') // Remove control characters
      .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove scripts
      .replace(/<iframe[^>]*>.*?<\/iframe>/gi, ''); // Remove iframes
  }

  static sanitizeHtml(html) {
    return validator.escape(html);
  }

  static sanitizeEmail(email) {
    return validator.normalizeEmail(email, {
      all_lowercase: true,
      gmail_remove_dots: false,
    });
  }

  static sanitizeInput(input) {
    if (typeof input === 'string') {
      return this.sanitizeString(input);
    }
    
    if (Array.isArray(input)) {
      return input.map((item) => this.sanitizeInput(item));
    }
    
    if (typeof input === 'object' && input !== null) {
      const sanitized = {};
      for (const [key, value] of Object.entries(input)) {
        sanitized[key] = this.sanitizeInput(value);
      }
      return sanitized;
    }
    
    return input;
  }

  static removeXSS(str) {
    if (typeof str !== 'string') return str;
    
    return str
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/<script/gi, '&lt;script')
      .replace(/<\/script>/gi, '&lt;/script&gt;');
  }

  static sanitizeFileName(fileName) {
    return fileName
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/\.{2,}/g, '.')
      .replace(/^\.+/, '')
      .substring(0, 255);
  }
}

module.exports = Sanitizer;