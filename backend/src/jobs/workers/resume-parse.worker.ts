import { Worker } from 'bullmq';
import { initializeRedis, closeRedis } from '@/config/redis';
import { connectDatabase, disconnectDatabase } from '@/database/prisma';
import { logger } from '@/config/logger';
import { resumeParseProcessor } from '@/jobs/processors/resume-parse.processor';

/**
 * Resume Parse Worker
 *
 * Background worker that processes resume parsing jobs
 */

// Initialize connections
const startWorker = async () => {
  try {
    // Connect to database
    logger.info('📊 Connecting to database...');
    await connectDatabase();

    // Initialize Redis
    logger.info('🔴 Connecting to Redis...');
    const redis = initializeRedis();

    const resumeParseWorker = new Worker('resume-parsing', resumeParseProcessor, {
      connection: redis,
      concurrency: 2, // Process up to 2 jobs concurrently
      limiter: {
        max: 10, // Max 10 jobs
        duration: 60000, // per minute (rate limiting)
      },
    });

    // Worker event handlers
    resumeParseWorker.on('completed', (job) => {
      logger.info('Resume parse worker completed job', {
        jobId: job.id,
        resumeId: job.data.resumeId,
        userId: job.data.userId,
      });
    });

    resumeParseWorker.on('failed', (job, error) => {
      logger.error('Resume parse worker failed job', {
        jobId: job?.id,
        resumeId: job?.data.resumeId,
        userId: job?.data.userId,
        error: error.message,
        attemptsMade: job?.attemptsMade,
      });
    });

    resumeParseWorker.on('error', (error) => {
      logger.error('Resume parse worker error', { error: error.message });
    });

    resumeParseWorker.on('active', (job) => {
      logger.info('Resume parse worker started job', {
        jobId: job.id,
        resumeId: job.data.resumeId,
      });
    });

    // Worker ready
    logger.info('✅ Resume Parse Worker started successfully', {
      concurrency: 2,
      rateLimit: '10 jobs per minute',
      environment: process.env.NODE_ENV || 'development',
    });

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      logger.info(`${signal} received, closing resume parse worker...`);

      try {
        // Close worker
        await resumeParseWorker.close();

        // Close Redis connection
        await closeRedis();

        // Disconnect from database
        await disconnectDatabase();

        logger.info('✅ Worker shut down gracefully');
        process.exit(0);
      } catch (error: any) {
        logger.error('Error during shutdown:', error);
        process.exit(1);
      }
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    return resumeParseWorker;
  } catch (error: any) {
    logger.error('❌ Failed to start worker:', error);
    process.exit(1);
  }
};

// Start the worker
startWorker().catch((error) => {
  logger.error('❌ Worker startup error:', error);
  process.exit(1);
});
