import { z } from 'zod';

// Interview validation
export const createInterviewSchema = z.object({
  body: z.object({
    applicationId: z.string().cuid(),
    type: z.enum([
      'PHONE_SCREEN',
      'VIDEO_CALL',
      'IN_PERSON',
      'TECHNICAL',
      'BEHAVIORAL',
      'PANEL',
      'FINAL',
      'OTHER'
    ]),
    scheduledAt: z.string().datetime(),
    duration: z.number().int().min(0).optional(), // in minutes
    location: z.string().max(500).optional(),
    meetingUrl: z.string().url().optional().or(z.literal('')),
    interviewers: z.array(z.object({
      name: z.string().max(200),
      title: z.string().max(200).optional(),
      email: z.string().email().optional(),
    })).optional(),
    notes: z.string().max(5000).optional(),
    preparationNotes: z.string().max(5000).optional(),
    feedback: z.string().max(5000).optional(),
    outcome: z.enum([
      'PENDING',
      'PASSED',
      'FAILED',
      'CANCELLED',
      'RESCHEDULED',
      'NO_SHOW'
    ]).default('PENDING').optional(),
    round: z.number().int().min(1).optional(),
  }),
});

export const updateInterviewSchema = z.object({
  params: z.object({
    id: z.string().cuid(),
  }),
  body: z.object({
    type: z.enum([
      'PHONE_SCREEN',
      'VIDEO_CALL',
      'IN_PERSON',
      'TECHNICAL',
      'BEHAVIORAL',
      'PANEL',
      'FINAL',
      'OTHER'
    ]).optional(),
    scheduledAt: z.string().datetime().optional(),
    duration: z.number().int().min(0).optional(),
    location: z.string().max(500).optional(),
    meetingUrl: z.string().url().optional().or(z.literal('')),
    interviewers: z.array(z.object({
      name: z.string().max(200),
      title: z.string().max(200).optional(),
      email: z.string().email().optional(),
    })).optional(),
    notes: z.string().max(5000).optional(),
    preparationNotes: z.string().max(5000).optional(),
    feedback: z.string().max(5000).optional(),
    outcome: z.enum([
      'PENDING',
      'PASSED',
      'FAILED',
      'CANCELLED',
      'RESCHEDULED',
      'NO_SHOW'
    ]).optional(),
    round: z.number().int().min(1).optional(),
  }),
});

export const getInterviewSchema = z.object({
  params: z.object({
    id: z.string().cuid(),
  }),
});

export const deleteInterviewSchema = z.object({
  params: z.object({
    id: z.string().cuid(),
  }),
});

export const getInterviewsQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).default(10).optional(),
    type: z.enum([
      'PHONE_SCREEN',
      'VIDEO_CALL',
      'IN_PERSON',
      'TECHNICAL',
      'BEHAVIORAL',
      'PANEL',
      'FINAL',
      'OTHER'
    ]).optional(),
    outcome: z.enum([
      'PENDING',
      'PASSED',
      'FAILED',
      'CANCELLED',
      'RESCHEDULED',
      'NO_SHOW'
    ]).optional(),
    applicationId: z.string().cuid().optional(),
    upcoming: z.coerce.boolean().optional(),
    sortBy: z.enum(['createdAt', 'updatedAt', 'scheduledAt']).default('scheduledAt').optional(),
    sortOrder: z.enum(['asc', 'desc']).default('asc').optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
  }),
});

// Export types
export type CreateInterviewInput = z.infer<typeof createInterviewSchema>['body'];
export type UpdateInterviewInput = z.infer<typeof updateInterviewSchema>['body'];
export type GetInterviewsQuery = z.infer<typeof getInterviewsQuerySchema>['query'];
