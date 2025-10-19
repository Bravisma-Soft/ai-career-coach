/**
 * LLM Testing Utilities
 *
 * Helper functions for evaluating AI agent outputs in tests
 */

import Anthropic from '@anthropic-ai/sdk';

export interface LLMEvaluationMetrics {
  structureValid: boolean;
  completenessScore: number; // 0-100
  relevanceScore: number; // 0-100
  responseTimeMs: number;
  tokenUsage: {
    input: number;
    output: number;
    total: number;
  };
  cost: number; // Estimated cost in USD
}

export interface TestResult {
  passed: boolean;
  metrics: LLMEvaluationMetrics;
  errors: string[];
  warnings: string[];
}

/**
 * Calculate token cost based on Claude Sonnet 4.5 pricing
 * Input: $3.00 per million tokens
 * Output: $15.00 per million tokens
 */
export function calculateTokenCost(inputTokens: number, outputTokens: number): number {
  const inputCost = (inputTokens / 1_000_000) * 3.0;
  const outputCost = (outputTokens / 1_000_000) * 15.0;
  return inputCost + outputCost;
}

/**
 * Validate that the output structure matches expected schema
 */
export function validateStructure(output: any, requiredFields: string[]): { valid: boolean; missing: string[] } {
  const missing: string[] = [];

  for (const field of requiredFields) {
    if (field.includes('.')) {
      // Nested field validation
      const parts = field.split('.');
      let current = output;
      let found = true;

      for (const part of parts) {
        if (!current || typeof current !== 'object' || !(part in current)) {
          found = false;
          break;
        }
        current = current[part];
      }

      if (!found) {
        missing.push(field);
      }
    } else {
      // Top-level field validation
      if (!output || typeof output !== 'object' || !(field in output)) {
        missing.push(field);
      }
    }
  }

  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Calculate completeness score based on how many optional fields are populated
 */
export function calculateCompletenessScore(output: any, optionalFields: string[]): number {
  if (optionalFields.length === 0) return 100;

  let populated = 0;

  for (const field of optionalFields) {
    const value = getNestedValue(output, field);
    if (value !== null && value !== undefined && value !== '') {
      populated++;
    }
  }

  return Math.round((populated / optionalFields.length) * 100);
}

/**
 * Get nested value from object using dot notation
 */
function getNestedValue(obj: any, path: string): any {
  const parts = path.split('.');
  let current = obj;

  for (const part of parts) {
    if (!current || typeof current !== 'object') {
      return undefined;
    }
    current = current[part];
  }

  return current;
}

/**
 * Check if arrays contain expected items
 */
export function arrayContainsAll(actual: any[], expected: any[]): boolean {
  return expected.every(item => actual.includes(item));
}

/**
 * Check if arrays have overlap
 */
export function arrayHasOverlap(actual: any[], expected: any[]): boolean {
  return expected.some(item => actual.includes(item));
}

/**
 * Calculate keyword match percentage
 */
export function calculateKeywordMatchScore(text: string, keywords: string[]): number {
  if (keywords.length === 0) return 100;

  const lowerText = text.toLowerCase();
  const matched = keywords.filter(keyword =>
    lowerText.includes(keyword.toLowerCase())
  );

  return Math.round((matched.length / keywords.length) * 100);
}

/**
 * Validate JSON structure
 */
export function isValidJSON(str: string): boolean {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}

/**
 * Extract JSON from markdown code blocks
 */
export function extractJSONFromMarkdown(text: string): any {
  // Try to find JSON in markdown code blocks
  const jsonBlockMatch = text.match(/```(?:json)?\s*\n([\s\S]*?)\n```/);
  if (jsonBlockMatch) {
    return JSON.parse(jsonBlockMatch[1]);
  }

  // Try to parse directly
  return JSON.parse(text);
}

/**
 * Create deterministic test configuration for Claude
 */
export function createDeterministicConfig(): Partial<Anthropic.MessageCreateParams> {
  return {
    temperature: 0,
    max_tokens: 4096,
  };
}

/**
 * Measure response time of async function
 */
export async function measureResponseTime<T>(fn: () => Promise<T>): Promise<{ result: T; timeMs: number }> {
  const start = Date.now();
  const result = await fn();
  const timeMs = Date.now() - start;

  return { result, timeMs };
}

/**
 * Assert response time is within acceptable range
 */
export function assertResponseTime(timeMs: number, maxMs: number): void {
  if (timeMs > maxMs) {
    throw new Error(`Response time ${timeMs}ms exceeded maximum ${maxMs}ms`);
  }
}

/**
 * Compare two objects for deep equality with tolerance for AI variations
 */
export function fuzzyMatch(actual: any, expected: any, options: {
  ignoreCase?: boolean;
  trimWhitespace?: boolean;
  allowPartialMatch?: boolean;
} = {}): boolean {
  const { ignoreCase = true, trimWhitespace = true, allowPartialMatch = false } = options;

  if (typeof actual === 'string' && typeof expected === 'string') {
    let a = actual;
    let e = expected;

    if (trimWhitespace) {
      a = a.trim();
      e = e.trim();
    }

    if (ignoreCase) {
      a = a.toLowerCase();
      e = e.toLowerCase();
    }

    if (allowPartialMatch) {
      return a.includes(e) || e.includes(a);
    }

    return a === e;
  }

  if (Array.isArray(actual) && Array.isArray(expected)) {
    if (!allowPartialMatch && actual.length !== expected.length) {
      return false;
    }

    return expected.every((item, idx) => fuzzyMatch(actual[idx], item, options));
  }

  if (typeof actual === 'object' && typeof expected === 'object') {
    const expectedKeys = Object.keys(expected);

    return expectedKeys.every(key => fuzzyMatch(actual[key], expected[key], options));
  }

  return actual === expected;
}

/**
 * Test helper to assert LLM output quality
 */
export class LLMTestAssertion {
  private errors: string[] = [];
  private warnings: string[] = [];

  constructor(private output: any, private metadata?: any) {}

  hasRequiredFields(fields: string[]): this {
    const validation = validateStructure(this.output, fields);
    if (!validation.valid) {
      this.errors.push(`Missing required fields: ${validation.missing.join(', ')}`);
    }
    return this;
  }

  hasMinimumCompleteness(threshold: number, optionalFields: string[]): this {
    const score = calculateCompletenessScore(this.output, optionalFields);
    if (score < threshold) {
      this.warnings.push(`Completeness score ${score}% below threshold ${threshold}%`);
    }
    return this;
  }

  containsKeywords(keywords: string[], minMatch: number = 50): this {
    const text = JSON.stringify(this.output);
    const score = calculateKeywordMatchScore(text, keywords);
    if (score < minMatch) {
      this.errors.push(`Keyword match score ${score}% below minimum ${minMatch}%`);
    }
    return this;
  }

  respondedWithin(maxMs: number): this {
    if (this.metadata?.responseTimeMs && this.metadata.responseTimeMs > maxMs) {
      this.warnings.push(`Response time ${this.metadata.responseTimeMs}ms exceeded ${maxMs}ms`);
    }
    return this;
  }

  costLessThan(maxCost: number): this {
    if (this.metadata?.cost && this.metadata.cost > maxCost) {
      this.warnings.push(`Cost $${this.metadata.cost.toFixed(4)} exceeded maximum $${maxCost.toFixed(4)}`);
    }
    return this;
  }

  matches(expected: any, options?: Parameters<typeof fuzzyMatch>[2]): this {
    if (!fuzzyMatch(this.output, expected, options)) {
      this.errors.push(`Output does not match expected value`);
    }
    return this;
  }

  assert(): void {
    if (this.errors.length > 0) {
      throw new Error(`LLM Test Assertion Failed:\n${this.errors.join('\n')}`);
    }
  }

  getResult(): TestResult {
    return {
      passed: this.errors.length === 0,
      metrics: {
        structureValid: this.errors.length === 0,
        completenessScore: this.metadata?.completenessScore || 0,
        relevanceScore: this.metadata?.relevanceScore || 0,
        responseTimeMs: this.metadata?.responseTimeMs || 0,
        tokenUsage: this.metadata?.tokenUsage || { input: 0, output: 0, total: 0 },
        cost: this.metadata?.cost || 0,
      },
      errors: this.errors,
      warnings: this.warnings,
    };
  }
}

/**
 * Create test assertion helper
 */
export function expectLLM(output: any, metadata?: any): LLMTestAssertion {
  return new LLMTestAssertion(output, metadata);
}
