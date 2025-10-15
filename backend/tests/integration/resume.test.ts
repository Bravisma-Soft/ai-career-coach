import request from 'supertest';
import app from '@/app';
import { prisma } from '@/database/client';
import { authService } from '@/services/auth.service';
import path from 'path';
import fs from 'fs';

describe('Resume API Integration Tests', () => {
  let authToken: string;
  let userId: string;
  let testResumeId: string;

  beforeAll(async () => {
    // Create test user
    const testUser = await authService.registerUser(
      {
        email: 'resume-test@example.com',
        password: 'Test123!@#',
        firstName: 'Resume',
        lastName: 'Tester',
      },
      'test-agent',
      '127.0.0.1'
    );

    userId = testUser.user.id;
    authToken = testUser.tokens.accessToken;
  });

  afterAll(async () => {
    // Cleanup: Delete test user and all related data
    await prisma.resume.deleteMany({ where: { userId } });
    await prisma.session.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } });
    await prisma.$disconnect();
  });

  describe('POST /api/resumes/upload', () => {
    it('should upload a resume successfully', async () => {
      // Create a test file
      const testFilePath = path.join(__dirname, '../fixtures/test-resume.txt');
      const testContent = 'Test Resume Content\n\nJohn Doe\nSoftware Engineer\njohn@example.com';

      // Ensure fixtures directory exists
      const fixturesDir = path.dirname(testFilePath);
      if (!fs.existsSync(fixturesDir)) {
        fs.mkdirSync(fixturesDir, { recursive: true });
      }

      fs.writeFileSync(testFilePath, testContent);

      const response = await request(app)
        .post('/api/resumes/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('resume', testFilePath)
        .field('title', 'Test Resume');

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.resume).toHaveProperty('id');
      expect(response.body.data.resume.title).toBe('Test Resume');
      expect(response.body.data.resume.userId).toBe(userId);

      testResumeId = response.body.data.resume.id;

      // Cleanup test file
      fs.unlinkSync(testFilePath);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/resumes/upload')
        .attach('resume', Buffer.from('test'), 'test.txt');

      expect(response.status).toBe(401);
    });

    it('should fail without file', async () => {
      const response = await request(app)
        .post('/api/resumes/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .field('title', 'No File Resume');

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('No file uploaded');
    });
  });

  describe('GET /api/resumes', () => {
    it('should get all resumes for user', async () => {
      const response = await request(app)
        .get('/api/resumes')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.pagination).toBeDefined();
    });

    it('should handle pagination', async () => {
      const response = await request(app)
        .get('/api/resumes?page=1&limit=5')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(5);
    });

    it('should fail without authentication', async () => {
      const response = await request(app).get('/api/resumes');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/resumes/:id', () => {
    it('should get resume by id', async () => {
      const response = await request(app)
        .get(`/api/resumes/${testResumeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.resume.id).toBe(testResumeId);
    });

    it('should fail with invalid id format', async () => {
      const response = await request(app)
        .get('/api/resumes/invalid-id')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
    });

    it('should fail when accessing another user\'s resume', async () => {
      // Create another user
      const otherUser = await authService.registerUser(
        {
          email: 'other-user@example.com',
          password: 'Test123!@#',
          firstName: 'Other',
          lastName: 'User',
        },
        'test-agent',
        '127.0.0.1'
      );

      const response = await request(app)
        .get(`/api/resumes/${testResumeId}`)
        .set('Authorization', `Bearer ${otherUser.tokens.accessToken}`);

      expect(response.status).toBe(404);

      // Cleanup
      await prisma.session.deleteMany({ where: { userId: otherUser.user.id } });
      await prisma.user.delete({ where: { id: otherUser.user.id } });
    });
  });

  describe('PATCH /api/resumes/:id/set-master', () => {
    it('should set resume as master', async () => {
      const response = await request(app)
        .patch(`/api/resumes/${testResumeId}/set-master`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.resume.isPrimary).toBe(true);
    });

    it('should fail with invalid resume id format', async () => {
      const response = await request(app)
        .patch('/api/resumes/invalid-id/set-master')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
    });

    it('should unset other master resumes when setting new master', async () => {
      // Upload another resume
      const testFilePath = path.join(__dirname, '../fixtures/test-resume-2.txt');
      fs.writeFileSync(testFilePath, 'Second Test Resume');

      const uploadResponse = await request(app)
        .post('/api/resumes/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('resume', testFilePath)
        .field('title', 'Second Resume');

      const secondResumeId = uploadResponse.body.data.resume.id;

      // Set second resume as master
      await request(app)
        .patch(`/api/resumes/${secondResumeId}/set-master`)
        .set('Authorization', `Bearer ${authToken}`);

      // Check first resume is no longer master
      const firstResumeCheck = await request(app)
        .get(`/api/resumes/${testResumeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(firstResumeCheck.body.data.resume.isPrimary).toBe(false);

      // Cleanup
      fs.unlinkSync(testFilePath);
    });
  });

  describe('POST /api/resumes/:id/parse', () => {
    it('should initiate resume parsing', async () => {
      const response = await request(app)
        .post(`/api/resumes/${testResumeId}/parse`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('parsing initiated');
    });

    it('should fail with invalid resume id', async () => {
      const response = await request(app)
        .post('/api/resumes/invalid-id/parse')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
    });
  });

  describe('PUT /api/resumes/:id', () => {
    it('should update resume title', async () => {
      const response = await request(app)
        .put(`/api/resumes/${testResumeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Updated Resume Title' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.resume.title).toBe('Updated Resume Title');
    });
  });

  describe('DELETE /api/resumes/:id', () => {
    it('should delete a resume', async () => {
      // Create a resume to delete
      const testFilePath = path.join(__dirname, '../fixtures/test-resume-delete.txt');
      fs.writeFileSync(testFilePath, 'Resume to Delete');

      const uploadResponse = await request(app)
        .post('/api/resumes/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('resume', testFilePath)
        .field('title', 'Resume to Delete');

      const resumeToDeleteId = uploadResponse.body.data.resume.id;

      // Delete it
      const deleteResponse = await request(app)
        .delete(`/api/resumes/${resumeToDeleteId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body.success).toBe(true);

      // Verify it's deleted
      const getResponse = await request(app)
        .get(`/api/resumes/${resumeToDeleteId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(getResponse.status).toBe(404);

      // Cleanup
      fs.unlinkSync(testFilePath);
    });
  });

  describe('GET /api/resumes/stats', () => {
    it('should get resume statistics', async () => {
      const response = await request(app)
        .get('/api/resumes/stats')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.stats).toBeDefined();
    });
  });
});
