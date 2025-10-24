import passport from 'passport';
import { Strategy as GoogleStrategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import { env } from './env';
import { prisma } from '@/database/client';
import { logger } from './logger';
import { AuthProvider } from '@prisma/client';

/**
 * Configure Passport.js with Google OAuth Strategy
 */
export const configurePassport = () => {
  // Only configure Google OAuth if credentials are provided
  if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET && env.GOOGLE_CALLBACK_URL) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: env.GOOGLE_CLIENT_ID,
          clientSecret: env.GOOGLE_CLIENT_SECRET,
          callbackURL: env.GOOGLE_CALLBACK_URL,
          scope: ['profile', 'email'],
        },
        async (accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) => {
          try {
            logger.info(`Google OAuth callback for user: ${profile.id}`);

            // Extract user information from Google profile
            const email = profile.emails?.[0]?.value;
            if (!email) {
              return done(new Error('No email found in Google profile'), undefined);
            }

            const firstName = profile.name?.givenName || '';
            const lastName = profile.name?.familyName || '';
            const profilePicture = profile.photos?.[0]?.value || '';

            // Check if user already exists
            let user = await prisma.user.findUnique({
              where: { email },
            });

            if (user) {
              // User exists - check if they're using OAuth or local auth
              if (user.provider === AuthProvider.LOCAL) {
                // User registered with email/password - link OAuth account
                logger.info(`Linking Google account to existing user: ${email}`);
                user = await prisma.user.update({
                  where: { id: user.id },
                  data: {
                    provider: AuthProvider.GOOGLE,
                    providerId: profile.id,
                    providerData: profile._json as any,
                    profilePicture,
                    emailVerified: true,
                    emailVerifiedAt: new Date(),
                    lastLoginAt: new Date(),
                  },
                });
              } else if (user.provider === AuthProvider.GOOGLE && user.providerId === profile.id) {
                // Existing OAuth user - update last login
                logger.info(`Existing Google user logging in: ${email}`);
                user = await prisma.user.update({
                  where: { id: user.id },
                  data: {
                    lastLoginAt: new Date(),
                    providerData: profile._json as any,
                    profilePicture,
                  },
                });
              } else {
                // Email exists but with different provider
                return done(
                  new Error(
                    `This email is already registered with ${user.provider}. Please sign in using that method.`
                  ),
                  undefined
                );
              }
            } else {
              // New user - create account
              logger.info(`Creating new user from Google OAuth: ${email}`);
              user = await prisma.user.create({
                data: {
                  email,
                  firstName,
                  lastName,
                  provider: AuthProvider.GOOGLE,
                  providerId: profile.id,
                  providerData: profile._json as any,
                  profilePicture,
                  emailVerified: true,
                  emailVerifiedAt: new Date(),
                  lastLoginAt: new Date(),
                  password: null, // OAuth users don't have passwords
                },
              });
            }

            return done(null, user);
          } catch (error) {
            logger.error('Google OAuth error:', error);
            return done(error as Error, undefined);
          }
        }
      )
    );

    // Serialize user for session
    passport.serializeUser((user: any, done) => {
      done(null, user.id);
    });

    // Deserialize user from session
    passport.deserializeUser(async (id: string, done) => {
      try {
        const user = await prisma.user.findUnique({
          where: { id },
        });
        done(null, user);
      } catch (error) {
        done(error, null);
      }
    });

    logger.info('✅ Google OAuth Strategy configured');
  } else {
    logger.warn('⚠️  Google OAuth credentials not found - OAuth disabled');
  }
};

export default passport;
