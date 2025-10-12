# Quick Start Guide

## Prerequisites

Make sure you have installed:
- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- Redis (v6 or higher)

## Setup Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and set the following **required** variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/ai_career_coach"

# JWT Secrets (generate with: openssl rand -base64 32)
JWT_SECRET="your-32-character-secret-key-here"
JWT_REFRESH_SECRET="your-32-character-refresh-secret-here"

# Anthropic AI
ANTHROPIC_API_KEY="your-anthropic-api-key"

# Redis
REDIS_HOST="localhost"
REDIS_PORT="6379"
```

### 3. Generate JWT Secrets

Run this command to generate secure secrets:

```bash
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('base64'))"
node -e "console.log('JWT_REFRESH_SECRET=' + require('crypto').randomBytes(32).toString('base64'))"
```

Copy the output to your `.env` file.

### 4. Set Up Database

```bash
# Generate Prisma Client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate
```

### 5. Start Development Server

```bash
npm run dev
```

The server should start at `http://localhost:3000`

### 6. Verify Installation

Open your browser or use curl:

```bash
curl http://localhost:3000/health
```

You should see:

```json
{
  "success": true,
  "message": "AI Career Coach API is running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 1.234,
  "environment": "development"
}
```

## Next Steps

1. **Review the Prisma Schema**: Check `prisma/schema.prisma` to understand the database models
2. **Explore the API**: Check the routes in `src/api/routes/`
3. **Configure Additional Services**: Set up AWS S3, email, etc. if needed
4. **Build Features**: Start implementing your authentication and AI features!

## Common Issues

### Port Already in Use

If port 3000 is already in use, change it in `.env`:

```env
PORT=3001
```

### Database Connection Failed

Make sure PostgreSQL is running:

```bash
# macOS
brew services start postgresql

# Ubuntu
sudo systemctl start postgresql
```

### Redis Connection Failed

Make sure Redis is running:

```bash
# macOS
brew services start redis

# Ubuntu
sudo systemctl start redis
```

### Prisma Client Not Generated

If you see "Cannot find module '@prisma/client'", run:

```bash
npm run prisma:generate
```

## Development Tips

- **Hot Reload**: The dev server uses `ts-node-dev` for automatic restarts
- **Database GUI**: Run `npm run prisma:studio` to open Prisma Studio
- **Type Checking**: Run `npm run typecheck` to check for TypeScript errors
- **Code Formatting**: Run `npm run format` to format code with Prettier

## Building for Production

```bash
# Build the project
npm run build

# Run migrations
npm run prisma:migrate:prod

# Start production server
npm run start:prod
```

## Need Help?

- Check the main [README.md](./README.md) for detailed documentation
- Review the project structure in the README
- Check environment variables in `.env.example`
