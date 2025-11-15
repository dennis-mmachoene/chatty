// ============================================
// FILE: server/src/services/status.service.js
// ============================================
const { supabase } = require('../config/database');
const logger = require('../utils/logger');
const { NotFoundError } = require('../utils/errors');
const { STATUS_TYPES } = require('../config/constants');

class StatusService {
  async createStatus(userId, statusData) {
    try {
      const { type, content, mediaUrl, backgroundColor } = statusData;
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours from now

      const { data, error } = await supabase
        .from('statuses')
        .insert({
          user_id: userId,
          type,
          content,
          media_url: mediaUrl,
          background_color: backgroundColor,
          expires_at: expiresAt.toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      logger.info(`Status created: ${data.id} by user ${userId}`);
      return data;
    } catch (error) {
      logger.error('Create status error:', error);
      throw error;
    }
  }

  async getUserStatuses(userId) {
    try {
      const { data, error } = await supabase
        .from('statuses')
        .select(`
          *,
          views:status_views(user_id, viewed_at)
        `)
        .eq('user_id', userId)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Get user statuses error:', error);
      throw error;
    }
  }

  async getContactStatuses(userId) {
    try {
      // Get user's contacts
      const { data: contacts } = await supabase
        .from('contacts')
        .select('contact_id')
        .eq('user_id', userId)
        .eq('status', 'accepted');

      if (!contacts || contacts.length === 0) {
        return [];
      }

      const contactIds = contacts.map((c) => c.contact_id);

      // Get statuses from contacts
      const { data, error } = await supabase
        .from('statuses')
        .select(`
          *,
          user:users!statuses_user_id_fkey(id, display_name, avatar_url),
          views:status_views(user_id, viewed_at),
          my_view:status_views!inner(viewed_at)
        `)
        .in('user_id', contactIds)
        .gt('expires_at', new Date().toISOString())
        .eq('my_view.user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group statuses by user
      const grouped = {};
      data.forEach((status) => {
        const userIdKey = status.user_id;
        if (!grouped[userIdKey]) {
          grouped[userIdKey] = {
            user: status.user,
            statuses: [],
            hasUnviewed: false,
          };
        }
        grouped[userIdKey].statuses.push(status);
        
        // Check if user has viewed this status
        const viewed = status.my_view && status.my_view.length > 0;
        if (!viewed) {
          grouped[userIdKey].hasUnviewed = true;
        }
      });

      return Object.values(grouped);
    } catch (error) {
      logger.error('Get contact statuses error:', error);
      throw error;
    }
  }

  async viewStatus(statusId, userId) {
    try {
      // Check if already viewed
      const { data: existing } = await supabase
        .from('status_views')
        .select('id')
        .eq('status_id', statusId)
        .eq('user_id', userId)
        .single();

      if (existing) {
        return true; // Already viewed
      }

      // Record view
      const { error } = await supabase
        .from('status_views')
        .insert({
          status_id: statusId,
          user_id: userId,
        });

      if (error) throw error;

      logger.info(`Status viewed: ${statusId} by ${userId}`);
      return true;
    } catch (error) {
      logger.error('View status error:', error);
      return false;
    }
  }

  async deleteStatus(statusId, userId) {
    try {
      const { error } = await supabase
        .from('statuses')
        .delete()
        .eq('id', statusId)
        .eq('user_id', userId);

      if (error) throw error;

      logger.info(`Status deleted: ${statusId}`);
      return true;
    } catch (error) {
      logger.error('Delete status error:', error);
      throw error;
    }
  }

  async getStatusViewers(statusId, userId) {
    try {
      // Verify status belongs to user
      const { data: status } = await supabase
        .from('statuses')
        .select('user_id')
        .eq('id', statusId)
        .single();

      if (!status || status.user_id !== userId) {
        throw new NotFoundError('Status');
      }

      const { data, error } = await supabase
        .from('status_views')
        .select(`
          viewed_at,
          user:users!status_views_user_id_fkey(
            id,
            display_name,
            avatar_url
          )
        `)
        .eq('status_id', statusId)
        .order('viewed_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Get status viewers error:', error);
      throw error;
    }
  }

  async cleanupExpiredStatuses() {
    try {
      const { error } = await supabase
        .from('statuses')
        .delete()
        .lt('expires_at', new Date().toISOString());

      if (error) throw error;
      logger.info('Expired statuses cleaned up');
    } catch (error) {
      logger.error('Failed to cleanup expired statuses:', error);
    }
  }
}

module.exports = new StatusService();

