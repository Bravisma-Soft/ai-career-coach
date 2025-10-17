import { prisma } from '@/database/client';
import { logger } from '@/config/logger';
import {
  NotFoundError,
  ForbiddenError,
  BadRequestError,
} from '@/utils/ApiError';
import { MockInterview } from '@prisma/client';
import { mockInterviewAgent } from '@/ai/agents/mock-interview.agent';
import { CreateMockInterviewInput, SubmitAnswerInput } from '@/api/validators/mock-interview.validator';

export class MockInterviewService {
  /**
   * Create a new mock interview session and generate questions
   */
  async createMockInterview(
    userId: string,
    data: CreateMockInterviewInput
  ): Promise<MockInterview> {
    // Verify interview exists and belongs to user
    const interview = await prisma.interview.findUnique({
      where: { id: data.interviewId },
      include: {
        job: true,
      },
    });

    if (!interview) {
      throw new NotFoundError('Interview not found');
    }

    if (interview.userId !== userId) {
      throw new ForbiddenError('Not authorized to access this interview');
    }

    try {
      // Generate questions using AI
      logger.info('Generating questions for mock interview', {
        interviewId: data.interviewId,
        difficulty: data.difficulty,
        numberOfQuestions: data.numberOfQuestions,
      });

      const generatedQuestions = await mockInterviewAgent.generateQuestions({
        jobTitle: interview.job.title,
        companyName: interview.job.company,
        jobDescription: interview.job.jobDescription || undefined,
        interviewType: interview.interviewType,
        difficulty: data.difficulty,
        numberOfQuestions: data.numberOfQuestions,
        interviewers: interview.interviewers as any, // JSON field
      });

      // Create mock interview session
      const mockInterview = await prisma.mockInterview.create({
        data: {
          userId,
          interviewId: data.interviewId,
          title: `Mock Interview - ${interview.job.company} ${interview.job.title}`,
          interviewType: interview.interviewType,
          targetRole: interview.job.title,
          targetCompany: interview.job.company,
          difficulty: data.difficulty,
          totalQuestions: generatedQuestions.questions.length,
          completedQuestions: 0,
          conversationHistory: {
            questions: generatedQuestions.questions,
            interviewContext: generatedQuestions.interviewContext,
            tips: generatedQuestions.tips,
            answers: [], // Will be populated as user answers
          },
          isCompleted: false,
          aiSuggestions: [],
          strengths: [],
          areasToImprove: [],
        },
      });

      logger.info('Mock interview session created', {
        id: mockInterview.id,
        interviewId: data.interviewId,
        questionsGenerated: generatedQuestions.questions.length,
      });

      return mockInterview;
    } catch (error: any) {
      logger.error('Failed to create mock interview', {
        error: error.message,
        interviewId: data.interviewId,
      });
      throw new Error(`Failed to create mock interview: ${error.message}`);
    }
  }

  /**
   * Submit an answer and get AI evaluation
   */
  async submitAnswer(
    sessionId: string,
    userId: string,
    data: SubmitAnswerInput
  ) {
    // Get mock interview session
    const session = await prisma.mockInterview.findUnique({
      where: { id: sessionId },
      include: {
        interview: {
          include: {
            job: true,
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundError('Mock interview session not found');
    }

    if (session.userId !== userId) {
      throw new ForbiddenError('Not authorized to access this session');
    }

    if (session.isCompleted) {
      throw new BadRequestError('This mock interview session is already completed');
    }

    // Get conversation history
    const history = session.conversationHistory as any;
    const questions = history.questions || [];
    const answers = history.answers || [];

    // Find the question
    const question = questions.find((q: any) => q.id === data.questionId);
    if (!question) {
      throw new NotFoundError('Question not found in this session');
    }

    // Check if already answered
    const existingAnswer = answers.find((a: any) => a.questionId === data.questionId);
    if (existingAnswer) {
      throw new BadRequestError('This question has already been answered');
    }

    try {
      // Evaluate answer using AI
      logger.info('Evaluating answer', {
        sessionId,
        questionId: data.questionId,
        answerLength: data.answer.length,
      });

      if (!session.interview || !session.interview.job) {
        throw new Error('Interview or job not found');
      }

      const evaluation = await mockInterviewAgent.evaluateAnswer({
        question: question.question,
        questionCategory: question.category,
        keyPointsToInclude: question.keyPointsToInclude,
        evaluationCriteria: question.evaluationCriteria,
        userAnswer: data.answer,
        jobContext: {
          title: session.interview.job.title,
          company: session.interview.job.company,
        },
      });

      // Save answer and evaluation
      const updatedAnswers = [
        ...answers,
        {
          questionId: data.questionId,
          question: question.question,
          category: question.category,
          answer: data.answer,
          evaluation: {
            score: evaluation.score,
            strengths: evaluation.strengths,
            improvements: evaluation.improvements,
            keyPointsCovered: evaluation.keyPointsCovered,
            keyPointsMissed: evaluation.keyPointsMissed,
            exampleAnswer: evaluation.exampleAnswer,
            detailedFeedback: evaluation.detailedFeedback,
            nextSteps: evaluation.nextSteps,
          },
          submittedAt: new Date().toISOString(),
        },
      ];

      // Update session
      const updated = await prisma.mockInterview.update({
        where: { id: sessionId },
        data: {
          conversationHistory: {
            ...history,
            answers: updatedAnswers,
          },
          completedQuestions: updatedAnswers.length,
        },
        include: {
          interview: {
            include: {
              job: true,
            },
          },
        },
      });

      logger.info('Answer submitted and evaluated', {
        sessionId,
        questionId: data.questionId,
        score: evaluation.score,
        completedQuestions: updated.completedQuestions,
        totalQuestions: updated.totalQuestions,
      });

      return {
        session: updated,
        evaluation,
      };
    } catch (error: any) {
      logger.error('Failed to submit answer', {
        error: error.message,
        sessionId,
      });
      throw new Error(`Failed to submit answer: ${error.message}`);
    }
  }

  /**
   * Complete mock interview session and generate final analysis
   */
  async completeMockInterview(sessionId: string, userId: string): Promise<MockInterview> {
    // Get mock interview session
    const session = await prisma.mockInterview.findUnique({
      where: { id: sessionId },
      include: {
        interview: {
          include: {
            job: true,
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundError('Mock interview session not found');
    }

    if (session.userId !== userId) {
      throw new ForbiddenError('Not authorized to access this session');
    }

    // If already completed, return the cached results
    if (session.isCompleted) {
      logger.info('Returning cached results for completed session', { sessionId });
      return session;
    }

    const history = session.conversationHistory as any;
    const answers = history.answers || [];

    if (answers.length === 0) {
      throw new BadRequestError('Cannot complete session without any answers');
    }

    try {
      // Analyze session using AI
      logger.info('Analyzing completed mock interview session', {
        sessionId,
        answersCount: answers.length,
      });

      if (!session.interview || !session.interview.job) {
        throw new Error('Interview or job not found');
      }

      const analysis = await mockInterviewAgent.analyzeSession({
        interviewType: session.interviewType,
        questionsAndAnswers: answers.map((a: any) => ({
          question: a.question,
          category: a.category,
          answer: a.answer,
          evaluation: {
            score: a.evaluation.score,
            strengths: a.evaluation.strengths,
            improvements: a.evaluation.improvements,
          },
        })),
        jobContext: {
          title: session.interview.job.title,
          company: session.interview.job.company,
        },
      });

      // Calculate duration
      const startTime = new Date(session.startedAt);
      const endTime = new Date();
      const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / 1000 / 60);

      // Update session with final analysis
      const completed = await prisma.mockInterview.update({
        where: { id: sessionId },
        data: {
          isCompleted: true,
          completedAt: endTime,
          duration: durationMinutes,
          overallScore: analysis.overallScore,
          technicalScore: analysis.technicalScore,
          communicationScore: analysis.communicationScore,
          problemSolvingScore: analysis.problemSolvingScore,
          strengths: analysis.strengths,
          areasToImprove: analysis.areasToImprove,
          aiSuggestions: analysis.recommendations,
          aiAnalysis: {
            detailedAnalysis: analysis.detailedAnalysis,
            readinessLevel: analysis.readinessLevel,
          },
        },
        include: {
          interview: {
            include: {
              job: true,
            },
          },
        },
      });

      logger.info('Mock interview session completed', {
        sessionId,
        overallScore: analysis.overallScore,
        readinessLevel: analysis.readinessLevel,
        duration: durationMinutes,
      });

      return completed;
    } catch (error: any) {
      logger.error('Failed to complete mock interview', {
        error: error.message,
        sessionId,
      });
      throw new Error(`Failed to complete mock interview: ${error.message}`);
    }
  }

  /**
   * Get mock interview by ID
   */
  async getMockInterviewById(id: string, userId: string): Promise<MockInterview> {
    const mockInterview = await prisma.mockInterview.findUnique({
      where: { id },
      include: {
        interview: {
          include: {
            job: true,
          },
        },
      },
    });

    if (!mockInterview) {
      throw new NotFoundError('Mock interview not found');
    }

    if (mockInterview.userId !== userId) {
      throw new ForbiddenError('Not authorized to access this mock interview');
    }

    return mockInterview;
  }

  /**
   * Get all mock interviews for a scheduled interview
   */
  async getMockInterviewsByInterview(
    interviewId: string,
    userId: string
  ): Promise<MockInterview[]> {
    // Verify interview exists and belongs to user
    const interview = await prisma.interview.findUnique({
      where: { id: interviewId },
    });

    if (!interview) {
      throw new NotFoundError('Interview not found');
    }

    if (interview.userId !== userId) {
      throw new ForbiddenError('Not authorized to access this interview');
    }

    const mockInterviews = await prisma.mockInterview.findMany({
      where: { interviewId },
      orderBy: { createdAt: 'desc' },
    });

    return mockInterviews;
  }

  /**
   * Delete mock interview
   */
  async deleteMockInterview(id: string, userId: string): Promise<void> {
    // Verify ownership
    await this.getMockInterviewById(id, userId);

    await prisma.mockInterview.delete({
      where: { id },
    });

    logger.info('Mock interview deleted', { id });
  }
}

// Export singleton instance
export const mockInterviewService = new MockInterviewService();
