// ============================================
// FILE: server/src/services/conversation.service.js
// ============================================
const { supabase } = require('../config/database');
const { cache } = require('../config/redis');
const logger = require('../utils/logger');
const Helpers = require('../utils/helpers');
const { NotFoundError, AuthorizationError } = require('../utils/errors');
const { CONVERSATION_TYPES } = require('../config/constants');

class ConversationService {
  async getOrCreateDirectConversation(userId, contactId) {
    try {
      // Check if conversation already exists
      const { data: existing } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .in('user_id', [userId, contactId])
        .limit(2);

      if (existing && existing.length === 2) {
        const conversationIds = existing.map((p) => p.conversation_id);
        const duplicates = conversationIds.filter((id, index) => 
          conversationIds.indexOf(id) !== index
        );

        if (duplicates.length > 0) {
          const { data: conversation } = await supabase
            .from('conversations')
            .select('*')
            .eq('id', duplicates[0])
            .eq('type', CONVERSATION_TYPES.DIRECT)
            .single();

          if (conversation) return conversation;
        }
      }

      // Create new conversation
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .insert({
          type: CONVERSATION_TYPES.DIRECT,
          created_by: userId,
        })
        .select()
        .single();

      if (convError) throw convError;

      // Add participants
      const { error: partError } = await supabase
        .from('conversation_participants')
        .insert([
          { conversation_id: conversation.id, user_id: userId },
          { conversation_id: conversation.id, user_id: contactId },
        ]);

      if (partError) throw partError;

      logger.info(`Direct conversation created: ${conversation.id}`);
      return conversation;
    } catch (error) {
      logger.error('Get or create conversation error:', error);
      throw error;
    }
  }

  async createGroupConversation(userId, name, participantIds) {
    try {
      // Create conversation
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .insert({
          type: CONVERSATION_TYPES.GROUP,
          name,
          created_by: userId,
        })
        .select()
        .single();

      if (convError) throw convError;

      // Add creator as admin
      const participants = [
        { conversation_id: conversation.id, user_id: userId, role: 'admin' },
      ];

      // Add other participants
      participantIds.forEach((id) => {
        if (id !== userId) {
          participants.push({
            conversation_id: conversation.id,
            user_id: id,
            role: 'member',
          });
        }
      });

      const { error: partError } = await supabase
        .from('conversation_participants')
        .insert(participants);

      if (partError) throw partError;

      logger.info(`Group conversation created: ${conversation.id}`);
      return conversation;
    } catch (error) {
      logger.error('Create group conversation error:', error);
      throw error;
    }
  }

  async getUserConversations(userId, limit = 50, cursor = null) {
    try {
      let query = supabase
        .from('conversation_participants')
        .select(`
          conversation_id,
          last_read_at,
          muted,
          conversations!inner(
            id,
            type,
            name,
            avatar_url,
            updated_at,
            created_at
          )
        `)
        .eq('user_id', userId)
        .order('conversations(updated_at)', { ascending: false })
        .limit(limit);

      if (cursor) {
        query = query.lt('conversations.updated_at', cursor);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Get last message for each conversation
      const conversationIds = data.map((c) => c.conversation_id);
      const { data: messages } = await supabase
        .from('messages')
        .select('conversation_id, content, type, created_at, sender_id')
        .in('conversation_id', conversationIds)
        .order('created_at', { ascending: false });

      // Get unread counts
      const unreadCounts = await this.getUnreadCounts(userId, conversationIds);

      // Enrich conversations with last message and unread count
      const enriched = data.map((item) => {
        const lastMsg = messages.find((m) => m.conversation_id === item.conversation_id);
        const unread = unreadCounts[item.conversation_id] || 0;

        return {
          ...item.conversations,
          lastMessage: lastMsg || null,
          unreadCount: unread,
          muted: item.muted,
        };
      });

      return enriched;
    } catch (error) {
      logger.error('Get user conversations error:', error);
      throw error;
    }
  }

  async getUnreadCounts(userId, conversationIds) {
    try {
      const { data } = await supabase
        .from('conversation_participants')
        .select('conversation_id, last_read_at')
        .eq('user_id', userId)
        .in('conversation_id', conversationIds);

      const counts = {};

      for (const participant of data) {
        const { count } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('conversation_id', participant.conversation_id)
          .neq('sender_id', userId)
          .gt('created_at', participant.last_read_at || '1970-01-01');

        counts[participant.conversation_id] = count || 0;
      }

      return counts;
    } catch (error) {
      logger.error('Get unread counts error:', error);
      return {};
    }
  }

  async markAsRead(userId, conversationId) {
    try {
      const { error } = await supabase
        .from('conversation_participants')
        .update({ last_read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      logger.error('Mark as read error:', error);
      return false;
    }
  }

  async isParticipant(userId, conversationId) {
    try {
      const { data, error } = await supabase
        .from('conversation_participants')
        .select('user_id')
        .eq('conversation_id', conversationId)
        .eq('user_id', userId)
        .single();

      return !!data;
    } catch (error) {
      return false;
    }
  }
}

module.exports = new ConversationService();