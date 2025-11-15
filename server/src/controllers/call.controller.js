// ============================================
// FILE: server/src/controllers/call.controller.js
// ============================================
const callService = require('../services/call.service');
const webrtcService = require('../services/webrtc.service');
const logger = require('../utils/logger');
const { HTTP_STATUS } = require('../config/constants');

class CallController {
  async getIceServers(req, res, next) {
    try {
      const iceServers = webrtcService.getIceServers();

      res.json({
        success: true,
        data: { iceServers },
      });
    } catch (error) {
      next(error);
    }
  }

  async getCallHistory(req, res, next) {
    try {
      const userId = req.user.id;
      const { limit = 50, cursor } = req.query;

      const calls = await callService.getCallHistory(
        userId,
        parseInt(limit),
        cursor
      );

      res.json({
        success: true,
        data: calls,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteCallHistory(req, res, next) {
    try {
      const userId = req.user.id;
      const { callId } = req.params;

      await callService.deleteCallHistory(userId, callId);

      logger.info({ userId, callId }, 'Call history deleted');

      res.json({
        success: true,
        message: 'Call history deleted',
      });
    } catch (error) {
      next(error);
    }
  }

  async getCallStatistics(req, res, next) {
    try {
      const userId = req.user.id;
      const stats = await callService.getCallStatistics(userId);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CallController();