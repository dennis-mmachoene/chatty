// ============================================
// FILE: server/src/utils/validators.js
// ============================================
const { z } = require('zod');
const { REGEX } = require('../config/constants');

const schemas = {
  email: z.string().email('Invalid email address'),
  
  uuid: z.string().regex(REGEX.UUID, 'Invalid UUID format'),
  
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must not exceed 128 characters'),
  
  displayName: z
    .string()
    .min(2, 'Display name must be at least 2 characters')
    .max(50, 'Display name must not exceed 50 characters')
    .trim(),
  
  otp: z
    .string()
    .length(6, 'OTP must be exactly 6 digits')
    .regex(/^\d{6}$/, 'OTP must contain only digits'),
  
  phone: z.string().regex(REGEX.PHONE, 'Invalid phone number format').optional(),
  
  message: z
    .string()
    .min(1, 'Message cannot be empty')
    .max(10000, 'Message is too long')
    .trim(),
  
  latitude: z.number().min(-90).max(90),
  
  longitude: z.number().min(-180).max(180),
  
  pagination: z.object({
    limit: z.number().int().min(1).max(100).default(50),
    cursor: z.string().optional(),
  }),
};

const validate = (schema) => {
  return (data) => {
    try {
      return schema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        throw new Error(JSON.stringify(errors));
      }
      throw error;
    }
  };
};

module.exports = { schemas, validate };
