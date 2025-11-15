// ============================================
// FILE: server/src/services/presence.service.js
// ============================================
const { cache } = require('../config/redis');
const { supabase } = require('../config/database');
const logger = require('../utils/logger');
const Helpers = require('../utils/helpers');

class PresenceService {
  async setUserOnline(userId, socketId) {
    try {
      const key = Helpers.buildCacheKey('presence', userId);
      const socketKey = Helpers.buildCacheKey('socket', userId);
      
      await cache.set(key, { 
        isOnline: true, 
        lastSeen: new Date().toISOString() 
      }, 300);

      // Store socket mapping
      await cache.set(socketKey, socketId, 3600);

      // Update database
      await supabase
        .from('users')
        .update({ 
          is_online: true,
          last_seen: new Date().toISOString(),
        })
        .eq('id', userId);

      logger.debug(`User ${userId} is online`);
      return true;
    } catch (error) {
      logger.error('Set user online error:', error);
      return false;
    }
  }

  async setUserOffline(userId) {
    try {
      const key = Helpers.buildCacheKey('presence', userId);
      const socketKey = Helpers.buildCacheKey('socket', userId);
      const lastSeen = new Date().toISOString();

      await cache.set(key, { 
        isOnline: false, 
        lastSeen 
      }, 300);

      await cache.del(socketKey);

      // Update database
      await supabase
        .from('users')
        .update({ 
          is_online: false,
          last_seen: lastSeen,
        })
        .eq('id', userId);

      logger.debug(`User ${userId} is offline`);
      return true;
    } catch (error) {
      logger.error('Set user offline error:', error);
      return false;
    }
  }

  async getUserPresence(userId) {
    try {
      const key = Helpers.buildCacheKey('presence', userId);
      let presence = await cache.get(key);

      if (!presence) {
        // Fetch from database
        const { data } = await supabase
          .from('users')
          .select('is_online, last_seen')
          .eq('id', userId)
          .single();

        if (data) {
          presence = {
            isOnline: data.is_online,
            lastSeen: data.last_seen,
          };
          await cache.set(key, presence, 60);
        }
      }

      return presence;
    } catch (error) {
      logger.error('Get user presence error:', error);
      return null;
    }
  }

  async getSocketId(userId) {
    try {
      const key = Helpers.buildCacheKey('socket', userId);
      return await cache.get(key);
    } catch (error) {
      logger.error('Get socket ID error:', error);
      return null;
    }
  }

  async setTypingStatus(userId, conversationId, isTyping) {
    try {
      const key = Helpers.buildCacheKey('typing', conversationId, userId);
      
      if (isTyping) {
        await cache.set(key, true, 5); // 5 second TTL
      } else {
        await cache.del(key);
      }

      return true;
    } catch (error) {
      logger.error('Set typing status error:', error);
      return false;
    }
  }

  async getTypingUsers(conversationId) {
    try {
      const pattern = Helpers.buildCacheKey('typing', conversationId, '*');
      const keys = await cache.keys(pattern);
      
      const userIds = keys.map((key) => {
        const parts = key.split(':');
        return parts[parts.length - 1];
      });

      return userIds;
    } catch (error) {
      logger.error('Get typing users error:', error);
      return [];
    }
  }
}

module.exports = new PresenceService();