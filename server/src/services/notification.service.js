// ============================================
// FILE: server/src/services/notification.service.js
// ============================================
const logger = require('../utils/logger');
const { supabase } = require('../config/database');

class NotificationService {
  async sendPushNotification(userId, notification) {
    try {
      // Get user's push subscriptions from database
      const { data: subscriptions } = await supabase
        .from('push_subscriptions')
        .select('*')
        .eq('user_id', userId);

      if (!subscriptions || subscriptions.length === 0) {
        return false;
      }

      // In production, integrate with web push service
      // For now, just log
      logger.info(`Push notification would be sent to user ${userId}:`, notification);

      return true;
    } catch (error) {
      logger.error('Send push notification error:', error);
      return false;
    }
  }

  async subscribeToPush(userId, subscription) {
    try {
      const { error } = await supabase
        .from('push_subscriptions')
        .insert({
          user_id: userId,
          endpoint: subscription.endpoint,
          keys: subscription.keys,
        });

      if (error) throw error;
      
      logger.info(`User ${userId} subscribed to push notifications`);
      return true;
    } catch (error) {
      logger.error('Subscribe to push error:', error);
      return false;
    }
  }

  async unsubscribeFromPush(userId, endpoint) {
    try {
      const { error } = await supabase
        .from('push_subscriptions')
        .delete()
        .eq('user_id', userId)
        .eq('endpoint', endpoint);

      if (error) throw error;
      
      logger.info(`User ${userId} unsubscribed from push notifications`);
      return true;
    } catch (error) {
      logger.error('Unsubscribe from push error:', error);
      return false;
    }
  }

  createMessageNotification(message, sender) {
    return {
      title: sender.display_name,
      body: this.getNotificationBody(message),
      icon: sender.avatar_url || '/default-avatar.png',
      badge: '/badge-icon.png',
      data: {
        type: 'message',
        conversationId: message.conversation_id,
        messageId: message.id,
      },
    };
  }

  getNotificationBody(message) {
    switch (message.type) {
      case 'text':
        return message.content;
      case 'image':
        return '📷 Photo';
      case 'video':
        return '🎥 Video';
      case 'audio':
      case 'voice_note':
        return '🎵 Audio';
      case 'file':
        return '📎 File';
      case 'location':
        return '📍 Location';
      default:
        return 'New message';
    }
  }
}

module.exports = new NotificationService();