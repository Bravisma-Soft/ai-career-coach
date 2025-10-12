# AI Career Coach Backend

A production-ready backend API for the AI Career Coach platform, powered by Claude AI and built with TypeScript, Express, and Prisma.

## Features

- **TypeScript** - Fully typed with strict mode enabled
- **Express** - Fast, unopinionated web framework
- **Prisma** - Modern database ORM
- **Redis** - Caching and session management
- **BullMQ** - Background job processing
- **JWT Authentication** - Secure token-based auth
- **Winston** - Comprehensive logging
- **Helmet** - Security best practices
- **Rate Limiting** - API protection
- **Zod** - Runtime schema validation
- **Anthropic Claude AI** - AI-powered career coaching

## Prerequisites

- Node.js >= 18.x
- PostgreSQL >= 14.x
- Redis >= 6.x
- npm or yarn

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd ai-career-coach-backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` and configure your environment variables:

- Database connection string
- Redis configuration
- JWT secrets (use strong, random strings!)
- Anthropic API key
- AWS credentials (if using S3)

### 4. Set up the database

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# (Optional) Seed the database
npm run prisma:seed

# (Optional) Open Prisma Studio
npm run prisma:studio
```

### 5. Start the development server

```bash
npm run dev
```

The server will start at `http://localhost:3000`

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run start:prod` | Start production server with NODE_ENV=production |
| `npm test` | Run tests |
| `npm run lint` | Lint code |
| `npm run lint:fix` | Lint and fix code |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check code formatting |
| `npm run prisma:generate` | Generate Prisma Client |
| `npm run prisma:migrate` | Run database migrations |
| `npm run prisma:studio` | Open Prisma Studio |
| `npm run typecheck` | Type check without emitting |

## Project Structure

```
/backend
├── /src
│   ├── /api
│   │   ├── /routes          # API route definitions
│   │   ├── /middleware      # Express middleware
│   │   └── /validators      # Request validation schemas
│   ├── /services            # Business logic
│   ├── /ai
│   │   ├── /agents          # AI agent implementations
│   │   ├── /prompts         # AI prompt templates
│   │   └── /utils           # AI utility functions
│   ├── /jobs
│   │   └── /processors      # Background job processors
│   ├── /database            # Database client and utilities
│   ├── /utils               # Helper functions
│   ├── /types               # TypeScript type definitions
│   ├── /config              # Configuration files
│   ├── app.ts               # Express app setup
│   └── server.ts            # Server entry point
├── /tests                   # Test files
├── /prisma                  # Prisma schema and migrations
├── /logs                    # Application logs (generated)
└── /dist                    # Compiled output (generated)
```

## API Endpoints

### Health Check

```
GET /health
```

Returns server health status.

### API Routes

All API routes are prefixed with `/api/v1`:

- `/api/v1/auth` - Authentication endpoints
- `/api/v1/users` - User management
- (Add more as you implement them)

## Environment Variables

See `.env.example` for a complete list of required environment variables.

### Critical Variables

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for signing JWT tokens (min 32 chars)
- `JWT_REFRESH_SECRET` - Secret for refresh tokens (min 32 chars)
- `ANTHROPIC_API_KEY` - Your Anthropic API key
- `REDIS_HOST` - Redis server host
- `REDIS_PORT` - Redis server port

## Security Features

- Helmet.js for HTTP header security
- CORS configuration
- Rate limiting on API endpoints
- JWT token authentication
- Password hashing with bcrypt
- Input validation with Zod
- SQL injection prevention with Prisma
- XSS protection

## Error Handling

The application uses centralized error handling with custom error classes:

- `BadRequestError` (400)
- `UnauthorizedError` (401)
- `ForbiddenError` (403)
- `NotFoundError` (404)
- `ConflictError` (409)
- `ValidationError` (422)
- `InternalServerError` (500)

## Logging

Winston is used for logging with different levels:

- `error` - Error messages
- `warn` - Warning messages
- `info` - Informational messages
- `debug` - Debug messages

Logs are written to:
- Console (all environments)
- `logs/error.log` (production only)
- `logs/combined.log` (production only)

## Database

This project uses Prisma ORM with PostgreSQL.

### Running Migrations

```bash
# Development
npm run prisma:migrate

# Production
npm run prisma:migrate:prod
```

### Generating Prisma Client

```bash
npm run prisma:generate
```

## Background Jobs

BullMQ is used for background job processing. Jobs are configured in `/src/jobs/processors`.

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

## Production Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Set environment to production:
   ```bash
   export NODE_ENV=production
   ```

3. Run database migrations:
   ```bash
   npm run prisma:migrate:prod
   ```

4. Start the server:
   ```bash
   npm run start:prod
   ```

### Production Checklist

- [ ] Set strong JWT secrets
- [ ] Configure production database
- [ ] Set up Redis
- [ ] Configure CORS origins
- [ ] Set up SSL/TLS
- [ ] Configure rate limiting
- [ ] Set up monitoring (e.g., Sentry)
- [ ] Configure log aggregation
- [ ] Set up automated backups
- [ ] Configure CDN for static assets
- [ ] Review security headers

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## License

ISC
