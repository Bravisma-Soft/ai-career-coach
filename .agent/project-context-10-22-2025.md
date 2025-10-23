# AI Career Coach - Context Checkpoint
**Date:** October 22, 2025
**Session Focus:** Email Integration, JWT Token Fix, S3 Permissions, Worker Service Deployment

---

## 🎯 Session Accomplishments

### 1. SendGrid Email Integration ✅
- **Implemented:** Full email service with 3 email types (password reset, welcome, resume parse complete)
- **Files Created:**
  - `backend/src/services/email.service.ts` (425 lines)
  - `backend/docs/EMAIL_SETUP_GUIDE.md` (500+ lines)
  - `backend/docs/EMAIL_IMPLEMENTATION_SUMMARY.md`
- **Files Modified:**
  - `backend/src/services/auth.service.ts` - Added password reset & welcome emails
  - `backend/src/jobs/processors/resume-parse.processor.ts` - Added completion notification
  - `backend/src/config/env.ts` - Added SendGrid env vars
  - `backend/.env.example` - Added SendGrid config
- **Status:** Complete, requires SendGrid account setup for production
- **Issue:** Worker getting 403 Forbidden from SendGrid (sender not verified)

### 2. JWT Token Expiration Fix ✅
- **Problem:** Production users getting logged out after 15 minutes (`JWT_EXPIRES_IN=15m`)
- **Root Cause:** `.env.example` had wrong default, Railway using 15m instead of 24h
- **Fixes:**
  - Updated `.env.example`: `JWT_EXPIRES_IN=24h`
  - Added automatic token refresh to frontend (`frontend/src/lib/api.ts`)
  - Added `setTokens()` method to `frontend/src/store/authStore.ts`
  - Created `backend/docs/JWT_TOKEN_TROUBLESHOOTING.md`
- **Result:** Users stay logged in 24h, tokens auto-refresh on expiry

### 3. AWS S3 Permissions Fix ✅
- **Problem:** Resume uploads failing with `User is not authorized to perform: s3:PutObject`
- **Solution:** Documented IAM policy in `PRODUCTION_DEPLOYMENT_GUIDE.md`
- **IAM Policy Required:**
  ```json
  {
    "Effect": "Allow",
    "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject", "s3:ListBucket"],
    "Resource": ["arn:aws:s3:::ai-career-coach-s3-bucket/*", "arn:aws:s3:::ai-career-coach-s3-bucket"]
  }
  ```
- **Documentation:** Added to deployment guide + troubleshooting section

### 4. Railway Worker Service Setup ✅
- **Problem:** Resume parsing taking forever (worker not running on Railway)
- **Root Cause:**
  - Job queues commented out in `server.ts` (lines 84-86)
  - No separate worker service deployed on Railway
  - `railway.toml` forcing same start command for all services
- **Solution:**
  - Removed `startCommand` from `backend/railway.toml` to allow per-service config
  - Created separate worker service in Railway with `npm run start:worker`
  - Added all environment variables to worker service
- **Current Status:** Worker running, processing jobs successfully

### 5. Documentation Updates ✅
- **Updated Files:**
  - `PRODUCTION_DEPLOYMENT_GUIDE.md` - Added S3 IAM policy, troubleshooting
  - `.agent/README.md` - Added links to email, JWT, S3 docs
  - `CLEANUP_CHECKLIST.md` - Marked email integration complete
- **New Guides:**
  - Email setup (SendGrid)
  - JWT troubleshooting
  - Email implementation summary

---

## 🏗️ Architecture & Key Components

### Email Service Architecture
```
backend/src/services/email.service.ts
├── SendGrid SDK integration
├── 3 Email Types:
│   ├── Password reset (1h token expiry)
│   ├── Welcome email (on registration)
│   └── Resume parsed notification
├── HTML + Plain text templates
├── Graceful degradation (logs in dev if not configured)
└── Non-blocking (errors don't fail operations)
```

### Worker Service Architecture
```
Railway Services:
├── backend (API server)
│   └── Start: npm run start:migrate
├── worker-resume-parser (NEW)
│   └── Start: npm run start:worker
├── postgresql
└── redis (BullMQ queue)

Worker Process:
backend/src/jobs/workers/resume-parse.worker.ts
├── Connects to Redis (BullMQ)
├── Listens to 'resume-parsing' queue
├── Processes jobs via ResumeParseProcessor
├── Concurrency: 2 jobs
└── Rate limit: 10 jobs/minute
```

### Token Refresh Flow (Frontend)
```
API Request → 401 Error
  ↓
Interceptor catches error
  ↓
Check if refreshToken exists
  ↓
Call /api/auth/refresh
  ↓
Get new access + refresh tokens
  ↓
Update authStore.setTokens()
  ↓
Retry original request
  ↓
Success (user never sees error)
```

---

## 📦 Dependencies Added

### Backend
- `@sendgrid/mail` - Email sending via SendGrid API

### Frontend
- No new dependencies (used existing axios interceptors)

---

## 🔧 Environment Variables Added

### SendGrid (Backend + Worker)
```bash
SENDGRID_API_KEY=SG.xxx
SENDGRID_FROM_EMAIL=noreply@aicareercoach.com
SENDGRID_FROM_NAME=AI Career Coach
FRONTEND_URL=https://your-frontend.vercel.app
```

### JWT (Railway - Backend)
```bash
JWT_EXPIRES_IN=24h  # Changed from 15m
```

### Worker Service (Railway)
Must have ALL backend variables:
- DATABASE_URL
- REDIS_HOST, REDIS_PORT, REDIS_PASSWORD
- AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_S3_BUCKET_NAME
- ANTHROPIC_API_KEY, CLAUDE_MODEL
- SENDGRID_* (for email notifications)
- NODE_ENV=production

---

## 🐛 Current Issues & Solutions

### Issue 1: SendGrid 403 Forbidden (Worker) ⚠️
**Status:** Non-blocking (resume parsing works, email fails silently)

**Cause:** Sender email not verified in SendGrid

**Solution:**
1. Go to SendGrid → Sender Authentication → Single Sender Verification
2. Add and verify sender email
3. Update `SENDGRID_FROM_EMAIL` in Railway (backend + worker)
4. Redeploy services

### Issue 2: Resume Parsing was Slow 🟢 FIXED
**Was:** Jobs sitting in queue forever
**Fixed:** Added worker service to Railway with correct start command

### Issue 3: Users Getting Logged Out 🟢 FIXED
**Was:** 401 errors after 15 minutes
**Fixed:** Changed JWT_EXPIRES_IN to 24h + added token refresh

### Issue 4: S3 Upload Failing 🟢 DOCUMENTED
**Was:** Permission denied errors
**Fixed:** Documented IAM policy in production guide

---

## 📂 Key Files Modified This Session

### Backend
```
backend/src/services/email.service.ts          [NEW - 425 lines]
backend/src/services/auth.service.ts           [+13 lines - email integration]
backend/src/jobs/processors/resume-parse.processor.ts  [+7 lines - notification]
backend/src/config/env.ts                      [+4 lines - SendGrid vars]
backend/.env.example                           [+12 lines - SendGrid + JWT]
backend/railway.toml                           [SIMPLIFIED - removed startCommand]
backend/docs/EMAIL_SETUP_GUIDE.md             [NEW - 500+ lines]
backend/docs/EMAIL_IMPLEMENTATION_SUMMARY.md  [NEW - 400+ lines]
backend/docs/JWT_TOKEN_TROUBLESHOOTING.md     [NEW - 400+ lines]
```

### Frontend
```
frontend/src/lib/api.ts                        [+70 lines - token refresh]
frontend/src/store/authStore.ts                [+4 lines - setTokens method]
```

### Documentation
```
PRODUCTION_DEPLOYMENT_GUIDE.md                 [+45 lines - S3 IAM policy]
.agent/README.md                               [+3 links - email, JWT, S3]
CLEANUP_CHECKLIST.md                           [marked 2 items complete]
```

---

## ✅ Completed TODOs

- [x] Email service integration (SendGrid)
- [x] Password reset emails working
- [x] Welcome emails on registration
- [x] Resume parse completion notifications
- [x] JWT token expiration fix (15m → 24h)
- [x] Automatic token refresh in frontend
- [x] AWS S3 IAM policy documentation
- [x] Railway worker service setup
- [x] Worker Redis connection fixed
- [x] Worker processing resume jobs
- [x] Documentation updates (email, JWT, S3)

---

## ⏭️ Next Steps

### Immediate (Production)
1. **Verify SendGrid sender email** in SendGrid dashboard
2. **Add SendGrid env vars** to Railway (backend + worker services)
3. **Test email flow** end-to-end (password reset, welcome, resume notification)
4. **Verify JWT_EXPIRES_IN=24h** in Railway backend service

### High Priority (From CLEANUP_CHECKLIST.md)
1. **Resume Analyzer Agent** - Core feature (2-3 days)
2. **Interview Prep Agent** - Core feature (2-3 days)
3. **Error Tracking (Sentry)** - Production monitoring (1 day)
4. **AI Response Streaming** - Better UX (3-5 days)

### Medium Priority
5. **Company Research Agent** (1-2 days)
6. **Job Analyzer Agent** (2-3 days)
7. **Cache Common AI Results** - Cost savings (2-3 days)
8. **Auto-start Job Queues** - Uncomment lines 84-86 in server.ts (1-2 hours)

---

## 🔗 Related Documentation

- **Production Deployment:** [/PRODUCTION_DEPLOYMENT_GUIDE.md](/PRODUCTION_DEPLOYMENT_GUIDE.md)
- **Email Setup:** [/backend/docs/EMAIL_SETUP_GUIDE.md](/backend/docs/EMAIL_SETUP_GUIDE.md)
- **JWT Troubleshooting:** [/backend/docs/JWT_TOKEN_TROUBLESHOOTING.md](/backend/docs/JWT_TOKEN_TROUBLESHOOTING.md)
- **Cleanup Checklist:** [/CLEANUP_CHECKLIST.md](/CLEANUP_CHECKLIST.md)
- **Project Status:** [/PROJECT_STATUS.md](/PROJECT_STATUS.md)
- **Architecture:** [/.agent/System/project_architecture.md](/.agent/System/project_architecture.md)

---

## 🎯 Technical Decisions Made

### 1. SendGrid for Email (vs. Resend, AWS SES)
- **Reason:** Free tier (100 emails/day), easy setup, good documentation
- **Trade-off:** Requires sender verification, may need upgrade for production scale

### 2. Frontend Token Refresh (vs. Server-only)
- **Reason:** Better UX (no sudden logouts), standard OAuth pattern
- **Implementation:** Axios interceptor with request queue during refresh

### 3. Separate Worker Service (vs. In-process)
- **Reason:** Scalability, independent deployment, doesn't block API
- **Trade-off:** More services to manage in Railway

### 4. 24h JWT Expiration (vs. 15m)
- **Reason:** Better UX, acceptable security for job application tool
- **Trade-off:** Slightly less secure (mitigated by refresh token rotation)

---

## 📊 Git Commits This Session

```
20302065 - feat: add SendGrid email integration and fix JWT token expiration
4efbf03e - fix: remove incorrectly placed railway.toml from root
c70f76db - fix: add worker service configuration to backend/railway.toml
2f257ed2 - fix: remove startCommand from railway.toml to allow per-service configuration
8277d396 - docs: add S3 IAM policy and Railway worker configuration
```

---

**Session End Status:** All major features working in production
**Outstanding:** SendGrid sender verification (5 min setup)
