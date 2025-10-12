import { z } from 'zod';

// Application validation
export const createApplicationSchema = z.object({
  body: z.object({
    jobId: z.string().cuid(),
    resumeId: z.string().cuid().optional(),
    coverLetter: z.string().max(10000).optional(),
    applicationMethod: z.enum([
      'COMPANY_WEBSITE',
      'LINKEDIN',
      'EMAIL',
      'RECRUITMENT_AGENCY',
      'JOB_BOARD',
      'REFERRAL',
      'OTHER'
    ]).optional(),
    applicationUrl: z.string().url().optional().or(z.literal('')),
    applicationDate: z.string().datetime().optional(),
    followUpDate: z.string().datetime().optional(),
    contactPerson: z.string().max(200).optional(),
    contactEmail: z.string().email().optional(),
    contactPhone: z.string().max(50).optional(),
    referralName: z.string().max(200).optional(),
    referralEmail: z.string().email().optional(),
    notes: z.string().max(5000).optional(),
    documents: z.array(z.string()).optional(),
    status: z.enum([
      'DRAFT',
      'SUBMITTED',
      'UNDER_REVIEW',
      'SHORTLISTED',
      'INTERVIEWING',
      'OFFER',
      'ACCEPTED',
      'REJECTED',
      'WITHDRAWN'
    ]).default('DRAFT').optional(),
  }),
});

export const updateApplicationSchema = z.object({
  params: z.object({
    id: z.string().cuid(),
  }),
  body: z.object({
    resumeId: z.string().cuid().optional(),
    coverLetter: z.string().max(10000).optional(),
    applicationMethod: z.enum([
      'COMPANY_WEBSITE',
      'LINKEDIN',
      'EMAIL',
      'RECRUITMENT_AGENCY',
      'JOB_BOARD',
      'REFERRAL',
      'OTHER'
    ]).optional(),
    applicationUrl: z.string().url().optional().or(z.literal('')),
    applicationDate: z.string().datetime().optional(),
    followUpDate: z.string().datetime().optional(),
    contactPerson: z.string().max(200).optional(),
    contactEmail: z.string().email().optional(),
    contactPhone: z.string().max(50).optional(),
    referralName: z.string().max(200).optional(),
    referralEmail: z.string().email().optional(),
    notes: z.string().max(5000).optional(),
    documents: z.array(z.string()).optional(),
    status: z.enum([
      'DRAFT',
      'SUBMITTED',
      'UNDER_REVIEW',
      'SHORTLISTED',
      'INTERVIEWING',
      'OFFER',
      'ACCEPTED',
      'REJECTED',
      'WITHDRAWN'
    ]).optional(),
  }),
});

export const getApplicationSchema = z.object({
  params: z.object({
    id: z.string().cuid(),
  }),
});

export const deleteApplicationSchema = z.object({
  params: z.object({
    id: z.string().cuid(),
  }),
});

export const getApplicationsQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).default(10).optional(),
    status: z.enum([
      'DRAFT',
      'SUBMITTED',
      'UNDER_REVIEW',
      'SHORTLISTED',
      'INTERVIEWING',
      'OFFER',
      'ACCEPTED',
      'REJECTED',
      'WITHDRAWN'
    ]).optional(),
    jobId: z.string().cuid().optional(),
    applicationMethod: z.enum([
      'COMPANY_WEBSITE',
      'LINKEDIN',
      'EMAIL',
      'RECRUITMENT_AGENCY',
      'JOB_BOARD',
      'REFERRAL',
      'OTHER'
    ]).optional(),
    sortBy: z.enum(['createdAt', 'updatedAt', 'applicationDate']).default('createdAt').optional(),
    sortOrder: z.enum(['asc', 'desc']).default('desc').optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
  }),
});

// Export types
export type CreateApplicationInput = z.infer<typeof createApplicationSchema>['body'];
export type UpdateApplicationInput = z.infer<typeof updateApplicationSchema>['body'];
export type GetApplicationsQuery = z.infer<typeof getApplicationsQuerySchema>['query'];
