# AI Career Coach - Testing & QA Guide

## Quick Start

### Running All AI Agent Tests

```bash
cd backend
npm run test:ai
```

This will:
1. Run all AI agent tests
2. Generate coverage reports
3. Create detailed test reports
4. Display summary with metrics

### Running Individual Test Suites

```bash
# Resume Parser tests only
npm test -- tests/ai/agents/resume-parser.test.ts

# Resume Tailor tests only
npm test -- tests/ai/agents/resume-tailor.test.ts

# Job Parser tests only
npm test -- tests/ai/agents/job-parser.test.ts

# Mock Interview tests only
npm test -- tests/ai/agents/mock-interview.test.ts
```

### Analyzing Results

```bash
npm run test:ai:analyze
```

## Test Infrastructure

### Overview

We've implemented a **custom LLM evaluation framework** built on Jest that provides:

- **Structure Validation**: Ensures AI outputs match expected schemas
- **Quality Metrics**: Measures completeness, relevance, and accuracy
- **Performance Monitoring**: Tracks response times and costs
- **Regression Testing**: Uses golden datasets to catch quality degradation
- **Comprehensive Reporting**: Detailed metrics and analysis

### Components

#### 1. LLM Test Helpers (`tests/utils/llm-test-helpers.ts`)

Core utilities for testing AI outputs:

- `validateStructure()` - Check output structure
- `calculateCompletenessScore()` - Measure field population
- `calculateTokenCost()` - Track API costs
- `measureResponseTime()` - Performance measurement
- `expectLLM()` - Fluent assertion API
- `fuzzyMatch()` - Tolerance for AI variation

#### 2. Test Fixtures (`tests/fixtures/`)

Golden datasets for regression testing:

- **Resumes** (`resumes/`):
  - `sample-resume.txt` - Comprehensive resume
  - `sample-resume-minimal.txt` - Minimal resume

- **Jobs** (`jobs/`):
  - `sample-job.json` - Structured job posting
  - `sample-job-url.html` - HTML job posting

- **Expected Outputs** (`expected/`):
  - `resume-parsed-expected.json` - Expected parsing output

#### 3. Test Suites

| Agent | Test File | Focus Areas |
|-------|-----------|-------------|
| Resume Parser | `resume-parser.test.ts` | Extraction accuracy, date normalization, structure |
| Resume Tailor | `resume-tailor.test.ts` | Match scoring, keyword alignment, data integrity |
| Job Parser | `job-parser.test.ts` | HTML parsing, data extraction, error handling |
| Mock Interview | `mock-interview.test.ts` | Question quality, answer evaluation, session analysis |

## Test Execution Flow

```
1. npm run test:ai
   ├─→ Load .env.test configuration
   ├─→ Run Jest with AI test pattern
   ├─→ Execute tests with 2-minute timeout
   ├─→ Generate coverage report
   ├─→ Create JSON test report
   └─→ Display summary

2. npm run test:ai:analyze (optional)
   ├─→ Parse test results JSON
   ├─→ Calculate metrics
   ├─→ Generate markdown report
   └─→ Display analysis
```

## Test Categories

### 1. Structure Tests

Verify AI outputs match expected schemas:

```typescript
test('should return valid structure', async () => {
  const result = await agent.execute(input);

  expectLLM(result.data)
    .hasRequiredFields(['personalInfo', 'experiences', 'skills'])
    .assert();
});
```

### 2. Quality Tests

Measure output quality and completeness:

```typescript
test('should extract comprehensive data', async () => {
  const score = calculateCompletenessScore(
    result.data,
    ['summary', 'certifications', 'projects']
  );

  expect(score).toBeGreaterThan(70); // 70%+ complete
});
```

### 3. Performance Tests

Track response times and costs:

```typescript
test('should respond within budget', async () => {
  const { result, timeMs } = await measureResponseTime(() =>
    agent.execute(input)
  );

  const cost = calculateTokenCost(
    result.usage.input_tokens,
    result.usage.output_tokens
  );

  expect(timeMs).toBeLessThan(30000); // 30s max
  expect(cost).toBeLessThan(0.05); // $0.05 max
});
```

### 4. Edge Case Tests

Cover boundary conditions and error scenarios:

```typescript
test('should handle empty input', async () => {
  const result = await agent.execute({ resumeText: '' });

  expect(result.success).toBe(false);
  expect(result.error?.code).toBe('INVALID_INPUT');
});
```

### 5. Consistency Tests

Verify reproducibility with temperature=0:

```typescript
test('should be deterministic', async () => {
  const result1 = await agent.execute(input, { temperature: 0 });
  const result2 = await agent.execute(input, { temperature: 0 });

  expect(result1.data).toEqual(result2.data);
});
```

## Quality Criteria

### Resume Parser Agent

✅ **Must Pass:**
- Extract name, email, phone
- Parse work experiences (company, title, dates)
- Parse education (institution, degree, field)
- Extract skills with categories
- Normalize dates to YYYY-MM format
- Complete in < 30 seconds
- Cost < $0.05 per test

⚠️ **Nice to Have:**
- Extract certifications
- Parse achievements with metrics
- Identify technologies used
- Assign skill proficiency levels

### Resume Tailor Agent

✅ **Must Pass:**
- Generate match score (0-100)
- Identify matched keywords
- Provide actionable recommendations
- Preserve personal information
- Not fabricate experience or education
- Track all modifications
- Complete in < 2 minutes
- Cost < $0.15 per test

⚠️ **Nice to Have:**
- Estimate ATS score
- Suggest specific improvements
- Provide before/after comparison

### Job Parser Agent

✅ **Must Pass:**
- Extract company name
- Extract job title
- Extract comprehensive job description
- Identify job type (FULL_TIME, etc.)
- Identify work mode (REMOTE, etc.)
- Handle network errors gracefully
- Complete in < 60 seconds
- Cost < $0.05 per test

⚠️ **Nice to Have:**
- Extract salary range
- Parse benefits list
- Identify application deadline

### Mock Interview Agent

✅ **Must Pass:**
- Generate requested number of questions
- Include key points for each question
- Include evaluation criteria
- Evaluate answers with scores (0-100)
- Provide constructive feedback
- Generate session analysis
- Complete in < 2 minutes
- Cost < $0.10 per test

⚠️ **Nice to Have:**
- Adjust difficulty appropriately
- Personalize to interviewer context
- Track improvement over time

## Performance Benchmarks

### Target Metrics

| Agent | Avg Response Time | Max Response Time | Avg Cost | Max Cost |
|-------|-------------------|-------------------|----------|----------|
| Resume Parser | 10-15s | 30s | $0.02 | $0.05 |
| Resume Tailor | 30-45s | 120s | $0.08 | $0.15 |
| Job Parser | 15-20s | 60s | $0.02 | $0.05 |
| Mock Interview | 20-30s | 120s | $0.05 | $0.10 |

### Cost Budget

- **Per Test**: < $0.05 average
- **Per Agent Suite**: < $0.50
- **Full AI Test Suite**: < $2.00
- **Daily CI Runs**: < $10.00

## Pre-Deployment Checklist

Before deploying to production, ensure:

### ✅ Test Coverage

- [ ] All AI agents have comprehensive tests
- [ ] Edge cases are covered
- [ ] Error scenarios are tested
- [ ] Performance benchmarks are met

### ✅ Quality Gates

- [ ] 100% test pass rate
- [ ] All tests complete within timeout
- [ ] Total cost under budget ($2.00)
- [ ] No degradation vs. baseline

### ✅ Documentation

- [ ] Test README is up to date
- [ ] New fixtures are documented
- [ ] Known issues are documented
- [ ] Performance benchmarks recorded

### ✅ Environment

- [ ] `.env.test` configured correctly
- [ ] Test database is isolated
- [ ] API keys are valid
- [ ] Redis is available

## Running Tests in CI/CD

### GitHub Actions Example

```yaml
name: AI Agent Tests

on: [pull_request]

jobs:
  test-ai-agents:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v2

      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'

      - name: Install dependencies
        run: |
          cd backend
          npm ci

      - name: Setup test environment
        run: |
          cd backend
          cp .env.test.example .env.test
          echo "ANTHROPIC_API_KEY=${{ secrets.ANTHROPIC_API_KEY }}" >> .env.test

      - name: Run AI tests
        run: |
          cd backend
          npm run test:ai

      - name: Analyze results
        run: |
          cd backend
          npm run test:ai:analyze

      - name: Upload reports
        uses: actions/upload-artifact@v2
        with:
          name: test-reports
          path: backend/test-reports/
```

## Troubleshooting

### Common Issues

#### 1. Tests Timeout

**Symptoms**: Tests fail with timeout errors

**Solutions**:
- Check ANTHROPIC_API_KEY is valid
- Increase timeout in jest.config.js
- Check for API rate limiting
- Verify network connectivity

#### 2. High Costs

**Symptoms**: Tests exceed budget

**Solutions**:
- Use temperature=0 for faster convergence
- Reduce fixture sizes
- Lower max_tokens where possible
- Mock expensive API calls

#### 3. Flaky Tests

**Symptoms**: Tests pass/fail inconsistently

**Solutions**:
- Use temperature=0 for determinism
- Use fuzzy matching for string comparisons
- Focus on structure, not exact content
- Add retry logic for network calls

#### 4. API Errors

**Symptoms**: 401, 429, or 500 errors

**Solutions**:
- Verify API key in .env.test
- Check rate limits (429)
- Wait and retry on 500s
- Contact Anthropic support if persistent

### Debug Mode

Run tests with verbose logging:

```bash
DEBUG=* npm run test:ai
```

## Best Practices

### DO ✅

- ✅ Set appropriate timeouts (60-120s for AI tests)
- ✅ Measure and log performance metrics
- ✅ Track costs per test
- ✅ Use deterministic mode (temp=0) for consistency
- ✅ Test edge cases and error scenarios
- ✅ Use fixtures for regression testing
- ✅ Document expected behaviors
- ✅ Keep tests focused and independent

### DON'T ❌

- ❌ Use real user data in tests
- ❌ Skip error handling tests
- ❌ Ignore performance degradation
- ❌ Let costs spiral out of control
- ❌ Test implementation details
- ❌ Make tests interdependent
- ❌ Hardcode exact AI responses
- ❌ Skip cleanup in afterEach/afterAll

## Reporting Issues

When tests fail:

1. **Check test reports**: `test-reports/ai-test-report-*.md`
2. **Run analysis**: `npm run test:ai:analyze`
3. **Review logs**: Check console output for errors
4. **Isolate issue**: Run individual test file
5. **Document**: Include test name, error, and logs
6. **Create issue**: Use GitHub issue template

## Next Steps

After tests are passing:

1. **Baseline Metrics**: Record current performance benchmarks
2. **Monitoring**: Set up alerts for degradation
3. **Optimization**: Improve slow/expensive tests
4. **Expansion**: Add more edge cases
5. **Production**: Deploy with confidence!

## Resources

- [Jest Documentation](https://jestjs.io/)
- [Anthropic API Docs](https://docs.anthropic.com/)
- [Test README](./tests/README.md)
- [CURRENT_STATUS.md](./CURRENT_STATUS.md)

---

**Ready to test?** Run `npm run test:ai` and let's ensure 100% quality! 🚀
