# Job Tracking & Application Management Documentation

## Overview

Complete job tracking and application management system with interviews, status tracking, and analytics.

## Features

- ✅ Job tracking with status management
- ✅ Application tracking with multiple statuses
- ✅ Interview scheduling and management
- ✅ Status change validation and history
- ✅ Pagination and advanced filtering
- ✅ Statistics and analytics
- ✅ Cascade delete protection
- ✅ Ownership verification on all operations

---

## Components Created

### 1. Validators
- `src/api/validators/job.validator.ts` - Job creation, update, status management
- `src/api/validators/application.validator.ts` - Application CRUD validation
- `src/api/validators/interview.validator.ts` - Interview scheduling validation

### 2. Services
- `src/services/job.service.ts` - Job management with status transitions
- `src/services/application.service.ts` - Application tracking
- `src/services/interview.service.ts` - Interview scheduling

### 3. Routes
- `src/api/routes/job.routes.ts` - Job API endpoints (9 endpoints)
- `src/api/routes/application.routes.ts` - Application API endpoints (6 endpoints)
- `src/api/routes/interview.routes.ts` - Interview API endpoints (9 endpoints)

---

## API Endpoints

### Base URLs
- Jobs: `/api/v1/jobs`
- Applications: `/api/v1/applications`
- Interviews: `/api/v1/interviews`

All endpoints require authentication (Bearer token).

---

## Job Management

### Job Statuses

Jobs follow a status workflow with validation:

```
SAVED → RESEARCHING → APPLIED → INTERVIEWING → OFFER_RECEIVED → ACCEPTED → CLOSED
   ↓         ↓           ↓            ↓              ↓
WITHDRAWN  WITHDRAWN  WITHDRAWN   WITHDRAWN      REJECTED
   ↓         ↓           ↓            ↓              ↓
CLOSED    CLOSED      CLOSED       CLOSED        CLOSED
```

**Valid Status Transitions:**
- `SAVED` → RESEARCHING, APPLIED, WITHDRAWN, CLOSED
- `RESEARCHING` → SAVED, APPLIED, WITHDRAWN, CLOSED
- `APPLIED` → INTERVIEWING, REJECTED, WITHDRAWN, CLOSED
- `INTERVIEWING` → OFFER_RECEIVED, REJECTED, WITHDRAWN, CLOSED
- `OFFER_RECEIVED` → ACCEPTED, REJECTED, WITHDRAWN
- `ACCEPTED` → CLOSED
- `REJECTED` → CLOSED
- `WITHDRAWN` → CLOSED
- `CLOSED` → (terminal state)

---

### Get All Jobs
```http
GET /api/v1/jobs?page=1&limit=10&status=SAVED&sortBy=createdAt&sortOrder=desc
Authorization: Bearer {token}
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)
- `status` - Filter by status (SAVED, RESEARCHING, APPLIED, etc.)
- `company` - Filter by company name (partial match)
- `workMode` - Filter by work mode (REMOTE, HYBRID, ONSITE)
- `jobType` - Filter by job type (FULL_TIME, PART_TIME, CONTRACT, etc.)
- `priority` - Filter by priority (1-5)
- `search` - Search in title, company, description, location
- `sortBy` - Sort field (createdAt, updatedAt, company, title, priority, postedDate)
- `sortOrder` - Sort order (asc, desc)
- `startDate` - Filter jobs created after this date
- `endDate` - Filter jobs created before this date

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "title": "Senior Software Engineer",
      "company": "Tech Corp",
      "location": "San Francisco, CA",
      "workMode": "HYBRID",
      "jobType": "FULL_TIME",
      "status": "SAVED",
      "priority": 4,
      "salaryMin": 150000,
      "salaryMax": 200000,
      "url": "https://techcorp.com/jobs/123",
      "applications": [...],
      "_count": {
        "applications": 1,
        "statusChanges": 3
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

---

### Create Job
```http
POST /api/v1/jobs
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Senior Software Engineer",
  "company": "Tech Corp",
  "location": "San Francisco, CA",
  "workMode": "HYBRID",
  "jobType": "FULL_TIME",
  "salaryMin": 150000,
  "salaryMax": 200000,
  "salaryCurrency": "USD",
  "description": "We are looking for...",
  "requirements": [
    "5+ years of experience",
    "Proficient in Node.js and React"
  ],
  "responsibilities": [
    "Design and develop scalable systems",
    "Mentor junior developers"
  ],
  "benefits": [
    "Health insurance",
    "401k matching"
  ],
  "url": "https://techcorp.com/jobs/123",
  "sourceUrl": "https://linkedin.com/jobs/123",
  "postedDate": "2024-01-15T00:00:00.000Z",
  "deadline": "2024-02-15T00:00:00.000Z",
  "contactName": "Jane Smith",
  "contactEmail": "jane@techcorp.com",
  "contactPhone": "+1-555-0100",
  "notes": "Found through referral",
  "tags": ["engineering", "javascript", "remote"],
  "priority": 4,
  "status": "SAVED"
}
```

**All fields are optional except `title` and `company`.**

---

### Get Job by ID
```http
GET /api/v1/jobs/:id
Authorization: Bearer {token}
```

**Response includes:**
- Job details
- All applications for this job
- Status change history (last 20)
- Application count

---

### Update Job
```http
PUT /api/v1/jobs/:id
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:** (all fields optional)
```json
{
  "title": "Lead Software Engineer",
  "priority": 5,
  "notes": "Updated after phone call",
  "status": "APPLIED"
}
```

**Note:** If status is changed, it will be validated against allowed transitions and a status change record will be created.

---

### Delete Job
```http
DELETE /api/v1/jobs/:id
Authorization: Bearer {token}
```

**Warning:** This will cascade delete all associated applications and interviews.

---

### Update Job Status
```http
PUT /api/v1/jobs/:id/status
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": "APPLIED",
  "notes": "Applied through company website"
}
```

**Validation:** Status transitions are validated. Invalid transitions will return a 400 error with allowed transitions.

---

### Add Job Note
```http
POST /api/v1/jobs/:id/notes
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "note": "Had a great conversation with the hiring manager"
}
```

Notes are timestamped and appended to existing notes.

---

### Get Job Timeline
```http
GET /api/v1/jobs/:id/timeline
Authorization: Bearer {token}
```

Returns complete status change history for the job.

**Response:**
```json
{
  "success": true,
  "data": {
    "timeline": [
      {
        "id": "...",
        "jobId": "...",
        "fromStatus": null,
        "toStatus": "SAVED",
        "notes": "Job created",
        "createdAt": "2024-01-15T10:00:00.000Z"
      },
      {
        "id": "...",
        "jobId": "...",
        "fromStatus": "SAVED",
        "toStatus": "APPLIED",
        "notes": "Applied through company website",
        "createdAt": "2024-01-16T14:30:00.000Z"
      }
    ]
  }
}
```

---

### Get Job Statistics
```http
GET /api/v1/jobs/stats
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "total": 45,
      "active": 32,
      "byStatus": {
        "SAVED": 10,
        "APPLIED": 15,
        "INTERVIEWING": 7,
        "OFFER_RECEIVED": 2,
        "REJECTED": 8,
        "WITHDRAWN": 3
      },
      "byPriority": {
        "1": 5,
        "2": 8,
        "3": 15,
        "4": 12,
        "5": 5
      },
      "addedThisMonth": 12
    }
  }
}
```

---

## Application Management

### Application Statuses
- `DRAFT` - Application being prepared
- `SUBMITTED` - Application submitted
- `UNDER_REVIEW` - Application under review
- `SHORTLISTED` - Candidate shortlisted
- `INTERVIEWING` - Interview process ongoing
- `OFFER` - Offer received
- `ACCEPTED` - Offer accepted
- `REJECTED` - Application rejected
- `WITHDRAWN` - Application withdrawn

### Application Methods
- `COMPANY_WEBSITE`
- `LINKEDIN`
- `EMAIL`
- `RECRUITMENT_AGENCY`
- `JOB_BOARD`
- `REFERRAL`
- `OTHER`

---

### Get All Applications
```http
GET /api/v1/applications?page=1&limit=10&status=SUBMITTED
Authorization: Bearer {token}
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)
- `status` - Filter by status
- `jobId` - Filter by job ID
- `applicationMethod` - Filter by application method
- `sortBy` - Sort field (createdAt, updatedAt, applicationDate)
- `sortOrder` - Sort order (asc, desc)
- `startDate` - Filter applications created after this date
- `endDate` - Filter applications created before this date

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "jobId": "...",
      "resumeId": "...",
      "status": "SUBMITTED",
      "applicationMethod": "COMPANY_WEBSITE",
      "applicationDate": "2024-01-16T00:00:00.000Z",
      "job": {
        "id": "...",
        "title": "Senior Software Engineer",
        "company": "Tech Corp",
        "status": "APPLIED"
      },
      "resume": {
        "id": "...",
        "title": "My Resume 2024",
        "fileName": "resume.pdf"
      },
      "interviews": [...],
      "_count": {
        "interviews": 2
      }
    }
  ],
  "pagination": {...}
}
```

---

### Create Application
```http
POST /api/v1/applications
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "jobId": "clxxx123",
  "resumeId": "clxxx456",
  "coverLetter": "Dear Hiring Manager...",
  "applicationMethod": "COMPANY_WEBSITE",
  "applicationUrl": "https://apply.techcorp.com/app/123",
  "applicationDate": "2024-01-16T00:00:00.000Z",
  "followUpDate": "2024-01-23T00:00:00.000Z",
  "contactPerson": "Jane Smith",
  "contactEmail": "jane@techcorp.com",
  "contactPhone": "+1-555-0100",
  "referralName": "John Doe",
  "referralEmail": "john@techcorp.com",
  "notes": "Applied after networking event",
  "documents": ["resume.pdf", "cover_letter.pdf"],
  "status": "SUBMITTED"
}
```

**Required:** `jobId`
**All other fields are optional.**

---

### Get Application by ID
```http
GET /api/v1/applications/:id
Authorization: Bearer {token}
```

**Response includes:**
- Application details
- Full job details
- Resume information
- All interviews for this application

---

### Update Application
```http
PUT /api/v1/applications/:id
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:** (all fields optional)
```json
{
  "status": "INTERVIEWING",
  "notes": "Phone screen scheduled",
  "followUpDate": "2024-02-01T00:00:00.000Z"
}
```

---

### Delete Application
```http
DELETE /api/v1/applications/:id
Authorization: Bearer {token}
```

**Warning:** This will cascade delete all associated interviews.

---

### Get Application Statistics
```http
GET /api/v1/applications/stats
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "total": 32,
      "byStatus": {
        "SUBMITTED": 15,
        "UNDER_REVIEW": 8,
        "INTERVIEWING": 5,
        "REJECTED": 4
      },
      "byMethod": {
        "COMPANY_WEBSITE": 18,
        "LINKEDIN": 10,
        "REFERRAL": 4
      },
      "submittedThisMonth": 8
    }
  }
}
```

---

## Interview Management

### Interview Types
- `PHONE_SCREEN`
- `VIDEO_CALL`
- `IN_PERSON`
- `TECHNICAL`
- `BEHAVIORAL`
- `PANEL`
- `FINAL`
- `OTHER`

### Interview Outcomes
- `PENDING`
- `PASSED`
- `FAILED`
- `CANCELLED`
- `RESCHEDULED`
- `NO_SHOW`

---

### Get All Interviews
```http
GET /api/v1/interviews?page=1&limit=10&upcoming=true
Authorization: Bearer {token}
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)
- `type` - Filter by interview type
- `outcome` - Filter by outcome
- `applicationId` - Filter by application ID
- `upcoming` - Filter for upcoming interviews (boolean)
- `sortBy` - Sort field (createdAt, updatedAt, scheduledAt)
- `sortOrder` - Sort order (asc, desc)
- `startDate` - Filter interviews after this date
- `endDate` - Filter interviews before this date

---

### Create Interview
```http
POST /api/v1/interviews
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "applicationId": "clxxx789",
  "type": "PHONE_SCREEN",
  "scheduledAt": "2024-01-20T14:00:00.000Z",
  "duration": 30,
  "location": "Virtual",
  "meetingUrl": "https://zoom.us/j/123456789",
  "interviewers": [
    {
      "name": "Jane Smith",
      "title": "Engineering Manager",
      "email": "jane@techcorp.com"
    }
  ],
  "notes": "Prepare answers for behavioral questions",
  "preparationNotes": "Review STAR method examples",
  "outcome": "PENDING",
  "round": 1
}
```

**Required:** `applicationId`, `type`, `scheduledAt`

---

### Get Interview by ID
```http
GET /api/v1/interviews/:id
Authorization: Bearer {token}
```

**Response includes:**
- Interview details
- Application details
- Job details
- Resume information

---

### Update Interview
```http
PUT /api/v1/interviews/:id
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:** (all fields optional)
```json
{
  "outcome": "PASSED",
  "feedback": "Great technical skills, good culture fit",
  "notes": "Moving to next round"
}
```

---

### Delete Interview
```http
DELETE /api/v1/interviews/:id
Authorization: Bearer {token}
```

---

### Get Upcoming Interviews
```http
GET /api/v1/interviews/upcoming?limit=10
Authorization: Bearer {token}
```

Returns interviews scheduled in the future with outcome = PENDING.

---

### Get Past Interviews
```http
GET /api/v1/interviews/past?limit=10
Authorization: Bearer {token}
```

Returns interviews that have already occurred.

---

### Get Interview Statistics
```http
GET /api/v1/interviews/stats
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "total": 18,
      "upcoming": 3,
      "byType": {
        "PHONE_SCREEN": 6,
        "TECHNICAL": 5,
        "BEHAVIORAL": 4,
        "FINAL": 3
      },
      "byOutcome": {
        "PENDING": 3,
        "PASSED": 10,
        "FAILED": 4,
        "CANCELLED": 1
      }
    }
  }
}
```

---

## Usage Examples

### Complete Job Application Flow

```bash
# 1. Save a job opportunity
curl -X POST http://localhost:3000/api/v1/jobs \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Senior Developer",
    "company": "Tech Corp",
    "location": "San Francisco, CA",
    "workMode": "HYBRID",
    "jobType": "FULL_TIME",
    "status": "SAVED",
    "priority": 4
  }'

# Save the job ID
JOB_ID="clxxx123"

# 2. Update status to researching
curl -X PUT http://localhost:3000/api/v1/jobs/$JOB_ID/status \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "RESEARCHING",
    "notes": "Researching company culture and tech stack"
  }'

# 3. Create an application
curl -X POST http://localhost:3000/api/v1/applications \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "jobId": "'$JOB_ID'",
    "resumeId": "clxxx456",
    "applicationMethod": "COMPANY_WEBSITE",
    "applicationDate": "2024-01-16T00:00:00.000Z",
    "status": "SUBMITTED"
  }'

# Save the application ID
APP_ID="clxxx789"

# 4. Update job status to applied
curl -X PUT http://localhost:3000/api/v1/jobs/$JOB_ID/status \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "APPLIED",
    "notes": "Application submitted through website"
  }'

# 5. Schedule a phone screen
curl -X POST http://localhost:3000/api/v1/interviews \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "applicationId": "'$APP_ID'",
    "type": "PHONE_SCREEN",
    "scheduledAt": "2024-01-20T14:00:00.000Z",
    "duration": 30,
    "interviewers": [
      {"name": "Jane Smith", "title": "Recruiter"}
    ]
  }'

# 6. Update job status to interviewing
curl -X PUT http://localhost:3000/api/v1/jobs/$JOB_ID/status \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "INTERVIEWING",
    "notes": "Phone screen scheduled"
  }'

# 7. Get upcoming interviews
curl -X GET http://localhost:3000/api/v1/interviews/upcoming \
  -H "Authorization: Bearer $TOKEN"

# 8. View job timeline
curl -X GET http://localhost:3000/api/v1/jobs/$JOB_ID/timeline \
  -H "Authorization: Bearer $TOKEN"

# 9. Get statistics
curl -X GET http://localhost:3000/api/v1/jobs/stats \
  -H "Authorization: Bearer $TOKEN"
```

---

## Error Handling

### Invalid Status Transition
```json
{
  "success": false,
  "error": "Bad Request",
  "message": "Invalid status transition from SAVED to OFFER_RECEIVED. Valid transitions: RESEARCHING, APPLIED, WITHDRAWN, CLOSED"
}
```

### Job Not Found
```json
{
  "success": false,
  "error": "Not Found",
  "message": "Job not found"
}
```

### Unauthorized Access
```json
{
  "success": false,
  "error": "Forbidden",
  "message": "Not authorized to access this job"
}
```

---

## Security Features

### Authorization
- Users can only access their own jobs, applications, and interviews
- All endpoints verify ownership before allowing modifications
- Referential integrity checks (job exists, resume exists, etc.)

### Validation
- Zod schema validation on all inputs
- Status transition validation
- Date validation
- URL validation

### Cascade Delete Protection
- Warnings logged when deleting jobs/applications with related records
- All cascade deletes are intentional and documented

---

## Database Models

### Job
- Basic job information
- Status tracking
- Contact information
- Salary range
- Tags and priority

### Application
- Links job and user
- Application method
- Contact information
- Referral tracking
- Documents list

### Interview
- Links to application
- Interview type and round
- Scheduled date/time
- Interviewers list
- Outcome tracking
- Preparation and feedback notes

### StatusChange
- Tracks job status history
- From/to status
- Notes for each change
- Timestamp

---

## Performance Considerations

### Pagination
All list endpoints support pagination with configurable limits (max 100 items per page).

### Indexing
Database indexes on:
- `userId` for all models
- `jobId` for applications
- `applicationId` for interviews
- `status` fields
- `scheduledAt` for interviews

### Filtering
Efficient filtering with database-level WHERE clauses rather than in-memory filtering.

---

## Next Steps

Potential enhancements:
- [ ] Email notifications for upcoming interviews
- [ ] Calendar integration (Google Calendar, Outlook)
- [ ] Application templates
- [ ] Interview preparation checklist
- [ ] Offer comparison tool
- [ ] Job search analytics dashboard
- [ ] Company research notes
- [ ] Salary negotiation tracker

---

## Support

For issues or questions:
- Check server logs for errors
- Verify authentication token is valid
- Ensure proper ownership of resources
- Check status transition rules for jobs
