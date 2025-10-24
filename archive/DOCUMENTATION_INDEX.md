# AI Career Coach - Documentation Index

**Last Updated:** October 21, 2025

This document provides a comprehensive index of all documentation, guides, and status files in the AI Career Coach project.

---

## 📑 Table of Contents

1. [Project Overview](#project-overview)
2. [Getting Started](#getting-started)
3. [Architecture & Design](#architecture--design)
4. [Backend Documentation](#backend-documentation)
5. [Frontend Documentation](#frontend-documentation)
6. [AI Agents](#ai-agents)
7. [Deployment](#deployment)
8. [Testing](#testing)
9. [Archived/Legacy Docs](#archivedlegacy-docs)

---

## 📋 Project Overview

### Primary Status Document
- **[PROJECT_STATUS.md](./PROJECT_STATUS.md)** 🌟 **START HERE**
  - Complete project status (last updated: Oct 21, 2025)
  - Feature completion overview
  - Tech stack and architecture
  - Next steps and roadmap
  - **Use this as the single source of truth for project status**

### Product Requirements
- **[backend/career_coach_prd.md](./backend/career_coach_prd.md)**
  - Complete product requirements document
  - Feature specifications for MVP, Phase 2, Phase 3
  - User personas and success metrics
  - Product roadmap

### Project Documentation
- **[README.md](./README.md)**
  - Project overview and description
  - Quick start guide

---

## 🚀 Getting Started

### Backend Quickstart
- **[backend/QUICKSTART.md](./backend/QUICKSTART.md)**
  - Step-by-step setup instructions
  - Environment setup
  - Running the backend server
  - **Best starting point for new developers**

- **[backend/README.md](./backend/README.md)**
  - Backend overview
  - Tech stack details
  - Project structure

### Frontend Quickstart
- **[frontend/README.md](./frontend/README.md)**
  - Frontend setup and configuration
  - Development server instructions
  - Build and deployment

---

## 🏛️ Architecture & Design

### System Architecture
- **[backend/career_coach_architecture.md](./backend/career_coach_architecture.md)**
  - Current architecture document
  - System design and component interactions
  - Data flow diagrams

- **[career_coach_architecture_original.md](./career_coach_architecture_original.md)**
  - Original architecture design (legacy reference)

### Database
- **[backend/prisma/SCHEMA_DIAGRAM.md](./backend/prisma/SCHEMA_DIAGRAM.md)**
  - Database schema visualization
  - Entity relationships
  - Table descriptions

- **[backend/prisma/README.md](./backend/prisma/README.md)**
  - Prisma setup and usage
  - Migration guide

- **[backend/PRISMA_SETUP.md](./backend/PRISMA_SETUP.md)**
  - Detailed Prisma configuration
  - Schema setup instructions

---

## 🔧 Backend Documentation

### Core Systems

#### Authentication
- **[backend/docs/AUTH_SYSTEM.md](./backend/docs/AUTH_SYSTEM.md)**
  - Complete authentication system documentation
  - JWT implementation details
  - Security considerations

- **[backend/docs/AUTH_QUICK_START.md](./backend/docs/AUTH_QUICK_START.md)**
  - Quick reference for authentication setup
  - Common authentication patterns

#### User Profile & Resume
- **[backend/docs/USER_PROFILE_RESUME.md](./backend/docs/USER_PROFILE_RESUME.md)**
  - User profile management
  - Resume handling and storage
  - Profile-resume relationships

- **[backend/docs/RESUME_PARSER.md](./backend/docs/RESUME_PARSER.md)**
  - Resume parsing implementation
  - PDF/DOCX extraction logic
  - Structured data format

- **[backend/RESUME_PARSER_DEPENDENCIES.md](./backend/RESUME_PARSER_DEPENDENCIES.md)**
  - Dependencies for resume parsing
  - Library versions and setup

#### Job Tracking
- **[backend/docs/JOB_TRACKING_APPLICATION_MANAGEMENT.md](./backend/docs/JOB_TRACKING_APPLICATION_MANAGEMENT.md)**
  - Job tracking system overview
  - Application management features
  - Status workflow

- **[backend/docs/JOB_TRACKING_SETUP_SUMMARY.md](./backend/docs/JOB_TRACKING_SETUP_SUMMARY.md)**
  - Quick setup for job tracking
  - Configuration guide

#### API Reference
- **[backend/docs/API_ENDPOINTS_SUMMARY.md](./backend/docs/API_ENDPOINTS_SUMMARY.md)**
  - Complete API endpoint reference
  - Request/response examples
  - Authentication requirements

### Setup Guides
- **[backend/SETUP_SUMMARY.md](./backend/SETUP_SUMMARY.md)**
  - General setup summary
  - Configuration checklist

---

## 🤖 AI Agents

### AI Agent Documentation
- **[backend/docs/AI_AGENTS_FOUNDATION.md](./backend/docs/AI_AGENTS_FOUNDATION.md)**
  - AI agent architecture
  - Base agent class design
  - Agent patterns and best practices

- **[backend/docs/AI_AGENTS_SETUP_SUMMARY.md](./backend/docs/AI_AGENTS_SETUP_SUMMARY.md)**
  - AI agent setup guide
  - Claude API configuration
  - Agent initialization

- **[backend/docs/AI_AGENTS_QUICK_START.md](./backend/docs/AI_AGENTS_QUICK_START.md)**
  - Quick reference for using AI agents
  - Common agent patterns
  - Example implementations

### Feature Implementations
- **[RESUME_TAILORING_IMPLEMENTATION.md](./RESUME_TAILORING_IMPLEMENTATION.md)**
  - Complete resume tailoring feature documentation
  - AI agent implementation details
  - Frontend-backend integration

---

## 🎨 Frontend Documentation

- **[frontend/README.md](./frontend/README.md)**
  - Frontend overview
  - Component structure
  - State management with Zustand

- **[frontend/CONTRIBUTING.md](./frontend/CONTRIBUTING.md)**
  - Contributing guidelines for frontend
  - Code style and conventions
  - Pull request process

- **[frontend/CHECKLIST.md](./frontend/CHECKLIST.md)**
  - Frontend development checklist
  - Feature completion tracking

- **[frontend/DEPLOYMENT.md](./frontend/DEPLOYMENT.md)**
  - Frontend deployment guide
  - Vercel configuration
  - Environment variables

---

## 🚢 Deployment

### Production Deployment
- **[PRODUCTION_DEPLOYMENT_GUIDE.md](./PRODUCTION_DEPLOYMENT_GUIDE.md)** 🌟
  - Complete 12-step deployment walkthrough
  - Railway setup instructions
  - PostgreSQL and Redis configuration
  - Environment variable setup
  - **Use this for production deployments**

- **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)**
  - Deployment progress tracker
  - Pre-deployment checklist
  - Post-deployment verification

---

## 🧪 Testing

### Testing Guides
- **[backend/TESTING_GUIDE.md](./backend/TESTING_GUIDE.md)**
  - Backend testing strategy
  - Unit and integration tests
  - Test structure and conventions

- **[backend/tests/README.md](./backend/tests/README.md)**
  - Test suite overview
  - Running tests
  - Test coverage

- **[TESTING_GUIDE.md](./TESTING_GUIDE.md)**
  - General testing guide
  - End-to-end testing

- **[HOW_TO_TEST.md](./HOW_TO_TEST.md)**
  - Quick testing reference
  - Common test scenarios

- **[TEST_RUNNER.md](./TEST_RUNNER.md)**
  - Test runner configuration
  - CI/CD integration

### Test Reports & Analysis
- **[FIXES_AND_TESTING.md](./FIXES_AND_TESTING.md)**
  - Bug fixes and testing notes
  - Known issues and resolutions

- **[backend/TEST_SUMMARY.md](./backend/TEST_SUMMARY.md)**
  - Test execution summary
  - Coverage reports

- **[backend/TEST_FAILURES_ANALYSIS.md](./backend/TEST_FAILURES_ANALYSIS.md)**
  - Analysis of test failures
  - Root cause investigations

- **[backend/TEST_FAILURE_ROOT_CAUSE_ANALYSIS.md](./backend/TEST_FAILURE_ROOT_CAUSE_ANALYSIS.md)**
  - Detailed root cause analysis
  - Resolution strategies

- **[backend/test-reports/](./backend/test-reports/)**
  - Historical test reports
  - AI agent test results

---

## 📦 Archived/Legacy Docs

### Agent Context Files (`.agent/`)
These files were used during development sessions and are kept for historical reference:

- **[.agent/current_status.md](./.agent/current_status.md)**
  - Legacy status file (superseded by PROJECT_STATUS.md)

- **[.agent/project-context-*.md](./.agent/project-context-*.md)**
  - Development session snapshots from October 2025
  - Historical context for development decisions

- **[.agent/README.md](./.agent/README.md)**
  - Agent directory documentation

- **[.agent/System/](./.agent/System/)**
  - `ai_agent_architecture.md` - Legacy AI architecture
  - `database_schema.md` - Legacy schema docs
  - `project_architecture.md` - Legacy project structure

- **[.agent/Tasks/](./.agent/Tasks/)**
  - `implementation_plan.md` - Historical implementation planning

### Claude Commands (`.claude/`)
- **[.claude/commands/git-submit.md](./.claude/commands/git-submit.md)**
  - Git commit automation command

- **[.claude/commands/update_doc.md](./.claude/commands/update_doc.md)**
  - Documentation update command

### Legacy Architecture
- **[career_coach_architecture_original.md](./career_coach_architecture_original.md)**
  - Original architecture design (reference only)

### Old Status Files
- **[backend/CURRENT_STATUS.md](./backend/CURRENT_STATUS.md)** ⚠️ DEPRECATED
  - **Do not use** - replaced by PROJECT_STATUS.md
  - Contains outdated information (last updated Jan 19, 2025)

---

## 📁 Documentation File Locations

```
ai-career-coach/
├── PROJECT_STATUS.md              ⭐ MAIN STATUS FILE
├── DOCUMENTATION_INDEX.md         ⭐ THIS FILE
├── README.md                      Project overview
├── PRODUCTION_DEPLOYMENT_GUIDE.md Production deployment
├── DEPLOYMENT_CHECKLIST.md        Deployment tracking
├── RESUME_TAILORING_IMPLEMENTATION.md Feature docs
│
├── backend/
│   ├── QUICKSTART.md              ⭐ Backend setup
│   ├── README.md                  Backend overview
│   ├── career_coach_prd.md        Product requirements
│   ├── career_coach_architecture.md System architecture
│   ├── PRISMA_SETUP.md            Database setup
│   ├── TESTING_GUIDE.md           Testing guide
│   │
│   ├── docs/                      Detailed documentation
│   │   ├── AI_AGENTS_FOUNDATION.md
│   │   ├── AI_AGENTS_QUICK_START.md
│   │   ├── AI_AGENTS_SETUP_SUMMARY.md
│   │   ├── API_ENDPOINTS_SUMMARY.md
│   │   ├── AUTH_SYSTEM.md
│   │   ├── AUTH_QUICK_START.md
│   │   ├── USER_PROFILE_RESUME.md
│   │   ├── RESUME_PARSER.md
│   │   ├── JOB_TRACKING_APPLICATION_MANAGEMENT.md
│   │   └── JOB_TRACKING_SETUP_SUMMARY.md
│   │
│   └── prisma/
│       ├── README.md              Prisma usage
│       └── SCHEMA_DIAGRAM.md      Database schema
│
├── frontend/
│   ├── README.md                  Frontend overview
│   ├── CONTRIBUTING.md            Contribution guide
│   ├── CHECKLIST.md               Feature tracking
│   └── DEPLOYMENT.md              Frontend deployment
│
├── .agent/                        ⚠️ Legacy/Historical
│   ├── current_status.md          (superseded)
│   ├── project-context-*.md       (session snapshots)
│   └── System/                    (old architecture docs)
│
└── .claude/                       Claude commands
    └── commands/
        ├── git-submit.md
        └── update_doc.md
```

---

## 🔄 Documentation Update Policy

### When to Update Documentation

1. **PROJECT_STATUS.md** - Update after:
   - Completing a major feature
   - Changing tech stack or architecture
   - Deploying to production
   - Monthly status review

2. **Feature-Specific Docs** - Update when:
   - Implementing new features
   - Changing API endpoints
   - Modifying database schema
   - Adding new AI agents

3. **Deployment Docs** - Update when:
   - Changing deployment process
   - Adding new environment variables
   - Updating infrastructure

### Deprecation Process

When deprecating documentation:
1. Add ⚠️ DEPRECATED notice at the top
2. Link to replacement document
3. Move to `docs/archived/` if needed
4. Update this index

---

## 📞 Quick Reference

| Need | Go To |
|------|-------|
| **Project status** | [PROJECT_STATUS.md](./PROJECT_STATUS.md) |
| **Setup backend** | [backend/QUICKSTART.md](./backend/QUICKSTART.md) |
| **API reference** | [backend/docs/API_ENDPOINTS_SUMMARY.md](./backend/docs/API_ENDPOINTS_SUMMARY.md) |
| **Deploy to production** | [PRODUCTION_DEPLOYMENT_GUIDE.md](./PRODUCTION_DEPLOYMENT_GUIDE.md) |
| **AI agents** | [backend/docs/AI_AGENTS_FOUNDATION.md](./backend/docs/AI_AGENTS_FOUNDATION.md) |
| **Database schema** | [backend/prisma/SCHEMA_DIAGRAM.md](./backend/prisma/SCHEMA_DIAGRAM.md) |
| **Test the app** | [backend/TESTING_GUIDE.md](./backend/TESTING_GUIDE.md) |
| **Product requirements** | [backend/career_coach_prd.md](./backend/career_coach_prd.md) |

---

## 🎯 For New Team Members

**Recommended Reading Order:**

1. [PROJECT_STATUS.md](./PROJECT_STATUS.md) - Understand current state
2. [backend/career_coach_prd.md](./backend/career_coach_prd.md) - Understand product goals
3. [backend/QUICKSTART.md](./backend/QUICKSTART.md) - Set up development environment
4. [backend/career_coach_architecture.md](./backend/career_coach_architecture.md) - Understand architecture
5. [backend/docs/API_ENDPOINTS_SUMMARY.md](./backend/docs/API_ENDPOINTS_SUMMARY.md) - Learn the API
6. [backend/docs/AI_AGENTS_FOUNDATION.md](./backend/docs/AI_AGENTS_FOUNDATION.md) - Understand AI integration

---

**Last Reviewed:** October 21, 2025
**Maintained By:** Development Team
