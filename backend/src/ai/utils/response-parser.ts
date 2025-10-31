import { logger } from '@/config/logger';
import { AgentError } from '@/types/ai.types';

/**
 * Response Parser Utility
 *
 * Utilities for parsing and extracting data from AI responses
 */

export class ResponseParser {
  /**
   * Parse JSON from response text
   */
  static parseJSON<T = any>(
    response: string,
    options?: { strict?: boolean; defaultValue?: T }
  ): { success: boolean; data?: T; error?: AgentError } {
    try {
      // Try to find JSON in the response
      const jsonMatch = this.extractJSONBlock(response);

      if (!jsonMatch) {
        // Try to parse the entire response as JSON
        logger.debug('No JSON block found, attempting to parse entire response', {
          responseLength: response.length,
          responseStart: response.substring(0, 100),
        });
        const parsed = JSON.parse(response);
        return { success: true, data: parsed };
      }

      logger.debug('Extracted JSON block', {
        extractedLength: jsonMatch.length,
        extractedStart: jsonMatch.substring(0, 200),
        extractedEnd: jsonMatch.substring(Math.max(0, jsonMatch.length - 200)),
      });

      const parsed = JSON.parse(jsonMatch);
      return { success: true, data: parsed };
    } catch (error) {
      const jsonMatch = this.extractJSONBlock(response);
      logger.error('JSON parsing failed', {
        error: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined,
        responseLength: response.length,
        responseStart: response.substring(0, 500),
        responseEnd: response.substring(Math.max(0, response.length - 500)),
        extractedJsonLength: jsonMatch?.length,
        extractedJsonStart: jsonMatch?.substring(0, 500),
        extractedJsonEnd: jsonMatch?.substring(Math.max(0, (jsonMatch?.length || 0) - 500)),
      });

      if (options?.defaultValue !== undefined) {
        return { success: true, data: options.defaultValue };
      }

      return {
        success: false,
        error: {
          code: 'JSON_PARSE_ERROR',
          message: `Failed to parse JSON from response: ${error instanceof Error ? error.message : String(error)}`,
          type: 'parsing_error',
          retryable: false,
          details: { originalError: error },
        },
      };
    }
  }

  /**
   * Extract JSON block from markdown or mixed content
   */
  static extractJSONBlock(text: string): string | null {
    // Try to find JSON in code blocks with various formats
    // Handles: ```json\n{...}```, ```json {...}```, ```\n{...}```, ```{...}```
    const codeBlockPatterns = [
      /```json\s*([\s\S]*?)```/,  // ```json {...}```
      /```\s*([\s\S]*?)```/,      // ``` {...}```
    ];

    for (const pattern of codeBlockPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const extracted = match[1].trim();
        // Verify it looks like JSON (starts with { or [)
        if (extracted.startsWith('{') || extracted.startsWith('[')) {
          logger.debug('Extracted JSON from code block', {
            patternUsed: pattern.toString(),
            extractedLength: extracted.length,
          });
          return extracted;
        }
      }
    }

    // Try to find JSON object in text (greedy match to get complete JSON)
    const jsonObjectMatch = text.match(/\{[\s\S]*\}/);
    if (jsonObjectMatch) {
      logger.debug('Extracted JSON object from text (no code block)');
      return jsonObjectMatch[0];
    }

    // Try to find JSON array in text
    const jsonArrayMatch = text.match(/\[[\s\S]*\]/);
    if (jsonArrayMatch) {
      logger.debug('Extracted JSON array from text (no code block)');
      return jsonArrayMatch[0];
    }

    logger.warn('No JSON found in response', {
      textLength: text.length,
      textStart: text.substring(0, 200),
    });

    return null;
  }

  /**
   * Extract code block from response
   */
  static extractCodeBlock(
    response: string,
    language?: string
  ): { code: string; language: string } | null {
    const pattern = language
      ? new RegExp(`\`\`\`${language}\\s*\\n?([\\s\\S]*?)\\n?\`\`\``)
      : /```(\w+)?\s*\n?([\s\S]*?)\n?```/;

    const match = response.match(pattern);

    if (!match) {
      return null;
    }

    if (language) {
      return {
        code: match[1].trim(),
        language,
      };
    }

    return {
      code: match[2].trim(),
      language: match[1] || 'text',
    };
  }

  /**
   * Extract all code blocks from response
   */
  static extractAllCodeBlocks(
    response: string
  ): Array<{ code: string; language: string }> {
    const blocks: Array<{ code: string; language: string }> = [];
    const pattern = /```(\w+)?\s*\n?([\s\S]*?)\n?```/g;

    let match;
    while ((match = pattern.exec(response)) !== null) {
      blocks.push({
        code: match[2].trim(),
        language: match[1] || 'text',
      });
    }

    return blocks;
  }

  /**
   * Clean markdown formatting from text
   */
  static cleanMarkdown(text: string): string {
    return text
      // Remove headers
      .replace(/^#{1,6}\s+/gm, '')
      // Remove bold
      .replace(/\*\*(.*?)\*\*/g, '$1')
      // Remove italic
      .replace(/\*(.*?)\*/g, '$1')
      // Remove inline code
      .replace(/`(.*?)`/g, '$1')
      // Remove links but keep text
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      // Remove code blocks
      .replace(/```[\s\S]*?```/g, '')
      // Remove horizontal rules
      .replace(/^---+$/gm, '')
      // Remove list markers
      .replace(/^[\s]*[-*+]\s+/gm, '')
      // Clean up extra whitespace
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  /**
   * Extract structured data using regex patterns
   */
  static extractStructuredData<T extends Record<string, any>>(
    response: string,
    patterns: Record<keyof T, RegExp>
  ): Partial<T> {
    const data: Partial<T> = {};

    for (const [key, pattern] of Object.entries(patterns)) {
      const match = response.match(pattern);
      if (match) {
        data[key as keyof T] = match[1]?.trim() as any;
      }
    }

    return data;
  }

  /**
   * Extract sections from structured response
   */
  static extractSections(
    response: string,
    sectionHeaders: string[]
  ): Record<string, string> {
    const sections: Record<string, string> = {};

    for (let i = 0; i < sectionHeaders.length; i++) {
      const currentHeader = sectionHeaders[i];
      const nextHeader = sectionHeaders[i + 1];

      const pattern = nextHeader
        ? new RegExp(
            `${this.escapeRegex(currentHeader)}\\s*[:\n]([\\s\\S]*?)(?=${this.escapeRegex(nextHeader)})`,
            'i'
          )
        : new RegExp(
            `${this.escapeRegex(currentHeader)}\\s*[:\n]([\\s\\S]*)$`,
            'i'
          );

      const match = response.match(pattern);
      if (match) {
        sections[currentHeader] = match[1].trim();
      }
    }

    return sections;
  }

  /**
   * Extract list items from text
   */
  static extractListItems(text: string): string[] {
    const items: string[] = [];

    // Match numbered lists (1., 2., etc.)
    const numberedMatches = text.match(/^\d+\.\s+(.+)$/gm);
    if (numberedMatches) {
      items.push(...numberedMatches.map((m) => m.replace(/^\d+\.\s+/, '').trim()));
      return items;
    }

    // Match bullet lists (-, *, •)
    const bulletMatches = text.match(/^[\s]*[-*•]\s+(.+)$/gm);
    if (bulletMatches) {
      items.push(...bulletMatches.map((m) => m.replace(/^[\s]*[-*•]\s+/, '').trim()));
      return items;
    }

    // If no list format, split by newlines
    return text
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
  }

  /**
   * Extract key-value pairs from text
   */
  static extractKeyValuePairs(
    text: string,
    separator: string = ':'
  ): Record<string, string> {
    const pairs: Record<string, string> = {};
    const lines = text.split('\n');

    for (const line of lines) {
      const separatorIndex = line.indexOf(separator);
      if (separatorIndex > 0) {
        const key = line.substring(0, separatorIndex).trim();
        const value = line.substring(separatorIndex + 1).trim();
        if (key && value) {
          pairs[key] = value;
        }
      }
    }

    return pairs;
  }

  /**
   * Parse boolean response
   */
  static parseBoolean(
    response: string,
    options?: { trueValues?: string[]; falseValues?: string[] }
  ): boolean | null {
    const text = response.toLowerCase().trim();

    const trueValues = options?.trueValues || ['yes', 'true', '1', 'correct', 'affirmative'];
    const falseValues = options?.falseValues || ['no', 'false', '0', 'incorrect', 'negative'];

    if (trueValues.some((v) => text.includes(v))) {
      return true;
    }

    if (falseValues.some((v) => text.includes(v))) {
      return false;
    }

    return null;
  }

  /**
   * Parse numeric response
   */
  static parseNumber(response: string): number | null {
    // Try to extract first number from text
    const match = response.match(/-?\d+\.?\d*/);
    if (match) {
      const num = parseFloat(match[0]);
      return isNaN(num) ? null : num;
    }
    return null;
  }

  /**
   * Parse rating/score (e.g., "8/10", "4 out of 5")
   */
  static parseRating(response: string): { score: number; max: number } | null {
    // Match patterns like "8/10", "8 out of 10", "8 of 10"
    const fractionMatch = response.match(/(\d+\.?\d*)\s*(?:\/|out of|of)\s*(\d+\.?\d*)/i);
    if (fractionMatch) {
      return {
        score: parseFloat(fractionMatch[1]),
        max: parseFloat(fractionMatch[2]),
      };
    }

    // Match percentage "80%"
    const percentMatch = response.match(/(\d+\.?\d*)%/);
    if (percentMatch) {
      return {
        score: parseFloat(percentMatch[1]),
        max: 100,
      };
    }

    return null;
  }

  /**
   * Validate response against schema
   */
  static validateResponse<T>(
    data: any,
    requiredFields: (keyof T)[]
  ): { valid: boolean; missing: string[] } {
    const missing: string[] = [];

    for (const field of requiredFields) {
      if (!(field in data) || data[field] === undefined || data[field] === null) {
        missing.push(field as string);
      }
    }

    return {
      valid: missing.length === 0,
      missing,
    };
  }

  /**
   * Escape regex special characters
   */
  private static escapeRegex(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Clean and normalize response text
   */
  static cleanResponse(response: string): string {
    return response
      .trim()
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\n{3,}/g, '\n\n');
  }

  /**
   * Extract thinking/reasoning from response
   */
  static extractThinking(response: string): {
    thinking?: string;
    response: string;
  } {
    // Look for thinking tags or sections
    const thinkingMatch = response.match(/<thinking>([\s\S]*?)<\/thinking>/i);

    if (thinkingMatch) {
      return {
        thinking: thinkingMatch[1].trim(),
        response: response.replace(/<thinking>[\s\S]*?<\/thinking>/i, '').trim(),
      };
    }

    // Look for reasoning section
    const reasoningMatch = response.match(/## Reasoning\s*\n([\s\S]*?)(?=\n## |$)/i);

    if (reasoningMatch) {
      return {
        thinking: reasoningMatch[1].trim(),
        response: response.replace(/## Reasoning\s*\n[\s\S]*?(?=\n## |$)/i, '').trim(),
      };
    }

    return { response };
  }
}

// Export convenience functions
export const parseJSON = ResponseParser.parseJSON.bind(ResponseParser);
export const extractCodeBlock = ResponseParser.extractCodeBlock.bind(ResponseParser);
export const cleanMarkdown = ResponseParser.cleanMarkdown.bind(ResponseParser);
export const extractStructuredData = ResponseParser.extractStructuredData.bind(ResponseParser);
export const extractListItems = ResponseParser.extractListItems.bind(ResponseParser);
export const parseBoolean = ResponseParser.parseBoolean.bind(ResponseParser);
export const parseNumber = ResponseParser.parseNumber.bind(ResponseParser);
