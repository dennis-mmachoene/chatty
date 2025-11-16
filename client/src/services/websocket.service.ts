// ============================================
// FILE: src/services/websocket.service.ts
// WebSocket service with Socket.IO
// ============================================

import { io, Socket } from 'socket.io-client';
import { WS_URL, STORAGE_KEYS } from '@/utils/constants';
import { storage } from '@/utils/storage';
import type { Message } from '@/types/chat.types';

export type WebSocketEvent =
  | 'connected'
  | 'message:sent'
  | 'message:delivered'
  | 'message:read'
  | 'message:edited'
  | 'message:deleted'
  | 'message:reaction'
  | 'typing:start'
  | 'typing:stop'
  | 'presence:update'
  | 'call:offer'
  | 'call:answer'
  | 'call:candidate'
  | 'call:end'
  | 'call:declined'
  | 'status:posted'
  | 'contact:request'
  | 'contact:accepted';

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(): void {
    const token = storage.get<string>(STORAGE_KEYS.TOKEN, '');

    if (!token) {
      console.warn('No auth token available for WebSocket connection');
      return;
    }

    this.socket = io(WS_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts,
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.reconnectAttempts++;

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
        this.disconnect();
      }
    });

    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on<T = unknown>(event: WebSocketEvent | string, callback: (data: T) => void): void {
    if (!this.socket) {
      console.warn('Socket not connected');
      return;
    }

    this.socket.on(event, callback);
  }

  off(event: WebSocketEvent | string, callback?: (...args: unknown[]) => void): void {
    if (!this.socket) return;
    this.socket.off(event, callback);
  }

  emit<T = unknown>(event: WebSocketEvent | string, data?: T): void {
    if (!this.socket?.connected) {
      console.warn('Socket not connected, cannot emit event:', event);
      return;
    }

    this.socket.emit(event, data);
  }

  // Conversation management
  joinConversation(conversationId: string): void {
    this.emit('join-conversation', conversationId);
  }

  leaveConversation(conversationId: string): void {
    this.emit('leave-conversation', conversationId);
  }

  // Typing indicators
  startTyping(conversationId: string): void {
    this.emit('typing:start', { conversationId });
  }

  stopTyping(conversationId: string): void {
    this.emit('typing:stop', { conversationId });
  }

  // Message events
  sendMessage(message: Partial<Message>): void {
    this.emit('message', message);
  }

  markMessageDelivered(messageId: string, conversationId: string): void {
    this.emit('message:delivered', { messageId, conversationId });
  }

  markMessageRead(messageId: string, conversationId: string): void {
    this.emit('message:read', { messageId, conversationId });
  }

  // Presence
  updatePresence(isOnline: boolean): void {
    this.emit('presence-update', { isOnline });
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

export const websocketService = new WebSocketService();