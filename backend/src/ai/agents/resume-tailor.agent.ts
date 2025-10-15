import { BaseAgent } from '@/ai/agents/base.agent';
import { AgentResponse, AgentExecutionOptions } from '@/types/ai.types';
import { ResponseParser } from '@/ai/utils/response-parser';
import { PromptBuilder } from '@/ai/utils/prompt-builder';
import {
  resumeTailorPrompt,
  TailoredResumeData,
  RESUME_TAILOR_SYSTEM_PROMPT,
} from '@/ai/prompts/resume-tailor.prompt';
import { ParsedResumeData } from '@/ai/prompts/resume-parser.prompt';
import { logger } from '@/config/logger';

/**
 * Resume Tailor Agent
 *
 * AI agent that intelligently tailors resumes to match specific job descriptions
 * while maintaining truthfulness and professional standards
 */

export interface ResumeTailorInput {
  resume: ParsedResumeData;
  jobDescription: string;
  jobTitle: string;
  companyName: string;
  jobRequirements?: string;
  jobPreferredQualifications?: string;
}

export interface TailorResumeResult {
  tailoredResume: ParsedResumeData;
  matchScore: number;
  changes: Array<{
    section: string;
    field: string;
    original: string;
    modified: string;
    reason: string;
  }>;
  keywordAlignment: {
    matched: string[];
    missing: string[];
    suggestions: string[];
  };
  recommendations: string[];
  estimatedImpact: 'high' | 'medium' | 'low';
  atsScore?: number;
  summary?: string;
}

export class ResumeTailorAgent extends BaseAgent<ResumeTailorInput, TailorResumeResult> {
  constructor() {
    super({
      systemPrompt: RESUME_TAILOR_SYSTEM_PROMPT,
      temperature: 0.5, // Balanced for creativity and accuracy
      maxTokens: 8000, // Large enough for complete tailored resume
    });

    logger.info('ResumeTailorAgent initialized');
  }

  /**
   * Execute resume tailoring
   */
  async execute(
    input: ResumeTailorInput,
    options?: AgentExecutionOptions
  ): Promise<AgentResponse<TailorResumeResult>> {
    const { resume, jobDescription, jobTitle, companyName, jobRequirements, jobPreferredQualifications } = input;

    // Validate input
    const validationError = this.validateInput(input);
    if (validationError) {
      return validationError;
    }

    // Extract and parse job requirements
    const parsedJobData = this.parseJobDescription(jobDescription, jobRequirements, jobPreferredQualifications);

    // Build user prompt with all context
    const userPrompt = this.buildTailoringPrompt(
      resume,
      jobTitle,
      companyName,
      jobDescription,
      parsedJobData.requirements,
      parsedJobData.preferredQualifications
    );

    logger.info('Starting resume tailoring', {
      jobTitle,
      companyName,
      experienceCount: resume.experiences?.length || 0,
      skillCount: resume.skills?.length || 0,
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
        maxRetries: options?.maxRetries ?? 3, // More retries for complex task
        retryDelay: 2000, // Longer delay between retries
      }
    );

    if (!response.success) {
      logger.error('Resume tailoring failed', {
        error: response.error,
        jobTitle,
        companyName,
      });
      return response as unknown as AgentResponse<TailorResumeResult>;
    }

    // Parse JSON response
    const tailoredData = await this.parseResponse(response.data!);

    if (!tailoredData.success) {
      logger.error('Failed to parse tailoring response', {
        error: tailoredData.error,
        jobTitle,
        companyName,
      });
      return tailoredData;
    }

    // Validate and enrich tailored data
    const enrichedResult = this.enrichTailoredResult(tailoredData.data!, resume);

    // Calculate estimated impact
    const estimatedImpact = this.calculateEstimatedImpact(enrichedResult);

    const finalResult: TailorResumeResult = {
      ...enrichedResult,
      estimatedImpact,
    };

    logger.info('Resume tailoring completed successfully', {
      jobTitle,
      companyName,
      matchScore: finalResult.matchScore,
      changesCount: finalResult.changes.length,
      atsScore: finalResult.atsScore,
      estimatedImpact,
      usage: response.usage,
    });

    return {
      success: true,
      data: finalResult,
      rawResponse: response.rawResponse,
      usage: response.usage,
      model: response.model,
    };
  }

  /**
   * Validate input parameters
   */
  private validateInput(input: ResumeTailorInput): AgentResponse<TailorResumeResult> | null {
    const errors: string[] = [];

    // Validate resume
    if (!input.resume) {
      errors.push('Resume data is required');
    } else {
      if (!input.resume.experiences || input.resume.experiences.length === 0) {
        errors.push('Resume must have at least one work experience');
      }
      if (!input.resume.skills || input.resume.skills.length === 0) {
        errors.push('Resume must have at least one skill');
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
   * Parse job description to extract requirements and qualifications
   */
  private parseJobDescription(
    description: string,
    requirements?: string,
    preferredQualifications?: string
  ): {
    requirements: string;
    preferredQualifications: string;
  } {
    // If requirements are provided separately, use them
    if (requirements && requirements.trim().length > 0) {
      return {
        requirements,
        preferredQualifications: preferredQualifications && preferredQualifications.trim().length > 0 ? preferredQualifications : 'Not specified',
      };
    }

    // Otherwise, try to extract from description
    const reqMatch = description.match(/(?:requirements?|qualifications?|must[- ]haves?)[:\s]*([^]*?)(?=\n\n|preferred|nice[- ]to[- ]have|$)/i);
    const prefMatch = description.match(/(?:preferred|nice[- ]to[- ]have|bonus)[:\s]*([^]*?)(?=\n\n|$)/i);

    return {
      requirements: reqMatch && reqMatch[1] ? reqMatch[1].trim() : description,
      preferredQualifications: prefMatch && prefMatch[1] ? prefMatch[1].trim() : 'Not specified',
    };
  }

  /**
   * Build comprehensive tailoring prompt
   */
  private buildTailoringPrompt(
    resume: ParsedResumeData,
    jobTitle: string,
    companyName: string,
    jobDescription: string,
    requirements: string,
    preferredQualifications: string
  ): string {
    // Convert resume data to readable format
    const resumeText = this.formatResumeForPrompt(resume);

    // Build prompt using template
    const prompt = PromptBuilder.buildPrompt(resumeTailorPrompt.userPromptTemplate, {
      resumeData: resumeText,
      jobTitle,
      company: companyName,
      jobDescription,
      jobRequirements: requirements,
      jobPreferredQualifications: preferredQualifications,
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

    // Work Experience
    if (resume.experiences && resume.experiences.length > 0) {
      sections.push('# WORK EXPERIENCE');
      resume.experiences.forEach((exp, idx) => {
        sections.push(`\n## Experience ${idx + 1}`);
        sections.push(`Company: ${exp.company}`);
        sections.push(`Position: ${exp.position}`);
        if (exp.location) sections.push(`Location: ${exp.location}`);
        sections.push(`Duration: ${exp.startDate} - ${exp.endDate || 'Present'}`);
        if (exp.isCurrent) sections.push('Current Position: Yes');

        if (exp.description) {
          sections.push(`\nDescription: ${exp.description}`);
        }

        if (exp.achievements && exp.achievements.length > 0) {
          sections.push('\nAchievements:');
          exp.achievements.forEach((achievement) => {
            sections.push(`• ${achievement}`);
          });
        }

        if (exp.technologies && exp.technologies.length > 0) {
          sections.push(`\nTechnologies: ${exp.technologies.join(', ')}`);
        }
      });
      sections.push('');
    }

    // Education
    if (resume.educations && resume.educations.length > 0) {
      sections.push('# EDUCATION');
      resume.educations.forEach((edu, idx) => {
        sections.push(`\n## Education ${idx + 1}`);
        sections.push(`Institution: ${edu.institution}`);
        sections.push(`Degree: ${edu.degree}`);
        sections.push(`Field of Study: ${edu.fieldOfStudy}`);
        if (edu.startDate || edu.endDate) {
          sections.push(`Duration: ${edu.startDate || 'N/A'} - ${edu.endDate || 'Present'}`);
        }
        if (edu.gpa) sections.push(`GPA: ${edu.gpa}`);

        if (edu.honors && edu.honors.length > 0) {
          sections.push(`Honors: ${edu.honors.join(', ')}`);
        }

        if (edu.coursework && edu.coursework.length > 0) {
          sections.push(`Relevant Coursework: ${edu.coursework.join(', ')}`);
        }
      });
      sections.push('');
    }

    // Skills
    if (resume.skills && resume.skills.length > 0) {
      sections.push('# SKILLS');

      // Group skills by category
      const skillsByCategory: Record<string, string[]> = {};
      resume.skills.forEach((skill) => {
        const category = skill.category || 'Other';
        if (!skillsByCategory[category]) {
          skillsByCategory[category] = [];
        }
        const skillText = skill.level ? `${skill.name} (${skill.level})` : skill.name;
        skillsByCategory[category].push(skillText);
      });

      Object.entries(skillsByCategory).forEach(([category, skills]) => {
        sections.push(`\n${category}:`);
        sections.push(skills.join(', '));
      });
      sections.push('');
    }

    // Certifications
    if (resume.certifications && resume.certifications.length > 0) {
      sections.push('# CERTIFICATIONS');
      resume.certifications.forEach((cert, idx) => {
        sections.push(`\n${idx + 1}. ${cert.name}`);
        sections.push(`   Organization: ${cert.issuingOrganization}`);
        if (cert.issueDate) sections.push(`   Issue Date: ${cert.issueDate}`);
        if (cert.expiryDate) sections.push(`   Expiry Date: ${cert.expiryDate}`);
        if (cert.credentialId) sections.push(`   Credential ID: ${cert.credentialId}`);
      });
      sections.push('');
    }

    return sections.join('\n');
  }

  /**
   * Parse Claude response into structured tailored resume data
   */
  private async parseResponse(
    responseText: string
  ): Promise<AgentResponse<TailorResumeResult>> {
    // Extract JSON from response
    const jsonResult = ResponseParser.parseJSON<TailoredResumeData>(responseText);

    if (!jsonResult.success) {
      return {
        success: false,
        error: {
          code: 'PARSE_ERROR',
          message: 'Failed to extract JSON from resume tailoring response',
          type: 'parsing_error',
          retryable: true, // Can retry as it might be a formatting issue
          details: { response: responseText.substring(0, 1000) },
        },
      };
    }

    const data = jsonResult.data!;

    // Validate required fields
    if (!data.tailoredResume) {
      return {
        success: false,
        error: {
          code: 'INVALID_RESPONSE',
          message: 'Response missing tailoredResume field',
          type: 'parsing_error',
          retryable: true,
        },
      };
    }

    if (typeof data.matchScore !== 'number' || data.matchScore < 0 || data.matchScore > 100) {
      logger.warn('Invalid match score, defaulting to 50', { matchScore: data.matchScore });
      data.matchScore = 50;
    }

    // Ensure arrays exist
    if (!data.changes) data.changes = [];
    if (!data.recommendations) data.recommendations = [];

    // Build result object
    const result: TailorResumeResult = {
      tailoredResume: data.tailoredResume as unknown as ParsedResumeData,
      matchScore: data.matchScore,
      changes: data.changes,
      keywordAlignment: {
        matched: data.keywordAlignment?.requiredSkills?.present || [],
        missing: data.keywordAlignment?.requiredSkills?.missing || [],
        suggestions: data.keywordAlignment?.addedKeywords || [],
      },
      recommendations: data.recommendations,
      estimatedImpact: 'medium', // Will be calculated later
      atsScore: data.atsScore,
      summary: data.summary,
    };

    return {
      success: true,
      data: result,
    };
  }

  /**
   * Enrich tailored result with additional data
   */
  private enrichTailoredResult(
    result: TailorResumeResult,
    originalResume: ParsedResumeData
  ): TailorResumeResult {
    // Ensure tailoredResume has proper structure matching ParsedResumeData
    const tailored = result.tailoredResume as any;

    // Ensure all arrays from original resume are present
    if (!tailored.experiences) {
      tailored.experiences = originalResume.experiences || [];
    }
    if (!tailored.educations) {
      tailored.educations = originalResume.educations || [];
    }
    if (!tailored.skills) {
      tailored.skills = originalResume.skills || [];
    }
    if (!tailored.certifications) {
      tailored.certifications = originalResume.certifications || [];
    }

    // Preserve personal info if missing
    if (!tailored.personalInfo) {
      tailored.personalInfo = originalResume.personalInfo;
    }

    return result;
  }

  /**
   * Calculate estimated impact of tailoring
   */
  private calculateEstimatedImpact(result: TailorResumeResult): 'high' | 'medium' | 'low' {
    const { matchScore, changes, keywordAlignment, atsScore } = result;

    // High impact indicators
    const hasSignificantChanges = changes.length >= 5;
    const highMatchScore = matchScore >= 80;
    const goodAtsScore = atsScore ? atsScore >= 85 : false;
    const manyKeywordsMatched = keywordAlignment.matched.length >= 10;

    if (highMatchScore && (hasSignificantChanges || goodAtsScore) && manyKeywordsMatched) {
      return 'high';
    }

    // Low impact indicators
    const lowMatchScore = matchScore < 60;
    const fewChanges = changes.length < 3;
    const lowAtsScore = atsScore ? atsScore < 70 : false;

    if (lowMatchScore || (fewChanges && lowAtsScore)) {
      return 'low';
    }

    // Medium impact (default)
    return 'medium';
  }

  /**
   * Get summary of tailoring changes
   */
  getSummary(result: TailorResumeResult): string {
    const lines: string[] = [];

    lines.push(`Match Score: ${result.matchScore}%`);

    if (result.atsScore) {
      lines.push(`ATS Score: ${result.atsScore}%`);
    }

    lines.push(`\nChanges Made: ${result.changes.length}`);

    if (result.changes.length > 0) {
      // Group changes by section
      const changesBySection: Record<string, number> = {};
      result.changes.forEach((change) => {
        changesBySection[change.section] = (changesBySection[change.section] || 0) + 1;
      });

      Object.entries(changesBySection).forEach(([section, count]) => {
        lines.push(`  - ${section}: ${count} changes`);
      });
    }

    lines.push(`\nKeyword Alignment:`);
    lines.push(`  - Matched: ${result.keywordAlignment.matched.length} keywords`);
    lines.push(`  - Missing: ${result.keywordAlignment.missing.length} keywords`);
    lines.push(`  - Suggestions: ${result.keywordAlignment.suggestions.length} additions`);

    lines.push(`\nEstimated Impact: ${result.estimatedImpact.toUpperCase()}`);

    if (result.recommendations.length > 0) {
      lines.push(`\nTop Recommendations:`);
      result.recommendations.slice(0, 3).forEach((rec, idx) => {
        lines.push(`  ${idx + 1}. ${rec}`);
      });
    }

    return lines.join('\n');
  }

  /**
   * Compare original and tailored resume to generate diff
   */
  generateDiff(original: ParsedResumeData, tailored: ParsedResumeData): Array<{
    section: string;
    field: string;
    before: any;
    after: any;
  }> {
    const diffs: Array<{ section: string; field: string; before: any; after: any }> = [];

    // Compare summary
    if (original.summary !== tailored.summary) {
      diffs.push({
        section: 'summary',
        field: 'text',
        before: original.summary,
        after: tailored.summary,
      });
    }

    // Compare experiences
    if (original.experiences && tailored.experiences) {
      original.experiences.forEach((origExp, idx) => {
        const tailoredExp = tailored.experiences[idx];
        if (tailoredExp) {
          // Compare achievements
          if (JSON.stringify(origExp.achievements) !== JSON.stringify(tailoredExp.achievements)) {
            diffs.push({
              section: 'experience',
              field: `${origExp.position} at ${origExp.company} - achievements`,
              before: origExp.achievements,
              after: tailoredExp.achievements,
            });
          }
        }
      });
    }

    // Compare skills
    if (original.skills && tailored.skills) {
      const origSkillNames = original.skills.map((s) => s.name).sort();
      const tailoredSkillNames = tailored.skills.map((s) => s.name).sort();

      if (JSON.stringify(origSkillNames) !== JSON.stringify(tailoredSkillNames)) {
        diffs.push({
          section: 'skills',
          field: 'list',
          before: origSkillNames,
          after: tailoredSkillNames,
        });
      }
    }

    return diffs;
  }
}

// Export singleton instance
export const resumeTailorAgent = new ResumeTailorAgent();
