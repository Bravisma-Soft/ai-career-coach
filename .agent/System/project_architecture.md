# AI Career Coach - Project Architecture

## Related Docs
- [Database Schema](./database_schema.md)
- [AI Agent Architecture](./ai_agent_architecture.md)
- [README.md](../README.md) - Documentation index

---

## 1. Project Overview

**AI Career Coach** is an intelligent career transition platform that leverages Claude AI to help job seekers optimize their resumes, prepare for interviews, and manage their job search efficiently.

### Project Goals
- Provide AI-powered career guidance and coaching
- Enable intelligent resume optimization for specific job descriptions
- Offer mock interview sessions with AI-driven feedback
- Facilitate comprehensive job application tracking
- Deliver personalized career development recommendations

---

## 2. High-Level Architecture

The system follows a **monorepo structure** with separate frontend and backend applications:

```
ai-career-coach/
├── frontend/           # React + TypeScript SPA
├── backend/            # Node.js + Express API
├── docker-compose.yml  # Infrastructure setup
└── .agent/             # Project documentation
```

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                             │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  React 18 + TypeScript + Vite                             │  │
│  │  - Zustand (State Management)                             │  │
│  │  - React Query (Server State)                             │  │
│  │  - Axios (HTTP Client)                                    │  │
│  │  - Shadcn/ui + Tailwind CSS (UI Components)              │  │
│  └───────────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTP/REST API
┌────────────────────────┴────────────────────────────────────────┐
│                      API Gateway Layer                           │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Express.js + TypeScript                                  │  │
│  │  - JWT Authentication                                     │  │
│  │  - Rate Limiting                                          │  │
│  │  - CORS + Helmet Security                                │  │
│  │  - Request Validation (Zod)                              │  │
│  └───────────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────────┘
                         │
┌────────────────────────┴────────────────────────────────────────┐
│                     Business Logic Layer                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   Services   │  │  AI Agents   │  │   Job Processors     │  │
│  │              │  │              │  │   (BullMQ)           │  │
│  │ - Auth       │  │ - Base Agent │  │                      │  │
│  │ - Resume     │  │ - Parser     │  │ - Resume Parsing     │  │
│  │ - Job        │  │ - Tailor     │  │ - AI Processing      │  │
│  │ - Interview  │  │ - Coach      │  │ - Background Tasks   │  │
│  │ - User       │  │              │  │                      │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└────────────────────────┬────────────────────────────────────────┘
                         │
┌────────────────────────┴────────────────────────────────────────┐
│                       Data Layer                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  PostgreSQL  │  │    Redis     │  │   AWS S3 / Local     │  │
│  │   (Prisma)   │  │   (Cache)    │  │   (File Storage)     │  │
│  │              │  │              │  │                      │  │
│  │ - User Data  │  │ - Sessions   │  │ - Resumes            │  │
│  │ - Jobs       │  │ - Rate Limit │  │ - Documents          │  │
│  │ - Resumes    │  │ - Queue Jobs │  │ - Profile Pictures   │  │
│  │ - Interviews │  │              │  │                      │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└────────────────────────┬────────────────────────────────────────┘
                         │
┌────────────────────────┴────────────────────────────────────────┐
│                    External Services                             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Anthropic Claude API (AI Model)                         │   │
│  │  - claude-sonnet-4-5 (Primary)                           │   │
│  │  - claude-opus-4 (Advanced tasks)                        │   │
│  │  - claude-3-5-haiku (Quick tasks)                        │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Technology Stack

### Frontend (`/frontend`)

| Category | Technology | Purpose |
|----------|-----------|---------|
| **Framework** | React 18 | UI library |
| **Language** | TypeScript | Type safety |
| **Build Tool** | Vite | Fast builds, HMR |
| **Router** | React Router v6 | Client-side routing |
| **State Management** | Zustand | Global state |
| **Server State** | React Query (TanStack Query) | Data fetching, caching |
| **HTTP Client** | Axios | API requests |
| **Styling** | Tailwind CSS | Utility-first CSS |
| **UI Components** | Radix UI + Shadcn/ui | Accessible components |
| **Forms** | React Hook Form + Zod | Form handling, validation |
| **Icons** | Lucide React | Icon library |
| **Notifications** | Sonner | Toast notifications |
| **Drag & Drop** | @dnd-kit | Kanban board |
| **PDF Viewer** | react-pdf | Resume preview |
| **Date Utils** | date-fns | Date formatting |

### Backend (`/backend`)

| Category | Technology | Purpose |
|----------|-----------|---------|
| **Runtime** | Node.js 18+ | JavaScript runtime |
| **Framework** | Express 5 | Web framework |
| **Language** | TypeScript | Type safety |
| **Database ORM** | Prisma | Database toolkit |
| **Database** | PostgreSQL 15+ | Primary database |
| **Cache/Queue** | Redis 7+ | Caching, sessions, queues |
| **Job Queue** | BullMQ | Background jobs |
| **Authentication** | JWT + bcryptjs | Secure auth |
| **Validation** | Zod | Schema validation |
| **Security** | Helmet + CORS + Rate Limiting | Security middleware |
| **Logging** | Winston | Structured logging |
| **File Upload** | Multer | Multipart form data |
| **AI Integration** | Anthropic SDK | Claude AI |
| **Storage** | AWS S3 (optional) / Local | File storage |

### Infrastructure

| Service | Technology | Purpose |
|---------|-----------|---------|
| **Database** | PostgreSQL 15 Alpine | Relational data |
| **Cache** | Redis 7 Alpine | Caching, sessions |
| **Containerization** | Docker Compose | Local development |
| **File Storage** | AWS S3 / Local FS | Resume/document storage |

---

## 4. Project Structure

### Frontend Structure

```
frontend/
├── src/
│   ├── components/              # React components
│   │   ├── ui/                 # Base UI components (Shadcn)
│   │   ├── jobs/               # Job tracking components
│   │   ├── interviews/         # Interview components
│   │   ├── resumes/            # Resume management
│   │   ├── ai/                 # AI-specific features
│   │   ├── Header.tsx          # App header
│   │   ├── MobileNav.tsx       # Mobile navigation
│   │   ├── ProtectedRoute.tsx  # Auth guard
│   │   └── ErrorBoundary.tsx   # Error handling
│   │
│   ├── pages/                  # Route pages
│   │   ├── Landing.tsx         # Landing page
│   │   ├── Login.tsx           # Authentication
│   │   ├── Register.tsx        # Registration
│   │   ├── Dashboard.tsx       # Main dashboard
│   │   ├── Resumes.tsx         # Resume management
│   │   ├── Interviews.tsx      # Interview list
│   │   ├── InterviewDetail.tsx # Interview details
│   │   ├── MockInterview.tsx   # AI mock interview
│   │   ├── Profile.tsx         # User profile
│   │   └── Settings.tsx        # App settings
│   │
│   ├── services/               # API service layer
│   │   ├── authService.ts      # Authentication API
│   │   ├── resumeService.ts    # Resume operations
│   │   ├── jobService.ts       # Job tracking
│   │   └── interviewService.ts # Interview management
│   │
│   ├── store/                  # Zustand stores
│   │   ├── authStore.ts        # Auth state
│   │   ├── jobsStore.ts        # Jobs state
│   │   ├── resumesStore.ts     # Resumes state
│   │   └── interviewsStore.ts  # Interviews state
│   │
│   ├── hooks/                  # Custom React hooks
│   │   └── use-mobile.tsx      # Mobile detection
│   │
│   ├── lib/                    # Utility functions
│   │   ├── api.ts              # Axios instance
│   │   └── utils.ts            # Helper functions
│   │
│   ├── types/                  # TypeScript types
│   │
│   ├── App.tsx                 # Root component
│   ├── main.tsx                # App entry point
│   └── index.css               # Global styles
│
├── public/                     # Static assets
├── index.html                  # HTML template
├── vite.config.ts              # Vite configuration
├── tailwind.config.ts          # Tailwind configuration
├── tsconfig.json               # TypeScript config
└── package.json                # Dependencies
```

### Backend Structure

```
backend/
├── src/
│   ├── api/                    # API layer
│   │   ├── routes/            # Route definitions
│   │   │   ├── index.ts       # Route aggregator
│   │   │   ├── auth.routes.ts
│   │   │   ├── user.routes.ts
│   │   │   ├── resume.routes.ts
│   │   │   ├── job.routes.ts
│   │   │   ├── application.routes.ts
│   │   │   └── interview.routes.ts
│   │   │
│   │   ├── middleware/        # Express middleware
│   │   │   ├── auth.middleware.ts   # JWT verification
│   │   │   ├── errorHandler.ts      # Error handling
│   │   │   ├── rateLimiter.ts       # Rate limiting
│   │   │   └── validate.ts          # Request validation
│   │   │
│   │   └── validators/        # Zod validation schemas
│   │       ├── auth.validator.ts
│   │       ├── resume.validator.ts
│   │       ├── job.validator.ts
│   │       └── interview.validator.ts
│   │
│   ├── services/              # Business logic
│   │   ├── auth.service.ts
│   │   ├── user.service.ts
│   │   ├── resume.service.ts
│   │   ├── job.service.ts
│   │   ├── interview.service.ts
│   │   ├── application.service.ts
│   │   └── storage.service.ts       # File uploads
│   │
│   ├── ai/                    # AI integration
│   │   ├── agents/            # AI agent classes
│   │   │   ├── base.agent.ts         # Abstract base class
│   │   │   └── resume-parser.agent.ts # Resume parsing
│   │   │
│   │   ├── prompts/           # AI prompt templates
│   │   │   └── resume-parser.prompt.ts
│   │   │
│   │   └── utils/             # AI utilities
│   │       ├── prompt-builder.ts
│   │       └── response-parser.ts
│   │
│   ├── jobs/                  # Background jobs
│   │   ├── processors/        # Job processors
│   │   │   └── resume-parse.processor.ts
│   │   │
│   │   └── workers/           # Job workers
│   │       └── resume-parse.worker.ts
│   │
│   ├── database/              # Database layer
│   │   ├── client.ts          # Prisma client
│   │   └── prisma.ts          # DB connection
│   │
│   ├── config/                # Configuration
│   │   ├── env.ts             # Environment variables
│   │   ├── logger.ts          # Winston logger
│   │   ├── redis.ts           # Redis connection
│   │   ├── queue.ts           # BullMQ setup
│   │   ├── claude.config.ts   # Claude AI config
│   │   └── multer.ts          # File upload config
│   │
│   ├── utils/                 # Utility functions
│   │   ├── ApiError.ts        # Custom error classes
│   │   ├── response.ts        # API response helpers
│   │   ├── asyncHandler.ts    # Async route wrapper
│   │   ├── document-parser.ts # Document parsing
│   │   └── constants.ts       # App constants
│   │
│   ├── types/                 # TypeScript types
│   │   ├── index.ts
│   │   ├── auth.types.ts
│   │   ├── ai.types.ts
│   │   └── express.d.ts       # Express type extensions
│   │
│   ├── app.ts                 # Express app setup
│   └── server.ts              # Server entry point
│
├── prisma/                    # Prisma ORM
│   ├── schema.prisma          # Database schema
│   ├── migrations/            # DB migrations
│   └── seed.ts                # Seed data
│
├── logs/                      # Log files (generated)
├── uploads/                   # Local file uploads (generated)
├── dist/                      # Compiled output (generated)
├── tsconfig.json              # TypeScript config
└── package.json               # Dependencies
```

---

## 5. Core Modules & Functionalities

### 5.1 Authentication & User Management
- **JWT-based authentication** with access and refresh tokens
- **User registration and login** with email and password
- **Password hashing** using bcryptjs
- **Session management** with Redis
- **Protected routes** requiring authentication
- **User profile management** (name, email, avatar)

### 5.2 Resume Management
- **Upload resumes** (PDF, DOC, DOCX)
- **AI-powered parsing** to extract structured data
- **Resume versioning** with primary resume selection
- **Resume tailoring** for specific job descriptions
- **Resume comparison** showing before/after changes
- **Resume preview** with PDF viewer

### 5.3 Job Tracking
- **Job board** with Kanban-style interface
- **Job status tracking** (Interested, Applied, Interview, Offer, etc.)
- **Job details** (title, company, location, salary, description)
- **AI match scoring** between resume and job description
- **Status history** tracking job application progress
- **Notes and deadlines** for each job

### 5.4 Interview Management
- **Interview scheduling** with date/time/location
- **Interview types** (Phone, Video, Onsite, Technical, Behavioral)
- **Interview preparation** notes and questions
- **Mock interviews** with AI interviewer
- **Interview feedback** and scoring
- **Follow-up tracking**

### 5.5 AI-Powered Features
- **Resume parsing** - Extract structured data from documents
- **Resume tailoring** - Optimize resume for job descriptions
- **Cover letter generation** - AI-generated personalized letters
- **Mock interviews** - Interactive AI interview practice
- **Interview feedback** - Scoring and improvement suggestions
- **Job matching** - Calculate fit between resume and job
- **Career advice** - Personalized coaching and recommendations

### 5.6 User Profile & Career Data
- **Professional profile** (bio, location, links)
- **Work experience** tracking with achievements
- **Education history** with GPA and coursework
- **Skills inventory** with proficiency levels
- **Certifications** with expiry dates
- **Career preferences** (desired roles, salary, work mode)

---

## 6. Integration Points

### 6.1 External Services

#### Anthropic Claude API
- **Purpose**: AI-powered features (parsing, tailoring, coaching)
- **Models Used**:
  - `claude-sonnet-4-5`: Primary model (balanced cost/performance)
  - `claude-opus-4`: Advanced tasks (complex analysis)
  - `claude-3-5-haiku`: Quick tasks (simple queries)
- **Cost Tracking**: Token usage logging for cost monitoring
- **Error Handling**: Retry logic with exponential backoff

#### AWS S3 (Optional)
- **Purpose**: Resume and document storage
- **Alternative**: Local file system storage
- **Bucket Structure**: Organized by user ID and file type

### 6.2 Internal Integration

#### Frontend ↔ Backend
- **Protocol**: REST API over HTTPS
- **Authentication**: JWT Bearer tokens in Authorization header
- **Error Handling**: Standardized error responses
- **Request Format**: JSON
- **Response Format**: JSON with success/error wrapper

#### Backend ↔ Database
- **ORM**: Prisma for type-safe database access
- **Migration Strategy**: Version-controlled migrations
- **Connection Pool**: Configured for production load

#### Backend ↔ Redis
- **Purpose**: Session storage, rate limiting, job queues
- **Key Patterns**:
  - `session:{sessionId}` - User sessions
  - `rate-limit:{ip}:{endpoint}` - Rate limiting
  - `bull:*` - BullMQ job queues

---

## 7. Security Architecture

### 7.1 Authentication & Authorization
- **JWT tokens** with short expiration (15 minutes)
- **Refresh tokens** for extended sessions (7 days)
- **Password hashing** with bcrypt (10 rounds)
- **Role-based access control** (USER, ADMIN)
- **Session invalidation** on logout

### 7.2 API Security
- **Helmet.js** for secure HTTP headers
- **CORS** with whitelist of allowed origins
- **Rate limiting** per IP and endpoint
- **Input validation** with Zod schemas
- **SQL injection prevention** via Prisma ORM
- **XSS protection** through React escaping

### 7.3 File Upload Security
- **File type validation** (PDF, DOC, DOCX only)
- **File size limits** (10MB max)
- **Virus scanning** (optional integration)
- **Secure storage** with access controls

### 7.4 Data Privacy
- **Password encryption** at rest
- **Token encryption** in transit (HTTPS)
- **PII handling** following best practices
- **User data deletion** on account removal

---

## 8. Performance Optimization

### Frontend
- **Code splitting** with React.lazy()
- **Route-based lazy loading**
- **Image optimization** with proper formats
- **Memoization** for expensive computations
- **Virtualized lists** for large datasets
- **Service worker** for offline support (future)

### Backend
- **Database indexing** on frequently queried fields
- **Query optimization** with Prisma
- **Redis caching** for frequent queries
- **Connection pooling** for database
- **Compression** middleware for responses
- **Background jobs** for long-running tasks

---

## 9. Scalability Considerations

### Horizontal Scaling
- **Stateless API design** allows multiple instances
- **Redis for shared state** (sessions, cache)
- **Load balancer** for traffic distribution
- **Database read replicas** for query scaling

### Vertical Scaling
- **Database optimization** with proper indexes
- **Query performance monitoring**
- **Resource limits** per request
- **Rate limiting** to prevent abuse

### Async Processing
- **Background jobs** with BullMQ
- **Job prioritization** for time-sensitive tasks
- **Job retry logic** with exponential backoff
- **Dead letter queues** for failed jobs

---

## 10. Monitoring & Observability

### Logging
- **Winston** for structured logging
- **Log levels**: error, warn, info, debug
- **Production logs** to files and console
- **Request logging** with Morgan

### Metrics (Planned)
- **API response times**
- **Error rates**
- **Token usage and costs**
- **Database query performance**
- **Queue processing times**

### Error Tracking (Optional)
- **Sentry integration** for error monitoring
- **Stack traces** for debugging
- **Error grouping** by type

---

## 11. Deployment Architecture

### Development
```
Local Machine
├── Frontend (Vite Dev Server) - Port 5173
├── Backend (ts-node-dev) - Port 3000
├── PostgreSQL (Docker) - Port 5432
└── Redis (Docker) - Port 6379
```

### Production (Recommended)
```
┌─────────────────────────────────────────────┐
│           Load Balancer / CDN               │
└────────────────┬────────────────────────────┘
                 │
     ┌───────────┴───────────┐
     │                       │
┌────▼────┐            ┌─────▼─────┐
│ Frontend│            │  Backend  │
│ (Vercel)│            │ (Railway) │
└─────────┘            └─────┬─────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
        ┌─────▼────┐   ┌────▼─────┐  ┌────▼────┐
        │PostgreSQL│   │  Redis   │  │  AWS S3 │
        │ (Neon)   │   │ (Upstash)│  │         │
        └──────────┘   └──────────┘  └─────────┘
```

---

## 12. Future Enhancements

### Planned Features
- **Email notifications** for interviews and deadlines
- **Calendar integration** for interview scheduling
- **Job board scraping** to auto-import job postings
- **Salary negotiation assistant** with AI guidance
- **LinkedIn profile optimization**
- **Network tracking** for connections and referrals
- **Career goal tracking** with milestones
- **Skill assessment** tests
- **Document templates** for resumes and cover letters

### Technical Improvements
- **GraphQL API** as alternative to REST
- **WebSocket support** for real-time updates
- **Mobile app** (React Native)
- **Offline mode** with service workers
- **Multi-language support** (i18n)
- **Dark mode** theme support
- **Accessibility improvements** (WCAG AAA)
- **Performance monitoring** dashboard
- **A/B testing** framework
- **CI/CD pipeline** automation

---

## 13. Development Workflow

### Local Development
1. Start infrastructure: `docker-compose up -d`
2. Install dependencies: `npm install` (in both frontend and backend)
3. Run migrations: `cd backend && npm run prisma:migrate`
4. Start backend: `cd backend && npm run dev`
5. Start frontend: `cd frontend && npm run dev`

### Code Quality
- **Linting**: ESLint for code quality
- **Formatting**: Prettier for consistent style
- **Type Checking**: TypeScript strict mode
- **Pre-commit Hooks**: Lint and format on commit

### Testing (To be implemented)
- **Unit tests**: Jest + React Testing Library
- **Integration tests**: Supertest for API
- **E2E tests**: Playwright or Cypress
- **Coverage**: 80%+ target

---

## 14. Key Technical Decisions

### Why Monorepo?
- **Shared types** between frontend and backend
- **Easier dependency management**
- **Atomic commits** across full stack
- **Simplified CI/CD**

### Why Prisma?
- **Type safety** with generated TypeScript types
- **Migration management** with version control
- **Excellent developer experience**
- **Auto-generated documentation**

### Why Zustand over Redux?
- **Simpler API** with less boilerplate
- **Better TypeScript support**
- **Smaller bundle size**
- **Built-in persistence**

### Why Claude over OpenAI?
- **Superior reasoning** for complex tasks
- **Longer context window** (200K tokens)
- **Better at structured output**
- **Constitutional AI** for safer responses

### Why BullMQ?
- **Robust job processing** with Redis
- **Job prioritization** and scheduling
- **Retry logic** and error handling
- **Built-in monitoring** dashboard

---

## 15. Version History

- **v1.0.0** (Current) - Initial MVP release
  - Core authentication and user management
  - Resume upload and parsing
  - Job tracking with Kanban board
  - Mock interview feature
  - Profile management

---

**Last Updated**: 2025-10-13
**Document Owner**: Engineering Team
