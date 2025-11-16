// ============================================
// FILE: src/services/chat.service.ts
// Chat and messaging service
// ============================================

import { apiClient } from './api';
import type { ApiResponse, PaginatedResponse } from '@/types/api.types';
import type { Conversation, Message } from '@/types/chat.types';

export interface CreateDirectConversationPayload {
  contactId: string;
}

export interface CreateGroupPayload {
  name: string;
  participantIds: string[];
}

export interface SendMessagePayload {
  type: Message['type'];
  content?: string;
  mediaUrl?: string;
  thumbnailUrl?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  duration?: number;
  latitude?: number;
  longitude?: number;
  replyTo?: string;
}

export interface AddReactionPayload {
  emoji: string;
}

export interface EditMessagePayload {
  content: string;
}

class ChatService {
  async getConversations(
    limit = 50,
    cursor?: string
  ): Promise<ApiResponse<Conversation[]>> {
    const response = await apiClient.get<ApiResponse<Conversation[]>>('/chats/conversations', {
      params: { limit, cursor },
    });
    return response.data;
  }

  async getOrCreateDirectConversation(
    payload: CreateDirectConversationPayload
  ): Promise<ApiResponse<Conversation>> {
    const response = await apiClient.post<ApiResponse<Conversation>>(
      '/chats/conversations/direct',
      payload
    );
    return response.data;
  }

  async createGroup(payload: CreateGroupPayload): Promise<ApiResponse<Conversation>> {
    const response = await apiClient.post<ApiResponse<Conversation>>(
      '/chats/conversations/group',
      payload
    );
    return response.data;
  }

  async getMessages(
    conversationId: string,
    limit = 50,
    cursor?: string
  ): Promise<ApiResponse<Message[]>> {
    const response = await apiClient.get<ApiResponse<Message[]>>(
      `/chats/conversations/${conversationId}/messages`,
      {
        params: { limit, cursor },
      }
    );
    return response.data;
  }

  async sendMessage(
    conversationId: string,
    payload: SendMessagePayload
  ): Promise<ApiResponse<Message>> {
    const response = await apiClient.post<ApiResponse<Message>>(
      `/chats/conversations/${conversationId}/messages`,
      payload
    );
    return response.data;
  }

  async addReaction(
    messageId: string,
    payload: AddReactionPayload
  ): Promise<ApiResponse<void>> {
    const response = await apiClient.post<ApiResponse<void>>(
      `/chats/messages/${messageId}/reactions`,
      payload
    );
    return response.data;
  }

  async removeReaction(
    messageId: string,
    emoji: string
  ): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<ApiResponse<void>>(
      `/chats/messages/${messageId}/reactions`,
      {
        data: { emoji },
      }
    );
    return response.data;
  }

  async editMessage(
    messageId: string,
    payload: EditMessagePayload
  ): Promise<ApiResponse<Message>> {
    const response = await apiClient.put<ApiResponse<Message>>(
      `/chats/messages/${messageId}`,
      payload
    );
    return response.data;
  }

  async deleteMessage(messageId: string): Promise<ApiResponse<Message>> {
    const response = await apiClient.delete<ApiResponse<Message>>(
      `/chats/messages/${messageId}`
    );
    return response.data;
  }

  async markAsRead(conversationId: string): Promise<ApiResponse<void>> {
    const response = await apiClient.post<ApiResponse<void>>(
      `/chats/conversations/${conversationId}/read`
    );
    return response.data;
  }

  async searchMessages(
    conversationId: string,
    query: string
  ): Promise<ApiResponse<Message[]>> {
    const response = await apiClient.get<ApiResponse<Message[]>>(
      `/chats/conversations/${conversationId}/search`,
      {
        params: { q: query },
      }
    );
    return response.data;
  }
}

export const chatService = new ChatService();