/**
 * AI Agent Types and Interfaces
 *
 * Type definitions for AI agents, prompts, and responses
 */

// Claude API Message Format
export interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Agent Response
export interface AgentResponse<T = any> {
  success: boolean;
  data?: T;
  error?: AgentError;
  rawResponse?: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  model?: string;
  stopReason?: 'end_turn' | 'max_tokens' | 'stop_sequence';
}

// Agent Error
export interface AgentError {
  code: string;
  message: string;
  type: 'api_error' | 'validation_error' | 'network_error' | 'rate_limit_error' | 'parsing_error';
  retryable: boolean;
  details?: any;
}

// Prompt Template
export interface PromptTemplate {
  name: string;
  description?: string;
  systemPrompt: string;
  userPromptTemplate: string;
  variables: string[];
  examples?: PromptExample[];
  temperature?: number;
  maxTokens?: number;
  stopSequences?: string[];
}

// Prompt Example for few-shot learning
export interface PromptExample {
  input: Record<string, any>;
  output: string;
}

// Agent Configuration
export interface AgentConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  topP?: number;
  topK?: number;
  stopSequences?: string[];
  systemPrompt?: string;
}

// Claude API Request
export interface ClaudeRequest {
  model: string;
  messages: AIMessage[];
  system?: string;
  max_tokens: number;
  temperature?: number;
  top_p?: number;
  top_k?: number;
  stop_sequences?: string[];
  stream?: boolean;
}

// Claude API Response
export interface ClaudeResponse {
  id: string;
  type: 'message';
  role: 'assistant';
  content: ClaudeContent[];
  model: string;
  stop_reason: 'end_turn' | 'max_tokens' | 'stop_sequence';
  stop_sequence?: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

// Claude Content Block
export interface ClaudeContent {
  type: 'text';
  text: string;
}

// Streaming Response
export interface StreamingChunk {
  type: 'message_start' | 'content_block_start' | 'content_block_delta' | 'content_block_stop' | 'message_delta' | 'message_stop' | 'error';
  index?: number;
  delta?: {
    type: 'text_delta';
    text: string;
  };
  message?: Partial<ClaudeResponse>;
  usage?: {
    input_tokens?: number;
    output_tokens?: number;
  };
  error?: {
    type: string;
    message: string;
  };
}

// Resume Data for AI Processing
export interface ResumeData {
  personalInfo: {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
    linkedinUrl?: string;
    githubUrl?: string;
  };
  summary?: string;
  experiences: Array<{
    company: string;
    position: string;
    duration: string;
    description?: string;
    achievements?: string[];
    technologies?: string[];
  }>;
  educations: Array<{
    institution: string;
    degree: string;
    fieldOfStudy: string;
    duration: string;
    gpa?: number;
  }>;
  skills: Array<{
    name: string;
    category?: string;
    level?: string;
  }>;
  certifications?: Array<{
    name: string;
    organization: string;
    date: string;
  }>;
}

// Job Description Data
export interface JobDescriptionData {
  title: string;
  company: string;
  location?: string;
  workMode?: string;
  jobType?: string;
  salary?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  description: string;
  requirements?: string[];
  responsibilities?: string[];
  benefits?: string[];
  technologies?: string[];
}

// Conversation Context
export interface ConversationContext {
  userId: string;
  conversationId?: string;
  messages: AIMessage[];
  metadata?: Record<string, any>;
}

// Agent Execution Options
export interface AgentExecutionOptions {
  temperature?: number;
  maxTokens?: number;
  stopSequences?: string[];
  stream?: boolean;
  retryOnError?: boolean;
  maxRetries?: number;
  timeout?: number;
}

// Structured Output Types
export interface CoverLetterOutput {
  coverLetter: string;
  keyPoints: string[];
  tone: 'professional' | 'casual' | 'enthusiastic';
  wordCount: number;
}

export interface ResumeAnalysisOutput {
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  keywordMatch: {
    matched: string[];
    missing: string[];
    score: number;
  };
  sections: {
    summary: { score: number; feedback: string };
    experience: { score: number; feedback: string };
    education: { score: number; feedback: string };
    skills: { score: number; feedback: string };
  };
}

export interface InterviewPrepOutput {
  commonQuestions: Array<{
    question: string;
    category: 'behavioral' | 'technical' | 'situational';
    suggestedAnswer: string;
    tips: string[];
  }>;
  companyResearch: {
    keyFacts: string[];
    culture: string[];
    recentNews: string[];
  };
  starExamples: Array<{
    situation: string;
    task: string;
    action: string;
    result: string;
  }>;
}

export interface CareerAdviceOutput {
  advice: string;
  actionItems: string[];
  resources: Array<{
    title: string;
    url?: string;
    description: string;
  }>;
  timeline?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}
