import { Job } from 'bullmq';
import { prisma } from '@/database/client';
import { logger } from '@/config/logger';
import { storageService } from '@/services/storage.service';
import { resumeParserAgent } from '@/ai/agents/resume-parser.agent';
import { DocumentParser } from '@/utils/document-parser';
import { ParsedResumeData } from '@/ai/prompts/resume-parser.prompt';
import { emailService } from '@/services/email.service';
import { ResumeAnalyzerAgent } from '@/ai/agents/resume-analyzer.agent';

/**
 * Resume Parse Job Processor
 *
 * Background job that:
 * 1. Fetches resume file from storage
 * 2. Extracts text from PDF/DOCX
 * 3. Parses resume with AI
 * 4. Saves parsed data to database
 * 5. Updates user profile if needed
 */

export interface ResumeParseJobData {
  resumeId: string;
  userId: string;
  updateProfile?: boolean; // If true, update user profile with parsed data
}

export class ResumeParseProcessor {
  /**
   * Process resume parsing job
   */
  static async process(job: Job<ResumeParseJobData>): Promise<void> {
    const { resumeId, userId, updateProfile = false } = job.data;

    logger.info('Processing resume parse job', {
      jobId: job.id,
      resumeId,
      userId,
    });

    try {
      // Update progress
      await job.updateProgress(10);

      // 1. Fetch resume from database
      const resume = await prisma.resume.findUnique({
        where: { id: resumeId },
        include: {
          user: true,
        },
      });

      if (!resume) {
        throw new Error(`Resume not found: ${resumeId}`);
      }

      if (resume.userId !== userId) {
        throw new Error('Resume does not belong to user');
      }

      await job.updateProgress(20);

      // 2. Download resume file from storage
      logger.info('Downloading resume file', { resumeId, fileName: resume.fileName });

      const key = this.extractKeyFromUrl(resume.fileUrl);
      const fileBuffer = await storageService.downloadFile(key);

      await job.updateProgress(30);

      // 3. Extract text from document
      logger.info('Extracting text from document', {
        resumeId,
        mimeType: resume.mimeType,
      });

      const extractedData = await DocumentParser.extractText(
        fileBuffer,
        resume.mimeType,
        resume.fileName
      );

      // Validate extracted text
      const validation = DocumentParser.validateText(extractedData.text);
      if (!validation.valid) {
        logger.warn('Extracted text validation issues', {
          resumeId,
          issues: validation.issues,
        });
      }

      // Clean text
      const cleanedText = DocumentParser.cleanText(extractedData.text);

      // Save raw text to resume
      await prisma.resume.update({
        where: { id: resumeId },
        data: {
          rawText: cleanedText,
        },
      });

      await job.updateProgress(50);

      // 4. Parse resume with AI
      logger.info('Parsing resume with AI', { resumeId });

      const parseResult = await resumeParserAgent.execute({
        resumeText: cleanedText,
        fileName: resume.fileName,
      });

      if (!parseResult.success) {
        throw new Error(
          `Resume parsing failed: ${parseResult.error?.message}`
        );
      }

      const parsedData = parseResult.data!;

      await job.updateProgress(70);

      // 5. Save parsed data to database
      logger.info('Saving parsed data to database', { resumeId });

      await prisma.resume.update({
        where: { id: resumeId },
        data: {
          parsedData: parsedData as any, // Store as JSON (rawText already saved earlier)
        },
      });

      await job.updateProgress(80);

      // 6. Automatically run resume analysis
      logger.info('Running automatic resume analysis', { resumeId });

      try {
        const analyzerAgent = new ResumeAnalyzerAgent();
        const analysisResult = await analyzerAgent.execute({
          resumeData: parsedData,
        });

        if (analysisResult.success && analysisResult.data) {
          const analysisData = analysisResult.data;

          // Save analysis to database
          await prisma.resumeAnalysis.upsert({
            where: { resumeId: resumeId },
            create: {
              resumeId: resumeId,
              overallScore: analysisData.overallScore,
              atsScore: analysisData.atsScore,
              readabilityScore: analysisData.readabilityScore,
              summaryScore: analysisData.sections.summary?.score,
              experienceScore: analysisData.sections.experience?.score,
              educationScore: analysisData.sections.education?.score,
              skillsScore: analysisData.sections.skills?.score,
              strengths: analysisData.strengths,
              weaknesses: analysisData.weaknesses,
              sections: analysisData.sections as any,
              keywordAnalysis: analysisData.keywordAnalysis as any,
              suggestions: analysisData.suggestions as any,
              atsIssues: analysisData.atsIssues,
              analysisMetadata: {
                tokenUsage: analysisResult.usage,
                model: analysisResult.model,
                autoGenerated: true,
              },
            },
            update: {
              overallScore: analysisData.overallScore,
              atsScore: analysisData.atsScore,
              readabilityScore: analysisData.readabilityScore,
              summaryScore: analysisData.sections.summary?.score,
              experienceScore: analysisData.sections.experience?.score,
              educationScore: analysisData.sections.education?.score,
              skillsScore: analysisData.sections.skills?.score,
              strengths: analysisData.strengths,
              weaknesses: analysisData.weaknesses,
              sections: analysisData.sections as any,
              keywordAnalysis: analysisData.keywordAnalysis as any,
              suggestions: analysisData.suggestions as any,
              atsIssues: analysisData.atsIssues,
              analysisMetadata: {
                tokenUsage: analysisResult.usage,
                model: analysisResult.model,
                autoGenerated: true,
              },
            },
          });

          logger.info('Resume analysis completed and saved', {
            resumeId,
            overallScore: analysisData.overallScore,
          });
        } else {
          logger.warn('Resume analysis failed, will skip for now', {
            resumeId,
            error: analysisResult.error?.message,
          });
        }
      } catch (error) {
        logger.error('Error during automatic resume analysis', {
          resumeId,
          error: error instanceof Error ? error.message : error,
        });
        // Don't fail the job if analysis fails - parsing already succeeded
      }

      await job.updateProgress(85);

      // 7. Update user profile if requested and it's the first resume
      if (updateProfile) {
        await this.updateUserProfileFromResume(userId, parsedData);
      }

      await job.updateProgress(90);

      // 8. Send notification to user (placeholder)
      logger.info('Resume parsing completed successfully', {
        resumeId,
        userId,
        hasName: !!parsedData.personalInfo?.name,
        experienceCount: parsedData.experiences?.length || 0,
        educationCount: parsedData.educations?.length || 0,
        skillCount: parsedData.skills?.length || 0,
      });

      await job.updateProgress(100);

      // Send notification email to user (async, don't block job completion)
      emailService.sendResumeParseCompleteEmail(
        resume.user.email,
        resume.fileName
      ).catch((error) => {
        logger.error('Failed to send resume parse notification email:', error);
      });
    } catch (error) {
      logger.error('Resume parse job failed', {
        jobId: job.id,
        resumeId,
        userId,
        error: error instanceof Error ? error.message : error,
      });

      // Update resume with error
      await prisma.resume.update({
        where: { id: resumeId },
        data: {
          parsedData: {
            error: error instanceof Error ? error.message : 'Unknown error',
          } as any,
        },
      });

      throw error;
    }
  }

  /**
   * Update user profile from parsed resume data
   */
  private static async updateUserProfileFromResume(
    userId: string,
    parsedData: ParsedResumeData
  ): Promise<void> {
    try {
      logger.info('Updating user profile from resume', { userId });

      // Get or create user profile
      let profile = await prisma.userProfile.findUnique({
        where: { userId },
      });

      if (!profile) {
        profile = await prisma.userProfile.create({
          data: { userId },
        });
      }

      // Update profile with personal info
      const { personalInfo, summary } = parsedData;

      const updateData: any = {};

      if (personalInfo?.phone) updateData.phone = personalInfo.phone;
      if (personalInfo?.location) updateData.location = personalInfo.location;
      if (personalInfo?.city) updateData.city = personalInfo.city;
      if (personalInfo?.state) updateData.state = personalInfo.state;
      if (personalInfo?.country) updateData.country = personalInfo.country;
      if (personalInfo?.linkedinUrl) updateData.linkedinUrl = personalInfo.linkedinUrl;
      if (personalInfo?.githubUrl) updateData.githubUrl = personalInfo.githubUrl;
      if (personalInfo?.portfolioUrl) updateData.portfolioUrl = personalInfo.portfolioUrl;
      if (summary) updateData.bio = summary;

      // Calculate years of experience
      if (parsedData.experiences && parsedData.experiences.length > 0) {
        const years = this.calculateYearsOfExperience(parsedData.experiences);
        if (years > 0) updateData.yearsOfExperience = years;

        // Set current job title and company if available
        const currentJob = parsedData.experiences.find((exp) => exp.isCurrent);
        if (currentJob) {
          updateData.currentJobTitle = currentJob.position;
          updateData.currentCompany = currentJob.company;
        }
      }

      // Update profile
      if (Object.keys(updateData).length > 0) {
        await prisma.userProfile.update({
          where: { userId },
          data: updateData,
        });
      }

      // Add experiences
      for (const exp of parsedData.experiences || []) {
        await prisma.experience.create({
          data: {
            userProfileId: profile.id,
            company: exp.company,
            position: exp.position,
            location: exp.location,
            startDate: this.parseDate(exp.startDate),
            endDate: exp.endDate ? this.parseDate(exp.endDate) : null,
            isCurrent: exp.isCurrent,
            description: exp.description,
            achievements: exp.achievements,
            technologies: exp.technologies,
          },
        });
      }

      // Add educations
      for (const edu of parsedData.educations || []) {
        // Skip if missing required startDate
        if (!edu.startDate) {
          logger.warn('Skipping education without startDate', { institution: edu.institution });
          continue;
        }

        await prisma.education.create({
          data: {
            userProfileId: profile.id,
            institution: edu.institution,
            degree: edu.degree,
            fieldOfStudy: edu.fieldOfStudy,
            location: edu.location,
            startDate: this.parseDate(edu.startDate),
            endDate: edu.endDate ? this.parseDate(edu.endDate) : null,
            isCurrent: edu.isCurrent,
            gpa: edu.gpa,
            achievements: edu.honors,
            coursework: edu.coursework,
          },
        });
      }

      // Add skills (avoid duplicates)
      for (const skill of parsedData.skills || []) {
        const existing = await prisma.skill.findFirst({
          where: {
            userProfileId: profile.id,
            name: skill.name,
          },
        });

        if (!existing) {
          await prisma.skill.create({
            data: {
              userProfileId: profile.id,
              name: skill.name,
              category: skill.category,
              level: skill.level as any,
            },
          });
        }
      }

      // Add certifications
      for (const cert of parsedData.certifications || []) {
        // Skip if missing required issueDate
        if (!cert.issueDate) {
          logger.warn('Skipping certification without issueDate', { name: cert.name });
          continue;
        }

        await prisma.certification.create({
          data: {
            userProfileId: profile.id,
            name: cert.name,
            issuingOrganization: cert.issuingOrganization,
            issueDate: this.parseDate(cert.issueDate),
            expiryDate: cert.expiryDate ? this.parseDate(cert.expiryDate) : null,
            credentialId: cert.credentialId,
          },
        });
      }

      logger.info('User profile updated successfully from resume', { userId });
    } catch (error) {
      logger.error('Failed to update user profile from resume', {
        userId,
        error,
      });
      // Don't throw - profile update is optional
    }
  }

  /**
   * Calculate years of experience from work history
   */
  private static calculateYearsOfExperience(
    experiences: ParsedResumeData['experiences']
  ): number {
    let totalMonths = 0;

    for (const exp of experiences) {
      const start = this.parseDate(exp.startDate);
      const end = exp.endDate ? this.parseDate(exp.endDate) : new Date();

      if (start && end) {
        const months =
          (end.getFullYear() - start.getFullYear()) * 12 +
          (end.getMonth() - start.getMonth());
        totalMonths += Math.max(0, months);
      }
    }

    return Math.floor(totalMonths / 12);
  }

  /**
   * Parse date string to Date object
   */
  private static parseDate(dateStr: string): Date {
    // Handle "YYYY-MM" format
    if (/^\d{4}-\d{2}$/.test(dateStr)) {
      return new Date(dateStr + '-01');
    }

    // Handle "YYYY" format
    if (/^\d{4}$/.test(dateStr)) {
      return new Date(dateStr + '-01-01');
    }

    // Try standard date parsing
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? new Date() : date;
  }

  /**
   * Extract storage key from file URL
   */
  private static extractKeyFromUrl(fileUrl: string): string {
    if (fileUrl.startsWith('http')) {
      // S3 URL
      const url = new URL(fileUrl);
      return url.pathname.substring(1); // Remove leading slash
    } else {
      // Local URL
      return fileUrl.replace('/uploads/', '');
    }
  }
}

// Export processor function for BullMQ
export const resumeParseProcessor = async (job: Job<ResumeParseJobData>) => {
  return ResumeParseProcessor.process(job);
};
