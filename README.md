# AI Career Coach

An AI-powered career transition platform that helps job seekers optimize their resumes, prepare for interviews, and track job applications efficiently.

## 🚀 Features

- **Resume Management**: Upload, edit, and create tailored versions of your resume
- **AI Resume Tailoring**: Automatically optimize resumes for specific job descriptions
- **Interview Preparation**: AI-generated interview questions and mock interview sessions
- **Job Application Tracking**: Kanban board to manage your job search pipeline
- **Profile Management**: Comprehensive career profile with experience, education, and skills
- **Mock Interviews**: Practice with AI interviewer and get detailed feedback

## 📋 Prerequisites

- Node.js 18+ or Bun
- Modern web browser (Chrome, Firefox, Safari, Edge)

## 🛠️ Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd ai-career-coach
```

2. **Install dependencies**
```bash
npm install
# or
bun install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=AI Career Coach
VITE_ENABLE_ANALYTICS=false
```

4. **Start development server**
```bash
npm run dev
# or
bun run dev
```

The application will be available at `http://localhost:8080`

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (buttons, cards, etc.)
│   ├── jobs/           # Job-related components
│   ├── interviews/     # Interview-related components
│   ├── resumes/        # Resume-related components
│   └── ai/             # AI-specific components
├── pages/              # Page components (routes)
├── hooks/              # Custom React hooks
├── services/           # API service layers
├── store/              # Zustand state management
├── types/              # TypeScript type definitions
├── lib/                # Utility functions
└── assets/             # Static assets (images, fonts)
```

## 📦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🎨 Tech Stack

### Core
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing

### UI & Styling
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icon library
- **Shadcn/ui** - Component library

### State Management & Data Fetching
- **Zustand** - Lightweight state management
- **React Query** - Server state management
- **Axios** - HTTP client

### Forms & Validation
- **React Hook Form** - Form handling
- **Zod** - Schema validation

### Additional Libraries
- **date-fns** - Date manipulation
- **@dnd-kit** - Drag and drop
- **react-pdf** - PDF viewing
- **sonner** - Toast notifications

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:3000/api` |
| `VITE_APP_NAME` | Application name | `AI Career Coach` |
| `VITE_ENABLE_ANALYTICS` | Enable analytics | `false` |

### Tailwind Configuration

The design system is defined in `src/index.css` with:
- Color tokens (primary, secondary, accent, muted, etc.)
- Gradients and shadows
- Animation utilities
- Dark mode support

## 🎯 State Management

The application uses **Zustand** for state management with the following stores:

- `authStore` - Authentication state and user data
- `jobsStore` - Job applications state
- `resumesStore` - Resume management state
- `interviewsStore` - Interview scheduling and mock sessions
- `profileStore` - User profile data
- `uiStore` - UI state (modals, drawers, etc.)

### Usage Example

```typescript
import { useAuthStore } from '@/store/authStore';

function Component() {
  const { user, isAuthenticated, login, logout } = useAuthStore();
  
  // Use state and actions
}
```

## 🌐 API Integration

### API Client

The app uses a configured Axios instance (`src/lib/api.ts`) with:
- Automatic token injection
- 401 error handling
- Response interceptors
- Request retry logic
- Request cancellation

### Service Layer

All API calls are abstracted in service modules:
- `authService` - Authentication
- `jobService` - Job management
- `resumeService` - Resume operations
- `interviewService` - Interview management
- `profileService` - Profile updates
- `aiService` - AI features

### Error Handling

All services implement:
- Try-catch error handling
- User-friendly error messages
- Toast notifications
- Retry logic for failed requests
- Request cancellation on unmount

## 🎨 Component Development

### Using UI Components

```typescript
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

function MyComponent() {
  return (
    <Card>
      <Button variant="hero" size="lg">
        Click me
      </Button>
    </Card>
  );
}
```

### Creating New Components

1. Use TypeScript for type safety
2. Follow the existing component structure
3. Use semantic HTML elements
4. Implement proper ARIA labels
5. Support keyboard navigation
6. Use design system tokens (no hard-coded colors)

## 📱 Responsive Design

The application is fully responsive with:
- Mobile-first approach
- Breakpoints: `sm`, `md`, `lg`, `xl`, `2xl`
- Mobile navigation with bottom tab bar
- Touch-friendly interactions (44px minimum touch targets)
- Collapsible/hamburger menu for authenticated users

## ♿ Accessibility

- Semantic HTML structure
- ARIA labels and roles
- Keyboard navigation support
- Focus indicators
- Sufficient color contrast (WCAG AA)
- Screen reader friendly
- Alt text for images

## 🚀 Deployment

### Building for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

### Deployment Platforms

The app can be deployed to:
- **Vercel** (recommended)
- **Netlify**
- **AWS Amplify**
- **GitHub Pages**
- Any static hosting service

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## 🔒 Security Considerations

- All API requests include authentication tokens
- Tokens stored securely in memory (Zustand)
- Automatic logout on 401 responses
- Input validation on all forms
- XSS protection through React
- HTTPS enforced in production

## 📊 Performance Optimization

- **Code Splitting**: Routes are lazy-loaded
- **Image Optimization**: Responsive images with proper sizing
- **Bundle Analysis**: Check bundle size with `npm run build`
- **Caching**: Proper cache headers configured
- **Compression**: Gzip/Brotli compression enabled
- **Tree Shaking**: Unused code eliminated in production

## 🐛 Debugging

- Source maps enabled in development
- React DevTools supported
- Console errors logged with context
- Network requests visible in browser DevTools

## 📚 Documentation

- [Contributing Guide](./CONTRIBUTING.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Production Checklist](./CHECKLIST.md)

## 🤝 Contributing

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with [Lovable](https://lovable.dev)
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Icons from [Lucide](https://lucide.dev)

## 📧 Support

For support, please open an issue in the repository or contact the development team.

---

**Test User Credentials** (Development Only):
- Email: `test@example.com`
- Password: `Password123!`

**Note**: This is a frontend application. Make sure your backend API is running and configured correctly before starting development.
