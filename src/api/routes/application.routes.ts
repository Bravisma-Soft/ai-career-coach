import { Router, Request, Response } from 'express';
import { applicationService } from '@/services/application.service';
import { asyncHandler } from '@/utils/asyncHandler';
import { sendSuccess, sendPaginatedResponse } from '@/utils/response';
import { authenticate } from '@/api/middleware/auth.middleware';
import { validate } from '@/api/middleware/validate';
import {
  createApplicationSchema,
  updateApplicationSchema,
  getApplicationSchema,
  deleteApplicationSchema,
  getApplicationsQuerySchema,
} from '@/api/validators/application.validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

// =================================
// APPLICATION ROUTES
// =================================

/**
 * @route   GET /api/v1/applications
 * @desc    Get all applications for user with filtering and pagination
 * @access  Private
 */
router.get(
  '/',
  validate(getApplicationsQuerySchema),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const result = await applicationService.getApplications(userId, req.query as any);

    sendPaginatedResponse(
      res,
      result.applications,
      result.pagination.page,
      result.pagination.limit,
      result.pagination.total
    );
  })
);

/**
 * @route   GET /api/v1/applications/stats
 * @desc    Get application statistics
 * @access  Private
 */
router.get(
  '/stats',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const stats = await applicationService.getApplicationStats(userId);
    sendSuccess(res, { stats }, 'Application statistics retrieved');
  })
);

/**
 * @route   POST /api/v1/applications
 * @desc    Create a new application
 * @access  Private
 */
router.post(
  '/',
  validate(createApplicationSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const application = await applicationService.createApplication(userId, req.body);
    sendSuccess(res, { application }, 'Application created successfully', 201);
  })
);

/**
 * @route   GET /api/v1/applications/:id
 * @desc    Get application by ID
 * @access  Private
 */
router.get(
  '/:id',
  validate(getApplicationSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const { id } = req.params;

    const application = await applicationService.getApplicationById(id!, userId);
    sendSuccess(res, { application }, 'Application retrieved successfully');
  })
);

/**
 * @route   PUT /api/v1/applications/:id
 * @desc    Update application
 * @access  Private
 */
router.put(
  '/:id',
  validate(updateApplicationSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const { id } = req.params;

    const application = await applicationService.updateApplication(id!, userId, req.body);
    sendSuccess(res, { application }, 'Application updated successfully');
  })
);

/**
 * @route   DELETE /api/v1/applications/:id
 * @desc    Delete application
 * @access  Private
 */
router.delete(
  '/:id',
  validate(deleteApplicationSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const { id } = req.params;

    await applicationService.deleteApplication(id!, userId);
    sendSuccess(res, null, 'Application deleted successfully');
  })
);

export default router;
