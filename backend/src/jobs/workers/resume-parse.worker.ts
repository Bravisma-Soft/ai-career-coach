import { Worker } from 'bullmq';
import { redis } from '@/config/redis';
import { logger } from '@/config/logger';
import { resumeParseProcessor } from '@/jobs/processors/resume-parse.processor';

/**
 * Resume Parse Worker
 *
 * Background worker that processes resume parsing jobs
 */

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

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, closing resume parse worker...');
  await resumeParseWorker.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, closing resume parse worker...');
  await resumeParseWorker.close();
  process.exit(0);
});

export default resumeParseWorker;
