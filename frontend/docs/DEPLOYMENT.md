# Deployment Guide

This guide covers deploying AI Career Coach to various platforms.

## 📋 Pre-Deployment Checklist

- [ ] All environment variables documented
- [ ] Build completes without errors
- [ ] All tests passing
- [ ] No console errors in production build
- [ ] API endpoints configured correctly
- [ ] Performance metrics acceptable
- [ ] Accessibility audit passed
- [ ] SEO meta tags configured
- [ ] Error tracking setup (if applicable)

## 🚀 Deployment Platforms

### Vercel (Recommended)

Vercel offers the best experience for React applications with automatic deployments.

#### 1. Install Vercel CLI

```bash
npm install -g vercel
```

#### 2. Login to Vercel

```bash
vercel login
```

#### 3. Deploy

```bash
vercel
```

#### 4. Configure Environment Variables

In the Vercel dashboard:
1. Go to Project Settings → Environment Variables
2. Add all variables from `.env.example`
3. Set them for Production, Preview, and Development

#### 5. Configure Build Settings

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install"
}
```

#### Vercel Configuration File

Create `vercel.json`:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### Netlify

#### 1. Install Netlify CLI

```bash
npm install -g netlify-cli
```

#### 2. Login

```bash
netlify login
```

#### 3. Initialize

```bash
netlify init
```

#### 4. Configure Build

Create `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

#### 5. Deploy

```bash
netlify deploy --prod
```

### AWS Amplify

#### 1. Install Amplify CLI

```bash
npm install -g @aws-amplify/cli
```

#### 2. Configure Amplify

```bash
amplify configure
```

#### 3. Initialize

```bash
amplify init
```

#### 4. Add Hosting

```bash
amplify add hosting
```

#### 5. Publish

```bash
amplify publish
```

#### Build Settings

In Amplify Console, set:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

### Docker

#### Dockerfile

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### nginx.conf

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Enable gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Cache static assets
    location /assets {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

#### Build and Run

```bash
# Build image
docker build -t ai-career-coach .

# Run container
docker run -p 8080:80 ai-career-coach
```

#### Docker Compose

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "8080:80"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
```

## 🔐 Environment Variables

### Production Variables

Set these in your deployment platform:

```env
# Required
VITE_API_URL=https://api.yourapp.com
VITE_APP_NAME=AI Career Coach

# Optional
VITE_ENABLE_ANALYTICS=true
VITE_SENTRY_DSN=your-sentry-dsn
VITE_GOOGLE_ANALYTICS_ID=GA-XXXXXXXXX
```

### Managing Secrets

**Never commit sensitive data to git!**

- Use environment variables for all secrets
- Use platform secret management (Vercel, Netlify, etc.)
- For local development, use `.env.local` (git-ignored)

## 🎯 Performance Optimization

### Build Optimization

1. **Analyze Bundle Size**
```bash
npm run build -- --mode analyze
```

2. **Enable Compression**
   - Gzip/Brotli compression on server
   - CDN caching for static assets

3. **Code Splitting**
   - Already implemented via lazy loading
   - Each route is a separate chunk

4. **Asset Optimization**
   - Images: Use WebP format
   - Fonts: Use WOFF2 format
   - Icons: SVG sprites

### Caching Strategy

```nginx
# Static assets - cache for 1 year
location /assets {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# Service worker
location /sw.js {
    expires off;
    add_header Cache-Control "no-cache, no-store, must-revalidate";
}

# HTML files
location ~* \.html$ {
    expires off;
    add_header Cache-Control "no-cache, no-store, must-revalidate";
}
```

## 📊 Monitoring

### Error Tracking

Add Sentry for error tracking:

```bash
npm install @sentry/react
```

```typescript
// src/main.tsx
import * as Sentry from '@sentry/react';

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.VITE_ENVIRONMENT,
    tracesSampleRate: 0.1,
  });
}
```

### Analytics

Add Google Analytics:

```html
<!-- index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA-XXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA-XXXXXXXXX');
</script>
```

## 🔍 Health Checks

Add health check endpoint for monitoring:

```typescript
// Public endpoint for health checks
export const healthCheck = {
  status: 'ok',
  version: import.meta.env.VITE_APP_VERSION,
  timestamp: new Date().toISOString(),
};
```

## 🔄 CI/CD

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
        env:
          VITE_API_URL: ${{ secrets.VITE_API_URL }}
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

## 🐛 Troubleshooting

### Build Fails

- Clear node_modules: `rm -rf node_modules && npm install`
- Clear cache: `npm cache clean --force`
- Check Node version: `node -v` (should be 18+)

### Routing Issues

- Ensure SPA fallback is configured
- Check server redirects to index.html

### Environment Variables Not Working

- Prefix all variables with `VITE_`
- Rebuild after changing env vars
- Check platform-specific env var settings

## 📝 Post-Deployment

1. **Verify Deployment**
   - Test all major user flows
   - Check console for errors
   - Verify API connections

2. **Performance Check**
   - Run Lighthouse audit
   - Check Core Web Vitals
   - Test on mobile devices

3. **Monitor**
   - Watch error tracking
   - Monitor analytics
   - Check server logs

---

For questions or issues, please open an issue on GitHub.
