# Email Integration Architecture

**Document Type:** System Documentation
**Last Updated:** October 22, 2025
**Status:** ✅ Implemented and Production-Ready
**Version:** 1.0

---

## Related Documentation

- [Project Architecture](./project_architecture.md) - Overall system design
- [/backend/docs/EMAIL_SETUP_GUIDE.md](/backend/docs/EMAIL_SETUP_GUIDE.md) - Detailed setup instructions
- [/backend/docs/EMAIL_IMPLEMENTATION_SUMMARY.md](/backend/docs/EMAIL_IMPLEMENTATION_SUMMARY.md) - Implementation details
- [/PRODUCTION_DEPLOYMENT_GUIDE.md](/PRODUCTION_DEPLOYMENT_GUIDE.md) - Production deployment

---

## 1. Overview

AI Career Coach uses **SendGrid** for transactional email delivery. The email service is fully implemented with professional HTML templates matching the website's design system and handles three types of emails:

1. **Password Reset** - Secure token-based password recovery
2. **Welcome Email** - Onboarding new users
3. **Resume Parsed Notification** - Alerts when resume processing completes

All emails feature:
- ✅ Professional gradient design (purple #7c3aed → blue #1e40af)
- ✅ Mobile-responsive table-based layouts
- ✅ Proper email client compatibility (Gmail, Outlook, Apple Mail)
- ✅ Graceful degradation with plain text fallbacks
- ✅ Non-blocking error handling

---

## 2. Architecture

### 2.1 Email Service Structure

```
backend/src/services/email.service.ts
├── EmailService (Class)
│   ├── initialize() - SendGrid API setup
│   ├── isReady() - Configuration validation
│   │
│   ├── Public Methods (Email Senders)
│   │   ├── sendPasswordResetEmail(email, token, userName)
│   │   ├── sendWelcomeEmail(email, userName)
│   │   └── sendResumeParseCompleteEmail(email, resumeName)
│   │
│   └── Private Methods (Template Generators)
│       ├── getPasswordResetHtmlContent() / getPasswordResetTextContent()
│       ├── getWelcomeHtmlContent() / getWelcomeTextContent()
│       └── getResumeParseHtmlContent() / getResumeParseTextContent()
│
└── emailService (Singleton Export)
```

### 2.2 Integration Points

```
Email Service Integration Flow:

┌─────────────────┐
│  Auth Service   │ ─────┐
└─────────────────┘      │
                         │ sendPasswordResetEmail()
┌─────────────────┐      │ sendWelcomeEmail()
│ Resume Worker   │ ─────┼───────────> EmailService ─────> SendGrid API
└─────────────────┘      │                                       │
                         │                                       ▼
┌─────────────────┐      │                                  User's Inbox
│  API Routes     │ ─────┘
└─────────────────┘
```

**Integration Locations:**

1. **Authentication Flow** (`backend/src/services/auth.service.ts`)
   - Line 438: Password reset email
   - Line 125: Welcome email on registration

2. **Resume Processing** (`backend/src/jobs/processors/resume-parse.processor.ts`)
   - Line 154: Resume completion notification

3. **Environment Configuration** (`backend/src/config/env.ts`)
   - SendGrid credentials and configuration

---

## 3. Email Templates Design

### 3.1 Design System

All email templates follow the website's design system:

**Color Palette:**
```typescript
Brand Colors:
- Primary Purple: #7c3aed
- Secondary Blue: #1e40af
- Background White: #ffffff
- Text Dark: #0a0e27
- Text Muted: #6b7280
- Border: #e5e7eb

Gradient:
- Header/Buttons: linear-gradient(135deg, #7c3aed 0%, #1e40af 100%)
- Background: linear-gradient(135deg, #faf5ff 0%, #eff6ff 100%)

Alert Colors:
- Warning: #fef3c7 (bg), #f59e0b (border), #78350f (text)
- Success: #d1fae5 (bg), #10b981 (border), #065f46 (text)
```

**Typography:**
```css
Font Stack: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
            'Helvetica Neue', Arial, sans-serif
Heading 1: 28px, weight 700, letter-spacing -0.5px
Heading 2: 22px, weight 600
Heading 3: 18px, weight 600
Body Text: 16px, line-height 1.6
Muted Text: 14px
```

### 3.2 Template Structure

Each email follows this structure:

```html
<!DOCTYPE html>
<html>
<body style="background: gradient; font-family: system-fonts;">
  <table width="100%" style="min-height: 100vh; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" style="background: white; border-radius: 12px; shadow;">

          <!-- Header with Gradient -->
          <tr>
            <td style="gradient purple-blue; padding: 40px;">
              <h1 style="white text">🚀 AI Career Coach</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              [Email-specific content]

              <!-- CTA Button -->
              <table width="100%">
                <tr>
                  <td align="center">
                    <a href="[link]" style="gradient button; white text;">
                      [Action]
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="border-top; light bg; padding: 30px;">
              <p>Best Regards,<br>The AI Career Coach Team</p>
            </td>
          </tr>
        </table>

        <!-- Email Footer -->
        <table width="600">
          <tr>
            <td align="center">
              <p>AI Career Coach - Your AI-powered job search assistant</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

**Why Table-Based Layout?**
- Email clients (especially Outlook) have poor CSS support
- Tables ensure consistent rendering across all platforms
- Inline styles required (no external stylesheets)
- Gradient backgrounds use inline styles for compatibility

---

## 4. Email Types

### 4.1 Password Reset Email

**Trigger:** User requests password reset via `/api/auth/forgot-password`

**Content:**
- Personalized greeting with user's name
- Clear explanation of the request
- Prominent reset password button with gradient
- Warning banner (1-hour expiration)
- Security note (ignore if not requested)
- Fallback plain URL

**Link:**
```
https://your-frontend.vercel.app/reset-password?token={resetToken}
```

**Security:**
- Token expires in 1 hour (backend validation)
- Token is one-time use only
- Token is hashed in database
- HTTPS-only links in production

**Template Variables:**
- `userName` - User's first name (or "there" if null)
- `resetUrl` - Full reset link with token

### 4.2 Welcome Email

**Trigger:** New user registration via `/api/auth/register`

**Content:**
- Welcome message with user's name
- List of key features with icons
- Get Started CTA button
- Links to dashboard

**Link:**
```
https://your-frontend.vercel.app/dashboard
```

**Features Highlighted:**
- ✅ Upload and manage resumes
- 📊 Track job applications (Kanban board)
- 🎯 AI-powered resume tailoring
- ✍️ Generate cover letters
- 🎤 Practice mock interviews

**Template Variables:**
- `userName` - User's first name
- `env.FRONTEND_URL` - Base frontend URL

### 4.3 Resume Parsed Notification

**Trigger:** Resume parsing job completes successfully (background worker)

**Content:**
- Success banner (green with checkmark)
- Resume name confirmation
- List of next steps with icons
- View Resume CTA button
- Motivational message

**Link:**
```
https://your-frontend.vercel.app/resumes
```

**Next Steps Shown:**
- 📄 View parsed resume data
- 🎯 Tailor resume for jobs
- ✍️ Generate cover letters
- 📊 Track applications

**Template Variables:**
- `resumeName` - Name of the uploaded resume
- `env.FRONTEND_URL` - Base frontend URL

---

## 5. Environment Configuration

### 5.1 Required Environment Variables

```bash
# SendGrid Configuration
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
SENDGRID_FROM_NAME=AI Career Coach

# Frontend URL (for email links)
FRONTEND_URL=https://your-frontend.vercel.app

# Application
NODE_ENV=production
```

### 5.2 Railway Service Configuration

**CRITICAL:** Both `backend` AND `worker-resume-parser` services need these variables!

**Why?**
- Backend sends password reset and welcome emails
- Worker sends resume completion emails
- Both need `FRONTEND_URL` for correct links

**Common Mistake:**
❌ Setting `FRONTEND_URL` only on backend → Resume emails link to localhost
✅ Set `FRONTEND_URL` on BOTH backend and worker services

### 5.3 SendGrid Setup

**Steps:**
1. Create SendGrid account (free tier: 100 emails/day)
2. Generate API key: Settings → API Keys → Create API Key
3. Verify sender email: Settings → Sender Authentication → Single Sender Verification
4. Add API key to Railway environment variables
5. Set from email to verified email address

**Free Tier Limits:**
- 100 emails/day
- Sufficient for development and early production
- Upgrade to paid plan for higher volume

---

## 6. Password Reset Flow

### 6.1 Complete Flow Diagram

```
┌──────────────┐
│ User clicks  │
│ "Forgot      │
│  Password"   │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────┐
│ Frontend: /forgot-password   │
│ - Enter email                │
│ - Submit form                │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│ POST /api/auth/forgot-password│
│ - Validate email             │
│ - Generate reset token       │
│ - Hash token → save DB       │
│ - Call emailService          │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│ SendGrid API                 │
│ - Sends email with link      │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│ User receives email          │
│ - Clicks "Reset Password"    │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│ Frontend: /reset-password    │
│ ?token=abc123                │
│ - Validate token exists      │
│ - Show password form         │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│ POST /api/auth/reset-password│
│ - Verify token valid         │
│ - Check not expired (1h)     │
│ - Hash new password          │
│ - Update user password       │
│ - Delete used token          │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│ Success!                     │
│ - Redirect to /login         │
│ - User can log in            │
└──────────────────────────────┘
```

### 6.2 Frontend Routes

**Created Routes:**

1. **`/forgot-password`** (`frontend/src/pages/ForgotPassword.tsx`)
   - Email input form
   - Email sent confirmation state
   - Links to login/register
   - Error handling

2. **`/reset-password`** (`frontend/src/pages/ResetPassword.tsx`)
   - Token validation from query param
   - Password input form with confirmation
   - Success/error states
   - Expired token handling
   - Auto-redirect to login (3 seconds)

**Route Configuration:**
```typescript
// frontend/src/App.tsx
<Route
  path="/forgot-password"
  element={<ForgotPassword />}
/>
<Route
  path="/reset-password"
  element={<ResetPassword />}
/>
```

### 6.3 Backend API Endpoints

**1. Forgot Password**
```typescript
POST /api/auth/forgot-password
Body: { email: string }

Response:
200 OK - Email sent (even if user doesn't exist - security)
500 Error - Server error
```

**2. Reset Password**
```typescript
POST /api/auth/reset-password
Body: { token: string, newPassword: string }

Response:
200 OK - Password updated successfully
400 Bad Request - Invalid/expired token
500 Error - Server error
```

### 6.4 Security Considerations

**Token Security:**
- Tokens are cryptographically random (32 bytes)
- Tokens are hashed before storage (SHA-256)
- Tokens expire after 1 hour
- Tokens are one-time use (deleted after successful reset)
- Plain token only sent in email (never logged)

**Rate Limiting:**
- Forgot password: 5 requests per 15 minutes per IP
- Reset password: 3 attempts per token

**HTTPS Required:**
- All reset links use HTTPS in production
- Protects token in transit
- Prevents MITM attacks

---

## 7. Error Handling

### 7.1 Email Service Error Handling

**Philosophy:** Email failures should NEVER block user operations

```typescript
try {
  await sgMail.send(msg);
  logger.info(`Email sent to ${email}`);
} catch (error) {
  logger.error(`Failed to send email to ${email}:`, error);
  // Don't throw - operation continues
  // Token is still valid if password reset
}
```

**Why Non-Blocking?**
- Password reset: Token is saved, user can still reset (they just won't get the email)
- Welcome email: User is registered, they can still log in
- Resume notification: Resume is parsed, user can view it

### 7.2 Graceful Degradation

**Development Mode:**
```typescript
if (!this.isReady()) {
  logger.warn(`Email service not configured - would send to ${email}`);

  if (env.NODE_ENV === 'development') {
    const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    logger.info(`Password reset URL (development only): ${resetUrl}`);
  }
  return;
}
```

**Production Without SendGrid:**
- Service logs warning
- Operations continue
- Emails not sent (but logged)
- Users won't receive notifications

### 7.3 Common Errors and Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `403 Forbidden` | Sender email not verified | Verify sender in SendGrid |
| `FRONTEND_URL undefined` | Env var not set | Add to Railway variables |
| `localhost:5173 in links` | Wrong FRONTEND_URL | Set to production URL |
| `File is not defined` | Node < 20 | Use Node.js 20+ (fixed) |
| `Template not found` | Import error | Check authService path |

---

## 8. Testing

### 8.1 Local Testing

**Setup:**
```bash
# 1. Add to backend/.env
SENDGRID_API_KEY=SG.xxx
SENDGRID_FROM_EMAIL=your-verified-email@domain.com
SENDGRID_FROM_NAME=AI Career Coach
FRONTEND_URL=http://localhost:5173

# 2. Restart backend
cd backend && npm run dev
```

**Test Cases:**

1. **Password Reset Flow:**
   ```bash
   # Frontend: Go to /forgot-password
   # Enter email → Submit
   # Check email inbox
   # Click reset link
   # Set new password
   # Login with new password
   ```

2. **Welcome Email:**
   ```bash
   # Frontend: Register new user
   # Check email inbox
   # Verify welcome email received
   # Click "Get Started"
   # Should land on /dashboard
   ```

3. **Resume Notification:**
   ```bash
   # Upload a resume
   # Wait for processing (~30-60 sec)
   # Check email inbox
   # Verify resume name in email
   # Click "View Your Resume"
   # Should land on /resumes
   ```

### 8.2 Production Testing

**Pre-Deployment Checklist:**
- [ ] SendGrid API key added to Railway (backend + worker)
- [ ] Sender email verified in SendGrid
- [ ] `FRONTEND_URL` set to production URL (both services)
- [ ] Test email in production environment
- [ ] Verify all links use HTTPS
- [ ] Check email rendering in Gmail, Outlook, Apple Mail

---

## 9. Monitoring

### 9.1 Logs to Monitor

**Successful Email:**
```
INFO: SendGrid email service initialized
INFO: Password reset email sent to user@example.com
```

**Failed Email:**
```
WARN: Email service not configured - would send to user@example.com
ERROR: Failed to send password reset email to user@example.com: 403 Forbidden
```

### 9.2 SendGrid Dashboard

**Metrics Available:**
- Email delivery rate
- Bounce rate
- Spam reports
- Click-through rate (CTAs)
- Open rate

**Access:** https://app.sendgrid.com/stats/

### 9.3 Key Metrics

**Track These:**
- Email send success rate (should be >99%)
- Password reset completion rate
- Email open rate (typically 20-30% for transactional)
- Link click rate (CTA effectiveness)
- Bounce/spam rate (should be <1%)

---

## 10. Deployment Fixes (October 22, 2025)

### 10.1 Issues Resolved

**Issue #1: Localhost URLs in Production Emails**
- **Problem:** Emails linked to `http://localhost:5173/resumes`
- **Root Cause:** `FRONTEND_URL` not set in Railway
- **Solution:** Added `FRONTEND_URL` to both backend AND worker services

**Issue #2: Railway Frontend Auto-Detection**
- **Problem:** Railway creating `vite_react_shadcn_ts` service (failing)
- **Root Cause:** Monorepo structure confused Railway
- **Solution:** Updated `backend/railway.toml` with `watchPaths = ["backend/**"]`

**Issue #3: Node.js Version Error**
- **Problem:** `ReferenceError: File is not defined`
- **Root Cause:** Railway using Node.js < 20
- **Solution:** Added `engines` field to package.json + `.node-version` file

**Issue #4: Vercel 404 on Password Reset Routes**
- **Problem:** `/reset-password` returning 404 NOT_FOUND
- **Root Cause:** Vercel didn't know to serve index.html for client routes
- **Solution:** Created `frontend/vercel.json` with rewrites

**Issue #5: Import Path Errors**
- **Problem:** Build failing on `auth.service` import
- **Root Cause:** Typo in import path (should be `authService`)
- **Solution:** Fixed import paths in password reset pages

### 10.2 Railway Configuration

**File:** `backend/railway.toml`
```toml
[build]
builder = "NIXPACKS"
buildCommand = "npm install && npm run prisma:generate && npm run build"

[deploy]
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10
watchPaths = ["backend/**"]  # Only watch backend
```

### 10.3 Vercel Configuration

**File:** `frontend/vercel.json`
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## 11. Best Practices

### 11.1 Email Design

✅ **Do:**
- Use table-based layouts for compatibility
- Include both HTML and plain text versions
- Test in multiple email clients
- Use inline CSS only
- Provide fallback plain URLs
- Match brand colors and fonts
- Make CTAs prominent and accessible
- Use semantic HTML

❌ **Don't:**
- Use external stylesheets
- Rely on advanced CSS (flexbox, grid)
- Use JavaScript
- Make emails too wide (600px max)
- Forget mobile responsive design
- Use tiny fonts (<14px)

### 11.2 Error Handling

✅ **Do:**
- Log all email failures
- Make emails non-blocking
- Provide fallback mechanisms
- Validate configuration on startup
- Test error scenarios
- Monitor delivery rates

❌ **Don't:**
- Throw errors that block operations
- Expose SendGrid errors to users
- Retry failed emails aggressively
- Log sensitive data (tokens, passwords)

### 11.3 Security

✅ **Do:**
- Use HTTPS for all links
- Expire reset tokens (1 hour)
- Hash tokens in database
- Use one-time tokens
- Rate limit reset requests
- Validate email addresses

❌ **Don't:**
- Send passwords in emails
- Use predictable tokens
- Allow unlimited reset attempts
- Log plain tokens
- Skip sender verification

---

## 12. Cost Considerations

### 12.1 SendGrid Pricing

**Free Tier:**
- 100 emails/day
- Sufficient for: ~3,000 emails/month
- Good for: Development, MVP, small user base

**Essentials ($19.95/month):**
- 50,000 emails/month
- Good for: Growing startups

**Pro ($89.95/month):**
- 100,000 emails/month
- Advanced features (A/B testing, dedicated IP)

### 12.2 Cost Optimization

**Strategies:**
1. **Batch Welcome Emails** - Send daily digest instead of real-time
2. **Disable Resume Notifications** - Make it opt-in
3. **Use In-App Notifications** - Reduce email dependency
4. **Monitor Bounce Rate** - Remove invalid emails
5. **Compress Templates** - Reduce email size

**Current Usage Estimate:**
- 100 users → ~300 emails/month (within free tier)
- 1,000 users → ~3,000 emails/month (need paid plan)

---

## 13. Future Enhancements

### 13.1 Planned Improvements

1. **Email Templates**
   - [ ] Application reminder emails
   - [ ] Interview reminder emails (calendar integration)
   - [ ] Weekly job digest
   - [ ] Performance report emails
   - [ ] Referral invitation emails

2. **Personalization**
   - [ ] Dynamic content based on user preferences
   - [ ] Localization (i18n)
   - [ ] Time zone aware sending
   - [ ] A/B testing for subject lines

3. **Analytics**
   - [ ] Track email open rates
   - [ ] Track CTA click rates
   - [ ] Measure conversion rates
   - [ ] Email performance dashboard

4. **Infrastructure**
   - [ ] Email queue with retry logic
   - [ ] Template versioning
   - [ ] Email preview in admin panel
   - [ ] Unsubscribe management

### 13.2 Alternative Providers

**Considered Alternatives:**
- **Resend** - Modern alternative, similar pricing
- **AWS SES** - Cheaper at scale, more setup
- **Postmark** - Great deliverability, higher cost
- **Mailgun** - Feature-rich, complex pricing

**Why SendGrid?**
- Easy setup and integration
- Free tier sufficient for MVP
- Good documentation and SDK
- Proven reliability
- Used by many startups

---

## 14. Troubleshooting

### 14.1 Emails Not Sending

**Check:**
1. SendGrid API key configured? `echo $SENDGRID_API_KEY`
2. Sender email verified in SendGrid dashboard?
3. Service initialized? Check logs for "SendGrid email service initialized"
4. Railway env vars set on both backend AND worker?

**Test:**
```bash
# Check configuration
curl -X POST https://api.sendgrid.com/v3/mail/send \
  -H "Authorization: Bearer $SENDGRID_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "personalizations": [{"to": [{"email": "test@example.com"}]}],
    "from": {"email": "noreply@yourdomain.com"},
    "subject": "Test",
    "content": [{"type": "text/plain", "value": "Test"}]
  }'
```

### 14.2 Wrong Links in Emails

**Check:**
1. `FRONTEND_URL` environment variable set correctly?
2. Set on both backend AND worker services?
3. Using production URL (not localhost)?
4. HTTPS (not HTTP)?

**Verify:**
```bash
# Railway dashboard → service → Variables
FRONTEND_URL=https://your-frontend.vercel.app  # ✅
FRONTEND_URL=http://localhost:5173            # ❌
```

### 14.3 Email Design Broken

**Common Issues:**
- Outlook doesn't support gradient backgrounds → Use solid colors as fallback
- Gmail clips emails >102KB → Compress templates
- Dark mode issues → Test with `prefers-color-scheme`
- Images not loading → Use inline base64 or reliable CDN

---

## 15. Related Files

**Email Service:**
- `backend/src/services/email.service.ts` - Core service (490 lines)
- `backend/src/config/env.ts` - Environment configuration

**Integration Points:**
- `backend/src/services/auth.service.ts` - Password reset & welcome emails
- `backend/src/jobs/processors/resume-parse.processor.ts` - Resume notification

**Frontend Routes:**
- `frontend/src/pages/ForgotPassword.tsx` - Email input page
- `frontend/src/pages/ResetPassword.tsx` - Password reset page
- `frontend/src/App.tsx` - Route configuration
- `frontend/src/services/authService.ts` - API calls

**Configuration:**
- `backend/.env.example` - Environment template
- `backend/railway.toml` - Railway deployment config
- `frontend/vercel.json` - Vercel SPA routing

**Documentation:**
- `/backend/docs/EMAIL_SETUP_GUIDE.md` - Step-by-step setup
- `/backend/docs/EMAIL_IMPLEMENTATION_SUMMARY.md` - Implementation details
- `/PRODUCTION_DEPLOYMENT_GUIDE.md` - Production setup

---

**Document Maintained By:** Engineering Team
**Last Updated:** October 22, 2025
**Next Review:** After implementing additional email types
**Version:** 1.0
