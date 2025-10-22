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

### 2. Email Service Integration
**File:** `backend/src/services/auth.service.ts:435`
**Current:** Password reset generates token but doesn't send email
**TODO:** Integrate email service (SendGrid or Resend)

```typescript
// TODO: Send email with resetToken (not hashedToken)
```

**Impact:** High - Password reset currently broken
**Effort:** 2-3 days
**Priority:** **HIGH** (Production critical)

**Implementation:**
- Choose email provider (SendGrid recommended)
- Set up email templates
- Implement email sending service
- Add error handling and retry logic
- Test password reset flow end-to-end

---

### 3. User Notifications for Resume Parsing
**File:** `backend/src/jobs/processors/resume-parse.processor.ts:149`
**Current:** Resume parsing completes silently
**TODO:** Notify user when parsing completes

```typescript
// TODO: Send notification to user
```

**Impact:** Low - UX improvement
**Effort:** 1-2 hours (depends on notification system)
**Priority:** Low

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

### 🔴 HIGH Priority (Do First)
1. **Email Service Integration** - Password reset broken (2-3 days)
2. **Resume Analyzer Agent** - Core feature (2-3 days)
3. **Interview Prep Agent** - Core feature (2-3 days)
4. **Error Tracking (Sentry)** - Production monitoring (1 day)
5. **AI Response Streaming** - Better UX (3-5 days)

**Total:** ~2-3 weeks

### 🟡 MEDIUM Priority (Next)
6. **Company Research Agent** - Supports features (1-2 days)
7. **Job Analyzer Agent** - Nice to have (2-3 days)
8. **Cache Common AI Results** - Cost savings (2-3 days)
9. **Auto-start Job Queues** - Reliability (1-2 hours)
10. **Migrate to AWS S3** - Scalability (1-2 days)
11. **AI Cost Dashboard** - Monitoring (2-3 days)

**Total:** ~2 weeks

### 🟢 LOW Priority (Future)
12. **Interviewer Research Agent** - Nice to have (1-2 days)
13. **User Notifications** - UX improvement (1-2 hours)
14. **Database Query Optimization** - Performance (1-2 days)
15. **Data Migration** - Legacy cleanup (1-2 hours)
16. **Create SOPs** - Documentation (ongoing)

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
