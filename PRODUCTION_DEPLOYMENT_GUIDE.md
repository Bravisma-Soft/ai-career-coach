# Production Deployment Guide - Railway + AWS

This guide will walk you through deploying AI Career Coach to production using Railway for hosting and AWS S3 for file storage.

## Architecture Overview

- **Backend**: Railway (Node.js/Express API)
- **Database**: Railway PostgreSQL
- **Cache/Queue**: Railway Redis (for BullMQ)
- **File Storage**: AWS S3
- **Worker**: Railway (Resume Parser background worker)
- **Frontend**: Vercel (recommended) or Railway

---

## Prerequisites

✅ AWS S3 bucket set up (DONE)
- [ ] Railway account (free tier available)
- [ ] Vercel account (optional, for frontend)
- [ ] AWS credentials (Access Key ID, Secret Access Key)
- [ ] Anthropic API key
- [ ] Your code pushed to GitHub

---

## Step 1: Set Up Railway Project

### 1.1 Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Verify your email

### 1.2 Create New Project
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Connect your `ai-career-coach` repository
4. Railway will detect it's a monorepo

---

## Step 2: Set Up PostgreSQL Database

### 2.1 Add PostgreSQL
1. In your Railway project, click "+ New"
2. Select "Database" → "PostgreSQL"
3. Railway will provision a PostgreSQL instance
4. Copy the `DATABASE_URL` connection string

### 2.2 Note Database Credentials
Railway provides:
```
DATABASE_URL=postgresql://username:password@host:port/database
```

---

## Step 3: Set Up Redis

### 3.1 Add Redis
1. In your Railway project, click "+ New"
2. Select "Database" → "Redis"
3. Railway will provision a Redis instance

### 3.2 Get Redis Connection Details
Railway provides these variables automatically:
- `REDIS_HOST`
- `REDIS_PORT`
- `REDIS_PASSWORD` (if auth enabled)

---

## Step 4: Deploy Backend Service

### 4.1 Add Backend Service
1. In Railway project, click "+ New"
2. Select "GitHub Repo"
3. Choose your repository
4. Set **Root Directory**: `backend`
5. Railway will auto-detect Node.js

### 4.2 Configure Build Settings
In Railway service settings:

**Build Command**:
```bash
npm install && npm run prisma:generate && npm run build
```

**Start Command**:
```bash
npm run start:prod
```

**Watch Paths**:
```
backend/**
```

---

## Step 5: Configure Backend Environment Variables

In Railway Backend Service → Variables, add:

### Application
```env
NODE_ENV=production
PORT=3000
API_VERSION=v1
```

### Database (auto-populated by Railway)
```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

### Redis (auto-populated by Railway)
```env
REDIS_HOST=${{Redis.REDIS_HOST}}
REDIS_PORT=${{Redis.REDIS_PORT}}
REDIS_PASSWORD=${{Redis.REDIS_PASSWORD}}
REDIS_TLS=false
```

### JWT Secrets (generate new secure keys!)
```bash
# Run this locally to generate secure secrets:
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

```env
JWT_SECRET=<your-generated-secret-64-chars>
JWT_REFRESH_SECRET=<your-generated-refresh-secret-64-chars>
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
SESSION_SECRET=<your-generated-session-secret-64-chars>
```

### Anthropic AI
```env
ANTHROPIC_API_KEY=<your-anthropic-api-key>
CLAUDE_MODEL=claude-sonnet-4-5-20250929
CLAUDE_MAX_TOKENS=4096
CLAUDE_TEMPERATURE=1.0
```

### AWS S3
```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=<your-aws-access-key>
AWS_SECRET_ACCESS_KEY=<your-aws-secret-key>
AWS_S3_BUCKET_NAME=<your-s3-bucket-name>
```

**⚠️ Important: Configure IAM Permissions**

Your IAM user must have the following S3 permissions. In AWS IAM Console:

1. Go to **IAM** → **Users** → Select your user (e.g., `ai-career-coach-app-user`)
2. Click **Add permissions** → **Create inline policy**
3. Use this JSON policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::your-bucket-name/*",
        "arn:aws:s3:::your-bucket-name"
      ]
    }
  ]
}
```

4. Name it `S3ResumeUploadPolicy` and save

**Common Error:** If you see `User is not authorized to perform: s3:PutObject`, this policy is missing.

### CORS (update after frontend deployed)
```env
CORS_ORIGIN=https://your-frontend-domain.com
CORS_CREDENTIALS=true
```

### Optional
```env
LOG_LEVEL=info
LOG_FORMAT=json
ENABLE_SWAGGER=false
SENTRY_DSN=<optional-sentry-dsn>
```

---

## Step 6: Run Database Migrations

### 6.1 Option A: Use Railway CLI (Recommended)

Install Railway CLI:
```bash
npm install -g @railway/cli
railway login
```

Link to your project:
```bash
cd backend
railway link
```

Run migrations:
```bash
railway run npm run prisma:migrate:prod
```

### 6.2 Option B: Use Railway Web Terminal

1. Go to Backend Service → Settings → Deploy
2. Wait for deployment to complete
3. Click on service → Open Terminal
4. Run:
```bash
npm run prisma:migrate:prod
```

---

## Step 7: Set Up Resume Parser Worker

The app needs a background worker to process resume parsing jobs.

### 7.1 Add Worker Service
1. In Railway project, click "+ New"
2. Select "GitHub Repo"
3. Choose same repository
4. Set **Root Directory**: `backend`

### 7.2 Configure Worker Settings

**Service Name**: `resume-worker`

**Build Command**:
```bash
npm install && npm run prisma:generate
```

**Start Command**:
```bash
npm run worker:resume
```

**Watch Paths**:
```
backend/**
```

### 7.3 Add Worker Environment Variables

Copy ALL environment variables from Backend Service to Worker Service.

The worker needs:
- DATABASE_URL
- REDIS configuration
- AWS S3 credentials
- ANTHROPIC_API_KEY

> **Tip**: In Railway, you can use "Reference Variables" to share env vars between services.

---

## Step 8: Deploy Frontend

### Option A: Deploy to Vercel (Recommended)

#### 8.1 Install Vercel CLI
```bash
npm install -g vercel
```

#### 8.2 Deploy from Frontend Directory
```bash
cd frontend
vercel
```

Follow prompts:
- Set up new project
- Set **Root Directory**: `frontend`
- Framework: Vite
- Build command: `npm run build`
- Output directory: `dist`

#### 8.3 Configure Vercel Environment Variables

In Vercel Dashboard → Settings → Environment Variables:

```env
VITE_API_URL=https://your-backend.railway.app/api
VITE_APP_NAME=AI Career Coach
VITE_ENVIRONMENT=production
VITE_ENABLE_ANALYTICS=false
```

#### 8.4 Deploy to Production
```bash
vercel --prod
```

### Option B: Deploy to Railway

#### 8.1 Add Frontend Service
1. In Railway project, click "+ New"
2. Select "GitHub Repo"
3. Choose your repository
4. Set **Root Directory**: `frontend`

#### 8.2 Configure Frontend Settings

**Build Command**:
```bash
npm install && npm run build
```

**Start Command**:
```bash
npx serve -s dist -l 3000
```

> **Note**: You'll need to add `serve` to frontend dependencies:
> ```bash
> cd frontend
> npm install serve
> ```

#### 8.3 Add Frontend Environment Variables

```env
VITE_API_URL=https://your-backend.railway.app/api
VITE_APP_NAME=AI Career Coach
VITE_ENVIRONMENT=production
```

---

## Step 9: Update CORS Configuration

After frontend is deployed, update backend CORS settings:

1. Go to Railway → Backend Service → Variables
2. Update `CORS_ORIGIN`:
```env
CORS_ORIGIN=https://your-frontend-domain.vercel.app
```

3. Redeploy backend for changes to take effect

---

## Step 10: Test Production Deployment

### 10.1 Backend Health Check
```bash
curl https://your-backend.railway.app/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-01-18T...",
  "uptime": 123.45
}
```

### 10.2 Test Full Flow

1. Visit your frontend URL
2. Sign up for a new account
3. Upload a resume (tests S3 integration)
4. Wait for resume parsing (tests worker + AI integration)
5. Add a job
6. Generate tailored resume
7. Try interview prep

### 10.3 Check Logs

**Railway**:
- Backend Service → View Logs
- Worker Service → View Logs

Look for errors or warnings.

---

## Step 11: Production Optimizations

### 11.1 Add Custom Domain (Optional)

**Railway**:
1. Backend Service → Settings → Domains
2. Add custom domain (e.g., `api.yourcareercoach.com`)

**Vercel**:
1. Settings → Domains
2. Add custom domain (e.g., `app.yourcareercoach.com`)

### 11.2 Enable Production Logging

Consider adding:
- **Sentry** for error tracking
- **LogDNA** or **Datadog** for log aggregation
- **Uptime monitoring** (UptimeRobot, Pingdom)

### 11.3 Set Up Database Backups

Railway PostgreSQL includes automatic backups, but you can also:

```bash
# Add to package.json scripts
"db:backup:prod": "railway run bash scripts/db-backup.sh"
```

### 11.4 Configure Rate Limiting

Backend already has rate limiting configured. In production, you may want to adjust:

```env
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100   # 100 requests per window
```

---

## Step 12: Monitoring & Maintenance

### 12.1 Set Up Health Checks

Railway provides automatic health checks. You can customize:

**Backend Service → Settings → Health Check**:
- Path: `/api/health`
- Interval: 60s
- Timeout: 10s

### 12.2 Monitor Costs

**Railway**:
- Free tier: $5 credit/month
- Typical usage: $10-30/month (depending on traffic)

**AWS S3**:
- Monitor storage usage
- Set up billing alerts

**Anthropic**:
- Monitor token usage
- Set spending limits

### 12.3 Set Up Alerts

Configure alerts for:
- High error rates
- Database connection issues
- Worker queue failures
- High API latency

---

## Troubleshooting

### Issue: Database Connection Error

**Solution**:
```bash
# Check if DATABASE_URL is correct
railway run env | grep DATABASE_URL

# Test connection
railway run npx prisma db push
```

### Issue: Worker Not Processing Jobs

**Solution**:
- Check Redis connection in worker logs
- Verify worker service is running
- Check BullMQ queue status

### Issue: S3 Upload Failing

**Error:** `User is not authorized to perform: s3:PutObject`

**Solution**:
1. **Add IAM Policy** (see Step 5 → AWS S3 section above for full policy)
2. Verify AWS credentials are correct in Railway variables
3. Check bucket name matches exactly (case-sensitive)
4. Ensure bucket region matches `AWS_REGION` environment variable

**Quick Fix via AWS CLI**:
```bash
aws iam put-user-policy \
  --user-name your-iam-user-name \
  --policy-name S3ResumeUploadPolicy \
  --policy-document '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Action": ["s3:PutObject","s3:GetObject","s3:DeleteObject","s3:ListBucket"],
      "Resource": ["arn:aws:s3:::your-bucket-name/*","arn:aws:s3:::your-bucket-name"]
    }]
  }'
```

### Issue: CORS Errors

**Solution**:
- Update `CORS_ORIGIN` in backend
- Include protocol in URL (https://)
- Check credentials setting

### Issue: Build Fails on Railway

**Solution**:
```bash
# Check build logs
# Common fix: ensure all dependencies in package.json
cd backend
npm install
npm run build

# Test locally first
```

---

## Security Checklist

- [ ] All secrets use strong, generated values (not defaults)
- [ ] JWT secrets are 64+ characters
- [ ] AWS credentials have minimum required permissions
- [ ] S3 bucket is private (not public)
- [ ] CORS is restricted to your frontend domain only
- [ ] Environment variables never committed to git
- [ ] Database backups enabled
- [ ] HTTPS enforced (Railway does this automatically)
- [ ] Rate limiting configured
- [ ] Error messages don't expose sensitive data

---

## Cost Estimation

### Railway (Monthly)
- PostgreSQL: ~$5-10
- Redis: ~$5
- Backend Service: ~$5-10
- Worker Service: ~$5
- **Total: ~$20-30/month**

### AWS S3
- Storage (10GB): ~$0.23
- Requests (10k): ~$0.05
- **Total: ~$0.30-5/month**

### Anthropic API
- Resume parsing (100 resumes): ~$0.50-1
- Tailoring (50 tailored resumes): ~$2-5
- Interview prep (50 sessions): ~$10-15
- **Estimated: $15-25/month** (varies by usage)

**Grand Total: ~$35-60/month**

---

## Next Steps

1. Follow steps 1-10 to deploy
2. Test thoroughly
3. Add custom domains
4. Set up monitoring
5. Plan for scaling if needed

---

## Need Help?

- Railway Docs: https://docs.railway.app
- Vercel Docs: https://vercel.com/docs
- AWS S3 Docs: https://docs.aws.amazon.com/s3
- Prisma Docs: https://www.prisma.io/docs

---

## Quick Reference Commands

### Railway CLI
```bash
# Login
railway login

# Link project
railway link

# Run command in production
railway run <command>

# View logs
railway logs

# Open service
railway open
```

### Database Commands
```bash
# Run migrations
railway run npm run prisma:migrate:prod

# Open Prisma Studio
railway run npx prisma studio

# Seed database
railway run npm run prisma:seed
```

### Deployment
```bash
# Deploy backend (auto-deploys on git push)
git push origin main

# Deploy frontend (Vercel)
cd frontend && vercel --prod
```

---

Good luck with your deployment! 🚀
