// ============================================
// FILE: src/utils/constants.ts
// Application-wide constants
// ============================================

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:5000';

export const MAX_IMAGE_SIZE = Number(import.meta.env.VITE_MAX_IMAGE_SIZE) || 10485760; // 10MB
export const MAX_VIDEO_SIZE = Number(import.meta.env.VITE_MAX_VIDEO_SIZE) || 52428800; // 50MB
export const MAX_AUDIO_SIZE = Number(import.meta.env.VITE_MAX_AUDIO_SIZE) || 10485760; // 10MB

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
export const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
export const ALLOWED_AUDIO_TYPES = ['audio/mpeg', 'audio/wav', 'audio/webm', 'audio/ogg'];

export const MESSAGE_STATUSES = {
  SENDING: 'sending',
  SENT: 'sent',
  DELIVERED: 'delivered',
  READ: 'read',
  FAILED: 'failed',
} as const;

export const QUERY_KEYS = {
  USER: 'user',
  CONTACTS: 'contacts',
  CONVERSATIONS: 'conversations',
  MESSAGES: 'messages',
  STATUSES: 'statuses',
  CALLS: 'calls',
  SETTINGS: 'settings',
} as const;

export const STORAGE_KEYS = {
  THEME: 'chat-theme',
  TOKEN: 'chat-access-token',
  REFRESH_TOKEN: 'chat-refresh-token',
  USER: 'chat-user',
  LANGUAGE: 'chat-language',
} as const;

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  FORGOT_PASSWORD: '/forgot-password',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  NOT_FOUND: '/404',
} as const;