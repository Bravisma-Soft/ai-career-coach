# AI Career Coach - System Architecture

## 1. Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │         Lovable Frontend (React + TypeScript)            │   │
│  │  - User Interface                                         │   │
│  │  - State Management                                       │   │
│  │  - API Client                                            │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↕ HTTPS
┌─────────────────────────────────────────────────────────────────┐
│                      VERCEL EDGE NETWORK                         │
│  - CDN                                                           │
│  - SSL Termination                                               │
│  - DDoS Protection                                               │
│  - Rate Limiting                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                     API GATEWAY LAYER                            │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │         Vercel Serverless Functions (API Routes)         │   │
│  │  - Authentication Middleware                             │   │
│  │  - Request Validation                                    │   │
│  │  - Rate Limiting                                         │   │
│  │  - Logging                                               │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                             │
│  ┌────────────────────┐  ┌─────────────────────────────────┐    │
│  │  Business Logic    │  │   AI Agent Orchestrator         │    │
│  │  Services          │  │   - Resume Parser Agent         │    │
│  │  - User Service    │  │   - Resume Tailor Agent         │    │
│  │  - Job Service     │  │   - Cover Letter Agent          │    │
│  │  - Resume Service  │  │   - Interview Coach Agent       │    │
│  │  - Application     │  │   - Job Matching Agent          │    │
│  │    Service         │  │   - Application Agent           │    │
│  └────────────────────┘  │   - Research Agent              │    │
│                          └─────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                    ↕                         ↕
┌──────────────────────────┐    ┌────────────────────────────────┐
│   DATA LAYER             │    │   AI LAYER                     │
│  ┌────────────────────┐  │    │  ┌──────────────────────────┐  │
│  │ PostgreSQL         │  │    │  │  Claude API              │  │
│  │ (Vercel Postgres)  │  │    │  │  (Anthropic)             │  │
│  │ - User Data        │  │    │  │  - Claude Sonnet 4.5     │  │
│  │ - Jobs             │  │    │  │  - Claude Opus 4         │  │
│  │ - Applications     │  │    │  └──────────────────────────┘  │
│  │ - Resumes          │  │    └────────────────────────────────┘
│  └────────────────────┘  │
│  ┌────────────────────┐  │    ┌────────────────────────────────┐
│  │ Redis              │  │    │   STORAGE LAYER                │
│  │ (Upstash)          │  │    │  ┌──────────────────────────┐  │
│  │ - Session Cache    │  │    │  │ Vercel Blob / AWS S3     │  │
│  │ - Job Queue        │  │    │  │ - Resume PDFs            │  │
│  │ - Rate Limits      │  │    │  │ - Cover Letters          │  │
│  └────────────────────┘  │    │  │ - Documents              │  │
│  ┌────────────────────┐  │    │  └──────────────────────────┘  │
│  │ Pinecone           │  │    └────────────────────────────────┘
│  │ (Vector Store)     │  │
│  │ - Resume Vectors   │  │
│  │ - Job Vectors      │  │
│  └────────────────────┘  │
└──────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                             │
│  - Job Boards APIs (LinkedIn, Indeed, Glassdoor)                │
│  - LinkedIn API (Profile Research)                               │
│  - Email Service (SendGrid/Resend)                              │
│  - Analytics (Vercel Analytics, PostHog)                        │
│  - Monitoring (Sentry)                                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Frontend Architecture (Lovable)

### 2.1 Project Structure

```
/frontend
├── /public
│   ├── favicon.ico
│   └── assets/
├── /src
│   ├── /components
│   │   ├── /ui                    # shadcn/ui components
│   │   ├── /layout                # Layout components
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Footer.tsx
│   │   ├── /auth                  # Auth components
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── /dashboard             # Dashboard components
│   │   │   ├── JobBoard.tsx
│   │   │   ├── JobCard.tsx
│   │   │   ├── StatusColumn.tsx
│   │   │   └── Stats.tsx
│   │   ├── /resume                # Resume components
│   │   │   ├── ResumeUpload.tsx
│   │   │   ├── ResumePreview.tsx
│   │   │   ├── ResumeEditor.tsx
│   │   │   └── TailoringPanel.tsx
│   │   ├── /jobs                  # Job components
│   │   │   ├── JobForm.tsx
│   │   │   ├── JobDetail.tsx
│   │   │   └── JobList.tsx
│   │   ├── /interview             # Interview components
│   │   │   ├── InterviewForm.tsx
│   │   │   ├── MockInterviewChat.tsx
│   │   │   └── InterviewFeedback.tsx
│   │   └── /common                # Shared components
│   │       ├── LoadingSpinner.tsx
│   │       ├── ErrorBoundary.tsx
│   │       └── Toast.tsx
│   ├── /pages
│   │   ├── index.tsx              # Landing page
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   ├── dashboard.tsx          # Main dashboard
│   │   ├── profile.tsx            # User profile
│   │   ├── resumes.tsx            # Resume management
│   │   ├── jobs/
│   │   │   ├── index.tsx          # Job list
│   │   │   ├── [id].tsx           # Job detail
│   │   │   └── new.tsx            # Add job
│   │   └── interviews/
│   │       ├── [id].tsx           # Interview detail
│   │       └── mock/[id].tsx      # Mock interview
│   ├── /hooks                     # Custom hooks
│   │   ├── useAuth.ts
│   │   ├── useJobs.ts
│   │   ├── useResumes.ts
│   │   ├── useAI.ts
│   │   └── useDebounce.ts
│   ├── /services                  # API services
│   │   ├── api.ts                 # Axios/Fetch setup
│   │   ├── auth.service.ts
│   │   ├── user.service.ts
│   │   ├── job.service.ts
│   │   ├── resume.service.ts
│   │   ├── ai.service.ts
│   │   └── application.service.ts
│   ├── /store                     # State management
│   │   ├── authStore.ts
│   │   ├── jobStore.ts
│   │   └── uiStore.ts
│   ├── /lib                       # Utilities
│   │   ├── utils.ts
│   │   ├── validators.ts
│   │   └── constants.ts
│   ├── /types                     # TypeScript types
│   │   ├── user.types.ts
│   │   ├── job.types.ts
│   │   ├── resume.types.ts
│   │   └── api.types.ts
│   ├── App.tsx
│   └── main.tsx
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── vite.config.ts
```

### 2.2 Key Frontend Features

**State Management (Zustand):**
```typescript
// store/authStore.ts
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (data: RegisterData) => Promise<void>;
}

// store/jobStore.ts
interface JobState {
  jobs: Job[];
  selectedJob: Job | null;
  filters: JobFilters;
  fetchJobs: () => Promise<void>;
  addJob: (job: CreateJobDto) => Promise<void>;
  updateJobStatus: (id: string, status: JobStatus) => Promise<void>;
  deleteJob: (id: string) => Promise<void>;
}
```

**API Client Setup:**
```typescript
// services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.VITE_API_URL || '/api',
  timeout: 30000,
});

// Request interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

---

## 3. Backend Architecture (Claude CLI + Node.js)

### 3.1 Project Structure

```
/backend
├── /src
│   ├── /api                       # API layer
│   │   ├── /routes
│   │   │   ├── auth.routes.ts
│   │   │   ├── user.routes.ts
│   │   │   ├── job.routes.ts
│   │   │   ├── resume.routes.ts
│   │   │   ├── application.routes.ts
│   │   │   └── ai.routes.ts
│   │   ├── /middleware
│   │   │   ├── auth.middleware.ts
│   │   │   ├── validation.middleware.ts
│   │   │   ├── ratelimit.middleware.ts
│   │   │   └── error.middleware.ts
│   │   └── /validators
│   │       ├── user.validator.ts
│   │       └── job.validator.ts
│   ├── /services                  # Business logic
│   │   ├── auth.service.ts
│   │   ├── user.service.ts
│   │   ├── job.service.ts
│   │   ├── resume.service.ts
│   │   ├── application.service.ts
│   │   ├── email.service.ts
│   │   └── storage.service.ts
│   ├── /ai                        # AI agents
│   │   ├── /agents
│   │   │   ├── base.agent.ts
│   │   │   ├── resume-parser.agent.ts
│   │   │   ├── resume-tailor.agent.ts
│   │   │   ├── cover-letter.agent.ts
│   │   │   ├── interview-coach.agent.ts
│   │   │   ├── job-matching.agent.ts
│   │   │   ├── application.agent.ts
│   │   │   └── research.agent.ts
│   │   ├── /prompts
│   │   │   ├── resume-parser.prompt.ts
│   │   │   ├── resume-tailor.prompt.ts
│   │   │   └── ...
│   │   ├── /utils
│   │   │   ├── claude-client.ts
│   │   │   ├── prompt-builder.ts
│   │   │   └── response-parser.ts
│   │   └── orchestrator.ts
│   ├── /jobs                      # Background jobs
│   │   ├── /processors
│   │   │   ├── resume-parse.processor.ts
│   │   │   ├── job-discovery.processor.ts
│   │   │   └── email-notification.processor.ts
│   │   └── queue.config.ts
│   ├── /database
│   │   ├── /migrations
│   │   ├── /seeders
│   │   ├── schema.prisma
│   │   └── client.ts
│   ├── /utils
│   │   ├── logger.ts
│   │   ├── errors.ts
│   │   └── helpers.ts
│   ├── /types
│   │   ├── index.ts
│   │   └── express.d.ts
│   ├── /config
│   │   ├── index.ts
│   │   ├── database.config.ts
│   │   └── claude.config.ts
│   ├── app.ts                     # Express app setup
│   └── server.ts                  # Server entry point
├── /tests
│   ├── /unit
│   ├── /integration
│   └── /e2e
├── .env.example
├── .env.local
├── package.json
├── tsconfig.json
└── vercel.json                    # Vercel configuration
```

### 3.2 Key Backend Components

**Express App Setup:**
```typescript
// src/app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorMiddleware } from './api/middleware/error.middleware';
import routes from './api/routes';

const app = express();

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', routes);

// Error handling
app.use(errorMiddleware);

export default app;
```

**Prisma Schema:**
```prisma
// database/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id            String    @id @default(uuid())
  email         String    @unique
  passwordHash  String    @map("password_hash")
  name          String
  phone         String?
  location      String?
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")
  
  profile       UserProfile?
  resumes       Resume[]
  jobs          Job[]
  applications  Application[]
  interviews    Interview[]
  mockInterviews MockInterview[]

  @@map("users")
}

model UserProfile {
  id                String   @id @default(uuid())
  userId            String   @unique @map("user_id")
  headline          String?
  summary           String?  @db.Text
  targetRoles       String[] @map("target_roles")
  targetIndustries  String[] @map("target_industries")
  targetLocations   String[] @map("target_locations")
  salaryMin         Int?     @map("salary_min")
  salaryMax         Int?     @map("salary_max")
  yearsOfExperience Int      @map("years_of_experience")
  workAuthorization String   @map("work_authorization")
  noticePeriod      String   @map("notice_period")
  openToRemote      Boolean  @default(true) @map("open_to_remote")
  preferences       Json?
  createdAt         DateTime @default(now()) @map("created_at")
  updatedAt         DateTime @updatedAt @map("updated_at")
  
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  experiences       Experience[]
  educations        Education[]
  skills            Skill[]
  certifications    Certification[]

  @@map("user_profiles")
}

model Resume {
  id          String   @id @default(uuid())
  userId      String   @map("user_id")
  name        String
  isMaster    Boolean  @default(false) @map("is_master")
  fileUrl     String   @map("file_url")
  fileName    String   @map("file_name")
  parsedData  Json?    @map("parsed_data")
  version     Int      @default(1)
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  applications Application[]

  @@map("resumes")
}

model Job {
  id                  String   @id @default(uuid())
  userId              String   @map("user_id")
  companyName         String   @map("company_name")
  jobTitle            String   @map("job_title")
  jobDescription      String   @db.Text @map("job_description")
  jobUrl              String?  @map("job_url")
  location            String
  salaryRange         String?  @map("salary_range")
  jobType             JobType  @map("job_type")
  workMode            WorkMode @map("work_mode")
  status              JobStatus @default(INTERESTED)
  applicationDeadline DateTime? @map("application_deadline")
  notes               String?  @db.Text
  source              String   @default("manual")
  matchScore          Int?     @map("match_score")
  createdAt           DateTime @default(now()) @map("created_at")
  updatedAt           DateTime @updatedAt @map("updated_at")
  
  user                User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  applications        Application[]
  interviews          Interview[]
  documents           Document[]
  statusHistory       StatusChange[]

  @@map("jobs")
}

model Application {
  id                  String   @id @default(uuid())
  userId              String   @map("user_id")
  jobId               String   @map("job_id")
  resumeId            String   @map("resume_id")
  coverLetterId       String?  @map("cover_letter_id")
  appliedAt           DateTime @default(now()) @map("applied_at")
  applicationMethod   ApplicationMethod @map("application_method")
  confirmationReceived Boolean @default(false) @map("confirmation_received")
  applicationData     Json?    @map("application_data")
  status              ApplicationStatus @default(SUBMITTED)
  
  user                User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  job                 Job      @relation(fields: [jobId], references: [id], onDelete: Cascade)
  resume              Resume   @relation(fields: [resumeId], references: [id])

  @@map("applications")
}

model Interview {
  id                  String   @id @default(uuid())
  jobId               String   @map("job_id")
  interviewDate       DateTime @map("interview_date")
  interviewType       InterviewType @map("interview_type")
  interviewerName     String?  @map("interviewer_name")
  interviewerTitle    String?  @map("interviewer_title")
  interviewerLinkedIn String?  @map("interviewer_linkedin")
  interviewerResearch String?  @db.Text @map("interviewer_research")
  duration            Int?
  location            String?
  meetingLink         String?  @map("meeting_link")
  notes               String?  @db.Text
  preparationMaterials Json?   @map("preparation_materials")
  mockInterviewId     String?  @map("mock_interview_id")
  outcome             InterviewOutcome?
  feedback            String?  @db.Text
  createdAt           DateTime @default(now()) @map("created_at")
  updatedAt           DateTime @updatedAt @map("updated_at")
  
  job                 Job      @relation(fields: [jobId], references: [id], onDelete: Cascade)
  userId              String   @map("user_id")
  user                User     @relation(fields: [userId], references: [id])

  @@map("interviews")
}

model MockInterview {
  id          String   @id @default(uuid())
  userId      String   @map("user_id")
  jobId       String?  @map("job_id")
  interviewId String?  @map("interview_id")
  transcript  Json
  feedback    String   @db.Text
  score       Int
  strengths   String[]
  improvements String[]
  conductedAt DateTime @default(now()) @map("conducted_at")
  
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("mock_interviews")
}

// Supporting models
model Experience {
  id          String   @id @default(uuid())
  profileId   String   @map("profile_id")
  company     String
  title       String
  location    String?
  startDate   DateTime @map("start_date")
  endDate     DateTime? @map("end_date")
  isCurrent   Boolean  @default(false) @map("is_current")
  description String   @db.Text
  achievements String[] @default([])
  
  profile     UserProfile @relation(fields: [profileId], references: [id], onDelete: Cascade)

  @@map("experiences")
}

model Education {
  id          String   @id @default(uuid())
  profileId   String   @map("profile_id")
  institution String
  degree      String
  field       String
  location    String?
  startDate   DateTime @map("start_date")
  endDate     DateTime? @map("end_date")
  gpa         Float?
  description String?  @db.Text
  
  profile     UserProfile @relation(fields: [profileId], references: [id], onDelete: Cascade)

  @@map("educations")
}

model Skill {
  id          String   @id @default(uuid())
  profileId   String   @map("profile_id")
  name        String
  category    String?
  proficiency String?
  yearsOfExperience Int? @map("years_of_experience")
  
  profile     UserProfile @relation(fields: [profileId], references: [id], onDelete: Cascade)

  @@map("skills")
}

model Certification {
  id          String   @id @default(uuid())
  profileId   String   @map("profile_id")
  name        String
  issuer      String
  issueDate   DateTime @map("issue_date")
  expiryDate  DateTime? @map("expiry_date")
  credentialId String? @map("credential_id")
  credentialUrl String? @map("credential_url")
  
  profile     UserProfile @relation(fields: [profileId], references: [id], onDelete: Cascade)

  @@map("certifications")
}

model Document {
  id          String   @id @default(uuid())
  userId      String   @map("user_id")
  jobId       String?  @map("job_id")
  type        DocumentType
  name        String
  fileUrl     String   @map("file_url")
  aiGenerated Boolean  @default(false) @map("ai_generated")
  content     String?  @db.Text
  metadata    Json?
  createdAt   DateTime @default(now()) @map("created_at")
  
  job         Job?     @relation(fields: [jobId], references: [id], onDelete: Cascade)

  @@map("documents")
}

model StatusChange {
  id          String   @id @default(uuid())
  jobId       String   @map("job_id")
  fromStatus  JobStatus @map("from_status")
  toStatus    JobStatus @map("to_status")
  changedAt   DateTime @default(now()) @map("changed_at")
  notes       String?  @db.Text
  
  job         Job      @relation(fields: [jobId], references: [id], onDelete: Cascade)

  @@map("status_changes")
}

// Enums
enum JobType {
  FULL_TIME
  PART_TIME
  CONTRACT
  INTERNSHIP
  TEMPORARY
}

enum WorkMode {
  REMOTE
  HYBRID
  ONSITE
}

enum JobStatus {
  INTERESTED
  APPLIED
  INTERVIEW_SCHEDULED
  INTERVIEW_COMPLETED
  OFFER_RECEIVED
  REJECTED
  ACCEPTED
  WITHDRAWN
}

enum ApplicationMethod {
  MANUAL
  AUTOMATED
}

enum ApplicationStatus {
  DRAFT
  SUBMITTED
  UNDER_REVIEW
  REJECTED
  ACCEPTED
}

enum InterviewType {
  PHONE
  VIDEO
  ONSITE
  TECHNICAL
  BEHAVIORAL
  PANEL
  FINAL
}

enum InterviewOutcome {
  PASSED
  FAILED
  PENDING
}

enum DocumentType {
  RESUME
  COVER_LETTER
  PORTFOLIO
  TRANSCRIPT
  REFERENCE
  OTHER
}
```

---

## 4. AI Agent Architecture

### 4.1 Base Agent Class

```typescript
// src/ai/agents/base.agent.ts
import Anthropic from '@anthropic-ai/sdk';

export abstract class BaseAgent {
  protected client: Anthropic;
  protected model: string = 'claude-sonnet-4-5-20250929';
  protected maxTokens: number = 4096;

  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  protected async callClaude(
    systemPrompt: string,
    userMessage: string,
    options?: {
      temperature?: number;
      maxTokens?: number;
      stopSequences?: string[];
    }
  ): Promise<string> {
    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: options?.maxTokens || this.maxTokens,
        temperature: options?.temperature || 1.0,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userMessage,
          },
        ],
        stop_sequences: options?.stopSequences,
      });

      return response.content[0].type === 'text'
        ? response.content[0].text
        : '';
    } catch (error) {
      console.error('Claude API Error:', error);
      throw new Error('Failed to get AI response');
    }
  }

  protected async callClaudeStreaming(
    systemPrompt: string,
    userMessage: string,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    const stream = await this.client.messages.stream({
      model: this.model,
      max_tokens: this.maxTokens,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    });

    for await (const chunk of stream) {
      if (
        chunk.type === 'content_block_delta' &&
        chunk.delta.type === 'text_delta'
      ) {
        onChunk(chunk.delta.text);
      }
    }
  }

  abstract execute(...args: any[]): Promise<any>;
}
```

### 4.2 Resume Parser Agent

```typescript
// src/ai/agents/resume-parser.agent.ts
import { BaseAgent } from './base.agent';
import { RESUME_PARSER_PROMPT } from '../prompts/resume-parser.prompt';

export class ResumeParserAgent extends BaseAgent {
  async execute(resumeText: string): Promise<ParsedResume> {
    const userMessage = `
Please parse the following resume and extract structured information:

${resumeText}
`;

    const response = await this.callClaude(
      RESUME_PARSER_PROMPT,
      userMessage,
      { temperature: 0.3 }
    );

    return this.parseResponse(response);
  }

  private parseResponse(response: string): ParsedResume {
    try {
      // Extract JSON from response
      const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }
      return JSON.parse(response);
    } catch (error) {
      throw new Error('Failed to parse resume response');
    }
  }
}

interface ParsedResume {
  personalInfo: {
    name: string;
    email: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    portfolio?: string;
  };
  summary?: string;
  experiences: Array<{
    company: string;
    title: string;
    location?: string;
    startDate: string;
    endDate?: string;
    isCurrent: boolean;
    description: string;
    achievements: string[];
  }>;
  educations: Array<{
    institution: string;
    degree: string;
    field: string;
    location?: string;
    startDate: string;
    endDate?: string;
    gpa?: number;
  }>;
  skills: Array<{
    name: string;
    category?: string;
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    date: string;
  }>;
}
```

### 4.3 Resume Tailoring Agent

```typescript
// src/ai/agents/resume-tailor.agent.ts
import { BaseAgent } from './base.agent';
import { RESUME_TAILOR_PROMPT } from '../prompts/resume-tailor.prompt';

export class ResumeTailorAgent extends BaseAgent {
  async execute(params: {
    resume: any;
    jobDescription: string;
    companyInfo?: string;
  }): Promise<TailoredResumeResult> {
    const userMessage = `
Job Description:
${params.jobDescription}

Company Information:
${params.companyInfo || 'Not provided'}

Current Resume:
${JSON.stringify(params.resume, null, 2)}

Please tailor this resume for the job posting.
`;

    const response = await this.callClaude(
      RESUME_TAILOR_PROMPT,
      userMessage,
      { temperature: 0.5, maxTokens: 8000 }
    );

    return this.parseResponse(response);
  }

  private parseResponse(response: string): TailoredResumeResult {
    // Parse the structured response
    // Extract tailored resume, changes, and match score
    return JSON.parse(response);
  }
}

interface TailoredResumeResult {
  tailoredResume: any;
  changes: Array<{
    section: string;
    original: string;
    modified: string;
    reason: string;
  }>;
  matchScore: number;
  keywordAlignment: {
    matched: string[];
    missing: string[];
  };
  recommendations: string[];
}
```

### 4.4 Interview Coach Agent

```typescript
// src/ai/agents/interview-coach.agent.ts
import { BaseAgent } from './base.agent';
import { INTERVIEW_COACH_PROMPT } from '../prompts/interview-coach.prompt';

export class InterviewCoachAgent extends BaseAgent {
  private conversationHistory: Array<{ role: string; content: string }> = [];

  async startInterview(params: {
    jobDescription: string;
    userBackground: any;
    interviewType: string;
  }): Promise<string> {
    this.conversationHistory = [];
    
    const userMessage = `
Start a ${params.interviewType} mock interview for:

Job Description:
${params.jobDescription}

Candidate Background:
${JSON.stringify(params.userBackground, null, 2)}

Begin the interview with an opening question.
`;

    const response = await this.callClaude(
      INTERVIEW_COACH_PROMPT,
      userMessage
    );

    this.conversationHistory.push(
      { role: 'user', content: userMessage },
      { role: 'assistant', content: response }
    );

    return response;
  }

  async respondToAnswer(userAnswer: string): Promise<InterviewResponse> {
    const conversationContext = this.formatConversation();
    
    const userMessage = `
${conversationContext}

Candidate's Answer:
${userAnswer}

Please evaluate the answer and provide:
1. Immediate feedback
2. The next question (or conclude if appropriate)
3. Score for this answer (1-10)
`;

    const response = await this.callClaude(
      INTERVIEW_COACH_PROMPT,
      userMessage
    );

    this.conversationHistory.push(
      { role: 'user', content: userAnswer },
      { role: 'assistant', content: response }
    );

    return this.parseInterviewResponse(response);
  }

  async concludeInterview(): Promise<InterviewFeedback> {
    const conversationContext = this.formatConversation();
    
    const userMessage = `
${conversationContext}

Please provide comprehensive feedback on the entire interview including:
1. Overall performance score
2. Strengths demonstrated
3. Areas for improvement
4. Specific advice for each weak answer
5. General interview tips
`;

    const response = await this.callClaude(
      INTERVIEW_COACH_PROMPT,
      userMessage,
      { maxTokens: 6000 }
    );

    return this.parseInterviewFeedback(response);
  }

  private formatConversation(): string {
    return this.conversationHistory
      .map((msg, idx) => `${msg.role}: ${msg.content}`)
      .join('\n\n');
  }

  private parseInterviewResponse(response: string): InterviewResponse {
    // Parse structured response
    return JSON.parse(response);
  }

  private parseInterviewFeedback(response: string): InterviewFeedback {
    return JSON.parse(response);
  }
}

interface InterviewResponse {
  feedback: string;
  nextQuestion?: string;
  score: number;
  isComplete: boolean;
}

interface InterviewFeedback {
  overallScore: number;
  strengths: string[];
  improvements: string[];
  detailedFeedback: Array<{
    question: string;
    answer: string;
    score: number;
    feedback: string;
  }>;
  generalAdvice: string[];
}
```

---

## 5. Deployment Architecture (Vercel)

### 5.1 Vercel Configuration

```json
// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/frontend/$1"
    }
  ],
  "env": {
    "DATABASE_URL": "@database-url",
    "ANTHROPIC_API_KEY": "@anthropic-api-key",
    "JWT_SECRET": "@jwt-secret",
    "REDIS_URL": "@redis-url"
  },
  "functions": {
    "api/**/*.ts": {
      "maxDuration": 60,
      "memory": 1024
    }
  }
}
```

### 5.2 API Routes (Serverless Functions)

```
/api
├── auth
│   ├── register.ts
│   ├── login.ts
│   └── refresh.ts
├── users
│   ├── profile.ts
│   └── [id].ts
├── resumes
│   ├── index.ts
│   ├── [id].ts
│   ├── upload.ts
│   └── parse.ts
├── jobs
│   ├── index.ts
│   ├── [id].ts
│   └── stats.ts
├── ai
│   ├── tailor-resume.ts
│   ├── generate-cover-letter.ts
│   ├── prepare-interview.ts
│   └── mock-interview
│       ├── start.ts
│       ├── respond.ts
│       └── [id]
│           └── results.ts
└── applications
    ├── index.ts
    └── [id].ts
```

Example serverless function:

```typescript
// api/ai/tailor-resume.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ResumeTailorAgent } from '../../src/ai/agents/resume-tailor.agent';
import { authenticate } from '../../src/api/middleware/auth.middleware';
import { prisma } from '../../src/database/client';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Authenticate user
    const user = await authenticate(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { resumeId, jobId } = req.body;

    // Fetch resume and job
    const [resume, job] = await Promise.all([
      prisma.resume.findUnique({ where: { id: resumeId } }),
      prisma.job.findUnique({ where: { id: jobId } }),
    ]);

    if (!resume || !job) {
      return res.status(404).json({ error: 'Resume or job not found' });
    }

    // Call AI agent
    const agent = new ResumeTailorAgent();
    const result = await agent.execute({
      resume: resume.parsedData,
      jobDescription: job.jobDescription,
      companyInfo: job.companyName,
    });

    // Save tailored resume
    const tailoredResume = await prisma.resume.create({
      data: {
        userId: user.id,
        name: `${job.companyName} - ${job.jobTitle}`,
        isMaster: false,
        fileUrl: '', // Generate PDF from result
        fileName: `tailored-${Date.now()}.pdf`,
        parsedData: result.tailoredResume,
        version: resume.version + 1,
      },
    });

    return res.status(200).json({
      resume: tailoredResume,
      changes: result.changes,
      matchScore: result.matchScore,
      recommendations: result.recommendations,
    });
  } catch (error) {
    console.error('Error tailoring resume:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
```

---

## 6. Integration & Data Flow

### 6.1 Resume Tailoring Flow

```
User → Frontend → API Gateway → Resume Tailor Service
                                        ↓
                              Resume Tailor Agent
                                        ↓
                                 Claude API
                                        ↓
                        [Tailored Resume Generated]
                                        ↓
                              Save to Database
                                        ↓
                          Return to Frontend → User
```

### 6.2 Mock Interview Flow

```
User → Start Interview → Interview Coach Agent → Claude API
  ↓                                                    ↓
  ← ← ← ← ← First Question ← ← ← ← ← ← ← ← ← ← ← ← ←
  ↓
User Answers → Interview Coach Agent → Claude API
  ↓                                         ↓
  ← ← ← Feedback + Next Question ← ← ← ← ←
  ↓
[Repeat until complete]
  ↓
End Interview → Generate Comprehensive Feedback → User
```

---

## 7. Security & Performance

### 7.1 Security Measures

1. **Authentication:**
   - JWT with httpOnly cookies
   - Refresh token rotation
   - Rate limiting per user

2. **Data Protection:**
   - Encrypt sensitive data at rest
   - HTTPS only
   - Secure file upload with validation

3. **API Security:**
   - Input validation (Zod)
   - SQL injection prevention (Prisma)
   - CSRF protection
   - CORS configuration

### 7.2 Performance Optimization

1. **Caching:**
   - Redis for session data
   - API response caching
   - CDN for static assets

2. **Database:**
   - Connection pooling
   - Indexed queries
   - Pagination for large datasets

3. **AI Optimization:**
   - Queue long-running AI tasks
   - Cache common prompts
   - Streaming responses for interviews

---

## 8. Monitoring & Observability

### 8.1 Logging
- Structured logging (Winston/Pino)
- Request/response logging
- AI interaction logging
- Error tracking (Sentry)

### 8.2 Metrics
- API response times
- AI agent performance
- User engagement metrics
- Conversion funnel tracking

### 8.3 Alerting
- Error rate thresholds
- API latency alerts
- Database connection issues
- AI API failures

---

## 9. Scalability Considerations

1. **Horizontal Scaling:**
   - Stateless API design
   - Load balancing (Vercel handles this)
   - Database read replicas

2. **Vertical Scaling:**
   - Optimize AI prompts
   - Efficient database queries
   - Resource limits per function

3. **Cost Optimization:**
   - Cache AI responses
   - Batch operations
   - Efficient token usage

---

## 10. Future Enhancements

1. **Real-time Features:**
   - WebSocket for live mock interviews
   - Real-time collaboration
   - Live notifications

2. **Advanced AI:**
   - Multi-agent collaboration
   - Fine-tuned models
   - Voice interview practice

3. **Integrations:**
   - LinkedIn API
   - ATS integrations
   - Calendar sync
   - Email automation

---

This architecture provides a solid foundation that:
- ✅ Scales with Vercel's infrastructure
- ✅ Leverages Claude AI effectively
- ✅ Maintains security and privacy
- ✅ Supports rapid iteration
- ✅ Enables future feature additions