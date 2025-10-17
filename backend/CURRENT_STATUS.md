# AI Career Coach Backend - Current Status

## Latest Update (Oct 16, 2025)
✅ **AI-Powered Interview Preparation System** - Complete implementation with mock interviews, real-time feedback, and comprehensive results

## Completed Features (As of Oct 16, 2025)

✅ **Prompt 1-7**: Core Backend Infrastructure
- Project structure, database schema, authentication
- User profile & resume services
- Job tracking system
- AI agent foundation
- Resume parser agent

✅ **Resume Tailoring Feature** (Working End-to-End)
- AI-powered resume tailoring using Claude Sonnet 4.5
- Document storage for tailored resumes
- Match score calculation and keyword alignment
- Side-by-side comparison view
- Reopening saved tailored resumes

✅ **Interview Preparation System** (NEW - Oct 16)
- AI-generated interview questions based on job + interviewer context
- Mock interview with real-time AI feedback after each answer
- Comprehensive results analysis with scores and improvements
- Past session management with cached results
- Job-interview linking in job detail drawer

## Current Architecture

### Tech Stack
- **Framework**: Express.js + TypeScript (port 3000)
- **Database**: PostgreSQL with Prisma ORM
- **AI**: Claude API (Sonnet 4.5) via Anthropic SDK
- **Storage**: Local filesystem (`/uploads`)
- **Cache**: Redis for session management
- **Queue**: BullMQ for async resume parsing

### Key Services
- `AuthService` - JWT authentication, user registration/login
- `UserService` - User profile management
- `ResumeService` - Resume CRUD, parsing, tailoring
- `JobService` - Job tracking and status management
- `DocumentService` - Document storage for tailored resumes

### AI Agents
- `BaseAgent` - Abstract base class for all AI agents
- `ResumeParserAgent` - Extracts structured data from resumes
- `ResumeTailorAgent` - Tailors resumes for specific jobs ✅ WORKING
- `MockInterviewAgent` - Generates questions, evaluates answers, analyzes sessions ✅ NEW

### API Routes
```
/api/auth/* - Authentication endpoints
/api/users/* - User management
/api/resumes/* - Resume CRUD operations
/api/jobs/* - Job tracking
/api/interviews/* - Interview scheduling and preparation ✅ UPDATED
/api/interviews/:id/prepare - Generate questions & research ✅ NEW
/api/interviews/job/:jobId - Get interviews by job ✅ NEW
/api/mock-interviews/* - Mock interview sessions ✅ NEW
/api/ai/resumes/tailor - Resume tailoring
/api/documents/* - Document management
```

## Recent Fixes & Updates

### 1. Resume Tailoring Timeout (FIXED)
- **Issue**: AI operations timed out after 60 seconds
- **Fix**: Increased timeout to 300 seconds (5 minutes) in `src/config/claude.config.ts:31`
- **Result**: Complex resume tailoring now completes successfully

### 2. Resume File Name Serialization (FIXED)
- **Issue**: Resume cards showed "Version 1" instead of actual file names
- **Fix**: Added `fileName` field to `SerializedResume` in `src/utils/resume-serializer.ts`
- **Result**: Resume cards now display correct file names and types

### 3. Document Storage for Tailored Resumes (IMPLEMENTED)
- Created `DocumentService` for storing tailored resumes
- Added `/api/documents` routes
- Stores full JSON resume data + metadata (match score, changes, recommendations)

## Current File Structure
```
/backend
├── /src
│   ├── /api
│   │   ├── /routes
│   │   │   ├── auth.routes.ts
│   │   │   ├── user.routes.ts
│   │   │   ├── job.routes.ts
│   │   │   ├── resume.routes.ts
│   │   │   ├── ai.routes.ts ✅ NEW
│   │   │   └── document.routes.ts ✅ NEW
│   │   ├── /middleware (auth, validation, error)
│   │   └── /validators
│   ├── /services
│   │   ├── auth.service.ts
│   │   ├── user.service.ts
│   │   ├── job.service.ts
│   │   ├── resume.service.ts (includes tailorResumeForJob)
│   │   ├── document.service.ts ✅ NEW
│   │   └── storage.service.ts
│   ├── /ai
│   │   ├── /agents
│   │   │   ├── base.agent.ts
│   │   │   ├── resume-parser.agent.ts
│   │   │   └── resume-tailor.agent.ts ✅ NEW
│   │   ├── /prompts
│   │   │   ├── resume-parser.prompt.ts
│   │   │   └── resume-tailor.prompt.ts ✅ NEW
│   │   └── /utils
│   ├── /config
│   │   ├── claude.config.ts (timeout: 300s)
│   │   ├── env.ts
│   │   ├── logger.ts
│   │   ├── queue.ts
│   │   └── redis.ts
│   ├── /utils
│   │   ├── resume-serializer.ts (added fileName)
│   │   └── response.ts
│   ├── /jobs
│   │   ├── /workers
│   │   │   └── resume-parse.worker.ts
│   │   └── /processors
│   │       └── resume-parse.processor.ts
│   ├── app.ts
│   └── server.ts
└── /prisma
    └── schema.prisma
```

## Database Schema Highlights

### Resume Model
```prisma
model Resume {
  id            String    @id @default(cuid())
  userId        String
  title         String
  fileName      String    // Original file name
  fileUrl       String
  fileSize      Int
  mimeType      String
  isPrimary     Boolean   @default(false)
  rawText       String?   @db.Text
  parsedData    Json?     // Structured resume data
  version       Int       @default(1)
  isActive      Boolean   @default(true)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}
```

### Document Model (for Tailored Resumes)
```prisma
model Document {
  id            String       @id @default(cuid())
  jobId         String?
  documentType  DocumentType // RESUME, COVER_LETTER, etc.
  title         String
  fileName      String
  fileUrl       String
  fileSize      Int
  mimeType      String
  description   String?      @db.Text
  content       String?      @db.Text  // JSON resume data
  metadata      Json?        // Match score, changes, recommendations
  version       Int          @default(1)
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt
}
```

## Environment Variables Required

```bash
# Database
DATABASE_URL=postgresql://postgres:postgres123@localhost:5432/ai_career_coach

# Redis
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# Claude AI
ANTHROPIC_API_KEY=sk-ant-api03-xxx
CLAUDE_MODEL=claude-sonnet-4-5-20250929

# Server
PORT=3000
NODE_ENV=development

# Queue
QUEUE_MAX_RETRIES=3
```

## How to Run

### Development
```bash
# Start dependencies
docker-compose up -d postgres redis

# Install dependencies
npm install

# Run migrations
npx prisma migrate dev

# Start server
npm run dev  # Runs on port 3000
```

### Optional: Resume Parser Worker
```bash
# In separate terminal (only needed for resume parsing, not tailoring)
npx ts-node-dev src/jobs/workers/resume-parse.worker.ts
```

## Testing Status

### Working Features ✅
- User authentication (register, login, JWT)
- Resume upload and storage
- Resume parsing (background job)
- Job tracking and status management
- **Resume tailoring with AI** (synchronous, 2-5 min processing)
- Document storage for tailored resumes
- Retrieving saved tailored resumes

### Known Limitations
1. Resume parsing worker not auto-started (must run separately)
2. Old resumes missing `fileName` field (need data migration)
3. No streaming responses for AI operations (long wait times)

## Next Development Steps

1. **Cover Letter Generator** ✅ ALREADY EXISTS
   - Implemented in `CoverLetterAgent`
   - Available via `/api/ai/cover-letters/generate`

2. **Interview Features** ✅ COMPLETED (Oct 16)
   - Mock interview questions ✅
   - Answer evaluation and feedback ✅
   - Session analysis ✅

3. **Advanced Interview Features** (Future)
   - Export results as PDF
   - Email results functionality
   - Progress tracking across multiple practice sessions
   - Difficulty progression based on scores
   - Video practice with recording

4. **Background Jobs System**
   - Auto-start workers on server start
   - Job monitoring dashboard

5. **Performance Optimizations**
   - Streaming AI responses
   - Caching frequently accessed data
   - Optimize prompt lengths

6. **Production Readiness**
   - Error monitoring (Sentry)
   - Rate limiting refinement
   - Database connection pooling
   - Comprehensive logging

## Key Technical Decisions

- **AI Model**: Claude Sonnet 4.5 (good balance of speed and quality)
- **Timeout**: 5 minutes for AI operations (handles complex processing)
- **Storage**: Local filesystem (simple, works for MVP; consider S3 for production)
- **Queue**: BullMQ with Redis (reliable job processing)
- **Auth**: JWT with 7-day expiration (balance security and UX)
- **Resume Tailoring**: Synchronous (no queue) for immediate results

## Debug & Monitoring

### Logs to Watch
```bash
# Backend server logs show:
info: AI: Tailoring resume {resumeId} for job {jobId}
info: Claude API request
info: Claude API response (includes token usage, cost)
info: AI agent completed successfully - Score: 85
```

### Common Issues
- "Resume must be parsed before tailoring" → Resume needs to be parsed first
- "Job description is too short" → Add detailed job description (50+ chars minimum)
- API timeout → Should be fixed now (5 min limit)
- Redis connection error → Ensure `docker-compose up -d redis` is running

## API Documentation

See individual route files for detailed endpoint documentation:
- `src/api/routes/ai.routes.ts` - AI operations
- `src/api/routes/resume.routes.ts` - Resume management
- `src/api/routes/document.routes.ts` - Document storage
