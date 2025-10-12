# User Profile & Resume Management Documentation

## Overview

Complete user profile management and resume handling system with file uploads supporting both local storage and AWS S3.

## Components Created

### 1. Validators
- `src/api/validators/user.validator.ts` - Profile, experience, education, skills, certifications validation
- `src/api/validators/resume.validator.ts` - Resume upload and management validation

### 2. Services
- `src/services/user.service.ts` - Profile management business logic
- `src/services/resume.service.ts` - Resume management business logic
- `src/services/storage.service.ts` - File upload/download (S3 or local)

### 3. Routes
- `src/api/routes/user.routes.ts` - Profile API endpoints
- `src/api/routes/resume.routes.ts` - Resume API endpoints

### 4. Configuration
- `src/config/multer.ts` - File upload configuration

## API Endpoints

### Base URLs
- Profile: `/api/v1/profile`
- Resumes: `/api/v1/resumes`

All endpoints require authentication (Bearer token).

---

## Profile Management

### Get User Profile
```http
GET /api/v1/profile
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "profile": {
      "id": "...",
      "userId": "...",
      "phone": "+1-555-0100",
      "bio": "Software engineer...",
      "location": "San Francisco, CA",
      "currentJobTitle": "Senior Developer",
      "experiences": [...],
      "educations": [...],
      "skills": [...],
      "certifications": [...]
    }
  }
}
```

---

### Update Profile
```http
PUT /api/v1/profile
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "phone": "+1-555-0100",
  "bio": "Experienced software engineer...",
  "location": "San Francisco, CA",
  "city": "San Francisco",
  "state": "CA",
  "country": "USA",
  "linkedinUrl": "https://linkedin.com/in/user",
  "githubUrl": "https://github.com/user",
  "currentJobTitle": "Senior Software Engineer",
  "currentCompany": "Tech Corp",
  "yearsOfExperience": 5,
  "desiredJobTitle": "Lead Engineer",
  "desiredSalaryMin": 150000,
  "desiredSalaryMax": 200000,
  "desiredWorkMode": "HYBRID",
  "desiredJobTypes": ["FULL_TIME"],
  "willingToRelocate": true,
  "preferredLocations": ["San Francisco", "Seattle"],
  "timezone": "America/Los_Angeles"
}
```

---

## Experience Management

### Add Experience
```http
POST /api/v1/profile/experience
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "company": "Tech Corp",
  "position": "Senior Software Engineer",
  "description": "Led development of microservices...",
  "location": "San Francisco, CA",
  "workMode": "HYBRID",
  "startDate": "2021-01-01T00:00:00.000Z",
  "endDate": null,
  "isCurrent": true,
  "achievements": [
    "Reduced API response time by 40%",
    "Mentored 3 junior developers"
  ],
  "technologies": ["Node.js", "React", "PostgreSQL"]
}
```

---

### Update Experience
```http
PUT /api/v1/profile/experience/:id
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:** (all fields optional)
```json
{
  "position": "Lead Software Engineer",
  "isCurrent": false,
  "endDate": "2024-01-01T00:00:00.000Z"
}
```

---

### Delete Experience
```http
DELETE /api/v1/profile/experience/:id
Authorization: Bearer {token}
```

---

## Education Management

### Add Education
```http
POST /api/v1/profile/education
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "institution": "Stanford University",
  "degree": "Bachelor of Science",
  "fieldOfStudy": "Computer Science",
  "location": "Stanford, CA",
  "startDate": "2015-09-01T00:00:00.000Z",
  "endDate": "2019-06-01T00:00:00.000Z",
  "isCurrent": false,
  "gpa": 3.8,
  "achievements": ["Dean's List", "Graduated with Honors"],
  "coursework": ["Data Structures", "Algorithms", "Machine Learning"]
}
```

---

### Update Education
```http
PUT /api/v1/profile/education/:id
```

### Delete Education
```http
DELETE /api/v1/profile/education/:id
```

---

## Skills Management

### Add Skill
```http
POST /api/v1/profile/skill
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "JavaScript",
  "category": "Programming",
  "level": "EXPERT",
  "yearsOfExperience": 5,
  "endorsements": 0
}
```

**Skill Levels:**
- `BEGINNER`
- `INTERMEDIATE`
- `ADVANCED`
- `EXPERT`

---

### Update Skill
```http
PUT /api/v1/profile/skill/:id
```

### Delete Skill
```http
DELETE /api/v1/profile/skill/:id
```

---

## Certifications Management

### Add Certification
```http
POST /api/v1/profile/certification
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "AWS Certified Solutions Architect",
  "issuingOrganization": "Amazon Web Services",
  "issueDate": "2022-03-15T00:00:00.000Z",
  "expiryDate": "2025-03-15T00:00:00.000Z",
  "credentialId": "AWS-SA-12345",
  "credentialUrl": "https://aws.amazon.com/verification",
  "doesNotExpire": false
}
```

---

### Update Certification
```http
PUT /api/v1/profile/certification/:id
```

### Delete Certification
```http
DELETE /api/v1/profile/certification/:id
```

---

## Resume Management

### Upload Resume
```http
POST /api/v1/resumes/upload
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Form Data:**
- `resume` (file) - Required
- `title` (string) - Optional (defaults to filename)
- `isPrimary` (boolean) - Optional (default: false)

**Allowed File Types:**
- PDF (.pdf)
- Word (.doc, .docx)
- Text (.txt)

**Max File Size:** 10MB

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/v1/resumes/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "resume=@/path/to/resume.pdf" \
  -F "title=My Resume 2024" \
  -F "isPrimary=true"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "resume": {
      "id": "...",
      "userId": "...",
      "title": "My Resume 2024",
      "fileName": "resume.pdf",
      "fileUrl": "/uploads/resumes/1234567890-abc123.pdf",
      "fileSize": 245678,
      "mimeType": "application/pdf",
      "isPrimary": true,
      "isActive": true,
      "createdAt": "..."
    }
  },
  "message": "Resume uploaded successfully"
}
```

---

### Get All Resumes
```http
GET /api/v1/resumes?page=1&limit=10&isPrimary=true&isActive=true
Authorization: Bearer {token}
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)
- `isPrimary` - Filter by primary status (optional)
- `isActive` - Filter by active status (optional)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "title": "My Resume",
      "fileName": "resume.pdf",
      "fileUrl": "...",
      "isPrimary": true,
      "isActive": true,
      "createdAt": "..."
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 3,
    "totalPages": 1,
    "hasNext": false,
    "hasPrevious": false
  }
}
```

---

### Get Resume Statistics
```http
GET /api/v1/resumes/stats
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "total": 3,
      "active": 2,
      "hasPrimary": true,
      "primaryResumeId": "..."
    }
  }
}
```

---

### Get Resume by ID
```http
GET /api/v1/resumes/:id
Authorization: Bearer {token}
```

---

### Update Resume
```http
PUT /api/v1/resumes/:id
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Updated Resume Title",
  "isPrimary": true,
  "isActive": true
}
```

---

### Delete Resume
```http
DELETE /api/v1/resumes/:id
Authorization: Bearer {token}
```

Deletes both the database record and the file from storage.

---

### Download Resume
```http
GET /api/v1/resumes/:id/download
Authorization: Bearer {token}
```

Returns the file with appropriate headers for download.

---

### Get Signed URL (for S3)
```http
GET /api/v1/resumes/:id/url
Authorization: Bearer {token}
```

Generates a temporary signed URL for accessing the resume (valid for 1 hour).

**Response:**
```json
{
  "success": true,
  "data": {
    "url": "https://bucket.s3.amazonaws.com/resumes/file.pdf?signature=..."
  }
}
```

---

### Parse Resume (Trigger AI Parsing)
```http
POST /api/v1/resumes/:id/parse
Authorization: Bearer {token}
```

Triggers a background job to parse the resume content using AI.

**Note:** This is a placeholder endpoint. Implementation would involve:
1. Adding job to BullMQ queue
2. Job processor downloads resume
3. AI extracts: name, email, skills, experience, education
4. Stores in `resume.parsedData` and `resume.rawText`

---

## File Storage

### Configuration

The system automatically chooses storage provider:
- **AWS S3** - If `AWS_S3_BUCKET_NAME` is configured
- **Local Storage** - Otherwise (files stored in `uploads/` directory)

### Environment Variables

**For Local Storage:**
No additional configuration needed.

**For AWS S3:**
```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET_NAME=ai-career-coach-uploads
```

### Storage Service Features

- ✅ Upload files to S3 or local storage
- ✅ Download files
- ✅ Delete files
- ✅ Generate signed URLs (for private S3 files)
- ✅ Check file existence
- ✅ Get file metadata

---

## Security Features

### Authorization
- Users can only access their own profile data
- All endpoints verify ownership before allowing modifications
- JWT authentication required for all endpoints

### File Upload Security
- File type validation (whitelist)
- File size limits (10MB max)
- Unique filename generation
- Secure file storage

### Input Validation
- Zod schema validation on all inputs
- Strong type checking
- Date validation
- URL validation
- Array/object validation

---

## Error Handling

### Common Errors

**400 Bad Request - Invalid Input**
```json
{
  "success": false,
  "error": "Validation Error",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

**401 Unauthorized - Not Authenticated**
```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

**403 Forbidden - Not Authorized**
```json
{
  "success": false,
  "error": "Forbidden",
  "message": "Not authorized to access this resource"
}
```

**404 Not Found**
```json
{
  "success": false,
  "error": "Not Found",
  "message": "Resource not found"
}
```

**409 Conflict - Duplicate**
```json
{
  "success": false,
  "error": "Conflict",
  "message": "Skill already exists"
}
```

---

## Usage Examples

### Complete Profile Setup Flow

```bash
# 1. Register/Login
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Test1234!"}'

# Save the token from response
TOKEN="eyJhbGci..."

# 2. Update Profile
curl -X PUT http://localhost:3000/api/v1/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+1-555-0100",
    "bio": "Software engineer with 5 years experience",
    "currentJobTitle": "Senior Developer",
    "desiredJobTitle": "Lead Engineer",
    "desiredSalaryMin": 150000
  }'

# 3. Add Experience
curl -X POST http://localhost:3000/api/v1/profile/experience \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "company": "Tech Corp",
    "position": "Senior Developer",
    "startDate": "2021-01-01T00:00:00.000Z",
    "isCurrent": true,
    "technologies": ["Node.js", "React"]
  }'

# 4. Add Skills
curl -X POST http://localhost:3000/api/v1/profile/skill \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "JavaScript",
    "category": "Programming",
    "level": "EXPERT",
    "yearsOfExperience": 5
  }'

# 5. Upload Resume
curl -X POST http://localhost:3000/api/v1/resumes/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "resume=@resume.pdf" \
  -F "title=My Resume 2024" \
  -F "isPrimary=true"

# 6. Get Complete Profile
curl -X GET http://localhost:3000/api/v1/profile \
  -H "Authorization: Bearer $TOKEN"
```

---

## Frontend Integration

### React Example - Update Profile

```typescript
const updateProfile = async (data: UpdateProfileData) => {
  const response = await fetch('/api/v1/profile', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();
  return result.data.profile;
};
```

### React Example - Upload Resume

```typescript
const uploadResume = async (file: File, title: string, isPrimary: boolean) => {
  const formData = new FormData();
  formData.append('resume', file);
  formData.append('title', title);
  formData.append('isPrimary', isPrimary.toString());

  const response = await fetch('/api/v1/resumes/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
    body: formData,
  });

  const result = await response.json();
  return result.data.resume;
};
```

---

## Database Schema

### Models Used

- **UserProfile** - Main profile data
- **Experience** - Work history
- **Education** - Educational background
- **Skill** - Skills with proficiency levels
- **Certification** - Professional certifications
- **Resume** - Resume files with metadata

See `prisma/schema.prisma` for complete schema.

---

## File Structure

```
src/
├── api/
│   ├── routes/
│   │   ├── user.routes.ts       # Profile endpoints
│   │   └── resume.routes.ts     # Resume endpoints
│   └── validators/
│       ├── user.validator.ts    # Profile validation
│       └── resume.validator.ts  # Resume validation
├── services/
│   ├── user.service.ts          # Profile business logic
│   ├── resume.service.ts        # Resume business logic
│   └── storage.service.ts       # File upload/download
└── config/
    └── multer.ts                # File upload config
```

---

## Next Steps

- [ ] Implement resume parsing with AI
- [ ] Add resume templates
- [ ] Add profile completeness score
- [ ] Add profile import from LinkedIn
- [ ] Add resume optimization suggestions
- [ ] Add version control for resumes

---

## Support

For issues or questions:
- Check server logs for errors
- Verify authentication token is valid
- Ensure file upload limits are not exceeded
- Check S3 configuration if using S3 storage
