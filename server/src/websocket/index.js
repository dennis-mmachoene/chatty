// ============================================
// FILE: server/src/websocket/index.js
// ============================================
const { Server } = require('socket.io');
const tokenService = require('../services/token.service');
const presenceService = require('../services/presence.service');
const logger = require('../utils/logger');
const chatHandler = require('./chat.handler');
const callHandler = require('./call.handler');
const { WS_EVENTS } = require('../config/constants');

const setupWebSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL,
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const decoded = tokenService.verifyAccessToken(token);
      socket.userId = decoded.userId;
      socket.userEmail = decoded.email;

      logger.info(`User ${socket.userId} authenticating WebSocket`);
      next();
    } catch (error) {
      logger.error('WebSocket authentication error:', error);
      next(new Error('Invalid authentication token'));
    }
  });

  // Connection handling
  io.on(WS_EVENTS.CONNECTION, async (socket) => {
    const userId = socket.userId;

    logger.info(`User ${userId} connected via WebSocket: ${socket.id}`);

    // Set user online
    await presenceService.setUserOnline(userId, socket.id);

    // Join user's personal room
    socket.join(`user:${userId}`);

    // Emit connection success
    socket.emit('connected', {
      socketId: socket.id,
      userId,
    });

    // Chat handlers
    chatHandler(io, socket);

    // Call handlers
    callHandler(io, socket);

    // Typing indicators
    socket.on(WS_EVENTS.TYPING_START, async (data) => {
      try {
        const { conversationId } = data;
        await presenceService.setTypingStatus(userId, conversationId, true);
        
        // Broadcast to conversation
        socket.to(`conversation:${conversationId}`).emit(WS_EVENTS.TYPING_START, {
          conversationId,
          userId,
        });
      } catch (error) {
        logger.error('Typing start error:', error);
      }
    });

    socket.on(WS_EVENTS.TYPING_STOP, async (data) => {
      try {
        const { conversationId } = data;
        await presenceService.setTypingStatus(userId, conversationId, false);
        
        socket.to(`conversation:${conversationId}`).emit(WS_EVENTS.TYPING_STOP, {
          conversationId,
          userId,
        });
      } catch (error) {
        logger.error('Typing stop error:', error);
      }
    });

    // Join conversation rooms
    socket.on('join-conversation', (conversationId) => {
      socket.join(`conversation:${conversationId}`);
      logger.debug(`User ${userId} joined conversation ${conversationId}`);
    });

    socket.on('leave-conversation', (conversationId) => {
      socket.leave(`conversation:${conversationId}`);
      logger.debug(`User ${userId} left conversation ${conversationId}`);
    });

    // Presence updates
    socket.on('presence-update', async (data) => {
      try {
        const { isOnline } = data;
        await presenceService.setUserOnline(userId, socket.id);
        
        // Broadcast to contacts
        socket.broadcast.emit(WS_EVENTS.PRESENCE_UPDATE, {
          userId,
          isOnline,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        logger.error('Presence update error:', error);
      }
    });

    // Disconnect handling
    socket.on(WS_EVENTS.DISCONNECT, async () => {
      logger.info(`User ${userId} disconnected: ${socket.id}`);
      
      await presenceService.setUserOffline(userId);
      
      // Broadcast offline status
      socket.broadcast.emit(WS_EVENTS.PRESENCE_UPDATE, {
        userId,
        isOnline: false,
        timestamp: new Date().toISOString(),
      });
    });

    // Error handling
    socket.on('error', (error) => {
      logger.error('WebSocket error:', error);
    });
  });

  // Global error handling
  io.engine.on('connection_error', (error) => {
    logger.error('Socket.IO connection error:', error);
  });

  logger.info('WebSocket server initialized');

  return io;
};

module.exports = setupWebSocket;