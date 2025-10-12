# Resume Parser AI Agent Documentation

## Overview

The Resume Parser AI Agent is a sophisticated system that automatically extracts structured data from resume files (PDF, DOCX, DOC, TXT) using Claude AI. It processes resumes in the background and populates user profiles with the extracted information.

---

## Architecture

### Components

1. **Resume Parser Prompt** (`src/ai/prompts/resume-parser.prompt.ts`)
   - Comprehensive system prompt for Claude
   - Extraction rules and formatting instructions
   - JSON output schema

2. **Resume Parser Agent** (`src/ai/agents/resume-parser.agent.ts`)
   - AI agent that calls Claude API
   - Response parsing and validation
   - Error handling

3. **Document Parser** (`src/utils/document-parser.ts`)
   - Text extraction from PDF/DOCX/TXT
   - File type detection
   - Text cleaning and validation

4. **Background Job Processor** (`src/jobs/processors/resume-parse.processor.ts`)
   - Fetches resume from storage
   - Extracts text from file
   - Calls AI agent
   - Saves parsed data
   - Updates user profile

5. **Background Worker** (`src/jobs/workers/resume-parse.worker.ts`)
   - BullMQ worker that processes jobs
   - Concurrency and rate limiting
   - Progress tracking

---

## Data Extraction

### Personal Information

- Name
- Email
- Phone number
- Location (city, state, country)
- LinkedIn URL
- GitHub URL
- Portfolio/Website URL

### Professional Summary

- Professional summary or objective statement
- Combined from multiple sections if needed

### Work Experience

For each position:
- Company name
- Job title/position
- Location
- Start date (normalized to YYYY-MM)
- End date (or "Present" if current)
- Description/responsibilities
- **Achievements** (separately extracted with metrics)
- Technologies/tools used
- isCurrent flag

### Education

For each degree:
- Institution/university name
- Degree type (normalized, e.g., "Bachelor of Science")
- Field of study/major
- Location
- Start and end dates
- GPA (if mentioned)
- Honors and awards
- Relevant coursework

### Skills

- Skill name
- Category (Programming Languages, Frameworks, Tools, etc.)
- Proficiency level (Beginner, Intermediate, Advanced, Expert)
- Inferred from context or explicitly mentioned

### Certifications

- Certification name
- Issuing organization
- Issue date
- Expiry date (if mentioned)
- Credential ID (if available)

---

## Usage

### 1. Trigger Parsing via API

```http
POST /api/v1/resumes/:id/parse
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "resume": {
      "id": "...",
      "fileName": "resume.pdf",
      "isParsed": false
    }
  },
  "message": "Resume parsing initiated"
}
```

The parsing happens asynchronously in the background.

### 2. Direct Agent Usage

```typescript
import { resumeParserAgent } from '@/ai/agents/resume-parser.agent';

const result = await resumeParserAgent.execute({
  resumeText: 'Resume content here...',
  fileName: 'resume.pdf',
});

if (result.success) {
  console.log('Parsed data:', result.data);
  console.log('Personal info:', result.data.personalInfo);
  console.log('Experience count:', result.data.experiences.length);
}
```

### 3. Background Job

```typescript
import { resumeParseQueue } from '@/config/queue';

await resumeParseQueue.add('parse-resume', {
  resumeId: 'resume-id',
  userId: 'user-id',
  updateProfile: true,
});
```

---

## Output Format

### Complete Structure

```json
{
  "personalInfo": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "location": "San Francisco, CA",
    "city": "San Francisco",
    "state": "CA",
    "country": "USA",
    "linkedinUrl": "https://linkedin.com/in/johndoe",
    "githubUrl": "https://github.com/johndoe",
    "portfolioUrl": "https://johndoe.com",
    "websiteUrl": null
  },
  "summary": "Software Engineer with 5 years of experience...",
  "experiences": [
    {
      "company": "Tech Corp",
      "position": "Senior Software Engineer",
      "location": "San Francisco, CA",
      "startDate": "2020-01",
      "endDate": null,
      "isCurrent": true,
      "description": "Leading development of microservices architecture...",
      "achievements": [
        "Reduced API response time by 40%",
        "Led team of 5 engineers",
        "Deployed to 1M+ users"
      ],
      "technologies": [
        "Node.js",
        "React",
        "AWS",
        "PostgreSQL"
      ]
    }
  ],
  "educations": [
    {
      "institution": "Stanford University",
      "degree": "Bachelor of Science",
      "fieldOfStudy": "Computer Science",
      "location": "Stanford, CA",
      "startDate": "2015-09",
      "endDate": "2019-06",
      "isCurrent": false,
      "gpa": 3.8,
      "honors": ["Dean's List", "Cum Laude"],
      "coursework": ["Data Structures", "Algorithms", "Machine Learning"]
    }
  ],
  "skills": [
    {
      "name": "JavaScript",
      "category": "Programming Languages",
      "level": "Expert"
    },
    {
      "name": "React",
      "category": "Frameworks",
      "level": "Advanced"
    }
  ],
  "certifications": [
    {
      "name": "AWS Certified Solutions Architect",
      "issuingOrganization": "Amazon Web Services",
      "issueDate": "2022-03",
      "expiryDate": "2025-03",
      "credentialId": "AWS-SA-12345"
    }
  ]
}
```

---

## Workflow

### Complete Resume Parsing Flow

1. **User uploads resume** → `POST /api/v1/resumes/upload`
2. **File saved to storage** (S3 or local)
3. **Database record created** with `isParsed: false`
4. **User triggers parsing** → `POST /api/v1/resumes/:id/parse`
5. **Job added to queue** (`resume-parsing`)
6. **Worker picks up job**
7. **Download file from storage**
8. **Extract text** (PDF/DOCX → plain text)
9. **Call Claude AI** to parse text
10. **Validate parsed data**
11. **Save to database** (`parsedData`, `rawText`, `isParsed: true`)
12. **Update user profile** (if requested)
13. **Send notification** to user (optional)

### Automatic Profile Update

If `updateProfile: true`, the parser will:
- Update personal information
- Add work experiences
- Add educations
- Add skills (avoiding duplicates)
- Add certifications
- Calculate years of experience
- Set current job title and company

---

## Features

### ✅ Intelligent Extraction

- **Date Normalization**: Converts various date formats to `YYYY-MM`
- **Achievement Detection**: Identifies quantifiable metrics (%, $, time)
- **Technology Extraction**: Finds tools and technologies mentioned
- **Skill Categorization**: Groups skills by type
- **Level Inference**: Determines proficiency from context

### ✅ Error Handling

- Retry logic (3 attempts with exponential backoff)
- Graceful degradation for missing data
- Validation warnings for incomplete resumes
- Detailed error logging

### ✅ Performance

- Background processing (non-blocking)
- Concurrency: 2 jobs simultaneously
- Rate limiting: 10 jobs per minute
- Progress tracking (0-100%)

### ✅ Flexibility

- Supports multiple file formats (PDF, DOCX, DOC, TXT)
- Auto-detects file type
- Handles malformed or low-quality resumes
- Configurable profile update behavior

---

## Validation

### Data Quality Checks

The parser validates:

1. **Email format** - Valid email regex
2. **Required fields** - Name, contact info, experience
3. **Date ranges** - Start before end dates
4. **GPA range** - 0.0 to 5.0
5. **Text quality** - Minimum word count, character ratio

### Validation Warnings

```typescript
{
  valid: false,
  warnings: [
    "Name not found in resume",
    "No contact information found",
    "Experience 1: Missing start date",
    "Education 1: GPA 4.5 is out of valid range"
  ]
}
```

---

## Configuration

### Agent Settings

```typescript
const agent = new ResumeParserAgent();

// Defaults
temperature: 0.3,  // Low for consistency
maxTokens: 4096,   // Enough for detailed resumes
model: 'claude-sonnet-4-5-20250929'
```

### Queue Settings

```typescript
{
  attempts: 3,
  backoff: { type: 'exponential', delay: 2000 },
  removeOnComplete: true,
  removeOnFail: false
}
```

### Worker Settings

```typescript
{
  concurrency: 2,
  limiter: { max: 10, duration: 60000 }
}
```

---

## Examples

### Parse Resume and Update Profile

```typescript
import { resumeService } from '@/services/resume.service';

// Parse resume and update profile
await resumeService.parseResume(resumeId, userId, {
  updateProfile: true,
});
```

### Get Parsed Data

```typescript
const resume = await prisma.resume.findUnique({
  where: { id: resumeId },
});

if (resume.isParsed) {
  const parsedData = resume.parsedData as ParsedResumeData;
  console.log('Name:', parsedData.personalInfo.name);
  console.log('Experience:', parsedData.experiences.length);
}
```

### Extract Text Only

```typescript
import { DocumentParser } from '@/utils/document-parser';

const buffer = await storageService.downloadFile(key);
const result = await DocumentParser.extractTextFromPDF(buffer);

console.log('Text:', result.text);
console.log('Pages:', result.pageCount);
console.log('Words:', result.wordCount);
```

---

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `INVALID_INPUT` | Empty resume text | Check file upload |
| `PARSE_ERROR` | Invalid JSON response | Retry or check prompt |
| `TEXT_EXTRACTION_FAILED` | Corrupted file | Re-upload file |
| `VALIDATION_ERROR` | Missing required data | Review resume content |

### Error Responses

```json
{
  "success": false,
  "error": {
    "code": "PARSE_ERROR",
    "message": "Failed to extract JSON from response",
    "type": "parsing_error",
    "retryable": false
  }
}
```

---

## Testing

### Unit Test Example

```typescript
import { resumeParserAgent } from '@/ai/agents/resume-parser.agent';

describe('ResumeParserAgent', () => {
  it('should parse resume successfully', async () => {
    const resumeText = `
      John Doe
      john@example.com | +1234567890
      San Francisco, CA

      EXPERIENCE
      Senior Engineer at Tech Corp (2020-Present)
      - Built microservices
      - Led team of 5

      EDUCATION
      BS Computer Science, Stanford (2019)

      SKILLS
      JavaScript, React, Node.js
    `;

    const result = await resumeParserAgent.execute({
      resumeText,
      fileName: 'test-resume.txt',
    });

    expect(result.success).toBe(true);
    expect(result.data?.personalInfo.name).toBe('John Doe');
    expect(result.data?.experiences.length).toBeGreaterThan(0);
  });
});
```

### Integration Test

```typescript
it('should process resume parse job', async () => {
  // Upload resume
  const resume = await resumeService.uploadResume(userId, file, 'Test Resume', false);

  // Trigger parsing
  await resumeService.parseResume(resume.id, userId, { updateProfile: true });

  // Wait for job to complete
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Check results
  const updated = await prisma.resume.findUnique({ where: { id: resume.id } });
  expect(updated?.isParsed).toBe(true);
  expect(updated?.parsedData).toBeDefined();
});
```

---

## Monitoring

### Logs

All parsing operations are logged:

```json
{
  "level": "info",
  "message": "Resume parsing completed successfully",
  "fileName": "resume.pdf",
  "hasName": true,
  "experienceCount": 3,
  "educationCount": 1,
  "skillCount": 15,
  "usage": {
    "inputTokens": 2500,
    "outputTokens": 1200,
    "totalTokens": 3700
  }
}
```

### Queue Monitoring

```typescript
import { resumeParseQueue } from '@/config/queue';

// Get job counts
const counts = await resumeParseQueue.getJobCounts();
console.log('Active:', counts.active);
console.log('Waiting:', counts.waiting);
console.log('Failed:', counts.failed);

// Get failed jobs
const failed = await resumeParseQueue.getFailed();
```

---

## Cost Estimation

### Per Resume

Using Claude Sonnet 4.5:

- **Input tokens**: ~2,000-4,000 (resume text)
- **Output tokens**: ~1,000-2,000 (JSON data)
- **Total tokens**: ~3,000-6,000
- **Cost**: ~$0.01-$0.02 per resume

### Monthly Estimate

- 100 resumes/month: ~$1-2
- 1,000 resumes/month: ~$10-20
- 10,000 resumes/month: ~$100-200

---

## Troubleshooting

### Resume Not Parsing

1. Check file format is supported (PDF, DOCX, DOC, TXT)
2. Verify file is not corrupted
3. Check file size is under limit (10MB)
4. Review worker logs for errors
5. Check queue is running

### Poor Extraction Quality

1. Ensure resume has clear structure
2. Check for unusual formatting
3. Verify text extraction worked
4. Review validation warnings
5. Consider manual review for edge cases

### Profile Not Updating

1. Verify `updateProfile: true` was set
2. Check for duplicate entries
3. Review profile update logs
4. Check database constraints

---

## Best Practices

1. **Always parse after upload** - Add parsing to upload flow
2. **Show progress to users** - Display parsing status
3. **Handle failures gracefully** - Allow manual retry
4. **Review parsed data** - Let users edit before saving
5. **Monitor costs** - Track token usage
6. **Log everything** - Enable debugging
7. **Test with real resumes** - Various formats and styles

---

## Future Enhancements

- [ ] Resume quality scoring
- [ ] Duplicate detection
- [ ] Multi-language support
- [ ] Custom extraction rules per user
- [ ] Resume comparison
- [ ] Keyword optimization suggestions
- [ ] ATS compatibility checker

---

## Support

For issues:
- Check logs in `logs/` directory
- Review queue status
- Verify ANTHROPIC_API_KEY is set
- Check worker is running
- Monitor token usage

For questions:
- See [AI Agents Documentation](./AI_AGENTS_FOUNDATION.md)
- Review [Quick Start Guide](./AI_AGENTS_QUICK_START.md)
