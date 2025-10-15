# Comprehensive Testing Guide

## Prerequisites

### 1. Start Redis
Redis is required for background job processing (resume parsing).

```bash
# On macOS (if not installed, install with: brew install redis)
redis-server

# Or run in background
brew services start redis

# Verify Redis is running
redis-cli ping
# Should return: PONG
```

### 2. Database Setup
```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
```

### 3. Environment Variables
Ensure `.env` file in backend has:
```
DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/ai_career_coach?schema=public"
REDIS_HOST=localhost
REDIS_PORT=6379
ANTHROPIC_API_KEY=your-key-here
```

## Running Tests

### Run All Tests
```bash
cd backend
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

### Run Specific Test File
```bash
npm test -- tests/integration/resume.test.ts
```

## Test Structure

```
backend/tests/
├── setup.ts                          # Global test setup
├── fixtures/                         # Test files (resumes, etc.)
└── integration/
    ├── resume.test.ts               # Resume API tests
    ├── auth.test.ts                 # Auth API tests (to be created)
    └── ai.test.ts                   # AI features tests (to be created)
```

## Key Test Scenarios

### Resume Tests (`resume.test.ts`)

1. **Upload Resume**
   - ✅ Upload with valid file
   - ✅ Fail without authentication
   - ✅ Fail without file

2. **List Resumes**
   - ✅ Get all resumes for user
   - ✅ Handle pagination
   - ✅ Fail without authentication

3. **Get Resume by ID**
   - ✅ Get own resume
   - ✅ Fail with invalid ID
   - ✅ Fail accessing another user's resume

4. **Set Master Resume**
   - ✅ Set resume as master
   - ✅ Fail with invalid ID
   - ✅ Unset previous master when setting new

5. **Parse Resume**
   - ✅ Initiate parsing
   - ✅ Fail with invalid ID
   - ⚠️ Requires Redis running

6. **Update Resume**
   - ✅ Update resume title
   - ✅ Fail with invalid data

7. **Delete Resume**
   - ✅ Delete own resume
   - ✅ Verify deletion

8. **Resume Statistics**
   - ✅ Get resume stats

## Expected Test Results

All tests should pass before manual testing:

```
 PASS  tests/integration/resume.test.ts
  Resume API Integration Tests
    POST /api/resumes/upload
      ✓ should upload a resume successfully
      ✓ should fail without authentication
      ✓ should fail without file
    GET /api/resumes
      ✓ should get all resumes for user
      ✓ should handle pagination
      ✓ should fail without authentication
    GET /api/resumes/:id
      ✓ should get resume by id
      ✓ should fail with invalid id format
      ✓ should fail when accessing another user's resume
    PATCH /api/resumes/:id/set-master
      ✓ should set resume as master
      ✓ should fail with invalid resume id format
      ✓ should unset other master resumes when setting new master
    POST /api/resumes/:id/parse
      ✓ should initiate resume parsing
      ✓ should fail with invalid resume id
    PUT /api/resumes/:id
      ✓ should update resume title
    DELETE /api/resumes/:id
      ✓ should delete a resume
    GET /api/resumes/stats
      ✓ should get resume statistics

Test Suites: 1 passed, 1 total
Tests:       17 passed, 17 total
```

## Troubleshooting

### Tests Timing Out
- Check Redis is running
- Increase `testTimeout` in jest.config.js
- Check database connection

### Database Errors
```bash
# Reset database
npm run prisma:reset

# Regenerate Prisma client
npm run prisma:generate
```

### Redis Connection Errors
```bash
# Check Redis status
brew services list

# Restart Redis
brew services restart redis
```

### Port Conflicts
If port 3000 is in use:
```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>
```

## Manual Testing After Tests Pass

Only proceed to manual testing after all automated tests pass.

### 1. Start Services
```bash
# Terminal 1: Redis
redis-server

# Terminal 2: Backend
cd backend
npm run dev

# Terminal 3: Frontend
cd frontend
npm run dev
```

### 2. Test Flow
1. Login with: `test@example.com` / `Password123!`
2. Upload a resume
3. Verify it appears in the list
4. Click "Set as Master" - should succeed
5. Click "Parse Resume" - should queue job
6. Wait 10-30 seconds, refresh - should show parsed data
7. Create a job with description
8. Tailor resume for job

## Adding New Tests

When adding new features, create tests FIRST:

```typescript
describe('New Feature', () => {
  it('should do something', async () => {
    const response = await request(app)
      .post('/api/new-endpoint')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ data: 'test' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
```

Then implement the feature until tests pass.

## Continuous Integration

Tests should be run in CI/CD:

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
      redis:
        image: redis:7
    steps:
      - uses: actions/checkout@v2
      - run: npm install
      - run: npm test
```

## Coverage Requirements

Aim for:
- **80%+ line coverage**
- **70%+ branch coverage**
- **100% coverage for critical paths** (auth, payments, etc.)

Check coverage:
```bash
npm run test:coverage
open coverage/lcov-report/index.html
```
