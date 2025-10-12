import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '@/database/client';
import { env } from '@/config/env';
import { logger } from '@/config/logger';
import {
  RegisterDto,
  LoginDto,
  AuthServiceResponse,
  JWTPayload,
  RefreshTokenPayload,
  TokenPair,
  UserResponse,
} from '@/types/auth.types';
import {
  UnauthorizedError,
  ConflictError,
  NotFoundError,
  BadRequestError,
} from '@/utils/ApiError';
import { User } from '@prisma/client';

export class AuthService {
  /**
   * Hash a password using bcrypt
   */
  async hashPassword(password: string): Promise<string> {
    const rounds = env.BCRYPT_ROUNDS;
    return bcrypt.hash(password, rounds);
  }

  /**
   * Compare plain password with hashed password
   * Uses timing-safe comparison to prevent timing attacks
   */
  async comparePasswords(
    plainPassword: string,
    hashedPassword: string
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Generate JWT access and refresh tokens
   */
  async generateTokens(
    userId: string,
    email: string,
    role: string,
    sessionId: string
  ): Promise<TokenPair> {
    // Access Token Payload
    const accessPayload: JWTPayload = {
      userId,
      email,
      role,
    };

    // Refresh Token Payload
    const refreshPayload: RefreshTokenPayload = {
      userId,
      sessionId,
    };

    // Generate Access Token (short-lived)
    const accessToken = jwt.sign(accessPayload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    });

    // Generate Refresh Token (long-lived)
    const refreshToken = jwt.sign(refreshPayload, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN,
    });

    // Calculate expiry time in seconds
    const expiresIn = this.parseExpiryToSeconds(env.JWT_EXPIRES_IN);

    logger.info(`Generated tokens for user: ${userId}`);

    return {
      accessToken,
      refreshToken,
      expiresIn,
    };
  }

  /**
   * Parse expiry string (e.g., "15m", "7d") to seconds
   */
  private parseExpiryToSeconds(expiry: string): number {
    const match = expiry.match(/^(\d+)([smhd])$/);
    if (!match) return 900; // Default 15 minutes

    const value = parseInt(match[1] || '15', 10);
    const unit = match[2];

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 3600;
      case 'd':
        return value * 86400;
      default:
        return 900;
    }
  }

  /**
   * Verify JWT access token
   */
  verifyAccessToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, env.JWT_SECRET) as JWTPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError('Access token expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedError('Invalid access token');
      }
      throw new UnauthorizedError('Token verification failed');
    }
  }

  /**
   * Verify JWT refresh token
   */
  verifyRefreshToken(token: string): RefreshTokenPayload {
    try {
      return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError('Refresh token expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedError('Invalid refresh token');
      }
      throw new UnauthorizedError('Token verification failed');
    }
  }

  /**
   * Register a new user
   */
  async registerUser(
    data: RegisterDto,
    userAgent?: string,
    ipAddress?: string
  ): Promise<AuthServiceResponse> {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      logger.warn(`Registration attempt with existing email: ${data.email}`);
      throw new ConflictError('Email already registered');
    }

    // Hash password
    const hashedPassword = await this.hashPassword(data.password);

    // Create user and session in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          firstName: data.firstName,
          lastName: data.lastName,
          emailVerified: false, // Email verification can be added later
        },
      });

      // Calculate session expiry
      const expiresAt = new Date();
      expiresAt.setDate(
        expiresAt.getDate() + this.parseExpiryToSeconds(env.JWT_REFRESH_EXPIRES_IN) / 86400
      );

      // Create session
      const session = await tx.session.create({
        data: {
          userId: user.id,
          refreshToken: '', // Will be updated after token generation
          userAgent,
          ipAddress,
          expiresAt,
        },
      });

      return { user, session };
    });

    // Generate tokens
    const tokens = await this.generateTokens(
      result.user.id,
      result.user.email,
      result.user.role,
      result.session.id
    );

    // Update session with refresh token
    await prisma.session.update({
      where: { id: result.session.id },
      data: { refreshToken: tokens.refreshToken },
    });

    logger.info(`User registered successfully: ${result.user.email}`);

    return {
      user: result.user,
      session: {
        id: result.session.id,
        userId: result.user.id,
        userAgent,
        ipAddress,
        expiresAt: result.session.expiresAt,
      },
      tokens,
    };
  }

  /**
   * Login user
   */
  async loginUser(
    data: LoginDto,
    userAgent?: string,
    ipAddress?: string
  ): Promise<AuthServiceResponse> {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      logger.warn(`Login attempt with non-existent email: ${data.email}`);
      // Use generic message to prevent email enumeration
      throw new UnauthorizedError('Invalid credentials');
    }

    // Check if user is active
    if (user.status !== 'ACTIVE') {
      logger.warn(`Login attempt with inactive account: ${data.email}`);
      throw new UnauthorizedError('Account is not active');
    }

    // Verify password
    const isPasswordValid = await this.comparePasswords(
      data.password,
      user.password
    );

    if (!isPasswordValid) {
      logger.warn(`Failed login attempt for user: ${data.email}`);
      throw new UnauthorizedError('Invalid credentials');
    }

    // Calculate session expiry
    const expiresAt = new Date();
    expiresAt.setDate(
      expiresAt.getDate() + this.parseExpiryToSeconds(env.JWT_REFRESH_EXPIRES_IN) / 86400
    );

    // Create new session
    const session = await prisma.session.create({
      data: {
        userId: user.id,
        refreshToken: '', // Will be updated after token generation
        userAgent,
        ipAddress,
        expiresAt,
      },
    });

    // Generate tokens
    const tokens = await this.generateTokens(
      user.id,
      user.email,
      user.role,
      session.id
    );

    // Update session with refresh token
    await prisma.session.update({
      where: { id: session.id },
      data: { refreshToken: tokens.refreshToken },
    });

    // Update last login timestamp
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    logger.info(`User logged in successfully: ${user.email}`);

    return {
      user,
      session: {
        id: session.id,
        userId: user.id,
        userAgent,
        ipAddress,
        expiresAt: session.expiresAt,
      },
      tokens,
    };
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(
    refreshToken: string
  ): Promise<TokenPair> {
    // Verify refresh token
    const payload = this.verifyRefreshToken(refreshToken);

    // Find session
    const session = await prisma.session.findUnique({
      where: { id: payload.sessionId },
      include: { user: true },
    });

    if (!session) {
      throw new UnauthorizedError('Invalid session');
    }

    // Verify refresh token matches
    if (session.refreshToken !== refreshToken) {
      logger.warn(`Refresh token mismatch for session: ${session.id}`);
      throw new UnauthorizedError('Invalid refresh token');
    }

    // Check if session expired
    if (session.expiresAt < new Date()) {
      logger.warn(`Expired session used: ${session.id}`);
      await prisma.session.delete({ where: { id: session.id } });
      throw new UnauthorizedError('Session expired');
    }

    // Check if user is active
    if (session.user.status !== 'ACTIVE') {
      throw new UnauthorizedError('Account is not active');
    }

    // Generate new tokens
    const newTokens = await this.generateTokens(
      session.user.id,
      session.user.email,
      session.user.role,
      session.id
    );

    // Update session with new refresh token
    await prisma.session.update({
      where: { id: session.id },
      data: { refreshToken: newTokens.refreshToken },
    });

    logger.info(`Tokens refreshed for user: ${session.user.email}`);

    return newTokens;
  }

  /**
   * Logout user (invalidate session)
   */
  async logout(sessionId: string): Promise<void> {
    await prisma.session.delete({
      where: { id: sessionId },
    });

    logger.info(`Session logged out: ${sessionId}`);
  }

  /**
   * Logout from all devices (delete all sessions)
   */
  async logoutAll(userId: string): Promise<void> {
    const result = await prisma.session.deleteMany({
      where: { userId },
    });

    logger.info(`Logged out from ${result.count} sessions for user: ${userId}`);
  }

  /**
   * Generate password reset token
   */
  async generatePasswordResetToken(email: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if email exists
      logger.warn(`Password reset requested for non-existent email: ${email}`);
      return;
    }

    // Generate secure random token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash token before storing
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set expiry to 1 hour
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    // Store hashed token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: hashedToken,
        passwordResetExpires: expiresAt,
      },
    });

    logger.info(`Password reset token generated for user: ${email}`);

    // TODO: Send email with resetToken (not hashedToken)
    // For now, just log it (remove in production!)
    if (env.NODE_ENV === 'development') {
      logger.debug(`Password reset token: ${resetToken}`);
    }
  }

  /**
   * Reset password using reset token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    // Hash the provided token
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with valid reset token
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: hashedToken,
        passwordResetExpires: {
          gt: new Date(), // Token not expired
        },
      },
    });

    if (!user) {
      throw new BadRequestError('Invalid or expired reset token');
    }

    // Hash new password
    const hashedPassword = await this.hashPassword(newPassword);

    // Update password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    // Invalidate all sessions for security
    await this.logoutAll(user.id);

    logger.info(`Password reset successfully for user: ${user.email}`);
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<User> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user;
  }

  /**
   * Convert User to safe UserResponse (remove sensitive fields)
   */
  toUserResponse(user: User): UserResponse {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      status: user.status,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
    };
  }
}

// Export singleton instance
export const authService = new AuthService();
