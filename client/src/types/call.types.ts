// ============================================
// FILE: src/types/call.types.ts
// Voice and video call type definitions
// ============================================

import { Contact } from "./user.types";

export type CallType = 'audio' | 'video';
export type CallStatus = 'missed' | 'completed' | 'declined' | 'failed';
export type CallDirection = 'incoming' | 'outgoing';

export interface Call {
  id: string;
  callerId: string;
  calleeId: string;
  type: CallType;
  status: CallStatus;
  duration?: number;
  startedAt?: string;
  endedAt?: string;
  createdAt: string;
}

export interface CallWithUser extends Call {
  direction: CallDirection;
  otherUser: Contact;
}

export interface IceServer {
  urls: string | string[];
  username?: string;
  credential?: string;
}