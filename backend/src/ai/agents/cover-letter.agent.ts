import { BaseAgent } from '@/ai/agents/base.agent';
import { AgentResponse, AgentExecutionOptions } from '@/types/ai.types';
import { ResponseParser } from '@/ai/utils/response-parser';
import { PromptBuilder } from '@/ai/utils/prompt-builder';
import {
  coverLetterPrompt,
  GeneratedCoverLetterData,
  COVER_LETTER_SYSTEM_PROMPT,
} from '@/ai/prompts/cover-letter.prompt';
import { ParsedResumeData } from '@/ai/prompts/resume-parser.prompt';
import { logger } from '@/config/logger';

/**
 * Cover Letter Agent
 *
 * AI agent that generates compelling, personalized cover letters
 * based on candidate's resume and target job description
 */

export interface CoverLetterInput {
  resume: ParsedResumeData;
  jobDescription: string;
  jobTitle: string;
  companyName: string;
  tone?: 'professional' | 'enthusiastic' | 'formal';
  length?: 'short' | 'medium' | 'long';
  focusPoints?: string[];
  additionalNotes?: string;
}

export interface GenerateCoverLetterResult {
  coverLetter: string;
  subject: string;
  keyPoints: string[];
  matchedRequirements: string[];
  tone: 'professional' | 'enthusiastic' | 'formal';
  wordCount: number;
  estimatedReadTime: string;
  suggestions: string[];
}

export class CoverLetterAgent extends BaseAgent<CoverLetterInput, GenerateCoverLetterResult> {
  constructor() {
    super({
      systemPrompt: COVER_LETTER_SYSTEM_PROMPT,
      temperature: 0.7, // More creative for engaging writing
      maxTokens: 2048, // Sufficient for cover letter
    });

    logger.info('CoverLetterAgent initialized');
  }

  /**
   * Execute cover letter generation
   */
  async execute(
    input: CoverLetterInput,
    options?: AgentExecutionOptions
  ): Promise<AgentResponse<GenerateCoverLetterResult>> {
    const { resume, jobDescription, jobTitle, companyName, tone = 'professional', additionalNotes = '' } = input;

    // Validate input
    const validationError = this.validateInput(input);
    if (validationError) {
      return validationError;
    }

    // Extract job requirements
    const jobRequirements = this.extractJobRequirements(jobDescription);

    // Build user prompt
    const userPrompt = this.buildCoverLetterPrompt(
      resume,
      jobTitle,
      companyName,
      jobDescription,
      jobRequirements,
      tone,
      additionalNotes
    );

    logger.info('Starting cover letter generation', {
      jobTitle,
      companyName,
      tone,
      experienceCount: resume.experiences?.length || 0,
      jobDescLength: jobDescription.length,
    });

    // Call Claude API with retry logic
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
      logger.error('Cover letter generation failed', {
        error: response.error,
        jobTitle,
        companyName,
      });
      return response as unknown as AgentResponse<GenerateCoverLetterResult>;
    }

    // Parse JSON response
    const coverLetterData = await this.parseResponse(response.data!);

    if (!coverLetterData.success) {
      logger.error('Failed to parse cover letter response', {
        error: coverLetterData.error,
        jobTitle,
        companyName,
      });
      return coverLetterData;
    }

    logger.info('Cover letter generated successfully', {
      jobTitle,
      companyName,
      wordCount: coverLetterData.data!.wordCount,
      tone: coverLetterData.data!.tone,
      usage: response.usage,
    });

    return {
      success: true,
      data: coverLetterData.data!,
      rawResponse: response.rawResponse,
      usage: response.usage,
      model: response.model,
    };
  }

  /**
   * Validate input parameters
   */
  private validateInput(input: CoverLetterInput): AgentResponse<GenerateCoverLetterResult> | null {
    const errors: string[] = [];

    // Validate resume
    if (!input.resume) {
      errors.push('Resume data is required');
    } else {
      if (!input.resume.experiences || input.resume.experiences.length === 0) {
        errors.push('Resume must have at least one work experience');
      }
      if (!input.resume.personalInfo || !input.resume.personalInfo.name) {
        errors.push('Resume must have personal information with name');
      }
    }

    // Validate job description
    if (!input.jobDescription || input.jobDescription.trim().length < 50) {
      errors.push('Job description must be at least 50 characters');
    }

    if (!input.jobTitle || input.jobTitle.trim().length === 0) {
      errors.push('Job title is required');
    }

    if (!input.companyName || input.companyName.trim().length === 0) {
      errors.push('Company name is required');
    }

    // Validate tone
    if (input.tone && !['professional', 'enthusiastic', 'formal'].includes(input.tone)) {
      errors.push('Tone must be one of: professional, enthusiastic, formal');
    }

    if (errors.length > 0) {
      return {
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: `Validation failed: ${errors.join(', ')}`,
          type: 'validation_error',
          retryable: false,
          details: { errors },
        },
      };
    }

    return null;
  }

  /**
   * Extract job requirements from description
   */
  private extractJobRequirements(description: string): string {
    // Try to extract requirements section
    const reqMatch = description.match(/(?:requirements?|qualifications?|must[- ]haves?)[:\s]*([^]*?)(?=\n\n|responsibilities|about|$)/i);

    if (reqMatch && reqMatch[1]) {
      return reqMatch[1].trim();
    }

    // If no clear requirements section, return first 500 chars as requirements
    return description.substring(0, 500) + (description.length > 500 ? '...' : '');
  }

  /**
   * Build comprehensive cover letter prompt
   */
  private buildCoverLetterPrompt(
    resume: ParsedResumeData,
    jobTitle: string,
    companyName: string,
    jobDescription: string,
    jobRequirements: string,
    tone: string,
    additionalNotes: string
  ): string {
    // Convert resume data to readable format
    const resumeText = this.formatResumeForPrompt(resume);

    // Build prompt using template
    const prompt = PromptBuilder.buildPrompt(coverLetterPrompt.userPromptTemplate, {
      resumeData: resumeText,
      jobTitle,
      company: companyName,
      jobDescription,
      jobRequirements,
      tone,
      additionalNotes: additionalNotes || 'None provided',
    });

    return prompt;
  }

  /**
   * Format resume data into readable text for the prompt
   */
  private formatResumeForPrompt(resume: ParsedResumeData): string {
    const sections: string[] = [];

    // Personal Info
    if (resume.personalInfo) {
      const info = resume.personalInfo;
      sections.push('# PERSONAL INFORMATION');
      if (info.name) sections.push(`Name: ${info.name}`);
      if (info.email) sections.push(`Email: ${info.email}`);
      if (info.phone) sections.push(`Phone: ${info.phone}`);
      if (info.location) sections.push(`Location: ${info.location}`);
      if (info.linkedinUrl) sections.push(`LinkedIn: ${info.linkedinUrl}`);
      if (info.githubUrl) sections.push(`GitHub: ${info.githubUrl}`);
      sections.push('');
    }

    // Summary
    if (resume.summary) {
      sections.push('# PROFESSIONAL SUMMARY');
      sections.push(resume.summary);
      sections.push('');
    }

    // Work Experience (most important for cover letter)
    if (resume.experiences && resume.experiences.length > 0) {
      sections.push('# WORK EXPERIENCE');
      resume.experiences.forEach((exp, idx) => {
        sections.push(`\n## ${exp.position} at ${exp.company}`);
        sections.push(`Duration: ${exp.startDate} - ${exp.endDate || 'Present'}`);
        if (exp.location) sections.push(`Location: ${exp.location}`);

        if (exp.description) {
          sections.push(`\nDescription: ${exp.description}`);
        }

        if (exp.achievements && exp.achievements.length > 0) {
          sections.push('\nKey Achievements:');
          exp.achievements.forEach((achievement) => {
            sections.push(`• ${achievement}`);
          });
        }

        if (exp.technologies && exp.technologies.length > 0) {
          sections.push(`\nTechnologies Used: ${exp.technologies.join(', ')}`);
        }
      });
      sections.push('');
    }

    // Education
    if (resume.educations && resume.educations.length > 0) {
      sections.push('# EDUCATION');
      resume.educations.forEach((edu) => {
        sections.push(`\n${edu.degree} in ${edu.fieldOfStudy}`);
        sections.push(`${edu.institution}`);
        if (edu.gpa) sections.push(`GPA: ${edu.gpa}`);
      });
      sections.push('');
    }

    // Skills
    if (resume.skills && resume.skills.length > 0) {
      sections.push('# SKILLS');
      const skillNames = resume.skills.map(s => s.name).join(', ');
      sections.push(skillNames);
      sections.push('');
    }

    // Certifications
    if (resume.certifications && resume.certifications.length > 0) {
      sections.push('# CERTIFICATIONS');
      resume.certifications.forEach((cert) => {
        sections.push(`• ${cert.name} - ${cert.issuingOrganization}`);
      });
      sections.push('');
    }

    return sections.join('\n');
  }

  /**
   * Parse Claude response into structured cover letter data
   */
  private async parseResponse(
    responseText: string
  ): Promise<AgentResponse<GenerateCoverLetterResult>> {
    // Extract JSON from response
    const jsonResult = ResponseParser.parseJSON<GeneratedCoverLetterData>(responseText);

    if (!jsonResult.success) {
      return {
        success: false,
        error: {
          code: 'PARSE_ERROR',
          message: 'Failed to extract JSON from cover letter response',
          type: 'parsing_error',
          retryable: true,
          details: { response: responseText.substring(0, 1000) },
        },
      };
    }

    const data = jsonResult.data!;

    // Validate required fields
    if (!data.coverLetter || data.coverLetter.trim().length === 0) {
      return {
        success: false,
        error: {
          code: 'INVALID_RESPONSE',
          message: 'Response missing cover letter content',
          type: 'parsing_error',
          retryable: true,
        },
      };
    }

    // Ensure arrays exist
    if (!data.keyPoints) data.keyPoints = [];
    if (!data.matchedRequirements) data.matchedRequirements = [];
    if (!data.suggestions) data.suggestions = [];

    // Validate word count
    if (!data.wordCount || data.wordCount < 1) {
      data.wordCount = data.coverLetter.split(/\s+/).length;
    }

    // Validate tone
    if (!data.tone || !['professional', 'enthusiastic', 'formal'].includes(data.tone)) {
      data.tone = 'professional';
    }

    // Ensure estimated read time exists
    if (!data.estimatedReadTime) {
      const minutes = Math.ceil(data.wordCount / 200); // Average reading speed
      data.estimatedReadTime = `${minutes} minute${minutes > 1 ? 's' : ''}`;
    }

    // Ensure subject exists
    if (!data.subject) {
      data.subject = 'Application for Position';
    }

    const result: GenerateCoverLetterResult = {
      coverLetter: data.coverLetter,
      subject: data.subject,
      keyPoints: data.keyPoints,
      matchedRequirements: data.matchedRequirements,
      tone: data.tone,
      wordCount: data.wordCount,
      estimatedReadTime: data.estimatedReadTime,
      suggestions: data.suggestions,
    };

    return {
      success: true,
      data: result,
    };
  }

  /**
   * Get summary of cover letter generation
   */
  getSummary(result: GenerateCoverLetterResult): string {
    const lines: string[] = [];

    lines.push(`Cover Letter Generated Successfully`);
    lines.push(`Word Count: ${result.wordCount}`);
    lines.push(`Tone: ${result.tone}`);
    lines.push(`Estimated Read Time: ${result.estimatedReadTime}`);

    if (result.keyPoints.length > 0) {
      lines.push(`\nKey Qualifications Highlighted:`);
      result.keyPoints.forEach((point, idx) => {
        lines.push(`  ${idx + 1}. ${point}`);
      });
    }

    if (result.matchedRequirements.length > 0) {
      lines.push(`\nJob Requirements Addressed: ${result.matchedRequirements.length}`);
    }

    if (result.suggestions.length > 0) {
      lines.push(`\nSuggestions for Enhancement:`);
      result.suggestions.slice(0, 3).forEach((suggestion, idx) => {
        lines.push(`  ${idx + 1}. ${suggestion}`);
      });
    }

    return lines.join('\n');
  }
}

// Export singleton instance
export const coverLetterAgent = new CoverLetterAgent();
