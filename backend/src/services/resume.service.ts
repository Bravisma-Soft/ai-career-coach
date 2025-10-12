import { prisma } from '@/database/client';
import { logger } from '@/config/logger';
import { storageService } from './storage.service';
import {
  NotFoundError,
  ForbiddenError,
  BadRequestError,
} from '@/utils/ApiError';
import { Resume } from '@prisma/client';
import { GetResumesQuery } from '@/api/validators/resume.validator';

export class ResumeService {
  /**
   * Upload a new resume
   */
  async uploadResume(
    userId: string,
    file: Express.Multer.File,
    title: string,
    isPrimary: boolean = false
  ): Promise<Resume> {
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

    return resume;
  }

  /**
   * Get all resumes for a user
   */
  async getResumes(userId: string, query: GetResumesQuery) {
    const { page, limit, isPrimary, isActive } = query;

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
      resumes,
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
  async getResumeById(resumeId: string, userId: string): Promise<Resume> {
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
  ): Promise<Resume> {
    // Verify ownership
    const resume = await this.getResumeById(resumeId, userId);

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

    return updated;
  }

  /**
   * Delete resume
   */
  async deleteResume(resumeId: string, userId: string): Promise<void> {
    // Verify ownership
    const resume = await this.getResumeById(resumeId, userId);

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
   * Download resume
   */
  async downloadResume(resumeId: string, userId: string): Promise<Buffer> {
    // Verify ownership
    const resume = await this.getResumeById(resumeId, userId);

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
    const resume = await this.getResumeById(resumeId, userId);

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
  ): Promise<Resume> {
    // Verify ownership
    const resume = await this.getResumeById(resumeId, userId);

    // Check if already parsed
    if (resume.isParsed && resume.parsedData) {
      logger.info(`Resume already parsed: ${resumeId}`);
      return resume;
    }

    logger.info(`Resume parsing requested: ${resumeId}`);

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

    return resume;
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
}

// Export singleton instance
export const resumeService = new ResumeService();
