import { Router, Request, Response } from 'express';
import { asyncHandler } from '@/utils/asyncHandler';
import { sendSuccess } from '@/utils/response';
import { resumeParseQueue } from '@/config/queue';
import { prisma } from '@/database/client';
import { initializeRedis } from '@/config/redis';

const router = Router();

/**
 * @route   GET /api/v1/health
 * @desc    Basic health check
 * @access  Public
 */
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, { status: 'ok' }, 'Service is healthy');
  })
);

/**
 * @route   GET /api/v1/health/queue
 * @desc    Check queue status and worker health
 * @access  Public
 */
router.get(
  '/queue',
  asyncHandler(async (req: Request, res: Response) => {
    // Get queue counts
    const waiting = await resumeParseQueue.getWaitingCount();
    const active = await resumeParseQueue.getActiveCount();
    const completed = await resumeParseQueue.getCompletedCount();
    const failed = await resumeParseQueue.getFailedCount();
    const delayed = await resumeParseQueue.getDelayedCount();

    // Get workers info
    const workers = await resumeParseQueue.getWorkers();
    const isWorkerActive = workers.length > 0;

    // Get recent jobs
    const recentJobs = await resumeParseQueue.getJobs(['completed', 'failed'], 0, 4);

    // Get job states
    const recentJobsWithState = await Promise.all(
      recentJobs.map(async (job) => ({
        id: job.id,
        state: await job.getState(),
        timestamp: job.timestamp,
        finishedOn: job.finishedOn,
        failedReason: job.failedReason,
      }))
    );

    const queueStatus = {
      healthy: isWorkerActive && failed < 10, // Consider unhealthy if no workers or too many failures
      worker: {
        active: isWorkerActive,
        count: workers.length,
      },
      jobs: {
        waiting,
        active,
        completed,
        failed,
        delayed,
        total: waiting + active + completed + failed + delayed,
      },
      recentJobs: recentJobsWithState,
    };

    sendSuccess(res, queueStatus, 'Queue status retrieved');
  })
);

/**
 * @route   GET /api/v1/health/database
 * @desc    Check database connection
 * @access  Public
 */
router.get(
  '/database',
  asyncHandler(async (req: Request, res: Response) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      sendSuccess(res, { connected: true }, 'Database is connected');
    } catch (error) {
      res.status(503).json({
        success: false,
        data: { connected: false },
        message: 'Database connection failed',
      });
    }
  })
);

/**
 * @route   GET /api/v1/health/redis
 * @desc    Check Redis connection
 * @access  Public
 */
router.get(
  '/redis',
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const redis = initializeRedis();
      const pong = await redis.ping();
      sendSuccess(res, { connected: pong === 'PONG' }, 'Redis is connected');
    } catch (error) {
      res.status(503).json({
        success: false,
        data: { connected: false },
        message: 'Redis connection failed',
      });
    }
  })
);

export default router;
