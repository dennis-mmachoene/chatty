// ============================================
// FILE: server/src/services/token.service.js
// ============================================
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { supabase } = require('../config/database');
const Encryption = require('../utils/encryption');
const { AuthenticationError } = require('../utils/errors');
const logger = require('../utils/logger');

class TokenService {
  constructor() {
    this.accessTokenSecret = process.env.JWT_SECRET;
    this.refreshTokenSecret = process.env.JWT_REFRESH_SECRET;
    this.accessTokenExpiry = process.env.JWT_ACCESS_EXPIRY || '15m';
    this.refreshTokenExpiry = process.env.JWT_REFRESH_EXPIRY || '7d';
  }

  generateAccessToken(user) {
    const payload = {
      userId: user.id,
      email: user.email,
      type: 'access',
    };

    return jwt.sign(payload, this.accessTokenSecret, {
      expiresIn: this.accessTokenExpiry,
      issuer: 'chat-platform',
      audience: 'chat-platform-users',
    });
  }

  generateRefreshToken() {
    return Encryption.generateRandomString(64);
  }

  verifyAccessToken(token) {
    try {
      const decoded = jwt.verify(token, this.accessTokenSecret, {
        issuer: 'chat-platform',
        audience: 'chat-platform-users',
      });
      return decoded;
    } catch (error) {
      logger.error('Access token verification failed:', error);
      throw new AuthenticationError('Invalid or expired token');
    }
  }

  async storeRefreshToken(userId, refreshToken) {
    try {
      const tokenHash = Encryption.hashToken(refreshToken);
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

      const { data, error } = await supabase
        .from('refresh_tokens')
        .insert({
          user_id: userId,
          token_hash: tokenHash,
          expires_at: expiresAt.toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Failed to store refresh token:', error);
      throw error;
    }
  }

  async verifyRefreshToken(refreshToken) {
    try {
      const tokenHash = Encryption.hashToken(refreshToken);

      const { data, error } = await supabase
        .from('refresh_tokens')
        .select('*, users!inner(*)')
        .eq('token_hash', tokenHash)
        .eq('revoked', false)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error || !data) {
        throw new AuthenticationError('Invalid or expired refresh token');
      }

      return data.users;
    } catch (error) {
      logger.error('Refresh token verification failed:', error);
      throw new AuthenticationError('Invalid or expired refresh token');
    }
  }

  async rotateRefreshToken(oldRefreshToken) {
    try {
      // Verify old token
      const user = await this.verifyRefreshToken(oldRefreshToken);

      // Revoke old token
      const oldTokenHash = Encryption.hashToken(oldRefreshToken);
      await supabase
        .from('refresh_tokens')
        .update({ revoked: true })
        .eq('token_hash', oldTokenHash);

      // Generate new tokens
      const accessToken = this.generateAccessToken(user);
      const newRefreshToken = this.generateRefreshToken();

      // Store new refresh token
      await this.storeRefreshToken(user.id, newRefreshToken);

      return {
        accessToken,
        refreshToken: newRefreshToken,
        user: {
          id: user.id,
          email: user.email,
          displayName: user.display_name,
          avatarUrl: user.avatar_url,
        },
      };
    } catch (error) {
      logger.error('Token rotation failed:', error);
      throw error;
    }
  }

  async revokeRefreshToken(userId, refreshToken) {
    try {
      const tokenHash = Encryption.hashToken(refreshToken);

      const { error } = await supabase
        .from('refresh_tokens')
        .update({ revoked: true })
        .eq('user_id', userId)
        .eq('token_hash', tokenHash);

      if (error) throw error;
      return true;
    } catch (error) {
      logger.error('Failed to revoke refresh token:', error);
      return false;
    }
  }

  async revokeAllUserTokens(userId) {
    try {
      const { error } = await supabase
        .from('refresh_tokens')
        .update({ revoked: true })
        .eq('user_id', userId)
        .eq('revoked', false);

      if (error) throw error;
      return true;
    } catch (error) {
      logger.error('Failed to revoke all user tokens:', error);
      return false;
    }
  }

  async cleanupExpiredTokens() {
    try {
      const { error } = await supabase
        .from('refresh_tokens')
        .delete()
        .lt('expires_at', new Date().toISOString());

      if (error) throw error;
      logger.info('Expired tokens cleaned up');
    } catch (error) {
      logger.error('Failed to cleanup expired tokens:', error);
    }
  }
}

module.exports = new TokenService();