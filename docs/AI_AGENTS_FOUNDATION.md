## AI Agents Foundation Documentation

## Overview

Complete foundation for building AI agents using the Claude API (Anthropic). This system provides a robust, production-ready framework for creating specialized AI agents with comprehensive error handling, retry logic, and logging.

---

## Architecture

### Components

1. **Claude Client Configuration** (`src/config/claude.config.ts`)
   - Centralized API client management
   - Model configuration
   - Token tracking and cost calculation
   - Validation and safety checks

2. **Base Agent Class** (`src/ai/agents/base.agent.ts`)
   - Abstract base class for all agents
   - Standard and streaming API calls
   - Error handling and retry logic
   - Configuration management

3. **Prompt Builder** (`src/ai/utils/prompt-builder.ts`)
   - Template-based prompt generation
   - Resume and job description formatting
   - Conversation history management
   - Text truncation and sanitization

4. **Response Parser** (`src/ai/utils/response-parser.ts`)
   - JSON extraction
   - Code block extraction
   - Structured data parsing
   - Markdown cleaning

5. **Type Definitions** (`src/types/ai.types.ts`)
   - Comprehensive TypeScript interfaces
   - Agent responses and errors
   - Prompt templates
   - Structured outputs

---

## Getting Started

### Environment Setup

Add to your `.env` file:

```env
# Required
ANTHROPIC_API_KEY=your-api-key-here

# Optional (with defaults)
CLAUDE_MODEL=claude-sonnet-4-5-20250929
CLAUDE_MAX_TOKENS=4096
CLAUDE_TEMPERATURE=1.0
```

### Available Models

```typescript
import { CLAUDE_MODELS } from '@/config/claude.config';

// Available models:
CLAUDE_MODELS.SONNET_4_5  // claude-sonnet-4-5-20250929 (recommended)
CLAUDE_MODELS.OPUS_4      // claude-opus-4-20250514 (most capable)
CLAUDE_MODELS.HAIKU_3_5   // claude-3-5-haiku-20241022 (fastest, cheapest)
```

### Model Costs (per 1M tokens)

| Model | Input | Output |
|-------|-------|--------|
| Sonnet 4.5 | $3.00 | $15.00 |
| Opus 4 | $15.00 | $75.00 |
| Haiku 3.5 | $1.00 | $5.00 |

---

## Creating Your First Agent

### Step 1: Define Input/Output Types

```typescript
// src/types/my-agent.types.ts
export interface MyAgentInput {
  question: string;
  context?: string;
}

export interface MyAgentOutput {
  answer: string;
  confidence: number;
  sources?: string[];
}
```

### Step 2: Create Agent Class

```typescript
// src/ai/agents/my.agent.ts
import { BaseAgent } from '@/ai/agents/base.agent';
import { AgentResponse, AgentExecutionOptions } from '@/types/ai.types';
import { ResponseParser } from '@/ai/utils/response-parser';
import { PromptBuilder } from '@/ai/utils/prompt-builder';
import { logger } from '@/config/logger';

export class MyAgent extends BaseAgent<MyAgentInput, MyAgentOutput> {
  constructor() {
    super({
      systemPrompt: `You are a helpful AI assistant specialized in answering questions.
Always provide accurate, well-reasoned answers.
Format your response as JSON with: answer, confidence (0-1), and optional sources array.`,
      temperature: 0.7,
      maxTokens: 2048,
    });
  }

  async execute(
    input: MyAgentInput,
    options?: AgentExecutionOptions
  ): Promise<AgentResponse<MyAgentOutput>> {
    // Build user prompt
    const userPrompt = PromptBuilder.createStructuredPrompt({
      task: 'Answer the following question',
      context: input.context,
      instructions: input.question,
      outputFormat: 'JSON with keys: answer, confidence, sources',
    });

    // Call Claude API
    const response = await this.callClaude({
      userMessage: userPrompt,
      temperature: options?.temperature,
      maxTokens: options?.maxTokens,
    });

    if (!response.success) {
      return response;
    }

    // Parse JSON response
    const parsed = ResponseParser.parseJSON<MyAgentOutput>(response.data!);

    if (!parsed.success) {
      return parsed;
    }

    logger.info('MyAgent execution complete', {
      confidence: parsed.data?.confidence,
    });

    return {
      success: true,
      data: parsed.data,
      rawResponse: response.rawResponse,
      usage: response.usage,
    };
  }
}

// Export singleton
export const myAgent = new MyAgent();
```

### Step 3: Use Your Agent

```typescript
// In your service or controller
import { myAgent } from '@/ai/agents/my.agent';

const result = await myAgent.execute({
  question: 'What is the capital of France?',
  context: 'General geography question',
});

if (result.success) {
  console.log('Answer:', result.data.answer);
  console.log('Confidence:', result.data.confidence);
  console.log('Tokens used:', result.usage?.totalTokens);
} else {
  console.error('Error:', result.error?.message);
}
```

---

## Advanced Features

### Streaming Responses

```typescript
async executeStreaming(input: MyInput): Promise<AgentResponse<string>> {
  let fullResponse = '';

  const response = await this.callClaudeStreaming({
    userMessage: 'Your prompt here',
    onChunk: (chunk) => {
      // Handle each chunk as it arrives
      process.stdout.write(chunk);
      fullResponse += chunk;
    },
    onComplete: (text) => {
      console.log('\n\nComplete response received');
    },
  });

  return response;
}
```

### Retry Logic

```typescript
async execute(input: MyInput): Promise<AgentResponse<MyOutput>> {
  return this.executeWithRetry(
    async () => {
      const response = await this.callClaude({
        userMessage: 'Your prompt',
      });
      return response;
    },
    {
      maxRetries: 3,
      retryDelay: 1000, // 1 second
    }
  );
}
```

### Conversation History

```typescript
import { formatConversationHistory } from '@/ai/utils/prompt-builder';

const messages = [
  { role: 'user', content: 'Hello!' },
  { role: 'assistant', content: 'Hi! How can I help?' },
  { role: 'user', content: 'Tell me about AI' },
];

const response = await this.callClaude({
  messages: formatConversationHistory(messages, {
    maxMessages: 10,
    maxLength: 1000,
  }),
  userMessage: 'New user message',
});
```

### Custom Configuration

```typescript
// Override default config
const agent = new MyAgent();
agent.updateConfig({
  model: CLAUDE_MODELS.OPUS_4,
  temperature: 0.5,
  maxTokens: 8192,
});

// Or pass in constructor
const agent = new MyAgent({
  model: CLAUDE_MODELS.HAIKU_3_5,
  temperature: 0.3,
});
```

---

## Prompt Building

### Using Templates

```typescript
import { PromptBuilder } from '@/ai/utils/prompt-builder';

const template = `
You are helping a user with {{task}}.

Context: {{context}}

User Question: {{question}}

Provide a {{tone}} response.
`;

const prompt = PromptBuilder.buildPrompt(template, {
  task: 'career advice',
  context: 'Software engineering job search',
  question: 'How do I prepare for interviews?',
  tone: 'encouraging and practical',
});
```

### Formatting Resume Data

```typescript
import { formatResume } from '@/ai/utils/prompt-builder';

const resumeData = {
  personalInfo: {
    name: 'John Doe',
    email: 'john@example.com',
  },
  experiences: [
    {
      company: 'Tech Corp',
      position: 'Software Engineer',
      duration: '2020-2024',
      achievements: ['Built microservices', 'Led team of 5'],
      technologies: ['Node.js', 'React', 'AWS'],
    },
  ],
  skills: [
    { name: 'JavaScript', level: 'Expert' },
    { name: 'Python', level: 'Intermediate' },
  ],
};

const formatted = formatResume(resumeData, {
  maxLength: 5000, // Truncate if too long
});

// Use in prompt
const prompt = `Analyze this resume:\n\n${formatted}`;
```

### Formatting Job Descriptions

```typescript
import { formatJobDescription } from '@/ai/utils/prompt-builder';

const jobData = {
  title: 'Senior Software Engineer',
  company: 'Tech Corp',
  location: 'San Francisco, CA',
  salary: { min: 150000, max: 200000, currency: 'USD' },
  requirements: ['5+ years experience', 'Node.js expertise'],
  technologies: ['Node.js', 'React', 'AWS'],
};

const formatted = formatJobDescription(jobData);
```

### Structured Prompts

```typescript
import { PromptBuilder } from '@/ai/utils/prompt-builder';

const prompt = PromptBuilder.createStructuredPrompt({
  task: 'Analyze a resume for a job position',
  context: 'Job matching and career coaching',
  instructions: `Compare the resume against the job requirements.
Identify strengths and gaps.
Provide actionable recommendations.`,
  examples: [
    'Example 1: Strong match (8/10) - Has required skills...',
    'Example 2: Moderate match (5/10) - Missing key experience...',
  ],
  constraints: [
    'Be objective and honest',
    'Focus on skills and experience',
    'Provide specific examples',
  ],
  outputFormat: 'JSON with score, strengths, weaknesses, recommendations',
});
```

---

## Response Parsing

### Extracting JSON

```typescript
import { ResponseParser } from '@/ai/utils/response-parser';

const response = `
Here's the analysis:

\`\`\`json
{
  "score": 8,
  "strengths": ["Strong technical skills", "Leadership experience"],
  "recommendations": ["Add more metrics", "Highlight achievements"]
}
\`\`\`
`;

const parsed = ResponseParser.parseJSON(response);

if (parsed.success) {
  console.log('Score:', parsed.data.score);
  console.log('Strengths:', parsed.data.strengths);
}
```

### Extracting Code Blocks

```typescript
const response = `
Here's a sample function:

\`\`\`typescript
function greet(name: string): string {
  return \`Hello, \${name}!\`;
}
\`\`\`
`;

const code = ResponseParser.extractCodeBlock(response, 'typescript');
console.log(code?.code); // The actual code
console.log(code?.language); // 'typescript'
```

### Extracting Lists

```typescript
const response = `
Here are the key points:

1. First recommendation
2. Second recommendation
3. Third recommendation
`;

const items = ResponseParser.extractListItems(response);
// ['First recommendation', 'Second recommendation', 'Third recommendation']
```

### Parsing Ratings

```typescript
const response = 'I would rate this 8 out of 10';
const rating = ResponseParser.parseRating(response);
// { score: 8, max: 10 }

const response2 = 'Score: 85%';
const rating2 = ResponseParser.parseRating(response2);
// { score: 85, max: 100 }
```

### Cleaning Markdown

```typescript
const response = `
## Heading

This is **bold** and this is *italic*.

\`inline code\` and [link](url)
`;

const clean = ResponseParser.cleanMarkdown(response);
// 'Heading\n\nThis is bold and this is italic.\n\ninline code and link'
```

---

## Error Handling

### Error Types

All errors implement the `AgentError` interface:

```typescript
interface AgentError {
  code: string;
  message: string;
  type: 'api_error' | 'validation_error' | 'network_error' | 'rate_limit_error' | 'parsing_error';
  retryable: boolean;
  details?: any;
}
```

### Common Errors

| Error Code | Type | Retryable | Description |
|------------|------|-----------|-------------|
| `RATE_LIMIT_ERROR` | rate_limit_error | ✅ Yes | API rate limit exceeded |
| `AUTHENTICATION_ERROR` | api_error | ❌ No | Invalid API key |
| `VALIDATION_ERROR` | validation_error | ❌ No | Invalid request parameters |
| `SERVER_ERROR` | api_error | ✅ Yes | Claude API server error |
| `NETWORK_ERROR` | network_error | ✅ Yes | Network connectivity issue |
| `JSON_PARSE_ERROR` | parsing_error | ❌ No | Failed to parse JSON |

### Handling Errors

```typescript
const result = await myAgent.execute(input);

if (!result.success) {
  const error = result.error!;

  switch (error.type) {
    case 'rate_limit_error':
      console.log('Rate limited. Retry after:', error.details?.retryAfter);
      // Wait and retry
      break;

    case 'authentication_error':
      console.error('Invalid API key');
      // Check environment variables
      break;

    case 'parsing_error':
      console.error('Failed to parse response');
      console.log('Raw response:', result.rawResponse);
      break;

    default:
      console.error('Error:', error.message);
  }
}
```

---

## Token Management

### Estimating Tokens

```typescript
import { estimateTokens } from '@/config/claude.config';

const text = 'This is a sample prompt';
const estimated = estimateTokens(text);
console.log(`Estimated tokens: ${estimated}`);
```

### Validating Token Limits

```typescript
import { validateTokenCount } from '@/config/claude.config';

const longPrompt = '...very long text...';
const estimated = estimateTokens(longPrompt);

const validation = validateTokenCount('claude-sonnet-4-5-20250929', estimated);

if (!validation.valid) {
  console.error(`Token limit exceeded: ${validation.estimated}/${validation.limit}`);
  // Truncate or split the prompt
}
```

### Calculating Costs

```typescript
import { calculateTokenCost } from '@/config/claude.config';

const cost = calculateTokenCost(
  'claude-sonnet-4-5-20250929',
  1000, // input tokens
  500   // output tokens
);

console.log(`Cost: $${cost.toFixed(4)}`);
```

### Usage Tracking

```typescript
const result = await myAgent.execute(input);

if (result.success && result.usage) {
  console.log('Input tokens:', result.usage.inputTokens);
  console.log('Output tokens:', result.usage.outputTokens);
  console.log('Total tokens:', result.usage.totalTokens);

  const cost = calculateTokenCost(
    result.model!,
    result.usage.inputTokens,
    result.usage.outputTokens
  );
  console.log('Cost: $' + cost.toFixed(4));
}
```

---

## Logging

All AI interactions are automatically logged:

```typescript
// Logs include:
{
  agent: 'MyAgent',
  model: 'claude-sonnet-4-5-20250929',
  inputTokens: 150,
  outputTokens: 300,
  totalTokens: 450,
  cost: '$0.0068',
  duration: '1234ms',
  stopReason: 'end_turn'
}
```

---

## Best Practices

### 1. Use Specific System Prompts

```typescript
// ❌ Bad
systemPrompt: 'You are helpful'

// ✅ Good
systemPrompt: `You are a career coach AI specialized in resume optimization.
Your goal is to help job seekers improve their resumes by:
1. Identifying weak points
2. Suggesting specific improvements
3. Optimizing for ATS systems
Always be constructive and specific.`
```

### 2. Structure Your Outputs

```typescript
// Request structured output
const prompt = `
Analyze this resume and respond in JSON format:
{
  "score": number (0-100),
  "strengths": string[],
  "weaknesses": string[],
  "recommendations": string[]
}
`;
```

### 3. Handle Long Inputs

```typescript
import { truncateText } from '@/ai/utils/prompt-builder';

const longResume = '...very long text...';
const truncated = truncateText(longResume, 10000);
```

### 4. Use Appropriate Models

```typescript
// For simple tasks - use Haiku (fast, cheap)
const quickAgent = new MyAgent({ model: CLAUDE_MODELS.HAIKU_3_5 });

// For complex reasoning - use Opus (slower, expensive but best)
const complexAgent = new MyAgent({ model: CLAUDE_MODELS.OPUS_4 });

// For most tasks - use Sonnet (balanced)
const defaultAgent = new MyAgent({ model: CLAUDE_MODELS.SONNET_4_5 });
```

### 5. Implement Retry Logic

```typescript
return this.executeWithRetry(
  async () => await this.callClaude({ userMessage: prompt }),
  { maxRetries: 3, retryDelay: 1000 }
);
```

---

## Testing

### Unit Testing Agents

```typescript
import { myAgent } from '@/ai/agents/my.agent';

describe('MyAgent', () => {
  it('should answer questions correctly', async () => {
    const result = await myAgent.execute({
      question: 'What is 2+2?',
    });

    expect(result.success).toBe(true);
    expect(result.data?.answer).toContain('4');
  });

  it('should handle errors gracefully', async () => {
    // Mock API error
    const result = await myAgent.execute({
      question: '',
    });

    if (!result.success) {
      expect(result.error).toBeDefined();
      expect(result.error?.type).toBe('validation_error');
    }
  });
});
```

---

## Next Steps

1. **Create Specialized Agents:**
   - Resume analyzer
   - Cover letter generator
   - Interview prep coach
   - Career advisor

2. **Add Prompt Templates:**
   - Store in database
   - Version control
   - A/B testing

3. **Implement Caching:**
   - Cache frequent requests
   - Reduce API calls
   - Lower costs

4. **Add Rate Limiting:**
   - Per-user limits
   - Cost tracking
   - Usage analytics

5. **Build Agent Workflows:**
   - Chain multiple agents
   - Sequential processing
   - Parallel execution

---

## Support

For issues or questions:
- Check logs for API errors
- Verify ANTHROPIC_API_KEY is set
- Monitor token usage
- Review error types and retry logic
- Check model availability

---

## References

- [Anthropic API Documentation](https://docs.anthropic.com/)
- [Claude Model Comparison](https://docs.anthropic.com/en/docs/about-claude/models)
- [Best Practices](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering)
