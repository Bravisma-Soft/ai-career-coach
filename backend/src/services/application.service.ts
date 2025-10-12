import { prisma } from '@/database/client';
import { logger } from '@/config/logger';
import {
  NotFoundError,
  ForbiddenError,
  BadRequestError,
} from '@/utils/ApiError';
import {
  CreateApplicationInput,
  UpdateApplicationInput,
  GetApplicationsQuery,
} from '@/api/validators/application.validator';
import { Application } from '@prisma/client';

export class ApplicationService {
  /**
   * Create a new application
   */
  async createApplication(
    userId: string,
    data: CreateApplicationInput
  ): Promise<Application> {
    // Verify job exists and belongs to user
    const job = await prisma.job.findUnique({
      where: { id: data.jobId },
    });

    if (!job) {
      throw new NotFoundError('Job not found');
    }

    if (job.userId !== userId) {
      throw new ForbiddenError('Not authorized to create application for this job');
    }

    // Verify resume exists and belongs to user if provided
    if (data.resumeId) {
      const resume = await prisma.resume.findUnique({
        where: { id: data.resumeId },
      });

      if (!resume) {
        throw new NotFoundError('Resume not found');
      }

      if (resume.userId !== userId) {
        throw new ForbiddenError('Not authorized to use this resume');
      }
    }

    // Parse dates if present
    const applicationData: any = { ...data };
    if (data.applicationDate) {
      applicationData.applicationDate = new Date(data.applicationDate);
    }
    if (data.followUpDate) {
      applicationData.followUpDate = new Date(data.followUpDate);
    }

    const application = await prisma.application.create({
      data: {
        userId,
        ...applicationData,
      },
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
    });

    logger.info(`Application created: ${application.id} for job: ${data.jobId}`);
    return application;
  }

  /**
   * Get applications with filtering, sorting, and pagination
   */
  async getApplications(userId: string, query: GetApplicationsQuery) {
    const {
      page = 1,
      limit = 10,
      status,
      jobId,
      applicationMethod,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      startDate,
      endDate,
    } = query;

    // Build where clause
    const where: any = { userId };

    if (status) {
      where.status = status;
    }

    if (jobId) {
      where.jobId = jobId;
    }

    if (applicationMethod) {
      where.applicationMethod = applicationMethod;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    // Build order by
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
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
              status: true,
            },
          },
          resume: {
            select: {
              id: true,
              title: true,
              fileName: true,
            },
          },
          interviews: {
            orderBy: { scheduledAt: 'asc' },
            select: {
              id: true,
              type: true,
              scheduledAt: true,
              outcome: true,
            },
          },
          _count: {
            select: {
              interviews: true,
            },
          },
        },
      }),
      prisma.application.count({ where }),
    ]);

    return {
      applications,
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
   * Get application by ID
   */
  async getApplicationById(
    applicationId: string,
    userId: string
  ): Promise<Application> {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        job: true,
        resume: {
          select: {
            id: true,
            title: true,
            fileName: true,
            fileUrl: true,
          },
        },
        interviews: {
          orderBy: { scheduledAt: 'asc' },
        },
      },
    });

    if (!application) {
      throw new NotFoundError('Application not found');
    }

    if (application.userId !== userId) {
      throw new ForbiddenError('Not authorized to access this application');
    }

    return application;
  }

  /**
   * Update application
   */
  async updateApplication(
    applicationId: string,
    userId: string,
    data: UpdateApplicationInput
  ): Promise<Application> {
    // Verify ownership
    await this.getApplicationById(applicationId, userId);

    // Verify resume exists and belongs to user if provided
    if (data.resumeId) {
      const resume = await prisma.resume.findUnique({
        where: { id: data.resumeId },
      });

      if (!resume) {
        throw new NotFoundError('Resume not found');
      }

      if (resume.userId !== userId) {
        throw new ForbiddenError('Not authorized to use this resume');
      }
    }

    // Parse dates if present
    const updateData: any = { ...data };
    if (data.applicationDate) {
      updateData.applicationDate = new Date(data.applicationDate);
    }
    if (data.followUpDate !== undefined) {
      updateData.followUpDate = data.followUpDate
        ? new Date(data.followUpDate)
        : null;
    }

    const updated = await prisma.application.update({
      where: { id: applicationId },
      data: updateData,
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
    });

    logger.info(`Application updated: ${applicationId}`);
    return updated;
  }

  /**
   * Delete application
   */
  async deleteApplication(applicationId: string, userId: string): Promise<void> {
    // Verify ownership
    const application = await this.getApplicationById(applicationId, userId);

    // Check for related interviews
    const interviewCount = await prisma.interview.count({
      where: { applicationId },
    });

    if (interviewCount > 0) {
      logger.warn(
        `Deleting application ${applicationId} with ${interviewCount} associated interview(s)`
      );
    }

    // Delete application (cascade will handle related records)
    await prisma.application.delete({
      where: { id: applicationId },
    });

    logger.info(`Application deleted: ${applicationId}`);
  }

  /**
   * Get applications by job ID
   */
  async getApplicationsByJob(jobId: string, userId: string) {
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

    const applications = await prisma.application.findMany({
      where: { jobId, userId },
      orderBy: { createdAt: 'desc' },
      include: {
        resume: {
          select: {
            id: true,
            title: true,
            fileName: true,
          },
        },
        interviews: {
          orderBy: { scheduledAt: 'asc' },
        },
        _count: {
          select: {
            interviews: true,
          },
        },
      },
    });

    return applications;
  }

  /**
   * Get application statistics
   */
  async getApplicationStats(userId: string) {
    const applications = await prisma.application.findMany({
      where: { userId },
      select: {
        status: true,
        applicationMethod: true,
        createdAt: true,
      },
    });

    const statusCounts: Record<string, number> = {};
    const methodCounts: Record<string, number> = {};
    let totalApplications = 0;

    applications.forEach((app) => {
      totalApplications++;

      // Count by status
      statusCounts[app.status] = (statusCounts[app.status] || 0) + 1;

      // Count by method
      if (app.applicationMethod) {
        methodCounts[app.applicationMethod] =
          (methodCounts[app.applicationMethod] || 0) + 1;
      }
    });

    // Calculate applications submitted this month
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const applicationsThisMonth = applications.filter(
      (app) => app.createdAt >= thisMonth
    ).length;

    return {
      total: totalApplications,
      byStatus: statusCounts,
      byMethod: methodCounts,
      submittedThisMonth: applicationsThisMonth,
    };
  }
}

// Export singleton instance
export const applicationService = new ApplicationService();
