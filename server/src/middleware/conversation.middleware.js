// ============================================
// FILE: server/src/middleware/conversation.middleware.js
// ============================================
const conversationService = require('../services/conversation.service');
const { AuthorizationError, NotFoundError } = require('../utils/errors');
const logger = require('../utils/logger');

const checkConversationAccess = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    const hasAccess = await conversationService.isParticipant(userId, conversationId);

    if (!hasAccess) {
      throw new AuthorizationError('You do not have access to this conversation');
    }

    next();
  } catch (error) {
    logger.error('Conversation access check error:', error);
    next(error);
  }
};

const checkMessageOwnership = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    // This would require a message service method to check ownership
    // For now, we'll pass through and let the service handle it
    next();
  } catch (error) {
    logger.error('Message ownership check error:', error);
    next(error);
  }
};

module.exports = {
  checkConversationAccess,
  checkMessageOwnership,
};