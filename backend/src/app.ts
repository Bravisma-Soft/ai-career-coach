import express, { Application, Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import compression from 'compression';
import path from 'path';
import { env } from '@/config/env';
import { logger, morganStream } from '@/config/logger';
import { errorHandler, notFoundHandler } from '@/api/middleware/errorHandler';
import { generalLimiter } from '@/api/middleware/rateLimiter';

const app: Application = express();

// =================================
// TRUST PROXY (for Railway, Heroku, etc.)
// =================================
// Railway uses a reverse proxy, so we need to trust it
// This allows express-rate-limit and other middleware to see real client IPs
app.set('trust proxy', 1); // Trust first proxy

// =================================
// STATIC FILE SERVING (for local uploads)
// =================================
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// =================================
// SECURITY MIDDLEWARE
// =================================
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// =================================
// CORS CONFIGURATION
// =================================
const corsOrigins = env.CORS_ORIGIN.split(',').map(origin => origin.trim());

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }

    if (corsOrigins.indexOf(origin) !== -1 || corsOrigins.includes('*')) {
      callback(null, true);
    } else {
      logger.warn(`CORS blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: env.CORS_CREDENTIALS,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  maxAge: 86400, // 24 hours
}));

// =================================
// REQUEST PARSING MIDDLEWARE
// =================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// =================================
// COMPRESSION MIDDLEWARE
// =================================
app.use(compression());

// =================================
// PASSPORT INITIALIZATION (OAuth)
// =================================
import passport from '@/config/passport';
import { configurePassport } from '@/config/passport';

// Initialize Passport.js strategies
configurePassport();
app.use(passport.initialize());

// =================================
// LOGGING MIDDLEWARE
// =================================
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev', { stream: morganStream }));
} else {
  app.use(morgan('combined', { stream: morganStream }));
}

// =================================
// RATE LIMITING
// =================================
app.use('/api/', generalLimiter);

// =================================
// HEALTH CHECK ENDPOINT
// =================================
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'AI Career Coach API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: env.NODE_ENV,
  });
});

// =================================
// API VERSION ENDPOINT
// =================================
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to AI Career Coach API',
    version: env.API_VERSION,
    documentation: '/api/docs',
  });
});

// =================================
// API ROUTES
// =================================
import healthRoutes from '@/api/routes/health.routes';
import authRoutes from '@/api/routes/auth.routes';
import userRoutes from '@/api/routes/user.routes';
import resumeRoutes from '@/api/routes/resume.routes';
import jobRoutes from '@/api/routes/job.routes';
import applicationRoutes from '@/api/routes/application.routes';
import interviewRoutes from '@/api/routes/interview.routes';
import mockInterviewRoutes from '@/api/routes/mock-interview.routes';
import aiRoutes from '@/api/routes/ai.routes';
import documentRoutes from '@/api/routes/document.routes';

// Mount routes - Updated to /api/* to match frontend expectations
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/profile', userRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/mock-interviews', mockInterviewRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/documents', documentRoutes);

// =================================
// ERROR HANDLING
// =================================
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
