import { User as PrismaUser } from '@prisma/client';

declare global {
  namespace Express {
    // Augment the Passport User interface to match our Prisma User type
    interface User extends PrismaUser {}

    interface Request {
      userId?: string;
    }
  }
}

export {};
