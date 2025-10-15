import { Router, Request, Response } from 'express';
import { resumeService } from '@/services/resume.service';
import { asyncHandler } from '@/utils/asyncHandler';
import { sendSuccess, sendPaginatedResponse } from '@/utils/response';
import { authenticate } from '@/api/middleware/auth.middleware';
import { validate } from '@/api/middleware/validate';
import { upload, handleMulterError } from '@/config/multer';
import {
  createResumeSchema,
  updateResumeSchema,
  getResumeSchema,
  deleteResumeSchema,
  parseResumeSchema,
  getResumesQuerySchema,
} from '@/api/validators/resume.validator';
import { BadRequestError } from '@/utils/ApiError';

const router = Router();

// All routes require authentication
router.use(authenticate);

// =================================
// RESUME ROUTES
// =================================

/**
 * @route   POST /api/v1/resumes/upload
 * @desc    Upload a new resume
 * @access  Private
 */
router.post(
  '/upload',
  upload.single('resume'),
  handleMulterError,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;

    if (!req.file) {
      throw new BadRequestError('No file uploaded');
    }

    const { title = req.file.originalname, isPrimary = false } = req.body;

    const resume = await resumeService.uploadResume(
      userId,
      req.file,
      title,
      isPrimary === 'true' || isPrimary === true
    );

    sendSuccess(res, { resume }, 'Resume uploaded successfully', 201);
  })
);

/**
 * @route   GET /api/v1/resumes
 * @desc    Get all resumes for user
 * @access  Private
 */
router.get(
  '/',
  validate(getResumesQuerySchema),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const result = await resumeService.getResumes(userId, req.query as any);

    sendPaginatedResponse(
      res,
      result.resumes,
      result.pagination.page,
      result.pagination.limit,
      result.pagination.total
    );
  })
);

/**
 * @route   GET /api/v1/resumes/stats
 * @desc    Get resume statistics
 * @access  Private
 */
router.get(
  '/stats',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const stats = await resumeService.getResumeStats(userId);
    sendSuccess(res, { stats }, 'Resume statistics retrieved');
  })
);

/**
 * @route   GET /api/v1/resumes/:id
 * @desc    Get resume by ID
 * @access  Private
 */
router.get(
  '/:id',
  validate(getResumeSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const { id } = req.params;

    const resume = await resumeService.getResumeById(id, userId);
    sendSuccess(res, { resume }, 'Resume retrieved successfully');
  })
);

/**
 * @route   PUT /api/v1/resumes/:id
 * @desc    Update resume
 * @access  Private
 */
router.put(
  '/:id',
  validate(updateResumeSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const { id } = req.params;

    const resume = await resumeService.updateResume(id, userId, req.body);
    sendSuccess(res, { resume }, 'Resume updated successfully');
  })
);

/**
 * @route   DELETE /api/v1/resumes/:id
 * @desc    Delete resume
 * @access  Private
 */
router.delete(
  '/:id',
  validate(deleteResumeSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const { id } = req.params;

    await resumeService.deleteResume(id, userId);
    sendSuccess(res, null, 'Resume deleted successfully');
  })
);

/**
 * @route   PATCH /api/resumes/:id/set-master
 * @desc    Set resume as primary (master)
 * @access  Private
 */
router.patch(
  '/:id/set-master',
  validate(getResumeSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const { id } = req.params;

    const resume = await resumeService.setPrimaryResume(id, userId);
    sendSuccess(res, { resume }, 'Resume set as primary');
  })
);

/**
 * @route   POST /api/v1/resumes/:id/parse
 * @desc    Parse resume content (triggers background job)
 * @access  Private
 */
router.post(
  '/:id/parse',
  validate(parseResumeSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const { id } = req.params;

    const resume = await resumeService.parseResume(id, userId);
    sendSuccess(res, { resume }, 'Resume parsing initiated');
  })
);

/**
 * @route   GET /api/v1/resumes/:id/download
 * @desc    Download resume file
 * @access  Private
 */
router.get(
  '/:id/download',
  validate(getResumeSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const { id } = req.params;

    const resume = await resumeService.getResumeById(id, userId);
    const fileBuffer = await resumeService.downloadResume(id, userId);

    // Set headers for file download
    res.setHeader('Content-Type', resume.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${resume.fileName}"`);
    res.setHeader('Content-Length', fileBuffer.length);

    res.send(fileBuffer);
  })
);

/**
 * @route   GET /api/v1/resumes/:id/url
 * @desc    Get signed URL for resume (for S3)
 * @access  Private
 */
router.get(
  '/:id/url',
  validate(getResumeSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const { id } = req.params;

    const url = await resumeService.getResumeUrl(id, userId);
    sendSuccess(res, { url }, 'Signed URL generated');
  })
);

export default router;
