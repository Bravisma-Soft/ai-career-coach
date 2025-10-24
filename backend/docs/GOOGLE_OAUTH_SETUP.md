# Google OAuth Setup Guide

This guide explains how to set up Google OAuth authentication for the AI Career Coach application.

## Overview

The application supports Google OAuth 2.0 for user authentication, allowing users to sign in with their Google account instead of creating a password-based account.

## Prerequisites

- A Google Cloud Platform account
- Access to the Google Cloud Console
- Backend and frontend applications deployed (or running locally)

## Step-by-Step Setup

### 1. Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name: **AI Career Coach**
4. Click "Create"

### 2. Enable Google+ API

1. In the Google Cloud Console, navigate to **APIs & Services** → **Library**
2. Search for **"Google+ API"**
3. Click on it and press **"Enable"**

### 3. Configure OAuth Consent Screen

1. Navigate to **APIs & Services** → **OAuth consent screen**
2. Select **External** user type (unless you have a Google Workspace account)
3. Click **Create**

**App Information:**
- App name: `AI Career Coach`
- User support email: Your email address
- Application logo: (Optional) Upload your app logo
- Application home page: Your frontend URL (e.g., `https://aicareercoach.vercel.app`)
- Application privacy policy link: (Optional) Your privacy policy URL
- Application terms of service link: (Optional) Your terms of service URL
- Authorized domains: Add your frontend domain (e.g., `vercel.app`)
- Developer contact information: Your email address

4. Click **Save and Continue**

**Scopes:**
1. Click **Add or Remove Scopes**
2. Select these scopes:
   - `userinfo.email`
   - `userinfo.profile`
   - `openid`
3. Click **Update** → **Save and Continue**

**Test Users** (for development):
1. Add your email address as a test user
2. Click **Save and Continue**

### 4. Create OAuth 2.0 Credentials

1. Navigate to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Select **Web application**

**Configuration:**
- Name: `AI Career Coach Web Client`
- Authorized JavaScript origins:
  ```
  http://localhost:5173
  https://your-frontend-domain.vercel.app
  ```
- Authorized redirect URIs:
  ```
  http://localhost:3000/api/auth/google/callback
  https://your-backend-domain.railway.app/api/auth/google/callback
  ```

4. Click **Create**
5. **IMPORTANT:** Copy the **Client ID** and **Client Secret** - you'll need these for environment variables

### 5. Configure Backend Environment Variables

Add the following to your backend `.env` file (and Railway/production environment):

```bash
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# For production, update GOOGLE_CALLBACK_URL:
# GOOGLE_CALLBACK_URL=https://your-backend.railway.app/api/auth/google/callback
```

### 6. Configure Frontend Environment Variables

Add the following to your frontend `.env` file (and Vercel/production environment):

```bash
VITE_API_URL=http://localhost:3000/api

# For production:
# VITE_API_URL=https://your-backend.railway.app/api
```

**Note:** The `VITE_API_URL` should include `/api` at the end, as this is the base path for all API routes.

### 7. Verify Setup

**Local Testing:**
1. Start backend: `npm run dev` (in `/backend`)
2. Start frontend: `npm run dev` (in `/frontend`)
3. Navigate to `http://localhost:5173/login`
4. Click "Sign in with Google"
5. You should be redirected to Google's OAuth consent screen
6. After authorizing, you should be redirected back to the dashboard

**Production Testing:**
1. Deploy both backend and frontend
2. Update OAuth redirect URIs in Google Cloud Console with production URLs
3. Update environment variables with production values
4. Test the OAuth flow on your production site

## How It Works

### Flow Diagram

```
User clicks "Sign in with Google"
         ↓
Frontend redirects to: /api/auth/google
         ↓
Backend initiates OAuth with Google
         ↓
User authorizes on Google's consent screen
         ↓
Google redirects back to: /api/auth/google/callback
         ↓
Backend receives user profile from Google
         ↓
Backend creates/updates user in database
         ↓
Backend generates JWT tokens
         ↓
Backend redirects to frontend: /auth/callback?accessToken=...&refreshToken=...
         ↓
Frontend extracts tokens and stores in auth store
         ↓
Frontend redirects to /dashboard
```

### Database Changes

The `User` model has been updated to support OAuth:

```prisma
model User {
  // ... existing fields

  // OAuth Fields
  provider         AuthProvider @default(LOCAL)  // LOCAL, GOOGLE, GITHUB, LINKEDIN
  providerId       String?                       // Google user ID
  providerData     Json?                          // Raw OAuth profile data
  profilePicture   String?                        // Profile picture URL from OAuth

  // Password is now optional (OAuth users don't have passwords)
  password         String?
}
```

### Security Considerations

1. **HTTPS Required in Production:** OAuth callbacks must use HTTPS in production
2. **Token Handling:** JWT tokens are transmitted via URL params only during the OAuth callback - they're immediately stored and removed from the URL
3. **Email Verification:** OAuth users are automatically marked as email-verified
4. **Account Linking:** If a user with the same email exists (registered with password), the OAuth account is automatically linked
5. **Session Management:** Each OAuth login creates a new session tracked in the database

## Troubleshooting

### Error: "redirect_uri_mismatch"
**Cause:** The redirect URI doesn't match what's configured in Google Cloud Console
**Solution:** Ensure the redirect URI in your environment variable exactly matches one of the authorized redirect URIs in Google Cloud Console

### Error: "Access blocked: This app's request is invalid"
**Cause:** OAuth consent screen not properly configured
**Solution:** Complete all required fields in the OAuth consent screen configuration

### Error: "403 Forbidden"
**Cause:** Google+ API not enabled
**Solution:** Enable the Google+ API in the Google Cloud Console

### OAuth works locally but fails in production
**Cause:** Production URLs not added to authorized origins/redirects
**Solution:** Add your production URLs to the Google Cloud Console OAuth settings

### User sees "This app isn't verified" warning
**Cause:** App is in testing mode
**Solution:** This is normal for development. For production, you can:
1. Keep it in testing mode and manually add test users
2. Submit for verification (only needed for apps with >100 users)

## Additional OAuth Providers

The architecture supports adding more OAuth providers (GitHub, LinkedIn, etc.). To add another provider:

1. Install the Passport strategy: `npm install passport-github2`
2. Add credentials to `backend/src/config/env.ts`
3. Configure the strategy in `backend/src/config/passport.ts`
4. Add routes in `backend/src/api/routes/auth.routes.ts`
5. Add frontend button in Login/Register pages

## References

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Passport.js Google Strategy](http://www.passportjs.org/packages/passport-google-oauth20/)
- [Google Cloud Console](https://console.cloud.google.com/)

## Support

If you encounter issues not covered in this guide:
1. Check the backend logs for detailed error messages
2. Verify all environment variables are set correctly
3. Ensure Google Cloud Console configuration matches your environment
4. Check that your OAuth consent screen is published (if in production)

---

**Last Updated:** October 24, 2025
**Version:** 1.0.0
