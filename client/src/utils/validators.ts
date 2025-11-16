// ============================================
// FILE: src/utils/validators.ts
// Input validation utilities
// ============================================

import { z } from 'zod';

export const emailSchema = z
  .string()
  .email('Invalid email address')
  .min(1, 'Email is required');

export const otpSchema = z
  .string()
  .length(6, 'OTP must be 6 digits')
  .regex(/^\d{6}$/, 'OTP must contain only digits');

export const displayNameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(50, 'Name must not exceed 50 characters')
  .trim();

export const statusMessageSchema = z
  .string()
  .max(200, 'Status message must not exceed 200 characters')
  .optional();

export const messageContentSchema = z
  .string()
  .min(1, 'Message cannot be empty')
  .max(10000, 'Message is too long');

export const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number')
  .optional();

export const validateEmail = (email: string): boolean => {
  return emailSchema.safeParse(email).success;
};

export const validateOTP = (otp: string): boolean => {
  return otpSchema.safeParse(otp).success;
};

export const validateFileSize = (size: number, maxSize: number): boolean => {
  return size <= maxSize;
};

export const validateFileType = (type: string, allowedTypes: string[]): boolean => {
  return allowedTypes.includes(type);
};