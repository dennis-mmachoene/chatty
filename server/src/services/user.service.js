// ============================================
// FILE: server/src/services/user.service.js
// ============================================
const { supabase } = require('../config/database');
const { cache } = require('../config/redis');
const { NotFoundError, ConflictError } = require('../utils/errors');
const logger = require('../utils/logger');
const Helpers = require('../utils/helpers');
const { CACHE_TTL } = require('../config/constants');

class UserService {
  async getUserById(userId, useCache = true) {
    try {
      const cacheKey = Helpers.buildCacheKey('user', userId);

      if (useCache) {
        const cached = await cache.get(cacheKey);
        if (cached) return cached;
      }

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .is('deleted_at', null)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new NotFoundError('User');
        }
        throw error;
      }

      await cache.set(cacheKey, data, CACHE_TTL.USER_PROFILE);
      return data;
    } catch (error) {
      logger.error('Get user error:', error);
      throw error;
    }
  }

  async updateUserProfile(userId, updates) {
    try {
      const allowedFields = ['display_name', 'status_message', 'avatar_url', 'phone'];
      const sanitizedUpdates = Helpers.pick(updates, allowedFields);
      sanitizedUpdates.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('users')
        .update(sanitizedUpdates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      // Invalidate cache
      await cache.del(Helpers.buildCacheKey('user', userId));

      logger.info(`User profile updated: ${userId}`);
      return data;
    } catch (error) {
      logger.error('Update user profile error:', error);
      throw error;
    }
  }

  async searchUsers(query, currentUserId, limit = 20) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, display_name, avatar_url, status_message')
        .or(`email.ilike.%${query}%,display_name.ilike.%${query}%`)
        .neq('id', currentUserId)
        .is('deleted_at', null)
        .limit(limit);

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Search users error:', error);
      throw error;
    }
  }

  async updateUserPresence(userId, isOnline) {
    try {
      const updates = {
        is_online: isOnline,
        last_seen: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId);

      if (error) throw error;

      // Update cache
      await cache.set(
        Helpers.buildCacheKey('presence', userId),
        { isOnline, lastSeen: updates.last_seen },
        CACHE_TTL.PRESENCE
      );

      return true;
    } catch (error) {
      logger.error('Update presence error:', error);
      return false;
    }
  }

  async deleteAccount(userId) {
    try {
      // Soft delete
      const { error } = await supabase
        .from('users')
        .update({
          deleted_at: new Date().toISOString(),
          email: `deleted_${userId}@deleted.com`,
        })
        .eq('id', userId);

      if (error) throw error;

      // Clear cache
      await cache.del(Helpers.buildCacheKey('user', userId));

      logger.info(`User account deleted: ${userId}`);
      return true;
    } catch (error) {
      logger.error('Delete account error:', error);
      throw error;
    }
  }

  async getUserSettings(userId) {
    try {
      let { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      // Create default settings if not exist
      if (error && error.code === 'PGRST116') {
        const { data: newSettings, error: createError } = await supabase
          .from('user_settings')
          .insert({ user_id: userId })
          .select()
          .single();

        if (createError) throw createError;
        data = newSettings;
      } else if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      logger.error('Get user settings error:', error);
      throw error;
    }
  }

  async updateUserSettings(userId, settings) {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: userId,
          ...settings,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Update user settings error:', error);
      throw error;
    }
  }
}

module.exports = new UserService();
