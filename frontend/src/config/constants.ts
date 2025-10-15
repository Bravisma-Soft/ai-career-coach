/**
 * Application constants and configuration
 */

export const APP_CONFIG = {
  name: import.meta.env.VITE_APP_NAME || 'AI Career Coach',
  version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  environment: import.meta.env.VITE_ENVIRONMENT || 'development',
} as const;

export const FEATURES = {
  analytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  debug: import.meta.env.VITE_ENABLE_DEBUG === 'true',
} as const;

export const API_CONFIG = {
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
  retryDelay: 1000, // 1 second
} as const;

export const VALIDATION_RULES = {
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
    requireSpecialChar: true,
  },
  resume: {
    maxSizeBytes: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
  },
  profile: {
    maxNameLength: 100,
    maxBioLength: 500,
    maxSkills: 50,
  },
} as const;

export const ROUTES = {
  home: '/',
  login: '/login',
  register: '/register',
  dashboard: '/dashboard',
  resumes: '/resumes',
  jobs: '/jobs',
  interviews: '/interviews',
  profile: '/profile',
  settings: '/settings',
  styleGuide: '/style-guide',
} as const;

export const LOCAL_STORAGE_KEYS = {
  theme: 'app-theme',
  authToken: 'auth-token',
  userPreferences: 'user-preferences',
} as const;

export const TOAST_DURATION = {
  short: 2000,
  medium: 4000,
  long: 6000,
} as const;

export const JOB_STATUSES = [
  'INTERESTED',
  'APPLIED',
  'INTERVIEW_SCHEDULED',
  'INTERVIEW_COMPLETED',
  'OFFER_RECEIVED',
  'REJECTED',
  'ACCEPTED',
  'WITHDRAWN',
] as const;

export const INTERVIEW_TYPES = [
  'PHONE',
  'VIDEO',
  'ONSITE',
  'TECHNICAL',
  'BEHAVIORAL',
  'PANEL',
  'FINAL',
] as const;

export const WORK_MODES = [
  'REMOTE',
  'HYBRID',
  'ONSITE',
] as const;

export const JOB_TYPES = [
  'FULL_TIME',
  'PART_TIME',
  'CONTRACT',
  'INTERNSHIP',
  'TEMPORARY',
] as const;
