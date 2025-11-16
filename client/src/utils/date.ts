// ============================================
// FILE: src/utils/date.ts
// Date formatting and manipulation utilities
// ============================================

import { formatDistanceToNow, format, isToday, isYesterday, differenceInDays } from 'date-fns';

export const formatMessageTime = (date: string | Date): string => {
  const messageDate = new Date(date);

  if (isToday(messageDate)) {
    return format(messageDate, 'HH:mm');
  }

  if (isYesterday(messageDate)) {
    return 'Yesterday';
  }

  const daysDiff = differenceInDays(new Date(), messageDate);

  if (daysDiff < 7) {
    return format(messageDate, 'EEEE');
  }

  return format(messageDate, 'dd/MM/yyyy');
};

export const formatLastSeen = (date: string | Date): string => {
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch {
    return 'Recently';
  }
};

export const formatFullDateTime = (date: string | Date): string => {
  return format(new Date(date), 'PPpp');
};

export const formatDate = (date: string | Date): string => {
  return format(new Date(date), 'PP');
};

export const formatTime = (date: string | Date): string => {
  return format(new Date(date), 'p');
};

export const isToday Date = (date: string | Date): boolean => {
  return isToday(new Date(date));
};

export const isExpired = (date: string | Date): boolean => {
  return new Date(date) < new Date();
};