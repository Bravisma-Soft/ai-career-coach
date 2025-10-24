# Backend Documentation

**Last Updated:** October 24, 2025

## 📚 Available Documentation (15 files)

### 🔐 Authentication & Security
- **[AUTH_SYSTEM.md](./AUTH_SYSTEM.md)** - Complete auth system overview
- **[AUTH_QUICK_START.md](./AUTH_QUICK_START.md)** - Quick auth setup
- **[GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md)** - Google OAuth setup guide
- **[JWT_TOKEN_TROUBLESHOOTING.md](./JWT_TOKEN_TROUBLESHOOTING.md)** - JWT debugging

### 🤖 AI Agents
- **[AI_AGENTS_FOUNDATION.md](./AI_AGENTS_FOUNDATION.md)** - AI architecture and design
- **[AI_AGENTS_SETUP_SUMMARY.md](./AI_AGENTS_SETUP_SUMMARY.md)** - AI setup summary
- **[AI_AGENTS_QUICK_START.md](./AI_AGENTS_QUICK_START.md)** - Quick AI start

### 🗄️ Database & API
- **[API_ENDPOINTS_SUMMARY.md](./API_ENDPOINTS_SUMMARY.md)** - Complete API reference
- **[../prisma/SCHEMA_DIAGRAM.md](../prisma/SCHEMA_DIAGRAM.md)** - Database schema

### 📧 Email Service
- **[EMAIL_SETUP_GUIDE.md](./EMAIL_SETUP_GUIDE.md)** - SendGrid setup
- **[EMAIL_IMPLEMENTATION_SUMMARY.md](./EMAIL_IMPLEMENTATION_SUMMARY.md)** - Email architecture

### 📝 Resume & Jobs
- **[RESUME_PARSER.md](./RESUME_PARSER.md)** - Resume parsing with AI
- **[USER_PROFILE_RESUME.md](./USER_PROFILE_RESUME.md)** - User profile & resume
- **[JOB_TRACKING_APPLICATION_MANAGEMENT.md](./JOB_TRACKING_APPLICATION_MANAGEMENT.md)** - Job tracking
- **[JOB_TRACKING_SETUP_SUMMARY.md](./JOB_TRACKING_SETUP_SUMMARY.md)** - Job setup summary

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your values

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

Server runs on: http://localhost:3000

---

## 🔧 Development

### Available Scripts
```bash
npm run dev              # Start dev server with auto-reload
npm run build            # Build for production
npm run start            # Start production server
npm run test             # Run tests
npm run lint             # Run ESLint
```

### Project Structure
```
src/
├── api/               # API routes and middleware
│   ├── routes/        # Route handlers
│   ├── middleware/    # Express middleware
│   └── validators/    # Request validation
├── services/          # Business logic
├── agents/            # AI agents
├── jobs/              # Background jobs
├── config/            # Configuration
├── database/          # Database client
├── types/             # TypeScript types
└── utils/             # Utilities
```

---

## 🗄️ Database

See **[../prisma/SCHEMA_DIAGRAM.md](../prisma/SCHEMA_DIAGRAM.md)** for complete schema.

**Quick Commands:**
```bash
npx prisma migrate dev     # Create and apply migration
npx prisma studio          # Open database GUI
npx prisma generate        # Regenerate Prisma Client
```

---

## 🔐 Environment Variables

See `.env.example` for all required variables.

**Required:**
- `DATABASE_URL` - PostgreSQL connection
- `JWT_SECRET` - JWT signing key
- `ANTHROPIC_API_KEY` - Claude API key

**Optional:**
- `GOOGLE_CLIENT_ID/SECRET` - OAuth
- `SENDGRID_API_KEY` - Email
- `AWS_*` - S3 file storage

---

## 🚀 Deployment

Deployed on Railway. See [../QUICKSTART.md](../QUICKSTART.md) for setup.

**Build Command:**
```bash
npm install && rm -rf node_modules/.prisma && npx prisma generate && npm run build
```

**Start Command:**
```bash
npm run start:migrate
```

---

## 📖 Quick Links by Topic

### Authentication
- [AUTH_SYSTEM.md](./AUTH_SYSTEM.md) - System overview
- [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md) - OAuth setup
- [JWT_TOKEN_TROUBLESHOOTING.md](./JWT_TOKEN_TROUBLESHOOTING.md) - JWT issues

### AI & Agents
- [AI_AGENTS_FOUNDATION.md](./AI_AGENTS_FOUNDATION.md) - Architecture
- [RESUME_PARSER.md](./RESUME_PARSER.md) - Resume parsing

### API & Database
- [API_ENDPOINTS_SUMMARY.md](./API_ENDPOINTS_SUMMARY.md) - API reference
- [../prisma/SCHEMA_DIAGRAM.md](../prisma/SCHEMA_DIAGRAM.md) - Database schema

### Email
- [EMAIL_SETUP_GUIDE.md](./EMAIL_SETUP_GUIDE.md) - Setup guide

### Job Tracking
- [JOB_TRACKING_APPLICATION_MANAGEMENT.md](./JOB_TRACKING_APPLICATION_MANAGEMENT.md) - Overview

---

**Maintained by:** Backend Team
**Total Files:** 15 documentation files
