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
    id: z.string().min(1, 'Resume ID is required'),
  }),
  body: z.object({
    title: z.string().min(1).max(200).optional(),
    isPrimary: z.boolean().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const getResumeSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Resume ID is required'),
  }),
});

export const deleteResumeSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Resume ID is required'),
  }),
});

export const parseResumeSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Resume ID is required'),
  }),
});

// File upload validation constants
export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'application/json', // Allow JSON for tailored resumes
];

export const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.txt', '.json'];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Resume query filters
export const getResumesQuerySchema = z.object({
  query: z.object({
    page: z.union([z.string(), z.number()]).optional().transform((val) => val ? Number(val) : 1).pipe(z.number().int().min(1)),
    limit: z.union([z.string(), z.number()]).optional().transform((val) => val ? Number(val) : 10).pipe(z.number().int().min(1).max(100)),
    isPrimary: z.union([z.string(), z.boolean()]).optional().transform((val) => val === 'true' || val === true),
    isActive: z.union([z.string(), z.boolean()]).optional().transform((val) => val === 'true' || val === true),
  }).optional().default({}),
});

// Export types
export type CreateResumeInput = z.infer<typeof createResumeSchema>['body'];
export type UpdateResumeInput = z.infer<typeof updateResumeSchema>['body'];
export type GetResumesQuery = z.infer<typeof getResumesQuerySchema>['query'];
