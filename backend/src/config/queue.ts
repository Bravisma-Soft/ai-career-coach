import { Queue, Worker, QueueEvents } from 'bullmq';
import { initializeRedis } from './redis';
import { logger } from './logger';
import { env } from './env';

// Ensure Redis is initialized
const redis = initializeRedis();

// Queue configuration
const queueConfig = {
  connection: redis,
  defaultJobOptions: {
    attempts: env.QUEUE_MAX_RETRIES,
    backoff: {
      type: 'exponential' as const,
      delay: 1000,
    },
    removeOnComplete: {
      count: 100,
      age: 24 * 3600, // 24 hours
    },
    removeOnFail: {
      count: 1000,
      age: 7 * 24 * 3600, // 7 days
    },
  },
};

// Email Queue
export const emailQueue = new Queue('email', queueConfig);

// AI Processing Queue
export const aiQueue = new Queue('ai', queueConfig);

// Resume Parsing Queue
export const resumeParseQueue = new Queue('resume-parsing', queueConfig);

// Export queues
export const queues = {
  email: emailQueue,
  ai: aiQueue,
  resumeParsing: resumeParseQueue,
};

// Queue Events
const emailQueueEvents = new QueueEvents('email', { connection: redis });
const aiQueueEvents = new QueueEvents('ai', { connection: redis });
const resumeParseQueueEvents = new QueueEvents('resume-parsing', { connection: redis });

emailQueueEvents.on('completed', ({ jobId }) => {
  logger.info(`Email job ${jobId} completed`);
});

emailQueueEvents.on('failed', ({ jobId, failedReason }) => {
  logger.error(`Email job ${jobId} failed: ${failedReason}`);
});

aiQueueEvents.on('completed', ({ jobId }) => {
  logger.info(`AI job ${jobId} completed`);
});

aiQueueEvents.on('failed', ({ jobId, failedReason }) => {
  logger.error(`AI job ${jobId} failed: ${failedReason}`);
});

resumeParseQueueEvents.on('completed', ({ jobId }) => {
  logger.info(`Resume parse job ${jobId} completed`);
});

resumeParseQueueEvents.on('failed', ({ jobId, failedReason }) => {
  logger.error(`Resume parse job ${jobId} failed: ${failedReason}`);
});

resumeParseQueueEvents.on('progress', ({ jobId, data }) => {
  logger.debug(`Resume parse job ${jobId} progress: ${data}%`);
});

// Initialize queues
export const initializeQueues = async (): Promise<void> => {
  try {
    logger.info('✅ Job queues initialized');
  } catch (error) {
    logger.error('❌ Failed to initialize queues:', error);
    throw error;
  }
};

// Close all queues
export const closeQueues = async (): Promise<void> => {
  await Promise.all([emailQueue.close(), aiQueue.close(), resumeParseQueue.close()]);
  logger.info('✅ All queues closed');
};
