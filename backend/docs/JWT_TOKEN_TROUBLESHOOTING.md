# JWT Token Troubleshooting Guide

**Issue:** Users getting "Access token expired" 401 errors in production

---

## 🔍 Root Cause

JWT access tokens are expiring too quickly due to misconfigured `JWT_EXPIRES_IN` environment variable.

**Common Symptoms:**
- ✅ Login works initially
- ❌ After 15 minutes (or configured time), all API calls return 401
- ❌ Error message: "Access token expired"
- ✅ Logging out and back in fixes it temporarily

---

## ✅ Quick Fix (Railway Production)

### Step 1: Check Current Value

1. Go to [Railway Dashboard](https://railway.app/)
2. Select your project
3. Click on **backend** service
4. Go to **Variables** tab
5. Look for `JWT_EXPIRES_IN`

### Step 2: Update Value

**If `JWT_EXPIRES_IN` is set to `15m` or missing:**

1. Set `JWT_EXPIRES_IN` to `24h`
2. Click outside the field to save
3. Railway will automatically redeploy

**If `JWT_EXPIRES_IN` is not set at all:**

1. Click **+ New Variable**
2. Variable: `JWT_EXPIRES_IN`
3. Value: `24h`
4. Save and redeploy

### Step 3: Verify Fix

1. Wait for deployment to complete (~2-3 minutes)
2. Check logs for startup message
3. Test login and wait 20 minutes
4. Try accessing protected routes (should work)

---

## 🎯 Recommended Token Settings

### Production (Railway)

```bash
JWT_EXPIRES_IN=24h          # Access token valid for 24 hours
JWT_REFRESH_EXPIRES_IN=7d   # Refresh token valid for 7 days
```

**Why 24 hours?**
- ✅ Users stay logged in during work day
- ✅ Reduced refresh token requests
- ✅ Better UX (less interruptions)
- ✅ Still secure (automatic logout after 24h)

### Development (Local)

```bash
JWT_EXPIRES_IN=24h          # Can use 15m for testing token refresh
JWT_REFRESH_EXPIRES_IN=7d
```

### Testing Token Refresh

If you want to test token refresh logic:

```bash
JWT_EXPIRES_IN=5m           # Tokens expire every 5 minutes
JWT_REFRESH_EXPIRES_IN=1h   # Refresh tokens expire in 1 hour
```

---

## 🔄 How Token Refresh Works

### Flow Diagram

```
User logs in
    ↓
Receive access token (expires in 24h)
    ↓
Receive refresh token (expires in 7d)
    ↓
Frontend stores both tokens
    ↓
Make API request with access token
    ↓
[After 24 hours]
    ↓
Access token expired → 401 error
    ↓
Frontend automatically calls /api/auth/refresh
    ↓
Send refresh token
    ↓
Receive new access token + refresh token
    ↓
Retry original request
    ↓
Success!
```

### Frontend Implementation Check

**Does your frontend have token refresh logic?**

Look for code in your frontend auth service that:
1. Intercepts 401 errors
2. Calls `/api/auth/refresh` with refresh token
3. Retries failed request with new token

**Example (Axios interceptor):**
```typescript
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Try to refresh token
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const { data } = await axios.post('/api/auth/refresh', { refreshToken });
          // Save new tokens
          localStorage.setItem('accessToken', data.accessToken);
          localStorage.setItem('refreshToken', data.refreshToken);
          // Retry original request
          return axios(error.config);
        } catch (refreshError) {
          // Refresh failed, redirect to login
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);
```

---

## 🐛 Debugging Steps

### 1. Check Railway Environment Variables

```bash
# View all variables in Railway dashboard
Variables tab → Search for "JWT"
```

**Expected:**
- `JWT_SECRET` - Set (random 32+ character string)
- `JWT_REFRESH_SECRET` - Set (different from JWT_SECRET)
- `JWT_EXPIRES_IN` - Should be `24h` (not `15m`)
- `JWT_REFRESH_EXPIRES_IN` - Should be `7d`

### 2. Check Backend Logs

In Railway logs, search for:

**Successful startup:**
```
✓ Environment variables loaded
✓ Redis connected
✓ Database connected
```

**Token generation:**
```
Generated tokens for user: user-id-here
```

**Token expiration (if users getting 401s):**
```
Access token expired
```

### 3. Test Token Expiration Locally

**Login and get token:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'
```

**Decode JWT to see expiration:**
```bash
# Copy access token from response
# Go to https://jwt.io/
# Paste token to see payload:
{
  "userId": "xxx",
  "email": "test@example.com",
  "role": "USER",
  "iat": 1729631337,    # Issued at timestamp
  "exp": 1729717737     # Expiration timestamp
}

# Calculate time until expiry:
exp - iat = 86400 seconds = 24 hours ✓
```

### 4. Test Token Refresh

**Get refresh token from login response:**
```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "YOUR_REFRESH_TOKEN"}'
```

**Expected response:**
```json
{
  "accessToken": "new-access-token",
  "refreshToken": "new-refresh-token",
  "expiresIn": 86400
}
```

---

## ⚠️ Common Mistakes

### Mistake 1: Using `JWT_EXPIRES_IN=15m` in Production
**Problem:** Tokens expire every 15 minutes
**Solution:** Change to `JWT_EXPIRES_IN=24h`

### Mistake 2: No Frontend Token Refresh
**Problem:** When token expires, user is logged out
**Solution:** Implement axios interceptor for automatic refresh

### Mistake 3: Same Secret for Access and Refresh Tokens
**Problem:** Security risk
**Solution:** Use different values for `JWT_SECRET` and `JWT_REFRESH_SECRET`

### Mistake 4: Refresh Token Expired
**Problem:** User can't refresh, must login again
**Solution:** Set `JWT_REFRESH_EXPIRES_IN` to longer period (7d or 30d)

### Mistake 5: Missing Environment Variable
**Problem:** Falls back to default (might not match your needs)
**Solution:** Explicitly set all JWT variables in Railway

---

## 🔒 Security Considerations

### Token Expiration Trade-offs

**Short expiration (15m):**
- ✅ More secure (stolen tokens expire quickly)
- ❌ Poor UX (frequent re-authentication)
- ❌ More server load (frequent token refresh)

**Medium expiration (1h-6h):**
- ✅ Good security/UX balance
- ✅ Reasonable refresh frequency
- ✅ Good for high-security apps

**Long expiration (24h):**
- ✅ Best UX (users stay logged in)
- ✅ Less server load
- ⚠️ Acceptable security for most apps
- ✅ Recommended for job application tool

### Best Practices

1. ✅ **Different secrets** - JWT_SECRET ≠ JWT_REFRESH_SECRET
2. ✅ **Strong secrets** - 32+ characters, random
3. ✅ **HTTPS only** - Never send tokens over HTTP
4. ✅ **Refresh tokens in DB** - Store in Redis/Postgres for revocation
5. ✅ **Logout invalidates** - Delete refresh token from DB
6. ✅ **Token rotation** - Issue new refresh token on refresh

---

## 📊 Monitoring Token Issues

### Signs of Token Problems

**In Logs:**
```
# High frequency of these:
Access token expired
Refresh token expired
Invalid refresh token
```

**In Metrics:**
```
# High 401 error rate
401 errors > 5% of requests

# High refresh rate
/api/auth/refresh > 10% of API calls
```

### Setting Up Alerts

**Railway logs:**
1. Search for "Access token expired"
2. If you see many in short time → tokens expiring too fast
3. Check `JWT_EXPIRES_IN` value

**Frontend console:**
1. Open DevTools → Console
2. Look for 401 errors
3. Check if token refresh is working

---

## 🚀 Production Deployment Checklist

Before deploying to production:

- [ ] `JWT_SECRET` is set (32+ random characters)
- [ ] `JWT_REFRESH_SECRET` is set (different from JWT_SECRET)
- [ ] `JWT_EXPIRES_IN` is set to `24h` (or appropriate value)
- [ ] `JWT_REFRESH_EXPIRES_IN` is set to `7d` (or longer)
- [ ] Frontend has token refresh interceptor
- [ ] Tested login → wait 1 hour → still works
- [ ] Tested token refresh endpoint
- [ ] Verified logs show correct expiration times

---

## 📞 Quick Reference

### Railway Environment Variables

| Variable | Development | Production | Notes |
|----------|-------------|------------|-------|
| `JWT_SECRET` | Random 32+ chars | Random 32+ chars | Must be different in prod |
| `JWT_REFRESH_SECRET` | Random 32+ chars | Random 32+ chars | Must differ from JWT_SECRET |
| `JWT_EXPIRES_IN` | `24h` or `15m` | `24h` | **15m causes frequent logouts** |
| `JWT_REFRESH_EXPIRES_IN` | `7d` | `7d` or `30d` | How long before re-login |

### Token Expiration Values

| Value | Seconds | Use Case |
|-------|---------|----------|
| `5m` | 300 | Testing only |
| `15m` | 900 | High security apps |
| `1h` | 3600 | Medium security |
| `6h` | 21600 | Good balance |
| `24h` | 86400 | **Recommended for AI Career Coach** |
| `7d` | 604800 | Refresh tokens only |
| `30d` | 2592000 | Long-lived refresh tokens |

### API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/login` | POST | Get access + refresh tokens |
| `/api/auth/refresh` | POST | Get new tokens using refresh token |
| `/api/auth/logout` | POST | Invalidate session |

---

**Last Updated:** October 22, 2025
**Issue:** Fixed JWT_EXPIRES_IN default from 15m to 24h
**Status:** Resolved
