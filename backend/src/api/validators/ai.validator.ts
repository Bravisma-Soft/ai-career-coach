import { z } from 'zod';

// =====================================
// RESUME TAILORING
// =====================================

export const tailorResumeSchema = z.object({
  body: z.object({
    resumeId: z.string().cuid('Invalid resume ID format'),
    jobId: z.string().cuid('Invalid job ID format'),
    focusAreas: z.array(z.string()).optional(),
  }),
});

export type TailorResumeInput = z.infer<typeof tailorResumeSchema>['body'];

// =====================================
// RESUME ANALYSIS
// =====================================

export const analyzeResumeSchema = z.object({
  body: z.object({
    resumeId: z.string().cuid('Invalid resume ID format'),
    targetRole: z.string().max(200).optional(),
    targetIndustry: z.string().max(200).optional(),
  }),
});

export type AnalyzeResumeInput = z.infer<typeof analyzeResumeSchema>['body'];

// =====================================
// COVER LETTER GENERATION
// =====================================

export const generateCoverLetterSchema = z.object({
  body: z.object({
    resumeId: z.string().cuid('Invalid resume ID format'),
    jobId: z.string().cuid('Invalid job ID format'),
    tone: z.enum(['professional', 'enthusiastic', 'formal', 'conversational']).default('professional').optional(),
    length: z.enum(['short', 'medium', 'long']).default('medium').optional(),
    focusPoints: z.array(z.string()).max(5, 'Maximum 5 focus points allowed').optional(),
    notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
  }),
});

export type GenerateCoverLetterInput = z.infer<typeof generateCoverLetterSchema>['body'];

// =====================================
// MOCK INTERVIEW
// =====================================

export const startMockInterviewSchema = z.object({
  body: z.object({
    jobId: z.string().cuid('Invalid job ID format'),
    interviewType: z.enum(['behavioral', 'technical', 'mixed']),
    difficulty: z.enum(['entry', 'mid', 'senior']).default('mid').optional(),
    numberOfQuestions: z.number().int().min(3).max(20).default(10).optional(),
    focusAreas: z.array(z.string()).max(5).optional(),
  }),
});

export type StartMockInterviewInput = z.infer<typeof startMockInterviewSchema>['body'];

export const respondToInterviewSchema = z.object({
  params: z.object({
    sessionId: z.string().cuid('Invalid session ID format'),
  }),
  body: z.object({
    answer: z.string().min(10, 'Answer must be at least 10 characters').max(5000, 'Answer too long'),
  }),
});

export type RespondToInterviewInput = z.infer<typeof respondToInterviewSchema>['body'];

export const endMockInterviewSchema = z.object({
  params: z.object({
    sessionId: z.string().cuid('Invalid session ID format'),
  }),
});

// =====================================
// INTERVIEW PREPARATION
// =====================================

export const prepareInterviewSchema = z.object({
  body: z.object({
    jobId: z.string().cuid('Invalid job ID format'),
    resumeId: z.string().cuid('Invalid resume ID format').optional(),
    focusAreas: z.array(z.string()).max(5).optional(),
  }),
});

export type PrepareInterviewInput = z.infer<typeof prepareInterviewSchema>['body'];

// =====================================
// JOB MATCHING
// =====================================

export const matchJobsSchema = z.object({
  body: z.object({
    resumeId: z.string().cuid('Invalid resume ID format').optional(),
    targetRole: z.string().max(200).optional(),
    targetIndustry: z.string().max(200).optional(),
    minMatchScore: z.number().min(0).max(100).default(50).optional(),
    limit: z.number().int().min(1).max(50).default(10).optional(),
  }),
});

export type MatchJobsInput = z.infer<typeof matchJobsSchema>['body'];

// =====================================
// JOB ANALYSIS
// =====================================

export const analyzeJobSchema = z.object({
  body: z.object({
    jobId: z.string().cuid('Invalid job ID format'),
    resumeId: z.string().cuid('Invalid resume ID format').optional(),
  }),
});

export type AnalyzeJobInput = z.infer<typeof analyzeJobSchema>['body'];

// =====================================
// COMPANY RESEARCH
// =====================================

export const researchCompanySchema = z.object({
  body: z.object({
    companyName: z.string().min(1).max(200),
    jobId: z.string().cuid('Invalid job ID format').optional(),
  }),
});

export type ResearchCompanyInput = z.infer<typeof researchCompanySchema>['body'];

// =====================================
// INTERVIEWER RESEARCH
// =====================================

export const researchInterviewerSchema = z.object({
  body: z.object({
    interviewerId: z.string().cuid('Invalid interviewer ID format'),
    interviewerName: z.string().max(200).optional(),
    linkedinUrl: z.string().url('Invalid LinkedIn URL').optional(),
    companyName: z.string().max(200).optional(),
  }),
});

export type ResearchInterviewerInput = z.infer<typeof researchInterviewerSchema>['body'];
