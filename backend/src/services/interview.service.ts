import { prisma } from '@/database/client';
import { logger } from '@/config/logger';
import {
  NotFoundError,
  ForbiddenError,
} from '@/utils/ApiError';
import {
  CreateInterviewInput,
  UpdateInterviewInput,
  GetInterviewsQuery,
} from '@/api/validators/interview.validator';
import { Interview } from '@prisma/client';
import { mockInterviewAgent } from '@/ai/agents/mock-interview.agent';

export class InterviewService {
  /**
   * Create a new interview
   */
  async createInterview(
    userId: string,
    data: CreateInterviewInput
  ): Promise<Interview> {
    // Verify job exists and belongs to user
    const job = await prisma.job.findUnique({
      where: { id: data.jobId },
    });

    if (!job) {
      throw new NotFoundError('Job not found');
    }

    if (job.userId !== userId) {
      throw new ForbiddenError(
        'Not authorized to create interview for this job'
      );
    }

    const interview = await prisma.interview.create({
      data: {
        userId,
        jobId: data.jobId,
        interviewType: data.type,
        scheduledAt: new Date(data.scheduledAt),
        duration: data.duration,
        location: data.location,
        meetingUrl: data.meetingUrl,
        interviewers: data.interviewers as any, // JSON field
        round: data.round,
        notes: data.notes,
        preparationNotes: data.preparationNotes,
        feedback: data.feedback,
        outcome: data.outcome || 'PENDING',
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            company: true,
          },
        },
      },
    });

    logger.info(
      `Interview created: ${interview.id} for job: ${data.jobId}`
    );
    return interview;
  }

  /**
   * Get interviews with filtering, sorting, and pagination
   */
  async getInterviews(userId: string, query: GetInterviewsQuery) {
    const {
      page = 1,
      limit = 10,
      type,
      outcome,
      jobId,
      upcoming,
      sortBy = 'scheduledAt',
      sortOrder = 'asc',
      startDate,
      endDate,
    } = query;

    // Build where clause
    const where: any = {
      userId,
    };

    if (type) {
      where.interviewType = type;
    }

    if (outcome) {
      where.outcome = outcome;
    }

    if (jobId) {
      where.jobId = jobId;
    }

    // Filter for upcoming interviews
    if (upcoming) {
      where.scheduledAt = {
        gte: new Date(),
      };
      where.outcome = 'PENDING';
    }

    if (startDate || endDate) {
      if (!where.scheduledAt) {
        where.scheduledAt = {};
      }
      if (startDate) {
        where.scheduledAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.scheduledAt.lte = new Date(endDate);
      }
    }

    // Build order by
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    const [interviews, total] = await Promise.all([
      prisma.interview.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy,
        include: {
          job: {
            select: {
              id: true,
              title: true,
              company: true,
              location: true,
            },
          },
          mockInterviews: {
            select: {
              id: true,
              overallScore: true,
              isCompleted: true,
              createdAt: true,
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      }),
      prisma.interview.count({ where }),
    ]);

    return {
      interviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrevious: page > 1,
      },
    };
  }

  /**
   * Get interview by ID
   */
  async getInterviewById(
    interviewId: string,
    userId: string
  ): Promise<Interview> {
    const interview = await prisma.interview.findUnique({
      where: { id: interviewId },
      include: {
        job: true,
        mockInterviews: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!interview) {
      throw new NotFoundError('Interview not found');
    }

    if (interview.userId !== userId) {
      throw new ForbiddenError('Not authorized to access this interview');
    }

    return interview;
  }

  /**
   * Update interview
   */
  async updateInterview(
    interviewId: string,
    userId: string,
    data: UpdateInterviewInput
  ): Promise<Interview> {
    // Verify ownership
    await this.getInterviewById(interviewId, userId);

    // Parse date if present
    const updateData: any = { ...data };
    if (data.scheduledAt) {
      updateData.scheduledAt = new Date(data.scheduledAt);
    }

    // Map 'type' to 'interviewType'
    if (data.type) {
      updateData.interviewType = data.type;
      delete updateData.type;
    }

    const updated = await prisma.interview.update({
      where: { id: interviewId },
      data: updateData,
      include: {
        job: {
          select: {
            id: true,
            title: true,
            company: true,
          },
        },
      },
    });

    logger.info(`Interview updated: ${interviewId}`);
    return updated;
  }

  /**
   * Delete interview
   */
  async deleteInterview(interviewId: string, userId: string): Promise<void> {
    // Verify ownership
    await this.getInterviewById(interviewId, userId);

    await prisma.interview.delete({
      where: { id: interviewId },
    });

    logger.info(`Interview deleted: ${interviewId}`);
  }

  /**
   * Get upcoming interviews for user
   */
  async getUpcomingInterviews(userId: string, limit: number = 10) {
    const interviews = await prisma.interview.findMany({
      where: {
        userId,
        scheduledAt: {
          gte: new Date(),
        },
        outcome: 'PENDING',
      },
      orderBy: { scheduledAt: 'asc' },
      take: limit,
      include: {
        job: {
          select: {
            id: true,
            title: true,
            company: true,
            location: true,
          },
        },
      },
    });

    return interviews;
  }

  /**
   * Get past interviews for user
   */
  async getPastInterviews(userId: string, limit: number = 10) {
    const interviews = await prisma.interview.findMany({
      where: {
        userId,
        scheduledAt: {
          lt: new Date(),
        },
      },
      orderBy: { scheduledAt: 'desc' },
      take: limit,
      include: {
        job: {
          select: {
            id: true,
            title: true,
            company: true,
            location: true,
          },
        },
      },
    });

    return interviews;
  }

  /**
   * Get interview statistics
   */
  async getInterviewStats(userId: string) {
    const interviews = await prisma.interview.findMany({
      where: {
        userId,
      },
      select: {
        interviewType: true,
        outcome: true,
        scheduledAt: true,
      },
    });

    const typeCounts: Record<string, number> = {};
    const outcomeCounts: Record<string, number> = {};
    let totalInterviews = 0;
    let upcomingCount = 0;

    const now = new Date();

    interviews.forEach((interview) => {
      totalInterviews++;

      // Count by type
      typeCounts[interview.interviewType] = (typeCounts[interview.interviewType] || 0) + 1;

      // Count by outcome
      outcomeCounts[interview.outcome] =
        (outcomeCounts[interview.outcome] || 0) + 1;

      // Count upcoming
      if (interview.scheduledAt >= now && interview.outcome === 'PENDING') {
        upcomingCount++;
      }
    });

    return {
      total: totalInterviews,
      upcoming: upcomingCount,
      byType: typeCounts,
      byOutcome: outcomeCounts,
    };
  }

  /**
   * Get interviews by job ID
   */
  async getInterviewsByJob(jobId: string, userId: string) {
    // Verify job exists and belongs to user
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new NotFoundError('Job not found');
    }

    if (job.userId !== userId) {
      throw new ForbiddenError('Not authorized to access this job');
    }

    const interviews = await prisma.interview.findMany({
      where: { jobId },
      orderBy: { scheduledAt: 'asc' },
      include: {
        mockInterviews: {
          select: {
            id: true,
            overallScore: true,
            isCompleted: true,
          },
        },
      },
    });

    return interviews;
  }

  /**
   * Prepare interview with AI-generated questions and interviewer research
   */
  async prepareInterview(interviewId: string, userId: string) {
    // Get interview with job and interviewer details
    const interview = await prisma.interview.findUnique({
      where: { id: interviewId },
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

    logger.info('Preparing interview with AI', {
      interviewId,
      jobTitle: interview.job.title,
      company: interview.job.company,
    });

    try {
      // Generate questions using AI based on job context and interviewer profile
      const generatedQuestions = await mockInterviewAgent.generateQuestions({
        jobTitle: interview.job.title,
        companyName: interview.job.company,
        jobDescription: interview.job.jobDescription || undefined,
        interviewType: interview.interviewType,
        difficulty: 'medium',
        numberOfQuestions: 10,
        interviewers: interview.interviewers as any,
      });

      // Extract just the question text for common questions
      const commonQuestions = generatedQuestions.questions.map((q) => q.question);

      // Generate questions to ask the interviewer (these are smart questions the candidate should ask)
      const questionsToAsk = generatedQuestions.tips || [
        'What does success look like in this role after 3-6 months?',
        'How does the team approach collaboration and communication?',
        'What are the biggest challenges the team is currently facing?',
        'What opportunities are there for growth and learning?',
        'How do you measure and evaluate performance in this role?',
      ];

      // Update interview with AI-generated content
      const updatedInterview = await prisma.interview.update({
        where: { id: interviewId },
        data: {
          aiQuestions: commonQuestions,
          aiQuestionsToAsk: questionsToAsk,
          aiInterviewerBackground: generatedQuestions.interviewContext,
        },
        include: {
          job: true,
        },
      });

      logger.info('Interview preparation completed', {
        interviewId,
        questionsGenerated: commonQuestions.length,
      });

      return {
        questions: commonQuestions,
        questionsToAsk,
        interviewerBackground: generatedQuestions.interviewContext,
        interviewContext: generatedQuestions.interviewContext,
      };
    } catch (error: any) {
      logger.error('Failed to prepare interview', {
        error: error.message,
        interviewId,
      });
      throw new Error(`Failed to prepare interview: ${error.message}`);
    }
  }
}

// Export singleton instance
export const interviewService = new InterviewService();
