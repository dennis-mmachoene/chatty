// ============================================
// FILE: server/src/services/auth.service.js
// ============================================
const { supabase } = require('../config/database');
const { cache } = require('../config/redis');
const Encryption = require('../utils/encryption');
const logger = require('../utils/logger');
const { OTP } = require('../config/constants');
const { AuthenticationError, RateLimitError } = require('../utils/errors');

class AuthService {
  async generateOTP(email, ip, userAgent) {
    try {
      const code = Encryption.generateOTP(OTP.LENGTH);
      const expiresAt = new Date(Date.now() + OTP.EXPIRY_MINUTES * 60 * 1000);

      const { data, error } = await supabase
        .from('otps')
        .insert({
          email: email.toLowerCase(),
          code,
          expires_at: expiresAt.toISOString(),
          ip_address: ip,
          user_agent: userAgent,
        })
        .select()
        .single();

      if (error) throw error;

      // Store in cache for quick validation
      await cache.set(`otp:${email}:${code}`, { id: data.id }, OTP.EXPIRY_MINUTES * 60);

      logger.info(`OTP generated for ${email}`);
      return code;
    } catch (error) {
      logger.error('OTP generation error:', error);
      throw error;
    }
  }

  async checkOTPRateLimit(email) {
    try {
      const key = `otp:rate:${email}`;
      const count = await cache.get(key);

      if (count && count >= OTP.RATE_LIMIT_MAX) {
        return false;
      }

      // Check database for recent OTPs
      const oneHourAgo = new Date(Date.now() - OTP.RATE_LIMIT_WINDOW);
      const { data, error } = await supabase
        .from('otps')
        .select('count')
        .eq('email', email.toLowerCase())
        .gte('created_at', oneHourAgo.toISOString());

      if (error) throw error;

      const dbCount = data.length;
      if (dbCount >= OTP.RATE_LIMIT_MAX) {
        await cache.set(key, dbCount, 3600); // 1 hour
        return false;
      }

      // Increment counter
      await cache.set(key, dbCount + 1, 3600);
      return true;
    } catch (error) {
      logger.error('OTP rate limit check error:', error);
      return true; // Allow on error to not block legitimate users
    }
  }

  async verifyOTP(email, code) {
    try {
      const normalizedEmail = email.toLowerCase();

      // Check cache first
      const cached = await cache.get(`otp:${normalizedEmail}:${code}`);
      if (!cached) {
        throw new AuthenticationError('Invalid or expired OTP');
      }

      // Verify in database
      const { data: otpData, error: otpError } = await supabase
        .from('otps')
        .select('*')
        .eq('email', normalizedEmail)
        .eq('code', code)
        .eq('used', false)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (otpError || !otpData) {
        throw new AuthenticationError('Invalid or expired OTP');
      }

      // Mark OTP as used
      await supabase
        .from('otps')
        .update({ used: true })
        .eq('id', otpData.id);

      // Clear cache
      await cache.del(`otp:${normalizedEmail}:${code}`);

      // Find or create user
      let { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', normalizedEmail)
        .single();

      if (userError && userError.code === 'PGRST116') {
        // User doesn't exist, create new one
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            email: normalizedEmail,
            display_name: normalizedEmail.split('@')[0],
          })
          .select()
          .single();

        if (createError) throw createError;
        user = newUser;

        logger.info(`New user created: ${user.id}`);
      } else if (userError) {
        throw userError;
      }

      // Update last seen
      await supabase
        .from('users')
        .update({
          last_seen: new Date().toISOString(),
          is_online: true,
        })
        .eq('id', user.id);

      return user;
    } catch (error) {
      logger.error('OTP verification error:', error);
      throw error;
    }
  }

  async cleanupExpiredOTPs() {
    try {
      const { error } = await supabase
        .from('otps')
        .delete()
        .lt('expires_at', new Date().toISOString());

      if (error) throw error;
      logger.info('Expired OTPs cleaned up');
    } catch (error) {
      logger.error('Failed to cleanup expired OTPs:', error);
    }
  }
}

module.exports = new AuthService();