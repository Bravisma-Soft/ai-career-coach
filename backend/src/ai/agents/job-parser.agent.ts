import { BaseAgent } from './base.agent';
import { AgentResponse, AgentExecutionOptions } from '@/types/ai.types';
import { logger } from '@/config/logger';
import { JOB_PARSER_SYSTEM_PROMPT, buildJobParserPrompt } from '@/ai/prompts/job-parser.prompt';
import axios from 'axios';
import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer';

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
    _options?: AgentExecutionOptions
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
        if (!response.data) {
          throw new Error('No data in response');
        }
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
          type: 'parsing_error',
          retryable: false,
          details: error,
        },
      };
    }
  }

  /**
   * Fetch job posting content from URL
   * First tries simple HTTP fetch, falls back to Puppeteer for JavaScript-rendered pages
   */
  private async fetchJobContent(url: string): Promise<string> {
    // First attempt: Try simple axios fetch (faster, works for static HTML)
    try {
      logger.info('Attempting simple HTTP fetch', { url });
      const content = await this.fetchWithAxios(url);

      if (content.length >= 100) {
        logger.info('Successfully fetched content with simple HTTP', {
          url,
          contentLength: content.length
        });
        return content;
      }
    } catch (error: any) {
      logger.warn('Simple HTTP fetch failed, will try Puppeteer', {
        url,
        error: error.message
      });
    }

    // Second attempt: Use Puppeteer for JavaScript-rendered pages
    logger.info('Using Puppeteer for JavaScript-rendered page', { url });
    return await this.fetchWithPuppeteer(url);
  }

  /**
   * Fetch content using simple HTTP request (fast, but doesn't execute JavaScript)
   */
  private async fetchWithAxios(url: string): Promise<string> {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      timeout: 15000,
    } as any);

    return this.extractTextFromHTML(response.data as string);
  }

  /**
   * Fetch content using Puppeteer (handles JavaScript-rendered pages)
   */
  private async fetchWithPuppeteer(url: string): Promise<string> {
    let browser;
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
        ],
      });

      const page = await browser.newPage();

      // Set viewport and user agent
      await page.setViewport({ width: 1920, height: 1080 });
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

      // Navigate to page
      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 30000,
      });

      // Wait for content to load (common patterns for job sites)
      try {
        await Promise.race([
          page.waitForSelector('article', { timeout: 5000 }),
          page.waitForSelector('[role="main"]', { timeout: 5000 }),
          page.waitForSelector('.job-description', { timeout: 5000 }),
          page.waitForSelector('main', { timeout: 5000 }),
          new Promise(resolve => setTimeout(resolve, 5000)), // Fallback timeout
        ]);
      } catch (e) {
        // Continue even if specific selectors don't load
        logger.info('No specific content selectors found, proceeding with full page');
      }

      // Get the full HTML
      const html = await page.content();

      await browser.close();

      return this.extractTextFromHTML(html);
    } catch (error: any) {
      if (browser) {
        await browser.close();
      }

      if (error.name === 'TimeoutError') {
        throw new Error('Page load timeout. The website may be slow or unreachable.');
      }

      throw new Error(`Failed to fetch job posting with browser: ${error.message}`);
    }
  }

  /**
   * Extract clean text from HTML
   */
  private extractTextFromHTML(html: string): string {
    const $ = cheerio.load(html);

    // Remove unwanted elements
    $('script, style, nav, header, footer, iframe, noscript, .cookie-banner, #cookie-banner').remove();

    // Try to find the main content area
    let content = '';

    const selectors = [
      'article',
      '[role="main"]',
      'main',
      '.job-description',
      '.job-detail',
      '.job-content',
      '#job-description',
      '.description',
      '[data-automation-id="jobPostingDescription"]', // Workday specific
      '.jobdetails', // LinkedIn specific
      'body',
    ];

    for (const selector of selectors) {
      const element = $(selector);
      if (element.length > 0) {
        content = element.text();
        if (content.length > 200) {
          break;
        }
      }
    }

    // Clean up the text
    content = content
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, '\n')
      .trim();

    if (content.length < 100) {
      throw new Error('Insufficient content extracted. The page may be access-restricted or empty.');
    }

    // Limit content length
    if (content.length > 15000) {
      content = content.substring(0, 15000) + '...';
    }

    return content;
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
