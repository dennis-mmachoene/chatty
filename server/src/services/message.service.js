// ============================================
// FILE: server/src/services/message.service.js
// ============================================
const { supabase } = require('../config/database');
const logger = require('../utils/logger');
const { NotFoundError, AuthorizationError } = require('../utils/errors');
const { MESSAGE_STATUS, MESSAGE_TYPES, PAGINATION } = require('../config/constants');

class MessageService {
  async sendMessage(conversationId, senderId, messageData) {
    try {
      const { type, content, mediaUrl, thumbnailUrl, fileName, fileSize, mimeType, duration, latitude, longitude, replyTo } = messageData;

      const { data: message, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: senderId,
          type,
          content,
          media_url: mediaUrl,
          thumbnail_url: thumbnailUrl,
          file_name: fileName,
          file_size: fileSize,
          mime_type: mimeType,
          duration,
          latitude,
          longitude,
          reply_to: replyTo,
        })
        .select()
        .single();

      if (error) throw error;

      // Update conversation timestamp
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);

      // Create message status for all participants except sender
      const { data: participants } = await supabase
        .from('conversation_participants')
        .select('user_id')
        .eq('conversation_id', conversationId)
        .neq('user_id', senderId);

      if (participants && participants.length > 0) {
        const statuses = participants.map((p) => ({
          message_id: message.id,
          user_id: p.user_id,
          status: MESSAGE_STATUS.SENT,
        }));

        await supabase.from('message_status').insert(statuses);
      }

      logger.info(`Message sent: ${message.id}`);
      return message;
    } catch (error) {
      logger.error('Send message error:', error);
      throw error;
    }
  }

  async getMessages(conversationId, limit = 50, cursor = null) {
    try {
      let query = supabase
        .from('messages')
        .select(`
          *,
          sender:users!messages_sender_id_fkey(id, display_name, avatar_url),
          reactions:message_reactions(emoji, user_id),
          reply_message:messages!messages_reply_to_fkey(id, content, type, sender_id)
        `)
        .eq('conversation_id', conversationId)
        .eq('deleted', false)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (cursor) {
        query = query.lt('created_at', cursor);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data.reverse(); // Return in chronological order
    } catch (error) {
      logger.error('Get messages error:', error);
      throw error;
    }
  }

  async updateMessageStatus(messageId, userId, status) {
    try {
      const { error } = await supabase
        .from('message_status')
        .upsert({
          message_id: messageId,
          user_id: userId,
          status,
          timestamp: new Date().toISOString(),
        });

      if (error) throw error;
      return true;
    } catch (error) {
      logger.error('Update message status error:', error);
      return false;
    }
  }

  async addReaction(messageId, userId, emoji) {
    try {
      const { data, error } = await supabase
        .from('message_reactions')
        .upsert({
          message_id: messageId,
          user_id: userId,
          emoji,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Add reaction error:', error);
      throw error;
    }
  }

  async removeReaction(messageId, userId, emoji) {
    try {
      const { error } = await supabase
        .from('message_reactions')
        .delete()
        .eq('message_id', messageId)
        .eq('user_id', userId)
        .eq('emoji', emoji);

      if (error) throw error;
      return true;
    } catch (error) {
      logger.error('Remove reaction error:', error);
      return false;
    }
  }

  async editMessage(messageId, senderId, newContent) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .update({
          content: newContent,
          edited: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', messageId)
        .eq('sender_id', senderId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Edit message error:', error);
      throw error;
    }
  }

  async deleteMessage(messageId, senderId) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .update({
          deleted: true,
          content: null,
          media_url: null,
        })
        .eq('id', messageId)
        .eq('sender_id', senderId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Delete message error:', error);
      throw error;
    }
  }

  async searchMessages(conversationId, query, limit = 20) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .eq('deleted', false)
        .ilike('content', `%${query}%`)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Search messages error:', error);
      throw error;
    }
  }
}

module.exports = new MessageService();