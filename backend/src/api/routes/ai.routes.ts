import { Router, Request, Response } from 'express';
import { asyncHandler } from '@/utils/asyncHandler';
import { sendSuccess } from '@/utils/response';
import { authenticate } from '@/api/middleware/auth.middleware';
import { validate } from '@/api/middleware/validate';
import { apiLimiter } from '@/api/middleware/rateLimiter';
import rateLimit from 'express-rate-limit';
import { resumeService } from '@/services/resume.service';
import { prisma } from '@/database/client';
import {
  tailorResumeSchema,
  analyzeResumeSchema,
  generateCoverLetterSchema,
  prepareInterviewSchema,
  matchJobsSchema,
  analyzeJobSchema,
  researchCompanySchema,
  researchInterviewerSchema,
} from '@/api/validators/ai.validator';
import {
  TailorResumeResponse,
  AnalyzeResumeResponse,
  GenerateCoverLetterResponse,
  PrepareInterviewResponse,
  MatchJobsResponse,
  AnalyzeJobResponse,
  ResearchCompanyResponse,
  ResearchInterviewerResponse,
} from '@/types/ai-api.types';
import { logger } from '@/config/logger';
import { NotFoundError, BadRequestError } from '@/utils/ApiError';
import { coverLetterAgent } from '@/ai/agents/cover-letter.agent';
import { ResumeAnalyzerAgent } from '@/ai/agents/resume-analyzer.agent';
import { JobAnalyzerAgent } from '@/ai/agents/job-analyzer.agent';

const router = Router();

// All routes require authentication
router.use(authenticate);

// AI-specific rate limiter (more restrictive than general API)
// AI operations are expensive, so we limit to 20 requests per 15 minutes
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: {
    success: false,
    error: 'Too many AI requests',
    message: 'You have exceeded the AI request limit. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for failed requests (validation errors, etc.)
  skipFailedRequests: true,
});

// Apply AI rate limiter to all routes EXCEPT check endpoints
router.use((req, res, next) => {
  // Skip rate limiting for lightweight check operations (GET requests)
  if (req.method === 'GET' && req.path.startsWith('/resumes/analysis/check/')) {
    return next();
  }
  return aiLimiter(req, res, next);
});

// =================================
// RESUME AI ROUTES
// =================================

/**
 * @route   POST /api/ai/resumes/tailor
 * @desc    Tailor resume for a specific job using AI
 * @access  Private
 */
router.post(
  '/resumes/tailor',
  validate(tailorResumeSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const { resumeId, jobId, focusAreas } = req.body;

    logger.info(`AI: Tailoring resume ${resumeId} for job ${jobId} - User: ${userId}`);

    // Call the resume service to tailor the resume
    const result = await resumeService.tailorResumeForJob(userId, resumeId, jobId, {
      saveAsCopy: false, // Don't save by default, let frontend decide
    });

    // Build response in expected format
    const response: TailorResumeResponse = {
      tailoredResume: {
        content: JSON.stringify(result.tailoredResume, null, 2),
        format: 'markdown',
      },
      changes: result.changes.map((change) => ({
        section: change.section,
        type: 'modified',
        description: change.reason,
        before: change.original,
        after: change.modified,
      })),
      matchScore: result.matchScore,
      recommendations: result.recommendations,
      keywordOptimizations: {
        added: result.keywordAlignment.suggestions,
        emphasized: result.keywordAlignment.matched,
      },
    };

    logger.info(`AI: Resume tailoring completed - Score: ${result.matchScore}, Impact: ${result.estimatedImpact}`);

    sendSuccess(res, response, 'Resume tailored successfully');
  })
);

/**
 * @route   POST /api/ai/jobs/:jobId/match-score
 * @desc    Calculate match score between job and master resume
 * @access  Private
 */
router.post(
  '/jobs/:jobId/match-score',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const { jobId } = req.params;

    logger.info(`AI: Calculating match score for job ${jobId} - User: ${userId}`);

    // Get user's master resume
    const masterResume = await prisma.resume.findFirst({
      where: {
        userId,
        isPrimary: true,
      },
    });

    if (!masterResume || !masterResume.parsedData) {
      throw new BadRequestError('Master resume not found or not parsed');
    }

    // Quick match calculation using tailoring service
    const result = await resumeService.tailorResumeForJob(userId, masterResume.id, jobId, {
      saveAsCopy: false,
    });

    sendSuccess(res, { matchScore: result.matchScore }, 'Match score calculated');
  })
);

/**
 * @route   GET /api/ai/resumes/analysis/check/:resumeId
 * @desc    Lightweight check if resume analysis exists (no rate limit)
 * @access  Private
 */
router.get(
  '/resumes/analysis/check/:resumeId',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const { resumeId } = req.params;

    // Quick check if any analysis exists for this resume
    const analysisExists = await prisma.resumeAnalysis.findFirst({
      where: { resumeId, resume: { userId } },
      select: { id: true },
    });

    sendSuccess(res, { hasAnalysis: !!analysisExists }, 'Analysis check completed');
  })
);

/**
 * @route   POST /api/ai/resumes/analyze
 * @desc    Analyze resume quality and provide suggestions
 * @access  Private
 */
router.post(
  '/resumes/analyze',
  validate(analyzeResumeSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const { resumeId, jobId, targetRole, targetIndustry } = req.body;

    logger.info(`AI: Analyzing resume ${resumeId}${jobId ? ` for job ${jobId}` : ''} - User: ${userId}`);

    // Fetch resume from database
    const resume = await prisma.resume.findFirst({
      where: {
        id: resumeId,
        userId: userId,
        isActive: true,
      },
    });

    if (!resume) {
      throw new NotFoundError('Resume not found');
    }

    if (!resume.parsedData) {
      throw new BadRequestError('Resume has not been parsed yet. Please wait for parsing to complete.');
    }

    // Check if parsedData contains an error object (from failed parsing)
    if (resume.parsedData && typeof resume.parsedData === 'object' && 'error' in resume.parsedData) {
      throw new BadRequestError(`Resume parsing failed: ${(resume.parsedData as any).error}. Please re-parse the resume.`);
    }

    // If jobId provided, fetch job details
    let job = null;
    if (jobId) {
      job = await prisma.job.findFirst({
        where: {
          id: jobId,
          userId: userId,
        },
      });

      if (!job) {
        throw new NotFoundError('Job not found');
      }
    }

    // Check if analysis already exists for this resume+job combination
    // If no jobId specified, get the most recent analysis for this resume
    logger.info(`AI: Looking for analysis - resumeId: ${resume.id}, jobId: ${jobId || 'none'}, userId: ${userId}`);

    const whereClause = jobId !== undefined ? {
      resumeId: resume.id,
      jobId: jobId || null,
    } : {
      resumeId: resume.id,
    };

    const existingAnalysis = await prisma.resumeAnalysis.findFirst({
      where: whereClause,
      orderBy: {
        updatedAt: 'desc',
      },
    });

    if (existingAnalysis) {
      logger.info(`AI: Found analysis ${existingAnalysis.id} for resumeId: ${existingAnalysis.resumeId}, jobId: ${existingAnalysis.jobId || 'none'}`);
    } else {
      logger.info(`AI: No existing analysis found for resumeId: ${resume.id}`);
    }

    // If analysis exists and no new target role/industry, return cached result
    if (existingAnalysis && !targetRole && !targetIndustry) {
      logger.info(`AI: Returning cached analysis for resume ${resumeId}${jobId ? ` and job ${jobId}` : ''}`);

      const response: AnalyzeResumeResponse = {
        id: existingAnalysis.id,
        resumeId: existingAnalysis.resumeId,
        jobId: existingAnalysis.jobId,
        overallScore: existingAnalysis.overallScore,
        atsScore: existingAnalysis.atsScore,
        readabilityScore: existingAnalysis.readabilityScore,
        summaryScore: existingAnalysis.summaryScore,
        experienceScore: existingAnalysis.experienceScore,
        educationScore: existingAnalysis.educationScore,
        skillsScore: existingAnalysis.skillsScore,
        strengths: existingAnalysis.strengths,
        weaknesses: existingAnalysis.weaknesses,
        sections: existingAnalysis.sections as any,
        keywordAnalysis: existingAnalysis.keywordAnalysis as any,
        atsIssues: existingAnalysis.atsIssues,
        suggestions: existingAnalysis.suggestions as any,
        targetRole: existingAnalysis.targetRole,
        targetIndustry: existingAnalysis.targetIndustry,
        createdAt: existingAnalysis.createdAt.toISOString(),
        updatedAt: existingAnalysis.updatedAt.toISOString(),
      };

      return sendSuccess(res, response, 'Resume analysis retrieved successfully (cached)');
    }

    // Execute AI analysis
    // Build targetRole from job data, but only if job has valid title and company
    let effectiveTargetRole = targetRole;
    if (!effectiveTargetRole && job && job.title && job.company) {
      effectiveTargetRole = `${job.title} at ${job.company}`;
    }

    logger.info(`AI: Analyzing with context`, {
      resumeId: resume.id,
      jobId: jobId || null,
      targetRole: effectiveTargetRole || 'Not specified',
      targetIndustry: targetIndustry || 'Not specified',
    });

    const agent = new ResumeAnalyzerAgent();
    const result = await agent.execute({
      resumeData: resume.parsedData as any,
      targetRole: effectiveTargetRole,
      targetIndustry: targetIndustry,
    });

    if (!result.success || !result.data) {
      throw new BadRequestError(result.error?.message || 'Failed to analyze resume');
    }

    const analysisData = result.data;

    // Save or update analysis in database
    logger.info(`AI: Saving analysis for resumeId: ${resume.id}, jobId: ${jobId || 'null'}`);

    const analysisDataToSave = {
      resumeId: resume.id,
      jobId: jobId || null,
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
      targetRole: targetRole || (job ? `${job.title} at ${job.company}` : null),
      targetIndustry,
      analysisMetadata: {
        tokenUsage: result.usage,
        model: result.model,
      },
    };

    // Prisma doesn't allow null in composite unique key where clauses
    // So we need to handle jobId presence differently
    let savedAnalysis;

    if (jobId) {
      // When jobId is provided, use composite key upsert
      savedAnalysis = await prisma.resumeAnalysis.upsert({
        where: {
          resumeId_jobId: {
            resumeId: resume.id,
            jobId: jobId,
          },
        },
        create: analysisDataToSave,
        update: {
          ...analysisDataToSave,
          updatedAt: new Date(),
        },
      });
    } else {
      // When jobId is null, use findFirst + create/update
      const existing = await prisma.resumeAnalysis.findFirst({
        where: {
          resumeId: resume.id,
          jobId: null,
        },
      });

      if (existing) {
        savedAnalysis = await prisma.resumeAnalysis.update({
          where: { id: existing.id },
          data: {
            ...analysisDataToSave,
            updatedAt: new Date(),
          },
        });
      } else {
        savedAnalysis = await prisma.resumeAnalysis.create({
          data: analysisDataToSave,
        });
      }
    }

    const response: AnalyzeResumeResponse = {
      id: savedAnalysis.id,
      resumeId: savedAnalysis.resumeId,
      jobId: savedAnalysis.jobId,
      overallScore: savedAnalysis.overallScore,
      atsScore: savedAnalysis.atsScore,
      readabilityScore: savedAnalysis.readabilityScore,
      summaryScore: savedAnalysis.summaryScore,
      experienceScore: savedAnalysis.experienceScore,
      educationScore: savedAnalysis.educationScore,
      skillsScore: savedAnalysis.skillsScore,
      strengths: savedAnalysis.strengths,
      weaknesses: savedAnalysis.weaknesses,
      sections: savedAnalysis.sections as any,
      keywordAnalysis: savedAnalysis.keywordAnalysis as any,
      atsIssues: savedAnalysis.atsIssues,
      suggestions: savedAnalysis.suggestions as any,
      targetRole: savedAnalysis.targetRole,
      targetIndustry: savedAnalysis.targetIndustry,
      createdAt: savedAnalysis.createdAt.toISOString(),
      updatedAt: savedAnalysis.updatedAt.toISOString(),
    };

    logger.info(`AI: Resume analysis completed - Overall Score: ${response.overallScore}`);

    return sendSuccess(res, response, 'Resume analyzed successfully');
  })
);

// =================================
// COVER LETTER AI ROUTES
// =================================

/**
 * @route   POST /api/ai/cover-letters/generate
 * @desc    Generate cover letter using AI
 * @access  Private
 */
router.post(
  '/cover-letters/generate',
  validate(generateCoverLetterSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const { resumeId, jobId, tone, length, focusPoints, notes } = req.body;

    logger.info(`AI: Generating cover letter for job ${jobId} - User: ${userId}`);

    // Fetch resume from database
    const resume = await prisma.resume.findFirst({
      where: {
        id: resumeId,
        userId: userId,
        isActive: true,
      },
    });

    if (!resume) {
      throw new NotFoundError('Resume not found');
    }

    // Ensure resume has been parsed
    if (!resume.parsedData) {
      throw new BadRequestError('Resume must be parsed before generating cover letter. Please wait for parsing to complete.');
    }

    // Fetch job from database
    const job = await prisma.job.findFirst({
      where: {
        id: jobId,
        userId: userId,
      },
    });

    if (!job) {
      throw new NotFoundError('Job not found');
    }

    // Validate job has description
    if (!job.jobDescription || job.jobDescription.trim().length < 50) {
      throw new BadRequestError('Job description is too short. Please add a detailed job description (at least 50 characters).');
    }

    // Execute cover letter agent
    const agentResult = await coverLetterAgent.execute({
      resume: resume.parsedData as any,
      jobDescription: job.jobDescription,
      jobTitle: job.title,
      companyName: job.company,
      tone: tone || 'professional',
      additionalNotes: notes || '',
    });

    if (!agentResult.success || !agentResult.data) {
      logger.error('Cover letter generation failed', {
        error: agentResult.error,
        jobId,
        resumeId,
      });
      throw new Error(agentResult.error?.message || 'Failed to generate cover letter');
    }

    const result = agentResult.data;

    // Build response in expected format
    const response: GenerateCoverLetterResponse = {
      coverLetter: result.coverLetter,
      keyPoints: result.keyPoints,
      suggestions: result.suggestions,
      tone: result.tone,
      wordCount: result.wordCount,
      estimatedReadTime: result.estimatedReadTime,
    };

    logger.info(`AI: Cover letter generated - ${response.wordCount} words`, {
      jobId,
      resumeId,
      tone: response.tone,
      usage: agentResult.usage,
    });

    sendSuccess(res, response, 'Cover letter generated successfully');
  })
);

// =================================
// MOCK INTERVIEW AI ROUTES
// =================================

// =================================
// INTERVIEW PREPARATION ROUTES
// =================================
// Note: Mock interview functionality is implemented in /api/mock-interviews/*
// See backend/src/api/routes/mock-interview.routes.ts for real AI implementation

/**
 * @route   POST /api/ai/interviews/prepare
 * @desc    Get AI-powered interview preparation guidance
 * @access  Private
 */
router.post(
  '/interviews/prepare',
  validate(prepareInterviewSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const { jobId, resumeId, focusAreas } = req.body;

    logger.info(`AI: Preparing interview guidance - User: ${userId}, Job: ${jobId}`);

    // TODO: Implement InterviewPrepAgent
    // const agent = new InterviewPrepAgent();
    // const result = await agent.execute({ jobId, resumeId, focusAreas, userId });

    // Temporary placeholder response
    const response: PrepareInterviewResponse = {
      commonQuestions: [
        {
          question: 'Tell me about yourself',
          category: 'behavioral',
          difficulty: 'easy',
          suggestedApproach: 'Start with your current role, highlight relevant experience, and explain your interest in this position',
          tips: [
            'Keep it to 2-3 minutes',
            'Focus on professional experience',
            'Connect your background to the job',
          ],
        },
      ],
      companyResearch: {
        about: 'Company overview will be provided here...',
        culture: ['Innovation-focused', 'Collaborative environment'],
        values: ['Customer-first', 'Excellence', 'Integrity'],
        recentNews: ['Recent product launch', 'Expansion announcement'],
        interviewTips: [
          'Be ready to discuss their recent product launch',
          'Emphasize your collaborative skills',
        ],
      },
      starExamples: [
        {
          title: 'Led team through critical project',
          situation: 'Our main product had a critical bug affecting 1000+ users',
          task: 'Needed to fix the bug and restore service within 24 hours',
          action: 'Coordinated with team, implemented fix, and improved testing',
          result: 'Fixed bug in 6 hours, prevented future issues',
          applicableQuestions: [
            'Tell me about a time you solved a critical problem',
            'Describe a situation where you led under pressure',
          ],
        },
      ],
      technicalTopics: ['System Design', 'Data Structures', 'API Design'],
      questionsToAsk: [
        'What does success look like in this role?',
        'How does the team approach collaboration?',
        'What are the biggest challenges the team is facing?',
      ],
    };

    logger.info(`AI: Interview preparation generated - ${response.commonQuestions.length} questions`);

    sendSuccess(res, response, 'Interview preparation ready');
  })
);

// =================================
// JOB MATCHING & ANALYSIS ROUTES
// =================================

/**
 * @route   POST /api/ai/jobs/match
 * @desc    Match jobs to user profile using AI
 * @access  Private
 */
router.post(
  '/jobs/match',
  validate(matchJobsSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const { resumeId, targetRole, targetIndustry, minMatchScore, limit } = req.body;

    logger.info(`AI: Matching jobs for user ${userId}`);

    // TODO: Implement JobMatchAgent
    // const agent = new JobMatchAgent();
    // const result = await agent.execute({ resumeId, targetRole, targetIndustry, minMatchScore, limit, userId });

    // Temporary placeholder response
    const response: MatchJobsResponse = {
      matches: [
        {
          jobId: 'job_placeholder_1',
          job: {
            title: 'Senior Software Engineer',
            company: 'Tech Company Inc',
            location: 'San Francisco, CA',
            workMode: 'Hybrid',
          },
          matchScore: 92,
          matchReasons: [
            '5+ years React experience matches requirement',
            'Leadership experience aligns with role',
            'Technical skills are excellent fit',
          ],
          skillsMatch: {
            matched: ['React', 'TypeScript', 'Node.js', 'AWS'],
            missing: ['GraphQL', 'Kubernetes'],
            percentage: 85,
          },
          recommendation: 'Excellent match - strongly recommend applying',
          estimatedFitLevel: 'excellent',
        },
      ],
      summary: {
        totalAnalyzed: 25,
        averageMatchScore: 72,
        topSkillGaps: ['GraphQL', 'Kubernetes', 'Docker'],
      },
    };

    logger.info(`AI: Job matching completed - ${response.matches.length} matches found`);

    sendSuccess(res, response, 'Job matches generated');
  })
);

/**
 * @route   GET /api/ai/jobs/:jobId/analysis
 * @desc    Get existing job analysis (without creating new one)
 * @access  Private
 */
router.get(
  '/jobs/:jobId/analysis',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const { jobId } = req.params;

    logger.info(`AI: Fetching existing job analysis for ${jobId} - User: ${userId}`);

    // Check if job exists and belongs to user
    const job = await prisma.job.findFirst({
      where: {
        id: jobId,
        userId: userId,
      },
    });

    if (!job) {
      throw new NotFoundError('Job not found');
    }

    // Get the most recent analysis for this job
    const existingAnalysis = await prisma.jobAnalysis.findFirst({
      where: {
        jobId: jobId,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    if (!existingAnalysis) {
      throw new NotFoundError('No analysis found for this job');
    }

    const response: AnalyzeJobResponse = {
      analysis: {
        roleLevel: existingAnalysis.roleLevel as any,
        keyResponsibilities: existingAnalysis.keyResponsibilities as string[],
        requiredSkills: existingAnalysis.requiredSkills,
        preferredSkills: existingAnalysis.preferredSkills,
        redFlags: existingAnalysis.redFlags,
        highlights: existingAnalysis.highlights,
      },
      matchAnalysis: existingAnalysis.overallMatch !== null ? {
        overallMatch: existingAnalysis.overallMatch!,
        skillsMatch: existingAnalysis.skillsMatch!,
        experienceMatch: existingAnalysis.experienceMatch!,
        matchReasons: existingAnalysis.matchReasons,
        gaps: existingAnalysis.gaps,
        recommendations: existingAnalysis.recommendations as string[],
      } : undefined,
      salaryInsights: {
        estimatedRange: existingAnalysis.estimatedSalaryMin && existingAnalysis.estimatedSalaryMax
          ? `$${existingAnalysis.estimatedSalaryMin.toLocaleString()} - $${existingAnalysis.estimatedSalaryMax.toLocaleString()}`
          : 'Not disclosed',
        marketComparison: existingAnalysis.marketComparison,
        factors: existingAnalysis.salaryFactors,
      },
      applicationTips: existingAnalysis.applicationTips as string[],
    };

    return sendSuccess(res, response, 'Job analysis retrieved successfully');
  })
);

/**
 * @route   POST /api/ai/jobs/analyze
 * @desc    Analyze job description with AI
 * @access  Private
 */
router.post(
  '/jobs/analyze',
  validate(analyzeJobSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const { jobId, resumeId } = req.body;

    logger.info(`AI: Analyzing job ${jobId} - User: ${userId}${resumeId ? ` with resume ${resumeId}` : ''}`);

    // Fetch job from database
    const job = await prisma.job.findFirst({
      where: {
        id: jobId,
        userId: userId,
      },
    });

    if (!job) {
      throw new NotFoundError('Job not found');
    }

    // Validate job has description
    if (!job.jobDescription || job.jobDescription.trim().length < 50) {
      throw new BadRequestError('Job description is too short. Please add a detailed job description (at least 50 characters).');
    }

    // Fetch resume if provided
    let resume = null;
    let resumeData = undefined;
    if (resumeId) {
      resume = await prisma.resume.findFirst({
        where: {
          id: resumeId,
          userId: userId,
          isActive: true,
        },
      });

      if (!resume) {
        throw new NotFoundError('Resume not found');
      }

      // Ensure resume has been parsed
      if (!resume.parsedData) {
        throw new BadRequestError('Resume must be parsed before job analysis. Please wait for parsing to complete.');
      }

      // Check if parsedData contains an error object (from failed parsing)
      if (resume.parsedData && typeof resume.parsedData === 'object' && 'error' in resume.parsedData) {
        throw new BadRequestError(`Resume parsing failed: ${(resume.parsedData as any).error}. Please re-parse the resume.`);
      }

      resumeData = resume.parsedData as any;
    }

    // Check if analysis already exists for this job (get the most recent one)
    const existingAnalysis = await prisma.jobAnalysis.findFirst({
      where: {
        jobId: jobId,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    // If we have an existing analysis and it matches the requested resume (or both are null), return cached
    const isCacheValid = existingAnalysis && (
      (existingAnalysis.resumeId === resumeId) ||
      (existingAnalysis.resumeId === null && resumeId === undefined) ||
      (!resumeId && existingAnalysis.resumeId === null)
    );

    if (isCacheValid && existingAnalysis) {
      logger.info(`AI: Found cached job analysis ${existingAnalysis.id} for job ${jobId}${resumeId ? ` and resume ${resumeId}` : ''}`);

      const response: AnalyzeJobResponse = {
        analysis: {
          roleLevel: existingAnalysis.roleLevel as any,
          keyResponsibilities: existingAnalysis.keyResponsibilities as string[],
          requiredSkills: existingAnalysis.requiredSkills,
          preferredSkills: existingAnalysis.preferredSkills,
          redFlags: existingAnalysis.redFlags,
          highlights: existingAnalysis.highlights,
        },
        matchAnalysis: existingAnalysis.overallMatch !== null ? {
          overallMatch: existingAnalysis.overallMatch!,
          skillsMatch: existingAnalysis.skillsMatch!,
          experienceMatch: existingAnalysis.experienceMatch!,
          matchReasons: existingAnalysis.matchReasons,
          gaps: existingAnalysis.gaps,
          recommendations: existingAnalysis.recommendations as string[],
        } : undefined,
        salaryInsights: {
          estimatedRange: existingAnalysis.estimatedSalaryMin && existingAnalysis.estimatedSalaryMax
            ? `$${existingAnalysis.estimatedSalaryMin.toLocaleString()} - $${existingAnalysis.estimatedSalaryMax.toLocaleString()}`
            : 'Not disclosed',
          marketComparison: existingAnalysis.marketComparison,
          factors: existingAnalysis.salaryFactors,
        },
        applicationTips: existingAnalysis.applicationTips as string[],
      };

      return sendSuccess(res, response, 'Job analysis retrieved successfully (cached)');
    }

    // Execute AI analysis
    const agent = new JobAnalyzerAgent();
    const result = await agent.execute({
      jobTitle: job.title,
      companyName: job.company,
      jobDescription: job.jobDescription,
      location: job.location || undefined,
      salaryRange: job.salaryMin && job.salaryMax
        ? `$${job.salaryMin.toLocaleString()} - $${job.salaryMax.toLocaleString()} ${job.salaryCurrency || 'USD'}`
        : undefined,
      jobType: job.jobType || undefined,
      workMode: job.workMode || undefined,
      resumeData: resumeData,
    });

    if (!result.success || !result.data) {
      logger.error('Job analysis failed', {
        error: result.error,
        jobId,
        resumeId,
      });
      throw new Error(result.error?.message || 'Failed to analyze job');
    }

    const analysisData = result.data;

    // Parse estimated salary range
    let estimatedSalaryMin: number | undefined;
    let estimatedSalaryMax: number | undefined;
    if (analysisData.salaryInsights.estimatedRange) {
      const salaryMatch = analysisData.salaryInsights.estimatedRange.match(/\$?([\d,]+)\s*-\s*\$?([\d,]+)/);
      if (salaryMatch) {
        estimatedSalaryMin = parseInt(salaryMatch[1].replace(/,/g, ''));
        estimatedSalaryMax = parseInt(salaryMatch[2].replace(/,/g, ''));
      }
    }

    // Delete all previous analyses for this job to keep only the latest
    await prisma.jobAnalysis.deleteMany({
      where: {
        jobId: jobId,
      },
    });

    logger.info(`AI: Deleted previous analyses for job ${jobId}, creating new analysis`);

    // Save analysis to database
    const savedAnalysis = await prisma.jobAnalysis.create({
      data: {
        jobId: jobId,
        resumeId: resumeId || null,
        roleLevel: analysisData.analysis.roleLevel,
        keyResponsibilities: analysisData.analysis.keyResponsibilities,
        requiredSkills: analysisData.analysis.requiredSkills,
        preferredSkills: analysisData.analysis.preferredSkills,
        redFlags: analysisData.analysis.redFlags,
        highlights: analysisData.analysis.highlights,
        overallMatch: analysisData.matchAnalysis?.overallMatch || null,
        skillsMatch: analysisData.matchAnalysis?.skillsMatch || null,
        experienceMatch: analysisData.matchAnalysis?.experienceMatch || null,
        matchReasons: analysisData.matchAnalysis?.matchReasons || [],
        gaps: analysisData.matchAnalysis?.gaps || [],
        recommendations: analysisData.matchAnalysis?.recommendations || [],
        estimatedSalaryMin: estimatedSalaryMin || null,
        estimatedSalaryMax: estimatedSalaryMax || null,
        salaryCurrency: job.salaryCurrency || 'USD',
        marketComparison: analysisData.salaryInsights.marketComparison,
        salaryFactors: analysisData.salaryInsights.factors,
        applicationTips: analysisData.applicationTips,
        analysisMetadata: {
          model: result.model,
          usage: result.usage,
          timestamp: new Date().toISOString(),
        },
      },
    });

    // Update job's matchScore if resume was provided
    if (analysisData.matchAnalysis?.overallMatch) {
      await prisma.job.update({
        where: { id: jobId },
        data: { matchScore: analysisData.matchAnalysis.overallMatch },
      });
    }

    const response: AnalyzeJobResponse = {
      analysis: analysisData.analysis,
      matchAnalysis: analysisData.matchAnalysis,
      salaryInsights: analysisData.salaryInsights,
      applicationTips: analysisData.applicationTips,
    };

    logger.info(`AI: Job analysis completed - Match: ${analysisData.matchAnalysis?.overallMatch || 'N/A'}%`);

    return sendSuccess(res, response, 'Job analyzed successfully');
  })
);

// =================================
// RESEARCH ROUTES
// =================================

/**
 * @route   POST /api/ai/research/company
 * @desc    Research company using AI
 * @access  Private
 */
router.post(
  '/research/company',
  validate(researchCompanySchema),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const { companyName, jobId } = req.body;

    logger.info(`AI: Researching company ${companyName} - User: ${userId}`);

    // TODO: Implement CompanyResearchAgent
    // const agent = new CompanyResearchAgent();
    // const result = await agent.execute({ companyName, jobId, userId });

    // Temporary placeholder response
    const response: ResearchCompanyResponse = {
      company: {
        name: companyName,
        description: 'Leading technology company specializing in...',
        industry: 'Technology',
        size: '1000-5000 employees',
        founded: '2010',
        headquarters: 'San Francisco, CA',
      },
      culture: {
        values: ['Innovation', 'Collaboration', 'Excellence'],
        workEnvironment: ['Fast-paced', 'Remote-friendly', 'Results-oriented'],
        employeeReviews: [
          'Great work-life balance',
          'Strong engineering culture',
          'Competitive compensation',
        ],
      },
      recentNews: [
        {
          title: 'Company launches new product',
          summary: 'Announced innovative new platform...',
          date: '2025-10-01',
          relevance: 'Shows company growth and innovation',
        },
      ],
      financials: {
        status: 'Profitable',
        growth: 'Strong year-over-year growth',
        stability: 'Stable with strong funding',
      },
      interviewProcess: {
        stages: ['Phone Screen', 'Technical Interview', 'Onsite', 'Culture Fit'],
        difficulty: 'Medium to Hard',
        tips: [
          'Be prepared for coding challenges',
          'Research their products thoroughly',
          'Prepare questions about engineering culture',
        ],
      },
      questionsToAsk: [
        "What are the team's biggest technical challenges?",
        'How does the company support professional development?',
        'What does success look like in the first 6 months?',
      ],
    };

    logger.info(`AI: Company research completed for ${companyName}`);

    sendSuccess(res, response, 'Company research completed');
  })
);

/**
 * @route   POST /api/ai/research/interviewer
 * @desc    Research interviewer using AI
 * @access  Private
 */
router.post(
  '/research/interviewer',
  validate(researchInterviewerSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const { interviewerId, interviewerName, linkedinUrl, companyName } = req.body;

    logger.info(`AI: Researching interviewer - User: ${userId}`);

    // TODO: Implement InterviewerResearchAgent
    // const agent = new InterviewerResearchAgent();
    // const result = await agent.execute({ interviewerId, interviewerName, linkedinUrl, companyName, userId });

    // Temporary placeholder response
    const response: ResearchInterviewerResponse = {
      interviewer: {
        name: interviewerName || 'Interviewer Name',
        title: 'Senior Engineering Manager',
        department: 'Engineering',
        yearsAtCompany: '5 years',
      },
      background: {
        experience: [
          'Led teams of 10+ engineers',
          'Built multiple products from scratch',
          '15 years in tech industry',
        ],
        education: [
          'MS Computer Science - Stanford',
          'BS Engineering - UC Berkeley',
        ],
        specializations: ['System Architecture', 'Team Leadership', 'Product Development'],
      },
      commonInterests: ['Open Source', 'Tech Conferences', 'Mentorship'],
      conversationStarters: [
        'Ask about their experience building scalable systems',
        'Discuss recent tech trends they have posted about',
        'Inquire about team culture and development',
      ],
      interviewStyle: {
        type: 'Collaborative',
        focusAreas: ['Problem-solving', 'Communication', 'Technical depth'],
        tips: [
          'Be ready for system design discussions',
          'Show collaborative mindset',
          'Ask thoughtful questions',
        ],
      },
      questionsToConsider: [
        'How do you approach scaling engineering teams?',
        'What makes a successful engineer on your team?',
        'How does the team balance innovation with stability?',
      ],
    };

    logger.info('AI: Interviewer research completed');

    sendSuccess(res, response, 'Interviewer research completed');
  })
);

export default router;
