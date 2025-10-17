import { Router, Request, Response } from 'express';
import { jobService } from '@/services/job.service';
import { asyncHandler } from '@/utils/asyncHandler';
import { sendSuccess, sendPaginatedResponse } from '@/utils/response';
import { authenticate } from '@/api/middleware/auth.middleware';
import { validate } from '@/api/middleware/validate';
import {
  createJobSchema,
  updateJobSchema,
  getJobSchema,
  deleteJobSchema,
  updateJobStatusSchema,
  addJobNoteSchema,
  getJobsQuerySchema,
  parseJobUrlSchema,
} from '@/api/validators/job.validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

// =================================
// JOB ROUTES
// =================================

/**
 * @route   GET /api/v1/jobs
 * @desc    Get all jobs for user with filtering and pagination
 * @access  Private
 */
router.get(
  '/',
  validate(getJobsQuerySchema),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const result = await jobService.getJobs(userId, req.query as any);

    sendPaginatedResponse(
      res,
      result.jobs,
      result.pagination.page,
      result.pagination.limit,
      result.pagination.total
    );
  })
);

/**
 * @route   GET /api/v1/jobs/stats
 * @desc    Get job statistics
 * @access  Private
 */
router.get(
  '/stats',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const stats = await jobService.getJobStats(userId);
    sendSuccess(res, { stats }, 'Job statistics retrieved');
  })
);

/**
 * @route   POST /api/v1/jobs/parse-url
 * @desc    Parse job details from URL
 * @access  Private
 */
router.post(
  '/parse-url',
  validate(parseJobUrlSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { url } = req.body;
    const parsedData = await jobService.parseJobFromUrl(url);
    sendSuccess(res, { jobData: parsedData }, 'Job URL parsed successfully');
  })
);

/**
 * @route   POST /api/v1/jobs
 * @desc    Create a new job
 * @access  Private
 */
router.post(
  '/',
  validate(createJobSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const job = await jobService.createJob(userId, req.body);
    sendSuccess(res, { job }, 'Job created successfully', 201);
  })
);

/**
 * @route   GET /api/v1/jobs/:id
 * @desc    Get job by ID
 * @access  Private
 */
router.get(
  '/:id',
  validate(getJobSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const { id } = req.params;

    const job = await jobService.getJobById(id!, userId);
    sendSuccess(res, { job }, 'Job retrieved successfully');
  })
);

/**
 * @route   PUT /api/v1/jobs/:id
 * @desc    Update job
 * @access  Private
 */
router.put(
  '/:id',
  validate(updateJobSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const { id } = req.params;

    const job = await jobService.updateJob(id!, userId, req.body);
    sendSuccess(res, { job }, 'Job updated successfully');
  })
);

/**
 * @route   DELETE /api/v1/jobs/:id
 * @desc    Delete job
 * @access  Private
 */
router.delete(
  '/:id',
  validate(deleteJobSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const { id } = req.params;

    await jobService.deleteJob(id!, userId);
    sendSuccess(res, null, 'Job deleted successfully');
  })
);

/**
 * @route   PUT /api/v1/jobs/:id/status
 * @desc    Update job status with validation
 * @access  Private
 */
router.put(
  '/:id/status',
  validate(updateJobStatusSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const { id } = req.params;

    const job = await jobService.updateJobStatus(id!, userId, req.body);
    sendSuccess(res, { job }, 'Job status updated successfully');
  })
);

/**
 * @route   POST /api/v1/jobs/:id/notes
 * @desc    Add a note to a job
 * @access  Private
 */
router.post(
  '/:id/notes',
  validate(addJobNoteSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const { id } = req.params;

    const job = await jobService.addJobNote(id!, userId, req.body);
    sendSuccess(res, { job }, 'Note added successfully');
  })
);

/**
 * @route   GET /api/v1/jobs/:id/timeline
 * @desc    Get job status timeline
 * @access  Private
 */
router.get(
  '/:id/timeline',
  validate(getJobSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const { id } = req.params;

    const timeline = await jobService.getJobTimeline(id!, userId);
    sendSuccess(res, { timeline }, 'Job timeline retrieved');
  })
);

export default router;
