// ============================================
// FILE: server/src/app.js
// ============================================
const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const Sentry = require('@sentry/node');
const corsMiddleware = require('./middleware/cors.middleware');
const { securityMiddleware, additionalSecurityHeaders } = require('./middleware/security.middleware');
const requestLogger = require('./middleware/logging.middleware');
const { errorHandler, notFoundHandler } = require('./middleware/error.middleware');
const { globalLimiter } = require('./middleware/ratelimit.middleware');
const routes = require('./routes');
const logger = require('./utils/logger');

const app = express();

// Initialize Sentry
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Sentry.Integrations.Express({ app }),
    ],
  });

  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.tracingHandler());
}

// Trust proxy
app.set('trust proxy', 1);

// Security middleware
app.use(securityMiddleware);
app.use(additionalSecurityHeaders);

// CORS
app.use(corsMiddleware);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Compression
app.use(compression());

// Request logging
app.use(requestLogger);

// Rate limiting
app.use('/api', globalLimiter);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

// Readiness check
app.get('/ready', async (req, res) => {
  try {
    // Check database connection
    const { testConnection } = require('./config/database');
    const dbHealthy = await testConnection();

    // Check Redis connection
    const { redis } = require('./config/redis');
    const redisHealthy = redis.status === 'ready';

    if (dbHealthy && redisHealthy) {
      res.json({
        status: 'ready',
        checks: {
          database: 'healthy',
          redis: 'healthy',
        },
      });
    } else {
      res.status(503).json({
        status: 'not ready',
        checks: {
          database: dbHealthy ? 'healthy' : 'unhealthy',
          redis: redisHealthy ? 'healthy' : 'unhealthy',
        },
      });
    }
  } catch (error) {
    logger.error('Readiness check failed:', error);
    res.status(503).json({
      status: 'not ready',
      error: error.message,
    });
  }
});

// API routes
app.use('/api', routes);

// Sentry error handler
if (process.env.SENTRY_DSN) {
  app.use(Sentry.Handlers.errorHandler());
}

// 404 handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

module.exports = app;


