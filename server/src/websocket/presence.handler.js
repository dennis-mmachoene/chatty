// ============================================
// FILE: server/src/websocket/presence.handler.js
// ============================================
const presenceService = require('../services/presence.service');
const logger = require('../utils/logger');

const presenceHandler = (io, socket) => {
  const userId = socket.userId;

  // Update presence
  socket.on('presence:update', async (data) => {
    try {
      const { status } = data;

      if (status === 'online') {
        await presenceService.setUserOnline(userId, socket.id);
      } else {
        await presenceService.setUserOffline(userId);
      }

      // Broadcast to contacts
      socket.broadcast.emit('presence:update', {
        userId,
        status,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Presence update error:', error);
    }
  });

  // Request presence
  socket.on('presence:request', async (data) => {
    try {
      const { userIds } = data;

      const presenceData = await Promise.all(
        userIds.map(async (id) => {
          const presence = await presenceService.getUserPresence(id);
          return {
            userId: id,
            ...presence,
          };
        })
      );

      socket.emit('presence:response', presenceData);
    } catch (error) {
      logger.error('Presence request error:', error);
    }
  });
};

module.exports = presenceHandler;