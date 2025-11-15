// ============================================
// FILE: server/src/services/contact.service.js
// ============================================
const { supabase } = require('../config/database');
const { cache } = require('../config/redis');
const logger = require('../utils/logger');
const Helpers = require('../utils/helpers');
const { NotFoundError, ConflictError } = require('../utils/errors');
const { CONTACT_STATUS } = require('../config/constants');

class ContactService {
  async sendContactRequest(userId, contactEmail) {
    try {
      // Find contact by email
      const { data: contact, error: findError } = await supabase
        .from('users')
        .select('id, email, display_name')
        .eq('email', contactEmail.toLowerCase())
        .is('deleted_at', null)
        .single();

      if (findError || !contact) {
        throw new NotFoundError('User with this email');
      }

      if (contact.id === userId) {
        throw new ConflictError('Cannot add yourself as contact');
      }

      // Check if contact already exists
      const { data: existing } = await supabase
        .from('contacts')
        .select('*')
        .or(`and(user_id.eq.${userId},contact_id.eq.${contact.id}),and(user_id.eq.${contact.id},contact_id.eq.${userId})`)
        .single();

      if (existing) {
        if (existing.status === CONTACT_STATUS.BLOCKED) {
          throw new ConflictError('Cannot add blocked contact');
        }
        if (existing.status === CONTACT_STATUS.ACCEPTED) {
          throw new ConflictError('Contact already added');
        }
        if (existing.status === CONTACT_STATUS.PENDING) {
          throw new ConflictError('Contact request already sent');
        }
      }

      // Create contact request
      const { data, error } = await supabase
        .from('contacts')
        .insert({
          user_id: userId,
          contact_id: contact.id,
          status: CONTACT_STATUS.PENDING,
        })
        .select('*, users!contacts_contact_id_fkey(*)')
        .single();

      if (error) throw error;

      logger.info(`Contact request sent from ${userId} to ${contact.id}`);
      return data;
    } catch (error) {
      logger.error('Send contact request error:', error);
      throw error;
    }
  }

  async acceptContactRequest(userId, contactId) {
    try {
      // Update the request
      const { data, error } = await supabase
        .from('contacts')
        .update({ status: CONTACT_STATUS.ACCEPTED })
        .eq('user_id', contactId)
        .eq('contact_id', userId)
        .eq('status', CONTACT_STATUS.PENDING)
        .select()
        .single();

      if (error || !data) {
        throw new NotFoundError('Contact request');
      }

      // Create reciprocal contact
      await supabase.from('contacts').insert({
        user_id: userId,
        contact_id: contactId,
        status: CONTACT_STATUS.ACCEPTED,
      });

      // Clear cache
      await cache.del(Helpers.buildCacheKey('contacts', userId));
      await cache.del(Helpers.buildCacheKey('contacts', contactId));

      logger.info(`Contact request accepted: ${userId} <-> ${contactId}`);
      return data;
    } catch (error) {
      logger.error('Accept contact request error:', error);
      throw error;
    }
  }

  async getContacts(userId) {
    try {
      const cacheKey = Helpers.buildCacheKey('contacts', userId);
      const cached = await cache.get(cacheKey);
      if (cached) return cached;

      const { data, error } = await supabase
        .from('contacts')
        .select(`
          *,
          contact:users!contacts_contact_id_fkey(
            id,
            email,
            display_name,
            avatar_url,
            status_message,
            is_online,
            last_seen
          )
        `)
        .eq('user_id', userId)
        .eq('status', CONTACT_STATUS.ACCEPTED)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const contacts = data.map((c) => c.contact);
      await cache.set(cacheKey, contacts, 300);

      return contacts;
    } catch (error) {
      logger.error('Get contacts error:', error);
      throw error;
    }
  }

  async getPendingRequests(userId) {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select(`
          *,
          requester:users!contacts_user_id_fkey(
            id,
            email,
            display_name,
            avatar_url
          )
        `)
        .eq('contact_id', userId)
        .eq('status', CONTACT_STATUS.PENDING)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data.map((c) => c.requester);
    } catch (error) {
      logger.error('Get pending requests error:', error);
      throw error;
    }
  }

  async blockContact(userId, contactId) {
    try {
      const { error } = await supabase
        .from('contacts')
        .update({ status: CONTACT_STATUS.BLOCKED })
        .eq('user_id', userId)
        .eq('contact_id', contactId);

      if (error) throw error;

      await cache.del(Helpers.buildCacheKey('contacts', userId));
      logger.info(`Contact blocked: ${userId} blocked ${contactId}`);
      return true;
    } catch (error) {
      logger.error('Block contact error:', error);
      throw error;
    }
  }

  async deleteContact(userId, contactId) {
    try {
      // Delete both sides of the contact relationship
      await supabase
        .from('contacts')
        .delete()
        .or(`and(user_id.eq.${userId},contact_id.eq.${contactId}),and(user_id.eq.${contactId},contact_id.eq.${userId})`);

      await cache.del(Helpers.buildCacheKey('contacts', userId));
      await cache.del(Helpers.buildCacheKey('contacts', contactId));

      logger.info(`Contact deleted: ${userId} <-> ${contactId}`);
      return true;
    } catch (error) {
      logger.error('Delete contact error:', error);
      throw error;
    }
  }
}

module.exports = new ContactService();

