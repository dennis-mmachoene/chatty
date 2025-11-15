// ============================================
// FILE: server/src/services/webrtc.service.js
// ============================================
const logger = require('../utils/logger');

class WebRTCService {
  constructor() {
    this.activeCalls = new Map();
    this.turnConfig = {
      urls: process.env.TURN_SERVER_URL || 'turn:your-turn-server.com:3478',
      username: process.env.TURN_USERNAME,
      credential: process.env.TURN_CREDENTIAL,
    };
    this.stunConfig = {
      urls: process.env.STUN_SERVER_URL || 'stun:stun.l.google.com:19302',
    };
  }

  getIceServers() {
    return [this.stunConfig, this.turnConfig];
  }

  registerCall(callId, callerId, calleeId) {
    this.activeCalls.set(callId, {
      callId,
      callerId,
      calleeId,
      status: 'ringing',
      startTime: Date.now(),
    });
    logger.info(`Call registered: ${callId}`);
  }

  updateCallStatus(callId, status) {
    const call = this.activeCalls.get(callId);
    if (call) {
      call.status = status;
      if (status === 'ended') {
        call.endTime = Date.now();
        call.duration = Math.floor((call.endTime - call.startTime) / 1000);
      }
      this.activeCalls.set(callId, call);
    }
  }

  getCall(callId) {
    return this.activeCalls.get(callId);
  }

  endCall(callId) {
    const call = this.activeCalls.get(callId);
    if (call) {
      this.updateCallStatus(callId, 'ended');
      const callData = this.activeCalls.get(callId);
      this.activeCalls.delete(callId);
      logger.info(`Call ended: ${callId}, duration: ${callData.duration}s`);
      return callData;
    }
    return null;
  }

  isUserInCall(userId) {
    for (const [, call] of this.activeCalls) {
      if ((call.callerId === userId || call.calleeId === userId) && 
          call.status === 'active') {
        return true;
      }
    }
    return false;
  }

  getUserActiveCall(userId) {
    for (const [callId, call] of this.activeCalls) {
      if ((call.callerId === userId || call.calleeId === userId) && 
          call.status === 'active') {
        return { callId, ...call };
      }
    }
    return null;
  }

  getActiveCallsCount() {
    return this.activeCalls.size;
  }

  cleanupStaleCalls(maxAgeMs = 5 * 60 * 1000) {
    const now = Date.now();
    let cleaned = 0;

    for (const [callId, call] of this.activeCalls) {
      const age = now - call.startTime;
      if (age > maxAgeMs && call.status !== 'active') {
        this.activeCalls.delete(callId);
        cleaned++;
        logger.info(`Stale call cleaned up: ${callId}`);
      }
    }

    if (cleaned > 0) {
      logger.info(`Cleaned up ${cleaned} stale calls`);
    }
  }
}

module.exports = new WebRTCService();