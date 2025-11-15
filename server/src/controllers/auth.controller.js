// ============================================
// FILE: server/src/controllers/auth.controller.js
// ============================================
const authService = require('../services/auth.service');
const emailService = require('../services/email.service');
const tokenService = require('../services/token.service');
const logger = require('../utils/logger');
const Helpers = require('../utils/helpers');
const { HTTP_STATUS } = require('../config/constants');

class AuthController {
  async requestOTP(req, res, next) {
    try {
      const { email } = req.body;
      const ip = req.ip;
      const userAgent = req.get('user-agent');

      // Check rate limit
      const canSend = await authService.checkOTPRateLimit(email);
      if (!canSend) {
        return res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many OTP requests. Please try again in an hour.',
          },
        });
      }

      // Generate and send OTP
      const otp = await authService.generateOTP(email, ip, userAgent);
      await emailService.sendOTP(email, otp);

      logger.info({ email }, 'OTP sent successfully');

      res.json({
        success: true,
        message: 'OTP sent to your email address',
        expiresIn: 300, // 5 minutes in seconds
      });
    } catch (error) {
      next(error);
    }
  }

  async verifyOTP(req, res, next) {
    try {
      const { email, code } = req.body;

      // Verify OTP
      const user = await authService.verifyOTP(email, code);

      // Generate tokens
      const accessToken = tokenService.generateAccessToken(user);
      const refreshToken = tokenService.generateRefreshToken();

      // Store refresh token
      await tokenService.storeRefreshToken(user.id, refreshToken);

      // Send welcome email for new users
      if (!user.last_seen) {
        await emailService.sendWelcomeEmail(user.email, user.display_name);
      }

      logger.info({ userId: user.id }, 'User authenticated successfully');

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            displayName: user.display_name,
            avatarUrl: user.avatar_url,
            statusMessage: user.status_message,
          },
          accessToken,
          refreshToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: {
            code: 'MISSING_TOKEN',
            message: 'Refresh token is required',
          },
        });
      }

      // Verify and rotate refresh token
      const result = await tokenService.rotateRefreshToken(refreshToken);

      logger.info({ userId: result.user.id }, 'Token refreshed successfully');

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      const { refreshToken } = req.body;
      const userId = req.user.id;

      if (refreshToken) {
        await tokenService.revokeRefreshToken(userId, refreshToken);
      }

      logger.info({ userId }, 'User logged out');

      res.json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async logoutAll(req, res, next) {
    try {
      const userId = req.user.id;

      await tokenService.revokeAllUserTokens(userId);

      logger.info({ userId }, 'All sessions logged out');

      res.json({
        success: true,
        message: 'All sessions logged out successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();

