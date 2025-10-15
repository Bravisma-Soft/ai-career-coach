import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createTestUser() {
  const email = 'test@example.com';
  const password = 'Password123!';
  const hashedPassword = await bcrypt.hash(password, 12);

  try {
    // Try to delete existing test user first
    await prisma.user.deleteMany({
      where: { email },
    });
    console.log('Deleted existing test user');

    // Create new test user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName: 'Test',
        lastName: 'User',
        role: 'USER',
        status: 'ACTIVE',
        emailVerified: true,
      },
    });

    console.log('✅ Test user created successfully!');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('User ID:', user.id);
  } catch (error) {
    console.error('Error creating test user:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
