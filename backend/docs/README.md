# Backend Documentation

**Last Updated:** October 24, 2025

## 📚 Quick Links

- **[API.md](./API.md)** - Complete API reference
- **[DATABASE.md](./DATABASE.md)** - Database schema and Prisma
- **[AUTHENTICATION.md](./AUTHENTICATION.md)** - Auth system and OAuth
- **[AI_AGENTS.md](./AI_AGENTS.md)** - AI integration and agents
- **[EMAIL.md](./EMAIL.md)** - Email service (SendGrid)

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

## 📖 Detailed Documentation

### Core Systems
- **[AUTHENTICATION.md](./AUTHENTICATION.md)** - JWT auth, OAuth, sessions
- **[DATABASE.md](./DATABASE.md)** - Schema, migrations, queries
- **[API.md](./API.md)** - All endpoints and examples

### Features
- **[AI_AGENTS.md](./AI_AGENTS.md)** - Claude integration, agents, prompts
- **[EMAIL.md](./EMAIL.md)** - SendGrid setup, templates, flows

### Guides
- **[GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md)** - OAuth setup guide
- **[JWT_TOKEN_TROUBLESHOOTING.md](./JWT_TOKEN_TROUBLESHOOTING.md)** - JWT debugging

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

## 🗄️ Database

See **[DATABASE.md](./DATABASE.md)** for complete schema documentation.

**Quick Commands:**
```bash
npx prisma migrate dev     # Create and apply migration
npx prisma studio          # Open database GUI
npx prisma generate        # Regenerate Prisma Client
```

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

## 🚀 Deployment

Deployed on Railway. See root [DEPLOYMENT.md](../../docs/DEPLOYMENT.md) for details.

**Build Command:**
```bash
npm install && rm -rf node_modules/.prisma && npx prisma generate && npm run build
```

**Start Command:**
```bash
npm run start:migrate
```

---

**Maintained by:** Backend Team
