# Project Context Checkpoint - October 14, 2025

## Session Summary
Fixed critical resume parsing display issues where PDF resumes appeared unparsed in the frontend despite successful backend processing.

## Project Overview
**AI Career Coach** - Full-stack application helping users optimize resumes and manage job applications using Claude AI.

**Stack**: Node.js/Express/TypeScript (backend), React/TypeScript/Vite (frontend), PostgreSQL, Redis, BullMQ, Claude Sonnet 4.5

## Issues Resolved This Session

### 1. Frontend Not Recognizing Parsed Resumes
**Problem**: Resumes showed "Parse Resume" button even after successful parsing
**Root Cause**: Backend returned Prisma models with `parsedData` as nested JSON, but frontend expected flattened top-level fields (`personalInfo`, `experience`, `education`, `skills`)
**Solution**: Created `backend/src/utils/resume-serializer.ts` to transform responses

### 2. Resume Preview Not Displaying Data
**Problem**: Preview modal showed placeholders/raw text instead of structured data
**Solution**: Updated `frontend/src/components/resumes/ResumePreview.tsx` to render parsed fields with proper formatting

### 3. Worker Process Running Stale Code
**Problem**: Background worker had old code with PDF parsing bugs
**Solution**: Killed and restarted worker processes to pick up fixed code from previous session (pdf-parse@1.1.1)

## Key Files Modified

### Backend
- **`src/utils/resume-serializer.ts`** (NEW) - Serializes Prisma Resume → Frontend DTO with flattened fields
  - `serializeResume()` - Transforms single resume
  - `serializeResumes()` - Transforms array
  - Maps parsed data to top-level personalInfo, experience, education, skills

- **`src/services/resume.service.ts`** - Updated all methods to return `SerializedResume`
  - Added `getRawResumeById()` for internal use (returns Prisma model)
  - Modified: uploadResume, getResumes, getResumeById, updateResume, setPrimaryResume, parseResume

### Frontend
- **`src/components/resumes/ResumePreview.tsx`** - Complete rewrite of preview logic
  - Prioritizes displaying structured parsed data
  - Falls back to raw text if no parsed data
  - Shows formatted sections: Personal Info, Summary, Experience, Education, Skills

## Architecture Patterns

### Data Flow
```
Database (parsedData JSON)
  → Prisma Model
  → Serializer (flattens structure)
  → API Response
  → Frontend (displays structured data)
```

### Type Safety
- Backend: `SerializedResume` interface matches frontend expectations
- Frontend: `Resume` type includes optional parsed fields
- Frontend check: `resume.personalInfo && resume.experience && resume.education && resume.skills`

## Developer Workflow Tools

Created two options for git commit/push workflow:

1. **`git-submit.sh`** (Recommended) - Local bash script, no API calls
   ```bash
   ./git-submit.sh "Your commit message"
   ```

2. **`.claude/commands/git-submit.md`** - Claude Code slash command (uses API)
   ```
   /git-submit
   ```

Both add Claude Code attribution footer automatically.

## Current System Status

✅ **Working**:
- PDF and DOCX parsing (pdf-parse@1.1.1, mammoth)
- Background job processing (BullMQ + Redis)
- Resume data serialization and display
- Structured preview in frontend
- Worker process running with fixed code

⚠️ **Known Limitations**:
- PDF file preview not rendered (only parsed data shown)
- No real-time job status updates during parsing
- 5-second polling for completion (could be optimized with websockets)

## Service Status
- **PostgreSQL**: Running (Docker, port 5432)
- **Redis**: Running (Docker, port 6379)
- **Backend Server**: Running (port 3000)
- **Resume Parser Worker**: Running (ts-node-dev, auto-restart enabled)

## Recent Commits
- `ba6fea6` - feat: Add resume data serialization and structured preview
- `ab2a2ec` - fix: PDF parsing and TypeScript compilation issues

## Next Steps / TODOs

### High Priority
- [ ] Test resume editing workflow with serialized data
- [ ] Verify "Set as Master" functionality with new data structure
- [ ] Test resume download functionality

### Medium Priority
- [ ] Add error boundary for preview component
- [ ] Implement PDF file preview (consider react-pdf library)
- [ ] Add loading states during preview data fetch
- [ ] Optimize polling mechanism (consider websockets)

### Low Priority
- [ ] Add resume comparison feature
- [ ] Export resume to different formats
- [ ] Add resume analytics/insights

## Documentation References
- See `FIXES_AND_TESTING.md` for previous PDF parsing fixes
- See `HOW_TO_TEST.md` for testing procedures
- See `career_coach_architecture_original.md` for full system architecture

## Key Dependencies
- `pdf-parse@1.1.1` - PDF text extraction (downgraded from 2.x for compatibility)
- `mammoth@1.11.0` - DOCX parsing
- `@anthropic-ai/sdk@0.65.0` - Claude API client
- `bullmq@5.61.0` - Background job queue
- `prisma@6.17.0` - Database ORM

## Testing Notes
- Successfully tested with "Gaurav Chawla - Resume.pdf" (2 pages, 835 words)
- Successfully tested with text resume files
- Preview displays all parsed sections correctly
- Edit button opens form with correct data structure
