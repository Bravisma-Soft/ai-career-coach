# AI Career Coach - Testing Documentation

## Overview

This directory contains comprehensive tests for the AI Career Coach backend, with a special focus on evaluating AI agent performance and quality.

## Test Structure

```
tests/
├── ai/
│   └── agents/              # AI agent tests
│       ├── resume-parser.test.ts
│       ├── resume-tailor.test.ts
│       ├── job-parser.test.ts
│       └── mock-interview.test.ts
├── integration/             # API integration tests
│   └── resume.test.ts
├── fixtures/               # Test data
│   ├── resumes/           # Sample resume files
│   ├── jobs/              # Sample job postings
│   └── expected/          # Expected outputs
├── utils/                 # Test utilities
│   └── llm-test-helpers.ts
├── setup.ts               # Global test setup
└── README.md             # This file
```

## Testing Philosophy

### For AI Agents

We use a **hybrid testing approach** that combines:

1. **Structure Validation**: Verify outputs match expected schemas
2. **Quality Metrics**: Evaluate completeness, relevance, and accuracy
3. **Performance Monitoring**: Track response times and token costs
4. **Regression Testing**: Use golden datasets to catch quality degradation
5. **Edge Case Coverage**: Test boundary conditions and error scenarios

### Why Not a Full LLM Eval Framework?

For this MVP, we chose a **custom test harness** over frameworks like promptfoo or LangSmith because:

- **Simplicity**: Direct control over test logic and assertions
- **Speed**: Faster iteration during development
- **Cost**: No additional dependencies or services
- **Flexibility**: Easy to customize for our specific use cases

We can always migrate to a specialized framework later if needed.

## Running Tests

### All Tests

```bash
npm test
```

### AI Agent Tests Only

```bash
npm run test:ai
```

This runs all AI agent tests with comprehensive reporting including:
- Test results summary
- Performance metrics
- Cost analysis
- Coverage report

### Integration Tests

```bash
npm run test:integration
```

### Watch Mode (Development)

```bash
npm run test:watch
```

### With Coverage

```bash
npm run test:coverage
```

## Test Reports

After running AI tests, reports are generated in `test-reports/`:

- `ai-test-report-{timestamp}.json` - Full test results
- `ai-test-report-{timestamp}.md` - Human-readable summary
- `summary-{timestamp}.txt` - Quick summary

### Analyzing Results

```bash
npm run test:ai:analyze
```

This generates a detailed analysis including:
- Success rates by agent
- Performance metrics (response times)
- Cost breakdown
- Slowest tests
- Warnings and recommendations

## LLM Test Helpers

The `llm-test-helpers.ts` module provides utilities for testing AI outputs:

### Structure Validation

```typescript
import { validateStructure } from '../utils/llm-test-helpers';

const validation = validateStructure(output, [
  'personalInfo',
  'personalInfo.name',
  'experiences',
]);

expect(validation.valid).toBe(true);
expect(validation.missing).toEqual([]);
```

### Quality Metrics

```typescript
import { calculateCompletenessScore } from '../utils/llm-test-helpers';

const score = calculateCompletenessScore(output, [
  'summary',
  'certifications',
  'projects',
]);

expect(score).toBeGreaterThan(70); // At least 70% complete
```

### Performance Measurement

```typescript
import { measureResponseTime } from '../utils/llm-test-helpers';

const { result, timeMs } = await measureResponseTime(() =>
  agent.execute(input)
);

expect(timeMs).toBeLessThan(30000); // 30 seconds max
```

### Fluent Assertions

```typescript
import { expectLLM } from '../utils/llm-test-helpers';

expectLLM(parsed, { responseTimeMs, cost, tokenUsage })
  .hasRequiredFields(['personalInfo', 'experiences'])
  .respondedWithin(30000)
  .costLessThan(0.05)
  .assert();
```

### Cost Calculation

```typescript
import { calculateTokenCost } from '../utils/llm-test-helpers';

const cost = calculateTokenCost(inputTokens, outputTokens);
expect(cost).toBeLessThan(0.05); // $0.05 max
```

## Test Fixtures

### Adding New Fixtures

1. **Resumes**: Add to `fixtures/resumes/`
   - Use `.txt` format for plain text
   - Include variety: comprehensive, minimal, edge cases

2. **Job Postings**: Add to `fixtures/jobs/`
   - JSON format: `sample-job.json`
   - HTML format: `sample-job-url.html`

3. **Expected Outputs**: Add to `fixtures/expected/`
   - JSON format with complete expected structure
   - Used for regression testing

### Fixture Guidelines

- **Realistic Data**: Use realistic but anonymized data
- **Variety**: Cover different industries, experience levels, formats
- **Edge Cases**: Include unusual but valid cases
- **Privacy**: Never use real personal information

## Writing New Tests

### Basic Test Structure

```typescript
describe('Agent Name', () => {
  let agent: AgentClass;
  const TIMEOUT = 60000; // AI calls can take time
  const MAX_COST = 0.05; // Budget per test

  beforeAll(() => {
    agent = new AgentClass();
  });

  test('should do something', async () => {
    const { result, timeMs } = await measureResponseTime(() =>
      agent.execute(input)
    );

    // Assertions
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();

    // Performance
    expect(timeMs).toBeLessThan(TIMEOUT);

    // Cost
    const cost = calculateTokenCost(
      result.usage.input_tokens,
      result.usage.output_tokens
    );
    expect(cost).toBeLessThan(MAX_COST);
  }, TIMEOUT);
});
```

### Best Practices

1. **Set Timeouts**: AI calls can be slow
   ```typescript
   test('name', async () => { ... }, 60000);
   ```

2. **Measure Performance**: Always track response times
   ```typescript
   const { result, timeMs } = await measureResponseTime(...);
   ```

3. **Monitor Costs**: Track token usage and costs
   ```typescript
   const cost = calculateTokenCost(input, output);
   console.log('Test cost: $' + cost.toFixed(4));
   ```

4. **Use Deterministic Mode**: For reproducible tests
   ```typescript
   agent.execute(input, { temperature: 0 });
   ```

5. **Log Metrics**: Help track performance over time
   ```typescript
   console.log('Metrics:', { timeMs, tokenUsage, cost });
   ```

## Test Coverage Goals

- **Unit Tests**: 80%+ coverage for business logic
- **Integration Tests**: All API endpoints
- **AI Agent Tests**: All major functionality paths
- **Edge Cases**: Known failure modes and boundaries

## Continuous Integration

Tests are designed to run in CI/CD pipelines:

1. **Fast Feedback**: Integration tests run first (< 2 min)
2. **AI Tests**: Run on PRs to main (< 10 min budget)
3. **Full Suite**: Run nightly with detailed reporting

## Environment Variables

Required for AI tests (`.env.test`):

```bash
# Anthropic API
ANTHROPIC_API_KEY=sk-ant-api03-...
CLAUDE_MODEL=claude-sonnet-4-5-20250929

# Database (test DB)
DATABASE_URL=postgresql://...

# Redis
REDIS_URL=redis://localhost:6379
REDIS_DB=1
```

## Troubleshooting

### Tests Timeout

- Check `ANTHROPIC_API_KEY` is valid
- Increase timeout in `jest.config.js`
- Check API rate limits

### High Costs

- Use `temperature: 0` for faster, cheaper tests
- Reduce `numberOfQuestions` in test inputs
- Monitor usage with `npm run test:ai:analyze`

### Flaky Tests

- AI outputs can vary - use fuzzy matching
- Set `temperature: 0` for consistency
- Focus on structure, not exact content

### Network Errors

- Check internet connection
- Verify API key permissions
- Look for rate limiting (429 errors)

## Contributing

When adding new tests:

1. Follow existing patterns
2. Add fixtures if needed
3. Document complex test logic
4. Keep tests focused and fast
5. Monitor costs (stay under budget)
6. Update this README if adding new patterns

## Cost Management

### Budget Guidelines

- **Per Test**: < $0.05
- **Per Agent Suite**: < $0.50
- **Full AI Test Suite**: < $2.00

### Tips to Reduce Costs

1. Use smaller fixtures
2. Set `temperature: 0` (faster convergence)
3. Reduce `max_tokens` where possible
4. Mock API calls for non-critical tests
5. Use cached responses for repeated tests

## Future Improvements

- [ ] Add snapshot testing for AI outputs
- [ ] Implement prompt regression tracking
- [ ] Add A/B testing for prompt variations
- [ ] Create performance benchmarks dashboard
- [ ] Add automatic cost alerting
- [ ] Integrate with LangSmith or similar for production

## Resources

- [Jest Documentation](https://jestjs.io/)
- [Anthropic API Docs](https://docs.anthropic.com/)
- [Testing Best Practices](https://testingjavascript.com/)
