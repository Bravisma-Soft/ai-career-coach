# Production Deployment Checklist

Use this checklist to track your deployment progress.

## Pre-Deployment

- [x] AWS S3 bucket created
- [ ] Railway account created
- [ ] GitHub repository ready
- [ ] Anthropic API key obtained
- [ ] AWS credentials ready (Access Key ID, Secret Key)

## Railway Setup

### Database & Services
- [ ] PostgreSQL database added to Railway project
- [ ] Redis instance added to Railway project
- [ ] Backend service connected to GitHub repo
- [ ] Worker service added for resume parsing
- [ ] Frontend service added (if using Railway) OR Vercel account created

### Environment Variables

#### Backend Service
- [ ] NODE_ENV=production
- [ ] DATABASE_URL configured
- [ ] REDIS connection details configured
- [ ] JWT_SECRET generated and set (64+ chars)
- [ ] JWT_REFRESH_SECRET generated and set
- [ ] SESSION_SECRET generated and set
- [ ] ANTHROPIC_API_KEY configured
- [ ] AWS credentials configured (region, access key, secret key)
- [ ] AWS_S3_BUCKET_NAME set
- [ ] CORS_ORIGIN configured (update after frontend deployed)

#### Worker Service
- [ ] All environment variables copied from Backend
- [ ] DATABASE_URL configured
- [ ] REDIS connection configured
- [ ] AWS credentials configured
- [ ] ANTHROPIC_API_KEY configured

#### Frontend Service/Vercel
- [ ] VITE_API_URL set to backend URL
- [ ] VITE_APP_NAME set
- [ ] VITE_ENVIRONMENT=production

## Deployment

- [ ] Backend build and start commands configured
- [ ] Worker build and start commands configured
- [ ] Frontend build command configured
- [ ] Database migrations run (`npm run prisma:migrate:prod`)
- [ ] Services deployed successfully
- [ ] No errors in deployment logs

## Testing

- [ ] Backend health check works: `curl https://backend.railway.app/api/health`
- [ ] Frontend loads successfully
- [ ] User signup works
- [ ] Resume upload works (tests S3)
- [ ] Resume parsing works (tests worker + AI)
- [ ] Job creation works
- [ ] Resume tailoring works
- [ ] Interview prep works
- [ ] All features tested end-to-end

## Post-Deployment

- [ ] CORS updated with final frontend domain
- [ ] Custom domains added (optional)
- [ ] SSL/HTTPS working (Railway does automatically)
- [ ] Error tracking set up (Sentry - optional)
- [ ] Monitoring set up (optional)
- [ ] Database backups verified

## Security Review

- [ ] All secrets are strong and unique
- [ ] No secrets committed to git
- [ ] S3 bucket is private
- [ ] CORS restricted to frontend domain only
- [ ] Rate limiting enabled
- [ ] HTTPS enforced

## Documentation

- [ ] Production URLs documented
- [ ] Access credentials stored securely
- [ ] Deployment process documented
- [ ] Rollback plan documented

---

## Environment Variables Template

### Generate Secrets
Run this command to generate secure secrets:

```bash
node -e "console.log('JWT_SECRET:', require('crypto').randomBytes(64).toString('hex'))"
node -e "console.log('JWT_REFRESH_SECRET:', require('crypto').randomBytes(64).toString('hex'))"
node -e "console.log('SESSION_SECRET:', require('crypto').randomBytes(64).toString('hex'))"
```

### Backend .env (Railway Variables)

```env
# Application
NODE_ENV=production
PORT=3000
API_VERSION=v1

# Database (auto-filled by Railway)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Redis (auto-filled by Railway)
REDIS_HOST=${{Redis.REDIS_HOST}}
REDIS_PORT=${{Redis.REDIS_PORT}}
REDIS_PASSWORD=${{Redis.REDIS_PASSWORD}}
REDIS_TLS=false

# JWT (GENERATE NEW VALUES!)
JWT_SECRET=<generated-64-char-secret>
JWT_REFRESH_SECRET=<generated-64-char-secret>
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
SESSION_SECRET=<generated-64-char-secret>

# Anthropic AI
ANTHROPIC_API_KEY=<your-key>
CLAUDE_MODEL=claude-sonnet-4-5-20250929
CLAUDE_MAX_TOKENS=4096
CLAUDE_TEMPERATURE=1.0

# AWS S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=<your-key>
AWS_SECRET_ACCESS_KEY=<your-secret>
AWS_S3_BUCKET_NAME=<your-bucket>

# CORS (UPDATE AFTER FRONTEND DEPLOYED)
CORS_ORIGIN=https://your-frontend.vercel.app
CORS_CREDENTIALS=true

# Logging
LOG_LEVEL=info
LOG_FORMAT=json

# Feature Flags
ENABLE_SWAGGER=false
ENABLE_METRICS=true

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Optional
SENTRY_DSN=
```

### Frontend .env (Vercel Variables)

```env
VITE_API_URL=https://your-backend.railway.app/api
VITE_APP_NAME=AI Career Coach
VITE_APP_VERSION=1.0.0
VITE_ENVIRONMENT=production
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG=false
```

---

## Quick Commands Reference

### Test Backend Locally Before Deploying
```bash
cd backend
npm run build
npm run start:prod
```

### Test Frontend Locally Before Deploying
```bash
cd frontend
npm run build
npm run preview
```

### Railway CLI Commands
```bash
# Install
npm install -g @railway/cli

# Login
railway login

# Link project
railway link

# Run migrations
railway run npm run prisma:migrate:prod

# View logs
railway logs

# Run any command in production
railway run <command>
```

### Vercel CLI Commands
```bash
# Install
npm install -g vercel

# Deploy
cd frontend
vercel

# Deploy to production
vercel --prod
```

---

## Troubleshooting Quick Fixes

### Build Fails
```bash
# Test build locally first
cd backend
npm install
npm run build
```

### Database Connection Issues
```bash
# Check DATABASE_URL
railway run env | grep DATABASE

# Test connection
railway run npx prisma db push
```

### CORS Errors
```bash
# Update CORS_ORIGIN in Railway backend variables
# Must include https:// protocol
# Example: https://myapp.vercel.app
```

### Worker Not Running
```bash
# Check worker logs in Railway
# Verify Redis connection
# Ensure all env vars copied to worker service
```

---

## Success Criteria

✅ All items in checklist completed
✅ No errors in logs
✅ All features working in production
✅ Performance acceptable
✅ Users can sign up and use the app
✅ Resume uploads and parsing work
✅ AI features (tailoring, interview prep) work

---

## Next Steps After Deployment

1. Monitor for 24-48 hours
2. Check error rates and logs
3. Verify worker is processing jobs
4. Test under realistic load
5. Set up monitoring/alerts
6. Document any issues encountered
7. Create rollback plan if needed

---

**Estimated Time to Complete**: 2-4 hours (first time)

**Recommended Deployment Time**: During low-traffic hours or weekend

Good luck! 🚀
