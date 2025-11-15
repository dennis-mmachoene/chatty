// ============================================
// FILE: server/src/controllers/status.controller.js
// ============================================
const statusService = require('../services/status.service');
const logger = require('../utils/logger');
const { HTTP_STATUS } = require('../config/constants');

class StatusController {
  async createStatus(req, res, next) {
    try {
      const userId = req.user.id;
      const statusData = req.body;

      const status = await statusService.createStatus(userId, statusData);

      logger.info({ userId, statusId: status.id }, 'Status created');

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        data: status,
      });
    } catch (error) {
      next(error);
    }
  }

  async getMyStatuses(req, res, next) {
    try {
      const userId = req.user.id;
      const statuses = await statusService.getUserStatuses(userId);

      res.json({
        success: true,
        data: statuses,
      });
    } catch (error) {
      next(error);
    }
  }

  async getContactStatuses(req, res, next) {
    try {
      const userId = req.user.id;
      const statuses = await statusService.getContactStatuses(userId);

      res.json({
        success: true,
        data: statuses,
      });
    } catch (error) {
      next(error);
    }
  }

  async viewStatus(req, res, next) {
    try {
      const userId = req.user.id;
      const { statusId } = req.params;

      await statusService.viewStatus(statusId, userId);

      res.json({
        success: true,
        message: 'Status viewed',
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteStatus(req, res, next) {
    try {
      const userId = req.user.id;
      const { statusId } = req.params;

      await statusService.deleteStatus(statusId, userId);

      logger.info({ userId, statusId }, 'Status deleted');

      res.json({
        success: true,
        message: 'Status deleted',
      });
    } catch (error) {
      next(error);
    }
  }

  async getViewers(req, res, next) {
    try {
      const userId = req.user.id;
      const { statusId } = req.params;

      const viewers = await statusService.getStatusViewers(statusId, userId);

      res.json({
        success: true,
        data: viewers,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new StatusController();