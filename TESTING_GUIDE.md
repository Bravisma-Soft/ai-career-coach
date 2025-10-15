# AI Career Coach - Testing Guide

## 📊 Current Implementation Status

| Feature | Backend | Frontend | Connection | Status |
|---------|---------|----------|------------|--------|
| Resume Parsing | ✅ Complete | ✅ Connected | ✅ Working | **READY** |
| Resume Tailoring | ✅ Complete | ❌ Mocked | ❌ Not Connected | **NEEDS FIX** |
| Cover Letter | ⚠️ Placeholder | ❌ Mocked | ❌ Not Connected | NOT READY |
| Mock Interview | ⚠️ Placeholder | ❌ Mocked | ❌ Not Connected | NOT READY |

---

## ✅ Feature 1: Resume Parsing (READY TO TEST)

### Backend Implementation:
- **Agent**: `backend/src/ai/agents/resume-parser.agent.ts`
- **Service**: `backend/src/services/resume.service.ts` - `parseResume()`
- **Queue**: BullMQ background job processing
- **Endpoint**: `POST /api/resumes/:id/parse`

### Frontend Implementation:
- **Service**: `frontend/src/services/resumeService.ts`
- **Method**: `parseResume(resumeId: string)`
- **Status**: ✅ **CONNECTED AND WORKING**

### Testing Steps:

#### Prerequisites:
1. Backend running on `http://localhost:5001`
2. Frontend running on `http://localhost:5173`
3. Redis running (for background jobs)
4. PostgreSQL database setup

#### Test Flow:

```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start Redis (if not running)
redis-server

# Terminal 3: Start frontend
cd frontend
npm run dev
```

#### In Browser:

1. **Register/Login**
   - Go to `http://localhost:5173`
   - Register a new account or login

2. **Upload Resume**
   - Navigate to "Resumes" page
   - Click "Upload Resume" button
   - Select a PDF or DOCX file
   - Enter a title
   - Click "Upload"

3. **Parse Resume**
   - Find your uploaded resume in the list
   - Click "Parse Resume" or similar button
   - Wait for background job to process (usually 5-30 seconds)
   - Refresh page to see parsed data

4. **Verify Parsing**
   - Check that the resume shows:
     - ✅ Personal information extracted
     - ✅ Work experience listed
     - ✅ Education details
     - ✅ Skills identified
     - ✅ Certifications (if any)

#### Expected Backend Logs:
```
Resume parsing requested: resume_xxxxx
Resume parse job added to queue
Processing resume parse job...
Resume parsed successfully: resume_xxxxx
```

#### Troubleshooting:
- **Resume not parsing?**
  - Check Redis is running: `redis-cli ping` should return `PONG`
  - Check backend logs for errors
  - Check BullMQ queue status

- **Parsed data not showing?**
  - Refresh the page
  - Check resume status in database
  - Look for `parsedData` field in resume record

---

## ❌ Feature 2: Resume Tailoring (NEEDS CONNECTION)

### Backend Implementation:
- **Prompt**: `backend/src/ai/prompts/resume-tailor.prompt.ts` ✅
- **Agent**: `backend/src/ai/agents/resume-tailor.agent.ts` ✅
- **Service**: `backend/src/services/resume.service.ts` - `tailorResumeForJob()` ✅
- **Endpoint**: `POST /api/ai/resumes/tailor` ✅
- **Status**: **FULLY IMPLEMENTED**

### Frontend Implementation:
- **Service**: `frontend/src/services/aiService.ts`
- **Method**: `tailorResume()`
- **Status**: ❌ **USING MOCK DATA - NOT CONNECTED**

### Problem:

The frontend `aiService.ts` currently returns mock data with fake delays:

```typescript
// CURRENT CODE (MOCK):
export const aiService = {
  tailorResume: async (resume, job, onProgress) => {
    onProgress('Analyzing job requirements...', 20);
    await delay(1500); // FAKE DELAY

    // Returns MOCK data
    return {
      matchScore: Math.floor(70 + Math.random() * 20), // Random!
      tailoredContent: { /* fake data */ }
    };
  }
}
```

### Solution: Connect to Real Backend

**File to Update**: `frontend/src/services/aiService.ts`

Replace the mock implementation with:

```typescript
import { apiClient } from '@/lib/api';

export const aiService = {
  tailorResume: async (
    resumeId: string,
    jobId: string,
    onProgress?: (message: string, progress: number) => void
  ): Promise<TailoredResume> => {
    try {
      onProgress?.('Sending resume to AI...', 10);

      const response = await apiClient.post('/ai/resumes/tailor', {
        resumeId,
        jobId,
        focusAreas: [] // Optional
      });

      onProgress?.('Processing AI response...', 90);

      return {
        originalResumeId: resumeId,
        jobId: jobId,
        matchScore: response.data.matchScore,
        tailoredContent: JSON.parse(response.data.tailoredResume.content),
        keywordAlignment: {
          matched: response.data.keywordOptimizations.emphasized,
          missing: response.data.keywordOptimizations.added
        },
        recommendations: response.data.recommendations,
        changes: response.data.changes.map((change: any) => ({
          section: change.section,
          type: change.type,
          description: change.description
        }))
      };
    } catch (error) {
      console.error('AI Tailoring Error:', error);
      throw error;
    }
  },

  // Keep cover letter generation as mock for now
  generateCoverLetter: async (
    resume: Resume,
    job: Job,
    tone: 'professional' | 'enthusiastic' | 'formal',
    notes: string,
    onProgress: (message: string, progress: number) => void
  ): Promise<CoverLetter> => {
    // ... existing mock implementation
  }
};
```

### Testing After Connection:

#### Prerequisites:
1. Backend running with Claude API key configured
2. Frontend running with updated `aiService.ts`
3. At least one **parsed** resume in database
4. At least one job with description in database

#### Test Flow:

1. **Setup Test Data**
   ```sql
   -- Check you have a parsed resume
   SELECT id, title, "parsedData" IS NOT NULL as has_parsed_data
   FROM "Resume"
   WHERE "userId" = 'your_user_id';

   -- Check you have a job with description
   SELECT id, title, company, "jobDescription" IS NOT NULL as has_description
   FROM "Job"
   WHERE "userId" = 'your_user_id';
   ```

2. **Trigger Tailoring**
   - Go to a Job detail page
   - Click "Tailor Resume" button
   - Select a parsed resume
   - Click "Start Tailoring"

3. **Observe Progress**
   - Should see "Sending resume to AI..."
   - Wait for AI processing (10-30 seconds)
   - Should see "Processing AI response..."

4. **Verify Results**
   - Match Score displayed (0-100)
   - Changes listed with reasons
   - Keyword alignment shown
   - Recommendations provided
   - Tailored resume content displayed

#### Expected Backend Logs:
```
Starting resume tailoring - resumeId: xxx, jobId: yyy
Calling AI agent for resume tailoring
AI agent completed successfully - matchScore: 85, impact: high
Resume tailoring completed - tokens used: 1234
```

#### Expected Response Structure:
```json
{
  "success": true,
  "data": {
    "tailoredResume": {
      "content": "{ ...parsed resume JSON... }",
      "format": "markdown"
    },
    "matchScore": 85,
    "changes": [
      {
        "section": "Summary",
        "type": "modified",
        "description": "Enhanced summary with relevant keywords",
        "before": "Original text...",
        "after": "Improved text..."
      }
    ],
    "recommendations": [
      "Add more quantifiable achievements",
      "Include specific technologies mentioned"
    ],
    "keywordOptimizations": {
      "added": ["React", "TypeScript"],
      "emphasized": ["Leadership", "Agile"]
    }
  },
  "message": "Resume tailored successfully"
}
```

---

## 🔍 API Endpoints Reference

### Resume Parsing:
```
POST /api/resumes/:id/parse
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "resume": {
      "id": "xxx",
      "parsedData": { ...parsed resume structure... }
    }
  }
}
```

### Resume Tailoring:
```
POST /api/ai/resumes/tailor
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "resumeId": "resume_xxx",
  "jobId": "job_yyy",
  "focusAreas": [] // optional
}

Response:
{
  "success": true,
  "data": {
    "matchScore": 85,
    "tailoredResume": { ... },
    "changes": [ ... ],
    "recommendations": [ ... ],
    "keywordOptimizations": { ... }
  }
}
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "Resume must be parsed before tailoring"
**Cause**: Resume doesn't have `parsedData`
**Solution**:
1. Parse the resume first using `/api/resumes/:id/parse`
2. Wait for background job to complete
3. Verify `parsedData` field exists in database

### Issue 2: "Job description is too short or missing"
**Cause**: Job description is less than 50 characters
**Solution**: Add a proper job description to the job record

### Issue 3: AI tailoring times out
**Cause**: Claude API call taking too long
**Solution**:
- Check Claude API key is configured
- Verify Claude API quota
- Check backend logs for specific errors
- Increase timeout in axios config

### Issue 4: "Not authorized to access this resume/job"
**Cause**: User doesn't own the resume or job
**Solution**: Ensure userId matches for both resources

### Issue 5: Mock data still showing
**Cause**: Frontend not updated or cache issue
**Solution**:
1. Clear browser cache
2. Hard refresh (Ctrl+Shift+R)
3. Verify `aiService.ts` changes are saved
4. Restart frontend dev server

---

## 📊 Testing Checklist

### Resume Parsing:
- [ ] Upload resume successfully
- [ ] Trigger parse job
- [ ] Job added to BullMQ queue
- [ ] Job processed successfully
- [ ] Parsed data saved to database
- [ ] Parsed data displayed in UI
- [ ] Personal info extracted correctly
- [ ] Work experience listed
- [ ] Education details present
- [ ] Skills identified

### Resume Tailoring (After Connection):
- [ ] Select parsed resume
- [ ] Select job with description
- [ ] Trigger tailoring
- [ ] AI agent called successfully
- [ ] Match score calculated (0-100)
- [ ] Changes listed with reasons
- [ ] Keyword alignment shown
- [ ] Recommendations provided
- [ ] Tailored content displayed
- [ ] Token usage logged
- [ ] Error handling works

---

## 🚀 Next Steps

1. **Connect Resume Tailoring**
   - Update `frontend/src/services/aiService.ts`
   - Replace mock with real API calls
   - Test end-to-end

2. **Implement Cover Letter Generation**
   - Create cover letter agent (backend)
   - Add service method
   - Connect frontend

3. **Implement Mock Interview**
   - Create interview agent (backend)
   - Handle conversational state
   - Connect frontend

4. **Add Caching**
   - Cache tailoring results (same resume + job)
   - Use Redis for fast lookups
   - Set reasonable TTL

---

## 📝 Environment Variables Required

### Backend (.env):
```bash
# Required for AI features
ANTHROPIC_API_KEY=sk-ant-xxx

# Required for background jobs
REDIS_URL=redis://localhost:6379

# Required for database
DATABASE_URL=postgresql://user:pass@localhost:5432/ai_career_coach
```

### Frontend (.env):
```bash
VITE_API_URL=http://localhost:5001
```

---

## 💡 Tips for Testing

1. **Use Real Data**: Test with actual resume PDFs and real job descriptions for best results

2. **Check Logs**: Always monitor backend logs to see what's happening:
   ```bash
   cd backend && npm run dev | grep "AI:"
   ```

3. **Test Error Cases**: Try invalid inputs to verify error handling:
   - Unparsed resume
   - Missing job description
   - Invalid IDs

4. **Monitor Token Usage**: Check logs for token consumption to estimate costs

5. **Test Different Resume Types**: Try various resume formats (1-page, multi-page, different structures)

6. **Verify Match Scores**: Ensure scores make sense (0-100, higher = better match)

---

## 🎯 Success Criteria

### Resume Parsing:
✅ Resume uploaded and parsed within 30 seconds
✅ All major sections extracted (personal info, experience, education, skills)
✅ At least 80% accuracy on well-formatted resumes

### Resume Tailoring:
✅ Tailoring completes within 30 seconds
✅ Match score between 0-100 returned
✅ At least 3 meaningful changes suggested
✅ Keywords properly aligned with job description
✅ Recommendations are actionable

---

**Last Updated**: 2025-10-13
**Status**: Resume Parsing READY, Resume Tailoring NEEDS CONNECTION
