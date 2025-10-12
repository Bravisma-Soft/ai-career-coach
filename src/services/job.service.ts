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

// Status transition rules
const VALID_STATUS_TRANSITIONS: Record<JobStatus, JobStatus[]> = {
  SAVED: ['RESEARCHING', 'APPLIED', 'WITHDRAWN', 'CLOSED'],
  RESEARCHING: ['SAVED', 'APPLIED', 'WITHDRAWN', 'CLOSED'],
  APPLIED: ['INTERVIEWING', 'REJECTED', 'WITHDRAWN', 'CLOSED'],
  INTERVIEWING: ['OFFER_RECEIVED', 'REJECTED', 'WITHDRAWN', 'CLOSED'],
  OFFER_RECEIVED: ['ACCEPTED', 'REJECTED', 'WITHDRAWN'],
  ACCEPTED: ['CLOSED'],
  REJECTED: ['CLOSED'],
  WITHDRAWN: ['CLOSED'],
  CLOSED: [], // Terminal state
};

export class JobService {
  /**
   * Create a new job
   */
  async createJob(userId: string, data: CreateJobInput): Promise<Job> {
    // Parse dates if present
    const jobData: any = { ...data };
    if (data.postedDate) {
      jobData.postedDate = new Date(data.postedDate);
    }
    if (data.deadline) {
      jobData.deadline = new Date(data.deadline);
    }

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
          notes: 'Job created',
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
          applications: {
            select: {
              id: true,
              status: true,
              applicationDate: true,
            },
          },
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
            interviews: {
              orderBy: { scheduledAt: 'asc' },
            },
          },
        },
        statusChanges: {
          orderBy: { createdAt: 'desc' },
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
    // Verify ownership
    const job = await this.getJobById(jobId, userId);

    // Parse dates if present
    const updateData: any = { ...data };
    if (data.postedDate) {
      updateData.postedDate = new Date(data.postedDate);
    }
    if (data.deadline) {
      updateData.deadline = new Date(data.deadline);
    }

    // If status is being updated, validate and create status change
    if (data.status && data.status !== job.status) {
      this.validateStatusTransition(job.status, data.status);

      await prisma.statusChange.create({
        data: {
          jobId: job.id,
          fromStatus: job.status,
          toStatus: data.status,
          notes: 'Status updated',
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
        notes: data.notes || null,
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
      'SAVED',
      'RESEARCHING',
      'APPLIED',
      'INTERVIEWING',
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
