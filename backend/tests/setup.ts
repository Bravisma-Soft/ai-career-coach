// Test setup file
import { prisma } from '@/database/client';

// Increase timeout for all tests
jest.setTimeout(30000);

// Cleanup function to run before all tests
beforeAll(async () => {
  // Connect to test database
  await prisma.$connect();
});

// Cleanup function to run after all tests
afterAll(async () => {
  // Disconnect from database
  await prisma.$disconnect();
});
