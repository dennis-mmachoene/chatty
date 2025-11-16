// ============================================
// FILE: src/stores/chatStore.ts
// Chat state management
// ============================================

import { create } from 'zustand';
import type { Conversation, Message, TypingUser } from '@/types/chat.types';

interface ChatState {
  // Active conversation
  activeConversationId: string | null;
  setActiveConversation: (id: string | null) => void;

  // Conversations
  conversations: Conversation[];
  setConversations: (conversations: Conversation[]) => void;
  addConversation: (conversation: Conversation) => void;
  updateConversation: (id: string, updates: Partial<Conversation>) => void;

  // Messages
  messages: Record<string, Message[]>;
  setMessages: (conversationId: string, messages: Message[]) => void;
  addMessage: (conversationId: string, message: Message) => void;
  updateMessage: (conversationId: string, messageId: string, updates: Partial<Message>) => void;
  deleteMessage: (conversationId: string, messageId: string) => void;

  // Typing indicators
  typingUsers: Record<string, TypingUser[]>;
  setTypingUsers: (conversationId: string, users: TypingUser[]) => void;
  addTypingUser: (conversationId: string, user: TypingUser) => void;
  removeTypingUser: (conversationId: string, userId: string) => void;

  // Unread counts
  incrementUnreadCount: (conversationId: string) => void;
  clearUnreadCount: (conversationId: string) => void;

  // Clear all
  clearChat: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  activeConversationId: null,
  conversations: [],
  messages: {},
  typingUsers: {},

  setActiveConversation: (id) => set({ activeConversationId: id }),

  setConversations: (conversations) => set({ conversations }),

  addConversation: (conversation) =>
    set((state) => ({
      conversations: [conversation, ...state.conversations],
    })),

  updateConversation: (id, updates) =>
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv.id === id ? { ...conv, ...updates } : conv
      ),
    })),

  setMessages: (conversationId, messages) =>
    set((state) => ({
      messages: { ...state.messages, [conversationId]: messages },
    })),

  addMessage: (conversationId, message) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: [...(state.messages[conversationId] || []), message],
      },
    })),

  updateMessage: (conversationId, messageId, updates) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: state.messages[conversationId]?.map((msg) =>
          msg.id === messageId ? { ...msg, ...updates } : msg
        ),
      },
    })),

  deleteMessage: (conversationId, messageId) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: state.messages[conversationId]?.filter((msg) => msg.id !== messageId),
      },
    })),

  setTypingUsers: (conversationId, users) =>
    set((state) => ({
      typingUsers: { ...state.typingUsers, [conversationId]: users },
    })),

  addTypingUser: (conversationId, user) =>
    set((state) => ({
      typingUsers: {
        ...state.typingUsers,
        [conversationId]: [...(state.typingUsers[conversationId] || []), user],
      },
    })),

  removeTypingUser: (conversationId, userId) =>
    set((state) => ({
      typingUsers: {
        ...state.typingUsers,
        [conversationId]: state.typingUsers[conversationId]?.filter((u) => u.userId !== userId),
      },
    })),

  incrementUnreadCount: (conversationId) =>
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv.id === conversationId ? { ...conv, unreadCount: conv.unreadCount + 1 } : conv
      ),
    })),

  clearUnreadCount: (conversationId) =>
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
      ),
    })),

  clearChat: () =>
    set({
      activeConversationId: null,
      conversations: [],
      messages: {},
      typingUsers: {},
    }),
}));