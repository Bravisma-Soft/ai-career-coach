# AI Career Coach - Project Overview

**Last Updated:** October 24, 2025
**Version:** 1.0 MVP
**Status:** 🟢 Production (90% Complete)

## 📋 Table of Contents
- [Project Vision](#project-vision)
- [Current Status](#current-status)
- [Tech Stack](#tech-stack)
- [Key Features](#key-features)
- [Project Metrics](#project-metrics)
- [Roadmap](#roadmap)

---

## 🎯 Project Vision

AI Career Coach is an intelligent platform that helps job seekers navigate their career journey using AI-powered tools and guidance.

### Core Value Propositions
1. **AI-Powered Resume Optimization** - Tailor resumes to specific jobs
2. **Interview Preparation** - Practice with AI mock interviews
3. **Job Application Tracking** - Organize and track applications
4. **Career Guidance** - Get personalized career advice

---

## 📊 Current Status

### ✅ Completed Features (90%)

**Authentication & User Management**
- ✅ Email/password registration and login
- ✅ Google OAuth authentication
- ✅ JWT token-based auth with refresh tokens
- ✅ Password reset flow with email
- ✅ User profile management

**Resume Management**
- ✅ Resume upload (PDF/DOCX)
- ✅ AI-powered resume parsing
- ✅ Resume tailoring for specific jobs
- ✅ Background job processing (BullMQ)

**Job Tracking**
- ✅ Manual job entry
- ✅ Application status tracking
- ✅ Interview scheduling and notes
- ✅ Job detail scraping (Cheerio + Puppeteer)

**AI Features**
- ✅ Resume parser (Claude Sonnet 4.5)
- ✅ Resume tailoring agent
- ✅ Cover letter generation
- ✅ Mock interview agent
- ✅ Job parser agent

**Infrastructure**
- ✅ Production deployment (Railway + Vercel)
- ✅ PostgreSQL database
- ✅ Redis for job queues
- ✅ SendGrid email service
- ✅ AWS S3 for file storage

### 🚧 In Progress / Planned (10%)

**AI Agents (Phase 1 - High Priority)**
- ❌ Resume Analyzer - ATS scoring and analysis
- ❌ Interview Prep - Company research and questions
- ❌ Company Research - Culture and insights
- ❌ Job Analyzer - Job requirements analysis

**Performance & Polish**
- ❌ AI response streaming
- ❌ Response caching
- ❌ Error tracking (Sentry)

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **Styling:** TailwindCSS + shadcn/ui
- **State Management:** Zustand
- **Routing:** React Router v6
- **Forms:** React Hook Form + Zod
- **API Client:** Axios
- **Deployment:** Vercel

### Backend
- **Runtime:** Node.js + TypeScript
- **Framework:** Express.js
- **Database:** PostgreSQL + Prisma ORM
- **Cache/Queue:** Redis + BullMQ
- **Auth:** JWT + Passport.js (OAuth)
- **AI:** Anthropic Claude API (Sonnet 4.5)
- **Email:** SendGrid
- **File Storage:** AWS S3
- **Deployment:** Railway

### Development Tools
- **Monorepo:** Single repository for frontend + backend
- **Version Control:** Git + GitHub
- **Package Manager:** npm
- **Testing:** Jest + Supertest
- **Code Quality:** ESLint + Prettier
- **Type Safety:** TypeScript (strict mode)

---

## ✨ Key Features

### 1. Smart Resume Management
- Upload and parse resumes automatically
- AI extracts skills, experience, education
- Tailor resumes to specific job postings
- Track multiple resume versions

### 2. AI-Powered Job Application
- Generate custom cover letters
- Tailor resume for each application
- Track application status and follow-ups
- Store job details and requirements

### 3. Interview Preparation
- AI-generated mock interview questions
- Practice with conversational AI
- Receive feedback on answers
- Track interview performance

### 4. Application Tracking
- Centralized job application dashboard
- Status tracking (Applied, Interview, Offer, Rejected)
- Interview scheduling and reminders
- Notes and follow-up tracking

### 5. Secure Authentication
- Email/password with strong validation
- Google OAuth single sign-on
- JWT tokens with refresh rotation
- Session management

---

## 📈 Project Metrics

### Codebase Size
- **Backend:** 16,074 lines (TypeScript)
- **Frontend:** 17,603 lines (TypeScript/TSX)
- **Total:** 33,677 lines of code
- **Files:** 136 TypeScript files

### Database
- **Models:** 15 Prisma models
- **Tables:** 18 (including join tables)
- **Migrations:** 4 applied

### API
- **Endpoints:** 60+ REST API endpoints
- **Route Groups:** 11 (auth, users, resumes, jobs, etc.)

### AI Integration
- **Agents:** 5 implemented, 6 planned
- **Model:** Claude Sonnet 4.5
- **Average Cost:** $0.05-0.15 per AI operation

---

## 🗺️ Roadmap

### Phase 1: MVP Complete (Current - 90% Done)
**Target:** November 2025

- [x] Core authentication
- [x] Resume upload and parsing
- [x] Job tracking
- [x] Mock interviews
- [x] Production deployment
- [ ] Resume analyzer agent
- [ ] Interview prep agent
- [ ] Error tracking setup

### Phase 2: Enhanced AI (Q4 2025)
**Focus:** Complete AI agent suite

- [ ] Job matching recommendations
- [ ] Company research agent
- [ ] Interviewer research
- [ ] AI response streaming
- [ ] Cost optimization & caching

### Phase 3: Polish & Scale (Q1 2026)
**Focus:** Performance and user experience

- [ ] Real-time notifications
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Team collaboration features
- [ ] API rate limiting improvements

### Future Considerations
- LinkedIn integration
- Job board integrations (Indeed, LinkedIn Jobs)
- Career coaching marketplace
- Resume templates library
- Salary negotiation tools

---

## 🔗 Related Documentation

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture
- **[DEVELOPMENT.md](./DEVELOPMENT.md)** - Development setup
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Deployment guide
- **[Backend Docs](../backend/docs/README.md)** - Backend documentation
- **[Frontend Docs](../frontend/docs/README.md)** - Frontend documentation

---

**Last Updated:** October 24, 2025
**Maintained by:** Engineering Team
