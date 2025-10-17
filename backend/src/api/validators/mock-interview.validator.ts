import { z } from 'zod';

// Create mock interview session
export const createMockInterviewSchema = z.object({
  body: z.object({
    interviewId: z.string().cuid('Invalid interview ID'),
    difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
    numberOfQuestions: z.number().int().min(1).max(20).default(5),
  }),
});

// Get mock interview by ID
export const getMockInterviewSchema = z.object({
  params: z.object({
    id: z.string().cuid('Invalid mock interview ID'),
  }),
});

// Submit answer to question
export const submitAnswerSchema = z.object({
  params: z.object({
    sessionId: z.string().cuid('Invalid session ID'),
  }),
  body: z.object({
    questionId: z.string().min(1, 'Question ID is required'),
    answer: z.string().min(10, 'Answer must be at least 10 characters'),
  }),
});

// Complete mock interview session
export const completeMockInterviewSchema = z.object({
  params: z.object({
    sessionId: z.string().cuid('Invalid session ID'),
  }),
});

// Get mock interviews by interview ID
export const getMockInterviewsByInterviewSchema = z.object({
  params: z.object({
    interviewId: z.string().cuid('Invalid interview ID'),
  }),
});

// Delete mock interview
export const deleteMockInterviewSchema = z.object({
  params: z.object({
    id: z.string().cuid('Invalid mock interview ID'),
  }),
});

// Export types
export type CreateMockInterviewInput = z.infer<typeof createMockInterviewSchema>['body'];
export type SubmitAnswerInput = z.infer<typeof submitAnswerSchema>['body'];
