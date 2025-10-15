import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkResumes() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        _count: {
          select: { resumes: true }
        }
      }
    });

    console.log('\n=== Users ===');
    for (const user of users) {
      console.log(`${user.email} (${user.id}): ${user._count.resumes} resumes`);
    }

    const resumes = await prisma.resume.findMany({
      select: {
        id: true,
        title: true,
        isPrimary: true,
        userId: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    console.log('\n=== Recent Resumes ===');
    for (const resume of resumes) {
      console.log(`ID: ${resume.id}`);
      console.log(`  Title: ${resume.title}`);
      console.log(`  Primary: ${resume.isPrimary}`);
      console.log(`  User: ${resume.userId}`);
      console.log(`  Created: ${resume.createdAt}`);
      console.log('');
    }

    console.log(`\nTotal resumes: ${resumes.length}`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkResumes();
