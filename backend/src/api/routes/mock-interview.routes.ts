import { Router, Request, Response } from 'express';
import { mockInterviewService } from '@/services/mock-interview.service';
import { asyncHandler } from '@/utils/asyncHandler';
import { sendSuccess } from '@/utils/response';
import { authenticate } from '@/api/middleware/auth.middleware';
import { validate } from '@/api/middleware/validate';
import {
  createMockInterviewSchema,
  getMockInterviewSchema,
  submitAnswerSchema,
  completeMockInterviewSchema,
  getMockInterviewsByInterviewSchema,
  deleteMockInterviewSchema,
} from '@/api/validators/mock-interview.validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

// =================================
// MOCK INTERVIEW ROUTES
// =================================

/**
 * @route   POST /api/mock-interviews
 * @desc    Create new mock interview session and generate questions
 * @access  Private
 */
router.post(
  '/',
  validate(createMockInterviewSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const session = await mockInterviewService.createMockInterview(userId, req.body);
    sendSuccess(res, { session }, 'Mock interview session created successfully', 201);
  })
);

/**
 * @route   POST /api/mock-interviews/:sessionId/answer
 * @desc    Submit answer to a question and get evaluation
 * @access  Private
 */
router.post(
  '/:sessionId/answer',
  validate(submitAnswerSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const { sessionId } = req.params;

    const result = await mockInterviewService.submitAnswer(sessionId!, userId, req.body);
    sendSuccess(res, result, 'Answer submitted and evaluated successfully');
  })
);

/**
 * @route   POST /api/mock-interviews/:sessionId/complete
 * @desc    Complete mock interview session and get final analysis
 * @access  Private
 */
router.post(
  '/:sessionId/complete',
  validate(completeMockInterviewSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const { sessionId } = req.params;

    const session = await mockInterviewService.completeMockInterview(sessionId!, userId);
    sendSuccess(res, { session }, 'Mock interview completed successfully');
  })
);

/**
 * @route   GET /api/mock-interviews/:id
 * @desc    Get mock interview session by ID
 * @access  Private
 */
router.get(
  '/:id',
  validate(getMockInterviewSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const { id } = req.params;

    const session = await mockInterviewService.getMockInterviewById(id!, userId);
    sendSuccess(res, { session }, 'Mock interview retrieved successfully');
  })
);

/**
 * @route   GET /api/interviews/:interviewId/mock-sessions
 * @desc    Get all mock interview sessions for a scheduled interview
 * @access  Private
 */
router.get(
  '/interview/:interviewId/sessions',
  validate(getMockInterviewsByInterviewSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const { interviewId } = req.params;

    const sessions = await mockInterviewService.getMockInterviewsByInterview(interviewId!, userId);
    sendSuccess(res, { sessions }, 'Mock interview sessions retrieved successfully');
  })
);

/**
 * @route   DELETE /api/mock-interviews/:id
 * @desc    Delete mock interview session
 * @access  Private
 */
router.delete(
  '/:id',
  validate(deleteMockInterviewSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const { id } = req.params;

    await mockInterviewService.deleteMockInterview(id!, userId);
    sendSuccess(res, null, 'Mock interview deleted successfully');
  })
);

export default router;
