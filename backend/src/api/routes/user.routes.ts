import { Router, Request, Response } from 'express';
import { userService } from '@/services/user.service';
import { asyncHandler } from '@/utils/asyncHandler';
import { sendSuccess } from '@/utils/response';
import { authenticate } from '@/api/middleware/auth.middleware';
import { validate } from '@/api/middleware/validate';
import {
  updateProfileSchema,
  createExperienceSchema,
  updateExperienceSchema,
  deleteExperienceSchema,
  createEducationSchema,
  updateEducationSchema,
  deleteEducationSchema,
  createSkillSchema,
  updateSkillSchema,
  deleteSkillSchema,
  createCertificationSchema,
  updateCertificationSchema,
  deleteCertificationSchema,
} from '@/api/validators/user.validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

// =================================
// PROFILE ROUTES
// =================================

/**
 * @route   GET /api/v1/profile
 * @desc    Get user profile
 * @access  Private
 */
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const profile = await userService.getProfile(userId);
    sendSuccess(res, { profile }, 'Profile retrieved successfully');
  })
);

/**
 * @route   PUT /api/v1/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put(
  '/',
  validate(updateProfileSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const profile = await userService.updateProfile(userId, req.body);
    sendSuccess(res, { profile }, 'Profile updated successfully');
  })
);

// =================================
// EXPERIENCE ROUTES
// =================================

/**
 * @route   POST /api/v1/profile/experience
 * @desc    Add work experience
 * @access  Private
 */
router.post(
  '/experience',
  validate(createExperienceSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const experience = await userService.addExperience(userId, req.body);
    sendSuccess(res, { experience }, 'Experience added successfully', 201);
  })
);

/**
 * @route   PUT /api/v1/profile/experience/:id
 * @desc    Update work experience
 * @access  Private
 */
router.put(
  '/experience/:id',
  validate(updateExperienceSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const { id } = req.params;
    const experience = await userService.updateExperience(id, userId, req.body);
    sendSuccess(res, { experience }, 'Experience updated successfully');
  })
);

/**
 * @route   DELETE /api/v1/profile/experience/:id
 * @desc    Delete work experience
 * @access  Private
 */
router.delete(
  '/experience/:id',
  validate(deleteExperienceSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const { id } = req.params;
    await userService.deleteExperience(id, userId);
    sendSuccess(res, null, 'Experience deleted successfully');
  })
);

// =================================
// EDUCATION ROUTES
// =================================

/**
 * @route   POST /api/v1/profile/education
 * @desc    Add education
 * @access  Private
 */
router.post(
  '/education',
  validate(createEducationSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const education = await userService.addEducation(userId, req.body);
    sendSuccess(res, { education }, 'Education added successfully', 201);
  })
);

/**
 * @route   PUT /api/v1/profile/education/:id
 * @desc    Update education
 * @access  Private
 */
router.put(
  '/education/:id',
  validate(updateEducationSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const { id } = req.params;
    const education = await userService.updateEducation(id, userId, req.body);
    sendSuccess(res, { education }, 'Education updated successfully');
  })
);

/**
 * @route   DELETE /api/v1/profile/education/:id
 * @desc    Delete education
 * @access  Private
 */
router.delete(
  '/education/:id',
  validate(deleteEducationSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const { id } = req.params;
    await userService.deleteEducation(id, userId);
    sendSuccess(res, null, 'Education deleted successfully');
  })
);

// =================================
// SKILL ROUTES
// =================================

/**
 * @route   POST /api/v1/profile/skill
 * @desc    Add skill
 * @access  Private
 */
router.post(
  '/skill',
  validate(createSkillSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const skill = await userService.addSkill(userId, req.body);
    sendSuccess(res, { skill }, 'Skill added successfully', 201);
  })
);

/**
 * @route   PUT /api/v1/profile/skill/:id
 * @desc    Update skill
 * @access  Private
 */
router.put(
  '/skill/:id',
  validate(updateSkillSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const { id } = req.params;
    const skill = await userService.updateSkill(id, userId, req.body);
    sendSuccess(res, { skill }, 'Skill updated successfully');
  })
);

/**
 * @route   DELETE /api/v1/profile/skill/:id
 * @desc    Delete skill
 * @access  Private
 */
router.delete(
  '/skill/:id',
  validate(deleteSkillSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const { id } = req.params;
    await userService.deleteSkill(id, userId);
    sendSuccess(res, null, 'Skill deleted successfully');
  })
);

// =================================
// CERTIFICATION ROUTES
// =================================

/**
 * @route   POST /api/v1/profile/certification
 * @desc    Add certification
 * @access  Private
 */
router.post(
  '/certification',
  validate(createCertificationSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const certification = await userService.addCertification(userId, req.body);
    sendSuccess(res, { certification }, 'Certification added successfully', 201);
  })
);

/**
 * @route   PUT /api/v1/profile/certification/:id
 * @desc    Update certification
 * @access  Private
 */
router.put(
  '/certification/:id',
  validate(updateCertificationSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const { id } = req.params;
    const certification = await userService.updateCertification(id, userId, req.body);
    sendSuccess(res, { certification }, 'Certification updated successfully');
  })
);

/**
 * @route   DELETE /api/v1/profile/certification/:id
 * @desc    Delete certification
 * @access  Private
 */
router.delete(
  '/certification/:id',
  validate(deleteCertificationSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const { id } = req.params;
    await userService.deleteCertification(id, userId);
    sendSuccess(res, null, 'Certification deleted successfully');
  })
);

export default router;
