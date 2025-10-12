import { z } from 'zod';

// Password validation regex
// At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// Email validation using Zod's built-in email validation
const emailSchema = z.string().email('Invalid email format').toLowerCase();

// Password schema with strong requirements
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must not exceed 128 characters')
  .regex(
    passwordRegex,
    'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
  );

// Registration validation schema
export const registerSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: passwordSchema,
    firstName: z
      .string()
      .min(1, 'First name is required')
      .max(50, 'First name must not exceed 50 characters')
      .optional(),
    lastName: z
      .string()
      .min(1, 'Last name is required')
      .max(50, 'Last name must not exceed 50 characters')
      .optional(),
  }),
});

// Login validation schema
export const loginSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: z.string().min(1, 'Password is required'),
  }),
});

// Forgot password validation schema
export const forgotPasswordSchema = z.object({
  body: z.object({
    email: emailSchema,
  }),
});

// Reset password validation schema
export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Reset token is required'),
    newPassword: passwordSchema,
  }),
});

// Refresh token validation schema
export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
  }),
});

// Change password validation schema (for authenticated users)
export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
  }),
});

// Update profile validation schema
export const updateProfileSchema = z.object({
  body: z.object({
    firstName: z.string().min(1).max(50).optional(),
    lastName: z.string().min(1).max(50).optional(),
    email: emailSchema.optional(),
  }),
});

// Export types inferred from schemas
export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>['body'];
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>['body'];
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>['body'];
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>['body'];
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>['body'];
