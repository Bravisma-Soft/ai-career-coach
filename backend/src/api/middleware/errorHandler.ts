import { Request, Response, NextFunction } from 'express';
import { ApiError } from '@/utils/ApiError';
import { logger } from '@/config/logger';
import { env } from '@/config/env';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void => {
  let error = err;

  // Convert non-ApiError errors to ApiError
  if (!(error instanceof ApiError)) {
    if (error instanceof ZodError) {
      const statusCode = 400;
      const message = 'Validation Error';
      const errors = error.errors?.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })) || [];

      logger.error('Validation error:', { errors });

      res.status(statusCode).json({
        success: false,
        error: message,
        message,
        statusCode,
        errors,
        timestamp: new Date().toISOString(),
        path: req.url,
      });
      return;
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle Prisma errors
      let statusCode = 500;
      let message = 'Database error';

      switch (error.code) {
        case 'P2002':
          statusCode = 409;
          message = 'Unique constraint violation';
          break;
        case 'P2025':
          statusCode = 404;
          message = 'Record not found';
          break;
        case 'P2003':
          statusCode = 400;
          message = 'Foreign key constraint violation';
          break;
        default:
          message = error.message;
      }

      error = new ApiError(statusCode, message);
    } else {
      const statusCode = 500;
      const message = error.message || 'Internal Server Error';
      error = new ApiError(statusCode, message, false);
    }
  }

  const apiError = error as ApiError;
  const statusCode = apiError.statusCode || 500;

  // Log error
  if (statusCode >= 500) {
    logger.error('Server error:', {
      message: apiError.message,
      stack: apiError.stack,
      url: req.url,
      method: req.method,
      ip: req.ip,
    });
  } else {
    logger.warn('Client error:', {
      message: apiError.message,
      url: req.url,
      method: req.method,
      ip: req.ip,
    });
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: apiError.message,
    message: apiError.message,
    statusCode,
    timestamp: new Date().toISOString(),
    path: req.url,
    ...(env.NODE_ENV === 'development' && { stack: apiError.stack }),
  });
};

export const notFoundHandler = (
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
    statusCode: 404,
    timestamp: new Date().toISOString(),
    path: req.url,
  });
};
