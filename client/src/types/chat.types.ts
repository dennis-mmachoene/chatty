// ============================================
// FILE: src/types/chat.types.ts
// Chat and messaging type definitions
// ============================================

import { Contact } from "./user.types";

export type MessageType =
  | 'text'
  | 'image'
  | 'video'
  | 'audio'
  | 'file'
  | 'location'
  | 'voice_note';

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export type ConversationType = 'direct' | 'group';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  type: MessageType;
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
  edited: boolean;
  deleted: boolean;
  reactions: MessageReaction[];
  status: MessageStatus;
  createdAt: string;
  updatedAt: string;
  sender?: {
    id: string;
    displayName: string;
    avatarUrl?: string;
  };
  replyMessage?: Partial<Message>;
}

export interface MessageReaction {
  emoji: string;
  userId: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  type: ConversationType;
  name?: string;
  avatarUrl?: string;
  participants: Participant[];
  lastMessage?: Message;
  unreadCount: number;
  muted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Participant {
  id: string;
  userId: string;
  role: 'admin' | 'member';
  joinedAt: string;
  lastReadAt?: string;
  user?: Contact;
}

export interface TypingUser {
  userId: string;
  displayName: string;
}