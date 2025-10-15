import { prisma } from '@/database/client';
import { logger } from '@/config/logger';
import {
  NotFoundError,
  ForbiddenError,
  BadRequestError,
} from '@/utils/ApiError';
import {
  CreateJobInput,
  UpdateJobInput,
  UpdateJobStatusInput,
  AddJobNoteInput,
  GetJobsQuery,
} from '@/api/validators/job.validator';
import { Job, StatusChange, JobStatus } from '@prisma/client';

// Status transition rules - flexible for Kanban board
const VALID_STATUS_TRANSITIONS: Record<JobStatus, JobStatus[]> = {
  INTERESTED: ['APPLIED', 'INTERVIEW_SCHEDULED', 'INTERVIEW_COMPLETED', 'OFFER_RECEIVED', 'ACCEPTED', 'REJECTED', 'WITHDRAWN'],
  APPLIED: ['INTERESTED', 'INTERVIEW_SCHEDULED', 'INTERVIEW_COMPLETED', 'OFFER_RECEIVED', 'ACCEPTED', 'REJECTED', 'WITHDRAWN'],
  INTERVIEW_SCHEDULED: ['INTERESTED', 'APPLIED', 'INTERVIEW_COMPLETED', 'OFFER_RECEIVED', 'ACCEPTED', 'REJECTED', 'WITHDRAWN'],
  INTERVIEW_COMPLETED: ['INTERESTED', 'APPLIED', 'INTERVIEW_SCHEDULED', 'OFFER_RECEIVED', 'ACCEPTED', 'REJECTED', 'WITHDRAWN'],
  OFFER_RECEIVED: ['INTERESTED', 'APPLIED', 'INTERVIEW_SCHEDULED', 'INTERVIEW_COMPLETED', 'ACCEPTED', 'REJECTED', 'WITHDRAWN'],
  ACCEPTED: ['INTERESTED', 'APPLIED', 'INTERVIEW_SCHEDULED', 'INTERVIEW_COMPLETED', 'OFFER_RECEIVED', 'REJECTED', 'WITHDRAWN'],
  REJECTED: ['INTERESTED', 'APPLIED', 'INTERVIEW_SCHEDULED', 'INTERVIEW_COMPLETED', 'OFFER_RECEIVED', 'ACCEPTED', 'WITHDRAWN'],
  WITHDRAWN: ['INTERESTED', 'APPLIED', 'INTERVIEW_SCHEDULED', 'INTERVIEW_COMPLETED', 'OFFER_RECEIVED', 'ACCEPTED', 'REJECTED'],
};

export class JobService {
  /**
   * Create a new job
   */
  async createJob(userId: string, data: CreateJobInput): Promise<Job> {
    // Parse dates and map field names for Prisma
    const jobData: any = {};

    // Copy all fields and map to Prisma field names
    Object.keys(data).forEach(key => {
      const value = (data as any)[key];

      // Skip undefined values
      if (value === undefined) {
        return;
      }

      // Map validator field names to Prisma field names
      if (key === 'description') {
        jobData.jobDescription = value;
      } else if (key === 'url') {
        jobData.jobUrl = value;
      } else if (key === 'sourceUrl') {
        jobData.source = value;
      } else if (key === 'deadline') {
        jobData.applicationDeadline = value ? new Date(value) : value;
      } else if (key === 'postedDate') {
        jobData.postedDate = new Date(value);
      } else if (key === 'appliedAt') {
        jobData.appliedAt = new Date(value);
      } else {
        // Keep other fields as-is
        jobData[key] = value;
      }
    });

    const job = await prisma.job.create({
      data: {
        userId,
        ...jobData,
      },
    });

    // Create initial status change record
    if (data.status) {
      await prisma.statusChange.create({
        data: {
          jobId: job.id,
          fromStatus: null,
          toStatus: data.status,
          reason: 'Job created',
        },
      });
    }

    logger.info(`Job created: ${job.id} by user: ${userId}`);
    return job;
  }

  /**
   * Get jobs with filtering, sorting, and pagination
   */
  async getJobs(userId: string, query: GetJobsQuery) {
    const {
      page = 1,
      limit = 10,
      status,
      company,
      workMode,
      jobType,
      priority,
      search,
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

    if (company) {
      where.company = { contains: company, mode: 'insensitive' };
    }

    if (workMode) {
      where.workMode = workMode;
    }

    if (jobType) {
      where.jobType = jobType;
    }

    if (priority) {
      where.priority = priority;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ];
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

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy,
        include: {
          _count: {
            select: {
              applications: true,
              statusChanges: true,
            },
          },
        },
      }),
      prisma.job.count({ where }),
    ]);

    return {
      jobs,
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
   * Get job by ID
   */
  async getJobById(jobId: string, userId: string): Promise<Job> {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        applications: {
          include: {
            resume: {
              select: {
                id: true,
                title: true,
                fileName: true,
              },
            },
          },
        },
        interviews: {
          orderBy: { scheduledAt: 'asc' },
        },
        statusChanges: {
          orderBy: { changedAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!job) {
      throw new NotFoundError('Job not found');
    }

    if (job.userId !== userId) {
      throw new ForbiddenError('Not authorized to access this job');
    }

    return job;
  }

  /**
   * Update job
   */
  async updateJob(
    jobId: string,
    userId: string,
    data: UpdateJobInput
  ): Promise<Job> {
    logger.info(`Updating job ${jobId} with data:`, JSON.stringify(data, null, 2));

    // Verify ownership
    const job = await this.getJobById(jobId, userId);

    // Parse dates and map field names for Prisma
    const updateData: any = {};

    // Copy all fields except the ones we need to transform
    Object.keys(data).forEach(key => {
      const value = (data as any)[key];

      // Skip undefined values
      if (value === undefined) {
        return;
      }

      // Map validator field names to Prisma field names
      if (key === 'description') {
        updateData.jobDescription = value;
      } else if (key === 'url') {
        updateData.jobUrl = value;
      } else if (key === 'sourceUrl') {
        updateData.source = value;
      } else if (key === 'deadline') {
        updateData.applicationDeadline = value ? new Date(value) : value;
      } else if (key === 'postedDate') {
        updateData.postedDate = new Date(value);
      } else if (key === 'appliedAt') {
        updateData.appliedAt = new Date(value);
      } else {
        // Keep other fields as-is
        updateData[key] = value;
      }
    });

    logger.info(`Parsed update data:`, JSON.stringify(updateData, null, 2));

    // If status is being updated, validate and create status change
    if (data.status && data.status !== job.status) {
      this.validateStatusTransition(job.status, data.status);

      await prisma.statusChange.create({
        data: {
          jobId: job.id,
          fromStatus: job.status,
          toStatus: data.status,
          reason: 'Status updated',
        },
      });
    }

    const updated = await prisma.job.update({
      where: { id: jobId },
      data: updateData,
    });

    logger.info(`Job updated: ${jobId}`);
    return updated;
  }

  /**
   * Delete job (with cascade confirmation)
   */
  async deleteJob(jobId: string, userId: string): Promise<void> {
    // Verify ownership
    const job = await this.getJobById(jobId, userId);

    // Check for related data
    const applicationCount = await prisma.application.count({
      where: { jobId },
    });

    if (applicationCount > 0) {
      logger.warn(
        `Deleting job ${jobId} with ${applicationCount} associated application(s)`
      );
    }

    // Delete job (cascade will handle related records)
    await prisma.job.delete({
      where: { id: jobId },
    });

    logger.info(`Job deleted: ${jobId}`);
  }

  /**
   * Update job status with validation
   */
  async updateJobStatus(
    jobId: string,
    userId: string,
    data: UpdateJobStatusInput
  ): Promise<Job> {
    // Verify ownership
    const job = await this.getJobById(jobId, userId);

    // Validate status transition
    this.validateStatusTransition(job.status, data.status);

    // Create status change record
    await prisma.statusChange.create({
      data: {
        jobId: job.id,
        fromStatus: job.status,
        toStatus: data.status,
        reason: data.reason || null,
      },
    });

    // Update job status
    const updated = await prisma.job.update({
      where: { id: jobId },
      data: { status: data.status },
    });

    logger.info(`Job status updated: ${jobId} from ${job.status} to ${data.status}`);
    return updated;
  }

  /**
   * Add a note to a job
   */
  async addJobNote(
    jobId: string,
    userId: string,
    data: AddJobNoteInput
  ): Promise<Job> {
    // Verify ownership
    const job = await this.getJobById(jobId, userId);

    // Append note to existing notes
    const existingNotes = job.notes || '';
    const timestamp = new Date().toISOString();
    const newNote = `[${timestamp}]\n${data.note}\n\n`;
    const updatedNotes = existingNotes + newNote;

    const updated = await prisma.job.update({
      where: { id: jobId },
      data: { notes: updatedNotes },
    });

    logger.info(`Note added to job: ${jobId}`);
    return updated;
  }

  /**
   * Get job statistics grouped by status
   */
  async getJobStats(userId: string) {
    const jobs = await prisma.job.findMany({
      where: { userId },
      select: {
        status: true,
        priority: true,
        createdAt: true,
      },
    });

    const statusCounts: Record<string, number> = {};
    const priorityCounts: Record<number, number> = {};
    let totalJobs = 0;

    jobs.forEach((job) => {
      totalJobs++;

      // Count by status
      statusCounts[job.status] = (statusCounts[job.status] || 0) + 1;

      // Count by priority
      if (job.priority) {
        priorityCounts[job.priority] = (priorityCounts[job.priority] || 0) + 1;
      }
    });

    // Calculate jobs added this month
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const jobsThisMonth = jobs.filter((job) => job.createdAt >= thisMonth).length;

    // Get active jobs (not in terminal states)
    const activeStatuses: JobStatus[] = [
      'INTERESTED',
      'APPLIED',
      'INTERVIEW_SCHEDULED',
      'INTERVIEW_COMPLETED',
      'OFFER_RECEIVED',
    ];
    const activeJobs = jobs.filter((job) =>
      activeStatuses.includes(job.status)
    ).length;

    return {
      total: totalJobs,
      active: activeJobs,
      byStatus: statusCounts,
      byPriority: priorityCounts,
      addedThisMonth: jobsThisMonth,
    };
  }

  /**
   * Get job timeline (status history)
   */
  async getJobTimeline(jobId: string, userId: string) {
    // Verify ownership
    await this.getJobById(jobId, userId);

    const statusChanges = await prisma.statusChange.findMany({
      where: { jobId },
      orderBy: { createdAt: 'asc' },
    });

    return statusChanges;
  }

  /**
   * Validate status transition
   */
  private validateStatusTransition(
    currentStatus: JobStatus,
    newStatus: JobStatus
  ): void {
    if (currentStatus === newStatus) {
      throw new BadRequestError('Job is already in this status');
    }

    const validTransitions = VALID_STATUS_TRANSITIONS[currentStatus];

    if (!validTransitions.includes(newStatus)) {
      throw new BadRequestError(
        `Invalid status transition from ${currentStatus} to ${newStatus}. ` +
        `Valid transitions: ${validTransitions.join(', ')}`
      );
    }
  }
}

// Export singleton instance
export const jobService = new JobService();
