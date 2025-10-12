# Prisma Schema Documentation

## Overview

This is the comprehensive database schema for the AI Career Coach platform. It includes models for user management, career profiles, job tracking, applications, interviews, and AI-powered coaching features.

## Database Models

### User Management

#### User
Core user authentication and account management.

**Key Fields:**
- `email` - Unique email address
- `password` - Hashed password
- `role` - USER or ADMIN
- `status` - ACTIVE, INACTIVE, or SUSPENDED
- `emailVerified` - Email verification status

**Relations:**
- One UserProfile
- Many Sessions, Resumes, Jobs, Applications, Interviews, etc.

#### Session
Manages user sessions and refresh tokens.

**Key Fields:**
- `refreshToken` - JWT refresh token
- `expiresAt` - Token expiration timestamp
- `userAgent` - Client user agent
- `ipAddress` - Client IP address

### User Profile & Career Data

#### UserProfile
Extended user profile with career information and preferences.

**Key Fields:**
- Personal: phone, bio, location details
- Professional: currentJobTitle, currentCompany, yearsOfExperience
- Career Preferences: desiredJobTitle, desiredSalary, desiredWorkMode
- Social: linkedinUrl, githubUrl, portfolioUrl

**Relations:**
- Many Experiences, Educations, Skills, Certifications

#### Experience
Work experience records.

**Key Fields:**
- `company`, `position` - Job details
- `startDate`, `endDate` - Employment period
- `isCurrent` - Currently employed flag
- `achievements` - Array of achievements
- `technologies` - Array of technologies used

#### Education
Educational background.

**Key Fields:**
- `institution`, `degree`, `fieldOfStudy`
- `startDate`, `endDate`, `isCurrent`
- `gpa` - Grade point average
- `achievements`, `coursework` - Arrays

#### Skill
User skills with proficiency levels.

**Key Fields:**
- `name` - Skill name
- `category` - Skill category (Programming, Design, etc.)
- `level` - BEGINNER, INTERMEDIATE, ADVANCED, EXPERT
- `yearsOfExperience` - Years of experience

#### Certification
Professional certifications.

**Key Fields:**
- `name`, `issuingOrganization`
- `issueDate`, `expiryDate`
- `credentialId`, `credentialUrl`
- `doesNotExpire` - Flag for non-expiring certs

### Resume Management

#### Resume
Stores user resumes with parsing support.

**Key Fields:**
- `title`, `fileName`, `fileUrl`
- `isPrimary` - Primary resume flag
- `rawText` - Extracted text content
- `parsedData` - JSON parsed resume data
- `version` - Resume version number

**Relations:**
- Used by many Applications

### Job Tracking

#### Job
Job opportunities being tracked.

**Key Fields:**
- Job Info: title, company, location, workMode, jobType
- Compensation: salaryMin, salaryMax, salaryCurrency
- Tracking: status, source, postedDate, appliedAt
- AI: matchScore, aiAnalysis

**Status Flow:**
INTERESTED → APPLIED → INTERVIEW_SCHEDULED → INTERVIEW_COMPLETED → OFFER_RECEIVED → ACCEPTED/REJECTED

**Relations:**
- Many Applications, Interviews, Documents, StatusChanges

#### StatusChange
Tracks job status history.

**Key Fields:**
- `fromStatus`, `toStatus` - Status transition
- `reason` - Reason for change
- `changedAt` - Timestamp

### Application Tracking

#### Application
Job applications with cover letters and tracking.

**Key Fields:**
- `applicationMethod` - MANUAL or AUTOMATED
- `status` - DRAFT, SUBMITTED, UNDER_REVIEW, REJECTED, ACCEPTED
- `coverLetter` - Cover letter content
- `submittedAt` - Submission timestamp
- `aiGeneratedCoverLetter` - AI assistance flag

**Relations:**
- Links User, Job, and Resume

### Interview Management

#### Interview
Real job interviews.

**Key Fields:**
- `interviewType` - PHONE, VIDEO, ONSITE, TECHNICAL, etc.
- `scheduledAt` - Interview date/time
- `duration` - Duration in minutes
- `location` - Physical address or video link
- `outcome` - PASSED, FAILED, PENDING
- `prepNotes`, `feedback` - Interview notes

#### MockInterview
AI-powered practice interviews.

**Key Fields:**
- Interview Config: title, interviewType, targetRole, difficulty
- Scoring: overallScore, technicalScore, communicationScore
- AI Analysis: aiAnalysis, aiSuggestions, strengths, areasToImprove
- `conversationHistory` - Full interview conversation (JSON)

### Documents

#### Document
Stores job-related documents.

**Key Fields:**
- `documentType` - RESUME, COVER_LETTER, PORTFOLIO, etc.
- `title`, `fileName`, `fileUrl`
- `version` - Document version

### Career Coaching

#### CareerGoal
User career goals with AI recommendations.

**Key Fields:**
- `title`, `description` - Goal details
- `status` - NOT_STARTED, IN_PROGRESS, COMPLETED, ABANDONED
- `priority` - Priority level (0-10)
- `progress` - Progress percentage (0-100)
- `targetDate` - Target completion date
- `milestones` - JSON milestones data
- `aiRecommendations` - Array of AI suggestions

#### Assessment
Career assessments and evaluations.

**Key Fields:**
- `type` - Assessment type (personality, skills, career_fit)
- `title`, `description` - Assessment details
- `results` - JSON assessment results
- `score` - Overall score
- `aiInsights` - AI-generated insights (JSON)
- `recommendations` - Array of recommendations

#### Conversation
AI coaching conversations.

**Key Fields:**
- `title` - Conversation title
- `context` - Conversation context (job_search, interview_prep, etc.)
- `metadata` - Additional metadata (JSON)

**Relations:**
- Many Messages

#### Message
Individual messages in conversations.

**Key Fields:**
- `role` - 'user' or 'assistant'
- `content` - Message content
- `metadata` - Token usage, model info (JSON)

## Enums

### UserRole
- `USER` - Regular user
- `ADMIN` - Administrator

### UserStatus
- `ACTIVE` - Active account
- `INACTIVE` - Inactive account
- `SUSPENDED` - Suspended account

### JobType
- `FULL_TIME` - Full-time position
- `PART_TIME` - Part-time position
- `CONTRACT` - Contract position
- `INTERNSHIP` - Internship
- `TEMPORARY` - Temporary position

### WorkMode
- `REMOTE` - Fully remote
- `HYBRID` - Hybrid (office + remote)
- `ONSITE` - Fully on-site

### JobStatus
- `INTERESTED` - Saved/interested
- `APPLIED` - Application submitted
- `INTERVIEW_SCHEDULED` - Interview scheduled
- `INTERVIEW_COMPLETED` - Interview completed
- `OFFER_RECEIVED` - Offer received
- `REJECTED` - Application rejected
- `ACCEPTED` - Offer accepted
- `WITHDRAWN` - Application withdrawn

### ApplicationMethod
- `MANUAL` - Manually submitted
- `AUTOMATED` - Automatically submitted

### ApplicationStatus
- `DRAFT` - Draft application
- `SUBMITTED` - Submitted
- `UNDER_REVIEW` - Under review
- `REJECTED` - Rejected
- `ACCEPTED` - Accepted

### InterviewType
- `PHONE` - Phone interview
- `VIDEO` - Video interview
- `ONSITE` - On-site interview
- `TECHNICAL` - Technical interview
- `BEHAVIORAL` - Behavioral interview
- `PANEL` - Panel interview
- `FINAL` - Final interview

### InterviewOutcome
- `PASSED` - Passed
- `FAILED` - Failed
- `PENDING` - Pending result

### DocumentType
- `RESUME` - Resume
- `COVER_LETTER` - Cover letter
- `PORTFOLIO` - Portfolio
- `TRANSCRIPT` - Transcript
- `REFERENCE` - Reference letter
- `OTHER` - Other document

### GoalStatus
- `NOT_STARTED` - Not started
- `IN_PROGRESS` - In progress
- `COMPLETED` - Completed
- `ABANDONED` - Abandoned

### SkillLevel
- `BEGINNER` - Beginner level
- `INTERMEDIATE` - Intermediate level
- `ADVANCED` - Advanced level
- `EXPERT` - Expert level

## Indexes

Strategic indexes are placed on:
- Frequently queried fields (userId, email, status)
- Foreign keys for join optimization
- Date fields for range queries (scheduledAt, appliedAt)
- Status fields for filtering (status, outcome)
- Boolean flags (isPrimary, isCurrent, isCompleted)

## Relationships

### One-to-One
- User ↔ UserProfile
- Resume ↔ User (many-to-one, but can have one primary)

### One-to-Many
- User → Sessions, Resumes, Jobs, Applications
- UserProfile → Experiences, Educations, Skills, Certifications
- Job → Applications, Interviews, Documents, StatusChanges
- Conversation → Messages

### Many-to-One
- Application → User, Job, Resume
- Interview → User, Job
- Document → Job

## Database Commands

### Setup
```bash
# Generate Prisma Client
npm run prisma:generate

# Create migration
npm run prisma:migrate

# Create migration (production)
npm run prisma:migrate:prod

# Create migration without applying
npm run prisma:migrate:create
```

### Maintenance
```bash
# Open Prisma Studio (GUI)
npm run prisma:studio

# Seed database
npm run prisma:seed

# Reset database (WARNING: deletes all data)
npm run prisma:reset

# Format schema file
npm run prisma:format

# Validate schema
npm run prisma:validate
```

### Backups
```bash
# Backup database
npm run db:backup

# Restore database
npm run db:restore

# Interactive migration helper
npm run db:migrate-helper
```

## Migration Workflow

### Development
1. Modify `schema.prisma`
2. Run `npm run prisma:migrate` to create and apply migration
3. Test changes
4. Commit migration files

### Production
1. Deploy code with new migration files
2. Run `npm run prisma:migrate:prod` to apply migrations
3. Verify database state

## Best Practices

1. **Always backup before migrations** - Use `npm run db:backup`
2. **Test migrations locally first** - Never test migrations in production
3. **Use transactions** - For complex data operations
4. **Index strategically** - Add indexes to frequently queried fields
5. **Document schema changes** - Keep this README updated
6. **Seed data for testing** - Use seed script to generate test data
7. **Version control migrations** - Commit all migration files

## Data Types

- `String` - Text fields
- `Int` - Integer numbers
- `Float` - Decimal numbers
- `Boolean` - True/false flags
- `DateTime` - Timestamps
- `Json` - JSON data
- `String[]` - Arrays of strings

## Cascade Behaviors

- `onDelete: Cascade` - Delete related records when parent is deleted
- `onDelete: SetNull` - Set foreign key to null when parent is deleted

## Schema Statistics

- **Total Models:** 20
- **Total Enums:** 11
- **User Management:** 2 models
- **Career Profile:** 5 models
- **Job Tracking:** 4 models
- **Interviews:** 2 models
- **Coaching:** 4 models
- **Supporting:** 3 models

## Need Help?

- Prisma Docs: https://www.prisma.io/docs
- PostgreSQL Docs: https://www.postgresql.org/docs
- Migration Helper: `npm run db:migrate-helper`
