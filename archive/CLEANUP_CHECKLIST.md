# AI Career Coach - Cleanup & Optimization Checklist

**Last Updated:** October 22, 2025
**Status:** Production deployed, 90% MVP complete

This document contains **actual** cleanup items and technical debt based on code analysis.

---

## 🧹 Code Cleanup (Low Priority)

### ✅ Documentation Fixed
- [x] Remove incorrect reference to "lines 320-450" in PROJECT_STATUS.md
- [x] Update frontend deployment status to "Deployed on Vercel"
- [x] Fix line number references for AI agent TODOs

---

## 🔧 Technical Debt (Code TODOs)

### 1. Auto-start Job Queues
**File:** `backend/src/server.ts:84`
**Current:** Manual start required for resume parsing worker
**TODO:** Initialize job queues automatically on server start

```typescript
// TODO: Initialize job queues
```

**Impact:** Medium - Improves deployment reliability
**Effort:** 1-2 hours
**Priority:** Medium

**Implementation:**
- Import resume parsing worker
- Auto-start worker on server initialization
- Add error handling for worker failures
- Add health check for worker status

---

### 2. Email Service Integration ✅ **COMPLETED**
**File:** `backend/src/services/auth.service.ts:438`
**Status:** ✅ Implemented with SendGrid
**Completed:** October 22, 2025

**What was implemented:**
- ✅ SendGrid SDK integration
- ✅ Email service with retry logic (`email.service.ts`)
- ✅ Password reset email template (HTML + text)
- ✅ Welcome email on registration
- ✅ Resume parse completion notification
- ✅ Environment variable configuration
- ✅ Comprehensive setup guide (`backend/docs/EMAIL_SETUP_GUIDE.md`)

**Files created/modified:**
- Created: `backend/src/services/email.service.ts`
- Created: `backend/docs/EMAIL_SETUP_GUIDE.md`
- Modified: `backend/src/services/auth.service.ts`
- Modified: `backend/src/jobs/processors/resume-parse.processor.ts`
- Modified: `backend/src/config/env.ts`
- Modified: `backend/.env.example`

**To use in production:**
1. Create SendGrid account (free tier: 100 emails/day)
2. Get API key from SendGrid dashboard
3. Verify sender email or domain
4. Add to Railway environment variables:
   - `SENDGRID_API_KEY=SG.xxx`
   - `SENDGRID_FROM_EMAIL=noreply@aicareercoach.com`
   - `FRONTEND_URL=https://your-frontend.vercel.app`

See `backend/docs/EMAIL_SETUP_GUIDE.md` for complete setup instructions.

---

### 3. User Notifications for Resume Parsing ✅ **COMPLETED**
**File:** `backend/src/jobs/processors/resume-parse.processor.ts:154`
**Status:** ✅ Implemented with email notification
**Completed:** October 22, 2025

**What was implemented:**
- ✅ Email notification when resume parsing completes
- ✅ Professional HTML email template
- ✅ Error handling (doesn't block job completion)

**Implementation:** Integrated as part of email service (#2 above)

**Options:**
1. **Email notification** - Requires email service (#2)
2. **WebSocket/SSE** - Real-time notification in app
3. **Polling** - Frontend checks status periodically (current approach)

---

## 🤖 AI Agents (Placeholder Implementations)

All these routes exist with placeholder data. Need real AI agent implementations.

### 4. Resume Analyzer Agent
**File:** `backend/src/api/routes/ai.routes.ts:156`
**Route:** `POST /api/ai/resumes/analyze`
**Impact:** High - Core feature
**Effort:** 2-3 days
**Priority:** **HIGH**

**Features needed:**
- ATS compatibility scoring
- Resume quality assessment (grammar, formatting, content)
- Actionable improvement suggestions
- Skill gap analysis
- Industry-specific keyword analysis

---

### 5. Interview Prep Agent
**File:** `backend/src/api/routes/ai.routes.ts:320`
**Route:** `POST /api/ai/interviews/prepare`
**Impact:** High - Enhances interview features
**Effort:** 2-3 days
**Priority:** **HIGH**

**Features needed:**
- Company website scraping and research
- Role-specific question generation
- Company culture analysis
- Recent news/events research
- STAR examples based on resume

---

### 6. Job Matching Agent (Phase 2)
**File:** `backend/src/api/routes/ai.routes.ts:394`
**Route:** `POST /api/ai/jobs/match`
**Impact:** High - Phase 2 core feature
**Effort:** 3-4 days
**Priority:** Medium (Phase 2)

**Features needed:**
- AI-powered job recommendations based on resume
- Match score calculation with explanations
- Auto-deduplication of jobs
- Skill gap analysis

---

### 7. Job Analyzer Agent
**File:** `backend/src/api/routes/ai.routes.ts:451`
**Route:** `POST /api/ai/jobs/analyze`
**Impact:** Medium - Nice to have
**Effort:** 2-3 days
**Priority:** Medium

**Features needed:**
- Analyze job requirements and responsibilities
- Culture fit assessment
- Salary insights and market comparison
- Red flags detection
- Application tips

---

### 8. Company Research Agent
**File:** `backend/src/api/routes/ai.routes.ts:524`
**Route:** `POST /api/ai/research/company`
**Impact:** Medium - Supports job applications
**Effort:** 1-2 days
**Priority:** Medium

**Features needed:**
- Scrape company website
- Extract culture/values
- Find recent news and events
- Glassdoor-style insights
- Interview process tips

---

### 9. Interviewer Research Agent
**File:** `backend/src/api/routes/ai.routes.ts:596`
**Route:** `POST /api/ai/research/interviewer`
**Impact:** Low - Nice to have
**Effort:** 1-2 days
**Priority:** Low

**Features needed:**
- LinkedIn profile research (if URL provided)
- Extract background and experience
- Common interests and conversation starters
- Interview style predictions

---

## 🚀 Performance Optimizations

### 10. Implement AI Response Streaming
**Current:** Long wait times (2-5 minutes for resume tailoring)
**Impact:** High - Better UX
**Effort:** 3-5 days
**Priority:** High

**Implementation:**
- Enable streaming in Claude API calls (infrastructure exists)
- Stream responses to frontend via SSE or WebSocket
- Show real-time progress during AI operations
- Update frontend to handle streamed responses

**Benefits:**
- Resume tailoring feels faster (show progress)
- Cover letter generation shows text as it's written
- Mock interview shows questions as they're generated

---

### 11. Cache Common AI Results
**Current:** Every request hits Claude API
**Impact:** Medium - Cost savings + performance
**Effort:** 2-3 days
**Priority:** Medium

**What to cache:**
- Standard interview questions by role/level
- Common resume improvement tips
- Company information (cache for 7 days)
- Job analysis results (cache for 24 hours)

**Implementation:**
- Use Redis for caching
- Set appropriate TTLs
- Cache invalidation strategy
- Cost tracking to measure savings

---

### 12. Database Query Optimization
**Current:** Some queries could be more efficient
**Impact:** Medium - Performance improvement
**Effort:** 1-2 days
**Priority:** Low

**Actions:**
- Add query monitoring (Prisma metrics)
- Optimize N+1 queries
- Add missing indexes if found
- Use select/include strategically

---

## 📊 Monitoring & Observability

### 13. Error Tracking (Sentry)
**Current:** No production error monitoring
**Impact:** High - Catch production issues
**Effort:** 1 day
**Priority:** High

**Implementation:**
- Set up Sentry account
- Add Sentry SDK to backend and frontend
- Configure error tracking
- Set up alerts for critical errors
- Add source maps for better stack traces

---

### 14. AI Cost Tracking Dashboard
**Current:** Token usage logged but not visualized
**Impact:** Medium - Cost monitoring
**Effort:** 2-3 days
**Priority:** Medium

**Features:**
- Daily/weekly/monthly token usage
- Cost breakdown by agent type
- Cost per user metrics
- Budget alerts

---

## 🔐 Security & Infrastructure

### 15. Migrate to AWS S3
**Current:** Local file storage (not horizontally scalable)
**Impact:** Medium - Scalability
**Effort:** 1-2 days
**Priority:** Medium

**Why:**
- Local files lost on redeploy
- Can't scale horizontally with multiple instances
- Better reliability and backup

---

### 16. Data Migration for Old Resumes
**Current:** Old resumes missing `fileName` field
**Impact:** Low - Legacy data cleanup
**Effort:** 1-2 hours
**Priority:** Low

**Implementation:**
- Create migration script
- Backfill `fileName` from `fileUrl`
- Test on staging first

---

## 📝 Documentation

### 17. Create SOPs (Standard Operating Procedures)
**Current:** No SOPs exist
**Impact:** Medium - Developer onboarding
**Effort:** 1 week (ongoing)
**Priority:** Low

**Planned SOPs:**
- How to add a database migration
- How to create a new API endpoint
- How to implement a new AI agent
- How to deploy to production
- How to run tests
- How to debug common issues

---

## ✅ Summary by Priority

### ✅ COMPLETED (2 items)
1. ✅ **Email Service Integration** - Password reset + notifications (Oct 22, 2025)
2. ✅ **User Notifications** - Resume parsing email (Oct 22, 2025)

### 🔴 HIGH Priority (Do First)
1. **Resume Analyzer Agent** - Core feature (2-3 days)
2. **Interview Prep Agent** - Core feature (2-3 days)
3. **Error Tracking (Sentry)** - Production monitoring (1 day)
4. **AI Response Streaming** - Better UX (3-5 days)

**Total:** ~1.5-2 weeks

### 🟡 MEDIUM Priority (Next)
5. **Company Research Agent** - Supports features (1-2 days)
6. **Job Analyzer Agent** - Nice to have (2-3 days)
7. **Cache Common AI Results** - Cost savings (2-3 days)
8. **Auto-start Job Queues** - Reliability (1-2 hours)
9. **Migrate to AWS S3** - Scalability (1-2 days)
10. **AI Cost Dashboard** - Monitoring (2-3 days)

**Total:** ~2 weeks

### 🟢 LOW Priority (Future)
11. **Interviewer Research Agent** - Nice to have (1-2 days)
12. **Database Query Optimization** - Performance (1-2 days)
13. **Data Migration** - Legacy cleanup (1-2 hours)
14. **Create SOPs** - Documentation (ongoing)

**Total:** ~1 week

### 🔵 PHASE 2
17. **Job Matching Agent** - Phase 2 feature (3-4 days)

---

## 📋 Recommended Sprint Plan

### Week 1-2: Critical Features
- [ ] Email service integration (password reset)
- [ ] Error tracking setup (Sentry)
- [ ] Resume Analyzer Agent
- [ ] Interview Prep Agent

### Week 3-4: Performance & Polish
- [ ] AI response streaming
- [ ] Response caching
- [ ] Company Research Agent
- [ ] Auto-start job queues

### Week 5-6: Infrastructure
- [ ] Migrate to AWS S3
- [ ] AI cost tracking dashboard
- [ ] Job Analyzer Agent
- [ ] Database optimization

---

**Status:** Living document - update as items are completed
**Maintained by:** Engineering Team
