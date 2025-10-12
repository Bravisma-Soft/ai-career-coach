import { User } from '@prisma/client';

// DTO (Data Transfer Objects)
export interface RegisterDto {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  newPassword: string;
}

export interface RefreshTokenDto {
  refreshToken: string;
}

// JWT Payloads
export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export interface RefreshTokenPayload {
  userId: string;
  sessionId: string;
  tokenVersion?: number;
}

// Auth Response
export interface AuthResponse {
  success: true;
  user: UserResponse;
  tokens: TokenPair;
  message?: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds until access token expires
}

export interface UserResponse {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  status: string;
  emailVerified: boolean;
  createdAt: Date;
}

// Password Reset Token
export interface PasswordResetToken {
  userId: string;
  token: string;
  expiresAt: Date;
}

// Session Data
export interface SessionData {
  id: string;
  userId: string;
  userAgent?: string;
  ipAddress?: string;
  expiresAt: Date;
}

// Helper type to convert Prisma User to UserResponse
export type SafeUser = Omit<User, 'password' | 'passwordResetToken' | 'passwordResetExpires'>;

// Auth Service Response
export interface AuthServiceResponse {
  user: User;
  session: SessionData;
  tokens: TokenPair;
}
