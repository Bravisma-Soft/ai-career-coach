# AI Career Coach - Product Requirements Document

## 1. Executive Summary

**Product Name:** AI Career Coach  
**Version:** 1.0  
**Date:** October 2025  
**Owner:** Product Team

### Vision
Build an AI-powered career management platform that serves as a comprehensive job search companion, guiding users from resume optimization through job application, interview preparation, and offer negotiation.

### Mission
Democratize access to professional career coaching by leveraging Claude AI to provide personalized, intelligent guidance throughout the entire job search journey.

---

## 2. Product Goals & Success Metrics

### Primary Goals
1. **MVP (Phase 1):** Launch core job tracking and AI-assisted application features
2. **V1 (Phase 2):** Implement automated job discovery and application
3. **V2 (Phase 3):** Build two-sided marketplace connecting job seekers and employers

### Success Metrics
- **User Acquisition:** 10,000+ users in first 6 months
- **Engagement:** 70%+ weekly active users
- **Application Success:** 3x improvement in interview callback rate
- **Time to Hire:** Reduce average job search time by 40%
- **User Satisfaction:** NPS score > 50

---

## 3. User Personas

### Primary Persona: Career Transition Sarah
- **Age:** 28-35
- **Background:** Mid-level professional seeking career change
- **Pain Points:** 
  - Overwhelmed by job search process
  - Unsure how to tailor resume for different roles
  - Anxious about interviews
  - Losing track of multiple applications
- **Goals:** 
  - Land role in new industry within 3 months
  - Get more interview callbacks
  - Feel confident in interviews

### Secondary Persona: Recent Graduate Alex
- **Age:** 22-25
- **Background:** Fresh graduate entering job market
- **Pain Points:**
  - No experience with professional job search
  - Limited interview experience
  - Doesn't know what roles to apply for
- **Goals:**
  - Understand job search process
  - Build professional resume
  - Practice interview skills

---

## 4. Feature Specifications

## MVP (Phase 1) - Core Features

### 4.1 User Authentication & Profile
**Priority:** P0

**Features:**
- Email/password registration and login
- OAuth integration (Google, LinkedIn)
- User profile creation with:
  - Personal information
  - Work experience
  - Education
  - Skills and certifications
  - Career preferences (industries, roles, locations, salary range)

**Acceptance Criteria:**
- User can create account in < 2 minutes
- Profile data persists across sessions
- Secure password storage (bcrypt/argon2)

---

### 4.2 Resume Management
**Priority:** P0

**Features:**
- Resume upload (PDF, DOCX, TXT)
- Resume parsing and extraction to structured data
- Master resume storage
- Version control for different resume iterations
- Resume preview and download

**AI Agent: Resume Parser Agent**
- Extract: name, contact, experience, education, skills
- Identify: job titles, companies, dates, achievements
- Structure data into normalized format

**Acceptance Criteria:**
- Parse 95%+ of common resume formats
- Extract all key sections accurately
- Store structured data in database

---

### 4.3 Job Tracking Dashboard
**Priority:** P0

**Features:**
- Manual job entry with fields:
  - Company name
  - Job title
  - Job description
  - Application deadline
  - Job URL
  - Notes
- Kanban-style board with stages:
  - Interested
  - Applied
  - Interview Scheduled
  - Interview Completed
  - Offer Received
  - Rejected
  - Accepted
- Drag-and-drop status updates
- Timeline view of all activities
- Search and filter capabilities

**Acceptance Criteria:**
- Add new job in < 30 seconds
- Drag-drop updates stage instantly
- Dashboard loads in < 2 seconds

---

### 4.4 AI Resume Tailoring
**Priority:** P0

**Features:**
- Job description analysis
- Resume gap identification
- Keyword optimization suggestions
- Experience highlighting recommendations
- Achievement quantification suggestions
- Generate tailored resume version
- Side-by-side comparison (original vs. tailored)

**AI Agent: Resume Tailoring Agent**
```
Input: 
- Master resume
- Job description
- Company information

Process:
1. Analyze job requirements and keywords
2. Match user experience to requirements
3. Identify gaps and suggest emphasis areas
4. Rewrite bullet points for relevance
5. Optimize keyword density
6. Maintain truthfulness (no fabrication)

Output:
- Tailored resume
- Change explanation
- Match score (1-100)
```

**Acceptance Criteria:**
- Generate tailored resume in < 30 seconds
- Match score accuracy > 85%
- Maintain user's original experience truthfully

---

### 4.5 AI Cover Letter Generation
**Priority:** P0

**Features:**
- Company research integration
- Personalized cover letter generation
- Multiple tone options (professional, enthusiastic, formal)
- Edit and refinement capabilities
- Template library
- Save and version drafts

**AI Agent: Cover Letter Agent**
```
Input:
- User profile and resume
- Job description
- Company information
- User's motivation/notes

Process:
1. Research company culture and values
2. Identify key job requirements
3. Match user strengths to requirements
4. Generate personalized narrative
5. Include specific examples
6. Optimize for ATS and human readers

Output:
- Draft cover letter (3-4 paragraphs)
- Personalization highlights
- Tone and style indicators
```

**Acceptance Criteria:**
- Generate cover letter in < 45 seconds
- Include 3+ specific user achievements
- Personalize with company details

---

### 4.6 Interview Preparation
**Priority:** P0

**Features:**
- Interview detail logging (date, time, type, interviewer)
- Interviewer research and background
- Common interview questions for role/company
- AI mock interview sessions
- Response evaluation and feedback
- STAR method coaching
- Question bank for candidate to ask

**AI Agent: Interview Coach Agent**
```
Input:
- Job description
- Company information
- Interviewer profile (if available)
- User background

Process:
1. Research interviewer on LinkedIn, company site
2. Generate relevant interview questions
3. Conduct mock interview conversation
4. Evaluate responses for:
   - Clarity and structure
   - Relevance to question
   - Specific examples
   - STAR format adherence
5. Provide actionable feedback

Output:
- Interviewer background summary
- 15-20 likely interview questions
- Mock interview transcript
- Performance feedback
- Improvement suggestions
```

**Acceptance Criteria:**
- Generate interview prep in < 2 minutes
- Provide specific, actionable feedback
- Cover behavioral, technical, and cultural fit questions

---

## V1 (Phase 2) - Automation Features

### 4.7 Automated Job Discovery
**Priority:** P1

**Features:**
- Integration with major job boards:
  - LinkedIn Jobs
  - Indeed
  - Glassdoor
  - Monster
  - Company career pages
- AI-powered job matching
- Daily job digest emails
- Job recommendation feed
- Save for later functionality
- Automatic deduplication

**AI Agent: Job Matching Agent**
```
Input:
- User profile and preferences
- Master resume
- Past application history
- Job postings from various sources

Process:
1. Scrape/API integration with job boards
2. Normalize job data across sources
3. Calculate match score based on:
   - Skills alignment
   - Experience level
   - Location fit
   - Salary range
   - Industry preference
   - Career trajectory
4. Learn from user feedback (applied/dismissed)
5. Rank and recommend jobs

Output:
- Scored and ranked job list
- Match explanation
- Personalized recommendations
```

**Acceptance Criteria:**
- Discover 50+ relevant jobs daily
- Match accuracy > 80% (user applies or saves)
- Zero duplicate postings

---

### 4.8 Automated Application Submission
**Priority:** P1

**Features:**
- Pre-filled application data from user profile
- Question bank for common application questions
- Auto-fill capability for web forms
- Application review before submission
- One-click apply for supported platforms
- Application confirmation tracking
- Follow-up email automation

**AI Agent: Application Agent**
```
Input:
- User profile data
- Tailored resume
- Cover letter
- Job application form fields

Process:
1. Parse application form fields
2. Map user data to form fields
3. Handle common questions from question bank:
   - Eligibility questions
   - Demographic information
   - Compensation expectations
   - Start date availability
   - Work authorization
4. Fill out form programmatically
5. Present for user review
6. Submit on user approval

Output:
- Completed application
- Submission confirmation
- Application record in tracking system
```

**Acceptance Criteria:**
- Auto-fill 90%+ of application fields
- Complete application in < 2 minutes (vs. 15-20 mins manual)
- User review and approval required before submission

---

## V2 (Phase 3) - Marketplace Features

### 4.9 Employer Dashboard
**Priority:** P2

**Features:**
- Company account creation
- Job requisition posting
- Applicant tracking system (ATS)
- Candidate pipeline management
- Interview scheduling
- Team collaboration tools
- Analytics and reporting
- Subscription management

**Acceptance Criteria:**
- Post job in < 5 minutes
- Manage 100+ applicants efficiently
- Integrate with existing ATS systems

---

### 4.10 Enhanced Matching
**Priority:** P2

**Features:**
- Two-way matching (employers find candidates)
- Passive candidate profiles
- Skills assessments
- Video interview integration
- Reference checking
- Offer management
- E-signature integration

---

## 5. AI Agent Architecture

### Agent System Design

**Core Agents:**

1. **Resume Parser Agent**
   - Role: Extract structured data from documents
   - Model: Claude Sonnet 4.5
   - Context: 20K tokens (resume content)

2. **Resume Tailoring Agent**
   - Role: Optimize resume for specific job
   - Model: Claude Sonnet 4.5
   - Context: 50K tokens (resume + job description + company info)

3. **Cover Letter Agent**
   - Role: Generate personalized cover letters
   - Model: Claude Sonnet 4.5
   - Context: 40K tokens (user profile + job description + company research)

4. **Interview Coach Agent**
   - Role: Conduct mock interviews and provide feedback
   - Model: Claude Sonnet 4.5 (conversational)
   - Context: 100K tokens (conversation history + user background)

5. **Job Matching Agent**
   - Role: Find and rank relevant jobs
   - Model: Claude Sonnet 4.5
   - Context: 30K tokens (user profile + job postings)

6. **Application Agent**
   - Role: Complete job applications
   - Model: Claude Sonnet 4.5
   - Context: 25K tokens (user data + form fields)

7. **Research Agent**
   - Role: Gather company and interviewer information
   - Model: Claude Sonnet 4.5 with web search
   - Context: 60K tokens (search results + synthesis)

**Agent Communication Pattern:**
- Event-driven architecture
- Message queue for async processing
- Shared context through database
- Result caching for efficiency

---

## 6. Technical Architecture

### 6.1 Frontend (Lovable)
- **Framework:** React + TypeScript
- **Styling:** Tailwind CSS
- **State Management:** React Context/Zustand
- **Forms:** React Hook Form + Zod validation
- **UI Components:** shadcn/ui
- **File Upload:** React Dropzone
- **Drag & Drop:** dnd-kit
- **API Client:** Axios/Fetch with React Query

### 6.2 Backend (Claude CLI + Node.js)
- **Runtime:** Node.js 20+
- **Framework:** Express.js or Fastify
- **Language:** TypeScript
- **AI Integration:** Claude API (Anthropic)
- **Queue:** BullMQ + Redis
- **Cron Jobs:** node-cron
- **File Storage:** AWS S3 or Vercel Blob
- **Database ORM:** Prisma

### 6.3 Database
- **Primary DB:** PostgreSQL (Vercel Postgres)
- **Cache:** Redis (Upstash)
- **Vector Store:** Pinecone (for semantic search)

### 6.4 Infrastructure
- **Hosting:** Vercel (frontend + serverless functions)
- **CDN:** Vercel Edge Network
- **Auth:** NextAuth.js or Clerk
- **Analytics:** Vercel Analytics + PostHog
- **Monitoring:** Sentry
- **Logging:** Axiom or Vercel Logs

---

## 7. Data Models

### 7.1 Core Entities

```typescript
// User
User {
  id: string (UUID)
  email: string (unique)
  passwordHash: string
  name: string
  phone?: string
  location: string
  createdAt: timestamp
  updatedAt: timestamp
  profile: UserProfile
  resumes: Resume[]
  jobs: Job[]
  applications: Application[]
}

// UserProfile
UserProfile {
  userId: string (FK)
  headline: string
  summary: string
  targetRoles: string[]
  targetIndustries: string[]
  targetLocations: string[]
  salaryMin?: number
  salaryMax?: number
  yearsOfExperience: number
  workAuthorization: string
  noticePeriod: string
  openToRemote: boolean
  preferences: JSON
  experiences: Experience[]
  educations: Education[]
  skills: Skill[]
  certifications: Certification[]
}

// Resume
Resume {
  id: string (UUID)
  userId: string (FK)
  name: string
  isMaster: boolean
  fileUrl: string
  fileName: string
  parsedData: JSON
  version: number
  createdAt: timestamp
  updatedAt: timestamp
}

// Job
Job {
  id: string (UUID)
  userId: string (FK)
  companyName: string
  jobTitle: string
  jobDescription: text
  jobUrl?: string
  location: string
  salaryRange?: string
  jobType: enum (full-time, part-time, contract)
  workMode: enum (remote, hybrid, onsite)
  status: enum (interested, applied, interview, offer, rejected, accepted)
  applicationDeadline?: date
  notes: text
  source: string
  matchScore?: number
  createdAt: timestamp
  updatedAt: timestamp
  statusHistory: StatusChange[]
  interviews: Interview[]
  documents: Document[]
}

// Application
Application {
  id: string (UUID)
  userId: string (FK)
  jobId: string (FK)
  resumeId: string (FK)
  coverLetterId?: string (FK)
  appliedAt: timestamp
  applicationMethod: enum (manual, automated)
  confirmationReceived: boolean
  applicationData: JSON
  status: enum (draft, submitted, under_review, rejected)
}

// Interview
Interview {
  id: string (UUID)
  jobId: string (FK)
  interviewDate: timestamp
  interviewType: enum (phone, video, onsite, technical)
  interviewerName?: string
  interviewerTitle?: string
  interviewerLinkedIn?: string
  interviewerResearch: text
  duration: number (minutes)
  location?: string
  meetingLink?: string
  notes: text
  preparationMaterials: JSON
  mockInterviewId?: string
  outcome?: enum (passed, failed, pending)
  feedback?: text
}

// Document
Document {
  id: string (UUID)
  userId: string (FK)
  jobId?: string (FK)
  type: enum (resume, cover_letter, portfolio, other)
  name: string
  fileUrl: string
  aiGenerated: boolean
  content: text
  metadata: JSON
  createdAt: timestamp
}

// MockInterview
MockInterview {
  id: string (UUID)
  userId: string (FK)
  jobId?: string (FK)
  interviewId?: string (FK)
  transcript: JSON (conversation history)
  feedback: text
  score: number
  strengths: string[]
  improvements: string[]
  conductedAt: timestamp
}
```

---

## 8. API Specifications

### 8.1 Authentication

```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
POST /api/auth/forgot-password
POST /api/auth/reset-password
```

### 8.2 User Profile

```
GET    /api/profile
PUT    /api/profile
POST   /api/profile/experience
PUT    /api/profile/experience/:id
DELETE /api/profile/experience/:id
POST   /api/profile/education
PUT    /api/profile/education/:id
DELETE /api/profile/education/:id
```

### 8.3 Resume Management

```
POST   /api/resumes/upload
GET    /api/resumes
GET    /api/resumes/:id
PUT    /api/resumes/:id
DELETE /api/resumes/:id
POST   /api/resumes/:id/parse
GET    /api/resumes/:id/download
```

### 8.4 Job Tracking

```
GET    /api/jobs
POST   /api/jobs
GET    /api/jobs/:id
PUT    /api/jobs/:id
DELETE /api/jobs/:id
PUT    /api/jobs/:id/status
GET    /api/jobs/stats
```

### 8.5 AI Services

```
POST   /api/ai/tailor-resume
  Body: { resumeId, jobId }
  Response: { tailoredResume, changes[], matchScore }

POST   /api/ai/generate-cover-letter
  Body: { resumeId, jobId, tone }
  Response: { coverLetter, highlights[] }

POST   /api/ai/prepare-interview
  Body: { jobId, interviewId }
  Response: { interviewerResearch, questions[], tips[] }

POST   /api/ai/mock-interview/start
  Body: { jobId, interviewType }
  Response: { sessionId, firstQuestion }

POST   /api/ai/mock-interview/respond
  Body: { sessionId, userResponse }
  Response: { feedback, nextQuestion, isComplete }

GET    /api/ai/mock-interview/:id/results
  Response: { transcript, overallFeedback, score }

POST   /api/ai/discover-jobs (V1)
  Body: { preferences }
  Response: { jobs[], count }

POST   /api/ai/apply-job (V1)
  Body: { jobId, applicationData }
  Response: { status, confirmationId }
```

### 8.6 Applications

```
GET    /api/applications
POST   /api/applications
GET    /api/applications/:id
PUT    /api/applications/:id
DELETE /api/applications/:id
```

---

## 9. Security & Privacy

### 9.1 Data Protection
- End-to-end encryption for sensitive documents
- GDPR and CCPA compliance
- Data retention policies (delete after 2 years inactive)
- Right to be forgotten implementation
- Regular security audits

### 9.2 Authentication & Authorization
- JWT with refresh tokens
- Rate limiting on all endpoints
- Role-based access control (RBAC)
- OAuth 2.0 for third-party integrations
- Multi-factor authentication (optional)

### 9.3 API Security
- API key rotation
- Request signing
- CORS configuration
- Input validation and sanitization
- SQL injection prevention
- XSS protection

### 9.4 AI Safety
- Content filtering on AI outputs
- No personally identifiable information in prompts
- Audit logs for all AI interactions
- User consent for AI features
- Transparency in AI-generated content

---

## 10. Compliance

### 10.1 Legal Requirements
- Terms of Service
- Privacy Policy
- Cookie Policy
- GDPR consent management
- Data Processing Agreement (DPA)
- Accessibility compliance (WCAG 2.1 AA)

### 10.2 AI Ethics
- No fabrication of experience or credentials
- Transparent AI assistance disclosure
- User maintains final control over all content
- No bias in job recommendations
- Fair and equal access to features

---

## 11. Monetization Strategy

### Phase 1 (MVP)
- Free tier with limited features:
  - 5 resume versions
  - 10 job applications/month
  - Basic interview prep
- Premium tier ($29/month):
  - Unlimited resume versions
  - Unlimited applications
  - Advanced interview coaching
  - Priority support

### Phase 2 (V1)
- Professional tier ($49/month):
  - All Premium features
  - Automated job discovery
  - Auto-apply to 50 jobs/month
  - Career analytics

### Phase 3 (V2)
- Employer plans:
  - Starter: $299/month (5 job postings)
  - Growth: $599/month (20 job postings)
  - Enterprise: Custom pricing

---

## 12. Development Phases

### Phase 1: MVP (8-10 weeks)
**Week 1-2:** Setup & Infrastructure
- Project setup (Lovable, Claude CLI)
- Database schema
- Authentication system
- Basic UI components

**Week 3-4:** Core Features
- User profile management
- Resume upload and parsing
- Job tracking dashboard

**Week 5-6:** AI Integration
- Resume tailoring agent
- Cover letter generation agent
- API integration

**Week 7-8:** Interview Features
- Interview tracking
- Mock interview agent
- Interviewer research

**Week 9-10:** Testing & Launch
- End-to-end testing
- Bug fixes
- Beta launch
- User feedback collection

### Phase 2: V1 (6-8 weeks)
- Job discovery integration
- Automated application system
- Enhanced AI agents
- Performance optimization

### Phase 3: V2 (10-12 weeks)
- Employer dashboard
- ATS features
- Marketplace logic
- Payment integration

---

## 13. Success Criteria

### MVP Launch Criteria
✅ Users can create account and profile  
✅ Resume upload and parsing works for 95% of resumes  
✅ Job tracking dashboard is functional  
✅ AI can tailor resume with 85%+ accuracy  
✅ Cover letter generation is personalized  
✅ Mock interview provides actionable feedback  
✅ Page load times < 2 seconds  
✅ Mobile responsive design  
✅ Zero critical security vulnerabilities  

### V1 Launch Criteria
✅ Job discovery finds 50+ relevant jobs daily  
✅ Auto-apply works on 80%+ of job boards  
✅ Application time reduced by 70%  
✅ User satisfaction score > 4.5/5  

### V2 Launch Criteria
✅ 50+ employers on platform  
✅ 1000+ active job postings  
✅ Two-way matching accuracy > 75%  
✅ Employer retention rate > 80%  

---

## 14. Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| AI hallucination in resume/cover letter | High | Medium | Human review required; validation checks; user editing |
| Job board scraping blocked | High | Medium | Official API partnerships; multiple sources; fallback manual entry |
| Resume parsing errors | Medium | Medium | Manual override option; iterative improvement; user feedback |
| Scale/performance issues | Medium | Low | Caching strategy; queue system; database optimization |
| Privacy concerns | High | Low | Strong encryption; compliance; transparent policies |
| Competition from established players | Medium | High | Differentiate with AI quality; user experience; pricing |

---

## Appendix A: Tech Stack Summary

**Frontend:**
- Lovable (React + TypeScript)
- Tailwind CSS
- shadcn/ui components
- React Query
- React Hook Form + Zod

**Backend:**
- Node.js + TypeScript
- Express/Fastify
- Prisma ORM
- Claude API (Anthropic)
- BullMQ + Redis

**Database:**
- PostgreSQL (Vercel Postgres)
- Redis (Upstash)
- Pinecone (vector search)

**Infrastructure:**
- Vercel (hosting + serverless)
- AWS S3 / Vercel Blob (storage)
- NextAuth.js (authentication)
- Sentry (monitoring)

**AI:**
- Claude Sonnet 4.5 (primary)
- Claude Opus 4 (complex tasks)
- Embeddings for semantic search

---

## Appendix B: Glossary

- **ATS:** Applicant Tracking System
- **STAR:** Situation, Task, Action, Result (interview method)
- **PRD:** Product Requirements Document
- **MVP:** Minimum Viable Product
- **NPS:** Net Promoter Score
- **RBAC:** Role-Based Access Control
- **GDPR:** General Data Protection Regulation
- **CCPA:** California Consumer Privacy Act