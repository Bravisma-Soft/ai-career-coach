# Google OAuth Production Deployment Guide

## ✅ Pre-Deployment Checklist

### 1. Google Cloud Console Configuration

**Add Production Redirect URIs:**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Click on your OAuth 2.0 Client ID
4. Under **Authorized redirect URIs**, add:
   ```
   https://your-backend.railway.app/api/auth/google/callback
   ```
   ⚠️ Replace `your-backend.railway.app` with your actual Railway backend domain
5. Keep the localhost URI for local development:
   ```
   http://localhost:3000/api/auth/google/callback
   ```
6. Click **SAVE**

### 2. Railway (Backend) Environment Variables

Go to your Railway project → Backend service → Variables tab and add/update:

```bash
# OAuth Configuration
GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-actual-client-secret
GOOGLE_CALLBACK_URL=https://your-backend.railway.app/api/auth/google/callback

# Frontend URL (for OAuth redirects)
FRONTEND_URL=https://your-frontend.vercel.app

# Make sure these are also set correctly
NODE_ENV=production
CORS_ORIGIN=https://your-frontend.vercel.app
```

⚠️ **Important:** Use your **actual production URLs**, not placeholders!

### 3. Vercel (Frontend) Environment Variables

Go to your Vercel project → Settings → Environment Variables and ensure:

```bash
VITE_API_URL=https://your-backend.railway.app/api
```

⚠️ **Important:** Include `/api` at the end!

### 4. Test Your Production URLs

Before deploying, verify your URLs:

**Backend URL:**
- Visit: `https://your-backend.railway.app/health`
- Should return: `{"success":true,"message":"AI Career Coach API is running",...}`

**Frontend URL:**
- Visit: `https://your-frontend.vercel.app`
- Should load your application

## 🚀 Deployment Steps

### Step 1: Commit and Push Code

```bash
# Make sure you're in the root directory
cd /Users/gauravc/Projects/ai-ml/ai-career-coach

# Check git status (verify .env is NOT in the list)
git status

# Stage all changes
git add .

# Commit with a descriptive message
git commit -m "feat: implement Google OAuth authentication

- Add OAuth support to User model with provider fields
- Integrate Passport.js with Google OAuth strategy
- Create OAuth callback routes and token handling
- Update frontend with Google sign-in buttons
- Add OAuth callback page for token processing
- Update documentation with setup guide"

# Push to GitHub
git push origin main
```

### Step 2: Deploy Backend (Railway)

Railway should auto-deploy when you push to main. Monitor the deployment:

1. Go to Railway dashboard
2. Check the deployment logs
3. Verify the build succeeds
4. Test the health endpoint: `https://your-backend.railway.app/health`

**If Railway doesn't auto-deploy:**
- Go to Railway → Your backend service → Deployments
- Click "Deploy" manually

### Step 3: Deploy Frontend (Vercel)

Vercel should auto-deploy when you push to main. Monitor the deployment:

1. Go to Vercel dashboard
2. Check the deployment logs
3. Verify the build succeeds
4. Visit your frontend URL

**If Vercel doesn't auto-deploy:**
- Go to Vercel → Your project → Deployments
- Click "Redeploy" on the latest deployment

### Step 4: Verify Environment Variables

**Railway (Backend):**
```bash
# Check if variables are set (from Railway CLI or dashboard)
railway variables list
```

Make sure these are present:
- ✅ GOOGLE_CLIENT_ID
- ✅ GOOGLE_CLIENT_SECRET
- ✅ GOOGLE_CALLBACK_URL
- ✅ FRONTEND_URL

**Vercel (Frontend):**
- Go to Settings → Environment Variables
- Verify `VITE_API_URL` points to your Railway backend with `/api`

### Step 5: Test OAuth Flow in Production

1. Visit your production frontend: `https://your-frontend.vercel.app`
2. Go to login page
3. Click "Sign in with Google"
4. Authorize with Google
5. Should redirect back and log you in successfully

## 🔍 Troubleshooting Production Issues

### Error: "redirect_uri_mismatch"

**Cause:** Production callback URL not configured in Google Cloud Console

**Fix:**
1. Go to Google Cloud Console → Credentials
2. Add your production callback URL: `https://your-backend.railway.app/api/auth/google/callback`
3. Make sure it matches EXACTLY (no trailing slashes, correct protocol)
4. Wait 1-2 minutes for changes to propagate

### Error: "CORS Error" or "Network Error"

**Cause:** CORS not configured correctly

**Fix in Railway:**
```bash
CORS_ORIGIN=https://your-frontend.vercel.app
```

### OAuth Works Locally but Fails in Production

**Common causes:**
1. ❌ Environment variables not set in Railway/Vercel
2. ❌ Using HTTP instead of HTTPS in production URLs
3. ❌ Callback URL mismatch between Google Console and Railway
4. ❌ Frontend URL incorrect in Railway

**Debug steps:**
1. Check Railway logs: `railway logs` or via dashboard
2. Verify all environment variables are set
3. Test backend health endpoint
4. Test OAuth endpoint directly: `https://your-backend.railway.app/api/auth/google`

### Google Shows "This app isn't verified"

**This is normal!**

For development/testing:
- Click "Continue" (Advanced → Go to AI Career Coach)
- Add your test users in Google Cloud Console

For production with >100 users:
- Submit your app for Google verification (takes 1-2 weeks)

## 📋 Post-Deployment Verification

- [ ] Backend health check works
- [ ] Frontend loads correctly
- [ ] Google OAuth button appears on login/register
- [ ] Clicking OAuth button redirects to Google
- [ ] After Google authorization, redirects back to app
- [ ] User is logged in and redirected to dashboard
- [ ] User data is saved in database
- [ ] Profile picture from Google is displayed (if implemented)

## 🔐 Security Checklist

- [ ] `.env` file is in `.gitignore` (NOT committed)
- [ ] All secrets are stored in Railway/Vercel environment variables
- [ ] Production URLs use HTTPS (not HTTP)
- [ ] CORS is configured to only allow your frontend domain
- [ ] JWT secrets are strong and unique
- [ ] Google Client Secret is never exposed to frontend

## 📝 Additional Notes

**Database Migration:**
- The OAuth migration should run automatically on Railway deploy
- If it doesn't, run manually: `railway run npx prisma migrate deploy`

**Rollback Plan:**
- If OAuth causes issues, you can temporarily disable it
- Users can still log in with email/password (existing functionality)
- OAuth is additive, not replacing existing auth

**Monitoring:**
- Check Railway logs for OAuth-related errors
- Monitor database for new OAuth users (`provider = 'GOOGLE'`)
- Track OAuth success/failure rates

---

**Need Help?**
- Check logs in Railway dashboard
- Review `backend/docs/GOOGLE_OAUTH_SETUP.md`
- Test locally first to isolate production-specific issues
