import { BaseAgent } from '@/ai/agents/base.agent';
import { AgentResponse, AgentExecutionOptions } from '@/types/ai.types';
import { ResponseParser } from '@/ai/utils/response-parser';
import { PromptBuilder } from '@/ai/utils/prompt-builder';
import {
  resumeAnalyzerPrompt,
  ResumeAnalysisResult,
  RESUME_ANALYZER_SYSTEM_PROMPT,
} from '@/ai/prompts/resume-analyzer.prompt';
import { ParsedResumeData } from '@/ai/prompts/resume-parser.prompt';
import { logger } from '@/config/logger';

/**
 * Resume Analyzer Agent
 *
 * AI agent that analyzes resume quality, ATS compatibility, and provides actionable feedback
 */

export interface ResumeAnalyzerInput {
  resumeData: ParsedResumeData;
  targetRole?: string;
  targetIndustry?: string;
}

export class ResumeAnalyzerAgent extends BaseAgent<ResumeAnalyzerInput, ResumeAnalysisResult> {
  constructor() {
    super({
      systemPrompt: RESUME_ANALYZER_SYSTEM_PROMPT,
      temperature: 0.5, // Balanced temperature for creative yet consistent analysis
      maxTokens: 4096,
    });

    logger.info('ResumeAnalyzerAgent initialized');
  }

  /**
   * Execute resume analysis
   */
  async execute(
    input: ResumeAnalyzerInput,
    options?: AgentExecutionOptions
  ): Promise<AgentResponse<ResumeAnalysisResult>> {
    const { resumeData, targetRole, targetIndustry } = input;

    // Validate input
    if (!resumeData) {
      return {
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Resume data is required for analysis',
          type: 'validation_error',
          retryable: false,
        },
      };
    }

    // Build user prompt with resume data
    const resumeDataJson = JSON.stringify(resumeData, null, 2);

    const userPrompt = PromptBuilder.buildPrompt(
      resumeAnalyzerPrompt.userPromptTemplate,
      {
        resumeData: resumeDataJson,
        targetRole: targetRole || 'Not specified - infer from resume',
        targetIndustry: targetIndustry || 'Not specified - infer from resume',
      }
    );

    logger.info('Starting resume analysis', {
      hasTargetRole: !!targetRole,
      hasTargetIndustry: !!targetIndustry,
      resumeDataSize: resumeDataJson.length,
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
      logger.error('Resume analysis failed', {
        error: response.error,
      });
      return response as unknown as AgentResponse<ResumeAnalysisResult>;
    }

    // Parse JSON response
    const parseResult = ResponseParser.parseJSON<ResumeAnalysisResult>(response.data!);

    if (!parseResult.success || !parseResult.data) {
      logger.error('Failed to parse resume analysis response', {
        rawResponse: response.data?.substring(0, 2000), // Increased from 1000 to see more context
        fullResponseLength: response.data?.length || 0,
        parseError: parseResult.error,
        targetRole,
        targetIndustry,
      });
      return {
        success: false,
        error: parseResult.error || {
          code: 'PARSE_ERROR',
          message: 'Failed to parse AI response as valid JSON. The AI may have returned an invalid format.',
          type: 'ai_error',
          retryable: true,
        },
      } as AgentResponse<ResumeAnalysisResult>;
    }

    const analysisData = parseResult.data;

    // Validate the analysis result structure
    const validationError = this.validateAnalysisResult(analysisData);
    if (validationError) {
      logger.error('Resume analysis validation failed', {
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
      } as AgentResponse<ResumeAnalysisResult>;
    }

    logger.info('Resume analysis completed successfully', {
      overallScore: analysisData.overallScore,
      atsScore: analysisData.atsScore,
      readabilityScore: analysisData.readabilityScore,
      strengthsCount: analysisData.strengths?.length || 0,
      suggestionsCount: analysisData.suggestions?.length || 0,
    });

    return {
      success: true,
      data: analysisData,
      usage: response.usage,
      model: response.model,
      stopReason: response.stopReason,
    } as AgentResponse<ResumeAnalysisResult>;
  }

  /**
   * Validate the structure of the analysis result
   */
  private validateAnalysisResult(result: any): string | null {
    // Check required top-level fields
    if (typeof result.overallScore !== 'number') {
      return 'Missing or invalid overallScore';
    }
    if (typeof result.atsScore !== 'number') {
      return 'Missing or invalid atsScore';
    }
    if (typeof result.readabilityScore !== 'number') {
      return 'Missing or invalid readabilityScore';
    }
    if (!Array.isArray(result.strengths)) {
      return 'Missing or invalid strengths array';
    }
    if (!Array.isArray(result.weaknesses)) {
      return 'Missing or invalid weaknesses array';
    }
    if (!result.sections || typeof result.sections !== 'object') {
      return 'Missing or invalid sections object';
    }
    if (!result.keywordAnalysis || typeof result.keywordAnalysis !== 'object') {
      return 'Missing or invalid keywordAnalysis object';
    }
    if (!Array.isArray(result.atsIssues)) {
      return 'Missing or invalid atsIssues array';
    }
    if (!Array.isArray(result.suggestions)) {
      return 'Missing or invalid suggestions array';
    }

    // Validate score ranges
    if (result.overallScore < 0 || result.overallScore > 100) {
      return 'overallScore must be between 0 and 100';
    }
    if (result.atsScore < 0 || result.atsScore > 100) {
      return 'atsScore must be between 0 and 100';
    }
    if (result.readabilityScore < 0 || result.readabilityScore > 100) {
      return 'readabilityScore must be between 0 and 100';
    }

    // Validate sections structure
    const requiredSections = ['summary', 'experience', 'education', 'skills'];
    for (const sectionName of requiredSections) {
      const section = result.sections[sectionName];
      if (!section || typeof section !== 'object') {
        return `Missing or invalid section: ${sectionName}`;
      }
      if (section.score !== null && (typeof section.score !== 'number' || section.score < 0 || section.score > 100)) {
        return `Invalid score for section ${sectionName}`;
      }
      if (typeof section.feedback !== 'string') {
        return `Missing or invalid feedback for section ${sectionName}`;
      }
      if (!Array.isArray(section.issues)) {
        return `Missing or invalid issues array for section ${sectionName}`;
      }
    }

    // Validate keyword analysis
    if (!Array.isArray(result.keywordAnalysis.matchedKeywords)) {
      return 'Invalid matchedKeywords in keywordAnalysis';
    }
    if (!Array.isArray(result.keywordAnalysis.missingKeywords)) {
      return 'Invalid missingKeywords in keywordAnalysis';
    }
    if (!Array.isArray(result.keywordAnalysis.overusedWords)) {
      return 'Invalid overusedWords in keywordAnalysis';
    }

    // Validate suggestions structure
    for (let i = 0; i < result.suggestions.length; i++) {
      const suggestion = result.suggestions[i];
      if (!suggestion.section || !suggestion.priority || !suggestion.issue ||
          !suggestion.suggestion || !suggestion.impact) {
        return `Invalid suggestion structure at index ${i}`;
      }
      if (!['high', 'medium', 'low'].includes(suggestion.priority)) {
        return `Invalid priority value at suggestion index ${i}`;
      }
      if (!suggestion.example || !suggestion.example.before || !suggestion.example.after) {
        return `Invalid example structure at suggestion index ${i}`;
      }
    }

    return null; // No validation errors
  }
}
