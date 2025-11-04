# Database Schema Documentation

## Related Docs
- [Project Architecture](./project_architecture.md)
- [AI Agent Architecture](./ai_agent_architecture.md)
- [README.md](../README.md) - Documentation index

---

## Overview

The AI Career Coach platform uses **PostgreSQL** as its primary database with **Prisma** as the ORM. The schema is designed to support comprehensive career management, job tracking, and AI-powered coaching features.

### Database Configuration
- **Database**: PostgreSQL 15+
- **ORM**: Prisma 6.17.0
- **Location**: `backend/prisma/schema.prisma`
- **Migration Strategy**: Version-controlled migrations

---

## Entity Relationship Diagram

```
┌──────────────┐
│     User     │
└──────┬───────┘
       │
       ├─────────────────────────────────────────────────────┐
       │                                                     │
       ├──── Session (1:N)                                  │
       ├──── UserProfile (1:1)                              │
       │     └──── Experience (1:N)                         │
       │     └──── Education (1:N)                          │
       │     └──── Skill (1:N)                              │
       │     └──── Certification (1:N)                      │
       │                                                     │
       ├──── Resume (1:N)                                   │
       │                                                     │
       ├──── Job (1:N)                                      │
       │     ├──── Application (1:N) ────→ Resume          │
       │     ├──── Interview (1:N)                          │
       │     ├──── Document (1:N)                           │
       │     └──── StatusChange (1:N)                       │
       │                                                     │
       ├──── Application (1:N)                              │
       ├──── Interview (1:N)                                │
       ├──── MockInterview (1:N)                            │
       ├──── CareerGoal (1:N)                               │
       ├──── Assessment (1:N)                               │
       └──── Conversation (1:N)                             │
             └──── Message (1:N)                            │
```

---

## Enums

### UserRole
```prisma
enum UserRole {
  USER    // Regular user
  ADMIN   // Administrator
}
```

### UserStatus
```prisma
enum UserStatus {
  ACTIVE      // Active account
  INACTIVE    // Deactivated account
  SUSPENDED   // Temporarily suspended
}
```

### JobType
```prisma
enum JobType {
  FULL_TIME
  PART_TIME
  CONTRACT
  INTERNSHIP
  TEMPORARY
}
```

### WorkMode
```prisma
enum WorkMode {
  REMOTE
  HYBRID
  ONSITE
}
```

### JobStatus
```prisma
enum JobStatus {
  INTERESTED              // Saved for later
  APPLIED                 // Application submitted
  INTERVIEW_SCHEDULED     // Interview booked
  INTERVIEW_COMPLETED     // Interview done
  OFFER_RECEIVED          // Got an offer
  REJECTED                // Application rejected
  ACCEPTED                // Offer accepted
  WITHDRAWN               // Application withdrawn
}
```

### ApplicationMethod
```prisma
enum ApplicationMethod {
  MANUAL      // User applied manually
  AUTOMATED   // Auto-applied through platform
}
```

### ApplicationStatus
```prisma
enum ApplicationStatus {
  DRAFT           // Not yet submitted
  SUBMITTED       // Application sent
  UNDER_REVIEW    // Being reviewed
  REJECTED        // Application rejected
  ACCEPTED        // Application accepted
}
```

### InterviewType
```prisma
enum InterviewType {
  PHONE       // Phone screen
  VIDEO       // Video call
  ONSITE      // In-person
  TECHNICAL   // Technical interview
  BEHAVIORAL  // Behavioral interview
  PANEL       // Panel interview
  FINAL       // Final round
}
```

### InterviewOutcome
```prisma
enum InterviewOutcome {
  PASSED
  FAILED
  PENDING
}
```

### DocumentType
```prisma
enum DocumentType {
  RESUME
  COVER_LETTER
  PORTFOLIO
  TRANSCRIPT
  REFERENCE
  OTHER
}
```

### GoalStatus
```prisma
enum GoalStatus {
  NOT_STARTED
  IN_PROGRESS
  COMPLETED
  ABANDONED
}
```

### SkillLevel
```prisma
enum SkillLevel {
  BEGINNER
  INTERMEDIATE
  ADVANCED
  EXPERT
}
```

---

## Core Tables

### 1. User
**Purpose**: Core user authentication and account management

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (CUID) | Primary key |
| `email` | String (unique) | User email |
| `password` | String | Hashed password |
| `firstName` | String? | First name |
| `lastName` | String? | Last name |
| `role` | UserRole | User role (default: USER) |
| `status` | UserStatus | Account status (default: ACTIVE) |
| `emailVerified` | Boolean | Email verification status |
| `emailVerifiedAt` | DateTime? | Verification timestamp |
| `lastLoginAt` | DateTime? | Last login timestamp |
| `passwordResetToken` | String? | Password reset token |
| `passwordResetExpires` | DateTime? | Token expiry |
| `createdAt` | DateTime | Created timestamp |
| `updatedAt` | DateTime | Updated timestamp |

**Indexes**:
- `email` - Fast email lookups
- `status` - Filter by account status

**Relations**:
- `profile` → UserProfile (1:1)
- `sessions` → Session[] (1:N)
- `resumes` → Resume[] (1:N)
- `jobs` → Job[] (1:N)
- `applications` → Application[] (1:N)
- `interviews` → Interview[] (1:N)
- `mockInterviews` → MockInterview[] (1:N)
- `careerGoals` → CareerGoal[] (1:N)
- `assessments` → Assessment[] (1:N)
- `conversations` → Conversation[] (1:N)

---

### 2. Session
**Purpose**: Manage user sessions and refresh tokens

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (CUID) | Primary key |
| `userId` | String | Foreign key to User |
| `refreshToken` | String (unique) | JWT refresh token |
| `userAgent` | String? | Browser user agent |
| `ipAddress` | String? | Client IP address |
| `expiresAt` | DateTime | Token expiry |
| `createdAt` | DateTime | Created timestamp |

**Indexes**:
- `userId` - Filter by user
- `refreshToken` - Fast token lookups
- `expiresAt` - Cleanup expired sessions

**Relations**:
- `user` → User (N:1, cascade delete)

---

### 3. UserProfile
**Purpose**: Extended user profile and career preferences

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (CUID) | Primary key |
| `userId` | String (unique) | Foreign key to User |
| `phone` | String? | Phone number |
| `bio` | Text? | Professional bio |
| `location` | String? | General location |
| `city` | String? | City |
| `state` | String? | State/Province |
| `country` | String? | Country |
| `zipCode` | String? | Postal code |
| `linkedinUrl` | String? | LinkedIn profile URL |
| `githubUrl` | String? | GitHub profile URL |
| `portfolioUrl` | String? | Portfolio website |
| `websiteUrl` | String? | Personal website |
| `currentJobTitle` | String? | Current position |
| `currentCompany` | String? | Current employer |
| `yearsOfExperience` | Int? | Total years of experience |
| **Career Preferences** | | |
| `desiredJobTitle` | String? | Target job title |
| `desiredSalaryMin` | Int? | Minimum salary expectation |
| `desiredSalaryMax` | Int? | Maximum salary expectation |
| `desiredWorkMode` | WorkMode? | Preferred work mode |
| `desiredJobTypes` | String[] | Preferred job types |
| `willingToRelocate` | Boolean | Relocation willingness |
| `preferredLocations` | String[] | Preferred work locations |
| `availableStartDate` | DateTime? | Availability date |
| **Additional** | | |
| `profilePictureUrl` | String? | Avatar URL |
| `timezone` | String? | User timezone |
| `preferredLanguage` | String | UI language (default: "en") |
| `createdAt` | DateTime | Created timestamp |
| `updatedAt` | DateTime | Updated timestamp |

**Indexes**:
- `userId` - User profile lookups

**Relations**:
- `user` → User (1:1, cascade delete)
- `experiences` → Experience[] (1:N)
- `educations` → Education[] (1:N)
- `skills` → Skill[] (1:N)
- `certifications` → Certification[] (1:N)

---

### 4. Experience
**Purpose**: Work experience history

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (CUID) | Primary key |
| `userProfileId` | String | Foreign key to UserProfile |
| `company` | String | Company name |
| `position` | String | Job title |
| `description` | Text? | Job description |
| `location` | String? | Work location |
| `workMode` | WorkMode? | Remote/Hybrid/Onsite |
| `startDate` | DateTime | Start date |
| `endDate` | DateTime? | End date (null if current) |
| `isCurrent` | Boolean | Currently working here |
| `achievements` | String[] | Key achievements |
| `technologies` | String[] | Technologies used |
| `createdAt` | DateTime | Created timestamp |
| `updatedAt` | DateTime | Updated timestamp |

**Indexes**:
- `userProfileId` - Filter by user
- `isCurrent` - Find current position

**Relations**:
- `userProfile` → UserProfile (N:1, cascade delete)

---

### 5. Education
**Purpose**: Educational background

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (CUID) | Primary key |
| `userProfileId` | String | Foreign key to UserProfile |
| `institution` | String | School/University name |
| `degree` | String | Degree type |
| `fieldOfStudy` | String | Major/Field |
| `location` | String? | Institution location |
| `startDate` | DateTime | Start date |
| `endDate` | DateTime? | End date (null if current) |
| `isCurrent` | Boolean | Currently studying |
| `gpa` | Float? | Grade point average |
| `achievements` | String[] | Academic achievements |
| `coursework` | String[] | Relevant coursework |
| `createdAt` | DateTime | Created timestamp |
| `updatedAt` | DateTime | Updated timestamp |

**Indexes**:
- `userProfileId` - Filter by user
- `isCurrent` - Find current education

**Relations**:
- `userProfile` → UserProfile (N:1, cascade delete)

---

### 6. Skill
**Purpose**: Professional skills inventory

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (CUID) | Primary key |
| `userProfileId` | String | Foreign key to UserProfile |
| `name` | String | Skill name |
| `category` | String? | Skill category (e.g., "Programming") |
| `level` | SkillLevel | Proficiency level |
| `yearsOfExperience` | Int? | Years using skill |
| `endorsements` | Int | Number of endorsements |
| `createdAt` | DateTime | Created timestamp |
| `updatedAt` | DateTime | Updated timestamp |

**Indexes**:
- `userProfileId` - Filter by user
- `category` - Group by category

**Relations**:
- `userProfile` → UserProfile (N:1, cascade delete)

---

### 7. Certification
**Purpose**: Professional certifications

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (CUID) | Primary key |
| `userProfileId` | String | Foreign key to UserProfile |
| `name` | String | Certification name |
| `issuingOrganization` | String | Issuing authority |
| `issueDate` | DateTime | Issue date |
| `expiryDate` | DateTime? | Expiry date |
| `credentialId` | String? | Credential ID |
| `credentialUrl` | String? | Verification URL |
| `doesNotExpire` | Boolean | Lifetime certification |
| `createdAt` | DateTime | Created timestamp |
| `updatedAt` | DateTime | Updated timestamp |

**Indexes**:
- `userProfileId` - Filter by user

**Relations**:
- `userProfile` → UserProfile (N:1, cascade delete)

---

### 8. Resume
**Purpose**: Resume file management

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (CUID) | Primary key |
| `userId` | String | Foreign key to User |
| `title` | String | Resume title/version |
| `fileName` | String | Original file name |
| `fileUrl` | String | Storage URL |
| `fileSize` | Int | File size in bytes |
| `mimeType` | String | File MIME type |
| `isPrimary` | Boolean | Primary resume flag |
| **Parsed Content** | | |
| `rawText` | Text? | Extracted text |
| `parsedData` | Json? | Structured data |
| **Metadata** | | |
| `version` | Int | Version number |
| `isActive` | Boolean | Active status |
| `lastUsedAt` | DateTime? | Last usage timestamp |
| `createdAt` | DateTime | Created timestamp |
| `updatedAt` | DateTime | Updated timestamp |

**Indexes**:
- `userId` - Filter by user
- `isPrimary` - Find primary resume
- `isActive` - Filter active resumes

**Relations**:
- `user` → User (N:1, cascade delete)
- `applications` → Application[] (1:N)
- `analyses` → ResumeAnalysis[] (1:N)

---

### 9. ResumeAnalysis ⭐ NEW (Oct 28, 2025)
**Purpose**: AI-generated resume quality analysis and feedback

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (CUID) | Primary key |
| `resumeId` | String | Foreign key to Resume |
| `jobId` | String? | Foreign key to Job (optional) |
| **Overall Scores** | | |
| `overallScore` | Int | Overall quality (0-100) |
| `atsScore` | Int | ATS compatibility (0-100) |
| `readabilityScore` | Int | Readability (0-100) |
| **Section Scores** | | |
| `summaryScore` | Int? | Summary section score (0-100) |
| `experienceScore` | Int? | Experience section score (0-100) |
| `educationScore` | Int? | Education section score (0-100) |
| `skillsScore` | Int? | Skills section score (0-100) |
| **Analysis Results** | | |
| `strengths` | String[] | Key strengths (3-5 items) |
| `weaknesses` | String[] | Areas for improvement (3-5 items) |
| `sections` | Json | Detailed section analysis |
| `keywordAnalysis` | Json | Keyword matching analysis |
| `atsIssues` | String[] | ATS compatibility issues |
| `suggestions` | Json | Prioritized improvement suggestions |
| **Context** | | |
| `targetRole` | String? | Target role for analysis |
| `targetIndustry` | String? | Target industry |
| **Metadata** | | |
| `analysisMetadata` | Json? | Token usage, model info |
| `createdAt` | DateTime | Created timestamp |
| `updatedAt` | DateTime | Updated timestamp |

**Indexes**:
- `resumeId` - Filter by resume
- `jobId` - Filter by job
- `(resumeId, jobId)` - Unique constraint (composite key)

**Relations**:
- `resume` → Resume (N:1, cascade delete)
- `job` → Job (N:1, set null)

**Unique Constraint**:
- `@@unique([resumeId, jobId])` - One analysis per resume-job combination

**JSON Fields Structure**:

`sections` (Json):
```json
{
  "summary": {
    "score": 85,
    "feedback": "Clear and concise...",
    "issues": ["Too generic", "Missing key skills"]
  },
  "experience": { /* ... */ },
  "education": { /* ... */ },
  "skills": { /* ... */ }
}
```

`keywordAnalysis` (Json):
```json
{
  "targetRole": "Senior Software Engineer",
  "targetIndustry": "Technology",
  "matchedKeywords": ["React", "TypeScript", "AWS"],
  "missingKeywords": ["Docker", "Kubernetes"],
  "overusedWords": ["responsible for", "worked on"]
}
```

`suggestions` (Json):
```json
[
  {
    "section": "Experience",
    "priority": "high",
    "issue": "Lack of quantifiable achievements",
    "suggestion": "Add metrics and numbers...",
    "example": {
      "before": "Managed team...",
      "after": "Led team of 8 engineers..."
    },
    "impact": "Demonstrates leadership with measurable results"
  }
]
```

---

### 10. JobAnalysis ⭐ NEW (Nov 4, 2025)
**Purpose**: AI-generated job posting analysis with optional resume matching

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (CUID) | Primary key |
| `jobId` | String | Foreign key to Job |
| `resumeId` | String? | Foreign key to Resume (optional) |
| **Role Analysis** | | |
| `roleLevel` | String | entry/mid/senior/lead/executive |
| `keyResponsibilities` | Json | Array of main responsibilities (3-8) |
| `requiredSkills` | String[] | Must-have skills |
| `preferredSkills` | String[] | Nice-to-have skills |
| `redFlags` | String[] | Warning signs in posting |
| `highlights` | String[] | Positive indicators |
| **Match Analysis** (optional) | | |
| `overallMatch` | Float? | Overall match score (0-100) |
| `skillsMatch` | Float? | Skills alignment (0-100) |
| `experienceMatch` | Float? | Experience fit (0-100) |
| `matchReasons` | String[] | Why candidate is a good fit |
| `gaps` | String[] | Skills/experience gaps |
| `recommendations` | Json | Improvement recommendations |
| **Salary Insights** | | |
| `estimatedSalaryMin` | Float? | Estimated minimum salary |
| `estimatedSalaryMax` | Float? | Estimated maximum salary |
| `salaryCurrency` | String? | Currency (default: USD) |
| `marketComparison` | String | Above/at/below market |
| `salaryFactors` | String[] | Factors influencing salary |
| **Application Strategy** | | |
| `applicationTips` | Json | Actionable application tips (4-7) |
| **Context** | | |
| `analysisContext` | Json? | Additional context |
| **Metadata** | | |
| `analysisMetadata` | Json? | Token usage, model info |
| `createdAt` | DateTime | Created timestamp |
| `updatedAt` | DateTime | Updated timestamp |

**Indexes**:
- `jobId` - Filter by job
- `resumeId` - Filter by resume
- `(jobId, resumeId)` - Unique constraint (composite key)

**Relations**:
- `job` → Job (N:1, cascade delete)
- `resume` → Resume (N:1, cascade delete)

**Unique Constraint**:
- `@@unique([jobId, resumeId])` - One analysis per job (latest replaces previous)

**Note**: System automatically deletes previous analyses for a job when creating new analysis to maintain single source of truth.

**JSON Fields Structure**:

`keyResponsibilities` (Json):
```json
[
  "Lead technical architecture decisions",
  "Mentor junior developers",
  "Drive technical initiatives"
]
```

`recommendations` (Json):
```json
[
  "Highlight your system design experience",
  "Emphasize leadership and mentoring",
  "Consider taking a GraphQL course"
]
```

`applicationTips` (Json):
```json
[
  "Apply within 3 days - role posted recently",
  "Tailor resume to emphasize architecture experience",
  "Prepare for system design questions"
]
```

**Red Flags Detected**:
The analysis identifies concerning patterns such as:
- Unrealistic experience requirements (e.g., 10 years in 5-year-old tech)
- Excessive responsibilities for level/salary
- Vague job descriptions
- Unprofessional language ("Rockstar", "Ninja", "Guru")
- Problematic culture indicators ("We're a family", "Unlimited PTO")
- On-call expectations without compensation
- Copy-paste job descriptions with unrelated skill sets

**Caching Strategy**:
- Only ONE analysis per job at any time
- New analysis automatically deletes previous analysis
- Optimizes cost by preventing redundant AI calls
- `GET /api/ai/jobs/:jobId/analysis` retrieves without creating
- `POST /api/ai/jobs/analyze` creates/updates analysis

---

### 11. Job
**Purpose**: Job opportunity tracking

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (CUID) | Primary key |
| `userId` | String | Foreign key to User |
| **Job Information** | | |
| `title` | String | Job title |
| `company` | String | Company name |
| `companyUrl` | String? | Company website |
| `location` | String? | Job location |
| `workMode` | WorkMode | Remote/Hybrid/Onsite |
| `jobType` | JobType | Employment type |
| `salaryMin` | Int? | Minimum salary |
| `salaryMax` | Int? | Maximum salary |
| `salaryCurrency` | String? | Currency (default: "USD") |
| `jobUrl` | String? | Job posting URL |
| `jobDescription` | Text? | Full description |
| `requirements` | String[] | Job requirements |
| `responsibilities` | String[] | Job responsibilities |
| `benefits` | String[] | Job benefits |
| **Tracking** | | |
| `status` | JobStatus | Application status |
| `source` | String? | Job source (e.g., "LinkedIn") |
| `referralName` | String? | Referral contact |
| **Dates** | | |
| `postedDate` | DateTime? | Job posting date |
| `applicationDeadline` | DateTime? | Deadline date |
| `savedAt` | DateTime | Date saved |
| `appliedAt` | DateTime? | Date applied |
| **AI Analysis** | | |
| `matchScore` | Float? | AI match score (0-100) |
| `aiAnalysis` | Json? | AI insights |
| **Notes** | | |
| `notes` | Text? | User notes |
| `createdAt` | DateTime | Created timestamp |
| `updatedAt` | DateTime | Updated timestamp |

**Indexes**:
- `userId` - Filter by user
- `status` - Filter by status
- `workMode` - Filter by work mode
- `jobType` - Filter by job type
- `appliedAt` - Sort by application date

**Relations**:
- `user` → User (N:1, cascade delete)
- `applications` → Application[] (1:N)
- `interviews` → Interview[] (1:N)
- `documents` → Document[] (1:N)
- `statusChanges` → StatusChange[] (1:N)

---

### 10. StatusChange
**Purpose**: Job status history tracking

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (CUID) | Primary key |
| `jobId` | String | Foreign key to Job |
| `fromStatus` | JobStatus? | Previous status |
| `toStatus` | JobStatus | New status |
| `reason` | Text? | Change reason |
| `changedAt` | DateTime | Change timestamp |

**Indexes**:
- `jobId` - Filter by job
- `changedAt` - Sort by date

**Relations**:
- `job` → Job (N:1, cascade delete)

---

### 11. Application
**Purpose**: Job application tracking

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (CUID) | Primary key |
| `userId` | String | Foreign key to User |
| `jobId` | String | Foreign key to Job |
| `resumeId` | String? | Foreign key to Resume |
| **Application Details** | | |
| `applicationMethod` | ApplicationMethod | Manual/Automated |
| `status` | ApplicationStatus | Application status |
| `coverLetter` | Text? | Cover letter content |
| `applicationUrl` | String? | Application portal URL |
| `confirmationNumber` | String? | Confirmation code |
| **Tracking** | | |
| `submittedAt` | DateTime? | Submission date |
| `responseReceivedAt` | DateTime? | Response date |
| **AI Assistance** | | |
| `aiGeneratedCoverLetter` | Boolean | AI-generated flag |
| `aiOptimizationApplied` | Boolean | AI optimization flag |
| **Notes** | | |
| `notes` | Text? | User notes |
| `createdAt` | DateTime | Created timestamp |
| `updatedAt` | DateTime | Updated timestamp |

**Indexes**:
- `userId` - Filter by user
- `jobId` - Filter by job
- `resumeId` - Filter by resume
- `status` - Filter by status
- `submittedAt` - Sort by date

**Relations**:
- `user` → User (N:1, cascade delete)
- `job` → Job (N:1, cascade delete)
- `resume` → Resume (N:1, set null)

---

### 12. Interview
**Purpose**: Interview scheduling and tracking

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (CUID) | Primary key |
| `userId` | String | Foreign key to User |
| `jobId` | String | Foreign key to Job |
| **Interview Details** | | |
| `interviewType` | InterviewType | Interview type |
| `scheduledAt` | DateTime | Scheduled time |
| `duration` | Int? | Duration in minutes |
| `location` | String? | Location or video link |
| `interviewerName` | String? | Interviewer name |
| `interviewerEmail` | String? | Interviewer email |
| `interviewerPhone` | String? | Interviewer phone |
| **Tracking** | | |
| `outcome` | InterviewOutcome | Interview outcome |
| `completedAt` | DateTime? | Completion date |
| **Preparation** | | |
| `prepNotes` | Text? | Preparation notes |
| `questionsAsked` | String[] | Questions asked |
| `feedback` | Text? | Feedback received |
| `followUpSentAt` | DateTime? | Follow-up date |
| **Reminders** | | |
| `reminderSent` | Boolean | Reminder sent flag |
| `reminderSentAt` | DateTime? | Reminder sent date |
| `createdAt` | DateTime | Created timestamp |
| `updatedAt` | DateTime | Updated timestamp |

**Indexes**:
- `userId` - Filter by user
- `jobId` - Filter by job
- `scheduledAt` - Sort by date
- `outcome` - Filter by outcome

**Relations**:
- `user` → User (N:1, cascade delete)
- `job` → Job (N:1, cascade delete)

---

### 13. MockInterview
**Purpose**: AI mock interview sessions

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (CUID) | Primary key |
| `userId` | String | Foreign key to User |
| **Mock Interview Details** | | |
| `title` | String | Session title |
| `interviewType` | InterviewType | Interview type |
| `targetRole` | String? | Target position |
| `targetCompany` | String? | Target company |
| `difficulty` | String? | Easy/Medium/Hard |
| `duration` | Int? | Actual duration (minutes) |
| **Scoring** | | |
| `overallScore` | Float? | Overall score (0-100) |
| `technicalScore` | Float? | Technical score |
| `communicationScore` | Float? | Communication score |
| `problemSolvingScore` | Float? | Problem-solving score |
| **AI Analysis** | | |
| `aiAnalysis` | Json? | Detailed AI analysis |
| `aiSuggestions` | String[] | Improvement suggestions |
| `strengths` | String[] | Identified strengths |
| `areasToImprove` | String[] | Areas to improve |
| **Session Data** | | |
| `conversationHistory` | Json | Full conversation log |
| **Status** | | |
| `isCompleted` | Boolean | Completion status |
| `completedAt` | DateTime? | Completion date |
| `createdAt` | DateTime | Created timestamp |
| `updatedAt` | DateTime | Updated timestamp |

**Indexes**:
- `userId` - Filter by user
- `isCompleted` - Filter completed
- `createdAt` - Sort by date

**Relations**:
- `user` → User (N:1, cascade delete)

---

### 14. Document
**Purpose**: Additional documents attached to jobs

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (CUID) | Primary key |
| `jobId` | String? | Foreign key to Job |
| **Document Details** | | |
| `documentType` | DocumentType | Document type |
| `title` | String | Document title |
| `fileName` | String | Original file name |
| `fileUrl` | String | Storage URL |
| `fileSize` | Int | File size in bytes |
| `mimeType` | String | File MIME type |
| **Content** | | |
| `description` | Text? | Document description |
| **Version Control** | | |
| `version` | Int | Version number |
| `createdAt` | DateTime | Created timestamp |
| `updatedAt` | DateTime | Updated timestamp |

**Indexes**:
- `jobId` - Filter by job
- `documentType` - Filter by type

**Relations**:
- `job` → Job (N:1, cascade delete)

---

### 15. CareerGoal
**Purpose**: Career goal tracking

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (CUID) | Primary key |
| `userId` | String | Foreign key to User |
| `title` | String | Goal title |
| `description` | Text? | Goal description |
| `targetDate` | DateTime? | Target completion date |
| `status` | GoalStatus | Goal status |
| `priority` | Int | Priority level |
| `progress` | Int | Progress percentage (0-100) |
| **Milestones** | | |
| `milestones` | Json? | Milestone tracking |
| **AI Coaching** | | |
| `aiRecommendations` | String[] | AI suggestions |
| `createdAt` | DateTime | Created timestamp |
| `updatedAt` | DateTime | Updated timestamp |

**Indexes**:
- `userId` - Filter by user
- `status` - Filter by status
- `priority` - Sort by priority

**Relations**:
- `user` → User (N:1, cascade delete)

---

### 16. Assessment
**Purpose**: Career and skill assessments

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (CUID) | Primary key |
| `userId` | String | Foreign key to User |
| `type` | String | Assessment type |
| `title` | String | Assessment title |
| `description` | Text? | Description |
| `results` | Json | Assessment results |
| `score` | Float? | Overall score |
| **AI Analysis** | | |
| `aiInsights` | Json? | AI-generated insights |
| `recommendations` | String[] | Recommendations |
| `createdAt` | DateTime | Created timestamp |
| `updatedAt` | DateTime | Updated timestamp |

**Indexes**:
- `userId` - Filter by user
- `type` - Filter by type

**Relations**:
- `user` → User (N:1, cascade delete)

---

### 17. Conversation
**Purpose**: AI conversation sessions

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (CUID) | Primary key |
| `userId` | String | Foreign key to User |
| `title` | String? | Conversation title |
| `context` | String? | Context type |
| `metadata` | Json? | Additional metadata |
| `createdAt` | DateTime | Created timestamp |
| `updatedAt` | DateTime | Updated timestamp |

**Indexes**:
- `userId` - Filter by user
- `context` - Filter by context

**Relations**:
- `user` → User (N:1, cascade delete)
- `messages` → Message[] (1:N)

---

### 18. Message
**Purpose**: Individual messages in conversations

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (CUID) | Primary key |
| `conversationId` | String | Foreign key to Conversation |
| `role` | String | Message role (user/assistant) |
| `content` | Text | Message content |
| `metadata` | Json? | Token usage, model info, etc. |
| `createdAt` | DateTime | Created timestamp |

**Indexes**:
- `conversationId` - Filter by conversation
- `createdAt` - Sort chronologically

**Relations**:
- `conversation` → Conversation (N:1, cascade delete)

---

## Common Query Patterns

### User Authentication
```typescript
// Find user by email
const user = await prisma.user.findUnique({
  where: { email },
  include: { profile: true }
});

// Validate session
const session = await prisma.session.findFirst({
  where: {
    refreshToken,
    expiresAt: { gt: new Date() }
  },
  include: { user: true }
});
```

### Resume Management
```typescript
// Get user's primary resume
const resume = await prisma.resume.findFirst({
  where: { userId, isPrimary: true, isActive: true }
});

// Get all active resumes
const resumes = await prisma.resume.findMany({
  where: { userId, isActive: true },
  orderBy: { updatedAt: 'desc' }
});
```

### Job Tracking
```typescript
// Get jobs by status (Kanban columns)
const jobs = await prisma.job.findMany({
  where: { userId },
  include: {
    applications: true,
    interviews: true,
    statusChanges: { orderBy: { changedAt: 'desc' } }
  },
  orderBy: { updatedAt: 'desc' }
});

// Get job application pipeline stats
const stats = await prisma.job.groupBy({
  by: ['status'],
  where: { userId },
  _count: true
});
```

### Interview Scheduling
```typescript
// Get upcoming interviews
const interviews = await prisma.interview.findMany({
  where: {
    userId,
    scheduledAt: { gte: new Date() },
    outcome: 'PENDING'
  },
  include: {
    job: { select: { title: true, company: true } }
  },
  orderBy: { scheduledAt: 'asc' }
});
```

### User Profile
```typescript
// Get complete profile
const profile = await prisma.userProfile.findUnique({
  where: { userId },
  include: {
    experiences: { orderBy: { startDate: 'desc' } },
    educations: { orderBy: { startDate: 'desc' } },
    skills: { orderBy: { level: 'desc' } },
    certifications: { orderBy: { issueDate: 'desc' } }
  }
});
```

---

## Migration Commands

```bash
# Generate Prisma Client
npm run prisma:generate

# Create a new migration
npm run prisma:migrate:create

# Apply migrations (dev)
npm run prisma:migrate

# Apply migrations (production)
npm run prisma:migrate:prod

# Reset database (WARNING: deletes all data)
npm run prisma:reset

# Open Prisma Studio (GUI)
npm run prisma:studio

# Validate schema
npm run prisma:validate

# Format schema
npm run prisma:format
```

---

## Data Retention Policies

### Session Cleanup
- Sessions expire after 7 days
- Expired sessions can be cleaned up with a cron job

### Soft Deletes
- No soft deletes implemented currently
- All deletions are hard deletes with cascade

### Audit Trail
- `createdAt` and `updatedAt` on most tables
- `StatusChange` table tracks job status history

---

## Performance Considerations

### Indexed Fields
All foreign keys and frequently queried fields are indexed for performance.

### Query Optimization
- Use `select` to limit returned fields
- Use `include` carefully to avoid N+1 queries
- Implement pagination for large result sets

### Connection Pooling
Prisma automatically handles connection pooling based on configuration.

---

**Last Updated**: 2025-10-13
**Schema Version**: 1.0.0
