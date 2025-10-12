export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export interface ErrorResponse {
  success: false;
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
  path?: string;
  stack?: string;
}

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

export interface JWTPayload {
  userId: string;
  email: string;
  role?: string;
}

export interface RefreshTokenPayload {
  userId: string;
  tokenVersion?: number;
}
