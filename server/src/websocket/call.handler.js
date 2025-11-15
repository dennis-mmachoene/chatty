// ============================================
// FILE: server/src/websocket/call.handler.js
// ============================================
const callService = require('../services/call.service');
const webrtcService = require('../services/webrtc.service');
const presenceService = require('../services/presence.service');
const logger = require('../utils/logger');
const { WS_EVENTS } = require('../config/constants');

const callHandler = (io, socket) => {
  const userId = socket.userId;

  // Initiate call
  socket.on(WS_EVENTS.CALL_OFFER, async (data) => {
    try {
      const { calleeId, type, offer } = data;

      // Check if callee is online
      const calleeSocketId = await presenceService.getSocketId(calleeId);
      if (!calleeSocketId) {
        return socket.emit('error', {
          code: 'USER_OFFLINE',
          message: 'User is not available',
        });
      }

      // Check if user is already in a call
      if (webrtcService.isUserInCall(userId) || webrtcService.isUserInCall(calleeId)) {
        return socket.emit('error', {
          code: 'USER_BUSY',
          message: 'User is currently in another call',
        });
      }

      // Create call log
      const call = await callService.initiateCall(userId, calleeId, type);

      // Register call in WebRTC service
      webrtcService.registerCall(call.id, userId, calleeId);

      // Send offer to callee
      io.to(`user:${calleeId}`).emit(WS_EVENTS.CALL_OFFER, {
        callId: call.id,
        callerId: userId,
        type,
        offer,
      });

      logger.info(`Call initiated: ${call.id} from ${userId} to ${calleeId}`);
    } catch (error) {
      logger.error('Call offer error:', error);
      socket.emit('error', {
        code: 'CALL_OFFER_FAILED',
        message: error.message,
      });
    }
  });

  // Answer call
  socket.on(WS_EVENTS.CALL_ANSWER, async (data) => {
    try {
      const { callId, callerId, answer } = data;

      // Update call status
      webrtcService.updateCallStatus(callId, 'active');

      // Send answer to caller
      io.to(`user:${callerId}`).emit(WS_EVENTS.CALL_ANSWER, {
        callId,
        calleeId: userId,
        answer,
      });

      logger.info(`Call answered: ${callId}`);
    } catch (error) {
      logger.error('Call answer error:', error);
    }
  });

  // ICE candidate
  socket.on(WS_EVENTS.CALL_CANDIDATE, async (data) => {
    try {
      const { callId, targetUserId, candidate } = data;

      // Forward candidate to target user
      io.to(`user:${targetUserId}`).emit(WS_EVENTS.CALL_CANDIDATE, {
        callId,
        userId,
        candidate,
      });
    } catch (error) {
      logger.error('ICE candidate error:', error);
    }
  });

  // End call
  socket.on(WS_EVENTS.CALL_END, async (data) => {
    try {
      const { callId, targetUserId } = data;

      const callData = webrtcService.endCall(callId);

      if (callData) {
        // Update call log with duration
        await callService.updateCallStatus(
          callId,
          'completed',
          callData.duration
        );

        // Notify other participant
        if (targetUserId) {
          io.to(`user:${targetUserId}`).emit(WS_EVENTS.CALL_END, {
            callId,
            duration: callData.duration,
          });
        }
      }

      logger.info(`Call ended: ${callId}`);
    } catch (error) {
      logger.error('Call end error:', error);
    }
  });

  // Call declined
  socket.on('call:decline', async (data) => {
    try {
      const { callId, callerId } = data;

      await callService.updateCallStatus(callId, 'declined');
      webrtcService.endCall(callId);

      io.to(`user:${callerId}`).emit('call:declined', {
        callId,
        calleeId: userId,
      });

      logger.info(`Call declined: ${callId}`);
    } catch (error) {
      logger.error('Call decline error:', error);
    }
  });
};

module.exports = callHandler;