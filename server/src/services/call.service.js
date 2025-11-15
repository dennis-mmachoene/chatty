// ============================================
// FILE: server/src/services/call.service.js
// ============================================
const { supabase } = require('../config/database');
const logger = require('../utils/logger');
const { CALL_TYPES, CALL_STATUS } = require('../config/constants');

class CallService {
  async initiateCall(callerId, calleeId, type) {
    try {
      const { data, error } = await supabase
        .from('call_logs')
        .insert({
          caller_id: callerId,
          callee_id: calleeId,
          type,
          status: CALL_STATUS.MISSED, // Default to missed, update when answered
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      logger.info(`Call initiated: ${data.id} from ${callerId} to ${calleeId}`);
      return data;
    } catch (error) {
      logger.error('Initiate call error:', error);
      throw error;
    }
  }

  async updateCallStatus(callId, status, duration = null) {
    try {
      const updates = { status };
      
      if (status === CALL_STATUS.COMPLETED && duration) {
        updates.duration = duration;
        updates.ended_at = new Date().toISOString();
      } else if (status === CALL_STATUS.DECLINED || status === CALL_STATUS.FAILED) {
        updates.ended_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('call_logs')
        .update(updates)
        .eq('id', callId)
        .select()
        .single();

      if (error) throw error;

      logger.info(`Call status updated: ${callId} -> ${status}`);
      return data;
    } catch (error) {
      logger.error('Update call status error:', error);
      throw error;
    }
  }

  async getCallHistory(userId, limit = 50, cursor = null) {
    try {
      let query = supabase
        .from('call_logs')
        .select(`
          *,
          caller:users!call_logs_caller_id_fkey(id, display_name, avatar_url),
          callee:users!call_logs_callee_id_fkey(id, display_name, avatar_url)
        `)
        .or(`caller_id.eq.${userId},callee_id.eq.${userId}`)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (cursor) {
        query = query.lt('created_at', cursor);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Enrich with caller/callee info based on perspective
      const enriched = data.map((call) => {
        const isOutgoing = call.caller_id === userId;
        return {
          ...call,
          direction: isOutgoing ? 'outgoing' : 'incoming',
          otherUser: isOutgoing ? call.callee : call.caller,
        };
      });

      return enriched;
    } catch (error) {
      logger.error('Get call history error:', error);
      throw error;
    }
  }

  async deleteCallHistory(userId, callId) {
    try {
      const { error } = await supabase
        .from('call_logs')
        .delete()
        .eq('id', callId)
        .or(`caller_id.eq.${userId},callee_id.eq.${userId}`);

      if (error) throw error;

      logger.info(`Call history deleted: ${callId}`);
      return true;
    } catch (error) {
      logger.error('Delete call history error:', error);
      return false;
    }
  }

  async getCallStatistics(userId) {
    try {
      const { data, error } = await supabase
        .from('call_logs')
        .select('type, status, duration')
        .or(`caller_id.eq.${userId},callee_id.eq.${userId}`);

      if (error) throw error;

      const stats = {
        total: data.length,
        audio: data.filter((c) => c.type === CALL_TYPES.AUDIO).length,
        video: data.filter((c) => c.type === CALL_TYPES.VIDEO).length,
        completed: data.filter((c) => c.status === CALL_STATUS.COMPLETED).length,
        missed: data.filter((c) => c.status === CALL_STATUS.MISSED).length,
        totalDuration: data
          .filter((c) => c.duration)
          .reduce((sum, c) => sum + c.duration, 0),
      };

      return stats;
    } catch (error) {
      logger.error('Get call statistics error:', error);
      throw error;
    }
  }
}

module.exports = new CallService();