// ============================================
// FILE: server/src/controllers/media.controller.js
// ============================================
const mediaService = require('../services/media.service');
const logger = require('../utils/logger');
const { HTTP_STATUS } = require('../config/constants');

class MediaController {
  async uploadImage(req, res, next) {
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

      const result = await mediaService.uploadImage(req.file, userId);

      logger.info({ userId, fileName: result.fileName }, 'Image uploaded');

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async uploadVideo(req, res, next) {
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

      const result = await mediaService.uploadVideo(req.file, userId);

      logger.info({ userId, fileName: result.fileName }, 'Video uploaded');

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async uploadAudio(req, res, next) {
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

      const result = await mediaService.uploadAudio(req.file, userId);

      logger.info({ userId, fileName: result.fileName }, 'Audio uploaded');

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new MediaController();