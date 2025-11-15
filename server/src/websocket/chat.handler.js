// ============================================
// FILE: server/src/websocket/chat.handler.js
// ============================================
const messageService = require('../services/message.service');
const conversationService = require('../services/conversation.service');
const notificationService = require('../services/notification.service');
const logger = require('../utils/logger');
const { WS_EVENTS } = require('../config/constants');

const chatHandler = (io, socket) => {
  const userId = socket.userId;

  // Send message
  socket.on(WS_EVENTS.MESSAGE, async (data) => {
    try {
      const { conversationId, type, content, ...messageData } = data;

      // Verify user is participant
      const isParticipant = await conversationService.isParticipant(
        userId,
        conversationId
      );

      if (!isParticipant) {
        return socket.emit('error', {
          code: 'UNAUTHORIZED',
          message: 'Not a participant of this conversation',
        });
      }

      // Save message
      const message = await messageService.sendMessage(conversationId, userId, {
        type,
        content,
        ...messageData,
      });

      // Emit to conversation participants
      io.to(`conversation:${conversationId}`).emit(WS_EVENTS.MESSAGE_SENT, {
        conversationId,
        message,
      });

      // Get conversation participants for notifications
      const { data: participants } = await conversationService.getParticipants(
        conversationId
      );

      // Send push notifications to offline users
      if (participants) {
        for (const participant of participants) {
          if (participant.user_id !== userId) {
            const isOnline = await presenceService.getUserPresence(
              participant.user_id
            );
            
            if (!isOnline?.isOnline) {
              const sender = { display_name: socket.userEmail };
              const notification = notificationService.createMessageNotification(
                message,
                sender
              );
              await notificationService.sendPushNotification(
                participant.user_id,
                notification
              );
            }
          }
        }
      }

      logger.info(`Message sent in conversation ${conversationId} by ${userId}`);
    } catch (error) {
      logger.error('Send message error:', error);
      socket.emit('error', {
        code: 'MESSAGE_SEND_FAILED',
        message: error.message,
      });
    }
  });

  // Message delivered
  socket.on(WS_EVENTS.MESSAGE_DELIVERED, async (data) => {
    try {
      const { messageId, conversationId } = data;

      await messageService.updateMessageStatus(messageId, userId, 'delivered');

      // Notify sender
      io.to(`conversation:${conversationId}`).emit(WS_EVENTS.MESSAGE_DELIVERED, {
        messageId,
        userId,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Message delivered error:', error);
    }
  });

  // Message read
  socket.on(WS_EVENTS.MESSAGE_READ, async (data) => {
    try {
      const { messageId, conversationId } = data;

      await messageService.updateMessageStatus(messageId, userId, 'read');

      // Notify sender
      io.to(`conversation:${conversationId}`).emit(WS_EVENTS.MESSAGE_READ, {
        messageId,
        userId,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Message read error:', error);
    }
  });

  // Message edited
  socket.on(WS_EVENTS.MESSAGE_EDITED, async (data) => {
    try {
      const { messageId, conversationId, content } = data;

      const message = await messageService.editMessage(messageId, userId, content);

      io.to(`conversation:${conversationId}`).emit(WS_EVENTS.MESSAGE_EDITED, {
        messageId,
        content,
        editedAt: message.updated_at,
      });
    } catch (error) {
      logger.error('Message edit error:', error);
      socket.emit('error', {
        code: 'MESSAGE_EDIT_FAILED',
        message: error.message,
      });
    }
  });

  // Message deleted
  socket.on(WS_EVENTS.MESSAGE_DELETED, async (data) => {
    try {
      const { messageId, conversationId } = data;

      await messageService.deleteMessage(messageId, userId);

      io.to(`conversation:${conversationId}`).emit(WS_EVENTS.MESSAGE_DELETED, {
        messageId,
        deletedAt: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Message delete error:', error);
      socket.emit('error', {
        code: 'MESSAGE_DELETE_FAILED',
        message: error.message,
      });
    }
  });

  // Message reaction
  socket.on(WS_EVENTS.MESSAGE_REACTION, async (data) => {
    try {
      const { messageId, conversationId, emoji } = data;

      const reaction = await messageService.addReaction(messageId, userId, emoji);

      io.to(`conversation:${conversationId}`).emit(WS_EVENTS.MESSAGE_REACTION, {
        messageId,
        userId,
        emoji,
        timestamp: reaction.created_at,
      });
    } catch (error) {
      logger.error('Message reaction error:', error);
    }
  });
};

module.exports = chatHandler;