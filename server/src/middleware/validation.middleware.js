// ============================================
// FILE: server/src/middleware/validation.middleware.js
// ============================================
const { z } = require('zod');
const { ValidationError } = require('../utils/errors');
const Sanitizer = require('../utils/sanitizer');
const logger = require('../utils/logger');

const validate = (schema) => {
  return async (req, res, next) => {
    try {
      // Sanitize input
      req.body = Sanitizer.sanitizeInput(req.body);
      req.query = Sanitizer.sanitizeInput(req.query);
      req.params = Sanitizer.sanitizeInput(req.params);

      // Validate
      const validated = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      // Replace with validated data
      req.body = validated.body || req.body;
      req.query = validated.query || req.query;
      req.params = validated.params || req.params;

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        logger.warn('Validation error:', errors);
        return next(new ValidationError('Validation failed', errors));
      }
      next(error);
    }
  };
};

const validateBody = (schema) => {
  return async (req, res, next) => {
    try {
      req.body = Sanitizer.sanitizeInput(req.body);
      const validated = await schema.parseAsync(req.body);
      req.body = validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        return next(new ValidationError('Validation failed', errors));
      }
      next(error);
    }
  };
};

const validateParams = (schema) => {
  return async (req, res, next) => {
    try {
      req.params = Sanitizer.sanitizeInput(req.params);
      const validated = await schema.parseAsync(req.params);
      req.params = validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        return next(new ValidationError('Validation failed', errors));
      }
      next(error);
    }
  };
};

const validateQuery = (schema) => {
  return async (req, res, next) => {
    try {
      req.query = Sanitizer.sanitizeInput(req.query);
      const validated = await schema.parseAsync(req.query);
      req.query = validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        return next(new ValidationError('Validation failed', errors));
      }
      next(error);
    }
  };
};

module.exports = {
  validate,
  validateBody,
  validateParams,
  validateQuery,
};