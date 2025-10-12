# Authentication System Documentation

## Overview

The AI Career Coach platform uses a **JWT-based authentication system** with access and refresh tokens for secure user authentication and authorization.

## Features

✅ **Secure Password Storage** - Bcrypt hashing with 10 rounds
✅ **JWT Tokens** - Access tokens (15 min) + Refresh tokens (7 days)
✅ **Session Management** - Track active sessions per user
✅ **Password Reset** - Secure token-based password reset
✅ **Rate Limiting** - Protection against brute-force attacks
✅ **Role-Based Access Control** - Admin and user roles
✅ **Email Verification** - Ready for email verification flow
✅ **Multi-Device Support** - Manage sessions across devices
✅ **Comprehensive Logging** - Track all auth events

## Architecture

### Components

```
┌─────────────────────────────────────────────────────────────┐
│                   Authentication Flow                        │
└─────────────────────────────────────────────────────────────┘

Client → Auth Routes → Validators → Auth Service → Database
            ↓              ↓             ↓
         Middleware    Validation    Business Logic
```

### Files Structure

```
src/
├── api/
│   ├── middleware/
│   │   └── auth.middleware.ts      # JWT verification, authorization
│   ├── routes/
│   │   └── auth.routes.ts          # Auth endpoints
│   └── validators/
│       └── auth.validator.ts       # Input validation schemas
├── services/
│   └── auth.service.ts             # Core auth logic
└── types/
    └── auth.types.ts               # TypeScript interfaces
```

## API Endpoints

### Base URL
```
/api/v1/auth
```

### Endpoints

#### 1. Register User
```http
POST /api/v1/auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response (201):**
```json
{
  "success": true,
  "user": {
    "id": "clx...",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "USER",
    "status": "ACTIVE",
    "emailVerified": false,
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "tokens": {
    "accessToken": "eyJhbGci...",
    "refreshToken": "eyJhbGci...",
    "expiresIn": 900
  },
  "message": "Registration successful"
}
```

**Password Requirements:**
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character (@$!%*?&)

---

#### 2. Login
```http
POST /api/v1/auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "user": { ... },
  "tokens": {
    "accessToken": "eyJhbGci...",
    "refreshToken": "eyJhbGci...",
    "expiresIn": 900
  },
  "message": "Login successful"
}
```

---

#### 3. Refresh Token
```http
POST /api/v1/auth/refresh
```

**Request Body:**
```json
{
  "refreshToken": "eyJhbGci..."
}
```

**Response (200):**
```json
{
  "success": true,
  "tokens": {
    "accessToken": "eyJhbGci...",
    "refreshToken": "eyJhbGci...",
    "expiresIn": 900
  },
  "message": "Token refreshed successfully"
}
```

---

#### 4. Get Current User
```http
GET /api/v1/auth/me
Authorization: Bearer {accessToken}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "clx...",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "USER",
      "status": "ACTIVE",
      "emailVerified": false,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  },
  "message": "User profile retrieved"
}
```

---

#### 5. Logout
```http
POST /api/v1/auth/logout
Authorization: Bearer {accessToken}
```

**Request Body (optional):**
```json
{
  "refreshToken": "eyJhbGci..."
}
```

**Response (200):**
```json
{
  "success": true,
  "data": null,
  "message": "Logout successful"
}
```

---

#### 6. Logout from All Devices
```http
POST /api/v1/auth/logout-all
Authorization: Bearer {accessToken}
```

**Response (200):**
```json
{
  "success": true,
  "data": null,
  "message": "Logged out from all devices"
}
```

---

#### 7. Forgot Password
```http
POST /api/v1/auth/forgot-password
```

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": null,
  "message": "If the email exists, a password reset link has been sent"
}
```

**Note:** Always returns success to prevent email enumeration.

---

#### 8. Reset Password
```http
POST /api/v1/auth/reset-password
```

**Request Body:**
```json
{
  "token": "abc123...",
  "newPassword": "NewSecurePass123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": null,
  "message": "Password reset successful"
}
```

---

#### 9. Get Active Sessions
```http
GET /api/v1/auth/sessions
Authorization: Bearer {accessToken}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "id": "cls...",
        "userAgent": "Mozilla/5.0...",
        "ipAddress": "192.168.1.1",
        "expiresAt": "2024-01-08T00:00:00.000Z",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  },
  "message": "Sessions retrieved"
}
```

---

#### 10. Delete Session
```http
DELETE /api/v1/auth/sessions/:sessionId
Authorization: Bearer {accessToken}
```

**Response (200):**
```json
{
  "success": true,
  "data": null,
  "message": "Session deleted"
}
```

## Authentication Flow

### 1. Registration/Login Flow

```
┌──────┐     Register/Login     ┌──────────┐
│Client│ ──────────────────────>│  Server  │
└──────┘                         └──────────┘
   │                                  │
   │                                  ├─ Validate Input
   │                                  ├─ Hash Password (bcrypt)
   │                                  ├─ Create User
   │                                  ├─ Create Session
   │                                  ├─ Generate JWT Tokens
   │                                  │
   │    Access + Refresh Tokens       │
   │<─────────────────────────────────┤
   │                                  │
   │ Store tokens securely            │
   │ (httpOnly cookies recommended)   │
```

### 2. Authenticated Request Flow

```
┌──────┐   Request + Access Token  ┌──────────┐
│Client│ ──────────────────────────>│  Server  │
└──────┘                            └──────────┘
   │                                     │
   │                                     ├─ Extract Token
   │                                     ├─ Verify JWT
   │                                     ├─ Get User from DB
   │                                     ├─ Check User Status
   │                                     ├─ Attach User to Request
   │                                     │
   │         Protected Resource          │
   │<────────────────────────────────────┤
```

### 3. Token Refresh Flow

```
┌──────┐   Refresh Token Request   ┌──────────┐
│Client│ ──────────────────────────>│  Server  │
└──────┘                            └──────────┘
   │                                     │
   │                                     ├─ Verify Refresh Token
   │                                     ├─ Check Session Exists
   │                                     ├─ Validate Expiry
   │                                     ├─ Generate New Tokens
   │                                     ├─ Update Session
   │                                     │
   │        New Access Token             │
   │<────────────────────────────────────┤
```

## Middleware Usage

### 1. Authenticate (Required Auth)
```typescript
import { authenticate } from '@/api/middleware/auth.middleware';

router.get('/protected', authenticate, handler);
```

### 2. Optional Authentication
```typescript
import { authenticateOptional } from '@/api/middleware/auth.middleware';

router.get('/public-or-private', authenticateOptional, handler);
```

### 3. Role-Based Authorization
```typescript
import { authorize, requireAdmin } from '@/api/middleware/auth.middleware';

// Specific roles
router.post('/admin-only', authenticate, requireAdmin, handler);

// Multiple roles
router.get('/multi-role', authenticate, authorize('ADMIN', 'USER'), handler);
```

### 4. Email Verification Check
```typescript
import { requireEmailVerified } from '@/api/middleware/auth.middleware';

router.post('/verified-only', authenticate, requireEmailVerified, handler);
```

### 5. Resource Ownership
```typescript
import { requireOwnership } from '@/api/middleware/auth.middleware';

// Check userId param
router.get('/users/:userId/profile', authenticate, requireOwnership(), handler);

// Check custom param
router.get('/jobs/:jobId', authenticate, requireOwnership('jobOwnerId'), handler);
```

## Security Features

### 1. Password Security
- **Bcrypt hashing** with 10 rounds (configurable via `BCRYPT_ROUNDS`)
- **Timing-safe comparison** to prevent timing attacks
- **Strong password requirements** enforced via validation

### 2. Token Security
- **Short-lived access tokens** (15 minutes)
- **Long-lived refresh tokens** (7 days)
- **Tokens signed with separate secrets**
- **Session-based refresh tokens** (one per device)

### 3. Rate Limiting
- **Auth endpoints** limited to 5 requests per 15 minutes
- **General API** limited to 100 requests per 15 minutes
- Protection against brute-force attacks

### 4. Session Management
- **Device tracking** (user agent + IP address)
- **Multiple active sessions** supported
- **Session invalidation** on logout
- **Automatic cleanup** of expired sessions

### 5. Password Reset
- **Cryptographically secure tokens**
- **SHA-256 hashed** before storage
- **1-hour expiration**
- **Single-use tokens** (deleted after use)
- **All sessions invalidated** on reset

### 6. CORS & Headers
- **Configurable CORS** origins
- **Helmet.js** security headers
- **Credentials support** for cookies

## Environment Variables

Required environment variables in `.env`:

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-token-key-change-this
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Security
BCRYPT_ROUNDS=10
PASSWORD_MIN_LENGTH=8

# Rate Limiting
RATE_LIMIT_AUTH_MAX=5
RATE_LIMIT_WINDOW_MS=900000
```

**Generate secure secrets:**
```bash
# Generate JWT_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate JWT_REFRESH_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Error Codes

| Status | Error | Description |
|--------|-------|-------------|
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Invalid or expired token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Email already exists |
| 422 | Validation Error | Input validation failed |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Server Error | Internal server error |

## Common Error Responses

### Invalid Credentials
```json
{
  "success": false,
  "error": "Invalid credentials",
  "message": "Invalid credentials",
  "statusCode": 401,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Expired Token
```json
{
  "success": false,
  "error": "Access token expired",
  "message": "Access token expired",
  "statusCode": 401,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Validation Error
```json
{
  "success": false,
  "error": "Validation Error",
  "message": "Validation Error",
  "statusCode": 400,
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ],
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Client Integration

### Example: React/TypeScript

```typescript
// API Client
class AuthAPI {
  private baseURL = 'http://localhost:3000/api/v1/auth';
  private accessToken: string | null = null;

  async register(data: RegisterDto) {
    const response = await fetch(`${this.baseURL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    if (result.tokens) {
      this.setTokens(result.tokens);
    }
    return result;
  }

  async login(email: string, password: string) {
    const response = await fetch(`${this.baseURL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const result = await response.json();
    if (result.tokens) {
      this.setTokens(result.tokens);
    }
    return result;
  }

  async getProfile() {
    const response = await fetch(`${this.baseURL}/me`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
      },
    });

    if (response.status === 401) {
      await this.refreshToken();
      return this.getProfile(); // Retry
    }

    return response.json();
  }

  async refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    const response = await fetch(`${this.baseURL}/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    const result = await response.json();
    if (result.tokens) {
      this.setTokens(result.tokens);
    }
    return result;
  }

  private setTokens(tokens: TokenPair) {
    this.accessToken = tokens.accessToken;
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
  }

  logout() {
    this.accessToken = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
}
```

## Testing

### Using cURL

**Register:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!",
    "firstName": "Test",
    "lastName": "User"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'
```

**Get Profile:**
```bash
curl -X GET http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Best Practices

1. **Store tokens securely**
   - Use httpOnly cookies for web apps
   - Use secure storage for mobile apps
   - Never store in localStorage for sensitive apps

2. **Handle token expiration**
   - Implement automatic token refresh
   - Show re-login UI when refresh fails

3. **Use HTTPS in production**
   - Never send tokens over HTTP
   - Enable secure cookies

4. **Implement proper error handling**
   - Don't expose sensitive information
   - Log errors securely

5. **Monitor authentication events**
   - Track failed login attempts
   - Alert on suspicious activity

6. **Regular security audits**
   - Update dependencies
   - Review authentication logs
   - Test for vulnerabilities

## Troubleshooting

### "Invalid credentials" on correct password
- Check if user status is ACTIVE
- Verify password wasn't reset
- Check database connectivity

### Token verification fails
- Verify JWT_SECRET matches
- Check token expiration
- Ensure token format is correct

### CORS errors
- Add frontend URL to CORS_ORIGIN
- Enable credentials if using cookies
- Check preflight requests

### Rate limiting issues
- Adjust RATE_LIMIT_AUTH_MAX
- Clear rate limit cache (Redis)
- Check client IP detection

## Next Steps

- [ ] Implement email verification
- [ ] Add OAuth providers (Google, GitHub)
- [ ] Implement 2FA (Two-Factor Authentication)
- [ ] Add login history tracking
- [ ] Implement account lockout after failed attempts
- [ ] Add email notifications for security events

## Support

For issues or questions:
- Check server logs for detailed error messages
- Review this documentation
- Check environment variables configuration
