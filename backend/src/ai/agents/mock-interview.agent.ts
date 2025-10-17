import Anthropic from '@anthropic-ai/sdk';
import {
  getClaudeClient,
  getClaudeConfig,
  calculateTokenCost,
} from '@/config/claude.config';
import { logger } from '@/config/logger';
import {
  QUESTION_GENERATION_SYSTEM_PROMPT,
  ANSWER_EVALUATION_SYSTEM_PROMPT,
  SESSION_ANALYSIS_SYSTEM_PROMPT,
  generateQuestionUserPrompt,
  generateEvaluationUserPrompt,
  generateSessionAnalysisUserPrompt,
  GeneratedQuestions,
  AnswerEvaluation,
  SessionAnalysis,
} from '@/ai/prompts/mock-interview.prompt';

/**
 * Mock Interview Agent
 *
 * Handles all AI operations for mock interviews:
 * 1. Question Generation
 * 2. Answer Evaluation
 * 3. Session Analysis
 */
export class MockInterviewAgent {
  private client: Anthropic;
  private model: string;
  private temperature: number;
  private maxTokens: number;

  constructor() {
    const config = getClaudeConfig();
    this.client = getClaudeClient();
    this.model = config.model;
    this.temperature = 0.7; // Good for creative question generation
    this.maxTokens = 4096;

    logger.info('MockInterviewAgent initialized', {
      model: this.model,
      temperature: this.temperature,
    });
  }

  /**
   * Generate interview questions based on job, company, and interviewer context
   */
  async generateQuestions(input: {
    jobTitle: string;
    companyName: string;
    jobDescription?: string;
    interviewType: string;
    difficulty: string;
    numberOfQuestions: number;
    interviewers?: Array<{
      name?: string;
      title?: string;
      linkedInUrl?: string;
    }>;
  }): Promise<GeneratedQuestions> {
    const startTime = Date.now();

    try {
      const userPrompt = generateQuestionUserPrompt(input);

      logger.info('Generating interview questions', {
        jobTitle: input.jobTitle,
        company: input.companyName,
        type: input.interviewType,
        difficulty: input.difficulty,
        count: input.numberOfQuestions,
      });

      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        system: QUESTION_GENERATION_SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: userPrompt,
          },
        ],
      });

      // Extract text content
      const textContent = response.content
        .filter((c): c is Anthropic.TextBlock => c.type === 'text')
        .map((c) => c.text)
        .join('\n');

      // Parse JSON response
      const result = this.parseJSON<GeneratedQuestions>(textContent);

      // Calculate cost
      const cost = calculateTokenCost(
        response.model,
        response.usage.input_tokens,
        response.usage.output_tokens
      );

      const duration = Date.now() - startTime;

      logger.info('Questions generated successfully', {
        questionsCount: result.questions.length,
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
        cost: `$${cost.toFixed(4)}`,
        duration: `${duration}ms`,
      });

      return result;
    } catch (error: any) {
      logger.error('Failed to generate questions', {
        error: error.message,
        duration: `${Date.now() - startTime}ms`,
      });
      throw new Error(`Question generation failed: ${error.message}`);
    }
  }

  /**
   * Evaluate a candidate's answer to a question
   */
  async evaluateAnswer(input: {
    question: string;
    questionCategory: string;
    keyPointsToInclude: string[];
    evaluationCriteria: string[];
    userAnswer: string;
    jobContext: {
      title: string;
      company: string;
    };
  }): Promise<AnswerEvaluation> {
    const startTime = Date.now();

    try {
      const userPrompt = generateEvaluationUserPrompt(input);

      logger.info('Evaluating answer', {
        questionCategory: input.questionCategory,
        answerLength: input.userAnswer.length,
      });

      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
        temperature: 0.3, // Lower temperature for more consistent evaluation
        system: ANSWER_EVALUATION_SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: userPrompt,
          },
        ],
      });

      // Extract text content
      const textContent = response.content
        .filter((c): c is Anthropic.TextBlock => c.type === 'text')
        .map((c) => c.text)
        .join('\n');

      // Parse JSON response
      const result = this.parseJSON<AnswerEvaluation>(textContent);

      // Calculate cost
      const cost = calculateTokenCost(
        response.model,
        response.usage.input_tokens,
        response.usage.output_tokens
      );

      const duration = Date.now() - startTime;

      logger.info('Answer evaluated successfully', {
        score: result.score,
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
        cost: `$${cost.toFixed(4)}`,
        duration: `${duration}ms`,
      });

      return result;
    } catch (error: any) {
      logger.error('Failed to evaluate answer', {
        error: error.message,
        duration: `${Date.now() - startTime}ms`,
      });
      throw new Error(`Answer evaluation failed: ${error.message}`);
    }
  }

  /**
   * Analyze complete mock interview session
   */
  async analyzeSession(input: {
    interviewType: string;
    questionsAndAnswers: Array<{
      question: string;
      category: string;
      answer: string;
      evaluation: {
        score: number;
        strengths: string[];
        improvements: string[];
      };
    }>;
    jobContext: {
      title: string;
      company: string;
    };
  }): Promise<SessionAnalysis> {
    const startTime = Date.now();

    try {
      const userPrompt = generateSessionAnalysisUserPrompt(input);

      logger.info('Analyzing interview session', {
        interviewType: input.interviewType,
        questionCount: input.questionsAndAnswers.length,
      });

      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
        temperature: 0.5, // Balanced temperature for analysis
        system: SESSION_ANALYSIS_SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: userPrompt,
          },
        ],
      });

      // Extract text content
      const textContent = response.content
        .filter((c): c is Anthropic.TextBlock => c.type === 'text')
        .map((c) => c.text)
        .join('\n');

      // Parse JSON response
      const result = this.parseJSON<SessionAnalysis>(textContent);

      // Calculate cost
      const cost = calculateTokenCost(
        response.model,
        response.usage.input_tokens,
        response.usage.output_tokens
      );

      const duration = Date.now() - startTime;

      logger.info('Session analyzed successfully', {
        overallScore: result.overallScore,
        readinessLevel: result.readinessLevel,
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
        cost: `$${cost.toFixed(4)}`,
        duration: `${duration}ms`,
      });

      return result;
    } catch (error: any) {
      logger.error('Failed to analyze session', {
        error: error.message,
        duration: `${Date.now() - startTime}ms`,
      });
      throw new Error(`Session analysis failed: ${error.message}`);
    }
  }

  /**
   * Parse JSON response from Claude, handling markdown code blocks
   */
  private parseJSON<T>(text: string): T {
    try {
      // Try direct parse first
      return JSON.parse(text);
    } catch (e) {
      // Try to extract JSON from markdown code block
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/```\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        return JSON.parse(jsonMatch[1]);
      }
      throw new Error('Failed to parse JSON response from Claude');
    }
  }
}

// Export singleton instance
export const mockInterviewAgent = new MockInterviewAgent();
