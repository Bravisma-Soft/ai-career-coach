import { z } from 'zod';

// Parse job URL schema
export const parseJobUrlSchema = z.object({
  body: z.object({
    url: z.string().url('Invalid URL format').min(1, 'URL is required'),
  }),
});

// Job validation
export const createJobSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200),
    company: z.string().min(1).max(200),
    location: z.string().max(255).optional(),
    workMode: z.enum(['REMOTE', 'HYBRID', 'ONSITE']).optional(),
    jobType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'TEMPORARY']).optional(),
    salaryMin: z.number().int().min(0).optional(),
    salaryMax: z.number().int().min(0).optional(),
    salaryCurrency: z.string().max(10).default('USD').optional(),
    description: z.string().max(10000).optional(),
    requirements: z.array(z.string()).optional(),
    responsibilities: z.array(z.string()).optional(),
    benefits: z.array(z.string()).optional(),
    url: z.string().url().optional().or(z.literal('')),
    sourceUrl: z.string().url().optional().or(z.literal('')),
    postedDate: z.string().datetime().optional(),
    appliedAt: z.string().datetime().optional(),
    deadline: z.string().datetime().optional(),
    contactName: z.string().max(200).optional(),
    contactEmail: z.string().email().optional(),
    contactPhone: z.string().max(50).optional(),
    notes: z.string().max(5000).optional(),
    tags: z.array(z.string()).optional(),
    priority: z.number().int().min(1).max(5).default(3).optional(),
    status: z.enum([
      'INTERESTED',
      'APPLIED',
      'INTERVIEW_SCHEDULED',
      'INTERVIEW_COMPLETED',
      'OFFER_RECEIVED',
      'ACCEPTED',
      'REJECTED',
      'WITHDRAWN'
    ]).default('INTERESTED').optional(),
  }),
});

export const updateJobSchema = z.object({
  params: z.object({
    id: z.string().cuid(),
  }),
  body: z.object({
    title: z.string().min(1).max(200).optional(),
    company: z.string().min(1).max(200).optional(),
    location: z.string().max(255).optional(),
    workMode: z.enum(['REMOTE', 'HYBRID', 'ONSITE']).optional(),
    jobType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'TEMPORARY']).optional(),
    salaryMin: z.number().int().min(0).optional(),
    salaryMax: z.number().int().min(0).optional(),
    salaryCurrency: z.string().max(10).optional(),
    description: z.string().max(10000).optional(),
    requirements: z.array(z.string()).optional(),
    responsibilities: z.array(z.string()).optional(),
    benefits: z.array(z.string()).optional(),
    url: z.string().url().optional().or(z.literal('')),
    sourceUrl: z.string().url().optional().or(z.literal('')),
    postedDate: z.string().datetime().optional(),
    appliedAt: z.string().datetime().optional(),
    deadline: z.string().datetime().optional(),
    contactName: z.string().max(200).optional(),
    contactEmail: z.string().email().optional(),
    contactPhone: z.string().max(50).optional(),
    notes: z.string().max(5000).optional(),
    tags: z.array(z.string()).optional(),
    priority: z.number().int().min(1).max(5).optional(),
    status: z.enum([
      'INTERESTED',
      'APPLIED',
      'INTERVIEW_SCHEDULED',
      'INTERVIEW_COMPLETED',
      'OFFER_RECEIVED',
      'ACCEPTED',
      'REJECTED',
      'WITHDRAWN'
    ]).optional(),
  }),
});

export const getJobSchema = z.object({
  params: z.object({
    id: z.string().cuid(),
  }),
});

export const deleteJobSchema = z.object({
  params: z.object({
    id: z.string().cuid(),
  }),
});

export const updateJobStatusSchema = z.object({
  params: z.object({
    id: z.string().cuid(),
  }),
  body: z.object({
    status: z.enum([
      'INTERESTED',
      'APPLIED',
      'INTERVIEW_SCHEDULED',
      'INTERVIEW_COMPLETED',
      'OFFER_RECEIVED',
      'ACCEPTED',
      'REJECTED',
      'WITHDRAWN'
    ]),
    reason: z.string().max(1000).optional(),
  }),
});

export const addJobNoteSchema = z.object({
  params: z.object({
    id: z.string().cuid(),
  }),
  body: z.object({
    note: z.string().min(1).max(5000),
  }),
});

export const getJobsQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).default(10).optional(),
    status: z.enum([
      'INTERESTED',
      'APPLIED',
      'INTERVIEW_SCHEDULED',
      'INTERVIEW_COMPLETED',
      'OFFER_RECEIVED',
      'ACCEPTED',
      'REJECTED',
      'WITHDRAWN'
    ]).optional(),
    company: z.string().optional(),
    workMode: z.enum(['REMOTE', 'HYBRID', 'ONSITE']).optional(),
    jobType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'TEMPORARY']).optional(),
    priority: z.coerce.number().int().min(1).max(5).optional(),
    search: z.string().optional(),
    sortBy: z.enum(['createdAt', 'updatedAt', 'company', 'title', 'priority', 'postedDate']).default('createdAt').optional(),
    sortOrder: z.enum(['asc', 'desc']).default('desc').optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
  }),
});

// Export types
export type CreateJobInput = z.infer<typeof createJobSchema>['body'];
export type UpdateJobInput = z.infer<typeof updateJobSchema>['body'];
export type UpdateJobStatusInput = z.infer<typeof updateJobStatusSchema>['body'];
export type AddJobNoteInput = z.infer<typeof addJobNoteSchema>['body'];
export type GetJobsQuery = z.infer<typeof getJobsQuerySchema>['query'];
