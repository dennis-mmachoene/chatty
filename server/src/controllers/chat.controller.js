// ============================================
// FILE: server/src/controllers/chat.controller.js
// ============================================
const conversationService = require('../services/conversation.service');
const messageService = require('../services/message.service');
const logger = require('../utils/logger');
const { HTTP_STATUS } = require('../config/constants');

class ChatController {
  async getConversations(req, res, next) {
    try {
      const userId = req.user.id;
      const { limit = 50, cursor } = req.query;

      const conversations = await conversationService.getUserConversations(
        userId,
        parseInt(limit),
        cursor
      );

      res.json({
        success: true,
        data: conversations,
      });
    } catch (error) {
      next(error);
    }
  }

  async getOrCreateDirectConversation(req, res, next) {
    try {
      const userId = req.user.id;
      const { contactId } = req.body;

      const conversation = await conversationService.getOrCreateDirectConversation(
        userId,
        contactId
      );

      res.json({
        success: true,
        data: conversation,
      });
    } catch (error) {
      next(error);
    }
  }

  async createGroupConversation(req, res, next) {
    try {
      const userId = req.user.id;
      const { name, participantIds } = req.body;

      const conversation = await conversationService.createGroupConversation(
        userId,
        name,
        participantIds
      );

      logger.info({ userId, conversationId: conversation.id }, 'Group created');

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        data: conversation,
        message: 'Group conversation created',
      });
    } catch (error) {
      next(error);
    }
  }

  async getMessages(req, res, next) {
    try {
      const { conversationId } = req.params;
      const { limit = 50, cursor } = req.query;

      const messages = await messageService.getMessages(
        conversationId,
        parseInt(limit),
        cursor
      );

      res.json({
        success: true,
        data: messages,
      });
    } catch (error) {
      next(error);
    }
  }

  async sendMessage(req, res, next) {
    try {
      const userId = req.user.id;
      const { conversationId } = req.params;
      const messageData = req.body;

      const message = await messageService.sendMessage(
        conversationId,
        userId,
        messageData
      );

      logger.info({ userId, messageId: message.id }, 'Message sent');

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        data: message,
      });
    } catch (error) {
      next(error);
    }
  }

  async addReaction(req, res, next) {
    try {
      const userId = req.user.id;
      const { messageId } = req.params;
      const { emoji } = req.body;

      const reaction = await messageService.addReaction(messageId, userId, emoji);

      res.json({
        success: true,
        data: reaction,
      });
    } catch (error) {
      next(error);
    }
  }

  async removeReaction(req, res, next) {
    try {
      const userId = req.user.id;
      const { messageId } = req.params;
      const { emoji } = req.body;

      await messageService.removeReaction(messageId, userId, emoji);

      res.json({
        success: true,
        message: 'Reaction removed',
      });
    } catch (error) {
      next(error);
    }
  }

  async editMessage(req, res, next) {
    try {
      const userId = req.user.id;
      const { messageId } = req.params;
      const { content } = req.body;

      const message = await messageService.editMessage(messageId, userId, content);

      logger.info({ userId, messageId }, 'Message edited');

      res.json({
        success: true,
        data: message,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteMessage(req, res, next) {
    try {
      const userId = req.user.id;
      const { messageId } = req.params;

      const message = await messageService.deleteMessage(messageId, userId);

      logger.info({ userId, messageId }, 'Message deleted');

      res.json({
        success: true,
        data: message,
        message: 'Message deleted',
      });
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req, res, next) {
    try {
      const userId = req.user.id;
      const { conversationId } = req.params;

      await conversationService.markAsRead(userId, conversationId);

      res.json({
        success: true,
        message: 'Marked as read',
      });
    } catch (error) {
      next(error);
    }
  }

  async searchMessages(req, res, next) {
    try {
      const { conversationId } = req.params;
      const { q: query } = req.query;

      if (!query || query.length < 2) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: {
            code: 'INVALID_QUERY',
            message: 'Search query must be at least 2 characters',
          },
        });
      }

      const messages = await messageService.searchMessages(conversationId, query);

      res.json({
        success: true,
        data: messages,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ChatController();