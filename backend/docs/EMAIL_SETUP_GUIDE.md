# SendGrid Email Integration Setup Guide

**Last Updated:** October 22, 2025

This guide walks you through setting up SendGrid for sending emails in the AI Career Coach application.

---

## 📧 Email Features

The application sends emails for the following events:

1. **Password Reset** - When users request to reset their password
2. **Welcome Email** - When new users register (optional)
3. **Resume Parsed** - When resume parsing completes (optional)

---

## 🚀 Quick Setup (5 minutes)

### 1. Create a SendGrid Account

1. Go to [SendGrid](https://sendgrid.com/) and sign up for a free account
   - Free tier includes: **100 emails/day** (sufficient for development and early production)
2. Verify your email address
3. Complete the onboarding steps

### 2. Create an API Key

1. Log into SendGrid dashboard
2. Navigate to **Settings** → **API Keys**
3. Click **Create API Key**
4. Choose **Restricted Access** for security:
   - Name: `AI Career Coach - Production` (or `Development`)
   - Enable **Mail Send** → **Full Access**
   - All other permissions: **No Access**
5. Click **Create & View**
6. **IMPORTANT:** Copy the API key immediately - you won't see it again!

### 3. Verify Sender Identity

SendGrid requires you to verify sender identity before sending emails.

#### Option A: Single Sender Verification (Recommended for Development)

1. Go to **Settings** → **Sender Authentication** → **Single Sender Verification**
2. Click **Create New Sender**
3. Fill in the form:
   - **From Name:** AI Career Coach
   - **From Email:** your-verified-email@gmail.com (use your actual email)
   - **Reply To:** Same as From Email
   - **Address, City, State, etc.** - Fill in your details
4. Click **Create**
5. Check your email and click the verification link
6. Once verified, you can send emails from this address

#### Option B: Domain Authentication (Recommended for Production)

1. Go to **Settings** → **Sender Authentication** → **Domain Authentication**
2. Follow the steps to authenticate your domain
3. Add DNS records to your domain provider
4. Verify the domain

> **Note:** For production, you should use a custom domain (e.g., `noreply@aicareercoach.com`)

### 4. Configure Environment Variables

Add the following to your `.env` file:

```bash
# SendGrid Configuration
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=your-verified-email@gmail.com
SENDGRID_FROM_NAME=AI Career Coach

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:5173
```

**Production values:**
```bash
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@aicareercoach.com
SENDGRID_FROM_NAME=AI Career Coach
FRONTEND_URL=https://your-frontend-url.vercel.app
```

### 5. Restart the Server

```bash
npm run dev
```

You should see in the logs:
```
SendGrid email service initialized
```

---

## 🧪 Testing the Email Flow

### Test 1: Password Reset Email

1. **Register a test user** (if you don't have one):
   ```bash
   curl -X POST http://localhost:3000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "password123",
       "firstName": "Test",
       "lastName": "User"
     }'
   ```

2. **Request password reset**:
   ```bash
   curl -X POST http://localhost:3000/api/auth/forgot-password \
     -H "Content-Type: application/json" \
     -d '{"email": "test@example.com"}'
   ```

3. **Check your email**:
   - You should receive an email with subject: "Reset Your Password - AI Career Coach"
   - Click the "Reset Password" button
   - It should redirect to: `http://localhost:5173/reset-password?token=xxx`

4. **Reset your password**:
   ```bash
   curl -X POST http://localhost:3000/api/auth/reset-password \
     -H "Content-Type: application/json" \
     -d '{
       "token": "YOUR_TOKEN_FROM_EMAIL",
       "newPassword": "newpassword123"
     }'
   ```

### Test 2: Welcome Email

1. **Register a new user**:
   ```bash
   curl -X POST http://localhost:3000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "newuser@example.com",
       "password": "password123",
       "firstName": "John",
       "lastName": "Doe"
     }'
   ```

2. **Check your email**:
   - You should receive a welcome email with subject: "Welcome to AI Career Coach!"

### Test 3: Resume Parse Notification

1. **Upload a resume** (requires authentication)
2. **Parse the resume**
3. **Check your email** after parsing completes

---

## 🔍 Troubleshooting

### Issue: "SendGrid API key not configured - emails will not be sent"

**Cause:** `SENDGRID_API_KEY` is missing or empty in `.env`

**Solution:**
1. Check that `.env` file exists in `backend/` directory
2. Verify `SENDGRID_API_KEY` is set
3. Restart the server

### Issue: "Failed to send email: 403 Forbidden"

**Cause:** Sender email not verified in SendGrid

**Solution:**
1. Go to SendGrid → **Settings** → **Sender Authentication**
2. Verify your sender email or domain
3. Make sure `SENDGRID_FROM_EMAIL` matches a verified sender

### Issue: Email not received

**Possible causes:**
1. **Check spam folder** - SendGrid emails might be filtered
2. **Verify email address** - Make sure the recipient email is correct
3. **Check SendGrid Activity**:
   - Go to SendGrid → **Activity**
   - Look for your email
   - Check status (Delivered, Bounced, etc.)
4. **Free tier limit** - You might have exceeded 100 emails/day

### Issue: "Failed to send email" in logs

**Check logs for specific error:**
```bash
npm run dev
```

Look for error details in the console. Common errors:
- `401 Unauthorized` - Invalid API key
- `403 Forbidden` - Sender not verified
- `429 Too Many Requests` - Rate limit exceeded

---

## 📊 Monitoring Email Delivery

### SendGrid Dashboard

1. Go to **Activity** in SendGrid dashboard
2. View recent email activity:
   - **Processed** - Email accepted by SendGrid
   - **Delivered** - Email delivered to recipient
   - **Opened** - Recipient opened email (if tracking enabled)
   - **Clicked** - Recipient clicked link (if tracking enabled)
   - **Bounced** - Email bounced (invalid address)
   - **Spam Reports** - Marked as spam

### Application Logs

Check backend logs for email events:
```bash
# Success
SendGrid email service initialized
Password reset email sent to user@example.com
Welcome email sent to newuser@example.com

# Failure
Failed to send password reset email to user@example.com: <error>
```

---

## 🔒 Security Best Practices

### 1. Protect API Keys

- ✅ Store API keys in environment variables
- ✅ Never commit `.env` to git
- ✅ Use different API keys for development/staging/production
- ✅ Rotate API keys periodically (every 90 days)
- ❌ Never hardcode API keys in source code

### 2. Use Restricted API Keys

- Only grant **Mail Send** permission
- Don't use Full Access API keys

### 3. Sender Authentication

- ✅ Always verify sender email or domain
- ✅ Use SPF, DKIM, DMARC for domain authentication
- ❌ Don't use unverified email addresses

### 4. Rate Limiting

SendGrid free tier limits:
- **100 emails/day** - Free tier
- **40,000 emails/month** - Essentials ($19.95/mo)
- **100,000 emails/month** - Pro ($89.95/mo)

Monitor usage in SendGrid dashboard: **Settings** → **Account Details**

---

## 🌐 Production Deployment

### Railway Environment Variables

Add the following environment variables in Railway:

1. Go to your Railway project
2. Click on your backend service
3. Navigate to **Variables** tab
4. Add:
   ```
   SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxx
   SENDGRID_FROM_EMAIL=noreply@aicareercoach.com
   SENDGRID_FROM_NAME=AI Career Coach
   FRONTEND_URL=https://your-frontend.vercel.app
   ```

### Vercel Environment Variables

If you need to reference frontend URL from frontend:

1. Go to your Vercel project
2. Navigate to **Settings** → **Environment Variables**
3. Add any frontend-specific email configs

---

## 📧 Email Templates

Email templates are defined in `backend/src/services/email.service.ts`.

### Customizing Templates

To customize email content:

1. Open `backend/src/services/email.service.ts`
2. Find the template method:
   - `getPasswordResetHtmlContent()` - Password reset email HTML
   - `getPasswordResetTextContent()` - Password reset email plain text
   - `getWelcomeHtmlContent()` - Welcome email HTML
   - `getWelcomeTextContent()` - Welcome email plain text
3. Modify the HTML/text as needed
4. Restart the server

### Template Features

- ✅ Responsive design (mobile-friendly)
- ✅ Plain text fallback
- ✅ Professional styling
- ✅ Branded colors (purple theme)
- ✅ Clear call-to-action buttons
- ✅ Security warnings (for password reset)

---

## 🎯 Next Steps

### Optional Enhancements

1. **Email Tracking**
   - Enable click/open tracking in SendGrid
   - Analyze email engagement

2. **Email Templates in SendGrid**
   - Use SendGrid's Dynamic Templates instead of code-based templates
   - Easier for non-developers to edit

3. **Additional Email Types**
   - Job application reminders
   - Interview prep notifications
   - Weekly job digest

4. **Email Preferences**
   - Let users opt-out of certain emails
   - Add unsubscribe links

5. **Advanced Features**
   - A/B testing for email content
   - Personalization based on user preferences
   - Scheduled emails (weekly digests)

---

## 📚 Resources

- [SendGrid Documentation](https://docs.sendgrid.com/)
- [SendGrid Node.js SDK](https://github.com/sendgrid/sendgrid-nodejs)
- [SendGrid Email Best Practices](https://sendgrid.com/blog/best-practices-sending-email/)
- [Email Design Best Practices](https://sendgrid.com/blog/email-design-best-practices/)

---

## 🐛 Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Email not sending | API key not set | Add `SENDGRID_API_KEY` to `.env` |
| 403 Forbidden | Sender not verified | Verify sender in SendGrid dashboard |
| Email in spam | No domain auth | Set up domain authentication |
| Rate limit exceeded | Free tier limit | Upgrade SendGrid plan |
| Link not working | Wrong `FRONTEND_URL` | Update `FRONTEND_URL` in `.env` |

---

**Last Updated:** October 22, 2025
**Maintained by:** Engineering Team
**Version:** 1.0
