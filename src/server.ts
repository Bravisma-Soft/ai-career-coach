import http from 'http';
import app from './app';
import { env } from '@/config/env';
import { logger } from '@/config/logger';
import { connectDatabase, disconnectDatabase } from '@/database/prisma';
import { initializeRedis, closeRedis } from '@/config/redis';

// =================================
// CREATE HTTP SERVER
// =================================
const server = http.createServer(app);

// =================================
// GRACEFUL SHUTDOWN HANDLER
// =================================
const gracefulShutdown = async (signal: string): Promise<void> => {
  logger.info(`\n${signal} signal received: closing HTTP server gracefully`);

  server.close(async () => {
    logger.info('HTTP server closed');

    try {
      // Close Redis connection
      await closeRedis();

      // Disconnect from database
      await disconnectDatabase();

      logger.info('✅ All connections closed successfully');
      process.exit(0);
    } catch (error) {
      logger.error('❌ Error during graceful shutdown:', error);
      process.exit(1);
    }
  });

  // Force close after 30 seconds
  setTimeout(() => {
    logger.error('⚠️  Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
};

// =================================
// HANDLE UNCAUGHT ERRORS
// =================================
process.on('uncaughtException', (error: Error) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  logger.error(`Error: ${error.message}`);
  logger.error(`Stack: ${error.stack}`);
  process.exit(1);
});

process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...');
  logger.error(`Reason: ${reason}`);
  logger.error(`Promise: ${promise}`);
  server.close(() => {
    process.exit(1);
  });
});

// =================================
// GRACEFUL SHUTDOWN SIGNALS
// =================================
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// =================================
// START SERVER
// =================================
const startServer = async (): Promise<void> => {
  try {
    logger.info('🚀 Starting AI Career Coach Backend...');

    // Connect to database
    logger.info('📊 Connecting to database...');
    await connectDatabase();

    // Initialize Redis
    logger.info('📦 Initializing Redis...');
    initializeRedis();

    // TODO: Initialize job queues
    // logger.info('⚙️  Initializing job queues...');
    // await initializeQueues();

    // Start listening
    server.listen(env.PORT, () => {
      logger.info('='.repeat(50));
      logger.info(`✅ Server is running in ${env.NODE_ENV} mode`);
      logger.info(`✅ Server is listening on port ${env.PORT}`);
      logger.info(`✅ API Version: ${env.API_VERSION}`);
      logger.info(`✅ Health check: http://localhost:${env.PORT}/health`);
      logger.info('='.repeat(50));
    });

    // Handle server errors
    server.on('error', (error: NodeJS.ErrnoException) => {
      if (error.syscall !== 'listen') {
        throw error;
      }

      switch (error.code) {
        case 'EACCES':
          logger.error(`❌ Port ${env.PORT} requires elevated privileges`);
          process.exit(1);
          break;
        case 'EADDRINUSE':
          logger.error(`❌ Port ${env.PORT} is already in use`);
          process.exit(1);
          break;
        default:
          throw error;
      }
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// =================================
// INITIALIZE APPLICATION
// =================================
startServer();
