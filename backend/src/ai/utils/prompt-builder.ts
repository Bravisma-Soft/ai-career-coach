import {
  ResumeData,
  JobDescriptionData,
  AIMessage,
  PromptTemplate,
} from '@/types/ai.types';
import { logger } from '@/config/logger';

/**
 * Prompt Builder Utility
 *
 * Utilities for building, formatting, and managing AI prompts
 */

export class PromptBuilder {
  /**
   * Build a prompt from a template with variables
   */
  static buildPrompt(
    template: string,
    variables: Record<string, any>
  ): string {
    let prompt = template;

    // Replace all variables in the format {{variableName}}
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      const replacement = value !== null && value !== undefined ? String(value) : '';
      prompt = prompt.replace(placeholder, replacement);
    }

    // Check for unreplaced variables
    const unreplaced = prompt.match(/{{.*?}}/g);
    if (unreplaced && unreplaced.length > 0) {
      logger.warn('Unreplaced template variables found', { unreplaced });
    }

    return prompt;
  }

  /**
   * Build prompt from PromptTemplate
   */
  static buildFromTemplate(
    template: PromptTemplate,
    variables: Record<string, any>
  ): { system: string; user: string } {
    // Validate required variables
    const missingVars = template.variables.filter((v) => !(v in variables));
    if (missingVars.length > 0) {
      throw new Error(`Missing required variables: ${missingVars.join(', ')}`);
    }

    return {
      system: this.buildPrompt(template.systemPrompt, variables),
      user: this.buildPrompt(template.userPromptTemplate, variables),
    };
  }

  /**
   * Format resume data for AI consumption
   */
  static formatResume(resume: ResumeData, options?: { maxLength?: number }): string {
    const sections: string[] = [];

    // Personal Information
    if (resume.personalInfo) {
      const info = resume.personalInfo;
      const details: string[] = [];

      if (info.name) details.push(`Name: ${info.name}`);
      if (info.email) details.push(`Email: ${info.email}`);
      if (info.phone) details.push(`Phone: ${info.phone}`);
      if (info.location) details.push(`Location: ${info.location}`);
      if (info.linkedinUrl) details.push(`LinkedIn: ${info.linkedinUrl}`);
      if (info.githubUrl) details.push(`GitHub: ${info.githubUrl}`);

      if (details.length > 0) {
        sections.push(`## Personal Information\n${details.join('\n')}`);
      }
    }

    // Summary
    if (resume.summary) {
      sections.push(`## Summary\n${resume.summary}`);
    }

    // Experience
    if (resume.experiences && resume.experiences.length > 0) {
      const expList = resume.experiences
        .map((exp) => {
          const parts = [
            `### ${exp.position} at ${exp.company}`,
            `Duration: ${exp.duration}`,
          ];

          if (exp.description) parts.push(`Description: ${exp.description}`);

          if (exp.achievements && exp.achievements.length > 0) {
            parts.push(`Achievements:\n${exp.achievements.map((a) => `- ${a}`).join('\n')}`);
          }

          if (exp.technologies && exp.technologies.length > 0) {
            parts.push(`Technologies: ${exp.technologies.join(', ')}`);
          }

          return parts.join('\n');
        })
        .join('\n\n');

      sections.push(`## Work Experience\n${expList}`);
    }

    // Education
    if (resume.educations && resume.educations.length > 0) {
      const eduList = resume.educations
        .map((edu) => {
          const parts = [
            `### ${edu.degree} in ${edu.fieldOfStudy}`,
            `Institution: ${edu.institution}`,
            `Duration: ${edu.duration}`,
          ];

          if (edu.gpa) parts.push(`GPA: ${edu.gpa}`);

          return parts.join('\n');
        })
        .join('\n\n');

      sections.push(`## Education\n${eduList}`);
    }

    // Skills
    if (resume.skills && resume.skills.length > 0) {
      const groupedSkills: Record<string, string[]> = {};

      resume.skills.forEach((skill) => {
        const category = skill.category || 'Other';
        if (!groupedSkills[category]) {
          groupedSkills[category] = [];
        }
        const skillStr = skill.level ? `${skill.name} (${skill.level})` : skill.name;
        groupedSkills[category].push(skillStr);
      });

      const skillList = Object.entries(groupedSkills)
        .map(([category, skills]) => `**${category}**: ${skills.join(', ')}`)
        .join('\n');

      sections.push(`## Skills\n${skillList}`);
    }

    // Certifications
    if (resume.certifications && resume.certifications.length > 0) {
      const certList = resume.certifications
        .map((cert) => `- ${cert.name} by ${cert.organization} (${cert.date})`)
        .join('\n');

      sections.push(`## Certifications\n${certList}`);
    }

    let formatted = sections.join('\n\n');

    // Truncate if needed
    if (options?.maxLength && formatted.length > options.maxLength) {
      formatted = this.truncateText(formatted, options.maxLength);
      logger.info('Resume truncated', {
        original: formatted.length,
        truncated: options.maxLength,
      });
    }

    return formatted;
  }

  /**
   * Format job description for AI consumption
   */
  static formatJobDescription(
    job: JobDescriptionData,
    options?: { maxLength?: number }
  ): string {
    const sections: string[] = [];

    // Basic Info
    sections.push(`# ${job.title} at ${job.company}`);

    const details: string[] = [];
    if (job.location) details.push(`Location: ${job.location}`);
    if (job.workMode) details.push(`Work Mode: ${job.workMode}`);
    if (job.jobType) details.push(`Job Type: ${job.jobType}`);

    if (job.salary) {
      const { min, max, currency = 'USD' } = job.salary;
      if (min || max) {
        const salaryStr = min && max
          ? `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`
          : min
          ? `${currency} ${min.toLocaleString()}+`
          : `Up to ${currency} ${max?.toLocaleString()}`;
        details.push(`Salary: ${salaryStr}`);
      }
    }

    if (details.length > 0) {
      sections.push(details.join(' | '));
    }

    // Description
    if (job.description) {
      sections.push(`\n## Description\n${job.description}`);
    }

    // Requirements
    if (job.requirements && job.requirements.length > 0) {
      sections.push(
        `\n## Requirements\n${job.requirements.map((r) => `- ${r}`).join('\n')}`
      );
    }

    // Responsibilities
    if (job.responsibilities && job.responsibilities.length > 0) {
      sections.push(
        `\n## Responsibilities\n${job.responsibilities.map((r) => `- ${r}`).join('\n')}`
      );
    }

    // Technologies
    if (job.technologies && job.technologies.length > 0) {
      sections.push(`\n## Technologies\n${job.technologies.join(', ')}`);
    }

    // Benefits
    if (job.benefits && job.benefits.length > 0) {
      sections.push(
        `\n## Benefits\n${job.benefits.map((b) => `- ${b}`).join('\n')}`
      );
    }

    let formatted = sections.join('\n');

    // Truncate if needed
    if (options?.maxLength && formatted.length > options.maxLength) {
      formatted = this.truncateText(formatted, options.maxLength);
      logger.info('Job description truncated', {
        original: formatted.length,
        truncated: options.maxLength,
      });
    }

    return formatted;
  }

  /**
   * Format conversation history for AI consumption
   */
  static formatConversationHistory(
    messages: AIMessage[],
    options?: { maxMessages?: number; maxLength?: number }
  ): AIMessage[] {
    let formattedMessages = [...messages];

    // Limit number of messages
    if (options?.maxMessages && formattedMessages.length > options.maxMessages) {
      formattedMessages = formattedMessages.slice(-options.maxMessages);
      logger.info('Conversation history truncated by message count', {
        original: messages.length,
        kept: formattedMessages.length,
      });
    }

    // Truncate content if needed
    if (options?.maxLength) {
      formattedMessages = formattedMessages.map((msg) => ({
        ...msg,
        content:
          msg.content.length > options.maxLength
            ? this.truncateText(msg.content, options.maxLength)
            : msg.content,
      }));
    }

    return formattedMessages;
  }

  /**
   * Escape special characters in text
   */
  static escapeSpecialCharacters(text: string): string {
    // Escape characters that might interfere with prompt formatting
    return text
      .replace(/\\/g, '\\\\')
      .replace(/`/g, '\\`')
      .replace(/\$/g, '\\$');
  }

  /**
   * Remove special characters (for sanitization)
   */
  static sanitizeText(text: string): string {
    // Remove potentially problematic characters
    return text
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/\r\n/g, '\n') // Normalize line endings
      .replace(/\r/g, '\n')
      .replace(/\n{3,}/g, '\n\n') // Limit consecutive newlines
      .trim();
  }

  /**
   * Truncate text intelligently
   */
  static truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
      return text;
    }

    // Try to truncate at sentence boundary
    const truncated = text.substring(0, maxLength);
    const lastPeriod = truncated.lastIndexOf('.');
    const lastNewline = truncated.lastIndexOf('\n');

    const cutoff = Math.max(lastPeriod, lastNewline);

    if (cutoff > maxLength * 0.8) {
      // If we can cut at a good boundary (within 80% of max)
      return truncated.substring(0, cutoff + 1) + '\n\n[...truncated]';
    }

    // Otherwise, cut at maxLength
    return truncated + '\n\n[...truncated]';
  }

  /**
   * Count words in text
   */
  static countWords(text: string): number {
    return text.trim().split(/\s+/).length;
  }

  /**
   * Extract variables from template string
   */
  static extractVariables(template: string): string[] {
    const matches = template.match(/{{.*?}}/g);
    if (!matches) return [];

    return matches.map((match) =>
      match.replace(/[{}]/g, '').trim()
    );
  }

  /**
   * Create a structured prompt with sections
   */
  static createStructuredPrompt(sections: {
    task?: string;
    context?: string;
    instructions?: string;
    examples?: string[];
    constraints?: string[];
    outputFormat?: string;
  }): string {
    const parts: string[] = [];

    if (sections.task) {
      parts.push(`# Task\n${sections.task}`);
    }

    if (sections.context) {
      parts.push(`# Context\n${sections.context}`);
    }

    if (sections.instructions) {
      parts.push(`# Instructions\n${sections.instructions}`);
    }

    if (sections.examples && sections.examples.length > 0) {
      parts.push(
        `# Examples\n${sections.examples.map((ex, i) => `Example ${i + 1}:\n${ex}`).join('\n\n')}`
      );
    }

    if (sections.constraints && sections.constraints.length > 0) {
      parts.push(
        `# Constraints\n${sections.constraints.map((c) => `- ${c}`).join('\n')}`
      );
    }

    if (sections.outputFormat) {
      parts.push(`# Output Format\n${sections.outputFormat}`);
    }

    return parts.join('\n\n');
  }

  /**
   * Add few-shot examples to prompt
   */
  static addFewShotExamples(
    basePrompt: string,
    examples: Array<{ input: string; output: string }>
  ): string {
    const exampleText = examples
      .map(
        (ex, i) =>
          `Example ${i + 1}:\nInput: ${ex.input}\nOutput: ${ex.output}`
      )
      .join('\n\n');

    return `${basePrompt}\n\n# Examples\n${exampleText}`;
  }
}

// Export convenience functions
export const buildPrompt = PromptBuilder.buildPrompt.bind(PromptBuilder);
export const formatResume = PromptBuilder.formatResume.bind(PromptBuilder);
export const formatJobDescription = PromptBuilder.formatJobDescription.bind(PromptBuilder);
export const formatConversationHistory = PromptBuilder.formatConversationHistory.bind(PromptBuilder);
export const truncateText = PromptBuilder.truncateText.bind(PromptBuilder);
export const sanitizeText = PromptBuilder.sanitizeText.bind(PromptBuilder);
