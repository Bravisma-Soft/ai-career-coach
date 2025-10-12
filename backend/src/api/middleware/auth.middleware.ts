import { Request, Response, NextFunction } from 'express';
import { authService } from '@/services/auth.service';
import { UnauthorizedError, ForbiddenError } from '@/utils/ApiError';
import { logger } from '@/config/logger';
import { UserRole } from '@prisma/client';

/**
 * Extract token from Authorization header
 */
const extractTokenFromHeader = (req: Request): string | null => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return null;
  }

  // Expected format: "Bearer <token>"
  const parts = authHeader.split(' ');

  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1] || null;
};

/**
 * Auth middleware - Verify JWT and attach user to request
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract token from header
    const token = extractTokenFromHeader(req);

    if (!token) {
      throw new UnauthorizedError('No authentication token provided');
    }

    // Verify token
    const payload = authService.verifyAccessToken(token);

    // Get user from database
    const user = await authService.getUserById(payload.userId);

    // Check if user is active
    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedError('Account is not active');
    }

    // Attach user to request
    req.user = user;
    req.userId = user.id;

    logger.debug(`Authenticated user: ${user.email}`);

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Optional auth middleware - Attach user if token is valid, but don't fail if missing
 */
export const authenticateOptional = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractTokenFromHeader(req);

    if (token) {
      try {
        const payload = authService.verifyAccessToken(token);
        const user = await authService.getUserById(payload.userId);

        if (user.status === 'ACTIVE') {
          req.user = user;
          req.userId = user.id;
        }
      } catch (error) {
        // Silently fail for optional auth
        logger.debug('Optional auth failed, continuing without user');
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Role-based authorization middleware
 */
export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    if (!allowedRoles.includes(req.user.role as UserRole)) {
      logger.warn(
        `Unauthorized access attempt by user ${req.user.email} with role ${req.user.role}`
      );
      throw new ForbiddenError('Insufficient permissions');
    }

    next();
  };
};

/**
 * Admin-only middleware
 */
export const requireAdmin = authorize('ADMIN');

/**
 * Verify email middleware - Check if user's email is verified
 */
export const requireEmailVerified = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    throw new UnauthorizedError('Authentication required');
  }

  if (!req.user.emailVerified) {
    throw new ForbiddenError('Email verification required');
  }

  next();
};

/**
 * Check if authenticated user owns the resource
 */
export const requireOwnership = (userIdParam = 'userId') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    const resourceUserId = req.params[userIdParam] || req.body[userIdParam];

    if (!resourceUserId) {
      throw new ForbiddenError('Resource owner not specified');
    }

    // Admins can access any resource
    if (req.user.role === 'ADMIN') {
      next();
      return;
    }

    // Check ownership
    if (req.user.id !== resourceUserId) {
      logger.warn(
        `Ownership check failed: User ${req.user.id} tried to access resource owned by ${resourceUserId}`
      );
      throw new ForbiddenError('You do not have permission to access this resource');
    }

    next();
  };
};

/**
 * Rate limit check for sensitive operations
 * This is a placeholder - actual rate limiting is handled by express-rate-limit
 */
export const rateLimitCheck = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // The actual rate limiting is done by the authLimiter middleware
  // This is just a placeholder for additional custom checks if needed
  next();
};
