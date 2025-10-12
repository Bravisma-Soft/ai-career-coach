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

export class InterviewService {
  /**
   * Create a new interview
   */
  async createInterview(
    userId: string,
    data: CreateInterviewInput
  ): Promise<Interview> {
    // Verify application exists and belongs to user
    const application = await prisma.application.findUnique({
      where: { id: data.applicationId },
      include: { job: true },
    });

    if (!application) {
      throw new NotFoundError('Application not found');
    }

    if (application.userId !== userId) {
      throw new ForbiddenError(
        'Not authorized to create interview for this application'
      );
    }

    const interview = await prisma.interview.create({
      data: {
        ...data,
        scheduledAt: new Date(data.scheduledAt),
      },
      include: {
        application: {
          include: {
            job: {
              select: {
                id: true,
                title: true,
                company: true,
              },
            },
          },
        },
      },
    });

    logger.info(
      `Interview created: ${interview.id} for application: ${data.applicationId}`
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
      applicationId,
      upcoming,
      sortBy = 'scheduledAt',
      sortOrder = 'asc',
      startDate,
      endDate,
    } = query;

    // Build where clause
    const where: any = {
      application: {
        userId,
      },
    };

    if (type) {
      where.type = type;
    }

    if (outcome) {
      where.outcome = outcome;
    }

    if (applicationId) {
      where.applicationId = applicationId;
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
          application: {
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
        application: {
          include: {
            job: true,
            resume: {
              select: {
                id: true,
                title: true,
                fileName: true,
              },
            },
          },
        },
      },
    });

    if (!interview) {
      throw new NotFoundError('Interview not found');
    }

    if (interview.application.userId !== userId) {
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

    const updated = await prisma.interview.update({
      where: { id: interviewId },
      data: updateData,
      include: {
        application: {
          include: {
            job: {
              select: {
                id: true,
                title: true,
                company: true,
              },
            },
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
        application: {
          userId,
        },
        scheduledAt: {
          gte: new Date(),
        },
        outcome: 'PENDING',
      },
      orderBy: { scheduledAt: 'asc' },
      take: limit,
      include: {
        application: {
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
        application: {
          userId,
        },
        scheduledAt: {
          lt: new Date(),
        },
      },
      orderBy: { scheduledAt: 'desc' },
      take: limit,
      include: {
        application: {
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
        application: {
          userId,
        },
      },
      select: {
        type: true,
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
      typeCounts[interview.type] = (typeCounts[interview.type] || 0) + 1;

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
   * Get interviews by application ID
   */
  async getInterviewsByApplication(applicationId: string, userId: string) {
    // Verify application exists and belongs to user
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      throw new NotFoundError('Application not found');
    }

    if (application.userId !== userId) {
      throw new ForbiddenError('Not authorized to access this application');
    }

    const interviews = await prisma.interview.findMany({
      where: { applicationId },
      orderBy: { scheduledAt: 'asc' },
    });

    return interviews;
  }
}

// Export singleton instance
export const interviewService = new InterviewService();
