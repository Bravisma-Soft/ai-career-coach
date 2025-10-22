# AI Career Coach - Documentation Index

Welcome to the AI Career Coach documentation hub. This directory contains comprehensive technical documentation to help engineers understand and contribute to the project.

**Last Updated:** October 21, 2025
**Project Version:** 1.0 MVP
**Project Status:** 90% Complete (Production Deployed on Railway)

---

## 📚 Documentation Structure

```
.agent/
├── README.md              # This file - documentation index
├── System/                # System architecture & design (CURRENT & MAINTAINED)
│   ├── project_architecture.md  ✅ UPDATED Oct 21, 2025
│   ├── database_schema.md       ✅ Current
│   └── ai_agent_architecture.md ✅ Current
├── Tasks/                 # Feature PRDs & implementation plans (HISTORICAL)
│   └── implementation_plan.md   (Oct 2025 - historical reference)
├── SOP/                   # Standard operating procedures
│   └── (to be added)
├── project-context-*.md   # Development session snapshots (HISTORICAL)
├── project-status-*.md    # Old status files (DEPRECATED)
└── current_status.md      # DEPRECATED → Use /PROJECT_STATUS.md instead
```

---

## 🌟 Start Here

### For New Engineers
1. **[PROJECT_STATUS.md](/PROJECT_STATUS.md)** - Current project status, features, and next steps
2. **[project_architecture.md](./System/project_architecture.md)** - Complete system architecture
3. **[database_schema.md](./System/database_schema.md)** - Database design and relationships
4. **[ai_agent_architecture.md](./System/ai_agent_architecture.md)** - AI integration details

### For Quick Setup
1. **[Backend QUICKSTART](/backend/QUICKSTART.md)** - Backend setup in 5 minutes
2. **[Frontend README](/frontend/README.md)** - Frontend setup guide
3. **[PRODUCTION_DEPLOYMENT_GUIDE.md](/PRODUCTION_DEPLOYMENT_GUIDE.md)** - Deploy to production

---

## 📖 System Documentation (MAINTAINED)

These documents are actively maintained and reflect the current state of the system.

### [Project Architecture](./System/project_architecture.md) ✅
**Last Updated:** October 21, 2025

**Complete system architecture overview covering:**
- Project goals and overview (90% MVP complete)
- High-level architecture diagram
- Technology stack (Frontend: 127 TS files, Backend: 70 TS files)
- Project structure and file organization
- Core modules and functionalities
- Integration points (internal & external)
- Security architecture
- Performance optimization strategies
- Scalability considerations
- Monitoring and observability
- Deployment architecture (Railway production)
- Future enhancements roadmap
- Key technical decisions

**Key Highlights:**
- Monorepo structure (frontend + backend)
- React 18 + TypeScript + Vite + Zustand
- Express.js + Prisma + PostgreSQL + Redis
- Claude Sonnet 4.5 AI integration
- 6 AI agents (5 implemented, 1-6 pending)
- BullMQ background job processing
- Railway production deployment
- 15+ database models
- 11 API route groups
- 7 Zustand stores

**When to read:**
- New engineers joining the project
- Understanding system design
- Planning new features
- Architecture reviews
- Before making infrastructure changes

---

### [Database Schema](./System/database_schema.md) ✅
**Last Updated:** October 13, 2025

**Complete database design and entity relationships covering:**
- Entity Relationship Diagram
- All database enums (11 enums)
- Detailed table schemas (15 models)
  - User management (User, Session, UserProfile)
  - Career data (Experience, Education, Skill, Certification)
  - Resume management (Resume)
  - Job tracking (Job, StatusChange, Application, Interview)
  - AI features (MockInterview, Document)
  - Career coaching (CareerGoal, Assessment, Conversation, Message)
- Common query patterns
- Migration commands
- Data retention policies
- Performance considerations (indexes, cascading deletes)

**Database Models:**
- User & Authentication: 2 models
- User Profile & Career Data: 5 models
- Resume Management: 1 model
- Job Tracking: 2 models
- Application & Interview: 3 models
- AI & Documents: 2 models
- Career Coaching: 4 models (database ready, not implemented)

**When to read:**
- Implementing new features that touch database
- Database migrations
- Query optimization
- Understanding data relationships
- API development requiring data access

---

### [AI Agent Architecture](./System/ai_agent_architecture.md) ✅
**Last Updated:** October 13, 2025

**AI integration and agent-based design covering:**
- Claude AI integration overview
- ClaudeClientManager (singleton)
- BaseAgent abstract class
- Agent implementations:
  - ✅ ResumeParserAgent (temp: 0.3, tokens: 4096)
  - ✅ ResumeTailorAgent (temp: 0.5, tokens: 8000)
  - ✅ CoverLetterAgent (temp: 0.7, tokens: 2048)
  - ✅ MockInterviewAgent (temp: 0.7, tokens: 4096)
  - ✅ JobParserAgent (Cheerio + Puppeteer + Claude)
  - ❌ ResumeAnalyzerAgent (placeholder)
  - ❌ InterviewPrepAgent (placeholder)
  - ❌ JobMatchAgent (Phase 2)
  - ❌ CompanyResearchAgent (placeholder)
  - ❌ InterviewerResearchAgent (placeholder)
- Prompt engineering best practices
- Background job processing (BullMQ)
- Token usage and cost management
- Error handling and recovery (retry logic)
- Testing strategy

**Cost Tracking:**
- Resume parsing: ~3,000-5,000 tokens
- Resume tailoring: ~8,000-12,000 tokens
- Cover letter: ~4,000-6,000 tokens
- Mock interview questions: ~3,000-5,000 tokens
- Answer evaluation: ~2,000-4,000 tokens
- Session analysis: ~6,000-10,000 tokens

**When to read:**
- Implementing AI features
- Creating new agents
- Optimizing AI costs
- Debugging AI issues
- Understanding prompt design

---

## 📋 Tasks Documentation (HISTORICAL)

**Purpose**: Feature PRDs (Product Requirements Documents) and implementation plans.

### [Implementation Plan](./Tasks/implementation_plan.md)
**Status:** Historical reference (October 2025)
**Content:** Original MVP implementation plan with detailed task breakdown

**Note:** This document is kept for historical context. Current tasks and roadmap are in PROJECT_STATUS.md.

---

## 📖 Standard Operating Procedures (SOPs)

**Purpose**: Step-by-step guides for common development tasks.

### Planned SOPs (To Be Created)
- How to add a database migration
- How to create a new API endpoint
- How to implement a new AI agent
- How to add a new page route
- How to deploy to production
- How to run tests
- How to debug common issues

**When to add:**
- After establishing a new workflow
- When a task requires specific steps
- To prevent common mistakes
- For onboarding new developers

---

## 📂 Historical Context Files

### Development Session Snapshots
These files capture the state of the project at specific points in time:

- `project-context-old.md` - Early development context
- `project-context-10-14-2025.md` - Session snapshot (Oct 14)
- `project-context-10-15-2025.md` - Session snapshot (Oct 15)
- `project-context-10-16-2025.md` - Session snapshot (Oct 16)
- `project-context-10-17-2025.md` - Session snapshot (Oct 17)
- `project-context-10-19-2025.md` - Session snapshot (Oct 19)
- `project-status-10-20-2025.md` - Status snapshot (Oct 20)

**Purpose:** Historical reference for development decisions and context.

**When to use:** When you need to understand why a decision was made at a specific point in time.

---

## ⚠️ Deprecated Files

### `current_status.md` - DEPRECATED
**Status:** Outdated (last updated Oct 14, 2025)
**Replaced by:** `/PROJECT_STATUS.md` (updated Oct 21, 2025)

**Do not use this file.** All current status information is in the root PROJECT_STATUS.md.

---

## 🔍 Quick Reference

### Finding Specific Information

| What you need | Where to look |
|---------------|---------------|
| **Current project status** | [/PROJECT_STATUS.md](/PROJECT_STATUS.md) |
| **Overall system design** | [Project Architecture](./System/project_architecture.md) |
| **Database tables/fields** | [Database Schema](./System/database_schema.md) |
| **AI agent implementation** | [AI Agent Architecture](./System/ai_agent_architecture.md) |
| **Tech stack details** | [Project Architecture § 3](./System/project_architecture.md#3-technology-stack) |
| **API endpoints** | [Project Architecture § 4](./System/project_architecture.md#4-project-structure) |
| **Security features** | [Project Architecture § 7](./System/project_architecture.md#7-security-architecture) |
| **Database queries** | [Database Schema § Common Query Patterns](./System/database_schema.md#common-query-patterns) |
| **AI prompt design** | [AI Agent Architecture § Prompt Engineering](./System/ai_agent_architecture.md#prompt-engineering) |
| **Cost optimization** | [AI Agent Architecture § Cost Management](./System/ai_agent_architecture.md#token-usage--cost-management) |
| **Future features** | [Project Architecture § 12](./System/project_architecture.md#12-future-enhancements) |
| **Backend setup** | [/backend/QUICKSTART.md](/backend/QUICKSTART.md) |
| **Frontend setup** | [/frontend/README.md](/frontend/README.md) |
| **Deployment guide** | [/PRODUCTION_DEPLOYMENT_GUIDE.md](/PRODUCTION_DEPLOYMENT_GUIDE.md) |
| **API reference** | [/backend/docs/API_ENDPOINTS_SUMMARY.md](/backend/docs/API_ENDPOINTS_SUMMARY.md) |
| **Product requirements** | [/backend/career_coach_prd.md](/backend/career_coach_prd.md) |

---

## 🚀 Getting Started

### For New Engineers

**Recommended Reading Order:**

1. **[/PROJECT_STATUS.md](/PROJECT_STATUS.md)** - Understand current state (5 min read)
2. **[/backend/career_coach_prd.md](/backend/career_coach_prd.md)** - Understand product goals (10 min read)
3. **[Project Architecture](./System/project_architecture.md)** - Understand architecture (20 min read)
4. **[Backend QUICKSTART](/backend/QUICKSTART.md)** - Set up development environment (10 min setup)
5. **[Database Schema](./System/database_schema.md)** - Learn the data model (15 min read)
6. **[AI Agent Architecture](./System/ai_agent_architecture.md)** - Understand AI integration (15 min read)

**Total time to onboard:** ~1.5 hours

### For Feature Development

1. **Check existing docs** - Review system architecture and database schema
2. **Create a task doc** (optional) - Document PRD in Tasks/ folder for complex features
3. **Review architecture** - Ensure alignment with system design
4. **Implement feature** - Follow coding standards
5. **Update docs** - Keep documentation in sync with code changes

### For Bug Fixes

1. **Understand the context** - Check relevant system documentation
2. **Trace the code** - Use project structure to locate files
3. **Fix and test** - Implement the fix with tests
4. **Update docs if needed** - If bug revealed documentation gaps

---

## 📝 Documentation Guidelines

### When to Update Documentation

**Always update when:**
- ✅ Adding/changing database schema
- ✅ Adding new AI agents or features
- ✅ Changing architecture or tech stack
- ✅ Modifying API endpoints

**Recommended to update when:**
- Adding significant new features
- Changing business logic
- Updating deployment process

**Optional to update when:**
- Small bug fixes
- Minor UI changes
- Code refactoring without functional changes

### How to Update Documentation

1. Edit the relevant Markdown file in `.agent/System/`
2. Follow the existing structure and formatting
3. Update the "Last Updated" date at the bottom
4. Keep explanations clear and concise
5. Add diagrams where helpful (ASCII art is fine)
6. Include code examples for technical concepts
7. Update this README if adding new documentation files
8. Commit documentation changes with code changes

### Documentation Style Guide

- ✅ Use clear, simple language
- ✅ Include code examples
- ✅ Add links between related docs
- ✅ Keep it up-to-date
- ✅ Use consistent formatting
- ✅ Add timestamps to track freshness
- ✅ Use emojis sparingly for visual hierarchy
- ✅ Include "Related Docs" section at top of each doc

---

## 🔗 Related Resources

### External Documentation
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Anthropic Claude API](https://docs.anthropic.com/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [Zustand Documentation](https://docs.pmnd.rs/zustand/)
- [TailwindCSS](https://tailwindcss.com/docs)
- [BullMQ Documentation](https://docs.bullmq.io/)

### Project Files
- [/PROJECT_STATUS.md](/PROJECT_STATUS.md) - Current project status ⭐
- [/DOCUMENTATION_INDEX.md](/DOCUMENTATION_INDEX.md) - Complete documentation index
- [/backend/README.md](/backend/README.md) - Backend setup and development
- [/backend/QUICKSTART.md](/backend/QUICKSTART.md) - Quick backend setup ⭐
- [/frontend/README.md](/frontend/README.md) - Frontend setup and development
- [/README.md](/README.md) - Project overview
- [/docker-compose.yml](/docker-compose.yml) - Local infrastructure setup
- [/backend/.env.example](/backend/.env.example) - Environment variables template

---

## 🤝 Contributing to Documentation

We welcome documentation improvements!

### How to Contribute

1. **Identify gaps or outdated information**
2. **Create/update the relevant documentation**
3. **Submit a pull request with your changes**
4. **Ensure documentation follows the style guide**

### Documentation Standards

- ✅ Clear and concise
- ✅ Includes examples where appropriate
- ✅ Properly formatted Markdown
- ✅ Cross-referenced with related docs
- ✅ Includes diagrams where helpful
- ✅ Timestamped and versioned
- ✅ Tested for accuracy
- ✅ No broken links

---

## 📊 Documentation Status

| Document | Status | Last Updated | Completeness | Priority |
|----------|--------|--------------|--------------|----------|
| **System Documentation** |||||
| [Project Architecture](./System/project_architecture.md) | ✅ Current | 2025-10-21 | 100% | Critical |
| [Database Schema](./System/database_schema.md) | ✅ Current | 2025-10-13 | 100% | Critical |
| [AI Agent Architecture](./System/ai_agent_architecture.md) | ✅ Current | 2025-10-13 | 100% | Critical |
| **Tasks & Planning** |||||
| [Implementation Plan](./Tasks/implementation_plan.md) | 📜 Historical | 2025-10-13 | N/A | Reference |
| **SOPs** |||||
| Database Migrations SOP | 📝 Planned | - | 0% | Medium |
| New API Endpoint SOP | 📝 Planned | - | 0% | Medium |
| New AI Agent SOP | 📝 Planned | - | 0% | High |
| Deployment SOP | 📝 Planned | - | 0% | High |

**Legend:**
- ✅ Current - Fully documented and up-to-date
- 🔄 In Progress - Being actively developed
- 📝 Planned - Scheduled for future work
- 📜 Historical - Kept for reference, not actively maintained
- ⚠️ Outdated - Needs updating (flag for review)

---

## 💡 Tips for Using This Documentation

### For Code Reviews
- Reference specific sections in review comments
- Ensure PRs update relevant documentation
- Check if changes align with documented architecture
- Verify database changes update schema docs

### For Technical Discussions
- Use documentation as source of truth
- Reference architecture decisions
- Propose updates for new patterns
- Link to relevant docs in discussions

### For Onboarding
- Share documentation links with new team members
- Use as training materials
- Encourage reading before coding
- Pair documentation reading with code walkthrough

### For Planning
- Review architecture before designing features
- Check database schema before adding tables
- Consider AI cost implications in planning
- Verify security implications of new features

---

## 📞 Questions?

If you can't find what you're looking for:

1. **Check [/PROJECT_STATUS.md](/PROJECT_STATUS.md)** - Most current information
2. **Check [/DOCUMENTATION_INDEX.md](/DOCUMENTATION_INDEX.md)** - Complete documentation map
3. **Search the codebase** for examples
4. **Check git history** for context on changes
5. **Ask the team** on your communication channel
6. **Open an issue** if documentation is missing or unclear

---

## 🔄 Version History

- **v2.0.0** (2025-10-21) - Major update for production deployment
  - Updated project architecture with production deployment details
  - Marked historical context files clearly
  - Deprecated old status files
  - Updated quick reference with current file locations
  - Added documentation status table
  - Improved onboarding section

- **v1.0.0** (2025-10-13) - Initial documentation created
  - Project Architecture
  - Database Schema
  - AI Agent Architecture
  - Documentation index (this file)

---

## 📈 Project Metrics (as of Oct 21, 2025)

- **Backend Files:** 70 TypeScript files
- **Frontend Files:** 127 TypeScript files
- **Database Models:** 15 models (18 tables total with join tables)
- **AI Agents:** 5 implemented, 6 pending
- **API Routes:** 11 route groups
- **Completion:** 90% MVP Phase 1
- **Deployment:** Production on Railway
- **Next Milestone:** Complete remaining 6 AI agents

---

**Maintained by:** Engineering Team
**Last Updated:** October 21, 2025
**Documentation Version:** 2.0.0
**Project Version:** 1.0 MVP

---

**Remember:** Good documentation is living documentation. Keep it updated! 📚

**Quick Links:**
- 🏠 [Project Status](/PROJECT_STATUS.md)
- 🏗️ [Architecture](./System/project_architecture.md)
- 🗄️ [Database Schema](./System/database_schema.md)
- 🤖 [AI Agents](./System/ai_agent_architecture.md)
- 🚀 [Backend Setup](/backend/QUICKSTART.md)
- 🎨 [Frontend Setup](/frontend/README.md)
