# AI Agents Quick Start Guide

Get up and running with AI agents in 5 minutes.

---

## Prerequisites

1. **Anthropic API Key**
   - Sign up at [console.anthropic.com](https://console.anthropic.com/)
   - Generate an API key
   - Add to `.env`: `ANTHROPIC_API_KEY=your-key-here`

2. **Install Dependencies**
   ```bash
   npm install @anthropic-ai/sdk
   ```

---

## Quick Example

### 1. Create a Simple Agent

```typescript
// src/ai/agents/simple.agent.ts
import { BaseAgent } from '@/ai/agents/base.agent';
import { AgentResponse } from '@/types/ai.types';
import { ResponseParser } from '@/ai/utils/response-parser';

export class SimpleAgent extends BaseAgent<string, string> {
  constructor() {
    super({
      systemPrompt: 'You are a helpful AI assistant.',
      temperature: 0.7,
    });
  }

  async execute(question: string): Promise<AgentResponse<string>> {
    const response = await this.callClaude({
      userMessage: question,
    });

    return response;
  }
}

export const simpleAgent = new SimpleAgent();
```

### 2. Use the Agent

```typescript
// In your controller or service
import { simpleAgent } from '@/ai/agents/simple.agent';

async function askQuestion() {
  const result = await simpleAgent.execute('What is AI?');

  if (result.success) {
    console.log('Answer:', result.data);
    console.log('Tokens used:', result.usage?.totalTokens);
  } else {
    console.error('Error:', result.error?.message);
  }
}
```

---

## Example: Resume Analyzer Agent

### Create the Agent

```typescript
// src/ai/agents/resume-analyzer.agent.ts
import { BaseAgent } from '@/ai/agents/base.agent';
import { AgentResponse } from '@/types/ai.types';
import { ResponseParser } from '@/ai/utils/response-parser';
import { formatResume, formatJobDescription } from '@/ai/utils/prompt-builder';

interface AnalysisInput {
  resumeText: string;
  jobDescription: string;
}

interface AnalysisOutput {
  score: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  matchPercentage: number;
}

export class ResumeAnalyzerAgent extends BaseAgent<AnalysisInput, AnalysisOutput> {
  constructor() {
    super({
      systemPrompt: `You are an expert resume analyzer and career coach.
Analyze resumes against job descriptions and provide detailed, actionable feedback.
Always respond in valid JSON format.`,
      temperature: 0.5,
      maxTokens: 2048,
    });
  }

  async execute(input: AnalysisInput): Promise<AgentResponse<AnalysisOutput>> {
    const prompt = `
Analyze how well this resume matches the job description.

RESUME:
${input.resumeText}

JOB DESCRIPTION:
${input.jobDescription}

Provide analysis in JSON format with these exact keys:
{
  "score": number (0-100),
  "matchPercentage": number (0-100),
  "strengths": string[],
  "weaknesses": string[],
  "recommendations": string[]
}
`;

    // Call Claude API
    const response = await this.callClaude({
      userMessage: prompt,
    });

    if (!response.success) {
      return response;
    }

    // Parse JSON response
    const parsed = ResponseParser.parseJSON<AnalysisOutput>(response.data!);

    return {
      success: parsed.success,
      data: parsed.data,
      error: parsed.error,
      rawResponse: response.rawResponse,
      usage: response.usage,
    };
  }
}

export const resumeAnalyzerAgent = new ResumeAnalyzerAgent();
```

### Use in Service

```typescript
// src/services/resume-analysis.service.ts
import { resumeAnalyzerAgent } from '@/ai/agents/resume-analyzer.agent';
import { prisma } from '@/database/client';

export class ResumeAnalysisService {
  async analyzeResumeForJob(resumeId: string, jobId: string, userId: string) {
    // Fetch resume and job
    const resume = await prisma.resume.findUnique({ where: { id: resumeId } });
    const job = await prisma.job.findUnique({ where: { id: jobId } });

    if (!resume || !job) {
      throw new Error('Resume or job not found');
    }

    // Run analysis
    const result = await resumeAnalyzerAgent.execute({
      resumeText: resume.rawText || '',
      jobDescription: job.description || '',
    });

    if (!result.success) {
      throw new Error(result.error?.message || 'Analysis failed');
    }

    return result.data;
  }
}
```

### Use in Route

```typescript
// src/api/routes/analysis.routes.ts
import { Router } from 'express';
import { resumeAnalyzerAgent } from '@/ai/agents/resume-analyzer.agent';
import { asyncHandler } from '@/utils/asyncHandler';
import { sendSuccess } from '@/utils/response';
import { authenticate } from '@/api/middleware/auth.middleware';

const router = Router();

router.post(
  '/analyze-resume',
  authenticate,
  asyncHandler(async (req, res) => {
    const { resumeText, jobDescription } = req.body;

    const result = await resumeAnalyzerAgent.execute({
      resumeText,
      jobDescription,
    });

    if (!result.success) {
      throw new Error(result.error?.message || 'Analysis failed');
    }

    sendSuccess(res, {
      analysis: result.data,
      usage: result.usage,
    }, 'Resume analyzed successfully');
  })
);

export default router;
```

---

## Example: Cover Letter Generator

```typescript
// src/ai/agents/cover-letter.agent.ts
import { BaseAgent } from '@/ai/agents/base.agent';
import { AgentResponse } from '@/types/ai.types';

interface CoverLetterInput {
  resume: string;
  jobDescription: string;
  tone?: 'professional' | 'enthusiastic' | 'casual';
}

interface CoverLetterOutput {
  coverLetter: string;
  wordCount: number;
}

export class CoverLetterAgent extends BaseAgent<CoverLetterInput, CoverLetterOutput> {
  constructor() {
    super({
      systemPrompt: `You are an expert cover letter writer.
Create compelling, personalized cover letters that highlight relevant experience.
Match the tone requested by the user.`,
      temperature: 0.8, // More creative
      maxTokens: 2048,
    });
  }

  async execute(input: CoverLetterInput): Promise<AgentResponse<CoverLetterOutput>> {
    const tone = input.tone || 'professional';

    const prompt = `
Write a cover letter for this job application.

TONE: ${tone}

RESUME:
${input.resume}

JOB DESCRIPTION:
${input.jobDescription}

Requirements:
- Professional format with proper salutation and closing
- Highlight 2-3 most relevant experiences
- Show enthusiasm for the role
- Keep it concise (300-400 words)
- ${tone === 'professional' ? 'Formal and polished' : tone === 'enthusiastic' ? 'Energetic and passionate' : 'Friendly but professional'}
`;

    const response = await this.callClaude({
      userMessage: prompt,
    });

    if (!response.success) {
      return response;
    }

    const wordCount = response.data!.split(/\s+/).length;

    return {
      success: true,
      data: {
        coverLetter: response.data!,
        wordCount,
      },
      rawResponse: response.rawResponse,
      usage: response.usage,
    };
  }
}

export const coverLetterAgent = new CoverLetterAgent();
```

---

## Example: Interview Prep Coach

```typescript
// src/ai/agents/interview-prep.agent.ts
import { BaseAgent } from '@/ai/agents/base.agent';
import { AgentResponse } from '@/types/ai.types';
import { ResponseParser } from '@/ai/utils/response-parser';

interface InterviewPrepInput {
  jobTitle: string;
  company: string;
  jobDescription: string;
  resume: string;
}

interface InterviewQuestion {
  question: string;
  category: 'behavioral' | 'technical' | 'situational';
  suggestedAnswer: string;
  tips: string[];
}

interface InterviewPrepOutput {
  questions: InterviewQuestion[];
  keyTalking Points: string[];
  companyResearch: string[];
}

export class InterviewPrepAgent extends BaseAgent<InterviewPrepInput, InterviewPrepOutput> {
  constructor() {
    super({
      systemPrompt: `You are an expert interview coach.
Generate relevant interview questions and provide coaching for job interviews.
Base questions on the specific job and candidate's experience.`,
      temperature: 0.6,
      maxTokens: 4096,
    });
  }

  async execute(input: InterviewPrepInput): Promise<AgentResponse<InterviewPrepOutput>> {
    const prompt = `
Prepare interview guidance for:
Job: ${input.jobTitle} at ${input.company}

JOB DESCRIPTION:
${input.jobDescription}

CANDIDATE'S RESUME:
${input.resume}

Generate:
1. 10 likely interview questions (mix of behavioral, technical, and situational)
2. Suggested answers based on their resume
3. Key talking points they should emphasize
4. Company research topics to prepare

Respond in JSON format:
{
  "questions": [
    {
      "question": "...",
      "category": "behavioral|technical|situational",
      "suggestedAnswer": "...",
      "tips": ["...", "..."]
    }
  ],
  "keyTalkingPoints": ["...", "..."],
  "companyResearch": ["...", "..."]
}
`;

    const response = await this.callClaude({
      userMessage: prompt,
    });

    if (!response.success) {
      return response;
    }

    const parsed = ResponseParser.parseJSON<InterviewPrepOutput>(response.data!);

    return {
      success: parsed.success,
      data: parsed.data,
      error: parsed.error,
      rawResponse: response.rawResponse,
      usage: response.usage,
    };
  }
}

export const interviewPrepAgent = new InterviewPrepAgent();
```

---

## Streaming Example

```typescript
// src/ai/agents/chat.agent.ts
import { BaseAgent } from '@/ai/agents/base.agent';
import { AgentResponse } from '@/types/ai.types';

export class ChatAgent extends BaseAgent<string, string> {
  constructor() {
    super({
      systemPrompt: 'You are a friendly career coach assistant.',
      temperature: 0.8,
    });
  }

  async executeStreaming(
    question: string,
    onChunk: (text: string) => void
  ): Promise<AgentResponse<string>> {
    return this.callClaudeStreaming({
      userMessage: question,
      onChunk,
      onComplete: (fullText) => {
        console.log('\nComplete response received');
      },
    });
  }
}

// Usage in WebSocket or SSE endpoint
const chatAgent = new ChatAgent();

app.post('/api/chat/stream', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  await chatAgent.executeStreaming(
    req.body.message,
    (chunk) => {
      res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
    }
  );

  res.write('data: [DONE]\n\n');
  res.end();
});
```

---

## Testing Your Agents

```typescript
// tests/agents/resume-analyzer.test.ts
import { resumeAnalyzerAgent } from '@/ai/agents/resume-analyzer.agent';

describe('ResumeAnalyzerAgent', () => {
  it('should analyze resume successfully', async () => {
    const result = await resumeAnalyzerAgent.execute({
      resumeText: 'Software Engineer with 5 years of experience...',
      jobDescription: 'Looking for a Senior Software Engineer...',
    });

    expect(result.success).toBe(true);
    expect(result.data?.score).toBeGreaterThan(0);
    expect(result.data?.score).toBeLessThanOrEqual(100);
    expect(Array.isArray(result.data?.strengths)).toBe(true);
    expect(Array.isArray(result.data?.recommendations)).toBe(true);
  });

  it('should handle errors gracefully', async () => {
    const result = await resumeAnalyzerAgent.execute({
      resumeText: '',
      jobDescription: '',
    });

    // Should still return a response, even if unsuccessful
    expect(result).toBeDefined();
  });
});
```

---

## Environment Variables

```env
# Required
ANTHROPIC_API_KEY=sk-ant-xxxxx

# Optional (with defaults)
CLAUDE_MODEL=claude-sonnet-4-5-20250929
CLAUDE_MAX_TOKENS=4096
CLAUDE_TEMPERATURE=1.0
```

---

## Common Patterns

### Pattern 1: Extract Data from Text

```typescript
const result = await agent.execute(input);
const json = ResponseParser.parseJSON(result.data);
```

### Pattern 2: Handle Long Content

```typescript
import { truncateText } from '@/ai/utils/prompt-builder';

const shortText = truncateText(longText, 5000);
```

### Pattern 3: Retry on Failure

```typescript
return this.executeWithRetry(
  async () => await this.callClaude({ userMessage: prompt }),
  { maxRetries: 3 }
);
```

### Pattern 4: Track Costs

```typescript
const result = await agent.execute(input);
if (result.usage) {
  const cost = calculateTokenCost(
    result.model!,
    result.usage.inputTokens,
    result.usage.outputTokens
  );
  console.log(`Cost: $${cost.toFixed(4)}`);
}
```

---

## Next Steps

1. Read [AI_AGENTS_FOUNDATION.md](./AI_AGENTS_FOUNDATION.md) for complete documentation
2. Create your first specialized agent
3. Add API routes to expose agent functionality
4. Implement caching to reduce costs
5. Add user-facing features using agents

---

## Troubleshooting

**Problem:** `ANTHROPIC_API_KEY is not set`
- **Solution:** Add `ANTHROPIC_API_KEY=your-key` to `.env`

**Problem:** Rate limit errors
- **Solution:** Implement retry logic or reduce request frequency

**Problem:** JSON parsing fails
- **Solution:** Be explicit in prompts about JSON format. Use examples.

**Problem:** Responses are too long/short
- **Solution:** Adjust `maxTokens` in agent config or prompt

**Problem:** High costs
- **Solution:** Use Haiku for simple tasks, cache frequent requests, truncate long inputs

---

## Resources

- [Full Documentation](./AI_AGENTS_FOUNDATION.md)
- [Anthropic API Docs](https://docs.anthropic.com/)
- [Prompt Engineering Guide](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering)
