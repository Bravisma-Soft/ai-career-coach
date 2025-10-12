# API Endpoints Summary

Complete reference for all API endpoints in the AI Career Coach platform.

---

## Authentication Endpoints
**Base:** `/api/v1/auth`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register new user |
| POST | `/login` | User login |
| POST | `/logout` | Logout current session |
| POST | `/logout-all` | Logout all sessions |
| POST | `/refresh` | Refresh access token |
| POST | `/forgot-password` | Request password reset |
| POST | `/reset-password` | Reset password with token |
| GET | `/me` | Get current user |
| GET | `/sessions` | Get all active sessions |
| DELETE | `/sessions/:id` | Delete specific session |

---

## Profile Management Endpoints
**Base:** `/api/v1/profile`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get user profile |
| PUT | `/` | Update user profile |
| POST | `/experience` | Add work experience |
| PUT | `/experience/:id` | Update work experience |
| DELETE | `/experience/:id` | Delete work experience |
| POST | `/education` | Add education |
| PUT | `/education/:id` | Update education |
| DELETE | `/education/:id` | Delete education |
| POST | `/skill` | Add skill |
| PUT | `/skill/:id` | Update skill |
| DELETE | `/skill/:id` | Delete skill |
| POST | `/certification` | Add certification |
| PUT | `/certification/:id` | Update certification |
| DELETE | `/certification/:id` | Delete certification |

---

## Resume Management Endpoints
**Base:** `/api/v1/resumes`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/upload` | Upload new resume |
| GET | `/` | Get all resumes (paginated) |
| GET | `/stats` | Get resume statistics |
| GET | `/:id` | Get resume by ID |
| PUT | `/:id` | Update resume metadata |
| DELETE | `/:id` | Delete resume |
| POST | `/:id/parse` | Trigger AI parsing |
| GET | `/:id/download` | Download resume file |
| GET | `/:id/url` | Get signed URL (S3) |

---

## Job Tracking Endpoints
**Base:** `/api/v1/jobs`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all jobs (paginated, filtered) |
| POST | `/` | Create new job |
| GET | `/stats` | Get job statistics |
| GET | `/:id` | Get job by ID |
| PUT | `/:id` | Update job |
| DELETE | `/:id` | Delete job |
| PUT | `/:id/status` | Update job status |
| POST | `/:id/notes` | Add note to job |
| GET | `/:id/timeline` | Get status history |

---

## Application Management Endpoints
**Base:** `/api/v1/applications`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all applications (paginated) |
| POST | `/` | Create new application |
| GET | `/stats` | Get application statistics |
| GET | `/:id` | Get application by ID |
| PUT | `/:id` | Update application |
| DELETE | `/:id` | Delete application |

---

## Interview Management Endpoints
**Base:** `/api/v1/interviews`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all interviews (paginated) |
| POST | `/` | Create new interview |
| GET | `/upcoming` | Get upcoming interviews |
| GET | `/past` | Get past interviews |
| GET | `/stats` | Get interview statistics |
| GET | `/:id` | Get interview by ID |
| PUT | `/:id` | Update interview |
| DELETE | `/:id` | Delete interview |

---

## Total Endpoint Count

| Category | Count |
|----------|-------|
| Authentication | 10 |
| Profile Management | 13 |
| Resume Management | 9 |
| Job Tracking | 9 |
| Application Management | 6 |
| Interview Management | 9 |
| **TOTAL** | **56** |

---

## Common Query Parameters

### Pagination
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)

### Sorting
- `sortBy` - Field to sort by
- `sortOrder` - `asc` or `desc`

### Date Filtering
- `startDate` - ISO 8601 date string
- `endDate` - ISO 8601 date string

### Status Filtering
- `status` - Filter by status (varies by endpoint)

---

## Authentication

All endpoints (except `/auth/register`, `/auth/login`, `/auth/forgot-password`, `/auth/reset-password`) require authentication.

**Header:**
```
Authorization: Bearer {access_token}
```

---

## Response Format

### Success Response
```json
{
  "success": true,
  "data": {...},
  "message": "Operation successful"
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [...],
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

### Error Response
```json
{
  "success": false,
  "error": "Error Type",
  "message": "Error description",
  "errors": [...]  // For validation errors
}
```

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (not authenticated) |
| 403 | Forbidden (not authorized) |
| 404 | Not Found |
| 409 | Conflict (duplicate) |
| 500 | Internal Server Error |

---

## Rate Limiting

- General API: 100 requests per 15 minutes
- Auth endpoints: 5 requests per 15 minutes (login, register)

---

## File Upload Limits

- Max file size: 10MB
- Allowed types: PDF, DOC, DOCX, TXT
- Storage: AWS S3 or local filesystem (auto-detected)

---

## Quick Links

- [Full Authentication Documentation](./AUTH_SYSTEM.md)
- [Profile & Resume Documentation](./USER_PROFILE_RESUME.md)
- [Job Tracking Documentation](./JOB_TRACKING_APPLICATION_MANAGEMENT.md)
