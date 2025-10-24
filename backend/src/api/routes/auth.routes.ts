import { Router, Request, Response } from 'express';
import { authService } from '@/services/auth.service';
import { asyncHandler } from '@/utils/asyncHandler';
import { sendSuccess } from '@/utils/response';
import { validate } from '@/api/middleware/validate';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  refreshTokenSchema,
} from '@/api/validators/auth.validator';
import { authenticate } from '@/api/middleware/auth.middleware';
import { authLimiter } from '@/api/middleware/rateLimiter';
import { logger } from '@/config/logger';
import { AuthResponse } from '@/types/auth.types';
import passport from '@/config/passport';
import { env } from '@/config/env';
import { User } from '@prisma/client';

const router = Router();

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post(
  '/register',
  authLimiter,
  validate(registerSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { email, password, firstName, lastName } = req.body;

    // Get client info
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip;

    // Register user
    const result = await authService.registerUser(
      { email, password, firstName, lastName },
      userAgent,
      ipAddress
    );

    // Create response
    const response: AuthResponse = {
      success: true,
      user: authService.toUserResponse(result.user),
      tokens: result.tokens,
      message: 'Registration successful',
    };

    logger.info(`User registered: ${email}`);

    sendSuccess(res, response, 'Registration successful', 201);
  })
);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post(
  '/login',
  authLimiter,
  validate(loginSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    // Get client info
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip;

    // Login user
    const result = await authService.loginUser(
      { email, password },
      userAgent,
      ipAddress
    );

    // Create response
    const response: AuthResponse = {
      success: true,
      user: authService.toUserResponse(result.user),
      tokens: result.tokens,
      message: 'Login successful',
    };

    logger.info(`User logged in: ${email}`);

    sendSuccess(res, response, 'Login successful');
  })
);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout user (invalidate current session)
 * @access  Private
 */
router.post(
  '/logout',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    // Extract session ID from refresh token if available
    const refreshToken = req.body.refreshToken;

    if (refreshToken) {
      try {
        const payload = authService.verifyRefreshToken(refreshToken);
        await authService.logout(payload.sessionId);
      } catch (error) {
        // If token is invalid, just continue
        logger.warn('Invalid refresh token during logout');
      }
    }

    logger.info(`User logged out: ${req.user?.email}`);

    sendSuccess(res, null, 'Logout successful');
  })
);

/**
 * @route   POST /api/v1/auth/logout-all
 * @desc    Logout from all devices
 * @access  Private
 */
router.post(
  '/logout-all',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.userId) {
      throw new Error('User ID not found');
    }

    await authService.logoutAll(req.userId);

    logger.info(`User logged out from all devices: ${req.user?.email}`);

    sendSuccess(res, null, 'Logged out from all devices');
  })
);

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post(
  '/refresh',
  validate(refreshTokenSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    // Refresh tokens
    const tokens = await authService.refreshAccessToken(refreshToken);

    logger.info('Access token refreshed');

    sendSuccess(
      res,
      {
        success: true,
        tokens,
      },
      'Token refreshed successfully'
    );
  })
);

/**
 * @route   POST /api/v1/auth/forgot-password
 * @desc    Request password reset
 * @access  Public
 */
router.post(
  '/forgot-password',
  authLimiter,
  validate(forgotPasswordSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;

    await authService.generatePasswordResetToken(email);

    logger.info(`Password reset requested for: ${email}`);

    // Always return success to prevent email enumeration
    sendSuccess(
      res,
      null,
      'If the email exists, a password reset link has been sent'
    );
  })
);

/**
 * @route   POST /api/v1/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 */
router.post(
  '/reset-password',
  authLimiter,
  validate(resetPasswordSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { token, newPassword } = req.body;

    await authService.resetPassword(token, newPassword);

    logger.info('Password reset successfully');

    sendSuccess(res, null, 'Password reset successful');
  })
);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get(
  '/me',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new Error('User not found in request');
    }

    const userResponse = authService.toUserResponse(req.user);

    sendSuccess(res, { user: userResponse }, 'User profile retrieved');
  })
);

/**
 * @route   GET /api/v1/auth/sessions
 * @desc    Get all active sessions
 * @access  Private
 */
router.get(
  '/sessions',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.userId) {
      throw new Error('User ID not found');
    }

    const sessions = await authService.getUserById(req.userId).then((user) =>
      prisma.session.findMany({
        where: { userId: user.id },
        select: {
          id: true,
          userAgent: true,
          ipAddress: true,
          expiresAt: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      })
    );

    sendSuccess(res, { sessions }, 'Sessions retrieved');
  })
);

/**
 * @route   DELETE /api/v1/auth/sessions/:sessionId
 * @desc    Delete a specific session
 * @access  Private
 */
router.delete(
  '/sessions/:sessionId',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { sessionId } = req.params;

    if (!req.userId) {
      throw new Error('User ID not found');
    }

    // Verify session belongs to user
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session || session.userId !== req.userId) {
      throw new Error('Session not found');
    }

    await authService.logout(sessionId);

    logger.info(`Session deleted: ${sessionId}`);

    sendSuccess(res, null, 'Session deleted');
  })
);

// Import prisma for sessions endpoints
import { prisma } from '@/database/client';

/**
 * @route   GET /api/v1/auth/google
 * @desc    Initiate Google OAuth flow
 * @access  Public
 */
router.get(
  '/google',
  (req: Request, res: Response, next) => {
    if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
      return res.status(501).json({
        success: false,
        message: 'Google OAuth is not configured on this server',
      });
    }
    passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
  }
);

/**
 * @route   GET /api/v1/auth/google/callback
 * @desc    Handle Google OAuth callback
 * @access  Public
 */
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login?error=oauth_failed' }),
  asyncHandler(async (req: Request, res: Response) => {
    // User is authenticated via Passport and attached to req.user
    const user = req.user as User;

    if (!user) {
      logger.error('OAuth callback: No user found after authentication');
      return res.redirect(`${env.FRONTEND_URL}/login?error=authentication_failed`);
    }

    // Get client info
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip;

    try {
      // Generate tokens for the authenticated user
      const tokens = await authService.generateTokensForOAuthUser(
        user.id,
        user.email,
        user.role,
        userAgent,
        ipAddress
      );

      // Create user response
      const userResponse = authService.toUserResponse(user);

      logger.info(`Google OAuth successful for user: ${user.email}`);

      // Redirect to frontend with tokens in URL params
      // Frontend will extract and store these tokens
      const redirectUrl = `${env.FRONTEND_URL}/auth/callback?` +
        `accessToken=${encodeURIComponent(tokens.accessToken)}&` +
        `refreshToken=${encodeURIComponent(tokens.refreshToken)}&` +
        `expiresIn=${tokens.expiresIn}&` +
        `userId=${user.id}&` +
        `email=${encodeURIComponent(user.email)}`;

      res.redirect(redirectUrl);
    } catch (error) {
      logger.error('Error generating tokens after OAuth:', error);
      res.redirect(`${env.FRONTEND_URL}/login?error=token_generation_failed`);
    }
  })
);

export default router;
