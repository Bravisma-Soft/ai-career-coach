# Documentation Structure

**Last Updated:** October 24, 2025

## 📂 File Organization

```
ai-career-coach/
│
├── 📄 README.md                    # Project overview (start here!)
├── 📄 PROJECT_STATUS.md            # Current status & roadmap
│
├── 📁 docs/                        # ⭐ Main Documentation Hub
│   ├── README.md                   # Documentation index
│   ├── OVERVIEW.md                 # Project overview & features
│   ├── ARCHITECTURE.md             # System architecture (TBD)
│   ├── DEVELOPMENT.md              # Development setup (TBD)
│   ├── DEPLOYMENT.md               # Deployment guide (TBD)
│   └── TESTING.md                  # Testing guide (TBD)
│
├── 📁 backend/
│   ├── README.md                   # Backend overview
│   ├── QUICKSTART.md               # Quick backend setup
│   │
│   └── 📁 docs/                    # Backend Documentation
│       ├── README.md               # Backend docs index
│       ├── API.md                  # Complete API reference
│       ├── DATABASE.md             # Database schema & Prisma
│       ├── AUTHENTICATION.md       # Auth system & sessions
│       ├── AI_AGENTS.md            # AI integration & agents
│       ├── EMAIL.md                # Email service (SendGrid)
│       ├── GOOGLE_OAUTH_SETUP.md   # OAuth setup guide
│       ├── JWT_TOKEN_TROUBLESHOOTING.md  # JWT debugging
│       └── 📁 archive/             # Old/redundant docs
│
├── 📁 frontend/
│   ├── README.md                   # Frontend overview
│   │
│   └── 📁 docs/                    # Frontend Documentation
│       ├── README.md               # Frontend docs index
│       ├── SETUP.md                # Setup guide (TBD)
│       ├── DEPLOYMENT.md           # Vercel deployment
│       ├── CONTRIBUTING.md         # Contribution guidelines
│       └── CHECKLIST.md            # Development checklist
│
├── 📁 archive/                     # Archived Documentation
│   └── [11 old root-level .md files]
│
└── 📁 .agent/                      # Historical Context (keep as-is)
    ├── README.md
    ├── System/                     # Old system docs
    └── project-context-*.md        # Session snapshots
```

## 🎯 Quick Navigation

### I want to...

**Get started with the project**
→ [`README.md`](../README.md) → [`docs/OVERVIEW.md`](./OVERVIEW.md)

**Set up my development environment**
→ [`docs/DEVELOPMENT.md`](./DEVELOPMENT.md) → [`backend/QUICKSTART.md`](../backend/QUICKSTART.md)

**Understand the system architecture**
→ [`docs/ARCHITECTURE.md`](./ARCHITECTURE.md)

**Learn about the backend**
→ [`backend/docs/README.md`](../backend/docs/README.md)

**Learn about the frontend**
→ [`frontend/docs/README.md`](../frontend/docs/README.md)

**Deploy to production**
→ [`docs/DEPLOYMENT.md`](./DEPLOYMENT.md)

**Check project status**
→ [`PROJECT_STATUS.md`](../PROJECT_STATUS.md)

**Look up API endpoints**
→ [`backend/docs/API.md`](../backend/docs/API.md)

**Understand the database**
→ [`backend/docs/DATABASE.md`](../backend/docs/DATABASE.md)

**Set up OAuth**
→ [`backend/docs/GOOGLE_OAUTH_SETUP.md`](../backend/docs/GOOGLE_OAUTH_SETUP.md)

**Debug JWT tokens**
→ [`backend/docs/JWT_TOKEN_TROUBLESHOOTING.md`](../backend/docs/JWT_TOKEN_TROUBLESHOOTING.md)

**Contribute to frontend**
→ [`frontend/docs/CONTRIBUTING.md`](../frontend/docs/CONTRIBUTING.md)

## 📊 Documentation Statistics

### Before Reorganization
- **Total .md files:** 64+
- **Scattered locations:** Root, backend/, frontend/, .agent/, etc.
- **Redundancy:** High (multiple files covering same topics)
- **Organization:** Low (hard to find information)

### After Reorganization
- **Active .md files:** ~25
- **Organized structure:** docs/, backend/docs/, frontend/docs/
- **Redundancy:** Low (consolidated similar topics)
- **Organization:** High (clear hierarchy and indexing)
- **Archived files:** 21+ (moved to archive/)

## 🔄 Migration Summary

### Created
- ✅ `docs/` - Main documentation hub
- ✅ `docs/README.md` - Master documentation index
- ✅ `docs/OVERVIEW.md` - Project overview
- ✅ `docs/DOCS_STRUCTURE.md` - This file
- ✅ `backend/docs/README.md` - Backend docs index
- ✅ `frontend/docs/README.md` - Frontend docs index
- ✅ Updated root `README.md` with new structure

### Archived
- ✅ Moved 11 root-level .md files to `archive/`
- ✅ Moved 10 backend docs to `backend/docs/archive/`
- ✅ Kept `.agent/` folder for historical context

### Preserved
- ✅ `PROJECT_STATUS.md` (current status)
- ✅ `backend/QUICKSTART.md` (useful quick start)
- ✅ `backend/docs/GOOGLE_OAUTH_SETUP.md` (detailed guide)
- ✅ `backend/docs/JWT_TOKEN_TROUBLESHOOTING.md` (debugging guide)
- ✅ All essential backend/frontend docs

## 🛠️ Maintenance Guidelines

### When to Update Documentation

**Always update:**
- Database schema changes → `backend/docs/DATABASE.md`
- New API endpoints → `backend/docs/API.md`
- New features → `docs/OVERVIEW.md` + feature-specific doc
- Architecture changes → `docs/ARCHITECTURE.md`

**Recommended to update:**
- Major bug fixes → Relevant doc
- New dependencies → Setup docs
- Deployment process changes → `docs/DEPLOYMENT.md`

**Optional:**
- Minor UI tweaks
- Code refactoring (unless changing architecture)

### How to Update

1. Find the relevant .md file using this structure guide
2. Edit the file directly
3. Update "Last Updated" date
4. Keep it concise and clear
5. Commit with descriptive message

## 📝 TODO List

The following docs need to be created:
- [ ] `docs/ARCHITECTURE.md` - System architecture
- [ ] `docs/DEVELOPMENT.md` - Development setup
- [ ] `docs/DEPLOYMENT.md` - Deployment guide
- [ ] `docs/TESTING.md` - Testing guide
- [ ] `frontend/docs/SETUP.md` - Frontend setup

These can be created by consolidating existing content from:
- `.agent/System/project_architecture.md`
- Various setup and deployment guides in `archive/`
- Testing guides in `archive/`

---

**Questions?** Start with [`docs/README.md`](./README.md) or [`README.md`](../README.md)
