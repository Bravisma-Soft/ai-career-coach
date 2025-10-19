import { BaseAgent } from '@/ai/agents/base.agent';
import { AgentResponse, AgentExecutionOptions } from '@/types/ai.types';
import { ResponseParser } from '@/ai/utils/response-parser';
import { PromptBuilder } from '@/ai/utils/prompt-builder';
import {
  resumeParserPrompt,
  ParsedResumeData,
  RESUME_PARSER_SYSTEM_PROMPT,
} from '@/ai/prompts/resume-parser.prompt';
import { logger } from '@/config/logger';

/**
 * Resume Parser Agent
 *
 * AI agent that extracts structured data from resume text
 */

interface ResumeParserInput {
  resumeText: string;
  fileName?: string;
}

export class ResumeParserAgent extends BaseAgent<ResumeParserInput, ParsedResumeData> {
  constructor() {
    super({
      systemPrompt: RESUME_PARSER_SYSTEM_PROMPT,
      temperature: 0.3, // Low temperature for consistent extraction
      maxTokens: 4096,
    });

    logger.info('ResumeParserAgent initialized');
  }

  /**
   * Execute resume parsing
   */
  async execute(
    input: ResumeParserInput,
    options?: AgentExecutionOptions
  ): Promise<AgentResponse<ParsedResumeData>> {
    const { resumeText, fileName } = input;

    // Validate input
    if (!resumeText || resumeText.trim().length === 0) {
      return {
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Resume text is empty or invalid',
          type: 'validation_error',
          retryable: false,
        },
      };
    }

    // Truncate if too long (keep within token limits)
    const truncatedText =
      resumeText.length > 20000
        ? PromptBuilder.truncateText(resumeText, 20000)
        : resumeText;

    if (resumeText.length > 20000) {
      logger.warn('Resume text truncated', {
        original: resumeText.length,
        truncated: 20000,
        fileName,
      });
    }

    // Build user prompt
    const userPrompt = PromptBuilder.buildPrompt(
      resumeParserPrompt.userPromptTemplate,
      { resumeText: truncatedText }
    );

    logger.info('Starting resume parsing', {
      textLength: truncatedText.length,
      fileName,
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
      logger.error('Resume parsing failed', {
        error: response.error,
        fileName,
      });
      return response as unknown as AgentResponse<ParsedResumeData>;
    }

    // Parse JSON response
    const parsedData = await this.parseResponse(response.data!);

    if (!parsedData.success) {
      logger.error('Failed to parse resume response', {
        error: parsedData.error,
        fileName,
      });
      return parsedData;
    }

    // Validate parsed data
    const validationResult = this.validateParsedData(parsedData.data!);

    if (!validationResult.valid) {
      logger.warn('Parsed data validation warnings', {
        warnings: validationResult.warnings,
        fileName,
      });
    }

    logger.info('Resume parsing completed successfully', {
      fileName,
      hasName: !!parsedData.data?.personalInfo?.name,
      experienceCount: parsedData.data?.experiences?.length || 0,
      educationCount: parsedData.data?.educations?.length || 0,
      skillCount: parsedData.data?.skills?.length || 0,
      usage: response.usage,
    });

    return {
      success: true,
      data: parsedData.data!,
      rawResponse: response.rawResponse,
      usage: response.usage,
      model: response.model,
    };
  }

  /**
   * Parse Claude response into structured data
   */
  private async parseResponse(
    responseText: string
  ): Promise<AgentResponse<ParsedResumeData>> {
    // Extract JSON from response
    const jsonResult = ResponseParser.parseJSON<ParsedResumeData>(responseText);

    if (!jsonResult.success) {
      return {
        success: false,
        error: {
          code: 'PARSE_ERROR',
          message: 'Failed to extract JSON from resume parsing response',
          type: 'parsing_error',
          retryable: false,
          details: { response: responseText.substring(0, 500) },
        },
      };
    }

    const data = jsonResult.data!;

    // Ensure arrays exist (even if empty)
    if (!data.experiences) data.experiences = [];
    if (!data.educations) data.educations = [];
    if (!data.skills) data.skills = [];
    if (!data.certifications) data.certifications = [];

    // Ensure personalInfo exists
    if (!data.personalInfo) {
      data.personalInfo = {
        name: null,
        email: null,
        phone: null,
        location: null,
        city: null,
        state: null,
        country: null,
        linkedinUrl: null,
        githubUrl: null,
        portfolioUrl: null,
        websiteUrl: null,
      };
    }

    return {
      success: true,
      data,
    };
  }

  /**
   * Validate parsed resume data
   */
  private validateParsedData(data: ParsedResumeData): {
    valid: boolean;
    warnings: string[];
  } {
    const warnings: string[] = [];

    // Check for critical missing data
    if (!data.personalInfo?.name) {
      warnings.push('Name not found in resume');
    }

    if (!data.personalInfo?.email && !data.personalInfo?.phone) {
      warnings.push('No contact information (email or phone) found');
    }

    if (!data.experiences || data.experiences.length === 0) {
      warnings.push('No work experience found');
    }

    if (!data.educations || data.educations.length === 0) {
      warnings.push('No education information found');
    }

    if (!data.skills || data.skills.length === 0) {
      warnings.push('No skills found');
    }

    // Validate email format
    if (data.personalInfo?.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.personalInfo.email)) {
        warnings.push(`Invalid email format: ${data.personalInfo.email}`);
      }
    }

    // Validate experiences
    data.experiences?.forEach((exp, index) => {
      if (!exp.company) {
        warnings.push(`Experience ${index + 1}: Missing company name`);
      }
      if (!exp.position) {
        warnings.push(`Experience ${index + 1}: Missing position/title`);
      }
      if (!exp.startDate) {
        warnings.push(`Experience ${index + 1}: Missing start date`);
      }
    });

    // Validate educations
    data.educations?.forEach((edu, index) => {
      if (!edu.institution) {
        warnings.push(`Education ${index + 1}: Missing institution name`);
      }
      if (!edu.degree) {
        warnings.push(`Education ${index + 1}: Missing degree`);
      }
      if (!edu.fieldOfStudy) {
        warnings.push(`Education ${index + 1}: Missing field of study`);
      }
    });

    // Validate GPA range
    data.educations?.forEach((edu, index) => {
      if (edu.gpa !== null && (edu.gpa < 0 || edu.gpa > 5)) {
        warnings.push(`Education ${index + 1}: GPA ${edu.gpa} is out of valid range (0-5)`);
      }
    });

    return {
      valid: warnings.length === 0,
      warnings,
    };
  }

  /**
   * Extract specific section for debugging
   */
  async extractSection(
    resumeText: string,
    section: 'experience' | 'education' | 'skills'
  ): Promise<any> {
    const sectionPrompts = {
      experience: 'Extract only the work experience section',
      education: 'Extract only the education section',
      skills: 'Extract only the skills section',
    };

    const prompt = `${sectionPrompts[section]} from this resume:\n\n${resumeText}`;

    const response = await this.callClaude({
      userMessage: prompt,
      maxTokens: 2048,
    });

    if (response.success) {
      return ResponseParser.parseJSON(response.data!);
    }

    return null;
  }
}

// Export singleton instance
export const resumeParserAgent = new ResumeParserAgent();
