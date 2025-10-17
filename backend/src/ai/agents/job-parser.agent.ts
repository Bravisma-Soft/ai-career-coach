import { BaseAgent } from './base.agent';
import { AgentResponse, AgentExecutionOptions } from '@/types/ai.types';
import { logger } from '@/config/logger';
import { JOB_PARSER_SYSTEM_PROMPT, buildJobParserPrompt } from '@/ai/prompts/job-parser.prompt';
import axios from 'axios';
import * as cheerio from 'cheerio';

export interface JobParserInput {
  url: string;
}

export interface ParsedJobData {
  company: string;
  title: string;
  jobDescription: string;
  location: string;
  salaryRange?: string | null;
  jobType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'TEMPORARY';
  workMode: 'REMOTE' | 'HYBRID' | 'ONSITE';
}

export class JobParserAgent extends BaseAgent<JobParserInput, ParsedJobData> {
  constructor() {
    super({
      systemPrompt: JOB_PARSER_SYSTEM_PROMPT,
      temperature: 0.3, // Lower temperature for more consistent extraction
      maxTokens: 4096,
    });
  }

  async execute(
    input: JobParserInput,
    options?: AgentExecutionOptions
  ): Promise<AgentResponse<ParsedJobData>> {
    const startTime = Date.now();

    try {
      logger.info('AI: Parsing job from URL', { url: input.url });

      // Step 1: Fetch the job posting content
      const jobContent = await this.fetchJobContent(input.url);

      // Step 2: Use Claude to parse the content
      const prompt = buildJobParserPrompt(jobContent);
      const response = await this.callClaude({
        systemPrompt: this.config.systemPrompt,
        userMessage: prompt,
        temperature: this.config.temperature,
        maxTokens: this.config.maxTokens,
      });

      // Step 3: Parse the JSON response
      let parsedData: ParsedJobData;
      try {
        // Extract JSON from response (in case there's extra text)
        const jsonMatch = response.data.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('No JSON found in response');
        }
        parsedData = JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        logger.error('Failed to parse JSON response', { error: parseError, response: response.data });
        throw new Error('Failed to parse job data from AI response');
      }

      // Step 4: Validate and normalize the data
      const validatedData = this.validateJobData(parsedData);

      const duration = Date.now() - startTime;
      logger.info('AI: Job parsing completed successfully', {
        url: input.url,
        company: validatedData.company,
        title: validatedData.title,
        duration: `${duration}ms`,
      });

      return {
        success: true,
        data: validatedData,
        metadata: {
          duration,
          model: this.config.model,
          inputTokens: response.metadata?.inputTokens,
          outputTokens: response.metadata?.outputTokens,
          cost: response.metadata?.cost,
        },
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;
      logger.error('AI: Job parsing failed', {
        url: input.url,
        error: error.message,
        duration: `${duration}ms`,
      });

      return {
        success: false,
        error: {
          code: 'JOB_PARSING_FAILED',
          message: error.message || 'Failed to parse job from URL',
          details: error,
        },
        metadata: {
          duration,
          model: this.config.model,
        },
      };
    }
  }

  /**
   * Fetch job posting content from URL
   */
  private async fetchJobContent(url: string): Promise<string> {
    try {
      // Fetch the page
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
        timeout: 10000, // 10 second timeout
      });

      // Parse HTML with cheerio
      const $ = cheerio.load(response.data);

      // Remove script and style elements
      $('script, style, nav, header, footer, iframe').remove();

      // Try to find the main content area (common patterns)
      let content = '';

      // Try common job posting container selectors
      const selectors = [
        'article',
        '[role="main"]',
        'main',
        '.job-description',
        '.job-detail',
        '.job-content',
        '#job-description',
        '.description',
        'body',
      ];

      for (const selector of selectors) {
        const element = $(selector);
        if (element.length > 0) {
          content = element.text();
          if (content.length > 200) {
            // Found substantial content
            break;
          }
        }
      }

      // Fallback to body if no good content found
      if (!content || content.length < 200) {
        content = $('body').text();
      }

      // Clean up the text
      content = content
        .replace(/\s+/g, ' ')
        .replace(/\n+/g, '\n')
        .trim();

      if (content.length < 100) {
        throw new Error('Insufficient content extracted from URL. The page may be JavaScript-rendered or access-restricted.');
      }

      // Limit content length to avoid token limits
      if (content.length > 15000) {
        content = content.substring(0, 15000) + '...';
      }

      return content;
    } catch (error: any) {
      if (error.code === 'ENOTFOUND') {
        throw new Error('URL not found. Please check the URL and try again.');
      } else if (error.code === 'ETIMEDOUT') {
        throw new Error('Request timed out. The server may be slow or unreachable.');
      } else if (error.response?.status === 403) {
        throw new Error('Access forbidden. The website may be blocking automated requests.');
      } else if (error.response?.status === 404) {
        throw new Error('Job posting not found at this URL.');
      } else {
        throw new Error(`Failed to fetch job posting: ${error.message}`);
      }
    }
  }

  /**
   * Validate and normalize job data
   */
  private validateJobData(data: any): ParsedJobData {
    // Validate required fields
    if (!data.company || typeof data.company !== 'string') {
      throw new Error('Company name is required');
    }
    if (!data.title || typeof data.title !== 'string') {
      throw new Error('Job title is required');
    }
    if (!data.jobDescription || typeof data.jobDescription !== 'string') {
      throw new Error('Job description is required');
    }

    // Valid enum values
    const validJobTypes = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'TEMPORARY'];
    const validWorkModes = ['REMOTE', 'HYBRID', 'ONSITE'];

    return {
      company: data.company.trim(),
      title: data.title.trim(),
      jobDescription: data.jobDescription.trim(),
      location: data.location?.trim() || 'Not specified',
      salaryRange: data.salaryRange?.trim() || null,
      jobType: validJobTypes.includes(data.jobType) ? data.jobType : 'FULL_TIME',
      workMode: validWorkModes.includes(data.workMode) ? data.workMode : 'ONSITE',
    };
  }
}
