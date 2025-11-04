# AI Agent Architecture

## Related Docs
- [Project Architecture](./project_architecture.md)
- [Database Schema](./database_schema.md)
- [README.md](../README.md) - Documentation index

---

## Overview

The AI Career Coach platform leverages **Anthropic's Claude AI** through a modular agent-based architecture. This design provides flexibility, reusability, and maintainability for AI-powered features.

### Core Principles
- **Agent-based design** - Each AI feature is a specialized agent
- **Base class abstraction** - Common functionality in BaseAgent
- **Type safety** - Full TypeScript support
- **Error handling** - Robust retry and error recovery
- **Cost tracking** - Monitor token usage and API costs
- **Streaming support** - Real-time responses for better UX

### Implementation Status (Nov 4, 2025)

**Implemented Agents** (7/11):
- ✅ ResumeParserAgent - Extract structured data from resumes
- ✅ ResumeTailorAgent - Optimize resumes for specific jobs
- ✅ CoverLetterAgent - Generate personalized cover letters
- ✅ MockInterviewAgent - Conduct AI mock interviews
- ✅ JobParserAgent - Parse job postings from URLs
- ✅ ResumeAnalyzerAgent - Analyze resume quality and ATS compatibility
- ✅ JobAnalyzerAgent - Analyze job postings and match against resumes ⭐ NEW

**Planned Agents** (4/11):
- ❌ InterviewPrepAgent - Generate interview preparation materials
- ❌ JobMatchAgent - Calculate resume-job fit scores
- ❌ CompanyResearchAgent - Research companies
- ❌ InterviewerResearchAgent - Research interviewers

---

## Architecture Diagram

```
┌───────────────────────────────────────────────────────────────┐
│                      Claude AI Integration                     │
└────────────────────────────┬──────────────────────────────────┘
                             │
                ┌────────────┴─────────────┐
                │  ClaudeClientManager     │
                │  (Singleton)             │
                │  - API client            │
                │  - Configuration         │
                │  - Token tracking        │
                │  - Cost calculation      │
                └────────────┬─────────────┘
                             │
                ┌────────────┴─────────────┐
                │  BaseAgent<TInput,TOut>  │
                │  (Abstract)              │
                │                          │
                │  - callClaude()          │
                │  - callClaudeStreaming() │
                │  - handleError()         │
                │  - executeWithRetry()    │
                └────────────┬─────────────┘
                             │
           ┌─────────────────┼──────────────────┐
           │                 │                  │
    ┌──────▼──────┐   ┌─────▼─────┐   ┌───────▼────────┐
    │ ResumeParser │   │  Tailor   │   │ MockInterview  │
    │   Agent      │   │  Agent    │   │    Agent       │
    │              │   │           │   │                │
    │ - Parse PDF  │   │ - Optimize│   │ - Conduct      │
    │ - Extract    │   │   resume  │   │   interview    │
    │   data       │   │ - Compare │   │ - Score        │
    │              │   │           │   │ - Feedback     │
    └──────────────┘   └───────────┘   └────────────────┘
```

---

## Core Components

### 1. ClaudeClientManager (`backend/src/config/claude.config.ts`)

**Purpose**: Centralized management of Claude API client and configuration.

#### Configuration Interface
```typescript
interface ClaudeConfig {
  apiKey: string;              // Anthropic API key
  model: string;               // Default model
  maxTokens: number;           // Max output tokens
  temperature: number;         // Randomness (0-1)
  topP: number;               // Nucleus sampling
  topK: number;               // Top-k sampling
  timeout: number;            // Request timeout (ms)
  maxRetries: number;         // Retry attempts
  retryDelay: number;         // Delay between retries (ms)
}
```

#### Available Models
```typescript
const CLAUDE_MODELS = {
  SONNET_4_5: 'claude-sonnet-4-5-20250929',    // Primary (balanced)
  OPUS_4: 'claude-opus-4-20250514',             // Advanced tasks
  HAIKU_3_5: 'claude-3-5-haiku-20241022'        // Quick tasks
}
```

#### Cost Tracking
```typescript
const MODEL_COSTS = {
  'claude-sonnet-4-5-20250929': {
    input: 3.0,    // Per 1M tokens
    output: 15.0   // Per 1M tokens
  },
  'claude-opus-4-20250514': {
    input: 15.0,
    output: 75.0
  },
  'claude-3-5-haiku-20241022': {
    input: 1.0,
    output: 5.0
  }
}
```

#### Key Methods
```typescript
class ClaudeClientManager {
  getClient(): Anthropic
  getConfig(): ClaudeConfig
  updateConfig(updates: Partial<ClaudeConfig>): void
  calculateCost(model: string, inputTokens: number, outputTokens: number): number
  getTokenLimit(model: string): number
  validateTokenCount(model: string, estimatedTokens: number): ValidationResult
  estimateTokens(text: string): number
}
```

---

### 2. BaseAgent (`backend/src/ai/agents/base.agent.ts`)

**Purpose**: Abstract base class providing common AI agent functionality.

#### Agent Configuration
```typescript
interface AgentConfig {
  model: string;              // Claude model to use
  temperature: number;        // Randomness level
  maxTokens: number;          // Max output tokens
  topP?: number;             // Nucleus sampling
  topK?: number;             // Top-k sampling
  stopSequences?: string[];  // Stop generation sequences
  systemPrompt?: string;     // System-level instructions
}
```

#### Core Methods

##### Standard API Call
```typescript
protected async callClaude(params: {
  systemPrompt?: string;
  userMessage: string;
  messages?: AIMessage[];
  temperature?: number;
  maxTokens?: number;
  stopSequences?: string[];
}): Promise<AgentResponse<string>>
```

Features:
- Automatic token usage logging
- Cost calculation
- Error handling
- Response parsing

##### Streaming API Call
```typescript
protected async callClaudeStreaming(params: {
  systemPrompt?: string;
  userMessage: string;
  messages?: AIMessage[];
  temperature?: number;
  maxTokens?: number;
  stopSequences?: string[];
  onChunk?: (chunk: string) => void;
  onComplete?: (fullText: string) => void;
}): Promise<AgentResponse<string>>
```

Features:
- Real-time streaming
- Chunk-by-chunk callbacks
- Progress tracking
- Token usage tracking

##### Error Handling
```typescript
protected async handleError(
  error: any,
  startTime: number
): Promise<AgentResponse<any>>

protected mapError(error: any): AgentError
```

Error Types:
- `RATE_LIMIT_ERROR` - API rate limit exceeded (retryable)
- `AUTHENTICATION_ERROR` - Invalid API key (not retryable)
- `VALIDATION_ERROR` - Invalid request (not retryable)
- `SERVER_ERROR` - Claude API error (retryable)
- `NETWORK_ERROR` - Connection issues (retryable)
- `UNKNOWN_ERROR` - Unexpected errors (not retryable)

##### Retry Logic
```typescript
protected async executeWithRetry<T>(
  fn: () => Promise<AgentResponse<T>>,
  options?: {
    maxRetries?: number;
    retryDelay?: number;
  }
): Promise<AgentResponse<T>>
```

Features:
- Exponential backoff
- Retryable error detection
- Configurable retry attempts
- Retry logging

#### Response Format
```typescript
interface AgentResponse<T> {
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
  stopReason?: string;
}
```

---

### 3. Agent Implementations

#### ResumeParserAgent (`backend/src/ai/agents/resume-parser.agent.ts`)

**Purpose**: Extract structured data from resume documents.

```typescript
class ResumeParserAgent extends BaseAgent<ResumeParserInput, ResumeParserOutput> {
  async execute(
    input: ResumeParserInput,
    options?: AgentExecutionOptions
  ): Promise<AgentResponse<ResumeParserOutput>>
}
```

**Input**:
```typescript
interface ResumeParserInput {
  resumeText: string;      // Extracted text from PDF/DOC
  fileName?: string;       // Original file name
  additionalContext?: string;
}
```

**Output**:
```typescript
interface ResumeParserOutput {
  personalInfo: {
    fullName: string;
    email?: string;
    phone?: string;
    location?: string;
    linkedinUrl?: string;
    githubUrl?: string;
    portfolioUrl?: string;
  };
  summary?: string;
  experiences: Array<{
    company: string;
    position: string;
    startDate: string;
    endDate?: string;
    description?: string;
    achievements: string[];
    technologies: string[];
  }>;
  education: Array<{
    institution: string;
    degree: string;
    fieldOfStudy: string;
    startDate: string;
    endDate?: string;
    gpa?: number;
  }>;
  skills: Array<{
    name: string;
    category?: string;
    level?: string;
  }>;
  certifications: Array<{
    name: string;
    issuingOrganization: string;
    issueDate: string;
    expiryDate?: string;
  }>;
}
```

**System Prompt**: See `backend/src/ai/prompts/resume-parser.prompt.ts`

**Usage**:
```typescript
const agent = new ResumeParserAgent();
const result = await agent.execute({
  resumeText: extractedText,
  fileName: 'John_Doe_Resume.pdf'
});

if (result.success) {
  const parsedData = result.data;
  // Save to database
}
```

---

#### ResumeTailorAgent ✅ IMPLEMENTED

**File**: `backend/src/ai/agents/resume-tailor.agent.ts`
**Status**: Production-ready
**Purpose**: Optimize resume content for specific job descriptions.

**Configuration**:
- Temperature: 0.5 (balanced creativity/accuracy)
- Max Tokens: 8000 (large for complete resume)
- Model: Claude Sonnet 4.5

```typescript
class TailorResumeAgent extends BaseAgent<TailorInput, TailorOutput> {
  async execute(
    input: TailorInput,
    options?: AgentExecutionOptions
  ): Promise<AgentResponse<TailorOutput>>
}
```

**Input**:
```typescript
interface TailorInput {
  resumeData: ResumeParserOutput;
  jobDescription: string;
  jobTitle?: string;
  companyName?: string;
  focusAreas?: string[];      // Skills to emphasize
}
```

**Output**:
```typescript
interface TailorOutput {
  tailoredResume: ResumeParserOutput;
  changes: Array<{
    section: string;
    field: string;
    original: string;
    updated: string;
    reason: string;
  }>;
  matchScore: number;          // 0-100
  recommendations: string[];
  keywords: string[];          // Matched keywords
}
```

---

#### CoverLetterAgent ✅ IMPLEMENTED

**File**: `backend/src/ai/agents/cover-letter.agent.ts`
**Status**: Production-ready
**Purpose**: Generate personalized cover letters.

**Configuration**:
- Temperature: 0.7 (more creative)
- Max Tokens: 2048
- Model: Claude Sonnet 4.5

```typescript
class CoverLetterAgent extends BaseAgent<CoverLetterInput, CoverLetterOutput> {
  async execute(
    input: CoverLetterInput,
    options?: AgentExecutionOptions
  ): Promise<AgentResponse<CoverLetterOutput>>
}
```

**Input**:
```typescript
interface CoverLetterInput {
  resumeData: ResumeParserOutput;
  jobDescription: string;
  jobTitle: string;
  companyName: string;
  tone?: 'professional' | 'enthusiastic' | 'formal';
  additionalInfo?: string;
}
```

**Output**:
```typescript
interface CoverLetterOutput {
  coverLetter: string;
  wordCount: number;
  highlightedSkills: string[];
  suggestions: string[];
}
```

---

#### MockInterviewAgent ✅ IMPLEMENTED

**File**: `backend/src/ai/agents/mock-interview.agent.ts`
**Status**: Production-ready
**Purpose**: Conduct AI-powered mock interviews with question generation, answer evaluation, and comprehensive feedback.

**Configuration**:
- Temperature: 0.7 (questions), 0.3 (evaluation), 0.5 (analysis)
- Max Tokens: 4096
- Model: Claude Sonnet 4.5

```typescript
class MockInterviewAgent extends BaseAgent<InterviewInput, InterviewOutput> {
  async conductInterview(
    input: InterviewInput
  ): Promise<AgentResponse<InterviewOutput>>

  async evaluateResponse(
    question: string,
    answer: string
  ): Promise<AgentResponse<EvaluationOutput>>
}
```

**Input**:
```typescript
interface InterviewInput {
  resumeData: ResumeParserOutput;
  targetRole: string;
  interviewType: InterviewType;
  difficulty: 'easy' | 'medium' | 'hard';
  numQuestions?: number;
}
```

**Output**:
```typescript
interface InterviewOutput {
  questions: Array<{
    question: string;
    category: string;       // Technical, Behavioral, etc.
    difficulty: string;
    expectedAnswer?: string;
  }>;
  sessionId: string;
}

interface EvaluationOutput {
  score: number;            // 0-100
  feedback: string;
  strengths: string[];
  improvements: string[];
  suggestedAnswer?: string;
}
```

---

#### JobMatchAgent (Planned)

**Purpose**: Calculate resume-job fit score.

```typescript
class JobMatchAgent extends BaseAgent<JobMatchInput, JobMatchOutput> {
  async execute(
    input: JobMatchInput,
    options?: AgentExecutionOptions
  ): Promise<AgentResponse<JobMatchOutput>>
}
```

**Input**:
```typescript
interface JobMatchInput {
  resumeData: ResumeParserOutput;
  jobDescription: string;
  jobRequirements: string[];
}
```

**Output**:
```typescript
interface JobMatchOutput {
  matchScore: number;        // 0-100
  matchedSkills: string[];
  missingSkills: string[];
  experienceMatch: number;   // 0-100
  educationMatch: number;    // 0-100
  recommendations: string[];
  competitiveness: 'low' | 'medium' | 'high';
}
```

---

#### JobParserAgent ✅ IMPLEMENTED

**File**: `backend/src/ai/agents/job-parser.agent.ts`
**Status**: Production-ready
**Purpose**: Parse job postings from URLs using web scraping and AI extraction.

**Configuration**:
- Temperature: 0.3 (consistent extraction)
- Max Tokens: 4096
- Model: Claude Sonnet 4.5

**Features**:
- Two-tier fetching strategy:
  1. Axios (fast, for static content)
  2. Puppeteer (JavaScript-rendered pages)
- Cheerio for HTML parsing
- Smart content extraction with multiple selector strategies
- Handles LinkedIn, Workday, and various job boards

```typescript
class JobParserAgent extends BaseAgent<JobParserInput, JobParserOutput> {
  async execute(
    input: JobParserInput,
    options?: AgentExecutionOptions
  ): Promise<AgentResponse<JobParserOutput>>
}
```

**Input**:
```typescript
interface JobParserInput {
  url: string;                    // Job posting URL
  useHeadlessBrowser?: boolean;   // Force Puppeteer for JS-heavy sites
}
```

**Output**:
```typescript
interface JobParserOutput {
  company: string;
  title: string;
  description: string;           // Full job description
  location?: string;
  salary?: string;
  jobType?: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP';
  workMode?: 'REMOTE' | 'HYBRID' | 'ONSITE';
  requiredSkills?: string[];
  preferredSkills?: string[];
  benefits?: string[];
}
```

**Cost Tracking**:
- Typical usage: 2,000-4,000 tokens per job posting
- Estimated cost: $0.01-0.02 per job parsing

---

#### ResumeAnalyzerAgent ✅ IMPLEMENTED

**File**: `backend/src/ai/agents/resume-analyzer.agent.ts`
**Status**: Production-ready (Oct 28, 2025)
**Purpose**: Analyze resume quality, ATS compatibility, and provide actionable feedback with detailed scoring.

**Configuration**:
- Temperature: 0.5 (balanced)
- Max Tokens: 4096
- Model: Claude Sonnet 4.5

**Features**:
- Comprehensive quality scoring (0-100 scale)
- ATS compatibility analysis
- Section-by-section breakdown
- Keyword analysis (matched, missing, overused)
- Prioritized improvement suggestions
- 19+ validation checks

```typescript
class ResumeAnalyzerAgent extends BaseAgent<ResumeAnalyzerInput, ResumeAnalysisResult> {
  async execute(
    input: ResumeAnalyzerInput,
    options?: AgentExecutionOptions
  ): Promise<AgentResponse<ResumeAnalysisResult>>
}
```

**Input**:
```typescript
interface ResumeAnalyzerInput {
  resumeData: ParsedResumeData;
  targetRole?: string;           // Optional: tailor analysis to specific role
  targetIndustry?: string;       // Optional: industry-specific insights
}
```

**Output**:
```typescript
interface ResumeAnalysisResult {
  overallScore: number;          // 0-100
  atsScore: number;              // 0-100
  readabilityScore: number;      // 0-100

  strengths: string[];           // 3-5 specific strengths
  weaknesses: string[];          // 3-5 specific weaknesses

  sections: {
    summary: {
      score: number | null;      // 0-100 or null if section not present
      feedback: string;
      issues: string[];
    };
    experience: {
      score: number | null;
      feedback: string;
      issues: string[];
    };
    education: {
      score: number | null;
      feedback: string;
      issues: string[];
    };
    skills: {
      score: number | null;
      feedback: string;
      issues: string[];
    };
  };

  keywordAnalysis: {
    targetRole: string;
    targetIndustry: string;
    matchedKeywords: string[];
    missingKeywords: string[];
    overusedWords: string[];
  };

  atsIssues: string[];           // Specific ATS compatibility problems

  suggestions: Array<{
    section: string;
    priority: 'high' | 'medium' | 'low';
    issue: string;
    suggestion: string;
    example: {
      before: string;
      after: string;
    };
    impact: string;              // Why this improvement matters
  }>;
}
```

**Validation**:
- 19+ structure validation checks
- Score range validation (0-100)
- Required field verification
- Section structure validation
- Suggestions format validation

---

#### JobAnalyzerAgent ✅ IMPLEMENTED

**File**: `backend/src/ai/agents/job-analyzer.agent.ts`
**Status**: Production-ready (Nov 4, 2025)
**Purpose**: Analyze job postings, identify requirements and red flags, and match against candidate resumes with actionable insights.

**Configuration**:
- Temperature: 0.6 (balanced for analytical yet insightful analysis)
- Max Tokens: 6000
- Model: Claude Sonnet 4.5

**Features**:
- Role level analysis (entry/mid/senior/lead/executive)
- Required vs preferred skills extraction
- Red flag detection (unrealistic expectations, toxic indicators)
- Positive indicator identification
- Optional resume matching with gap analysis
- Salary insights and market comparison
- Application strategy recommendations
- Smart caching (single analysis per job)

```typescript
class JobAnalyzerAgent extends BaseAgent<JobAnalyzerInput, JobAnalysisResult> {
  async execute(
    input: JobAnalyzerInput,
    options?: AgentExecutionOptions
  ): Promise<AgentResponse<JobAnalysisResult>>
}
```

**Input**:
```typescript
interface JobAnalyzerInput {
  jobTitle: string;
  companyName: string;
  jobDescription: string;
  location?: string;
  salaryRange?: string;
  jobType?: string;
  workMode?: string;
  resumeData?: ParsedResumeData;  // Optional: for match analysis
}
```

**Output**:
```typescript
interface JobAnalysisResult {
  analysis: {
    roleLevel: 'entry' | 'mid' | 'senior' | 'lead' | 'executive';
    keyResponsibilities: string[];    // 3-8 core responsibilities
    requiredSkills: string[];          // Must-have technical & non-technical
    preferredSkills: string[];         // Nice-to-have qualifications
    redFlags: string[];                // Warning signs in posting
    highlights: string[];              // Positive indicators
  };

  matchAnalysis?: {                    // Only if resume provided
    overallMatch: number;              // 0-100 match score
    skillsMatch: number;               // 0-100 skills alignment
    experienceMatch: number;           // 0-100 experience fit
    matchReasons: string[];            // Why candidate is a good fit
    gaps: string[];                    // Skills/experience gaps
    recommendations: string[];         // Actionable improvement suggestions
  };

  salaryInsights: {
    estimatedRange: string;            // e.g., "$120,000 - $160,000"
    marketComparison: string;          // Above/at/below market
    factors: string[];                 // Factors influencing salary
  };

  applicationTips: string[];           // 4-7 actionable application tips
}
```

**Red Flag Detection**:
The agent identifies concerning patterns including:
- Unrealistic experience requirements (e.g., 10 years in 5-year-old tech)
- Excessive responsibilities for level/salary
- Vague job descriptions
- Unprofessional language ("Rockstar", "Ninja", "Guru")
- Problematic culture indicators ("We're a family", "Unlimited PTO")
- On-call expectations without compensation
- Copy-paste job descriptions with unrelated skill sets

**Database Integration**:
- Analysis cached in `JobAnalysis` table
- Single analysis per job (latest replaces previous)
- Composite unique key: (jobId, resumeId)
- Auto-deletes old analyses on new analysis creation
- Updates job.matchScore when resume provided

**API Endpoints**:
- `GET /api/ai/jobs/:jobId/analysis` - Retrieve existing analysis (no AI call)
- `POST /api/ai/jobs/analyze` - Create new analysis (calls Claude)

**Validation**:
- Job description minimum length (50 chars)
- Role level validation
- Score range validation (0-100)
- Required fields verification
- Match analysis conditional validation

**Cost Tracking**:
- Typical usage: 5,000-8,000 tokens per analysis
- Estimated cost: $0.02-0.04 per analysis

**Database Integration**:
- Results stored in `ResumeAnalysis` table
- Composite unique key: (resumeId, jobId)
- Supports job-specific analysis
- Caching for repeat analyses

---

## Prompt Engineering

### Prompt Structure

All prompts follow a consistent structure:

```typescript
const systemPrompt = `
You are an expert [ROLE].

Your task is to [OBJECTIVE].

Guidelines:
1. [GUIDELINE 1]
2. [GUIDELINE 2]
3. [GUIDELINE 3]

Output format:
[FORMAT SPECIFICATION]
`;

const userMessage = `
[CONTEXT]

[INPUT DATA]

[SPECIFIC INSTRUCTIONS]
`;
```

### Example: Resume Parser Prompt

**Location**: `backend/src/ai/prompts/resume-parser.prompt.ts`

```typescript
export const RESUME_PARSER_SYSTEM_PROMPT = `
You are an expert resume parser and career data analyst.

Your task is to extract structured information from resume text and return it in valid JSON format.

Guidelines:
1. Extract all personal information accurately
2. Parse dates in ISO 8601 format (YYYY-MM-DD)
3. Identify and categorize skills by domain
4. Extract quantifiable achievements from work experience
5. Maintain professional terminology
6. Handle missing or incomplete information gracefully

Output format:
Return a valid JSON object matching the ResumeParserOutput interface.
Include all fields, using null for missing values.
`;

export const buildResumeParserPrompt = (
  resumeText: string,
  fileName?: string
): string => {
  return `
Resume to parse:
${fileName ? `File name: ${fileName}` : ''}

${resumeText}

Please extract and structure all information from this resume.
Return only valid JSON, no additional text.
`;
};
```

### Prompt Best Practices

1. **Clear Role Definition**: Define agent's expertise
2. **Explicit Objectives**: State what to accomplish
3. **Structured Guidelines**: Numbered list of rules
4. **Output Format**: Specify exact format expected
5. **Error Handling**: Instructions for edge cases
6. **Examples**: Provide examples for clarity (when needed)
7. **Constraints**: Set boundaries and limitations

---

## Background Job Processing

### Resume Parsing Queue

**Location**: `backend/src/jobs/processors/resume-parse.processor.ts`

```typescript
interface ResumeParseJob {
  resumeId: string;
  userId: string;
  fileUrl: string;
  fileName: string;
}

export const resumeParseProcessor = async (job: Job<ResumeParseJob>) => {
  const { resumeId, userId, fileUrl, fileName } = job.data;

  try {
    // 1. Download file
    const fileBuffer = await downloadFile(fileUrl);

    // 2. Extract text
    const resumeText = await extractTextFromDocument(fileBuffer);

    // 3. Parse with AI
    const agent = new ResumeParserAgent();
    const result = await agent.execute({
      resumeText,
      fileName
    });

    if (result.success) {
      // 4. Update database
      await prisma.resume.update({
        where: { id: resumeId },
        data: {
          rawText: resumeText,
          parsedData: result.data
        }
      });

      return { success: true, resumeId };
    } else {
      throw new Error(result.error?.message);
    }
  } catch (error) {
    logger.error('Resume parse job failed', { error, resumeId });
    throw error;
  }
};
```

### Job Queue Configuration

```typescript
// backend/src/config/queue.ts
const resumeParseQueue = new Queue<ResumeParseJob>('resume-parse', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000
    },
    removeOnComplete: 100,
    removeOnFail: 50
  }
});

const worker = new Worker<ResumeParseJob>(
  'resume-parse',
  resumeParseProcessor,
  {
    connection: redisConnection,
    concurrency: 5
  }
);
```

---

## Token Usage & Cost Management

### Tracking
Every API call logs:
- Input tokens
- Output tokens
- Total tokens
- Estimated cost
- Duration

```typescript
logger.info('Claude API response', {
  agent: 'ResumeParserAgent',
  inputTokens: 1234,
  outputTokens: 567,
  totalTokens: 1801,
  cost: '$0.0324',
  duration: '2345ms',
  stopReason: 'end_turn'
});
```

### Cost Estimation
```typescript
const estimatedTokens = estimateTokens(resumeText);
const validation = validateTokenCount(model, estimatedTokens);

if (!validation.valid) {
  logger.warn('Request exceeds token limit', {
    limit: validation.limit,
    estimated: validation.estimated
  });
}
```

### Cost Optimization Strategies

1. **Model Selection**
   - Use Haiku for simple tasks (cheapest)
   - Use Sonnet for balanced tasks (recommended)
   - Use Opus only for complex tasks (expensive)

2. **Token Management**
   - Minimize system prompts
   - Use concise user messages
   - Limit conversation history
   - Request structured output

3. **Caching**
   - Cache parsed resumes (ResumeAnalysis table)
   - Cache job analyses (JobAnalysis table)
   - Single analysis per job (auto-delete old on new)
   - Cache AI analyses

4. **Rate Limiting**
   - Prevent abuse
   - Limit concurrent requests
   - Queue background jobs

### Typical Costs Per Operation

| Operation | Tokens | Cost (USD) | Model |
|-----------|--------|------------|-------|
| Resume parsing | 3,000-5,000 | $0.01-0.02 | Sonnet 4.5 |
| Resume tailoring | 8,000-12,000 | $0.03-0.06 | Sonnet 4.5 |
| Cover letter | 4,000-6,000 | $0.01-0.03 | Sonnet 4.5 |
| Mock interview questions | 3,000-5,000 | $0.01-0.02 | Sonnet 4.5 |
| Answer evaluation | 2,000-4,000 | $0.01 | Sonnet 4.5 |
| Session analysis | 6,000-10,000 | $0.02-0.04 | Sonnet 4.5 |
| Resume analysis | 5,000-8,000 | $0.02-0.04 | Sonnet 4.5 |
| Job analysis | 5,000-8,000 | $0.02-0.04 | Sonnet 4.5 |

**Note**: Costs based on Sonnet 4.5 pricing. Actual costs may vary based on content length and complexity.

---

## Error Handling & Recovery

### Error Types

```typescript
interface AgentError {
  code: string;
  message: string;
  type: 'api_error' | 'rate_limit_error' | 'validation_error' | 'network_error';
  retryable: boolean;
  details?: any;
}
```

### Retry Strategy

```typescript
const result = await agent.executeWithRetry(
  () => agent.execute(input),
  {
    maxRetries: 3,
    retryDelay: 1000  // Exponential backoff
  }
);
```

### Graceful Degradation

```typescript
try {
  const result = await agent.execute(input);
  return result.data;
} catch (error) {
  // Log error
  logger.error('Agent execution failed', { error });

  // Return fallback
  return {
    success: false,
    fallback: true,
    message: 'AI processing temporarily unavailable'
  };
}
```

---

## Testing Strategy

### Unit Tests
```typescript
describe('ResumeParserAgent', () => {
  it('should parse resume with all fields', async () => {
    const agent = new ResumeParserAgent();
    const result = await agent.execute({
      resumeText: mockResumeText
    });

    expect(result.success).toBe(true);
    expect(result.data.personalInfo.fullName).toBeDefined();
    expect(result.data.experiences).toHaveLength(2);
  });

  it('should handle missing fields gracefully', async () => {
    // Test implementation
  });
});
```

### Integration Tests
```typescript
describe('Resume Parse Flow', () => {
  it('should process resume end-to-end', async () => {
    // Upload resume
    // Trigger parsing
    // Wait for completion
    // Verify database update
  });
});
```

### Mock Responses
```typescript
const mockClaudeResponse = {
  content: [{ type: 'text', text: JSON.stringify(mockParsedData) }],
  usage: { input_tokens: 1000, output_tokens: 500 },
  model: 'claude-sonnet-4-5-20250929',
  stop_reason: 'end_turn'
};
```

---

## Future Enhancements

### Planned Agents
- **CareerCoachAgent** - Personalized career advice
- **SkillGapAgent** - Identify skill gaps
- **SalaryNegotiationAgent** - Negotiation strategies
- **NetworkingAgent** - Connection recommendations
- **ResumeReviewAgent** - Comprehensive resume critique

### Technical Improvements
- **Agent Orchestration** - Multi-agent workflows
- **Prompt Versioning** - A/B test prompts
- **Response Validation** - Stronger output validation
- **Caching Layer** - Cache AI responses
- **Monitoring Dashboard** - Track agent performance
- **Custom Fine-tuning** - Domain-specific models

---

**Last Updated**: 2025-10-13
**Architecture Version**: 1.0.0
