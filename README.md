# AI Career Coach

> Intelligent career guidance platform powered by AI

[![Production](https://img.shields.io/badge/status-production-success)](https://ai-career-coach.vercel.app)
[![Backend](https://img.shields.io/badge/backend-Railway-purple)](https://railway.app)
[![Frontend](https://img.shields.io/badge/frontend-Vercel-black)](https://vercel.com)

---

## 🎯 What is AI Career Coach?

AI Career Coach is a comprehensive platform that helps job seekers navigate their career journey using AI-powered tools:

- **Smart Resume Management** - AI-powered parsing and tailoring
- **Job Application Tracking** - Organize and manage applications
- **Interview Preparation** - Practice with AI mock interviews
- **Cover Letter Generation** - Create customized cover letters
- **Career Guidance** - Get personalized AI recommendations

---

## 📚 Documentation

**Complete documentation is in the [`docs/`](./docs/) directory:**

### Quick Start
- 📖 **[Project Overview](./docs/OVERVIEW.md)** - Goals, features, status, roadmap
- 🚀 **[Development Setup](./docs/DEVELOPMENT.md)** - Get started in 15 minutes
- 🏗️ **[Architecture](./docs/ARCHITECTURE.md)** - System design and tech stack

### Development
- 💻 **[Backend Docs](./backend/docs/README.md)** - API, database, AI agents
- 🎨 **[Frontend Docs](./frontend/docs/README.md)** - Components, routing, state

### Deployment
- 🚀 **[Deployment Guide](./docs/DEPLOYMENT.md)** - Railway + Vercel deployment

---

## ⚡ Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Redis 6+

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npx prisma migrate dev
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# Set VITE_API_URL=http://localhost:3000/api
npm run dev
```

**See [DEVELOPMENT.md](./docs/DEVELOPMENT.md) for detailed setup instructions.**

---

## 🛠️ Tech Stack

### Frontend
- React 18 + TypeScript + Vite
- TailwindCSS + shadcn/ui
- Zustand + React Router + React Hook Form

### Backend
- Node.js + Express + TypeScript
- PostgreSQL + Prisma ORM
- Redis + BullMQ
- Claude AI (Anthropic)

### Infrastructure
- **Backend:** Railway
- **Frontend:** Vercel
- **Database:** Railway PostgreSQL
- **Cache/Queue:** Railway Redis
- **Email:** SendGrid
- **Storage:** AWS S3

---

## 📊 Project Status

**Version:** 1.0 MVP  
**Completion:** 90%  
**Status:** 🟢 Production

### ✅ Completed
- Authentication (email/password + Google OAuth)
- Resume upload, parsing, and tailoring
- Job tracking and application management
- Mock interviews with AI
- Cover letter generation
- Production deployment

### 🚧 In Progress
- Resume analyzer agent
- Interview prep agent
- Error tracking (Sentry)
- AI response streaming

**See [OVERVIEW.md](./docs/OVERVIEW.md) for complete status and roadmap.**

---

## 📁 Project Structure

```
ai-career-coach/
├── docs/                 # 📚 Complete documentation
│   ├── OVERVIEW.md       # Project overview
│   ├── ARCHITECTURE.md   # System architecture
│   ├── DEVELOPMENT.md    # Development guide
│   └── DEPLOYMENT.md     # Deployment guide
│
├── backend/              # 🔧 Backend (Node.js + Express)
│   ├── src/              # Source code
│   ├── docs/             # Backend docs
│   └── prisma/           # Database schema
│
├── frontend/             # 🎨 Frontend (React + TypeScript)
│   ├── src/              # Source code
│   └── docs/             # Frontend docs
│
└── README.md             # This file
```

---

## 🤝 Contributing

We welcome contributions! Please see:
- [Development Guide](./docs/DEVELOPMENT.md) - Setup and workflows
- [Frontend Contributing](./frontend/docs/CONTRIBUTING.md) - Frontend guidelines
- [Backend Docs](./backend/docs/README.md) - Backend development

---

## 📝 License

This project is private and proprietary.

---

## 🔗 Links

- **Documentation:** [docs/](./docs/)
- **Backend API:** http://localhost:3000 (dev)
- **Frontend:** http://localhost:8080 (dev)
- **Production:** https://ai-career-coach.vercel.app

---

## 📞 Support

For questions or issues:
1. Check the [documentation](./docs/)
2. Review existing issues
3. Contact the team

---

**Built with ❤️ by the AI Career Coach Team**
