import { prisma } from '@/database/client';
import { logger } from '@/config/logger';
import { storageService } from './storage.service';
import {
  NotFoundError,
  ForbiddenError,
  BadRequestError,
  InternalServerError,
} from '@/utils/ApiError';
import { Resume } from '@prisma/client';
import { GetResumesQuery } from '@/api/validators/resume.validator';
import { resumeTailorAgent, TailorResumeResult } from '@/ai/agents/resume-tailor.agent';
import { ParsedResumeData } from '@/ai/prompts/resume-parser.prompt';
import { serializeResume, serializeResumes, SerializedResume } from '@/utils/resume-serializer';

export class ResumeService {
  /**
   * Upload a new resume
   */
  async uploadResume(
    userId: string,
    file: Express.Multer.File,
    title: string,
    isPrimary: boolean = false
  ): Promise<SerializedResume> {
    // If setting as primary, unset other primary resumes
    if (isPrimary) {
      await prisma.resume.updateMany({
        where: { userId, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    // Upload file to storage
    const uploadedFile = await storageService.uploadFile(file, 'resumes');

    // Create resume record
    const resume = await prisma.resume.create({
      data: {
        userId,
        title,
        fileName: uploadedFile.fileName,
        fileUrl: uploadedFile.fileUrl,
        fileSize: uploadedFile.fileSize,
        mimeType: uploadedFile.mimeType,
        isPrimary,
        isActive: true,
      },
    });

    logger.info(`Resume uploaded for user ${userId}: ${resume.id}`);

    return serializeResume(resume);
  }

  /**
   * Get all resumes for a user
   */
  async getResumes(userId: string, query: GetResumesQuery) {
    const { page = 1, limit = 10, isPrimary, isActive } = query;

    const where: any = { userId };

    if (isPrimary !== undefined) {
      where.isPrimary = isPrimary;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [resumes, total] = await Promise.all([
      prisma.resume.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ isPrimary: 'desc' }, { createdAt: 'desc' }],
      }),
      prisma.resume.count({ where }),
    ]);

    return {
      resumes: serializeResumes(resumes),
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
   * Get resume by ID
   */
  async getResumeById(resumeId: string, userId: string): Promise<SerializedResume> {
    const resume = await prisma.resume.findUnique({
      where: { id: resumeId },
    });

    if (!resume) {
      throw new NotFoundError('Resume not found');
    }

    if (resume.userId !== userId) {
      throw new ForbiddenError('Not authorized to access this resume');
    }

    return serializeResume(resume);
  }

  /**
   * Get raw resume by ID (for internal use, returns Prisma model)
   */
  private async getRawResumeById(resumeId: string, userId: string): Promise<Resume> {
    const resume = await prisma.resume.findUnique({
      where: { id: resumeId },
    });

    if (!resume) {
      throw new NotFoundError('Resume not found');
    }

    if (resume.userId !== userId) {
      throw new ForbiddenError('Not authorized to access this resume');
    }

    return resume;
  }

  /**
   * Update resume
   */
  async updateResume(
    resumeId: string,
    userId: string,
    data: { title?: string; isPrimary?: boolean; isActive?: boolean }
  ): Promise<SerializedResume> {
    // Verify ownership
    const resume = await this.getRawResumeById(resumeId, userId);

    // If setting as primary, unset other primary resumes
    if (data.isPrimary && !resume.isPrimary) {
      await prisma.resume.updateMany({
        where: {
          userId,
          isPrimary: true,
          id: { not: resumeId },
        },
        data: { isPrimary: false },
      });
    }

    const updated = await prisma.resume.update({
      where: { id: resumeId },
      data,
    });

    logger.info(`Resume updated: ${resumeId}`);

    return serializeResume(updated);
  }

  /**
   * Delete resume
   */
  async deleteResume(resumeId: string, userId: string): Promise<void> {
    // Verify ownership
    const resume = await this.getRawResumeById(resumeId, userId);

    // Delete file from storage
    try {
      // Extract key from fileUrl
      const key = this.extractKeyFromUrl(resume.fileUrl);
      await storageService.deleteFile(key);
    } catch (error) {
      logger.warn(`Failed to delete resume file: ${error}`);
      // Continue with database deletion even if file deletion fails
    }

    // Delete database record
    await prisma.resume.delete({
      where: { id: resumeId },
    });

    logger.info(`Resume deleted: ${resumeId}`);
  }

  /**
   * Set resume as primary (master)
   */
  async setPrimaryResume(resumeId: string, userId: string): Promise<SerializedResume> {
    // Verify ownership
    const resume = await this.getRawResumeById(resumeId, userId);

    // Unset all other primary resumes for this user
    await prisma.resume.updateMany({
      where: { userId, isPrimary: true },
      data: { isPrimary: false },
    });

    // Set this resume as primary
    const updatedResume = await prisma.resume.update({
      where: { id: resumeId },
      data: { isPrimary: true, lastUsedAt: new Date() },
    });

    logger.info(`Resume set as primary for user ${userId}: ${resumeId}`);

    return serializeResume(updatedResume);
  }

  /**
   * Download resume
   */
  async downloadResume(resumeId: string, userId: string): Promise<Buffer> {
    // Verify ownership
    const resume = await this.getRawResumeById(resumeId, userId);

    // Extract key from URL
    const key = this.extractKeyFromUrl(resume.fileUrl);

    // Download file
    const fileBuffer = await storageService.downloadFile(key);

    // Update lastUsedAt
    await prisma.resume.update({
      where: { id: resumeId },
      data: { lastUsedAt: new Date() },
    });

    return fileBuffer;
  }

  /**
   * Generate signed URL for resume (for S3)
   */
  async getResumeUrl(resumeId: string, userId: string): Promise<string> {
    // Verify ownership
    const resume = await this.getRawResumeById(resumeId, userId);

    // Extract key from URL
    const key = this.extractKeyFromUrl(resume.fileUrl);

    // Generate signed URL
    return await storageService.generateSignedUrl(key);
  }

  /**
   * Parse resume (trigger background job)
   */
  async parseResume(
    resumeId: string,
    userId: string,
    options?: { updateProfile?: boolean }
  ): Promise<SerializedResume> {
    // Verify ownership
    const resume = await this.getRawResumeById(resumeId, userId);

    // Check if already parsed successfully (parsedData exists and doesn't contain an error)
    const hasError = resume.parsedData &&
                     typeof resume.parsedData === 'object' &&
                     'error' in resume.parsedData;

    if (resume.parsedData && !hasError) {
      logger.info(`Resume already parsed successfully: ${resumeId}`);
      return resume;
    }

    if (hasError) {
      logger.info(`Re-parsing resume with previous error: ${resumeId}`);
    } else {
      logger.info(`Resume parsing requested: ${resumeId}`);
    }

    // Add job to queue (BullMQ)
    const { resumeParseQueue } = await import('@/config/queue');

    await resumeParseQueue.add(
      'parse-resume',
      {
        resumeId,
        userId,
        updateProfile: options?.updateProfile ?? false,
      },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      }
    );

    logger.info('Resume parse job added to queue', { resumeId });

    return serializeResume(resume);
  }

  /**
   * Extract storage key from file URL
   */
  private extractKeyFromUrl(fileUrl: string): string {
    // For S3 URLs: https://bucket.s3.region.amazonaws.com/resumes/file.pdf
    // For local URLs: /uploads/resumes/file.pdf

    if (fileUrl.startsWith('http')) {
      // S3 URL
      const url = new URL(fileUrl);
      return url.pathname.substring(1); // Remove leading slash
    } else {
      // Local URL
      return fileUrl.replace('/uploads/', '');
    }
  }

  /**
   * Get resume statistics for user
   */
  async getResumeStats(userId: string) {
    const [total, active, primary] = await Promise.all([
      prisma.resume.count({ where: { userId } }),
      prisma.resume.count({ where: { userId, isActive: true } }),
      prisma.resume.findFirst({ where: { userId, isPrimary: true } }),
    ]);

    return {
      total,
      active,
      hasPrimary: !!primary,
      primaryResumeId: primary?.id,
    };
  }

  /**
   * Tailor resume for a specific job using AI
   */
  async tailorResumeForJob(
    userId: string,
    resumeId: string,
    jobId: string,
    options?: {
      saveAsCopy?: boolean;
      title?: string;
    }
  ): Promise<TailorResumeResult & { savedResumeId?: string }> {
    logger.info('Starting resume tailoring', {
      userId,
      resumeId,
      jobId,
      saveAsCopy: options?.saveAsCopy,
    });

    // Verify user owns the resume
    const resume = await prisma.resume.findUnique({
      where: { id: resumeId },
    });

    if (!resume) {
      throw new NotFoundError('Resume not found');
    }

    if (resume.userId !== userId) {
      throw new ForbiddenError('Not authorized to access this resume');
    }

    // Verify user owns the job
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new NotFoundError('Job not found');
    }

    if (job.userId !== userId) {
      throw new ForbiddenError('Not authorized to access this job');
    }

    // Validate resume has been parsed
    if (!resume.parsedData || resume.parsedData === null) {
      throw new BadRequestError(
        'Resume must be parsed before tailoring. Please parse the resume first.'
      );
    }

    // Validate job has description
    if (!job.jobDescription || job.jobDescription.trim().length < 50) {
      throw new BadRequestError(
        'Job description is too short or missing. Please add a detailed job description.'
      );
    }

    // Parse the resume data
    let parsedResumeData: ParsedResumeData;
    try {
      parsedResumeData = resume.parsedData as any as ParsedResumeData;
    } catch (error) {
      logger.error('Failed to parse resume data', { error, resumeId });
      throw new InternalServerError('Failed to parse resume data');
    }

    // Build requirements and qualifications from job data
    const jobRequirements = this.buildJobRequirements(job);
    const jobPreferredQualifications = this.buildPreferredQualifications(job);

    logger.info('Calling AI agent for resume tailoring', {
      resumeId,
      jobId,
      jobTitle: job.title,
      company: job.company,
      hasRequirements: !!jobRequirements,
      hasPreferred: !!jobPreferredQualifications,
    });

    // Call the AI agent
    let tailoringResult: TailorResumeResult;
    try {
      const agentResponse = await resumeTailorAgent.execute({
        resume: parsedResumeData,
        jobDescription: job.jobDescription,
        jobTitle: job.title,
        companyName: job.company,
        jobRequirements: jobRequirements || undefined,
        jobPreferredQualifications: jobPreferredQualifications || undefined,
      });

      if (!agentResponse.success || !agentResponse.data) {
        throw new InternalServerError(
          `AI tailoring failed: ${agentResponse.error?.message || 'Unknown error'}`
        );
      }

      tailoringResult = agentResponse.data;

      logger.info('AI agent completed successfully', {
        resumeId,
        jobId,
        matchScore: tailoringResult.matchScore,
        changesCount: tailoringResult.changes.length,
        estimatedImpact: tailoringResult.estimatedImpact,
        inputTokens: agentResponse.usage?.inputTokens,
        outputTokens: agentResponse.usage?.outputTokens,
        totalTokens: agentResponse.usage?.totalTokens,
      });
    } catch (error) {
      logger.error('AI tailoring failed', {
        error: error instanceof Error ? error.message : error,
        resumeId,
        jobId,
      });

      if (error instanceof InternalServerError) {
        throw error;
      }

      throw new InternalServerError(
        'Failed to tailor resume. Please try again later.'
      );
    }

    // Optionally save tailored resume as a new resume
    let savedResumeId: string | undefined;
    if (options?.saveAsCopy) {
      try {
        const tailoredResume = await this.saveTailoredResume(
          userId,
          resume,
          job,
          tailoringResult.tailoredResume,
          options.title
        );
        savedResumeId = tailoredResume.id;

        logger.info('Tailored resume saved as new resume', {
          originalResumeId: resumeId,
          newResumeId: savedResumeId,
          jobId,
        });
      } catch (error) {
        logger.error('Failed to save tailored resume', {
          error: error instanceof Error ? error.message : error,
          resumeId,
          jobId,
        });
        // Don't throw - return result even if save fails
      }
    }

    // Update lastUsedAt for both resume and job
    await Promise.all([
      prisma.resume.update({
        where: { id: resumeId },
        data: { lastUsedAt: new Date() },
      }),
      prisma.job.update({
        where: { id: jobId },
        data: { updatedAt: new Date() },
      }),
    ]);

    return {
      ...tailoringResult,
      savedResumeId,
    };
  }

  /**
   * Build job requirements string from job data
   */
  private buildJobRequirements(job: any): string | null {
    const parts: string[] = [];

    if (job.requirements && Array.isArray(job.requirements) && job.requirements.length > 0) {
      parts.push('**Requirements:**');
      job.requirements.forEach((req: string) => {
        parts.push(`• ${req}`);
      });
    }

    if (job.responsibilities && Array.isArray(job.responsibilities) && job.responsibilities.length > 0) {
      parts.push('\n**Responsibilities:**');
      job.responsibilities.forEach((resp: string) => {
        parts.push(`• ${resp}`);
      });
    }

    return parts.length > 0 ? parts.join('\n') : null;
  }

  /**
   * Build preferred qualifications string from job data
   */
  private buildPreferredQualifications(job: any): string | null {
    const parts: string[] = [];

    if (job.benefits && Array.isArray(job.benefits) && job.benefits.length > 0) {
      parts.push('**Benefits & Perks:**');
      job.benefits.forEach((benefit: string) => {
        parts.push(`• ${benefit}`);
      });
    }

    // You can add more optional fields here in the future
    // For example: preferred skills, nice-to-haves, etc.

    return parts.length > 0 ? parts.join('\n') : null;
  }

  /**
   * Save tailored resume as a new resume record
   */
  private async saveTailoredResume(
    userId: string,
    originalResume: Resume,
    job: any,
    tailoredData: ParsedResumeData,
    customTitle?: string
  ): Promise<Resume> {
    // Generate title
    const title =
      customTitle ||
      `${originalResume.title} - Tailored for ${job.company} ${job.title}`;

    // Create new resume record with tailored data
    const newResume = await prisma.resume.create({
      data: {
        userId,
        title: title.substring(0, 200), // Ensure within DB limit
        fileName: originalResume.fileName,
        fileUrl: originalResume.fileUrl, // Keep same file URL
        fileSize: originalResume.fileSize,
        mimeType: originalResume.mimeType,
        isPrimary: false,
        isActive: true,
        parsedData: tailoredData as any, // Store tailored version
        notes: `Automatically tailored for ${job.company} - ${job.title} position`,
      },
    });

    return newResume;
  }
}

// Export singleton instance
export const resumeService = new ResumeService();
