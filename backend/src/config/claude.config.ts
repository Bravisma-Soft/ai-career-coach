import Anthropic from '@anthropic-ai/sdk';
import { env } from '@/config/env';
import { logger } from '@/config/logger';

/**
 * Claude API Client Configuration
 *
 * Centralized configuration for Anthropic Claude API
 */

export interface ClaudeConfig {
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
  topP: number;
  topK: number;
  timeout: number;
  maxRetries: number;
  retryDelay: number;
}

// Default configuration
const defaultConfig: ClaudeConfig = {
  apiKey: env.ANTHROPIC_API_KEY || '',
  model: env.CLAUDE_MODEL || 'claude-sonnet-4-5-20250929',
  maxTokens: env.CLAUDE_MAX_TOKENS || 4096,
  temperature: env.CLAUDE_TEMPERATURE || 1.0,
  topP: 0.9,
  topK: 40,
  timeout: 300000, // 5 minutes (300 seconds) - increased for complex AI operations like resume tailoring
  maxRetries: 3,
  retryDelay: 1000, // 1 second
};

// Available Claude Models
export const CLAUDE_MODELS = {
  SONNET_4_5: 'claude-sonnet-4-5-20250929',
  OPUS_4: 'claude-opus-4-20250514',
  HAIKU_3_5: 'claude-3-5-haiku-20241022',
} as const;

// Token Limits per Model
export const MODEL_TOKEN_LIMITS = {
  [CLAUDE_MODELS.SONNET_4_5]: 200000,
  [CLAUDE_MODELS.OPUS_4]: 200000,
  [CLAUDE_MODELS.HAIKU_3_5]: 200000,
} as const;

// Cost per 1M tokens (in USD)
export const MODEL_COSTS = {
  [CLAUDE_MODELS.SONNET_4_5]: {
    input: 3.0,
    output: 15.0,
  },
  [CLAUDE_MODELS.OPUS_4]: {
    input: 15.0,
    output: 75.0,
  },
  [CLAUDE_MODELS.HAIKU_3_5]: {
    input: 1.0,
    output: 5.0,
  },
} as const;

class ClaudeClientManager {
  private client: Anthropic | null = null;
  private config: ClaudeConfig;

  constructor() {
    this.config = { ...defaultConfig };
  }

  /**
   * Get or create Anthropic client instance
   */
  getClient(): Anthropic {
    if (!this.client) {
      this.validateConfig();
      this.client = new Anthropic({
        apiKey: this.config.apiKey,
        maxRetries: this.config.maxRetries,
        timeout: this.config.timeout,
      });

      logger.info('Claude API client initialized', {
        model: this.config.model,
        maxTokens: this.config.maxTokens,
        temperature: this.config.temperature,
      });
    }

    return this.client;
  }

  /**
   * Get current configuration
   */
  getConfig(): Readonly<ClaudeConfig> {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<ClaudeConfig>): void {
    this.config = { ...this.config, ...updates };

    // Reset client to pick up new config
    if (this.client) {
      this.client = null;
      logger.info('Claude client configuration updated', updates);
    }
  }

  /**
   * Validate configuration
   */
  private validateConfig(): void {
    if (!this.config.apiKey) {
      throw new Error(
        'ANTHROPIC_API_KEY is not set. Please configure your API key in environment variables.'
      );
    }

    if (this.config.maxTokens < 1 || this.config.maxTokens > 8192) {
      logger.warn(
        `Max tokens ${this.config.maxTokens} is outside recommended range (1-8192)`
      );
    }

    if (this.config.temperature < 0 || this.config.temperature > 1) {
      throw new Error('Temperature must be between 0 and 1');
    }
  }

  /**
   * Calculate cost for token usage
   */
  calculateCost(
    model: string,
    inputTokens: number,
    outputTokens: number
  ): number {
    const costs = MODEL_COSTS[model as keyof typeof MODEL_COSTS];
    if (!costs) {
      logger.warn(`Unknown model for cost calculation: ${model}`);
      return 0;
    }

    const inputCost = (inputTokens / 1000000) * costs.input;
    const outputCost = (outputTokens / 1000000) * costs.output;

    return inputCost + outputCost;
  }

  /**
   * Get token limit for model
   */
  getTokenLimit(model: string): number {
    return MODEL_TOKEN_LIMITS[model as keyof typeof MODEL_TOKEN_LIMITS] || 200000;
  }

  /**
   * Check if request is within token limit
   */
  validateTokenCount(
    model: string,
    estimatedTokens: number
  ): { valid: boolean; limit: number; estimated: number } {
    const limit = this.getTokenLimit(model);
    const valid = estimatedTokens <= limit;

    if (!valid) {
      logger.warn('Token limit exceeded', {
        model,
        limit,
        estimated: estimatedTokens,
        exceeded: estimatedTokens - limit,
      });
    }

    return { valid, limit, estimated: estimatedTokens };
  }

  /**
   * Estimate token count (rough approximation)
   * Claude uses ~4 characters per token on average
   */
  estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  /**
   * Reset client (useful for testing)
   */
  reset(): void {
    this.client = null;
    this.config = { ...defaultConfig };
  }
}

// Export singleton instance
export const claudeClient = new ClaudeClientManager();

// Export convenience methods
export const getClaudeClient = () => claudeClient.getClient();
export const getClaudeConfig = () => claudeClient.getConfig();
export const updateClaudeConfig = (updates: Partial<ClaudeConfig>) =>
  claudeClient.updateConfig(updates);
export const calculateTokenCost = (
  model: string,
  inputTokens: number,
  outputTokens: number
) => claudeClient.calculateCost(model, inputTokens, outputTokens);
export const estimateTokens = (text: string) => claudeClient.estimateTokens(text);
export const validateTokenCount = (model: string, estimatedTokens: number) =>
  claudeClient.validateTokenCount(model, estimatedTokens);
