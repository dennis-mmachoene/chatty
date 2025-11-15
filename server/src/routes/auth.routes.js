// ============================================
// FILE: server/src/routes/auth.routes.js
// ============================================
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validateBody } = require('../middleware/validation.middleware');
const { authLimiter } = require('../middleware/ratelimit.middleware');
const { z } = require('zod');

// Validation schemas
const requestOTPSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const verifyOTPSchema = z.object({
  email: z.string().email('Invalid email address'),
  code: z.string().length(6, 'OTP must be 6 digits').regex(/^\d+$/, 'OTP must contain only digits'),
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

const logoutSchema = z.object({
  refreshToken: z.string().optional(),
});

// Routes
router.post(
  '/request-otp',
  authLimiter,
  validateBody(requestOTPSchema),
  authController.requestOTP
);

router.post(
  '/verify-otp',
  authLimiter,
  validateBody(verifyOTPSchema),
  authController.verifyOTP
);

router.post(
  '/refresh',
  validateBody(refreshTokenSchema),
  authController.refreshToken
);

router.post(
  '/logout',
  authenticate,
  validateBody(logoutSchema),
  authController.logout
);

router.post(
  '/logout-all',
  authenticate,
  authController.logoutAll
);

module.exports = router;

