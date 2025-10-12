import { z } from 'zod';

// Resume validation
export const createResumeSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200),
    isPrimary: z.boolean().default(false).optional(),
  }),
});

export const updateResumeSchema = z.object({
  params: z.object({
    id: z.string().cuid(),
  }),
  body: z.object({
    title: z.string().min(1).max(200).optional(),
    isPrimary: z.boolean().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const getResumeSchema = z.object({
  params: z.object({
    id: z.string().cuid(),
  }),
});

export const deleteResumeSchema = z.object({
  params: z.object({
    id: z.string().cuid(),
  }),
});

export const parseResumeSchema = z.object({
  params: z.object({
    id: z.string().cuid(),
  }),
});

// File upload validation constants
export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];

export const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.txt'];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Resume query filters
export const getResumesQuerySchema = z.object({
  query: z.object({
    page: z.string().transform(Number).pipe(z.number().int().min(1)).default('1'),
    limit: z.string().transform(Number).pipe(z.number().int().min(1).max(100)).default('10'),
    isPrimary: z.string().transform((val) => val === 'true').optional(),
    isActive: z.string().transform((val) => val === 'true').optional(),
  }),
});

// Export types
export type CreateResumeInput = z.infer<typeof createResumeSchema>['body'];
export type UpdateResumeInput = z.infer<typeof updateResumeSchema>['body'];
export type GetResumesQuery = z.infer<typeof getResumesQuerySchema>['query'];
