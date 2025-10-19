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
import { JobParserAgent, ParsedJobData } from '@/ai/agents/job-parser.agent';
import { resumeTailorAgent } from '@/ai/agents/resume-tailor.agent';
import { ParsedResumeData } from '@/ai/prompts/resume-parser.prompt';

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

    // Calculate match score if master resume exists and job has description
    if (job.jobDescription && job.jobDescription.length > 20) {
      this.calculateMatchScoreAsync(userId, job.id, job.title, job.company, job.jobDescription)
        .catch(error => {
          logger.error('Failed to calculate match score for job', {
            jobId: job.id,
            error: error.message,
          });
        });
    }

    return job;
  }

  /**
   * Calculate match score asynchronously (non-blocking)
   * Private method called after job creation
   */
  private async calculateMatchScoreAsync(
    userId: string,
    jobId: string,
    jobTitle: string,
    companyName: string,
    jobDescription: string
  ): Promise<void> {
    try {
      logger.info('Calculating match score for job', { jobId, jobTitle });

      // Get master resume
      const masterResume = await prisma.resume.findFirst({
        where: {
          userId,
          isPrimary: true,
          isActive: true,
        },
        select: {
          id: true,
          parsedData: true,
        },
      });

      if (!masterResume || !masterResume.parsedData) {
        logger.info('No master resume found or resume not parsed, skipping match score calculation', {
          jobId,
          userId,
        });
        return;
      }

      const parsedData = masterResume.parsedData as unknown as ParsedResumeData;

      // Validate parsed data has minimum requirements
      if (!parsedData.experiences || parsedData.experiences.length === 0) {
        logger.warn('Master resume has no experiences, skipping match score', {
          jobId,
          resumeId: masterResume.id,
        });
        return;
      }

      // Calculate match score using Resume Tailor Agent
      const matchResult = await resumeTailorAgent.calculateMatchScore({
        resume: parsedData,
        jobDescription,
        jobTitle,
        companyName,
      });

      if (!matchResult.success || !matchResult.data) {
        logger.error('Match score calculation failed', {
          jobId,
          error: matchResult.error,
        });
        return;
      }

      const { matchScore, matchedSkills, missingSkills, strengthAreas, gapAreas, quickSummary } = matchResult.data;

      // Update job with match score and analysis
      await prisma.job.update({
        where: { id: jobId },
        data: {
          matchScore,
          aiAnalysis: {
            matchedSkills,
            missingSkills,
            strengthAreas,
            gapAreas,
            summary: quickSummary,
            calculatedAt: new Date().toISOString(),
          },
        },
      });

      logger.info('Match score calculated and saved', {
        jobId,
        matchScore,
        matchedSkills: matchedSkills.length,
        missingSkills: missingSkills.length,
      });
    } catch (error: any) {
      logger.error('Error in calculateMatchScoreAsync', {
        jobId,
        error: error.message,
        stack: error.stack,
      });
      // Don't throw - this is a background operation
    }
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
        createdAt: true,
      },
    });

    const statusCounts: Record<string, number> = {};
    let totalJobs = 0;

    jobs.forEach((job) => {
      totalJobs++;

      // Count by status
      statusCounts[job.status] = (statusCounts[job.status] || 0) + 1;
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
      orderBy: { changedAt: 'asc' },
    });

    return statusChanges;
  }

  /**
   * Parse job details from URL using AI
   */
  async parseJobFromUrl(url: string): Promise<ParsedJobData> {
    logger.info(`Parsing job from URL: ${url}`);

    try {
      const jobParser = new JobParserAgent();
      const result = await jobParser.execute({ url });

      if (!result.success || !result.data) {
        throw new BadRequestError(
          result.error?.message || 'Failed to parse job from URL'
        );
      }

      logger.info('Job parsed successfully from URL', {
        url,
        company: result.data.company,
        title: result.data.title,
      });

      return result.data;
    } catch (error: any) {
      logger.error('Error parsing job from URL', {
        url,
        error: error.message,
      });

      if (error instanceof BadRequestError) {
        throw error;
      }

      throw new BadRequestError(
        `Failed to parse job from URL: ${error.message}`
      );
    }
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
