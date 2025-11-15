// ============================================
// FILE: server/src/middleware/auth.middleware.js
// ============================================
const tokenService = require('../services/token.service');
const userService = require('../services/user.service');
const { AuthenticationError, AuthorizationError } = require('../utils/errors');
const logger = require('../utils/logger');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('No token provided');
    }

    const token = authHeader.substring(7);
    const decoded = tokenService.verifyAccessToken(token);

    // Attach user to request
    const user = await userService.getUserById(decoded.userId);
    if (!user) {
      throw new AuthenticationError('User not found');
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    next(new AuthenticationError(error.message));
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = tokenService.verifyAccessToken(token);
      const user = await userService.getUserById(decoded.userId);
      
      if (user) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AuthenticationError('Authentication required'));
    }

    if (req.user.role !== role) {
      return next(new AuthorizationError('Insufficient permissions'));
    }

    next();
  };
};

module.exports = {
  authenticate,
  optionalAuth,
  requireRole,
};

