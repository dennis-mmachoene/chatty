// ============================================
// FILE: server/src/controllers/user.controller.js
// ============================================
const userService = require('../services/user.service');
const contactService = require('../services/contact.service');
const mediaService = require('../services/media.service');
const QRCodeGenerator = require('../utils/qrcode');
const logger = require('../utils/logger');
const { HTTP_STATUS } = require('../config/constants');
const { BUCKETS } = require('../config/storage');

class UserController {
  async getProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const user = await userService.getUserById(userId, false);

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req, res, next) {
    try {
      const { userId } = req.params;
      const user = await userService.getUserById(userId);

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const updates = req.body;

      const user = await userService.updateUserProfile(userId, updates);

      logger.info({ userId }, 'Profile updated');

      res.json({
        success: true,
        data: user,
        message: 'Profile updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async uploadAvatar(req, res, next) {
    try {
      const userId = req.user.id;

      if (!req.file) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: {
            code: 'NO_FILE',
            message: 'No file uploaded',
          },
        });
      }

      // Upload image
      const { url } = await mediaService.uploadImage(
        req.file,
        userId,
        BUCKETS.AVATARS
      );

      // Update user profile
      const user = await userService.updateUserProfile(userId, {
        avatar_url: url,
      });

      logger.info({ userId }, 'Avatar updated');

      res.json({
        success: true,
        data: { avatarUrl: url },
        message: 'Avatar updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async searchUsers(req, res, next) {
    try {
      const { q: query } = req.query;
      const currentUserId = req.user.id;

      if (!query || query.length < 2) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: {
            code: 'INVALID_QUERY',
            message: 'Search query must be at least 2 characters',
          },
        });
      }

      const users = await userService.searchUsers(query, currentUserId);

      res.json({
        success: true,
        data: users,
      });
    } catch (error) {
      next(error);
    }
  }

  async getSettings(req, res, next) {
    try {
      const userId = req.user.id;
      const settings = await userService.getUserSettings(userId);

      res.json({
        success: true,
        data: settings,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateSettings(req, res, next) {
    try {
      const userId = req.user.id;
      const settings = req.body;

      const updated = await userService.updateUserSettings(userId, settings);

      logger.info({ userId }, 'Settings updated');

      res.json({
        success: true,
        data: updated,
        message: 'Settings updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async generateQRCode(req, res, next) {
    try {
      const { id: userId, email } = req.user;

      const qrCode = await QRCodeGenerator.generateContactQRCode(userId, email);

      res.json({
        success: true,
        data: { qrCode },
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteAccount(req, res, next) {
    try {
      const userId = req.user.id;

      await userService.deleteAccount(userId);
      await tokenService.revokeAllUserTokens(userId);

      logger.info({ userId }, 'Account deleted');

      res.json({
        success: true,
        message: 'Account deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async exportData(req, res, next) {
    try {
      const userId = req.user.id;

      // This would collect all user data for GDPR compliance
      const userData = {
        profile: await userService.getUserById(userId, false),
        // Add more data exports here
      };

      res.json({
        success: true,
        data: userData,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();