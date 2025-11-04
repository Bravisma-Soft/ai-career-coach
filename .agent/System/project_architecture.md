# AI Career Coach - Project Architecture

## Related Docs
- [Database Schema](./database_schema.md)
- [AI Agent Architecture](./ai_agent_architecture.md)
- [README.md](../README.md) - Documentation index

---

## 1. Project Overview

**AI Career Coach** is an intelligent career transition platform that leverages Claude AI (Sonnet 4.5) to help job seekers optimize their resumes, prepare for interviews, and manage their job search efficiently.

### Project Goals
- Provide AI-powered career guidance and coaching
- Enable intelligent resume optimization for specific job descriptions
- Offer mock interview sessions with AI-driven feedback
- Facilitate comprehensive job application tracking
- Deliver personalized career development recommendations
- Automate job discovery and matching (Phase 2)

### Current Status (Oct 30, 2025)
- **Version**: 1.0 MVP
- **Deployment**: Production on Railway (Backend) + Vercel (Frontend)
- **Completion**: 92% MVP Phase 1 Complete
- **Production URL**: https://ai-career-coach-backend.railway.app
- **Latest Updates**:
  - ✅ Resume Analyzer Agent (Oct 28)
  - ✅ JSON parsing fixes for AI responses (Oct 30)
  - ✅ Worker service configuration (Oct 30)
  - ✅ Performance optimization (eliminated 5+ API calls on resume page load)

---

## 2. High-Level Architecture

The system follows a **monorepo structure** with separate frontend and backend applications:

```
ai-career-coach/
├── frontend/           # React + TypeScript SPA
├── backend/            # Node.js + Express API
├── docker-compose.yml  # Local infrastructure setup
├── .agent/             # Project documentation
└── docs/               # Additional documentation
```

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                             │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  React 18 + TypeScript + Vite                             │  │
│  │  - Zustand (State Management)                             │  │
│  │  - Axios (HTTP Client)                                    │  │
│  │  - Shadcn/ui + Tailwind CSS (UI Components)              │  │
│  │  - React Router v6 (Client Routing)                      │  │
│  └───────────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTP/REST API
┌────────────────────────┴────────────────────────────────────────┐
│                      API Gateway Layer                           │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Express.js + TypeScript                                  │  │
│  │  - JWT Authentication (24h expiry)                        │  │
│  │  - Rate Limiting (express-rate-limit)                    │  │
│  │  - CORS + Helmet Security                                │  │
│  │  - Request Validation (Zod)                              │  │
│  │  - Error Handling Middleware                             │  │
│  │  - Logging (Winston)                                     │  │
│  └───────────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────────┘
                         │
┌────────────────────────┴────────────────────────────────────────┐
│                     Business Logic Layer                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   Services   │  │  AI Agents   │  │   Job Processors     │  │
│  │              │  │              │  │   (BullMQ)           │  │
│  │ - Auth       │  │ ✅ Parser    │  │                      │  │
│  │ - User       │  │ ✅ Tailor    │  │ ✅ Resume Parsing    │  │
│  │ - Resume     │  │ ✅ Cover Ltr │  │ - Email Queue        │  │
│  │ - Job        │  │ ✅ Mock Int  │  │ - Notification Queue │  │
│  │ - Interview  │  │ ✅ Job Parse │  │                      │  │
│  │ - Document   │  │ ✅ Analyzer  │  │                      │  │
│  │ - Application│  │ ❌ Matcher   │  │                      │  │
│  │ - Storage    │  │ ❌ Research  │  │                      │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└────────────────────────┬────────────────────────────────────────┘
                         │
┌────────────────────────┴────────────────────────────────────────┐
│                       Data Layer                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  PostgreSQL  │  │    Redis     │  │   Local / S3         │  │
│  │   (Prisma)   │  │   (Cache)    │  │   (File Storage)     │  │
│  │              │  │              │  │                      │  │
│  │ - 17+ Models │  │ - Sessions   │  │ - Resumes (PDF/DOCX)│  │
│  │ - User Data  │  │ - Rate Limit │  │ - Documents          │  │
│  │ - Jobs       │  │ - Queue Jobs │  │ - Profile Pictures   │  │
│  │ - Resumes    │  │              │  │                      │  │
│  │ - Interviews │  │              │  │                      │  │
│  │ - Analysis   │  │              │  │                      │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└────────────────────────┬────────────────────────────────────────┘
                         │
┌────────────────────────┴────────────────────────────────────────┐
│                    External Services                             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Anthropic Claude API (AI Model)                         │   │
│  │  - claude-sonnet-4-5-20250929 (Primary)                 │   │
│  │  - Temperature: 0.3-0.7 (task-dependent)                │   │
│  │  - Max Tokens: 2048-8000 (task-dependent)               │   │
│  │  - Timeout: 300s (5 minutes)                            │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Technology Stack

### Frontend (`/frontend`) - 127 TypeScript files

| Category | Technology | Purpose |
|----------|-----------|---------|
| **Framework** | React 18.2.0 | UI library |
| **Language** | TypeScript 5.x | Type safety |
| **Build Tool** | Vite 5.x | Fast builds, HMR |
| **Router** | React Router v6 | Client-side routing |
| **State Management** | Zustand 4.x | Global state (7 stores) |
| **HTTP Client** | Axios | API requests |
| **Styling** | Tailwind CSS 3.x | Utility-first CSS |
| **UI Components** | Radix UI + Shadcn/ui | Accessible components |
| **Forms** | React Hook Form + Zod | Form handling, validation |
| **Icons** | Lucide React | Icon library |
| **Notifications** | Sonner | Toast notifications |
| **Drag & Drop** | @dnd-kit | Kanban board |
| **PDF Viewer** | react-pdf | Resume preview |
| **Date Utils** | date-fns | Date formatting |

#### Zustand Stores
1. `authStore.ts` - Authentication state
2. `profileStore.ts` - User profile state
3. `resumesStore.ts` - Resume management
4. `jobsStore.ts` - Job tracking
5. `interviewsStore.ts` - Interview management
6. `aiStore.ts` - AI operations state
7. `uiStore.ts` - UI state (modals, toasts)

#### Frontend Pages
- `Dashboard.tsx` - Main dashboard with stats
- `Jobs.tsx` - Job tracking Kanban board
- `Resumes.tsx` - Resume management
- `Interviews.tsx` - Interview list/calendar
- `InterviewDetail.tsx` - Single interview view
- `MockInterview.tsx` - Mock interview UI
- `MockInterviewResults.tsx` - Session results
- `Profile.tsx` - User profile management
- `Settings.tsx` - User settings
- `Login.tsx` / `Register.tsx` - Auth pages
- `Landing.tsx` - Landing page
- `NotFound.tsx` - 404 page
- `StyleGuide.tsx` - UI component showcase

### Backend (`/backend`) - 70 TypeScript files

| Category | Technology | Purpose |
|----------|-----------|---------|
| **Runtime** | Node.js 18+ | JavaScript runtime |
| **Framework** | Express 5 | Web framework |
| **Language** | TypeScript 5.x | Type safety |
| **Database ORM** | Prisma 5.x | Database toolkit |
| **Database** | PostgreSQL 15+ | Primary database (Railway) |
| **Cache/Queue** | Redis 7+ | Caching, sessions, queues (Railway) |
| **Job Queue** | BullMQ 5.x | Background jobs |
| **Authentication** | JWT + bcryptjs | Secure auth |
| **Validation** | Zod | Schema validation |
| **Security** | Helmet + CORS + Rate Limiting | Security middleware |
| **Logging** | Winston | Structured logging |
| **File Upload** | Multer | Multipart form data |
| **AI Integration** | @anthropic-ai/sdk | Claude AI |
| **Storage** | Local FS (S3 planned) | File storage |
| **PDF Parsing** | pdf-parse | Resume extraction |
| **DOCX Parsing** | mammoth | Resume extraction |
| **Web Scraping** | Cheerio + Puppeteer | Job URL parsing |

#### Backend Services (9 services)
1. `auth.service.ts` - Authentication, JWT, password reset
2. `user.service.ts` - User CRUD operations
3. `resume.service.ts` - Resume upload, parse, tailor
4. `job.service.ts` - Job CRUD, status management
5. `application.service.ts` - Application tracking
6. `interview.service.ts` - Interview scheduling
7. `mock-interview.service.ts` - Mock interview sessions
8. `document.service.ts` - Document storage
9. `storage.service.ts` - File upload/download

#### API Routes (11 route groups)
1. `auth.routes.ts` - `/api/auth/*`
2. `user.routes.ts` - `/api/profile/*`
3. `resume.routes.ts` - `/api/resumes/*`
4. `job.routes.ts` - `/api/jobs/*`
5. `application.routes.ts` - `/api/applications/*`
6. `interview.routes.ts` - `/api/interviews/*`
7. `mock-interview.routes.ts` - `/api/mock-interviews/*`
8. `document.routes.ts` - `/api/documents/*`
9. `ai.routes.ts` - `/api/ai/*` (placeholder agents)
10. `health.routes.ts` - `/api/health/*`
11. `index.ts` - Route aggregation

### Infrastructure

| Service | Technology | Environment | Purpose |
|---------|-----------|-------------|---------|
| **Database** | PostgreSQL 15 | Railway | Relational data |
| **Cache** | Redis 7 | Railway | Sessions, rate limiting, queue |
| **Container** | Docker Compose | Local dev | PostgreSQL + Redis |
| **File Storage** | Local FS | Development | Resume/document storage |
| **Deployment** | Railway | Production | Backend hosting |
| **Worker** | BullMQ Worker | Railway | Resume parsing queue |

---

## 4. Project Structure

### Backend Structure
```
backend/
├── src/
│   ├── ai/                          # AI Integration
│   │   ├── agents/                  # AI Agents (6 files)
│   │   │   ├── base.agent.ts        # ✅ Abstract base class
│   │   │   ├── resume-parser.agent.ts      # ✅ Parse resumes
│   │   │   ├── resume-tailor.agent.ts      # ✅ Tailor resumes
│   │   │   ├── cover-letter.agent.ts       # ✅ Generate cover letters
│   │   │   ├── mock-interview.agent.ts     # ✅ Mock interviews
│   │   │   └── job-parser.agent.ts         # ✅ Parse job URLs
│   │   ├── prompts/                 # AI Prompts (5 files)
│   │   │   ├── resume-parser.prompt.ts
│   │   │   ├── resume-tailor.prompt.ts
│   │   │   ├── cover-letter.prompt.ts
│   │   │   ├── mock-interview.prompt.ts
│   │   │   └── job-parser.prompt.ts
│   │   └── utils/                   # AI Utilities
│   │       ├── response-parser.ts
│   │       └── prompt-builder.ts
│   │
│   ├── api/
│   │   ├── routes/                  # API Routes (11 files)
│   │   ├── middleware/              # Express Middleware
│   │   │   ├── auth.middleware.ts
│   │   │   ├── error.middleware.ts
│   │   │   ├── validate.middleware.ts
│   │   │   └── rate-limit.middleware.ts
│   │   └── validators/              # Zod Schemas
│   │       ├── auth.validator.ts
│   │       ├── resume.validator.ts
│   │       ├── job.validator.ts
│   │       └── ai.validator.ts
│   │
│   ├── services/                    # Business Logic (9 files)
│   │
│   ├── jobs/                        # Background Jobs
│   │   ├── workers/
│   │   │   └── resume-parse.worker.ts
│   │   └── processors/
│   │       └── resume-parse.processor.ts
│   │
│   ├── config/                      # Configuration
│   │   ├── env.ts                   # Environment variables
│   │   ├── logger.ts                # Winston logger
│   │   ├── claude.config.ts         # Claude AI config
│   │   ├── queue.ts                 # BullMQ config
│   │   └── redis.ts                 # Redis config
│   │
│   ├── database/                    # Database
│   │   └── prisma.ts                # Prisma client
│   │
│   ├── types/                       # TypeScript Types
│   │   ├── ai.types.ts
│   │   ├── ai-api.types.ts
│   │   └── express.d.ts
│   │
│   ├── utils/                       # Utilities
│   │   ├── resume-serializer.ts
│   │   ├── response.ts
│   │   └── pdfGenerator.ts
│   │
│   ├── app.ts                       # Express app setup
│   └── server.ts                    # Server entry point
│
├── prisma/
│   ├── schema.prisma                # Database schema (15 models)
│   └── migrations/                  # Database migrations
│
├── uploads/                         # Local file storage
├── tests/                           # Test files
└── package.json
```

### Frontend Structure
```
frontend/
├── src/
│   ├── pages/                       # Route Pages (14 files)
│   │
│   ├── components/                  # React Components
│   │   ├── resumes/                 # Resume components
│   │   │   ├── ResumeList.tsx
│   │   │   ├── ResumePreview.tsx
│   │   │   ├── ResumeEditor.tsx
│   │   │   └── TailoredResumeView.tsx
│   │   ├── jobs/                    # Job components
│   │   │   ├── JobCard.tsx
│   │   │   ├── JobKanban.tsx
│   │   │   ├── JobDetailDrawer.tsx
│   │   │   └── JobForm.tsx
│   │   ├── interviews/              # Interview components
│   │   │   ├── InterviewCard.tsx
│   │   │   ├── InterviewForm.tsx
│   │   │   └── MockInterviewSession.tsx
│   │   ├── dashboard/               # Dashboard components
│   │   │   ├── StatsCard.tsx
│   │   │   └── RecentActivity.tsx
│   │   ├── layout/                  # Layout components
│   │   │   ├── AppLayout.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Header.tsx
│   │   └── ui/                      # Shadcn/ui components
│   │
│   ├── store/                       # Zustand Stores (7 files)
│   │
│   ├── services/                    # API Services (7 files)
│   │   ├── authService.ts
│   │   ├── profileService.ts
│   │   ├── resumeService.ts
│   │   ├── jobService.ts
│   │   ├── interviewService.ts
│   │   ├── aiService.ts
│   │   └── documentService.ts
│   │
│   ├── hooks/                       # Custom Hooks
│   │   ├── useAuth.ts
│   │   ├── useApi.ts
│   │   └── useToast.ts
│   │
│   ├── lib/                         # Utilities
│   │   ├── api.ts                   # Axios instance
│   │   └── utils.ts                 # Helper functions
│   │
│   ├── types/                       # TypeScript Types
│   │   ├── api.types.ts
│   │   └── models.types.ts
│   │
│   ├── App.tsx                      # Root component
│   └── main.tsx                     # Entry point
│
├── public/                          # Static assets
└── package.json
```

---

## 5. Core Functionalities

### Authentication System ✅
- **JWT-based authentication** with 24-hour expiration
- **Refresh tokens** stored in Redis (7-day expiration)
- **Multi-device session management**
- **Password reset flow** (email service pending)
- **Protected routes** with middleware
- **Rate limiting** on auth endpoints

**Files:**
- `backend/src/services/auth.service.ts`
- `backend/src/api/routes/auth.routes.ts`
- `backend/src/api/middleware/auth.middleware.ts`
- `frontend/src/store/authStore.ts`

### Resume Management ✅
- **Upload** PDF/DOCX files
- **AI-powered parsing** (background job with BullMQ)
- **Structured data extraction** (personal info, experience, education, skills)
- **Master resume selection** (`isPrimary` flag)
- **Resume preview** and download
- **Version tracking**

**AI Agent:** `ResumeParserAgent`
- Temperature: 0.3 (consistent extraction)
- Max Tokens: 4096
- Processing: Background queue (1-2 minutes)

**Files:**
- `backend/src/services/resume.service.ts`
- `backend/src/ai/agents/resume-parser.agent.ts`
- `backend/src/jobs/processors/resume-parse.processor.ts`
- `frontend/src/components/resumes/*`

### Resume Tailoring ✅
- **AI-powered customization** for specific jobs
- **Match score** calculation (0-100%)
- **Keyword alignment** analysis
- **Change tracking** with explanations
- **ATS optimization** scoring
- **Side-by-side comparison** view
- **Document storage** for tailored versions

**AI Agent:** `ResumeTailorAgent`
- Temperature: 0.5 (balanced creativity)
- Max Tokens: 8000
- Processing: 2-5 minutes (synchronous)

**Files:**
- `backend/src/services/resume.service.ts` (`tailorResumeForJob`)
- `backend/src/ai/agents/resume-tailor.agent.ts`
- `frontend/src/components/resumes/TailoredResumeView.tsx`

### Cover Letter Generation ✅
- **AI-generated personalized cover letters**
- **Tone selection** (professional, enthusiastic, formal)
- **Length control** (short, medium, long)
- **Key points extraction**
- **Match to job requirements**
- **Word count and read time**

**AI Agent:** `CoverLetterAgent`
- Temperature: 0.7 (creative writing)
- Max Tokens: 2048
- Processing: 30-60 seconds

**Files:**
- `backend/src/ai/agents/cover-letter.agent.ts`
- `backend/src/api/routes/ai.routes.ts` (endpoint)

### Job Tracking ✅
- **Kanban-style board** with drag-and-drop
- **8 status columns** (INTERESTED → ACCEPTED)
- **Job URL parsing** with AI (Cheerio + Puppeteer)
- **Match score display** (purple badge)
- **Filter by status, work mode, job type**
- **Search and sort** functionality
- **Status change timeline**

**Statuses:**
1. INTERESTED
2. APPLIED
3. INTERVIEW_SCHEDULED
4. INTERVIEW_COMPLETED
5. OFFER_RECEIVED
6. REJECTED
7. ACCEPTED
8. WITHDRAWN

**AI Agent:** `JobParserAgent`
- Scrapes job postings from URLs
- Extracts title, company, description, requirements
- Supports Indeed, LinkedIn, company career pages

**Files:**
- `backend/src/services/job.service.ts`
- `backend/src/ai/agents/job-parser.agent.ts`
- `frontend/src/components/jobs/JobKanban.tsx`
- `frontend/src/pages/Jobs.tsx`

### Mock Interview System ✅
- **AI-generated questions** based on job/company/interviewer
- **3 question generation methods:**
  1. Job-based questions
  2. Job + company context
  3. Full context (job + company + interviewer)
- **Real-time answer evaluation** with scores
- **Comprehensive feedback** (strengths, improvements, key points)
- **Session analysis** with overall performance
- **Interview types supported:**
  - PHONE_SCREEN
  - VIDEO_CALL
  - IN_PERSON
  - TECHNICAL
  - BEHAVIORAL
  - PANEL
  - FINAL
  - OTHER
- **Past session history** with cached results

**AI Agent:** `MockInterviewAgent`
- Temperature: 0.7 (balanced)
- Max Tokens: 4096
- Methods:
  - `generateQuestions()` - 20-40 seconds
  - `evaluateAnswer()` - 10-20 seconds
  - `analyzeSession()` - 30-60 seconds

**Files:**
- `backend/src/services/mock-interview.service.ts`
- `backend/src/ai/agents/mock-interview.agent.ts`
- `backend/src/api/routes/mock-interview.routes.ts`
- `frontend/src/pages/MockInterview.tsx`
- `frontend/src/pages/MockInterviewResults.tsx`

### Interview Management ✅
- **Schedule interviews** with date/time
- **Interviewer tracking** (name, title, email, LinkedIn)
- **Interview round tracking**
- **Outcome recording** (PENDING, PASSED, FAILED, etc.)
- **Preparation notes**
- **Link to jobs**
- **Link to mock interview practice**

**Files:**
- `backend/src/services/interview.service.ts`
- `backend/src/api/routes/interview.routes.ts`
- `frontend/src/pages/Interviews.tsx`

### Document Management ✅
- **Store tailored resumes** with metadata
- **Document types:** RESUME, COVER_LETTER, PORTFOLIO, etc.
- **Version control**
- **Link to jobs**
- **Metadata storage** (match scores, changes, recommendations)

**Files:**
- `backend/src/services/document.service.ts`
- `backend/src/api/routes/document.routes.ts`

### Background Job Processing ✅
- **BullMQ + Redis** for job queue
- **Resume parsing worker** (auto-start in production)
- **Retry logic** (3 retries, 2s delay)
- **Job monitoring** via health check endpoint

**Files:**
- `backend/src/jobs/workers/resume-parse.worker.ts`
- `backend/src/jobs/processors/resume-parse.processor.ts`
- `backend/src/config/queue.ts`

---

## 6. Integration Points

### Internal Integration

#### Frontend ↔ Backend
- **Protocol:** RESTful HTTP API
- **Base URL (Production):** `https://ai-career-coach-backend.railway.app`
- **Authentication:** JWT Bearer tokens
- **Request format:** JSON
- **Response format:** Standardized JSON with `success`, `data`, `error` fields

#### Backend ↔ Database
- **ORM:** Prisma
- **Connection:** PostgreSQL on Railway
- **Migrations:** Automated on deploy
- **Connection pooling:** Yes

#### Backend ↔ Redis
- **Client:** ioredis
- **Uses:**
  - Session storage (JWT refresh tokens)
  - Rate limiting counters
  - BullMQ job queue
- **Connection:** Redis on Railway

#### Backend ↔ AI Agents
- **Pattern:** Service → Agent → Claude API
- **Client Manager:** Singleton `ClaudeClientManager`
- **Error handling:** Retry logic with exponential backoff
- **Cost tracking:** Token usage logging

### External Integration

#### Anthropic Claude API
- **SDK:** `@anthropic-ai/sdk`
- **Model:** `claude-sonnet-4-5-20250929`
- **Authentication:** API key in environment variable
- **Timeout:** 300 seconds (5 minutes)
- **Rate limiting:** Handled by SDK
- **Cost tracking:** Logged per request

**Token Usage:**
- Resume parsing: ~3,000-5,000 tokens
- Resume tailoring: ~8,000-12,000 tokens
- Cover letter: ~4,000-6,000 tokens
- Mock interview questions: ~3,000-5,000 tokens
- Answer evaluation: ~2,000-4,000 tokens
- Session analysis: ~6,000-10,000 tokens

#### File Storage
- **Current:** Local filesystem (`/backend/uploads`)
- **Planned:** AWS S3 or Vercel Blob
- **Upload handling:** Multer middleware
- **Supported formats:** PDF, DOCX

#### Web Scraping (Job URLs)
- **Libraries:** Cheerio (static pages), Puppeteer (JS-rendered pages)
- **Supports:** Indeed, LinkedIn, company career pages
- **Fallback:** Claude AI for unstructured content

---

## 7. Security Architecture

### Authentication & Authorization
- ✅ **JWT tokens** with 24-hour expiration
- ✅ **Refresh tokens** stored securely in Redis
- ✅ **bcrypt password hashing** (10 salt rounds)
- ✅ **Protected routes** with auth middleware
- ✅ **Role-based access control** (USER, ADMIN)
- ⏳ **Email verification** (infrastructure exists, not enforced)

### API Security
- ✅ **CORS** configured with allowed origins
- ✅ **Helmet** for HTTP header security
- ✅ **Rate limiting** (100 requests/15min general, 20/15min AI)
- ✅ **Request validation** with Zod schemas
- ✅ **SQL injection protection** (Prisma parameterized queries)
- ✅ **XSS protection** via Helmet

### Data Security
- ✅ **Environment variables** for secrets
- ✅ **Password reset tokens** with expiration
- ✅ **File upload validation** (type, size limits)
- ✅ **User data isolation** (userId checks in queries)
- ⏳ **Encryption at rest** (planned for S3)

### Production Security
- ✅ **HTTPS only** (Railway handles SSL)
- ✅ **Trust proxy** enabled for Railway reverse proxy
- ✅ **Secure session cookies** (httpOnly, secure in production)
- ⏳ **Error monitoring** (Sentry planned)

---

## 8. Performance Optimization

### Frontend Optimization
- ✅ **Lazy loading** for routes
- ✅ **Code splitting** with Vite
- ✅ **Zustand** for efficient state management
- ✅ **Debouncing** on search inputs
- ⏳ **React Query** for server state caching (partially implemented)

### Backend Optimization
- ✅ **Database indexing** on frequently queried fields
- ✅ **Redis caching** for sessions
- ✅ **Connection pooling** (Prisma default)
- ✅ **Background job queue** for heavy operations
- ⏳ **Response caching** for AI results (planned)
- ⏳ **Claude API streaming** (infrastructure exists, not used)

### Database Optimization
- ✅ **Proper indexes** on foreign keys, status fields, dates
- ✅ **Cascading deletes** for related records
- ✅ **Efficient queries** with Prisma select/include
- ⏳ **Query optimization** monitoring (planned)

---

## 9. Scalability Considerations

### Current Limitations
- **File storage:** Local filesystem (not horizontally scalable)
- **Worker process:** Single instance (can't distribute load)
- **No caching layer** for AI responses

### Scaling Plan
1. **Horizontal scaling:**
   - Move file storage to S3
   - Deploy multiple backend instances behind load balancer
   - Use shared Redis for sessions across instances

2. **Database scaling:**
   - Read replicas for heavy read operations
   - Connection pooling optimization
   - Query performance monitoring

3. **AI optimization:**
   - Cache common AI responses (e.g., standard interview questions)
   - Implement streaming for better perceived performance
   - Batch similar requests

4. **Worker scaling:**
   - Multiple worker instances consuming from shared queue
   - Priority queues for urgent vs. background tasks

---

## 10. Monitoring & Observability

### Current Logging
- ✅ **Winston logger** with structured JSON logs
- ✅ **Request logging** (method, path, status, duration)
- ✅ **AI operation logging** (tokens, cost, duration)
- ✅ **Error logging** with stack traces

### Health Checks
- ✅ **Basic health:** `GET /api/health`
- ✅ **Database health:** `GET /api/health/database`
- ✅ **Redis health:** `GET /api/health/redis`
- ✅ **Queue health:** `GET /api/health/queue`

### Planned Monitoring
- ⏳ **Sentry** for error tracking
- ⏳ **Application metrics** (response times, throughput)
- ⏳ **AI cost tracking dashboard**
- ⏳ **User analytics** (PostHog or Vercel Analytics)

---

## 11. Deployment Architecture

### Production Environment (Railway)

```
┌─────────────────────────────────────────────┐
│              Railway Platform                │
│                                              │
│  ┌────────────────────────────────────────┐ │
│  │  Backend Service                       │ │
│  │  - Express app                         │ │
│  │  - Auto-deploy from main branch        │ │
│  │  - Environment variables configured    │ │
│  │  - Build: npm install && npm run build│ │
│  │  - Start: npm run start:prod          │ │
│  └────────────────────────────────────────┘ │
│                                              │
│  ┌────────────────────────────────────────┐ │
│  │  Worker Service                        │ │
│  │  - Resume parsing worker               │ │
│  │  - Same codebase, different start cmd  │ │
│  │  - Start: npm run worker:resume        │ │
│  └────────────────────────────────────────┘ │
│                                              │
│  ┌────────────────────────────────────────┐ │
│  │  PostgreSQL Database                   │ │
│  │  - Managed PostgreSQL 15               │ │
│  │  - Automatic backups                   │ │
│  └────────────────────────────────────────┘ │
│                                              │
│  ┌────────────────────────────────────────┐ │
│  │  Redis Instance                        │ │
│  │  - Managed Redis 7                     │ │
│  │  - Used for sessions + queue           │ │
│  └────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

### Local Development

```
┌──────────────────────────────────────────────┐
│  Docker Compose (Infrastructure)             │
│  - PostgreSQL 15 (port 5432)                 │
│  - Redis 7 (port 6379)                       │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│  Backend (npm run dev)                       │
│  - Express on port 3000                      │
│  - Hot reload with ts-node-dev               │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│  Worker (npm run worker:resume)              │
│  - BullMQ worker process                     │
│  - Processes resume parsing jobs             │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│  Frontend (npm run dev)                      │
│  - Vite dev server on port 5173              │
│  - Hot module replacement                    │
└──────────────────────────────────────────────┘
```

### Deployment Process
1. **Code pushed to main branch**
2. **Railway detects change**
3. **Automatic build:**
   - Install dependencies
   - Run TypeScript compilation
   - Run database migrations
4. **Deploy:**
   - Backend service restarts
   - Worker service restarts
   - Zero-downtime deployment
5. **Health checks:**
   - Railway monitors health endpoints
   - Auto-restart on failure

---

## 12. Future Enhancements

### Phase 2 - Job Discovery & Automation
- [ ] **LinkedIn Jobs API integration**
- [ ] **Indeed API/scraping**
- [ ] **Job matching AI agent** (recommendations)
- [ ] **Daily job digest emails**
- [ ] **Auto-application tracking**

### Phase 3 - Career Coaching
- [ ] **Career goals management** (database models exist)
- [ ] **Assessment tools** (database models exist)
- [ ] **AI coaching conversations** (database models exist)
- [ ] **Long-term career planning**

### Infrastructure Improvements
- [ ] **AWS S3 file storage**
- [ ] **Sentry error monitoring**
- [ ] **Claude API streaming** for real-time responses
- [ ] **AI response caching**
- [ ] **Email service integration** (SendGrid/Resend)
- [ ] **Calendar integration** (Google Calendar)
- [ ] **PDF export** for interview results
- [ ] **Bulk operations** for resumes/jobs

### AI Agents (Pending Implementation)
- [ ] **Resume Analyzer Agent** - ATS scoring, quality assessment
- [ ] **Interview Prep Agent** - Company research, role-specific questions
- [ ] **Job Matcher Agent** - Intelligent job recommendations (Phase 2)
- [ ] **Job Analyzer Agent** - Analyze job requirements, culture fit
- [ ] **Company Research Agent** - Scrape company info, culture, news
- [ ] **Interviewer Research Agent** - LinkedIn research, background

---

## 13. Key Technical Decisions

### Why Claude Sonnet 4.5?
- **Balanced performance:** Fast enough for real-time use, accurate enough for complex tasks
- **Cost-effective:** $3/1M input tokens, $15/1M output tokens
- **Good context window:** 200K tokens (sufficient for resume + job description)
- **Strong reasoning:** Better at structured extraction than GPT-3.5/4

### Why Monorepo?
- **Shared types:** TypeScript types shared between frontend/backend
- **Simplified deployment:** Single repository to manage
- **Easier development:** Switch between frontend/backend quickly
- **Consistent tooling:** Same Node.js version, linting, formatting

### Why BullMQ?
- **Robust:** Battle-tested job queue
- **Redis-backed:** We already use Redis
- **Retry logic:** Built-in retry with exponential backoff
- **Monitoring:** Easy to monitor job status
- **Scalable:** Multiple workers can consume same queue

### Why Prisma?
- **Type safety:** Auto-generated TypeScript types
- **Migration management:** Version-controlled schema changes
- **Developer experience:** Intuitive API, great autocomplete
- **Performance:** Efficient query generation

### Why Zustand over Redux?
- **Simpler API:** Less boilerplate
- **Better TypeScript support**
- **Smaller bundle size**
- **No provider wrapping needed**
- **Middleware support** (persist, devtools)

---

## 14. Testing Strategy

### Current State
- ⏳ Unit tests: Partially implemented
- ⏳ Integration tests: Partially implemented
- ✅ Manual testing: Comprehensive
- ❌ E2E tests: Not implemented

### Testing Plan
- [ ] **Unit tests** for services and agents (Jest)
- [ ] **Integration tests** for API endpoints (Supertest)
- [ ] **E2E tests** for critical user flows (Playwright)
- [ ] **AI agent tests** with mocked Claude responses
- [ ] **Load testing** for API performance
- [ ] **Security testing** (OWASP Top 10)

---

## Related Documentation

### System Documentation
- [Database Schema](./database_schema.md) - Complete database design
- [AI Agent Architecture](./ai_agent_architecture.md) - AI integration details

### Project Documentation
- [PROJECT_STATUS.md](/PROJECT_STATUS.md) - Current project status
- [DOCUMENTATION_INDEX.md](/DOCUMENTATION_INDEX.md) - All documentation
- [PRODUCTION_DEPLOYMENT_GUIDE.md](/PRODUCTION_DEPLOYMENT_GUIDE.md) - Deployment guide
- [Backend README](/backend/README.md) - Backend setup
- [Frontend README](/frontend/README.md) - Frontend setup

---

**Last Updated:** October 21, 2025
**Document Version:** 2.0
**Status:** Production (90% MVP Complete)
**Next Review:** Monthly or after major changes
