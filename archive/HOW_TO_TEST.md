# How to Test AI Features - Step by Step Guide

## ✅ Status: Resume Parsing & Tailoring NOW CONNECTED!

Both features are now connected to the real backend and ready for testing.

---

## 🚀 Quick Start

### Prerequisites:

1. **Backend Environment Variables**:
```bash
# backend/.env
DATABASE_URL=postgresql://user:pass@localhost:5432/ai_career_coach
REDIS_URL=redis://localhost:6379
ANTHROPIC_API_KEY=sk-ant-your-api-key-here
JWT_SECRET=your-secret-key
```

2. **Frontend Environment Variables**:
```bash
# frontend/.env
VITE_API_URL=http://localhost:5001
```

3. **Services Running**:
- PostgreSQL database
- Redis server
- Backend API server
- Frontend dev server

---

## 📦 Installation & Setup

### Step 1: Start Services

```bash
# Terminal 1: Start Redis
redis-server

# Terminal 2: Start Backend
cd backend
npm install
npm run dev
# Should see: Server running on http://localhost:5001

# Terminal 3: Start Frontend
cd frontend
npm install
npm run dev
# Should see: Local: http://localhost:5173
```

### Step 2: Verify Services

```bash
# Check Redis
redis-cli ping
# Should return: PONG

# Check Backend
curl http://localhost:5001/health
# Should return: {"success":true,"message":"AI Career Coach API is running"}

# Check Frontend
# Open browser to http://localhost:5173
# Should see login/register page
```

---

## 🧪 Test Flow: Complete End-to-End

### Part 1: User Registration & Login

1. **Open Browser**: `http://localhost:5173`

2. **Register New Account**:
   - Click "Register" or "Sign Up"
   - Enter:
     - Email: `test@example.com`
     - Password: `Test123!@#`
     - First Name: `John`
     - Last Name: `Doe`
   - Click "Create Account"

3. **Verify Login**:
   - Should redirect to dashboard
   - Top right should show "John Doe" or "JD"

---

### Part 2: Upload & Parse Resume

#### Upload Resume:

1. **Navigate to Resumes Page**:
   - Click "Resumes" in sidebar/navigation
   - Should see resume list (empty initially)

2. **Upload a Resume**:
   - Click "Upload Resume" button
   - Select a PDF or DOCX file
     - Sample resumes: `backend/test/sample-resumes/` (if exists)
     - Or use any resume file you have
   - Enter title: "My Software Engineer Resume"
   - Click "Upload"

3. **Verify Upload**:
   - Should see new resume in list
   - Status: "Uploaded" or "Unparsed"

#### Parse Resume:

1. **Trigger Parsing**:
   - Find your uploaded resume
   - Click "Parse Resume" or similar button
   - Should see loading indicator

2. **Wait for Background Job** (5-30 seconds):
   - Backend processes resume in background queue
   - Can check backend logs for progress:
     ```
     Resume parsing requested: resume_xxx
     Resume parse job added to queue
     Processing resume parse job...
     Resume parsed successfully
     ```

3. **Verify Parsing Complete**:
   - Refresh page
   - Resume should now show "Parsed" status
   - Click on resume to view details
   - Should see extracted data:
     - ✅ Personal Information (name, email, phone)
     - ✅ Work Experience (companies, positions, dates)
     - ✅ Education (degrees, institutions)
     - ✅ Skills (list of skills)
     - ✅ Certifications (if any)

#### Troubleshooting Resume Parsing:

**Issue**: Resume not parsing?
```bash
# Check Redis connection
redis-cli ping

# Check backend logs
cd backend && npm run dev
# Look for "Resume parse job added to queue"

# Check BullMQ queue
redis-cli
> KEYS *bull*
> LLEN bull:resume-parse:wait
```

**Issue**: Parsing takes too long?
- Check Claude API key is configured
- Check API quota isn't exceeded
- Try with a simpler resume (1-2 pages)

---

### Part 3: Create a Job Posting

1. **Navigate to Jobs Page**:
   - Click "Jobs" in sidebar/navigation

2. **Add New Job**:
   - Click "Add Job" or "Create Job"
   - Fill in:
     - **Title**: "Senior Software Engineer"
     - **Company**: "Tech Corp Inc"
     - **Location**: "San Francisco, CA"
     - **Work Mode**: "Hybrid"
     - **Job Type**: "Full Time"
     - **Salary Range**: $120,000 - $180,000
     - **Job Description** (IMPORTANT - must be at least 50 characters):
       ```
       We are looking for a Senior Software Engineer to join our team.

       Requirements:
       - 5+ years of software development experience
       - Strong proficiency in React, TypeScript, and Node.js
       - Experience with cloud platforms (AWS, Azure, or GCP)
       - Excellent problem-solving and communication skills
       - Experience with agile development methodologies

       Responsibilities:
       - Design and develop scalable web applications
       - Lead technical architecture decisions
       - Mentor junior developers
       - Collaborate with cross-functional teams
       - Participate in code reviews and technical discussions

       Nice to have:
       - Experience with GraphQL
       - Knowledge of Docker and Kubernetes
       - Open source contributions
       ```
   - Click "Save" or "Create Job"

3. **Verify Job Created**:
   - Should see job in jobs list
   - Click on job to view details
   - Verify job description shows correctly

---

### Part 4: Tailor Resume for Job (THE MAIN TEST!)

#### Prerequisites Check:
```bash
# Verify you have:
# ✅ At least one PARSED resume (parsedData field exists)
# ✅ At least one job with description (50+ characters)
# ✅ Backend running with Claude API key
# ✅ Frontend running with updated aiService.ts
```

#### Trigger Resume Tailoring:

1. **Navigate to Job Details**:
   - Go to Jobs page
   - Click on the job you created

2. **Start Tailoring**:
   - Look for "Tailor Resume" or "AI Optimize" button
   - Click it
   - Select your **parsed** resume from dropdown
   - Click "Start Tailoring" or "Generate"

3. **Watch Progress** (10-30 seconds):
   - Should see progress indicators:
     - "Sending resume to AI..." (10%)
     - "Processing AI response..." (80%)
     - "Finalizing..." (95%)
     - "Complete!" (100%)

4. **View Results**:
   Should see:

   **Match Score**:
   - Number between 0-100
   - Higher = better match
   - Example: "85% Match"

   **Changes Made**:
   - List of modifications
   - Each change shows:
     - Section (e.g., "Summary", "Experience")
     - Type (e.g., "Modified", "Added")
     - Description (reason for change)
   - Example:
     ```
     Summary - Modified
     Enhanced summary to include job-specific keywords and highlight relevant experience

     Experience - Modified
     Added quantifiable achievements that match job requirements
     ```

   **Keyword Alignment**:
   - Matched Keywords: Skills you have that match job
     - Example: ["React", "TypeScript", "Node.js", "AWS"]
   - Missing Keywords: Skills from job you don't have
     - Example: ["GraphQL", "Kubernetes"]

   **Recommendations**:
   - List of actionable suggestions
   - Example:
     ```
     - Add more specific metrics to quantify achievements
     - Emphasize leadership experience relevant to this role
     - Consider taking a GraphQL course to fill skill gap
     ```

   **Tailored Resume Content**:
   - Full tailored resume
   - Can compare with original
   - Should see optimized wording
   - Keywords naturally integrated

---

## 📊 Expected Results

### Resume Parsing:

**Input**: Resume PDF/DOCX file

**Output** (in `parsedData` field):
```json
{
  "personalInfo": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1-555-0123",
    "location": "San Francisco, CA"
  },
  "summary": "Experienced software engineer...",
  "experiences": [
    {
      "company": "Tech Company",
      "position": "Software Engineer",
      "startDate": "2020-01",
      "endDate": null,
      "isCurrent": true,
      "achievements": ["Led team of 5", "Increased performance by 40%"]
    }
  ],
  "skills": [
    { "name": "JavaScript", "category": "Programming Languages" },
    { "name": "React", "category": "Frameworks" }
  ]
}
```

### Resume Tailoring:

**Input**:
- Parsed resume
- Job with description

**Output**:
```json
{
  "matchScore": 85,
  "changes": [
    {
      "section": "Summary",
      "type": "modified",
      "description": "Enhanced with job-relevant keywords"
    }
  ],
  "keywordAlignment": {
    "matched": ["React", "Node.js", "AWS"],
    "missing": ["GraphQL", "Docker"]
  },
  "recommendations": [
    "Add metrics to achievements",
    "Emphasize leadership experience"
  ]
}
```

---

## 🐛 Troubleshooting

### Issue 1: "Resume must be parsed before tailoring"

**Cause**: Resume doesn't have parsed data

**Solution**:
1. Go to Resumes page
2. Find your resume
3. Click "Parse Resume"
4. Wait for parsing to complete (refresh page)
5. Verify resume shows "Parsed" status
6. Try tailoring again

### Issue 2: "Job description is too short or missing"

**Cause**: Job description is less than 50 characters

**Solution**:
1. Edit the job
2. Add a detailed job description (see example above)
3. Must be at least 50 characters
4. Include requirements and responsibilities
5. Save job
6. Try tailoring again

### Issue 3: AI Tailoring Times Out

**Symptoms**:
- Request takes longer than 60 seconds
- Browser shows timeout error

**Solutions**:
1. Check Claude API key is set:
   ```bash
   cd backend
   grep ANTHROPIC_API_KEY .env
   ```

2. Check Claude API quota:
   - Visit https://console.anthropic.com/
   - Check usage and limits

3. Check backend logs for errors:
   ```bash
   cd backend
   npm run dev
   # Look for errors in output
   ```

4. Try with a shorter resume/job description

### Issue 4: Network Errors

**Error**: "Unable to connect to server"

**Solutions**:
1. Verify backend is running:
   ```bash
   curl http://localhost:5001/health
   ```

2. Check frontend API URL:
   ```bash
   cd frontend
   cat .env
   # Should show: VITE_API_URL=http://localhost:5001
   ```

3. Check for CORS errors in browser console

4. Restart both frontend and backend

### Issue 5: Authentication Errors

**Error**: "Not authorized" or 401/403 errors

**Solutions**:
1. Check you're logged in (see user name in top right)
2. Try logging out and back in
3. Clear browser cache/cookies
4. Check JWT token in browser DevTools:
   - Open DevTools (F12)
   - Go to Application → Local Storage
   - Look for "auth-storage"
   - Should have token and user data

### Issue 6: Mock Data Still Showing

**Cause**: Frontend not updated or cache issue

**Solutions**:
1. Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
2. Clear browser cache
3. Verify `aiService.ts` was updated:
   ```bash
   cd frontend/src/services
   head -20 aiService.ts
   # Should see "import { apiClient }" at top
   ```
4. Restart frontend dev server:
   ```bash
   cd frontend
   npm run dev
   ```

---

## 📝 Backend Logs to Watch

### Successful Resume Parsing:
```
Resume parsing requested: resume_clxxx
Resume parse job added to queue: { resumeId: 'clxxx', userId: 'clyyyy' }
Processing resume parse job...
Claude API request - model: claude-sonnet-4-5
Claude API response - inputTokens: 1234, outputTokens: 2345, cost: $0.0234
Resume parsed successfully: resume_clxxx
```

### Successful Resume Tailoring:
```
Starting resume tailoring - resumeId: clxxx, jobId: clyyy
Calling AI agent for resume tailoring
Claude API request - model: claude-sonnet-4-5
Claude API response - inputTokens: 2345, outputTokens: 3456, cost: $0.0456
AI agent completed successfully - matchScore: 85, changesCount: 5, impact: high
Resume tailoring completed - tokens: 5801
```

### Errors to Watch For:
```
❌ Error: Resume must be parsed before tailoring
❌ Error: Job description is too short or missing
❌ Error: Claude API error: rate_limit_exceeded
❌ Error: Failed to parse resume data
```

---

## 🎯 Success Criteria

### Resume Parsing:
- [ ] Resume uploaded successfully
- [ ] Parse job triggered
- [ ] Background job completed in < 30 seconds
- [ ] Parsed data visible in UI
- [ ] Personal info extracted (name, email, phone)
- [ ] At least 1 work experience found
- [ ] At least 1 education found
- [ ] At least 3 skills found

### Resume Tailoring:
- [ ] Tailoring triggered successfully
- [ ] Progress indicators shown
- [ ] Completed in < 60 seconds
- [ ] Match score displayed (0-100)
- [ ] At least 3 changes listed
- [ ] Keyword alignment shown
- [ ] Recommendations provided
- [ ] Tailored content displayed
- [ ] No mock/fake data visible

---

## 💰 Cost Estimates

### Per Resume Parsing:
- Tokens: ~1,500 - 3,000
- Cost: ~$0.02 - $0.05 per resume

### Per Resume Tailoring:
- Tokens: ~3,000 - 6,000
- Cost: ~$0.05 - $0.12 per tailoring

### For Testing (10 resumes + 10 tailorings):
- Total: ~$0.70 - $1.70

---

## 📞 Getting Help

If you encounter issues:

1. **Check Backend Logs**: Most errors are logged here
2. **Check Browser Console**: Look for JavaScript errors (F12)
3. **Check Network Tab**: See actual API requests/responses (F12 → Network)
4. **Verify Environment**: Double-check .env files
5. **Restart Services**: When in doubt, restart everything

---

**Last Updated**: 2025-10-13
**Status**: ✅ Resume Parsing & Tailoring FULLY CONNECTED AND READY TO TEST
