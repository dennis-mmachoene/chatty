// ============================================
// FILE: server/src/server.js
// ============================================
const { createServer } = require('http');
const app = require('./app');
const setupWebSocket = require('./websocket');
const { testConnection } = require('./config/database');
const { redis } = require('./config/redis');
const { initializeBuckets } = require('./config/storage');
const logger = require('./utils/logger');
const tokenService = require('./services/token.service');
const authService = require('./services/auth.service');
const statusService = require('./services/status.service');

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

// Create HTTP server
const httpServer = createServer(app);

// Setup WebSocket
const io = setupWebSocket(httpServer);

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  logger.info(`${signal} received, starting graceful shutdown...`);

  // Stop accepting new connections
  httpServer.close(() => {
    logger.info('HTTP server closed');
  });

  // Close WebSocket connections
  io.close(() => {
    logger.info('WebSocket server closed');
  });

  // Close database connections
  try {
    await redis.quit();
    logger.info('Redis connection closed');
  } catch (error) {
    logger.error('Error closing Redis connection:', error);
  }

  // Exit process
  setTimeout(() => {
    logger.warn('Forcing shutdown after timeout');
    process.exit(1);
  }, 10000);

  process.exit(0);
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection at:', promise, 'reason:', reason);
  gracefulShutdown('UNHANDLED_REJECTION');
});

// Cleanup jobs
const startCleanupJobs = () => {
  // Cleanup expired OTPs every hour
  setInterval(async () => {
    try {
      await authService.cleanupExpiredOTPs();
    } catch (error) {
      logger.error('OTP cleanup error:', error);
    }
  }, 60 * 60 * 1000);

  // Cleanup expired tokens every hour
  setInterval(async () => {
    try {
      await tokenService.cleanupExpiredTokens();
    } catch (error) {
      logger.error('Token cleanup error:', error);
    }
  }, 60 * 60 * 1000);

  // Cleanup expired statuses every hour
  setInterval(async () => {
    try {
      await statusService.cleanupExpiredStatuses();
    } catch (error) {
      logger.error('Status cleanup error:', error);
    }
  }, 60 * 60 * 1000);

  // Cleanup stale calls every 5 minutes
  const webrtcService = require('./services/webrtc.service');
  setInterval(() => {
    try {
      webrtcService.cleanupStaleCalls();
    } catch (error) {
      logger.error('Call cleanup error:', error);
    }
  }, 5 * 60 * 1000);

  logger.info('Cleanup jobs started');
};

// Start server
const startServer = async () => {
  try {
    // Test database connection
    logger.info('Testing database connection...');
    const dbConnected = await testConnection();
    if (!dbConnected) {
      throw new Error('Database connection failed');
    }

    // Test Redis connection
    logger.info('Testing Redis connection...');
    if (redis.status !== 'ready') {
      throw new Error('Redis connection failed');
    }

    // Initialize storage buckets
    logger.info('Initializing storage buckets...');
    await initializeBuckets();

    // Start cleanup jobs
    startCleanupJobs();

    // Start listening
    httpServer.listen(PORT, HOST, () => {
      logger.info(`
        ╔═══════════════════════════════════════════╗
        ║   Chat Platform Backend Server Started   ║
        ╠═══════════════════════════════════════════╣
        ║   Environment: ${process.env.NODE_ENV?.padEnd(27) || 'development'.padEnd(27)} ║
        ║   HTTP Server: http://${HOST}:${PORT}${' '.repeat(22 - HOST.length - PORT.toString().length)} ║
        ║   WebSocket:   ws://${HOST}:${PORT}${' '.repeat(24 - HOST.length - PORT.toString().length)} ║
        ╚═══════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();
