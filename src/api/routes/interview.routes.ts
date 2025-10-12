import { Router, Request, Response } from 'express';
import { interviewService } from '@/services/interview.service';
import { asyncHandler } from '@/utils/asyncHandler';
import { sendSuccess, sendPaginatedResponse } from '@/utils/response';
import { authenticate } from '@/api/middleware/auth.middleware';
import { validate } from '@/api/middleware/validate';
import {
  createInterviewSchema,
  updateInterviewSchema,
  getInterviewSchema,
  deleteInterviewSchema,
  getInterviewsQuerySchema,
} from '@/api/validators/interview.validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

// =================================
// INTERVIEW ROUTES
// =================================

/**
 * @route   GET /api/v1/interviews
 * @desc    Get all interviews for user with filtering and pagination
 * @access  Private
 */
router.get(
  '/',
  validate(getInterviewsQuerySchema),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const result = await interviewService.getInterviews(userId, req.query as any);

    sendPaginatedResponse(
      res,
      result.interviews,
      result.pagination.page,
      result.pagination.limit,
      result.pagination.total
    );
  })
);

/**
 * @route   GET /api/v1/interviews/upcoming
 * @desc    Get upcoming interviews
 * @access  Private
 */
router.get(
  '/upcoming',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

    const interviews = await interviewService.getUpcomingInterviews(userId, limit);
    sendSuccess(res, { interviews }, 'Upcoming interviews retrieved');
  })
);

/**
 * @route   GET /api/v1/interviews/past
 * @desc    Get past interviews
 * @access  Private
 */
router.get(
  '/past',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

    const interviews = await interviewService.getPastInterviews(userId, limit);
    sendSuccess(res, { interviews }, 'Past interviews retrieved');
  })
);

/**
 * @route   GET /api/v1/interviews/stats
 * @desc    Get interview statistics
 * @access  Private
 */
router.get(
  '/stats',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const stats = await interviewService.getInterviewStats(userId);
    sendSuccess(res, { stats }, 'Interview statistics retrieved');
  })
);

/**
 * @route   POST /api/v1/interviews
 * @desc    Create a new interview
 * @access  Private
 */
router.post(
  '/',
  validate(createInterviewSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const interview = await interviewService.createInterview(userId, req.body);
    sendSuccess(res, { interview }, 'Interview created successfully', 201);
  })
);

/**
 * @route   GET /api/v1/interviews/:id
 * @desc    Get interview by ID
 * @access  Private
 */
router.get(
  '/:id',
  validate(getInterviewSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const { id } = req.params;

    const interview = await interviewService.getInterviewById(id!, userId);
    sendSuccess(res, { interview }, 'Interview retrieved successfully');
  })
);

/**
 * @route   PUT /api/v1/interviews/:id
 * @desc    Update interview
 * @access  Private
 */
router.put(
  '/:id',
  validate(updateInterviewSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const { id } = req.params;

    const interview = await interviewService.updateInterview(id!, userId, req.body);
    sendSuccess(res, { interview }, 'Interview updated successfully');
  })
);

/**
 * @route   DELETE /api/v1/interviews/:id
 * @desc    Delete interview
 * @access  Private
 */
router.delete(
  '/:id',
  validate(deleteInterviewSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const { id } = req.params;

    await interviewService.deleteInterview(id!, userId);
    sendSuccess(res, null, 'Interview deleted successfully');
  })
);

export default router;
