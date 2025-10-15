# AI Career Coach - Documentation Index

Welcome to the AI Career Coach documentation hub. This directory contains comprehensive technical documentation to help engineers understand and contribute to the project.

## 📚 Documentation Structure

```
.agent/
├── README.md              # This file - documentation index
├── System/                # System architecture & design
│   ├── project_architecture.md
│   ├── database_schema.md
│   └── ai_agent_architecture.md
├── Tasks/                 # Feature PRDs & implementation plans
│   └── (future task docs)
└── SOP/                   # Standard operating procedures
    └── (future SOPs)
```

---

## 🏗️ System Documentation

### [Project Architecture](./System/project_architecture.md)
**Complete system architecture overview**

Topics covered:
- Project goals and overview
- High-level architecture diagram
- Technology stack (frontend & backend)
- Project structure and file organization
- Core modules and functionalities
- Integration points (internal & external)
- Security architecture
- Performance optimization strategies
- Scalability considerations
- Monitoring and observability
- Deployment architecture
- Future enhancements roadmap
- Key technical decisions

**When to read**:
- New engineers joining the project
- Understanding system design
- Planning new features
- Architecture reviews

---

### [Database Schema](./System/database_schema.md)
**Complete database design and entity relationships**

Topics covered:
- Entity Relationship Diagram
- All database enums
- Detailed table schemas (18 tables)
  - User management (User, Session, UserProfile)
  - Career data (Experience, Education, Skill, Certification)
  - Resume management (Resume)
  - Job tracking (Job, StatusChange, Application, Interview)
  - AI features (MockInterview, Document)
  - Career coaching (CareerGoal, Assessment, Conversation, Message)
- Common query patterns
- Migration commands
- Data retention policies
- Performance considerations

**When to read**:
- Implementing new features
- Database migrations
- Query optimization
- Understanding data relationships
- API development

---

### [AI Agent Architecture](./System/ai_agent_architecture.md)
**AI integration and agent-based design**

Topics covered:
- Claude AI integration overview
- ClaudeClientManager (singleton)
- BaseAgent abstract class
- Agent implementations
  - ResumeParserAgent (implemented)
  - TailorResumeAgent (planned)
  - CoverLetterAgent (planned)
  - MockInterviewAgent (planned)
  - JobMatchAgent (planned)
- Prompt engineering best practices
- Background job processing
- Token usage and cost management
- Error handling and recovery
- Testing strategy
- Future enhancements

**When to read**:
- Implementing AI features
- Creating new agents
- Optimizing AI costs
- Debugging AI issues
- Understanding prompt design

---

## 📋 Tasks Documentation

**Purpose**: Feature PRDs (Product Requirements Documents) and implementation plans.

**Coming soon**:
- Feature specifications
- Implementation plans
- Technical requirements
- Acceptance criteria
- Testing plans

**When to add**:
- Before starting a new feature
- When documenting a complex task
- For tracking implementation progress

---

## 📖 Standard Operating Procedures (SOPs)

**Purpose**: Step-by-step guides for common development tasks.

**Planned SOPs**:
- How to add a database migration
- How to create a new API endpoint
- How to implement a new AI agent
- How to add a new page route
- How to deploy to production
- How to run tests
- How to debug common issues

**When to add**:
- After establishing a new workflow
- When a task requires specific steps
- To prevent common mistakes
- For onboarding new developers

---

## 🔍 Quick Reference

### Finding Specific Information

| What you need | Where to look |
|---------------|---------------|
| Overall system design | [Project Architecture](./System/project_architecture.md) |
| Database tables/fields | [Database Schema](./System/database_schema.md) |
| AI agent implementation | [AI Agent Architecture](./System/ai_agent_architecture.md) |
| Tech stack details | [Project Architecture § 3](./System/project_architecture.md#3-technology-stack) |
| API endpoints | [Project Architecture § 4](./System/project_architecture.md#4-project-structure) |
| Security features | [Project Architecture § 7](./System/project_architecture.md#7-security-architecture) |
| Database queries | [Database Schema § Common Query Patterns](./System/database_schema.md#common-query-patterns) |
| AI prompt design | [AI Agent Architecture § Prompt Engineering](./System/ai_agent_architecture.md#prompt-engineering) |
| Cost optimization | [AI Agent Architecture § Cost Management](./System/ai_agent_architecture.md#token-usage--cost-management) |
| Future features | [Project Architecture § 12](./System/project_architecture.md#12-future-enhancements) |

---

## 🚀 Getting Started

### For New Engineers

1. **Start here**: Read [Project Architecture](./System/project_architecture.md) for the big picture
2. **Understand data**: Review [Database Schema](./System/database_schema.md)
3. **Learn AI integration**: Study [AI Agent Architecture](./System/ai_agent_architecture.md)
4. **Set up environment**: Follow setup instructions in main README files
5. **Pick a task**: Check the issue tracker or Tasks/ folder

### For Feature Development

1. **Check existing docs**: See if similar features exist
2. **Create a task doc**: Document PRD in Tasks/ folder (optional but recommended for complex features)
3. **Review architecture**: Ensure alignment with system design
4. **Update docs**: Keep documentation in sync with code changes

### For Bug Fixes

1. **Understand the context**: Check relevant system documentation
2. **Trace the code**: Use project structure to locate files
3. **Fix and test**: Implement the fix with tests
4. **Update docs if needed**: If bug revealed documentation gaps

---

## 📝 Documentation Guidelines

### When to Update Documentation

- **Always**: When adding/changing database schema
- **Always**: When adding new AI agents or features
- **Always**: When changing architecture or tech stack
- **Recommended**: When adding significant new features
- **Optional**: For small bug fixes or minor changes

### How to Update Documentation

1. Edit the relevant Markdown file in `.agent/`
2. Follow the existing structure and formatting
3. Update the "Last Updated" date at the bottom
4. Keep explanations clear and concise
5. Add diagrams where helpful (ASCII art is fine)
6. Include code examples for technical concepts
7. Update this README if adding new documentation files

### Documentation Style Guide

- Use clear, simple language
- Include code examples
- Add links between related docs
- Keep it up-to-date
- Use consistent formatting
- Add timestamps to track freshness

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

### Project Files
- [Backend README](../backend/README.md) - Backend setup and development
- [Frontend README](../frontend/README.md) - Frontend setup and development
- [Root README](../README.md) - Project overview
- [Docker Compose](../docker-compose.yml) - Infrastructure setup
- [Backend .env.example](../backend/.env.example) - Environment variables

---

## 🤝 Contributing to Documentation

We welcome documentation improvements!

### How to Contribute

1. Identify gaps or outdated information
2. Create/update the relevant documentation
3. Submit a pull request with your changes
4. Ensure documentation follows the style guide

### Documentation Standards

- ✅ Clear and concise
- ✅ Includes examples
- ✅ Properly formatted Markdown
- ✅ Cross-referenced with related docs
- ✅ Includes diagrams where helpful
- ✅ Timestamped and versioned

---

## 📊 Documentation Status

| Document | Status | Last Updated | Completeness |
|----------|--------|--------------|--------------|
| Project Architecture | ✅ Complete | 2025-10-13 | 100% |
| Database Schema | ✅ Complete | 2025-10-13 | 100% |
| AI Agent Architecture | ✅ Complete | 2025-10-13 | 100% |
| Tasks (PRDs) | 🔄 In Progress | - | 0% |
| SOPs | 📝 Planned | - | 0% |

**Legend**:
- ✅ Complete - Fully documented and up-to-date
- 🔄 In Progress - Being actively developed
- 📝 Planned - Scheduled for future work
- ⚠️ Outdated - Needs updating

---

## 💡 Tips for Using This Documentation

### For Code Reviews
- Reference specific sections in review comments
- Ensure PRs update relevant documentation
- Check if changes align with documented architecture

### For Technical Discussions
- Use documentation as source of truth
- Reference architecture decisions
- Propose updates for new patterns

### For Onboarding
- Share documentation links with new team members
- Use as training materials
- Encourage reading before coding

### For Planning
- Review architecture before designing features
- Check database schema before adding tables
- Consider AI cost implications in planning

---

## 📞 Questions?

If you can't find what you're looking for:

1. **Check the main README files** in backend/ and frontend/
2. **Search the codebase** for examples
3. **Ask the team** on your communication channel
4. **Open an issue** if documentation is missing or unclear

---

## 🔄 Version History

- **v1.0.0** (2025-10-13) - Initial documentation created
  - Project Architecture
  - Database Schema
  - AI Agent Architecture
  - Documentation index (this file)

---

**Maintained by**: Engineering Team
**Last Updated**: 2025-10-13
**Documentation Version**: 1.0.0

---

**Remember**: Good documentation is living documentation. Keep it updated! 📚
