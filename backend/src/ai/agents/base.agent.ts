import Anthropic from '@anthropic-ai/sdk';
import {
  getClaudeClient,
  getClaudeConfig,
  calculateTokenCost,
  estimateTokens,
} from '@/config/claude.config';
import { logger } from '@/config/logger';
import {
  AgentResponse,
  AgentError,
  AgentConfig,
  AgentExecutionOptions,
  AIMessage,
} from '@/types/ai.types';

/**
 * Base Agent Class
 *
 * Abstract base class for all AI agents
 * Provides core functionality for interacting with Claude API
 */

export abstract class BaseAgent<TInput = any, TOutput = any> {
  protected config: AgentConfig;
  protected client: Anthropic;

  constructor(config?: Partial<AgentConfig>) {
    const defaultConfig = getClaudeConfig();

    this.config = {
      model: config?.model || defaultConfig.model,
      temperature: config?.temperature ?? defaultConfig.temperature,
      maxTokens: config?.maxTokens || defaultConfig.maxTokens,
      topP: config?.topP,
      topK: config?.topK,
      stopSequences: config?.stopSequences,
      systemPrompt: config?.systemPrompt,
    };

    this.client = getClaudeClient();

    logger.info(`${this.constructor.name} initialized`, {
      model: this.config.model,
      temperature: this.config.temperature,
    });
  }

  /**
   * Execute the agent (to be implemented by subclasses)
   */
  abstract execute(input: TInput, options?: AgentExecutionOptions): Promise<AgentResponse<TOutput>>;

  /**
   * Call Claude API with standard parameters
   */
  protected async callClaude(params: {
    systemPrompt?: string;
    userMessage: string;
    messages?: AIMessage[];
    temperature?: number;
    maxTokens?: number;
    stopSequences?: string[];
  }): Promise<AgentResponse<string>> {
    const startTime = Date.now();

    try {
      // Prepare messages
      const messages: AIMessage[] = params.messages || [];
      messages.push({
        role: 'user',
        content: params.userMessage,
      });

      // Build request
      const request: Anthropic.MessageCreateParams = {
        model: this.config.model,
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        max_tokens: params.maxTokens || this.config.maxTokens,
        temperature: params.temperature ?? this.config.temperature,
      };

      // Add optional parameters
      if (params.systemPrompt || this.config.systemPrompt) {
        request.system = params.systemPrompt || this.config.systemPrompt;
      }

      if (params.stopSequences || this.config.stopSequences) {
        request.stop_sequences = params.stopSequences || this.config.stopSequences;
      }

      if (this.config.topP !== undefined) {
        request.top_p = this.config.topP;
      }

      if (this.config.topK !== undefined) {
        request.top_k = this.config.topK;
      }

      // Log request
      logger.info('Claude API request', {
        agent: this.constructor.name,
        model: request.model,
        messageCount: messages.length,
        estimatedTokens: estimateTokens(params.userMessage),
      });

      // Make API call
      const response = await this.client.messages.create(request);

      // Extract text content
      const textContent = response.content
        .filter((c): c is Anthropic.TextBlock => c.type === 'text')
        .map((c) => c.text)
        .join('\n');

      // Calculate cost
      const cost = calculateTokenCost(
        response.model,
        response.usage.input_tokens,
        response.usage.output_tokens
      );

      const duration = Date.now() - startTime;

      // Log response
      logger.info('Claude API response', {
        agent: this.constructor.name,
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
        totalTokens: response.usage.input_tokens + response.usage.output_tokens,
        cost: `$${cost.toFixed(4)}`,
        duration: `${duration}ms`,
        stopReason: response.stop_reason,
      });

      return {
        success: true,
        data: textContent,
        rawResponse: textContent,
        usage: {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
          totalTokens: response.usage.input_tokens + response.usage.output_tokens,
        },
        model: response.model,
        stopReason: response.stop_reason || undefined,
      };
    } catch (error) {
      return this.handleError(error, startTime);
    }
  }

  /**
   * Call Claude API with streaming responses
   */
  protected async callClaudeStreaming(params: {
    systemPrompt?: string;
    userMessage: string;
    messages?: AIMessage[];
    temperature?: number;
    maxTokens?: number;
    stopSequences?: string[];
    onChunk?: (chunk: string) => void;
    onComplete?: (fullText: string) => void;
  }): Promise<AgentResponse<string>> {
    const startTime = Date.now();
    let fullText = '';
    let inputTokens = 0;
    let outputTokens = 0;

    try {
      // Prepare messages
      const messages: AIMessage[] = params.messages || [];
      messages.push({
        role: 'user',
        content: params.userMessage,
      });

      // Build request
      const request: Anthropic.MessageStreamParams = {
        model: this.config.model,
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        max_tokens: params.maxTokens || this.config.maxTokens,
        temperature: params.temperature ?? this.config.temperature,
        stream: true,
      };

      // Add optional parameters
      if (params.systemPrompt || this.config.systemPrompt) {
        request.system = params.systemPrompt || this.config.systemPrompt;
      }

      if (params.stopSequences || this.config.stopSequences) {
        request.stop_sequences = params.stopSequences || this.config.stopSequences;
      }

      if (this.config.topP !== undefined) {
        request.top_p = this.config.topP;
      }

      if (this.config.topK !== undefined) {
        request.top_k = this.config.topK;
      }

      logger.info('Claude API streaming request', {
        agent: this.constructor.name,
        model: request.model,
      });

      // Create streaming request
      const stream = await this.client.messages.create(request) as any;

      // Process stream
      for await (const event of stream) {
        if (event.type === 'content_block_delta') {
          const delta = event.delta;
          if (delta.type === 'text_delta') {
            fullText += delta.text;
            if (params.onChunk) {
              params.onChunk(delta.text);
            }
          }
        } else if (event.type === 'message_start') {
          inputTokens = event.message.usage.input_tokens;
        } else if (event.type === 'message_delta') {
          outputTokens = event.usage.output_tokens;
        }
      }

      const duration = Date.now() - startTime;

      // Log completion
      logger.info('Claude API streaming complete', {
        agent: this.constructor.name,
        inputTokens,
        outputTokens,
        duration: `${duration}ms`,
      });

      if (params.onComplete) {
        params.onComplete(fullText);
      }

      return {
        success: true,
        data: fullText,
        rawResponse: fullText,
        usage: {
          inputTokens,
          outputTokens,
          totalTokens: inputTokens + outputTokens,
        },
        model: this.config.model,
      };
    } catch (error) {
      return this.handleError(error, startTime);
    }
  }

  /**
   * Handle API errors with retry logic
   */
  protected async handleError(error: any, startTime: number): Promise<AgentResponse<any>> {
    const duration = Date.now() - startTime;

    logger.error('Claude API error', {
      agent: this.constructor.name,
      error: error.message,
      duration: `${duration}ms`,
      type: error.type,
      status: error.status,
    });

    const agentError: AgentError = this.mapError(error);

    return {
      success: false,
      error: agentError,
    };
  }

  /**
   * Map API error to AgentError
   */
  protected mapError(error: any): AgentError {
    // Anthropic API errors
    if (error instanceof Anthropic.APIError) {
      // Rate limit error
      if (error.status === 429) {
        return {
          code: 'RATE_LIMIT_ERROR',
          message: 'API rate limit exceeded. Please try again later.',
          type: 'rate_limit_error',
          retryable: true,
          details: {
            status: error.status,
            retryAfter: error.headers?.['retry-after'],
          },
        };
      }

      // Authentication error
      if (error.status === 401) {
        return {
          code: 'AUTHENTICATION_ERROR',
          message: 'Invalid API key. Please check your ANTHROPIC_API_KEY.',
          type: 'api_error',
          retryable: false,
          details: { status: error.status },
        };
      }

      // Bad request
      if (error.status === 400) {
        return {
          code: 'VALIDATION_ERROR',
          message: error.message || 'Invalid request parameters.',
          type: 'validation_error',
          retryable: false,
          details: { status: error.status },
        };
      }

      // Server error
      if (error.status >= 500) {
        return {
          code: 'SERVER_ERROR',
          message: 'Claude API server error. Please try again.',
          type: 'api_error',
          retryable: true,
          details: { status: error.status },
        };
      }

      return {
        code: 'API_ERROR',
        message: error.message || 'An API error occurred.',
        type: 'api_error',
        retryable: false,
        details: { status: error.status },
      };
    }

    // Network error
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      return {
        code: 'NETWORK_ERROR',
        message: 'Network error. Please check your connection.',
        type: 'network_error',
        retryable: true,
        details: { code: error.code },
      };
    }

    // Generic error
    return {
      code: 'UNKNOWN_ERROR',
      message: error.message || 'An unknown error occurred.',
      type: 'api_error',
      retryable: false,
      details: error,
    };
  }

  /**
   * Retry logic for failed requests
   */
  protected async executeWithRetry<T>(
    fn: () => Promise<AgentResponse<T>>,
    options?: { maxRetries?: number; retryDelay?: number }
  ): Promise<AgentResponse<T>> {
    const maxRetries = options?.maxRetries ?? 3;
    const retryDelay = options?.retryDelay ?? 1000;

    let lastError: AgentError | undefined;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const result = await fn();

      if (result.success) {
        return result;
      }

      lastError = result.error;

      // Don't retry if error is not retryable
      if (!result.error?.retryable) {
        return result;
      }

      // Don't retry on last attempt
      if (attempt < maxRetries) {
        logger.info('Retrying after error', {
          agent: this.constructor.name,
          attempt,
          maxRetries,
          error: result.error.code,
        });

        await this.sleep(retryDelay * attempt);
      }
    }

    return {
      success: false,
      error: lastError,
    };
  }

  /**
   * Sleep utility for retry delays
   */
  protected sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get agent configuration
   */
  getConfig(): Readonly<AgentConfig> {
    return { ...this.config };
  }

  /**
   * Update agent configuration
   */
  updateConfig(updates: Partial<AgentConfig>): void {
    this.config = { ...this.config, ...updates };
    logger.info(`${this.constructor.name} configuration updated`, updates);
  }
}
