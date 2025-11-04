import { BaseAgent } from '@/ai/agents/base.agent';
import { AgentResponse, AgentExecutionOptions } from '@/types/ai.types';
import { ResponseParser } from '@/ai/utils/response-parser';
import { PromptBuilder } from '@/ai/utils/prompt-builder';
import {
  jobAnalyzerPrompt,
  JobAnalysisResult,
  JOB_ANALYZER_SYSTEM_PROMPT,
} from '@/ai/prompts/job-analyzer.prompt';
import { ParsedResumeData } from '@/ai/prompts/resume-parser.prompt';
import { logger } from '@/config/logger';

/**
 * Job Analyzer Agent
 *
 * AI agent that analyzes job postings, identifies requirements and red flags,
 * and matches them against candidate profiles when available
 */

export interface JobAnalyzerInput {
  jobTitle: string;
  companyName: string;
  jobDescription: string;
  location?: string;
  salaryRange?: string;
  jobType?: string;
  workMode?: string;
  resumeData?: ParsedResumeData; // Optional: for match analysis
}

export class JobAnalyzerAgent extends BaseAgent<JobAnalyzerInput, JobAnalysisResult> {
  constructor() {
    super({
      systemPrompt: JOB_ANALYZER_SYSTEM_PROMPT,
      temperature: 0.6, // Balanced for analytical yet insightful analysis
      maxTokens: 6000, // Sufficient for comprehensive job analysis
    });

    logger.info('JobAnalyzerAgent initialized');
  }

  /**
   * Execute job analysis
   */
  async execute(
    input: JobAnalyzerInput,
    options?: AgentExecutionOptions
  ): Promise<AgentResponse<JobAnalysisResult>> {
    const { jobTitle, companyName, jobDescription, location, salaryRange, jobType, workMode, resumeData } = input;

    // Validate input
    if (!jobTitle || !companyName || !jobDescription) {
      return {
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Job title, company name, and description are required for analysis',
          type: 'validation_error',
          retryable: false,
        },
      };
    }

    if (jobDescription.trim().length < 50) {
      return {
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Job description is too short. Please provide a detailed job description (at least 50 characters).',
          type: 'validation_error',
          retryable: false,
        },
      };
    }

    // Build job data context
    const jobData = this.formatJobData({
      jobTitle,
      companyName,
      jobDescription,
      location,
      salaryRange,
      jobType,
      workMode,
    });

    // Build resume data context (if provided)
    const resumeDataJson = resumeData
      ? JSON.stringify(resumeData, null, 2)
      : 'No candidate resume provided - perform job analysis only without match scoring';

    const userPrompt = PromptBuilder.buildPrompt(
      jobAnalyzerPrompt.userPromptTemplate,
      {
        jobData,
        resumeData: resumeDataJson,
      }
    );

    logger.info('Starting job analysis', {
      jobTitle,
      companyName,
      hasResume: !!resumeData,
      jobDescriptionLength: jobDescription.length,
    });

    // Call Claude API with retry
    const response = await this.executeWithRetry(
      async () =>
        await this.callClaude({
          userMessage: userPrompt,
          temperature: options?.temperature ?? this.config.temperature,
          maxTokens: options?.maxTokens ?? this.config.maxTokens,
        }),
      {
        maxRetries: options?.maxRetries ?? 2,
        retryDelay: 1000,
      }
    );

    if (!response.success) {
      logger.error('Job analysis failed', {
        error: response.error,
        jobTitle,
        companyName,
      });
      return response as unknown as AgentResponse<JobAnalysisResult>;
    }

    // Log response metadata
    logger.info('Claude API response received', {
      responseLength: response.data?.length || 0,
      stopReason: response.stopReason,
      usage: response.usage,
    });

    // Parse JSON response
    const parseResult = ResponseParser.parseJSON<JobAnalysisResult>(response.data!);

    if (!parseResult.success || !parseResult.data) {
      logger.error('Failed to parse job analysis response', {
        rawResponse: response.data?.substring(0, 2000),
        fullResponseLength: response.data?.length || 0,
        parseError: parseResult.error,
        jobTitle,
        companyName,
      });
      return {
        success: false,
        error: parseResult.error || {
          code: 'PARSE_ERROR',
          message: 'Failed to parse AI response as valid JSON. The AI may have returned an invalid format.',
          type: 'ai_error',
          retryable: true,
        },
      } as AgentResponse<JobAnalysisResult>;
    }

    const analysisData = parseResult.data;

    // Validate the analysis result structure
    const validationError = this.validateAnalysisResult(analysisData, !!resumeData);
    if (validationError) {
      logger.error('Job analysis validation failed', {
        error: validationError,
        analysisData: JSON.stringify(analysisData).substring(0, 500),
      });
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: validationError,
          type: 'validation_error',
          retryable: false,
        },
      } as AgentResponse<JobAnalysisResult>;
    }

    logger.info('Job analysis completed successfully', {
      roleLevel: analysisData.analysis.roleLevel,
      overallMatch: analysisData.matchAnalysis?.overallMatch,
      requiredSkillsCount: analysisData.analysis.requiredSkills.length,
      redFlagsCount: analysisData.analysis.redFlags.length,
    });

    return {
      success: true,
      data: analysisData,
      usage: response.usage,
      model: response.model,
      stopReason: response.stopReason,
    } as AgentResponse<JobAnalysisResult>;
  }

  /**
   * Format job data for AI analysis
   */
  private formatJobData(input: Omit<JobAnalyzerInput, 'resumeData'>): string {
    const { jobTitle, companyName, jobDescription, location, salaryRange, jobType, workMode } = input;

    let formatted = `Job Title: ${jobTitle}\n`;
    formatted += `Company: ${companyName}\n`;

    if (location) {
      formatted += `Location: ${location}\n`;
    }

    if (jobType) {
      formatted += `Job Type: ${jobType}\n`;
    }

    if (workMode) {
      formatted += `Work Mode: ${workMode}\n`;
    }

    if (salaryRange) {
      formatted += `Salary Range: ${salaryRange}\n`;
    }

    formatted += `\nJob Description:\n${jobDescription}`;

    return formatted;
  }

  /**
   * Validate the structure of the analysis result
   */
  private validateAnalysisResult(result: any, expectMatchAnalysis: boolean): string | null {
    // Check required top-level fields
    if (!result.analysis || typeof result.analysis !== 'object') {
      return 'Missing or invalid analysis object';
    }

    // Validate analysis object
    const { analysis } = result;

    if (!['entry', 'mid', 'senior', 'lead', 'executive'].includes(analysis.roleLevel)) {
      return 'Invalid roleLevel - must be one of: entry, mid, senior, lead, executive';
    }

    if (!Array.isArray(analysis.keyResponsibilities)) {
      return 'Missing or invalid keyResponsibilities array';
    }

    if (!Array.isArray(analysis.requiredSkills)) {
      return 'Missing or invalid requiredSkills array';
    }

    if (!Array.isArray(analysis.preferredSkills)) {
      return 'Missing or invalid preferredSkills array';
    }

    if (!Array.isArray(analysis.redFlags)) {
      return 'Missing or invalid redFlags array';
    }

    if (!Array.isArray(analysis.highlights)) {
      return 'Missing or invalid highlights array';
    }

    // Validate matchAnalysis if resume was provided
    if (expectMatchAnalysis) {
      if (!result.matchAnalysis || typeof result.matchAnalysis !== 'object') {
        return 'Missing matchAnalysis object when resume data was provided';
      }

      const { matchAnalysis } = result;

      if (typeof matchAnalysis.overallMatch !== 'number' ||
          matchAnalysis.overallMatch < 0 || matchAnalysis.overallMatch > 100) {
        return 'Invalid overallMatch score (must be 0-100)';
      }

      if (typeof matchAnalysis.skillsMatch !== 'number' ||
          matchAnalysis.skillsMatch < 0 || matchAnalysis.skillsMatch > 100) {
        return 'Invalid skillsMatch score (must be 0-100)';
      }

      if (typeof matchAnalysis.experienceMatch !== 'number' ||
          matchAnalysis.experienceMatch < 0 || matchAnalysis.experienceMatch > 100) {
        return 'Invalid experienceMatch score (must be 0-100)';
      }

      if (!Array.isArray(matchAnalysis.matchReasons)) {
        return 'Missing or invalid matchReasons array';
      }

      if (!Array.isArray(matchAnalysis.gaps)) {
        return 'Missing or invalid gaps array';
      }

      if (!Array.isArray(matchAnalysis.recommendations)) {
        return 'Missing or invalid recommendations array';
      }
    }

    // Validate salaryInsights
    if (!result.salaryInsights || typeof result.salaryInsights !== 'object') {
      return 'Missing or invalid salaryInsights object';
    }

    const { salaryInsights } = result;

    if (typeof salaryInsights.estimatedRange !== 'string') {
      return 'Missing or invalid estimatedRange in salaryInsights';
    }

    if (typeof salaryInsights.marketComparison !== 'string') {
      return 'Missing or invalid marketComparison in salaryInsights';
    }

    if (!Array.isArray(salaryInsights.factors)) {
      return 'Missing or invalid factors array in salaryInsights';
    }

    // Validate applicationTips
    if (!Array.isArray(result.applicationTips)) {
      return 'Missing or invalid applicationTips array';
    }

    return null; // No validation errors
  }

  /**
   * Get a human-readable summary of the analysis
   */
  getSummary(result: JobAnalysisResult): string {
    const { analysis, matchAnalysis, salaryInsights } = result;

    let summary = `Job Analysis Summary:\n`;
    summary += `- Role Level: ${analysis.roleLevel}\n`;
    summary += `- Required Skills: ${analysis.requiredSkills.length}\n`;
    summary += `- Preferred Skills: ${analysis.preferredSkills.length}\n`;
    summary += `- Red Flags: ${analysis.redFlags.length}\n`;
    summary += `- Highlights: ${analysis.highlights.length}\n`;

    if (matchAnalysis) {
      summary += `\nMatch Analysis:\n`;
      summary += `- Overall Match: ${matchAnalysis.overallMatch}%\n`;
      summary += `- Skills Match: ${matchAnalysis.skillsMatch}%\n`;
      summary += `- Experience Match: ${matchAnalysis.experienceMatch}%\n`;
      summary += `- Gaps Identified: ${matchAnalysis.gaps.length}\n`;
    }

    summary += `\nSalary: ${salaryInsights.estimatedRange} (${salaryInsights.marketComparison})`;

    return summary;
  }
}

// Export singleton instance
export const jobAnalyzerAgent = new JobAnalyzerAgent();
