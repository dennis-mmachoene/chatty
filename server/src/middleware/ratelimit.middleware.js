// ============================================
// FILE: server/src/middleware/ratelimit.middleware.js
// ============================================
const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const { redis } = require('../config/redis');
const { RateLimitError } = require('../utils/errors');
const { RATE_LIMITS } = require('../config/constants');
const logger = require('../utils/logger');

const createRateLimiter = (options = {}) => {
  const defaultOptions = {
    windowMs: RATE_LIMITS.GLOBAL.WINDOW_MS,
    max: RATE_LIMITS.GLOBAL.MAX,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn(`Rate limit exceeded for ${req.ip}`);
      throw new RateLimitError('Too many requests, please try again later');
    },
    skip: (req) => {
      // Skip rate limiting for health checks
      return req.path === '/health';
    },
  };

  // Use Redis store if available
  if (redis.status === 'ready') {
    defaultOptions.store = new RedisStore({
      client: redis,
      prefix: 'rl:',
    });
  }

  return rateLimit({ ...defaultOptions, ...options });
};

// Global rate limiter
const globalLimiter = createRateLimiter();

// Auth endpoints rate limiter
const authLimiter = createRateLimiter({
  windowMs: RATE_LIMITS.AUTH.WINDOW_MS,
  max: RATE_LIMITS.AUTH.MAX,
  message: 'Too many authentication attempts, please try again later',
});

// Upload endpoints rate limiter
const uploadLimiter = createRateLimiter({
  windowMs: RATE_LIMITS.UPLOAD.WINDOW_MS,
  max: RATE_LIMITS.UPLOAD.MAX,
  message: 'Too many uploads, please slow down',
});

// Custom rate limiter by user ID
const createUserRateLimiter = (max, windowMs) => {
  return createRateLimiter({
    max,
    windowMs,
    keyGenerator: (req) => {
      return req.user?.id || req.ip;
    },
  });
};

module.exports = {
  globalLimiter,
  authLimiter,
  uploadLimiter,
  createRateLimiter,
  createUserRateLimiter,
};