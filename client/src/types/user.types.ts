// ============================================
// FILE: src/types/user.types.ts
// User-related type definitions
// ============================================

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  statusMessage?: string;
  phone?: string;
  isOnline: boolean;
  lastSeen: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserSettings {
  userId: string;
  theme: 'light' | 'dark' | 'system';
  notificationsEnabled: boolean;
  emailNotifications: boolean;
  showLastSeen: boolean;
  showProfilePhoto: 'everyone' | 'contacts' | 'nobody';
  showStatus: 'everyone' | 'contacts' | 'nobody';
  twoFactorEnabled: boolean;
}

export interface Contact {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  statusMessage?: string;
  isOnline: boolean;
  lastSeen: string;
}