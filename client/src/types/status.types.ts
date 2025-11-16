// ============================================
// FILE: src/types/status.types.ts
// Status/Stories type definitions
// ============================================

import { Contact } from "./user.types";

export type StatusType = 'text' | 'image' | 'video';

export interface Status {
  id: string;
  userId: string;
  type: StatusType;
  content?: string;
  mediaUrl?: string;
  backgroundColor?: string;
  views: StatusView[];
  expiresAt: string;
  createdAt: string;
  user?: Contact;
}

export interface StatusView {
  userId: string;
  viewedAt: string;
}

export interface UserStatuses {
  user: Contact;
  statuses: Status[];
  hasUnviewed: boolean;
}

