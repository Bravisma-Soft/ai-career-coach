⏺ Context Checkpoint: AI Career Coach - Resume Parsing Fix

  Project Overview

  Full-stack AI-powered career coaching application with resume management, parsing, and tailoring features.

  Tech Stack:
  - Backend: Node.js, Express, TypeScript, Prisma, PostgreSQL, BullMQ/Redis, Claude AI
  - Frontend: React, TypeScript, Vite, TanStack Query, Zustand, Tailwind CSS, shadcn/ui

  Session Goal

  Fix resume parsing workflow where uploaded resumes weren't displaying parsed data in the frontend.

  Issues Identified & Fixed

  ✅ Completed Fixes

  1. Frontend Display Issues
    - Fixed resume type display showing "Version"/"Master" instead of actual file type (PDF/Text)
        - File: frontend/src/components/resumes/ResumeCard.tsx:125
    - Fixed preview modal showing "PDF preview" message for all file types
        - File: frontend/src/components/resumes/ResumePreview.tsx:59-96
      - Now renders raw text for text files, appropriate message for PDFs
    - Added rawText and parsedData fields to Resume type
  2. Response Mapping
    - Fixed frontend to handle backend response structure: { success: true, data: [...], pagination: {...} }
        - File: frontend/src/services/resumeService.ts:53-86
    - Mapped backend fields to frontend format:
        - experiences → experience with description string→array conversion
      - educations → education with field mapping
      - isCurrent → current
      - Added ID generation for missing IDs
  3. Infinite Polling Loop
    - Fixed polling that refreshed page every 3 seconds indefinitely
        - File: frontend/src/hooks/useResumes.ts:119-183
    - Now polls every 5 seconds for max 2 minutes
    - Stops on successful parse, error, or timeout
    - Detects parse errors properly
  4. Master Resume Display
    - Added useEffect to sync resumes with Zustand store
        - File: frontend/src/hooks/useResumes.ts:21-26
    - Master resume now displays in top section correctly
  5. Frontend Dev Server
    - Fixed SWC native binding error
    - Switched from @vitejs/plugin-react-swc to @vitejs/plugin-react
        - File: frontend/vite.config.ts:2
  6. Backend Re-parsing Logic
    - Fixed service to allow re-parsing resumes with errors
        - File: backend/src/services/resume.service.ts:242-256
    - Previously skipped parsing if parsedData existed (even with errors)
  7. Dependencies
    - Reinstalled iconv-lite in backend to fix missing encodings error

  Key Architecture

  Resume Parsing Flow

  1. Upload → POST /api/resumes/upload → saves file, creates DB record
  2. Parse Trigger → POST /api/resumes/:id/parse → enqueues BullMQ job
  3. Worker → backend/src/jobs/processors/resume-parse.processor.ts
    - Downloads file from storage
    - Extracts text (PDF via pdf-parse, DOCX via mammoth, TXT direct)
    - Calls AI parser agent with Claude API
    - Saves rawText and parsedData to DB
  4. Frontend Polling → fetches every 5s until complete/error/timeout

  Key Files

  - Backend:
    - backend/src/services/resume.service.ts - Resume CRUD & parse logic
    - backend/src/jobs/processors/resume-parse.processor.ts - Parse job processor
    - backend/src/utils/document-parser.ts - Text extraction from files
    - backend/src/ai/agents/resume-parser.agent.ts - AI parsing agent
    - backend/src/ai/prompts/resume-parser.prompt.ts - Parse prompt template
  - Frontend:
    - frontend/src/services/resumeService.ts - API service with mapping logic
    - frontend/src/hooks/useResumes.ts - React Query hooks with polling
    - frontend/src/components/resumes/ResumeCard.tsx - Resume card display
    - frontend/src/components/resumes/ResumePreview.tsx - Preview modal
    - frontend/src/types/resume.ts - TypeScript interfaces

  Outstanding Issue: PDF Parsing

  Problem

  PDF parsing fails with error: "(0 , pdf_parse_1.default) is not a function"

  Attempted Fixes (NOT Working)

  1. Changed import from import pdf from 'pdf-parse' to const pdfParse = require('pdf-parse')
  2. Updated calls from pdf(buffer) to pdfParse(buffer)
  3. File: backend/src/utils/document-parser.ts:1-6, 34

  Current Status

  - Text resume parsing: ✅ Working
  - PDF resume parsing: ❌ Still failing with same error
  - Error appears to be CommonJS/ESM module compatibility issue with pdf-parse package
  - updatedAt timestamp not changing, suggesting either:
    - Parse job not actually running
    - Error being cached
    - Backend not restarted properly

  Diagnostic Info

  - pdf-parse@2.3.0 is installed in backend/node_modules
  - Backend needs to check for actual error logs during parse attempt
  - May need to check BullMQ worker logs or Redis queue status

  Next Steps for Continuation

  1. Verify Backend Restart
    - Ensure backend server fully restarted after code changes
    - Check if worker process is running separately
  2. Debug PDF Parsing
    - Check backend console logs for detailed error stack trace
    - Verify BullMQ worker is processing jobs (check Redis or worker logs)
    - Try alternative pdf-parse import methods:
        - import pdfParse from 'pdf-parse/lib/pdf-parse.js'
      - Check if canvas or other dependencies are missing
    - Consider alternative PDF libraries: pdfjs-dist, pdf2json
  3. Test Flow
    - Upload new PDF resume
    - Click "Parse Resume"
    - Monitor backend logs for parse job execution
    - Check if updatedAt timestamp changes
    - Verify rawText is populated even if parsing fails
  4. Clean Up
    - Remove debug console.log statements once working
    - Test complete flow: upload → parse → preview → edit
    - Test both PDF and text resumes end-to-end

  Critical Code Patterns

  Frontend Resume Mapping:
  // Handle backend response structure
  if (response.data.success && Array.isArray(response.data.data))

  // Convert description string to array
  description: typeof exp.description === 'string'
    ? exp.description.split('\n').filter(line => line.trim())
    : Array.isArray(exp.description) ? exp.description : []

  Backend Re-parse Logic:
  const hasError = resume.parsedData &&
    typeof resume.parsedData === 'object' &&
    'error' in resume.parsedData;

  if (resume.parsedData && !hasError) {
    return resume; // Already parsed successfully
  }
  // Allow re-parsing on error