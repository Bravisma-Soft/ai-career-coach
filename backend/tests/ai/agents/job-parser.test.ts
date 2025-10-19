/**
 * Job Parser Agent Tests
 *
 * Tests for AI-powered job posting URL parsing
 */

import { JobParserAgent, ParsedJobData } from '@/ai/agents/job-parser.agent';
import {
  expectLLM,
  calculateTokenCost,
  measureResponseTime,
} from '../../utils/llm-test-helpers';
import fs from 'fs';
import path from 'path';
import axios from 'axios';

// Mock axios for controlled testing
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Job Parser Agent', () => {
  let agent: JobParserAgent;
  const TIMEOUT = 60000; // 60 seconds
  const MAX_COST_PER_TEST = 0.05; // $0.05 max

  // Load sample HTML fixture
  const sampleJobHTML = fs.readFileSync(
    path.join(__dirname, '../../fixtures/jobs/sample-job-url.html'),
    'utf-8'
  );

  beforeAll(() => {
    agent = new JobParserAgent();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Functionality', () => {
    test('should initialize agent successfully', () => {
      expect(agent).toBeDefined();
      expect(agent).toBeInstanceOf(JobParserAgent);
    });
  });

  describe('HTML Parsing and Content Extraction', () => {
    test(
      'should parse job from HTML content successfully',
      async () => {
        // Mock axios response
        mockedAxios.get.mockResolvedValue({
          data: sampleJobHTML,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {} as any,
        });

        const { result, timeMs } = await measureResponseTime(() =>
          agent.execute({ url: 'https://example.com/job/123' })
        );

        console.log('Job Parser Test Result:', {
          success: result.success,
          timeMs,
          metadata: result.metadata,
        });

        // Basic success checks
        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();

        const parsed = result.data!;

        // Calculate metrics
        const tokenCost = result.metadata?.cost || 0;

        console.log('Job Parser Metrics:', {
          responseTimeMs: timeMs,
          tokenUsage: {
            input: result.metadata?.inputTokens,
            output: result.metadata?.outputTokens,
          },
          cost: `$${tokenCost.toFixed(4)}`,
        });

        // --- Required Fields Validation ---
        expect(parsed.company).toBeDefined();
        expect(parsed.company).toBeTruthy();
        expect(parsed.company).toContain('CloudTech');

        expect(parsed.title).toBeDefined();
        expect(parsed.title).toBeTruthy();
        expect(parsed.title.toLowerCase()).toContain('backend');

        expect(parsed.jobDescription).toBeDefined();
        expect(parsed.jobDescription.length).toBeGreaterThan(100);

        expect(parsed.location).toBeDefined();

        // --- Enum Fields Validation ---
        expect(parsed.jobType).toBeDefined();
        expect(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'TEMPORARY']).toContain(
          parsed.jobType
        );

        expect(parsed.workMode).toBeDefined();
        expect(['REMOTE', 'HYBRID', 'ONSITE']).toContain(parsed.workMode);

        // --- Optional Fields ---
        // Salary range might be extracted
        if (parsed.salaryRange) {
          expect(typeof parsed.salaryRange).toBe('string');
          expect(parsed.salaryRange.length).toBeGreaterThan(0);
        }

        // --- LLM Quality Metrics ---
        expectLLM(parsed, {
          responseTimeMs: timeMs,
          cost: tokenCost,
        })
          .hasRequiredFields(['company', 'title', 'jobDescription', 'location'])
          .respondedWithin(60000)
          .costLessThan(MAX_COST_PER_TEST)
          .assert();
      },
      TIMEOUT
    );

    test(
      'should extract job type correctly',
      async () => {
        mockedAxios.get.mockResolvedValue({
          data: sampleJobHTML,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {} as any,
        });

        const result = await agent.execute({ url: 'https://example.com/job/123' });

        expect(result.success).toBe(true);
        expect(result.data?.jobType).toBe('FULL_TIME');
      },
      TIMEOUT
    );

    test(
      'should extract work mode correctly',
      async () => {
        mockedAxios.get.mockResolvedValue({
          data: sampleJobHTML,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {} as any,
        });

        const result = await agent.execute({ url: 'https://example.com/job/123' });

        expect(result.success).toBe(true);
        expect(result.data?.workMode).toBe('REMOTE');
      },
      TIMEOUT
    );

    test(
      'should extract salary range when present',
      async () => {
        mockedAxios.get.mockResolvedValue({
          data: sampleJobHTML,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {} as any,
        });

        const result = await agent.execute({ url: 'https://example.com/job/123' });

        expect(result.success).toBe(true);

        // Salary should be extracted
        if (result.data?.salaryRange) {
          expect(result.data.salaryRange).toBeTruthy();
          // Should contain numbers
          expect(/\d/.test(result.data.salaryRange)).toBe(true);
        }
      },
      TIMEOUT
    );
  });

  describe('Content Extraction Quality', () => {
    test(
      'should extract comprehensive job description',
      async () => {
        mockedAxios.get.mockResolvedValue({
          data: sampleJobHTML,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {} as any,
        });

        const result = await agent.execute({ url: 'https://example.com/job/123' });

        expect(result.success).toBe(true);

        const description = result.data!.jobDescription;

        // Description should be substantial
        expect(description.length).toBeGreaterThan(200);

        // Should contain key information from the HTML
        const descLower = description.toLowerCase();
        expect(
          descLower.includes('backend') ||
          descLower.includes('engineer') ||
          descLower.includes('developer')
        ).toBe(true);
      },
      TIMEOUT
    );

    test(
      'should clean and format extracted content',
      async () => {
        mockedAxios.get.mockResolvedValue({
          data: sampleJobHTML,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {} as any,
        });

        const result = await agent.execute({ url: 'https://example.com/job/123' });

        expect(result.success).toBe(true);

        const data = result.data!;

        // Fields should be trimmed
        expect(data.company).toBe(data.company.trim());
        expect(data.title).toBe(data.title.trim());
        expect(data.location).toBe(data.location.trim());

        // No excessive whitespace
        expect(data.jobDescription).not.toMatch(/\s{3,}/);
      },
      TIMEOUT
    );
  });

  describe('Error Handling', () => {
    test('should handle network errors gracefully', async () => {
      mockedAxios.get.mockRejectedValue({
        code: 'ENOTFOUND',
        message: 'getaddrinfo ENOTFOUND example.com',
      });

      const result = await agent.execute({ url: 'https://invalid-url.com/job' });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain('not found');
    });

    test('should handle timeout errors', async () => {
      mockedAxios.get.mockRejectedValue({
        code: 'ETIMEDOUT',
        message: 'Request timeout',
      });

      const result = await agent.execute({ url: 'https://slow-site.com/job' });

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('timed out');
    });

    test('should handle 404 errors', async () => {
      mockedAxios.get.mockRejectedValue({
        response: {
          status: 404,
          statusText: 'Not Found',
        },
        message: '404 Not Found',
      });

      const result = await agent.execute({ url: 'https://example.com/job/999' });

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('not found');
    });

    test('should handle 403 forbidden errors', async () => {
      mockedAxios.get.mockRejectedValue({
        response: {
          status: 403,
          statusText: 'Forbidden',
        },
        message: '403 Forbidden',
      });

      const result = await agent.execute({ url: 'https://protected-site.com/job' });

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('forbidden');
    });

    test('should handle pages with insufficient content', async () => {
      const minimalHTML = '<html><body>Job</body></html>';

      mockedAxios.get.mockResolvedValue({
        data: minimalHTML,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await agent.execute({ url: 'https://example.com/minimal' });

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('Insufficient content');
    });

    test('should handle malformed HTML gracefully', async () => {
      const malformedHTML = '<html><body><div>Incomplete...';

      mockedAxios.get.mockResolvedValue({
        data: malformedHTML,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await agent.execute({ url: 'https://example.com/broken' });

      // Should either succeed (cheerio is forgiving) or fail gracefully
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });
  });

  describe('Data Validation', () => {
    test(
      'should default to valid enum values when extraction fails',
      async () => {
        // HTML with ambiguous job type
        const ambiguousHTML = `
          <html>
            <body>
              <h1>Software Developer</h1>
              <p>Company: Tech Co</p>
              <p>Great opportunity to work on exciting projects!</p>
              ${'Lorem ipsum '.repeat(100)}
            </body>
          </html>
        `;

        mockedAxios.get.mockResolvedValue({
          data: ambiguousHTML,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {} as any,
        });

        const result = await agent.execute({ url: 'https://example.com/job' });

        if (result.success) {
          // Should use defaults for enum fields if not found
          expect(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'TEMPORARY']).toContain(
            result.data!.jobType
          );
          expect(['REMOTE', 'HYBRID', 'ONSITE']).toContain(result.data!.workMode);
        }
      },
      TIMEOUT
    );

    test(
      'should extract location information',
      async () => {
        mockedAxios.get.mockResolvedValue({
          data: sampleJobHTML,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {} as any,
        });

        const result = await agent.execute({ url: 'https://example.com/job/123' });

        expect(result.success).toBe(true);
        expect(result.data?.location).toBeDefined();
        expect(result.data?.location).toBeTruthy();
      },
      TIMEOUT
    );
  });

  describe('Performance', () => {
    test(
      'should complete parsing within acceptable time',
      async () => {
        mockedAxios.get.mockResolvedValue({
          data: sampleJobHTML,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {} as any,
        });

        const { result, timeMs } = await measureResponseTime(() =>
          agent.execute({ url: 'https://example.com/job/123' })
        );

        expect(result.success).toBe(true);
        expect(timeMs).toBeLessThan(60000); // 60 seconds max

        console.log(`Job parsing completed in ${timeMs}ms`);
      },
      TIMEOUT
    );

    test(
      'should stay within cost budget',
      async () => {
        mockedAxios.get.mockResolvedValue({
          data: sampleJobHTML,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {} as any,
        });

        const result = await agent.execute({ url: 'https://example.com/job/123' });

        if (result.success && result.metadata?.cost) {
          expect(result.metadata.cost).toBeLessThan(MAX_COST_PER_TEST);
          console.log(`Job parsing cost: $${result.metadata.cost.toFixed(4)}`);
        }
      },
      TIMEOUT
    );
  });
});
