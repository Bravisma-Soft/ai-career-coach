import rateLimit from 'express-rate-limit';
import { env } from '@/config/env';

export const generalLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  message: {
    success: false,
    error: 'Too many requests',
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: env.RATE_LIMIT_AUTH_MAX,
  message: {
    success: false,
    error: 'Too many authentication attempts',
    message: 'Too many authentication attempts, please try again later.',
  },
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
});

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60,
  message: {
    success: false,
    error: 'Rate limit exceeded',
    message: 'Too many API requests, please slow down.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
