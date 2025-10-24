# Frontend Documentation

**Last Updated:** October 24, 2025

## 📚 Available Documentation (3 files)

1. **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Vercel deployment guide
2. **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Contribution guidelines and standards
3. **[CHECKLIST.md](./CHECKLIST.md)** - Development checklist

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Set VITE_API_URL=http://localhost:3000/api

# Start development server
npm run dev
```

Frontend runs on: http://localhost:8080 (or 5173)

---

## 📁 Project Structure

```
src/
├── components/        # React components
│   ├── ui/            # shadcn/ui components
│   └── ...            # Feature components
├── pages/             # Page components (routes)
├── services/          # API services
├── store/             # Zustand state stores
├── hooks/             # Custom React hooks
├── lib/               # Utilities and helpers
├── types/             # TypeScript types
└── App.tsx            # Main app component
```

---

## 🎨 Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **shadcn/ui** - UI components
- **Zustand** - State management
- **React Router** - Routing
- **React Hook Form** - Forms
- **Axios** - HTTP client

---

## 🛠️ Available Scripts

```bash
npm run dev        # Start dev server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
npm run type-check # TypeScript type checking
```

---

## 🚀 Deployment

Deployed on Vercel. See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for complete guide.

**Build Command:** `npm run build`
**Output Directory:** `dist`
**Install Command:** `npm install`

---

## 🤝 Contributing

See **[CONTRIBUTING.md](./CONTRIBUTING.md)** for:
- Code style guidelines
- Component development standards
- PR process
- Testing requirements

---

## 📋 Development Workflow

See **[CHECKLIST.md](./CHECKLIST.md)** for:
- Feature development checklist
- UI/UX requirements
- Testing checklist
- Deployment steps

---

**Maintained by:** Frontend Team
**Total Files:** 3 documentation files
