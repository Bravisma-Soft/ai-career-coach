# Database Schema Diagram

## Entity Relationship Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        AI CAREER COACH DATABASE SCHEMA                       │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│                           CORE USER MANAGEMENT                                │
└──────────────────────────────────────────────────────────────────────────────┘

    ┌─────────────┐
    │    User     │ (Central entity)
    ├─────────────┤
    │ id          │──┐
    │ email       │  │
    │ password    │  │
    │ firstName   │  │
    │ lastName    │  │
    │ role        │  │
    │ status      │  │
    └─────────────┘  │
          │          │
          ├──────────┼────────────┬──────────────┬──────────────┬─────────────┐
          │          │            │              │              │             │
          ▼          ▼            ▼              ▼              ▼             ▼
    ┌──────────┐ ┌──────────┐ ┌─────────┐ ┌────────────┐ ┌──────────┐ ┌──────────┐
    │ Session  │ │  Resume  │ │   Job   │ │Application │ │Interview │ │MockIntvw │
    └──────────┘ └──────────┘ └─────────┘ └────────────┘ └──────────┘ └──────────┘
          │
          ▼
    ┌─────────────┐
    │UserProfile  │
    ├─────────────┤
    │ phone       │
    │ bio         │
    │ location    │
    │ preferences │
    └─────────────┘
          │
          ├──────────┬──────────────┬──────────────┬──────────────┐
          │          │              │              │              │
          ▼          ▼              ▼              ▼              ▼
    ┌──────────┐ ┌──────────┐ ┌─────────┐ ┌────────────┐ ┌──────────┐
    │Experience│ │Education │ │  Skill  │ │Certification│ │          │
    └──────────┘ └──────────┘ └─────────┘ └────────────┘ └──────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│                         JOB TRACKING SUBSYSTEM                                │
└──────────────────────────────────────────────────────────────────────────────┘

    ┌─────────────┐
    │     Job     │
    ├─────────────┤
    │ id          │
    │ title       │
    │ company     │
    │ location    │
    │ workMode    │
    │ jobType     │
    │ status      │
    │ matchScore  │
    └─────────────┘
          │
          ├──────────┬──────────────┬──────────────┬──────────────┐
          │          │              │              │              │
          ▼          ▼              ▼              ▼              ▼
    ┌──────────┐ ┌──────────┐ ┌─────────┐ ┌────────────┐ ┌──────────┐
    │Application││Interview │ │Document │ │StatusChange│ │          │
    └──────────┘ └──────────┘ └─────────┘ └────────────┘ └──────────┘
          │
          ▼
    ┌─────────────┐
    │   Resume    │
    └─────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│                      APPLICATION & INTERVIEW FLOW                             │
└──────────────────────────────────────────────────────────────────────────────┘

    User ──> Job ──> Application ──> Interview ──> Outcome
     │        │           │              │
     │        │           └──────────────┼───> Resume
     │        └────────────┬─────────────┘
     └─────────────────────┘

    Status Flow:
    INTERESTED → APPLIED → INTERVIEW_SCHEDULED → INTERVIEW_COMPLETED
                    → OFFER_RECEIVED → ACCEPTED/REJECTED

┌──────────────────────────────────────────────────────────────────────────────┐
│                        AI COACHING SUBSYSTEM                                  │
└──────────────────────────────────────────────────────────────────────────────┘

    ┌─────────────┐
    │    User     │
    └─────────────┘
          │
          ├──────────┬──────────────┬──────────────┬──────────────┐
          │          │              │              │              │
          ▼          ▼              ▼              ▼              ▼
    ┌──────────┐ ┌──────────┐ ┌─────────────┐ ┌────────────┐ ┌──────────┐
    │CareerGoal│ │Assessment│ │Conversation │ │MockInterview│ │          │
    └──────────┘ └──────────┘ └─────────────┘ └────────────┘ └──────────┘
                                     │
                                     ▼
                              ┌─────────────┐
                              │   Message   │
                              └─────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│                           DATA RELATIONSHIPS                                  │
└──────────────────────────────────────────────────────────────────────────────┘

ONE-TO-ONE:
  User ←→ UserProfile

ONE-TO-MANY:
  User → Sessions
  User → Resumes
  User → Jobs
  User → Applications
  User → Interviews
  User → MockInterviews
  User → CareerGoals
  User → Assessments
  User → Conversations
  UserProfile → Experiences
  UserProfile → Educations
  UserProfile → Skills
  UserProfile → Certifications
  Job → Applications
  Job → Interviews
  Job → Documents
  Job → StatusChanges
  Conversation → Messages

MANY-TO-ONE:
  Application → User, Job, Resume
  Interview → User, Job
  Document → Job

┌──────────────────────────────────────────────────────────────────────────────┐
│                            KEY ENUMERATIONS                                   │
└──────────────────────────────────────────────────────────────────────────────┘

UserRole:          USER, ADMIN
UserStatus:        ACTIVE, INACTIVE, SUSPENDED
JobType:           FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP, TEMPORARY
WorkMode:          REMOTE, HYBRID, ONSITE
JobStatus:         INTERESTED, APPLIED, INTERVIEW_SCHEDULED,
                   INTERVIEW_COMPLETED, OFFER_RECEIVED, REJECTED,
                   ACCEPTED, WITHDRAWN
ApplicationMethod: MANUAL, AUTOMATED
ApplicationStatus: DRAFT, SUBMITTED, UNDER_REVIEW, REJECTED, ACCEPTED
InterviewType:     PHONE, VIDEO, ONSITE, TECHNICAL, BEHAVIORAL, PANEL, FINAL
InterviewOutcome:  PASSED, FAILED, PENDING
DocumentType:      RESUME, COVER_LETTER, PORTFOLIO, TRANSCRIPT, REFERENCE, OTHER
GoalStatus:        NOT_STARTED, IN_PROGRESS, COMPLETED, ABANDONED
SkillLevel:        BEGINNER, INTERMEDIATE, ADVANCED, EXPERT

┌──────────────────────────────────────────────────────────────────────────────┐
│                          IMPORTANT INDEXES                                    │
└──────────────────────────────────────────────────────────────────────────────┘

User:          email, status
Session:       userId, refreshToken, expiresAt
UserProfile:   userId
Experience:    userProfileId, isCurrent
Education:     userProfileId, isCurrent
Skill:         userProfileId, category
Resume:        userId, isPrimary, isActive
Job:           userId, status, workMode, jobType, appliedAt
Application:   userId, jobId, resumeId, status, submittedAt
Interview:     userId, jobId, scheduledAt, outcome
MockInterview: userId, isCompleted, createdAt
CareerGoal:    userId, status, priority
Assessment:    userId, type
Conversation:  userId, context
Message:       conversationId, createdAt
StatusChange:  jobId, changedAt
Document:      jobId, documentType

┌──────────────────────────────────────────────────────────────────────────────┐
│                         JSON FIELD STRUCTURES                                 │
└──────────────────────────────────────────────────────────────────────────────┘

Resume.parsedData: {
  name: string,
  email: string,
  phone: string,
  skills: string[],
  experience: string[]
}

Job.aiAnalysis: {
  strengths: string[],
  concerns: string[],
  recommendation: string
}

MockInterview.conversationHistory: {
  messages: [
    { role: 'user' | 'assistant', content: string }
  ]
}

MockInterview.aiAnalysis: {
  summary: string,
  detailedFeedback: string
}

CareerGoal.milestones: [
  { title: string, completed: boolean, dueDate: Date }
]

Assessment.results: {
  // Flexible structure based on assessment type
}

Assessment.aiInsights: {
  // AI-generated insights
}

Conversation.metadata: {
  // Context-specific metadata
}

Message.metadata: {
  model: string,
  tokens: number
}
```

## Model Counts by Category

| Category              | Models | Purpose                          |
|-----------------------|--------|----------------------------------|
| User Management       | 2      | Authentication & sessions        |
| User Profile          | 5      | Career info & credentials        |
| Resume Management     | 1      | Resume storage & parsing         |
| Job Tracking          | 2      | Job opportunities & status       |
| Applications          | 1      | Application tracking             |
| Interviews            | 2      | Real & mock interviews           |
| Documents             | 1      | File management                  |
| Career Coaching       | 4      | Goals, assessments, conversations|
| Supporting            | 2      | Status changes, messages         |
| **Total**             | **20** |                                  |

## Foreign Key Relationships

```
Session.userId         → User.id         (CASCADE)
UserProfile.userId     → User.id         (CASCADE)
Experience.userProfileId → UserProfile.id (CASCADE)
Education.userProfileId → UserProfile.id  (CASCADE)
Skill.userProfileId    → UserProfile.id  (CASCADE)
Certification.userProfileId → UserProfile.id (CASCADE)
Resume.userId          → User.id         (CASCADE)
Job.userId             → User.id         (CASCADE)
Application.userId     → User.id         (CASCADE)
Application.jobId      → Job.id          (CASCADE)
Application.resumeId   → Resume.id       (SET NULL)
Interview.userId       → User.id         (CASCADE)
Interview.jobId        → Job.id          (CASCADE)
MockInterview.userId   → User.id         (CASCADE)
Document.jobId         → Job.id          (CASCADE)
StatusChange.jobId     → Job.id          (CASCADE)
CareerGoal.userId      → User.id         (CASCADE)
Assessment.userId      → User.id         (CASCADE)
Conversation.userId    → User.id         (CASCADE)
Message.conversationId → Conversation.id (CASCADE)
```

## Typical Query Patterns

### Get User with Full Profile
```sql
SELECT * FROM users
JOIN user_profiles ON users.id = user_profiles.user_id
WHERE users.id = ?
```

### Get Active Jobs with Applications
```sql
SELECT * FROM jobs
LEFT JOIN applications ON jobs.id = applications.job_id
WHERE jobs.user_id = ? AND jobs.status IN ('INTERESTED', 'APPLIED')
ORDER BY jobs.created_at DESC
```

### Get Upcoming Interviews
```sql
SELECT * FROM interviews
JOIN jobs ON interviews.job_id = jobs.id
WHERE interviews.user_id = ?
  AND interviews.scheduled_at > NOW()
  AND interviews.outcome = 'PENDING'
ORDER BY interviews.scheduled_at ASC
```

### Get User Skills by Category
```sql
SELECT * FROM skills
WHERE skills.user_profile_id = ?
ORDER BY skills.category, skills.level DESC
```

## Performance Considerations

- **Indexes**: All foreign keys are indexed
- **Cascade Deletes**: User deletion cascades to all related records
- **JSON Fields**: Used for flexible, schema-less data (AI results, metadata)
- **Array Fields**: Used for lists (achievements, technologies, recommendations)
- **Timestamps**: All models have createdAt/updatedAt for audit trail
