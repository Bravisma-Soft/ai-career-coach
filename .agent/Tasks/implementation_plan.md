# AI Career Coach - Complete Implementation Plan

**Document Version**: 1.0.0
**Date**: 2025-10-13
**Current Completion**: ~35%
**Target Completion**: 100%

---

## Executive Summary

Based on comprehensive gap analysis, the AI Career Coach application requires **~65% additional implementation** to match the original architecture. This document provides a step-by-step implementation plan organized into 5 phases with detailed prompts for each task.

**Key Metrics**:
- Total remaining features: ~120
- Estimated timeline: 18-20 weeks (full-time development)
- Critical path: AI layer implementation (Phase 1)
- Highest ROI: Resume tailoring + Cover letter generation

---

## Table of Contents

1. [Phase 1: Core AI Implementation](#phase-1-core-ai-implementation-4-6-weeks)
2. [Phase 2: Career Coaching & Advanced AI](#phase-2-career-coaching--advanced-ai-3-4-weeks)
3. [Phase 3: Infrastructure & Production Readiness](#phase-3-infrastructure--production-readiness-2-3-weeks)
4. [Phase 4: External Integrations](#phase-4-external-integrations-4-5-weeks)
5. [Phase 5: Enhancements & Polish](#phase-5-enhancements--polish-ongoing)
6. [Testing Strategy](#testing-strategy)
7. [Deployment Checklist](#deployment-checklist)

---

## Phase 1: Core AI Implementation (4-6 weeks)

**Goal**: Complete the core AI functionality that differentiates this product from basic job trackers.

**Priority**: CRITICAL
**Dependencies**: None (can start immediately)
**Estimated Time**: 4-6 weeks

---

### Task 1.1: Create AI Routes File

**File**: `backend/src/api/routes/ai.routes.ts`

**Prompt**:
```
Create a comprehensive AI routes file for the AI Career Coach backend at backend/src/api/routes/ai.routes.ts.

Requirements:
1. Create Express router with the following routes:
   - POST /ai/resumes/tailor - Tailor resume for a specific job
   - POST /ai/resumes/analyze - Analyze resume quality
   - POST /ai/cover-letters/generate - Generate cover letter
   - POST /ai/interviews/mock/start - Start mock interview session
   - POST /ai/interviews/mock/:sessionId/respond - Continue mock interview
   - POST /ai/interviews/mock/:sessionId/end - End mock interview and get feedback
   - POST /ai/interviews/prepare - Get interview preparation tips
   - POST /ai/jobs/match - Match jobs to user profile
   - POST /ai/jobs/analyze - Analyze job description
   - POST /ai/research/company - Research company
   - POST /ai/research/interviewer - Research interviewer

2. Each route should:
   - Use authenticate middleware
   - Use rate limiting (more restrictive for AI routes)
   - Validate request body with appropriate validators
   - Call corresponding AI agent
   - Return structured responses
   - Handle errors gracefully
   - Log AI usage for cost tracking

3. Request/Response schemas:
   - Tailor resume: { resumeId, jobId } → { tailoredResume, changes[], matchScore, recommendations[] }
   - Generate cover letter: { resumeId, jobId, tone? } → { coverLetter, suggestions[] }
   - Mock interview: { jobId, interviewType } → { sessionId, firstQuestion }
   - etc.

4. Add proper TypeScript types for all requests/responses

5. Mount this router in backend/src/app.ts at '/api/ai'

Refer to existing route files (auth.routes.ts, job.routes.ts) for code style and patterns.
```

**Acceptance Criteria**:
- [ ] File created with all 11 AI routes
- [ ] All routes protected with authentication
- [ ] Rate limiting applied (e.g., 10 requests/hour per user)
- [ ] TypeScript types defined
- [ ] Routes mounted in app.ts
- [ ] Postman/Thunder Client tests pass

**Dependencies**: None
**Estimated Time**: 4-6 hours

---

### Task 1.2: Implement Resume Tailor Agent

**File**: `backend/src/ai/agents/resume-tailor.agent.ts`

**Prompt**:
```
Implement the Resume Tailor AI Agent at backend/src/ai/agents/resume-tailor.agent.ts.

Requirements:
1. Extend BaseAgent class (backend/src/ai/agents/base.agent.ts)

2. Main method signature:
   async execute(params: {
     resume: ParsedResumeData;
     jobDescription: string;
     jobTitle: string;
     companyName: string;
   }): Promise<TailorResumeResult>

3. Functionality:
   - Extract key requirements from job description
   - Identify skills, keywords, and qualifications needed
   - Analyze resume for matching elements
   - Suggest modifications to:
     * Professional summary/objective
     * Work experience bullet points
     * Skills section
     * Project descriptions
   - Calculate match score (0-100)
   - Identify missing keywords
   - Provide actionable recommendations
   - Maintain resume structure and format
   - Preserve truthfulness (no fabrication)

4. Return structure:
   interface TailorResumeResult {
     tailoredResume: ParsedResumeData;
     matchScore: number;
     changes: Array<{
       section: string;
       field: string;
       original: string;
       modified: string;
       reason: string;
     }>;
     keywordAlignment: {
       matched: string[];
       missing: string[];
       suggestions: string[];
     };
     recommendations: string[];
     estimatedImpact: 'high' | 'medium' | 'low';
   }

5. Use temperature: 0.5 for balanced creativity and accuracy
6. Use max_tokens: 8000 to handle large resumes
7. Add retry logic for failures
8. Track token usage via ClaudeClientManager
9. Add comprehensive error handling

Reference backend/src/ai/agents/resume-parser.agent.ts for code patterns.
```

**Acceptance Criteria**:
- [ ] Agent extends BaseAgent correctly
- [ ] Processes resume and job description
- [ ] Returns structured TailorResumeResult
- [ ] Match score is calculated reasonably
- [ ] Changes are tracked with explanations
- [ ] Keywords are identified correctly
- [ ] Error handling is robust
- [ ] Token usage is tracked
- [ ] Unit tests pass

**Dependencies**: Task 1.1
**Estimated Time**: 1-2 days

---

### Task 1.3: Create Resume Tailor Prompt

**File**: `backend/src/ai/prompts/resume-tailor.prompt.ts`

**Prompt**:
```
Create a comprehensive system prompt for resume tailoring at backend/src/ai/prompts/resume-tailor.prompt.ts.

Requirements:
1. Export a string constant: RESUME_TAILOR_PROMPT

2. Prompt should instruct Claude to:
   - Act as an expert resume optimization specialist
   - Analyze job descriptions for key requirements
   - Identify relevant skills and keywords
   - Suggest targeted modifications
   - Maintain resume truthfulness
   - Follow ATS (Applicant Tracking System) best practices
   - Optimize for keyword matching
   - Preserve professional tone
   - Return structured JSON output

3. Include examples of good vs. bad tailoring

4. Specify output format exactly:
   {
     "tailoredResume": { ... },
     "matchScore": 85,
     "changes": [
       {
         "section": "experience",
         "field": "achievements",
         "original": "Led team projects",
         "modified": "Led cross-functional team of 5 engineers in agile projects, delivering 3 major features",
         "reason": "Added quantifiable metrics and relevant keywords (agile, cross-functional)"
       }
     ],
     "keywordAlignment": { ... },
     "recommendations": [ ... ]
   }

5. Emphasize:
   - Never fabricate experiences or skills
   - Only enhance existing content
   - Use action verbs
   - Quantify achievements when possible
   - Match language style of job description

Reference backend/src/ai/prompts/resume-parser.prompt.ts for structure.
```

**Acceptance Criteria**:
- [ ] Prompt exported as constant
- [ ] Instructions are clear and comprehensive
- [ ] Output format is strictly defined
- [ ] Examples provided for clarity
- [ ] ATS optimization guidance included
- [ ] Ethical guidelines emphasized

**Dependencies**: None
**Estimated Time**: 3-4 hours

---

### Task 1.4: Create Resume Tailor Service Method

**File**: `backend/src/services/resume.service.ts` (add method)

**Prompt**:
```
Add a resume tailoring method to the existing ResumeService at backend/src/services/resume.service.ts.

Requirements:
1. Add method:
   async tailorResumeForJob(
     userId: string,
     resumeId: string,
     jobId: string
   ): Promise<TailorResumeResult>

2. Functionality:
   - Verify user owns the resume
   - Verify user owns the job
   - Fetch resume with parsed data
   - Fetch job with description
   - Validate resume has been parsed
   - Call ResumeTailorAgent.execute()
   - Optionally save tailored version as new resume
   - Return result

3. Error handling:
   - Resume not found
   - Job not found
   - Resume not parsed yet
   - Unauthorized access
   - AI agent failures

4. Add logging for AI operations

5. Consider caching results (same resume + job combo)

Reference existing methods in resume.service.ts for code patterns.
```

**Acceptance Criteria**:
- [ ] Method added to ResumeService
- [ ] Proper validation of user ownership
- [ ] Calls ResumeTailorAgent correctly
- [ ] Returns TailorResumeResult
- [ ] Error handling is comprehensive
- [ ] Logging added
- [ ] Integration tests pass

**Dependencies**: Task 1.2, 1.3
**Estimated Time**: 4-6 hours

---

### Task 1.5: Create AI Validators

**File**: `backend/src/api/validators/ai.validator.ts`

**Prompt**:
```
Create Zod validation schemas for all AI endpoints at backend/src/api/validators/ai.validator.ts.

Requirements:
1. Create validators using Zod for:
   - tailorResumeSchema: { resumeId: string (cuid), jobId: string (cuid) }
   - generateCoverLetterSchema: { resumeId, jobId, tone?: enum }
   - analyzeresumeSchema: { resumeId }
   - analyzeJobSchema: { jobId }
   - matchJobsSchema: { limit?: number }
   - startMockInterviewSchema: { jobId, interviewType: enum }
   - respondMockInterviewSchema: { sessionId, answer: string }
   - endMockInterviewSchema: { sessionId }
   - prepareInterviewSchema: { jobId, interviewId }
   - researchCompanySchema: { companyName: string, jobId?: string }
   - researchInterviewerSchema: { name: string, company: string, linkedinUrl?: string }

2. Validation rules:
   - All IDs must be valid CUIDs
   - String fields must have min/max lengths
   - Enums must match database enums (InterviewType, etc.)
   - Optional fields properly typed

3. Export validate middleware for each:
   export const validateTailorResume = validate(tailorResumeSchema);

4. Add helpful error messages

Reference backend/src/api/validators/job.validator.ts for patterns.
```

**Acceptance Criteria**:
- [ ] All 11 validators created
- [ ] Zod schemas properly typed
- [ ] Validate middleware exported
- [ ] Error messages are clear
- [ ] Edge cases handled

**Dependencies**: None
**Estimated Time**: 2-3 hours

---

### Task 1.6: Implement Cover Letter Agent

**File**: `backend/src/ai/agents/cover-letter.agent.ts`

**Prompt**:
```
Implement the Cover Letter Generator AI Agent at backend/src/ai/agents/cover-letter.agent.ts.

Requirements:
1. Extend BaseAgent class

2. Main method:
   async execute(params: {
     resume: ParsedResumeData;
     job: JobData;
     tone?: 'professional' | 'enthusiastic' | 'creative' | 'formal';
     additionalInfo?: string;
   }): Promise<CoverLetterResult>

3. Functionality:
   - Analyze job description for key requirements
   - Extract relevant experiences from resume
   - Generate compelling opening paragraph
   - Create 2-3 body paragraphs highlighting:
     * Relevant experiences and achievements
     * Skills matching job requirements
     * Value proposition for company
   - Write strong closing paragraph with call to action
   - Adapt tone based on parameters
   - Keep length to 250-400 words
   - Customize for company culture (if detectable)

4. Return structure:
   interface CoverLetterResult {
     coverLetter: {
       opening: string;
       body: string[];
       closing: string;
       fullText: string;
     };
     highlights: Array<{
       experience: string;
       relevance: string;
       impact: string;
     }>;
     matchScore: number;
     suggestions: string[];
     wordCount: number;
   }

5. Use temperature: 0.7 for more creativity
6. Max tokens: 4000
7. Add tone customization logic

Reference resume-parser.agent.ts for structure.
```

**Acceptance Criteria**:
- [ ] Agent extends BaseAgent
- [ ] Generates coherent cover letters
- [ ] Tone customization works
- [ ] Returns structured result
- [ ] Length is appropriate (250-400 words)
- [ ] Highlights relevant experiences
- [ ] Match score calculated
- [ ] Error handling robust

**Dependencies**: None (can parallelize with Task 1.2)
**Estimated Time**: 1-2 days

---

### Task 1.7: Create Cover Letter Prompt

**File**: `backend/src/ai/prompts/cover-letter.prompt.ts`

**Prompt**:
```
Create a comprehensive system prompt for cover letter generation at backend/src/ai/prompts/cover-letter.prompt.ts.

Requirements:
1. Export: COVER_LETTER_PROMPT

2. Instruct Claude to:
   - Act as professional cover letter writer
   - Write compelling, personalized cover letters
   - Match tone to parameter (professional/enthusiastic/creative/formal)
   - Avoid clichés and generic statements
   - Focus on value proposition
   - Quantify achievements when possible
   - Show enthusiasm for specific role
   - Research company values (from job description)
   - Keep to 250-400 words
   - Use strong action verbs
   - Create engaging opening hook
   - Close with clear call to action

3. Include examples of each tone:
   - Professional: Balanced, competent, clear
   - Enthusiastic: Energetic, passionate, motivated
   - Creative: Unique, innovative, storytelling
   - Formal: Traditional, conservative, structured

4. Specify exact JSON output format

5. Provide dos and don'ts:
   - DO: Specific examples, quantified results, genuine enthusiasm
   - DON'T: Generic statements, clichés, excessive flattery, lies

Reference resume-parser.prompt.ts for structure.
```

**Acceptance Criteria**:
- [ ] Prompt exported correctly
- [ ] Tone variations explained
- [ ] Output format specified
- [ ] Examples provided
- [ ] Best practices included
- [ ] Dos and don'ts clear

**Dependencies**: None
**Estimated Time**: 3-4 hours

---

### Task 1.8: Implement Interview Coach Agent

**File**: `backend/src/ai/agents/interview-coach.agent.ts`

**Prompt**:
```
Implement the Interview Coach AI Agent with conversational state management at backend/src/ai/agents/interview-coach.agent.ts.

Requirements:
1. Extend BaseAgent class

2. Main methods:
   - async startInterview(params: StartInterviewParams): Promise<InterviewSession>
   - async respondToAnswer(sessionId: string, answer: string): Promise<InterviewResponse>
   - async endInterview(sessionId: string): Promise<InterviewFeedback>

3. Session management:
   - Store conversation history in memory or Redis
   - Track question count
   - Track time elapsed
   - Maintain context throughout interview
   - Support different interview types:
     * BEHAVIORAL - STAR method questions
     * TECHNICAL - Problem-solving questions
     * SYSTEM_DESIGN - Architecture questions
     * CULTURAL_FIT - Values and culture questions
     * GENERAL - Mix of question types

4. Interview flow:
   a) Start: Analyze job, generate tailored first question
   b) Response loop:
      - Evaluate previous answer (1-10 score)
      - Provide immediate constructive feedback
      - Ask relevant follow-up or next question
      - Track performance metrics
   c) End: Comprehensive feedback with:
      - Overall score
      - Strengths demonstrated
      - Areas for improvement
      - Specific advice per question
      - STAR method adherence (for behavioral)
      - Communication quality
      - Confidence level

5. Return structures:
   interface InterviewSession {
     sessionId: string;
     firstQuestion: string;
     interviewType: InterviewType;
     startedAt: Date;
   }

   interface InterviewResponse {
     feedback: {
       score: number;
       strengths: string[];
       improvements: string[];
       comment: string;
     };
     nextQuestion?: string;
     isComplete: boolean;
     progress: {
       questionsAsked: number;
       totalQuestions: number;
       averageScore: number;
     };
   }

   interface InterviewFeedback {
     sessionId: string;
     overallScore: number;
     strengths: string[];
     improvements: string[];
     questionBreakdown: Array<{
       question: string;
       answer: string;
       score: number;
       feedback: string;
     }>;
     recommendations: string[];
     nextSteps: string[];
   }

6. Question strategy:
   - Start with easier questions
   - Increase difficulty based on performance
   - Ask 5-8 questions total
   - Mix question types for general interviews
   - Follow up on interesting points
   - Probe for STAR components

7. Evaluation criteria:
   - Clarity of communication
   - Structure (STAR method)
   - Specific examples and details
   - Quantifiable results mentioned
   - Relevance to role
   - Confidence and enthusiasm
   - Handling of difficulty

8. Use streaming for real-time responses (optional but nice)
9. Store session in Redis with TTL (1 hour)
10. Handle edge cases (very short/long answers, off-topic)

This is a complex agent - reference the architecture document's interview coach example.
```

**Acceptance Criteria**:
- [ ] Agent extends BaseAgent
- [ ] Three main methods implemented
- [ ] Session management works (Redis)
- [ ] Different interview types supported
- [ ] Questions are relevant and tailored
- [ ] Evaluation is fair and constructive
- [ ] Feedback is comprehensive
- [ ] Edge cases handled
- [ ] Integration tests pass

**Dependencies**: Redis connection
**Estimated Time**: 3-4 days (most complex agent)

---

### Task 1.9: Create Interview Coach Prompt

**File**: `backend/src/ai/prompts/interview-coach.prompt.ts`

**Prompt**:
```
Create a comprehensive system prompt for mock interview coaching at backend/src/ai/prompts/interview-coach.prompt.ts.

Requirements:
1. Export: INTERVIEW_COACH_PROMPT

2. Instruct Claude to:
   - Act as experienced technical recruiter and interview coach
   - Conduct realistic mock interviews
   - Ask relevant, role-specific questions
   - Evaluate answers using industry standards
   - Provide constructive, actionable feedback
   - Adapt difficulty based on performance
   - Focus on STAR method for behavioral questions
   - Probe for depth and specifics
   - Be encouraging but honest
   - Track conversation context

3. For different interview types:
   - Behavioral: STAR method, past experiences, conflict resolution
   - Technical: Problem-solving, algorithms, debugging
   - System Design: Architecture, scalability, trade-offs
   - Cultural Fit: Values alignment, teamwork, motivation
   - General: Mix of above

4. Evaluation rubric (JSON format):
   {
     "score": 7,
     "criteria": {
       "clarity": 8,
       "structure": 7,
       "specificity": 6,
       "relevance": 8,
       "quantification": 5
     },
     "strengths": ["Clear communication", "Good examples"],
     "improvements": ["Add more metrics", "Follow STAR structure"],
     "comment": "Solid answer with room for improvement..."
   }

5. Question generation guidelines:
   - Tailor to job description
   - Progressive difficulty
   - Mix open-ended and specific
   - Allow for follow-ups
   - Test different competencies

6. Feedback guidelines:
   - Be specific, not generic
   - Provide examples
   - Suggest improvements
   - Maintain positive tone
   - Encourage practice

Reference architecture document section 4.4 for examples.
```

**Acceptance Criteria**:
- [ ] Prompt exported correctly
- [ ] Interview types covered
- [ ] Evaluation criteria clear
- [ ] Feedback format specified
- [ ] Question guidelines included
- [ ] Examples provided

**Dependencies**: None
**Estimated Time**: 4-5 hours

---

### Task 1.10: Connect Frontend AI Service to Backend

**File**: `frontend/src/services/aiService.ts` (replace mock)

**Prompt**:
```
Replace the mock AI service with real backend integration at frontend/src/services/aiService.ts.

Current state: Service returns fake data with delays
Target state: Service calls actual backend AI endpoints

Requirements:
1. Replace all mock functions with real API calls:

   async tailorResume(resumeId: string, jobId: string): Promise<TailorResumeResult> {
     const response = await api.post('/ai/resumes/tailor', { resumeId, jobId });
     return response.data;
   }

   async generateCoverLetter(params: {
     resumeId: string;
     jobId: string;
     tone?: CoverLetterTone;
   }): Promise<CoverLetterResult> {
     const response = await api.post('/ai/cover-letters/generate', params);
     return response.data;
   }

   async startMockInterview(params: {
     jobId: string;
     interviewType: InterviewType;
   }): Promise<InterviewSession> {
     const response = await api.post('/ai/interviews/mock/start', params);
     return response.data;
   }

   async respondToMockInterview(
     sessionId: string,
     answer: string
   ): Promise<InterviewResponse> {
     const response = await api.post(
       `/ai/interviews/mock/${sessionId}/respond`,
       { answer }
     );
     return response.data;
   }

   async endMockInterview(sessionId: string): Promise<InterviewFeedback> {
     const response = await api.post(
       `/ai/interviews/mock/${sessionId}/end`,
       {}
     );
     return response.data;
   }

   // Add other methods: analyzeResume, matchJobs, etc.

2. Use the api client from /lib/api (with auth interceptors)

3. Add proper error handling:
   - Network errors
   - 401 Unauthorized
   - 429 Rate limit exceeded
   - 500 Server errors
   - AI-specific errors

4. Add loading states

5. Keep TypeScript types in sync with backend

6. Add retry logic for transient failures

7. Update aiStore.ts to work with real responses

Reference profileService.ts and resumeService.ts for API call patterns.
```

**Acceptance Criteria**:
- [ ] All mock functions replaced with real API calls
- [ ] Uses api client correctly
- [ ] Error handling comprehensive
- [ ] TypeScript types match backend
- [ ] Loading states managed
- [ ] Integration with frontend works
- [ ] No mock data returned

**Dependencies**: Tasks 1.1-1.9 (backend AI routes working)
**Estimated Time**: 1 day

---

### Task 1.11: Test End-to-End AI Flows

**Prompt**:
```
Create comprehensive integration tests for all AI workflows.

Requirements:
1. Test resume tailoring flow:
   - User uploads resume
   - Resume gets parsed
   - User adds job
   - User requests tailoring
   - Receives tailored resume with changes
   - Can save tailored version

2. Test cover letter generation flow:
   - User selects resume and job
   - Chooses tone
   - Generates cover letter
   - Reviews and edits
   - Downloads/saves

3. Test mock interview flow:
   - User starts mock interview for specific job
   - Receives first question
   - Provides answer
   - Gets feedback and next question
   - Completes 5-7 questions
   - Receives comprehensive feedback
   - Views results page

4. Test error scenarios:
   - Invalid resume ID
   - Unparsed resume
   - AI service down
   - Rate limit exceeded
   - Token limit exceeded
   - Network errors

5. Test rate limiting:
   - Verify limits are enforced
   - Verify error messages

6. Performance testing:
   - Resume tailoring completes in <30s
   - Cover letter generates in <20s
   - Mock interview response in <10s
   - Token usage is reasonable

Create tests using Jest/Vitest for backend and React Testing Library for frontend.
```

**Acceptance Criteria**:
- [ ] All happy paths tested
- [ ] Error scenarios covered
- [ ] Rate limiting verified
- [ ] Performance benchmarks met
- [ ] Frontend and backend tests pass
- [ ] Documentation updated

**Dependencies**: Tasks 1.1-1.10
**Estimated Time**: 2-3 days

---

### Phase 1 Summary

**Total Estimated Time**: 4-6 weeks
**Total Tasks**: 11 major tasks
**Deliverables**:
- ✅ Complete AI routes and endpoints
- ✅ Resume tailoring agent (backend + frontend)
- ✅ Cover letter generation (backend + frontend)
- ✅ Mock interview coach (backend + frontend)
- ✅ Full integration tests
- ✅ Documentation

**Success Metrics**:
- All AI features work end-to-end
- No mock services remaining
- Response times within acceptable limits
- Token usage optimized
- User can tailor resumes, generate cover letters, and practice interviews

---

## Phase 2: Career Coaching & Advanced AI (3-4 weeks)

**Goal**: Implement advanced AI features and career coaching platform.

**Priority**: HIGH
**Dependencies**: Phase 1 complete
**Estimated Time**: 3-4 weeks

---

### Task 2.1: Implement Job Matching Agent

**File**: `backend/src/ai/agents/job-matching.agent.ts`

**Prompt**:
```
Implement the Job Matching AI Agent at backend/src/ai/agents/job-matching.agent.ts.

Requirements:
1. Extend BaseAgent

2. Main method:
   async execute(params: {
     userProfile: UserProfile;
     resume: ParsedResumeData;
     job: JobData;
   }): Promise<JobMatchResult>

3. Functionality:
   - Analyze user's skills, experience, education
   - Extract job requirements from description
   - Calculate match score (0-100) based on:
     * Skills match (40%)
     * Experience level match (25%)
     * Education match (15%)
     * Location/remote match (10%)
     * Salary alignment (5%)
     * Industry match (5%)
   - Identify strengths (what matches well)
   - Identify gaps (what's missing)
   - Provide recommendations to improve match
   - Estimate likelihood of success

4. Return structure:
   interface JobMatchResult {
     matchScore: number;
     breakdown: {
       skills: { score: number; matched: string[]; missing: string[] };
       experience: { score: number; level: string; recommendation: string };
       education: { score: number; meets: boolean; comment: string };
       location: { score: number; compatible: boolean };
       salary: { score: number; alignment: string };
       industry: { score: number; relevant: boolean };
     };
     strengths: string[];
     gaps: string[];
     recommendations: string[];
     successLikelihood: 'high' | 'medium' | 'low';
     shouldApply: boolean;
     reasoning: string;
   }

5. Use temperature: 0.3 for consistent scoring
6. Consider experience level nuances (junior vs senior)
7. Factor in transferable skills

Reference resume-tailor.agent.ts for patterns.
```

**Acceptance Criteria**:
- [ ] Agent extends BaseAgent
- [ ] Match scoring is reasonable and consistent
- [ ] Breakdown provides useful insights
- [ ] Recommendations are actionable
- [ ] Edge cases handled (career changers, etc.)
- [ ] Unit tests pass

**Estimated Time**: 2-3 days

---

### Task 2.2: Implement Company Research Agent

**File**: `backend/src/ai/agents/research.agent.ts`

**Prompt**:
```
Implement the Research AI Agent for company and interviewer research at backend/src/ai/agents/research.agent.ts.

Requirements:
1. Extend BaseAgent

2. Methods:
   - async researchCompany(companyName: string, jobDescription?: string): Promise<CompanyResearch>
   - async researchInterviewer(name: string, company: string, linkedinUrl?: string): Promise<InterviewerResearch>

3. Company research functionality:
   - Extract company information from job description
   - Analyze company culture indicators
   - Identify company values
   - Note company size and stage
   - Suggest research resources
   - Provide interview preparation tips
   - Generate smart questions to ask

4. Interviewer research functionality:
   - Analyze LinkedIn profile (if URL provided)
   - Identify common ground
   - Note career trajectory
   - Suggest conversation topics
   - Identify potential projects/interests

5. Return structures:
   interface CompanyResearch {
     companyName: string;
     overview: string;
     culture: {
       values: string[];
       workStyle: string;
       indicators: string[];
     };
     preparation: {
       topics: string[];
       questionsToAsk: string[];
       thingsToHighlight: string[];
     };
     resources: string[];
   }

   interface InterviewerResearch {
     name: string;
     role: string;
     background: string;
     commonGround: string[];
     conversationTopics: string[];
     careerPath: string;
     recommendations: string[];
   }

6. Note: Without external API access, research will be limited to analysis of provided data (job description, LinkedIn snippet). Document this limitation.

7. Use temperature: 0.5

Reference other agents for structure.
```

**Acceptance Criteria**:
- [ ] Agent extends BaseAgent
- [ ] Company research provides useful insights
- [ ] Interviewer research finds common ground
- [ ] Questions generated are thoughtful
- [ ] Limitations documented
- [ ] Unit tests pass

**Estimated Time**: 1-2 days

---

### Task 2.3: Implement Career Goals Service

**File**: `backend/src/services/career-goal.service.ts`

**Prompt**:
```
Create a Career Goal service to manage user career goals and provide AI-powered coaching.

Requirements:
1. Create CareerGoalService class with methods:
   - async createGoal(userId, data): Promise<CareerGoal>
   - async getUserGoals(userId): Promise<CareerGoal[]>
   - async updateGoal(goalId, updates): Promise<CareerGoal>
   - async deleteGoal(goalId): Promise<void>
   - async getGoalProgress(goalId): Promise<GoalProgress>
   - async getAIRecommendations(goalId): Promise<Recommendations>

2. Goal types to support:
   - TARGET_ROLE - Aiming for specific position
   - SALARY_TARGET - Target compensation
   - SKILL_ACQUISITION - Learn new skills
   - INDUSTRY_CHANGE - Switch industries
   - PROMOTION - Move up at current company
   - COMPANY_TARGET - Work at specific company

3. AI recommendations method should:
   - Analyze current profile vs goal
   - Identify skills gaps
   - Suggest learning resources
   - Recommend relevant jobs
   - Provide timeline estimate
   - Suggest action steps

4. Track progress:
   - Skills gained
   - Applications sent for target role
   - Interviews conducted
   - Achievements unlocked
   - Time elapsed

5. Integrate with other services:
   - Profile service (get current state)
   - Resume service (analyze readiness)
   - Job service (find relevant opportunities)

Reference job.service.ts for CRUD patterns.
```

**Acceptance Criteria**:
- [ ] Service class created
- [ ] All CRUD operations work
- [ ] AI recommendations are useful
- [ ] Progress tracking functional
- [ ] Database operations optimized
- [ ] Unit tests pass

**Estimated Time**: 2 days

---

### Task 2.4: Create Career Goals Routes

**File**: `backend/src/api/routes/career-goals.routes.ts`

**Prompt**:
```
Create REST API routes for career goals management at backend/src/api/routes/career-goals.routes.ts.

Requirements:
1. Routes:
   - POST /api/career-goals - Create new goal
   - GET /api/career-goals - Get all user goals
   - GET /api/career-goals/:id - Get specific goal
   - PUT /api/career-goals/:id - Update goal
   - DELETE /api/career-goals/:id - Delete goal
   - GET /api/career-goals/:id/progress - Get goal progress
   - GET /api/career-goals/:id/recommendations - Get AI recommendations

2. Use authenticate middleware
3. Validate with Zod schemas
4. Call CareerGoalService methods
5. Return structured responses
6. Handle errors gracefully

7. Mount in app.ts at '/api/career-goals'

Reference existing route files for patterns.
```

**Acceptance Criteria**:
- [ ] All routes implemented
- [ ] Authentication required
- [ ] Validation working
- [ ] Service methods called correctly
- [ ] Errors handled
- [ ] Mounted in app

**Estimated Time**: 4 hours

---

### Task 2.5: Create Career Goals Frontend

**Files**:
- `frontend/src/pages/CareerGoals.tsx`
- `frontend/src/services/careerGoalService.ts`
- `frontend/src/hooks/useCareerGoals.ts`

**Prompt**:
```
Create the Career Goals feature in the frontend.

Requirements:
1. Career Goals Page (frontend/src/pages/CareerGoals.tsx):
   - Display all user goals
   - Add new goal form/modal
   - Edit existing goals
   - Delete goals
   - View progress for each goal
   - Display AI recommendations
   - Show action items
   - Track completion status

2. Service (frontend/src/services/careerGoalService.ts):
   - createGoal(data)
   - getUserGoals()
   - updateGoal(id, updates)
   - deleteGoal(id)
   - getGoalProgress(id)
   - getAIRecommendations(id)

3. Hook (frontend/src/hooks/useCareerGoals.ts):
   - useCareerGoals() - manage goals state
   - Integrate with React Query
   - Handle loading/error states
   - Cache data appropriately

4. UI Components needed:
   - GoalCard - Display individual goal
   - GoalForm - Create/edit goal
   - ProgressBar - Visual progress
   - RecommendationsList - AI suggestions
   - ActionItems - Next steps

5. Add route in App.tsx:
   <Route path="/career-goals" element={<ProtectedRoute><CareerGoals /></ProtectedRoute>} />

6. Add navigation link in Header/MobileNav

Reference existing pages (Resumes.tsx, Interviews.tsx) for structure.
```

**Acceptance Criteria**:
- [ ] Page created and routed
- [ ] CRUD operations work
- [ ] UI is intuitive
- [ ] AI recommendations displayed
- [ ] Progress tracking works
- [ ] Mobile responsive
- [ ] Integration tests pass

**Estimated Time**: 2-3 days

---

### Task 2.6: Implement Assessment Tools

**Files**:
- `backend/src/services/assessment.service.ts`
- `backend/src/api/routes/assessments.routes.ts`
- `frontend/src/pages/Assessments.tsx`

**Prompt**:
```
Create career assessment tools to help users understand their skills and interests.

Requirements:
1. Backend Service (assessment.service.ts):
   - createAssessment(userId, type)
   - submitAnswers(assessmentId, answers)
   - getResults(assessmentId)
   - getUserAssessments(userId)

2. Assessment types:
   - SKILLS_ASSESSMENT - Technical skills evaluation
   - PERSONALITY_ASSESSMENT - Work style and preferences
   - CAREER_INTERESTS - Career path suggestions
   - INTERVIEW_READINESS - Interview preparation level

3. For each assessment:
   - Define questions (store in database or config)
   - Score answers
   - Generate insights with AI
   - Provide recommendations
   - Track over time

4. Backend Routes (assessments.routes.ts):
   - POST /api/assessments/start - Start assessment
   - GET /api/assessments - Get all assessments
   - GET /api/assessments/:id - Get specific assessment
   - POST /api/assessments/:id/submit - Submit answers
   - GET /api/assessments/:id/results - Get results

5. Frontend Page (Assessments.tsx):
   - List available assessments
   - Start new assessment
   - Display questions (one at a time or all at once)
   - Submit answers
   - View results with visualizations
   - Compare results over time

6. Use AI to:
   - Analyze skill levels
   - Suggest career paths
   - Identify strengths/weaknesses
   - Recommend learning resources

Reference goal tracking implementation for patterns.
```

**Acceptance Criteria**:
- [ ] Backend service created
- [ ] Routes implemented
- [ ] Frontend page created
- [ ] Assessment types defined
- [ ] Questions created
- [ ] Scoring logic works
- [ ] AI insights generated
- [ ] Results displayed well
- [ ] Integration tests pass

**Estimated Time**: 3-4 days

---

### Task 2.7: Create AI Conversation Feature

**Files**:
- `backend/src/services/conversation.service.ts`
- `backend/src/api/routes/conversations.routes.ts`
- `frontend/src/pages/AICoach.tsx`

**Prompt**:
```
Create an AI coaching conversation feature for open-ended career advice.

Requirements:
1. Backend Service (conversation.service.ts):
   - createConversation(userId, topic?)
   - sendMessage(conversationId, message)
   - getConversationHistory(conversationId)
   - getUserConversations(userId)
   - suggestTopics(userId)

2. Conversation types:
   - CAREER_ADVICE - General career questions
   - INTERVIEW_PREP - Interview preparation
   - SALARY_NEGOTIATION - Negotiation strategies
   - JOB_SEARCH - Job search strategies
   - SKILL_DEVELOPMENT - Learning paths

3. AI Coach capabilities:
   - Answer career questions
   - Provide personalized advice based on profile
   - Reference user's goals and current status
   - Suggest action items
   - Maintain context across messages
   - Proactive suggestions

4. Backend Routes (conversations.routes.ts):
   - POST /api/conversations - Start conversation
   - GET /api/conversations - Get all conversations
   - GET /api/conversations/:id - Get specific conversation
   - POST /api/conversations/:id/messages - Send message
   - GET /api/conversations/topics - Get suggested topics

5. Frontend Page (AICoach.tsx):
   - Chat interface
   - List past conversations
   - Start new conversation with topic
   - Display messages with typing indicator
   - Suggested quick replies
   - Save important advice
   - Mobile-friendly

6. Use streaming for real-time responses
7. Store conversations in database
8. Track token usage per conversation

Reference mock interview chat for UI patterns.
```

**Acceptance Criteria**:
- [ ] Backend service created
- [ ] Routes implemented
- [ ] Frontend chat interface created
- [ ] Conversations stored in DB
- [ ] AI provides relevant advice
- [ ] Context maintained
- [ ] Streaming works
- [ ] Mobile responsive
- [ ] Integration tests pass

**Estimated Time**: 3-4 days

---

### Phase 2 Summary

**Total Estimated Time**: 3-4 weeks
**Total Tasks**: 7 major tasks
**Deliverables**:
- ✅ Job matching AI
- ✅ Company research AI
- ✅ Career goals management
- ✅ Assessment tools
- ✅ AI coaching conversations
- ✅ Complete career coaching platform

---

## Phase 3: Infrastructure & Production Readiness (2-3 weeks)

**Goal**: Make the application production-ready with essential services and integrations.

**Priority**: CRITICAL for launch
**Dependencies**: Phases 1-2
**Estimated Time**: 2-3 weeks

---

### Task 3.1: Implement Email Service

**File**: `backend/src/services/email.service.ts`

**Prompt**:
```
Implement email service using SendGrid or Resend at backend/src/services/email.service.ts.

Requirements:
1. Create EmailService class with methods:
   - async sendPasswordResetEmail(to, resetToken)
   - async sendVerificationEmail(to, verificationToken)
   - async sendInterviewReminder(to, interview)
   - async sendApplicationStatusUpdate(to, application)
   - async sendWeeklyDigest(to, data)
   - async sendWelcomeEmail(to, userName)

2. Email templates:
   - Create HTML templates for each email type
   - Use template variables
   - Include branding
   - Mobile-responsive
   - Plain text fallback

3. Integration:
   - Choose provider (SendGrid or Resend)
   - Add API key to .env
   - Configure sender domain
   - Handle rate limits
   - Retry failed sends

4. Queue email sends:
   - Don't block HTTP responses
   - Use BullMQ queue
   - Retry on failure
   - Log all sends

5. Unsubscribe handling:
   - Add unsubscribe link
   - Track preferences
   - Respect opt-outs

6. Testing:
   - Use email testing service in development
   - Unit tests with mocks
   - Integration tests

Update auth.service.ts to actually send password reset emails (remove TODO).
```

**Acceptance Criteria**:
- [ ] Email service created
- [ ] All email types implemented
- [ ] Templates created (HTML + text)
- [ ] Provider integrated (SendGrid or Resend)
- [ ] Emails queued via BullMQ
- [ ] Unsubscribe supported
- [ ] Tests pass
- [ ] Auth service updated

**Estimated Time**: 2-3 days

---

### Task 3.2: Implement Email Job Processors

**Files**:
- `backend/src/jobs/processors/email-notification.processor.ts`
- `backend/src/jobs/workers/email-notification.worker.ts`

**Prompt**:
```
Create background job processor for email notifications.

Requirements:
1. Processor (email-notification.processor.ts):
   - Process email jobs from queue
   - Call EmailService methods
   - Handle failures with retry
   - Log successes and failures
   - Update job status

2. Job types:
   - password-reset
   - email-verification
   - interview-reminder
   - application-update
   - weekly-digest
   - welcome

3. Worker (email-notification.worker.ts):
   - Start queue worker
   - Configure concurrency
   - Handle graceful shutdown
   - Log queue status

4. Add jobs to queue from:
   - auth.service.ts (password reset, verification)
   - interview.service.ts (reminders)
   - application.service.ts (status updates)

5. Retry logic:
   - Retry up to 3 times
   - Exponential backoff
   - Move to failed queue after max retries

Reference resume-parse.processor.ts for patterns.
```

**Acceptance Criteria**:
- [ ] Processor created
- [ ] Worker created
- [ ] All job types supported
- [ ] Retry logic works
- [ ] Graceful shutdown
- [ ] Services updated to queue emails
- [ ] Integration tests pass

**Estimated Time**: 1-2 days

---

### Task 3.3: Implement Interview Reminder System

**File**: `backend/src/jobs/processors/interview-reminder.processor.ts`

**Prompt**:
```
Create automated interview reminder system.

Requirements:
1. Cron job or scheduled task:
   - Run every hour
   - Find upcoming interviews (next 24 hours)
   - Send reminder emails
   - Mark as reminded (don't send twice)

2. Reminder content:
   - Interview details (date, time, location/link)
   - Interviewer information
   - Preparation materials
   - Links to mock interview
   - Company research

3. Timing:
   - 24 hours before
   - 1 hour before (optional)

4. Database tracking:
   - Add "reminderSent" field to Interview model (or create ReminderLog table)
   - Track reminder status

5. Queue reminder emails via EmailService

Reference email processor for patterns.
```

**Acceptance Criteria**:
- [ ] Processor created
- [ ] Cron job scheduled
- [ ] Finds upcoming interviews
- [ ] Sends reminder emails
- [ ] Tracks reminder status
- [ ] No duplicate reminders
- [ ] Integration tests pass

**Estimated Time**: 1 day

---

### Task 3.4: Configure File Storage (S3 or Vercel Blob)

**File**: `backend/src/services/storage.service.ts` (update)

**Prompt**:
```
Update storage service to use cloud storage (AWS S3 or Vercel Blob) instead of local filesystem.

Requirements:
1. Choose storage provider:
   - AWS S3 (more flexible, widely used)
   - OR Vercel Blob (simpler, integrated with Vercel)

2. Update StorageService methods:
   - async uploadFile(file, path): Promise<string>
   - async downloadFile(key): Promise<Buffer>
   - async deleteFile(key): Promise<void>
   - async getSignedUrl(key, expiresIn): Promise<string>
   - async listFiles(prefix): Promise<string[]>

3. Configuration:
   - Add environment variables (bucket name, region, credentials)
   - Use SDK (AWS SDK or @vercel/blob)
   - Handle authentication

4. File organization:
   - resumes/{userId}/{filename}
   - cover-letters/{userId}/{filename}
   - documents/{userId}/{filename}

5. Security:
   - Files not publicly accessible
   - Use signed URLs for temporary access
   - Validate file types
   - Enforce size limits

6. Update resume.service.ts to use new storage methods

7. Migration plan for existing local files (optional)

Reference existing storage.service.ts structure.
```

**Acceptance Criteria**:
- [ ] Storage provider chosen
- [ ] Service updated
- [ ] Files upload to cloud
- [ ] Signed URLs work
- [ ] Security measures in place
- [ ] Resume service updated
- [ ] Tests pass
- [ ] Documentation updated

**Estimated Time**: 1-2 days

---

### Task 3.5: Add Monitoring and Error Tracking (Sentry)

**Prompt**:
```
Integrate Sentry for error tracking and monitoring.

Requirements:
1. Backend integration:
   - Install @sentry/node
   - Initialize in server.ts
   - Add Express error handler
   - Configure breadcrumbs
   - Tag errors with user context

2. Frontend integration:
   - Install @sentry/react
   - Initialize in main.tsx
   - Add ErrorBoundary integration
   - Track API errors
   - Capture user feedback

3. Configuration:
   - Add SENTRY_DSN to .env
   - Set environment (development/staging/production)
   - Configure release tracking
   - Set sample rates

4. Custom tracking:
   - Track AI agent failures
   - Track API performance
   - Track job queue failures
   - Track authentication issues

5. Alerts:
   - Set up email/Slack alerts for critical errors
   - Configure alert rules
   - Set up performance degradation alerts

6. Privacy:
   - Don't send sensitive data (passwords, tokens)
   - Scrub PII where needed
   - Configure before-send hook

Documentation: https://docs.sentry.io/
```

**Acceptance Criteria**:
- [ ] Sentry integrated in backend
- [ ] Sentry integrated in frontend
- [ ] Errors captured correctly
- [ ] Context included
- [ ] Alerts configured
- [ ] PII scrubbed
- [ ] Performance tracking enabled

**Estimated Time**: 1 day

---

### Task 3.6: Implement Rate Limiting for AI Endpoints

**File**: `backend/src/api/middleware/rateLimiter.ts` (update)

**Prompt**:
```
Enhance rate limiting specifically for expensive AI endpoints.

Requirements:
1. Create tiered rate limits:
   - Standard endpoints: 100 requests/hour
   - AI endpoints: 20 requests/hour
   - Mock interview: 5 sessions/day

2. Different limits per user tier (if implementing tiers):
   - Free: Lower limits
   - Premium: Higher limits

3. Store rate limit data in Redis

4. Custom rate limiters:
   - createAIRateLimiter(requests, window)
   - Per-user tracking
   - Per-IP backup tracking

5. Informative error responses:
   - Include retry-after header
   - Explain limits
   - Suggest upgrade (if applicable)

6. Admin bypass:
   - Allow admins to bypass limits
   - Internal use exemption

7. Apply to AI routes:
   - /ai/resumes/tailor - 10/hour
   - /ai/cover-letters/generate - 10/hour
   - /ai/interviews/mock/* - 5 sessions/day
   - /ai/jobs/match - 20/hour

Reference existing rateLimiter.ts and expand.
```

**Acceptance Criteria**:
- [ ] Tiered rate limits implemented
- [ ] AI endpoints have stricter limits
- [ ] Rate limit data in Redis
- [ ] Error responses are helpful
- [ ] Admin bypass works
- [ ] Tests pass

**Estimated Time**: 1 day

---

### Task 3.7: Create Admin Dashboard (Basic)

**Files**:
- `backend/src/api/routes/admin.routes.ts`
- `backend/src/services/admin.service.ts`
- `frontend/src/pages/Admin.tsx`

**Prompt**:
```
Create basic admin dashboard for monitoring and management.

Requirements:
1. Backend routes (admin.routes.ts):
   - GET /api/admin/stats - System statistics
   - GET /api/admin/users - List users with filters
   - GET /api/admin/ai-usage - AI usage stats
   - GET /api/admin/jobs/queue - Queue status
   - POST /api/admin/users/:id/suspend - Suspend user
   - POST /api/admin/users/:id/unsuspend - Unsuspend user

2. Admin service (admin.service.ts):
   - getSystemStats()
   - getUserList(filters, pagination)
   - getAIUsageStats(timeRange)
   - getQueueStatus()
   - suspendUser(userId)
   - unsuspendUser(userId)

3. Authentication:
   - Require admin role
   - Check UserRole.ADMIN
   - Add isAdmin middleware

4. Frontend page (Admin.tsx):
   - System overview dashboard
   - User management table
   - AI usage charts
   - Queue status
   - Error logs
   - Recent activity

5. Stats to track:
   - Total users
   - Active users (last 7 days)
   - Total resumes uploaded
   - Total AI requests
   - AI cost estimate
   - Failed jobs
   - Average response times

6. Simple charts using shadcn chart components

Only implement if you need admin functionality. Can be deferred to later phase.
```

**Acceptance Criteria**:
- [ ] Admin routes created
- [ ] Admin service created
- [ ] Admin middleware enforces role
- [ ] Frontend dashboard created
- [ ] Stats displayed correctly
- [ ] User management works
- [ ] Charts render
- [ ] Only admins can access

**Estimated Time**: 2 days (optional - can defer)

---

### Phase 3 Summary

**Total Estimated Time**: 2-3 weeks
**Total Tasks**: 6-7 tasks (admin dashboard optional)
**Deliverables**:
- ✅ Email service integrated
- ✅ Automated reminders
- ✅ Cloud file storage
- ✅ Error monitoring (Sentry)
- ✅ Enhanced rate limiting
- ✅ Production-ready infrastructure

---

## Phase 4: External Integrations (4-5 weeks)

**Goal**: Integrate external services for enhanced functionality.

**Priority**: MEDIUM (can be deferred)
**Dependencies**: Phase 3
**Estimated Time**: 4-5 weeks

---

### Task 4.1: Integrate Job Board APIs (Preliminary Research)

**Prompt**:
```
Research and plan job board API integrations.

Requirements:
1. Research available APIs:
   - LinkedIn Jobs API
   - Indeed API
   - Glassdoor API
   - Monster API
   - ZipRecruiter API
   - Adzuna API (free tier available)

2. For each API, document:
   - Pricing and limits
   - Authentication requirements
   - Available endpoints
   - Rate limits
   - Data format
   - Terms of service
   - Approval process

3. Create integration plan:
   - Which APIs to integrate first
   - Cost-benefit analysis
   - Implementation timeline
   - Data normalization strategy

4. Legal considerations:
   - Can we store job data?
   - How long can we cache?
   - Attribution requirements
   - User privacy

5. Create design doc:
   - Architecture for job discovery
   - Database schema for external jobs
   - Sync strategy
   - Deduplication logic

Note: Many job board APIs require approval and have strict terms. This task is research only. Implementation depends on API access.

Create document: .agent/Tasks/job_board_api_integration_plan.md
```

**Estimated Time**: 1 week (research + planning)

---

### Task 4.2: Implement Job Discovery Service (if API available)

**Files**:
- `backend/src/services/job-discovery.service.ts`
- `backend/src/jobs/processors/job-discovery.processor.ts`

**Prompt**:
```
Implement job discovery service to fetch and sync jobs from external APIs.

Requirements:
1. Service (job-discovery.service.ts):
   - async searchJobs(criteria): Promise<ExternalJob[]>
   - async syncJobs(userId, preferences): Promise<void>
   - async getRecommendedJobs(userId): Promise<Job[]>
   - async importJob(externalJob): Promise<Job>

2. Search criteria:
   - Keywords
   - Location
   - Remote/hybrid/onsite
   - Salary range
   - Company size
   - Experience level

3. Data normalization:
   - Convert API responses to internal Job format
   - Extract key information
   - Deduplicate jobs
   - Enrich with additional data

4. Background processor (job-discovery.processor.ts):
   - Run daily or on-demand
   - Fetch jobs matching user preferences
   - Store in database
   - Notify users of new matches

5. Store external jobs:
   - Add source and externalId fields to Job model
   - Track sync status
   - Handle updates/expiration

6. Use job matching AI to score discovered jobs

This task can only be completed if API access is granted.
```

**Estimated Time**: 1-2 weeks (depends on API complexity)

---

### Task 4.3: Integrate Analytics (PostHog or Vercel Analytics)

**Prompt**:
```
Integrate analytics to track user behavior and product metrics.

Requirements:
1. Choose platform:
   - PostHog (open source, feature-rich)
   - Vercel Analytics (simple, integrated)
   - Google Analytics (widely used)

2. Backend events to track:
   - User registration
   - User login
   - Resume upload
   - Resume parse complete
   - AI request (tailor, cover letter, interview)
   - Job added
   - Application submitted
   - Interview scheduled
   - Goal created

3. Frontend events to track:
   - Page views
   - Button clicks
   - Form submissions
   - Feature usage
   - Time on page
   - Navigation paths
   - Error occurrences

4. User properties:
   - User ID (hashed)
   - Account creation date
   - Feature usage counts
   - Subscription tier (if applicable)

5. Funnels to track:
   - Onboarding completion
   - Resume to tailoring
   - Job to application
   - Application to interview

6. Privacy:
   - Don't send PII
   - Anonymize data
   - Respect Do Not Track
   - GDPR compliance

Integration documentation: https://posthog.com/docs or https://vercel.com/docs/analytics
```

**Acceptance Criteria**:
- [ ] Analytics platform chosen
- [ ] Backend events tracked
- [ ] Frontend events tracked
- [ ] User properties set
- [ ] Funnels defined
- [ ] Privacy respected
- [ ] Dashboard created

**Estimated Time**: 3-4 days

---

### Task 4.4: LinkedIn API Integration (Profile Import)

**Prompt**:
```
Integrate LinkedIn API for profile import (if approved).

Requirements:
1. LinkedIn Developer Account:
   - Apply for API access
   - Get approved (can take weeks)
   - Create OAuth app
   - Get client credentials

2. OAuth flow:
   - Add "Connect LinkedIn" button
   - Implement OAuth2 flow
   - Request permissions: r_liteprofile, r_emailaddress
   - Store access token securely

3. Profile import:
   - Fetch profile data
   - Map to UserProfile fields
   - Import experience, education, skills
   - Create resume from LinkedIn data
   - Allow user to review before saving

4. Incremental updates:
   - Allow re-sync
   - Merge new data with existing
   - Preserve manual edits

5. Security:
   - Encrypt tokens at rest
   - Refresh tokens appropriately
   - Handle token expiration

Note: LinkedIn API access is restrictive and requires approval. This is a nice-to-have feature.

Documentation: https://learn.microsoft.com/en-us/linkedin/
```

**Estimated Time**: 1 week (if approved)

---

### Task 4.5: Calendar Integration (Google Calendar)

**Prompt**:
```
Integrate Google Calendar for interview scheduling.

Requirements:
1. Google OAuth:
   - Set up Google Cloud project
   - Enable Calendar API
   - Configure OAuth consent screen
   - Get credentials

2. OAuth flow:
   - "Connect Google Calendar" button
   - Request calendar.events scope
   - Store tokens securely

3. Features:
   - Sync interview dates to calendar
   - Auto-add interview details
   - Set reminders
   - Add prep time before interview
   - Include links to mock interview

4. Two-way sync:
   - When interview added in app, create calendar event
   - When calendar event updated, update interview
   - Handle conflicts

5. Calendar event details:
   - Title: "Interview: [Company] - [Position]"
   - Description: Interview details, links, notes
   - Location: Meeting link or address
   - Reminders: 24h and 1h before

6. Support other calendars:
   - Outlook/Microsoft
   - Apple Calendar (CalDAV)

Documentation: https://developers.google.com/calendar/api
```

**Acceptance Criteria**:
- [ ] Google Calendar connected
- [ ] OAuth flow works
- [ ] Events created automatically
- [ ] Two-way sync functional
- [ ] Event details comprehensive
- [ ] Reminders set
- [ ] Tests pass

**Estimated Time**: 1 week

---

### Phase 4 Summary

**Total Estimated Time**: 4-5 weeks (highly variable based on API approvals)
**Total Tasks**: 5 tasks (most dependent on external approvals)
**Deliverables**:
- ✅ Job board API integration plan
- ⚠️ Job discovery (if APIs available)
- ✅ Analytics tracking
- ⚠️ LinkedIn integration (if approved)
- ⚠️ Calendar integration

**Note**: Phase 4 tasks are mostly "nice-to-have" and can be deferred or skipped if time-constrained.

---

## Phase 5: Enhancements & Polish (Ongoing)

**Goal**: Improve user experience and add advanced features.

**Priority**: LOW
**Dependencies**: Phases 1-3 complete
**Estimated Time**: Ongoing

---

### Enhancement Ideas:

1. **Real-time Features** (WebSocket):
   - Live mock interview with typing indicators
   - Real-time notifications
   - Collaborative features

2. **PDF Generation**:
   - Generate resume PDFs from tailored data
   - Generate cover letter PDFs
   - Custom templates

3. **Advanced Job Board**:
   - Drag-and-drop between columns
   - Bulk operations
   - Keyboard shortcuts
   - Advanced filters

4. **Mobile App**:
   - React Native app
   - Push notifications
   - Offline support

5. **Voice Interview Practice**:
   - Speech-to-text integration
   - Voice-based mock interviews
   - Pronunciation feedback

6. **Browser Extension**:
   - Auto-fill application forms
   - Save jobs from job boards
   - LinkedIn integration

7. **Networking Features**:
   - Connect with other job seekers
   - Mentorship matching
   - Referral requests

8. **Learning Resources**:
   - Course recommendations
   - Skill-building roadmaps
   - Integration with learning platforms

9. **Resume Themes**:
   - Multiple resume templates
   - Visual customization
   - Industry-specific formats

10. **Advanced Analytics**:
    - Application success rates
    - Response time tracking
    - Conversion funnels
    - Benchmark against others

---

## Testing Strategy

### Unit Tests
- All services have unit tests
- All AI agents have unit tests
- All validators have unit tests
- Mock external dependencies
- Aim for 80%+ coverage

### Integration Tests
- API route tests (Supertest)
- Database operations
- Queue processing
- Email sending (mocked)
- AI agent integration

### End-to-End Tests
- Critical user flows (Playwright/Cypress)
  - Registration → Login → Upload Resume → Tailor → Apply
  - Mock Interview flow
  - Cover Letter generation
- Run before deployment
- Automate in CI/CD

### Performance Tests
- API response times (<500ms for most endpoints)
- AI processing times (documented limits)
- Database query performance
- Load testing (simulate 100 concurrent users)

### Security Tests
- Authentication vulnerabilities
- Authorization bypasses
- Input validation
- SQL injection
- XSS attacks
- CSRF protection

---

## Deployment Checklist

### Pre-Deployment
- [ ] All critical features implemented
- [ ] All tests passing
- [ ] Code reviewed
- [ ] Security audit completed
- [ ] Performance benchmarks met
- [ ] Documentation updated

### Environment Setup
- [ ] Production database (PostgreSQL)
- [ ] Redis instance (Upstash recommended)
- [ ] File storage configured (S3 or Vercel Blob)
- [ ] Email service configured (SendGrid/Resend)
- [ ] Error tracking (Sentry)
- [ ] Analytics (PostHog/Vercel)

### Secrets & Configuration
- [ ] DATABASE_URL set
- [ ] ANTHROPIC_API_KEY set
- [ ] JWT_SECRET set (strong random value)
- [ ] REDIS_URL set
- [ ] AWS_/S3_ credentials set
- [ ] SENDGRID_API_KEY or RESEND_API_KEY set
- [ ] SENTRY_DSN set
- [ ] FRONTEND_URL set
- [ ] NODE_ENV=production

### Database
- [ ] Run migrations
- [ ] Create admin user
- [ ] Seed initial data (if any)
- [ ] Set up backups
- [ ] Configure connection pooling

### Monitoring
- [ ] Error tracking working
- [ ] Logs aggregated
- [ ] Uptime monitoring
- [ ] Performance monitoring
- [ ] AI usage tracking
- [ ] Cost monitoring

### Security
- [ ] HTTPS enabled
- [ ] Rate limiting configured
- [ ] CORS configured correctly
- [ ] Helmet.js configured
- [ ] Input validation on all endpoints
- [ ] Secrets not in codebase

### Performance
- [ ] Database indexes created
- [ ] Query optimization
- [ ] CDN configured
- [ ] Asset minification
- [ ] Image optimization
- [ ] Caching strategy

### Legal & Compliance
- [ ] Privacy policy
- [ ] Terms of service
- [ ] Cookie consent (if needed)
- [ ] GDPR compliance (if EU users)
- [ ] Data retention policy

### Launch
- [ ] Deploy to staging
- [ ] QA testing
- [ ] Load testing
- [ ] Deploy to production
- [ ] Smoke tests
- [ ] Monitor for errors
- [ ] Ready for users!

---

## Estimated Timeline Summary

| Phase | Duration | Completion | Priority |
|-------|----------|------------|----------|
| Phase 1: Core AI | 4-6 weeks | Required | CRITICAL |
| Phase 2: Career Coaching | 3-4 weeks | Required | HIGH |
| Phase 3: Infrastructure | 2-3 weeks | Required | CRITICAL |
| Phase 4: Integrations | 4-5 weeks | Optional | MEDIUM |
| Phase 5: Enhancements | Ongoing | Nice-to-have | LOW |

**Total MVP Timeline**: 9-13 weeks (Phases 1-3 only)
**Full Feature Set**: 13-18 weeks (Phases 1-4)

---

## Success Metrics

### Phase 1 Success Criteria:
- [ ] Users can tailor resumes for specific jobs
- [ ] Users can generate cover letters
- [ ] Users can practice with mock interviews
- [ ] All AI features have <30s response time
- [ ] No mock services in production

### Phase 2 Success Criteria:
- [ ] Users can set and track career goals
- [ ] Users can complete career assessments
- [ ] Users can chat with AI coach
- [ ] Job matching provides useful scores

### Phase 3 Success Criteria:
- [ ] Application is production-ready
- [ ] Emails send reliably
- [ ] Errors are tracked and alerted
- [ ] Files stored in cloud
- [ ] Rate limiting prevents abuse

### Overall Success Metrics:
- User registration growth
- Resume tailoring usage
- Mock interview completion rate
- Application success rate
- User retention
- Net Promoter Score (NPS)
- AI cost per user

---

## Maintenance & Iteration

### Regular Tasks:
- Monitor error rates
- Review AI costs
- Update dependencies
- Security patches
- Performance optimization
- User feedback implementation

### Monthly Reviews:
- Feature usage analytics
- Cost analysis
- User feedback summary
- Roadmap updates
- Technical debt assessment

---

## Documentation Requirements

### Technical Docs:
- [ ] API documentation (OpenAPI/Swagger)
- [ ] Database schema docs (update .agent/System/database_schema.md)
- [ ] AI agent docs (update .agent/System/ai_agent_architecture.md)
- [ ] Deployment guide
- [ ] Development setup guide

### User Docs:
- [ ] User guide / help center
- [ ] Video tutorials
- [ ] FAQ
- [ ] Best practices
- [ ] Feature announcements

---

## Notes

- This plan assumes full-time development
- Adjust timeline based on team size
- Prioritize based on user feedback
- Iterate quickly, especially on AI features
- Monitor costs closely (Claude API usage)
- Get user feedback early and often
- Consider beta testing before full launch

---

**Document Status**: Complete
**Last Updated**: 2025-10-13
**Next Review**: After Phase 1 completion

---

## Quick Reference: Critical Path

For fastest time to MVP:

**Week 1-2**: Tasks 1.1-1.5 (Resume Tailoring)
**Week 3-4**: Tasks 1.6-1.7 (Cover Letters)
**Week 5-8**: Tasks 1.8-1.9 (Mock Interviews)
**Week 9**: Task 1.10-1.11 (Integration & Testing)
**Week 10-11**: Task 3.1-3.2 (Email Service)
**Week 12**: Task 3.4-3.6 (Production Setup)
**Week 13**: QA, Deployment, Launch

**Result**: Production-ready MVP with core AI features in 13 weeks.
