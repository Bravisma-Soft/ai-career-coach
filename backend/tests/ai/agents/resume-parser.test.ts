/**
 * Resume Parser Agent Tests
 *
 * Comprehensive tests for AI-powered resume parsing
 */

import { ResumeParserAgent } from '@/ai/agents/resume-parser.agent';
import { ParsedResumeData } from '@/ai/prompts/resume-parser.prompt';
import {
  expectLLM,
  calculateTokenCost,
  measureResponseTime,
  validateStructure,
  calculateCompletenessScore,
  calculateKeywordMatchScore,
} from '../../utils/llm-test-helpers';
import fs from 'fs';
import path from 'path';

describe('Resume Parser Agent', () => {
  let agent: ResumeParserAgent;
  const TIMEOUT = 60000; // 60 seconds for AI calls
  const MAX_COST_PER_TEST = 0.05; // $0.05 max per test

  beforeAll(() => {
    agent = new ResumeParserAgent();
  });

  describe('Basic Functionality', () => {
    test('should initialize agent successfully', () => {
      expect(agent).toBeDefined();
      expect(agent).toBeInstanceOf(ResumeParserAgent);
    });

    test('should reject empty resume text', async () => {
      const result = await agent.execute({ resumeText: '' });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('INVALID_INPUT');
      expect(result.error?.message).toContain('empty');
    });

    test('should reject whitespace-only resume text', async () => {
      const result = await agent.execute({ resumeText: '   \n\n  \t  ' });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('INVALID_INPUT');
    });
  });

  describe('Full Resume Parsing', () => {
    test(
      'should parse comprehensive resume correctly',
      async () => {
        // Load test fixture
        const resumeText = fs.readFileSync(
          path.join(__dirname, '../../fixtures/resumes/sample-resume.txt'),
          'utf-8'
        );

        // Execute parsing with timing
        const { result, timeMs } = await measureResponseTime(() =>
          agent.execute({ resumeText, fileName: 'sample-resume.txt' })
        );

        // Basic assertions
        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();

        const parsed = result.data!;

        // Calculate metrics - add null safety for usage fields
        const tokenCost = result.usage
          ? calculateTokenCost(
              result.usage.input_tokens || result.usage.inputTokens || 0,
              result.usage.output_tokens || result.usage.outputTokens || 0
            )
          : 0;

        console.log('Resume Parser Metrics:', {
          responseTimeMs: timeMs,
          tokenUsage: result.usage,
          cost: `$${tokenCost.toFixed(4)}`,
          model: result.model,
        });

        // --- Personal Info Validation ---
        expect(parsed.personalInfo).toBeDefined();
        expect(parsed.personalInfo.name).toBeTruthy();
        expect(parsed.personalInfo.name?.toLowerCase()).toContain('john');
        expect(parsed.personalInfo.email).toBe('john.doe@email.com');
        expect(parsed.personalInfo.phone).toBeTruthy();
        expect(parsed.personalInfo.location).toBeTruthy();
        expect(parsed.personalInfo.linkedinUrl).toContain('linkedin.com');
        expect(parsed.personalInfo.githubUrl).toContain('github.com');

        // --- Summary Validation ---
        expect(parsed.summary).toBeTruthy();
        expect(parsed.summary!.length).toBeGreaterThan(50);
        expect(parsed.summary?.toLowerCase()).toContain('software engineer');

        // --- Experience Validation ---
        expect(parsed.experiences).toBeDefined();
        expect(parsed.experiences.length).toBeGreaterThanOrEqual(3);

        // Check first experience (most recent)
        const firstExp = parsed.experiences[0];
        expect(firstExp.company).toBeTruthy();
        expect(firstExp.position).toBeTruthy();
        expect(firstExp.startDate).toMatch(/^\d{4}/); // Starts with year
        expect(firstExp.achievements).toBeDefined();
        expect(Array.isArray(firstExp.achievements)).toBe(true);
        expect(firstExp.technologies).toBeDefined();
        expect(Array.isArray(firstExp.technologies)).toBe(true);

        // --- Education Validation ---
        expect(parsed.educations).toBeDefined();
        expect(parsed.educations.length).toBeGreaterThanOrEqual(1);

        const firstEdu = parsed.educations[0];
        expect(firstEdu.institution).toBeTruthy();
        expect(firstEdu.degree).toBeTruthy();
        expect(firstEdu.fieldOfStudy).toBeTruthy();
        expect(firstEdu.fieldOfStudy?.toLowerCase()).toContain('computer science');

        // --- Skills Validation ---
        expect(parsed.skills).toBeDefined();
        expect(parsed.skills.length).toBeGreaterThan(5);

        const skillNames = parsed.skills.map(s => s.name.toLowerCase());
        expect(skillNames).toContain('javascript');
        expect(skillNames).toContain('react');

        // Check skill categorization
        const categorizedSkills = parsed.skills.filter(s => s.category);
        expect(categorizedSkills.length).toBeGreaterThan(0);

        // --- Certifications Validation ---
        expect(parsed.certifications).toBeDefined();
        expect(parsed.certifications.length).toBeGreaterThanOrEqual(1);

        const firstCert = parsed.certifications[0];
        expect(firstCert.name).toBeTruthy();
        expect(firstCert.issuingOrganization).toBeTruthy();

        // --- LLM Quality Metrics ---
        expectLLM(parsed, {
          responseTimeMs: timeMs,
          cost: tokenCost,
          tokenUsage: result.usage,
        })
          .hasRequiredFields([
            'personalInfo',
            'personalInfo.name',
            'personalInfo.email',
            'experiences',
            'educations',
            'skills',
          ])
          .respondedWithin(30000) // 30 seconds max
          .costLessThan(MAX_COST_PER_TEST)
          .assert();

        // Performance assertion
        expect(timeMs).toBeLessThan(30000); // 30 seconds max
        expect(tokenCost).toBeLessThan(MAX_COST_PER_TEST);
      },
      TIMEOUT
    );

    test(
      'should parse minimal resume correctly',
      async () => {
        const resumeText = fs.readFileSync(
          path.join(__dirname, '../../fixtures/resumes/sample-resume-minimal.txt'),
          'utf-8'
        );

        const { result, timeMs } = await measureResponseTime(() =>
          agent.execute({ resumeText })
        );

        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();

        const parsed = result.data!;

        // Minimal resume should still extract basic info
        expect(parsed.personalInfo?.name).toBeTruthy();
        expect(parsed.experiences.length).toBeGreaterThan(0);
        expect(parsed.educations.length).toBeGreaterThan(0);
        expect(parsed.skills.length).toBeGreaterThan(0);

        console.log('Minimal Resume Parse Time:', timeMs, 'ms');
      },
      TIMEOUT
    );
  });

  describe('Data Extraction Quality', () => {
    test(
      'should extract all work experiences chronologically',
      async () => {
        const resumeText = fs.readFileSync(
          path.join(__dirname, '../../fixtures/resumes/sample-resume.txt'),
          'utf-8'
        );

        const result = await agent.execute({ resumeText });
        const experiences = result.data!.experiences;

        // Should have 3 experiences
        expect(experiences.length).toBe(3);

        // Check companies exist
        const companies = experiences.map(e => e.company);
        expect(companies).toContain('Tech Corp');
        expect(companies).toContain('StartupXYZ');
        expect(companies).toContain('Digital Agency Inc');

        // First experience should be current
        expect(experiences[0].isCurrent).toBe(true);
        expect(experiences[0].endDate).toBeNull();

        // Others should have end dates
        expect(experiences[1].endDate).toBeTruthy();
        expect(experiences[2].endDate).toBeTruthy();
      },
      TIMEOUT
    );

    test(
      'should extract achievements with quantifiable metrics',
      async () => {
        const resumeText = fs.readFileSync(
          path.join(__dirname, '../../fixtures/resumes/sample-resume.txt'),
          'utf-8'
        );

        const result = await agent.execute({ resumeText });
        const experiences = result.data!.experiences;

        // At least one experience should have achievements
        const experiencesWithAchievements = experiences.filter(
          e => e.achievements && e.achievements.length > 0
        );
        expect(experiencesWithAchievements.length).toBeGreaterThan(0);

        // Check for quantifiable metrics in achievements
        const allAchievements = experiences.flatMap(e => e.achievements || []);
        const achievementsWithMetrics = allAchievements.filter(
          a =>
            a.includes('%') ||
            a.includes('M+') ||
            /\d+/.test(a) // Contains numbers
        );

        expect(achievementsWithMetrics.length).toBeGreaterThan(0);
      },
      TIMEOUT
    );

    test(
      'should extract and categorize technologies',
      async () => {
        const resumeText = fs.readFileSync(
          path.join(__dirname, '../../fixtures/resumes/sample-resume.txt'),
          'utf-8'
        );

        const result = await agent.execute({ resumeText });
        const experiences = result.data!.experiences;

        // Check that technologies are extracted
        const experiencesWithTech = experiences.filter(
          e => e.technologies && e.technologies.length > 0
        );
        expect(experiencesWithTech.length).toBeGreaterThan(0);

        // Collect all mentioned technologies
        const allTech = experiences.flatMap(e => e.technologies || []);
        const techLower = allTech.map(t => t.toLowerCase());

        // Should include key technologies from resume
        const expectedTech = ['node.js', 'react', 'postgresql', 'typescript'];
        const foundExpectedTech = expectedTech.filter(tech =>
          techLower.some(t => t.includes(tech))
        );

        expect(foundExpectedTech.length).toBeGreaterThanOrEqual(2);
      },
      TIMEOUT
    );

    test(
      'should categorize skills correctly',
      async () => {
        const resumeText = fs.readFileSync(
          path.join(__dirname, '../../fixtures/resumes/sample-resume.txt'),
          'utf-8'
        );

        const result = await agent.execute({ resumeText });
        const skills = result.data!.skills;

        // Group skills by category
        const categories = new Set(skills.map(s => s.category));

        // Should have multiple categories
        expect(categories.size).toBeGreaterThanOrEqual(2);

        // Check for expected categories
        const categoryList = Array.from(categories).map(c => c?.toLowerCase() || '');
        const hasProgLanguages = categoryList.some(c =>
          c.includes('programming') || c.includes('language')
        );
        const hasFrontend = categoryList.some(c => c.includes('frontend'));
        const hasBackend = categoryList.some(c => c.includes('backend'));

        expect(hasProgLanguages || hasFrontend || hasBackend).toBe(true);
      },
      TIMEOUT
    );

    test(
      'should extract education with GPA when present',
      async () => {
        const resumeText = fs.readFileSync(
          path.join(__dirname, '../../fixtures/resumes/sample-resume.txt'),
          'utf-8'
        );

        const result = await agent.execute({ resumeText });
        const educations = result.data!.educations;

        expect(educations.length).toBeGreaterThan(0);

        const firstEdu = educations[0];
        expect(firstEdu.institution).toContain('Stanford');
        expect(firstEdu.degree).toContain('Bachelor');
        expect(firstEdu.fieldOfStudy).toContain('Computer Science');
        expect(firstEdu.gpa).toBeTruthy();
        expect(firstEdu.gpa).toBeGreaterThan(0);
        expect(firstEdu.gpa).toBeLessThanOrEqual(4.0);
      },
      TIMEOUT
    );

    test(
      'should extract certifications with details',
      async () => {
        const resumeText = fs.readFileSync(
          path.join(__dirname, '../../fixtures/resumes/sample-resume.txt'),
          'utf-8'
        );

        const result = await agent.execute({ resumeText });
        const certifications = result.data!.certifications;

        expect(certifications.length).toBeGreaterThanOrEqual(2);

        // Check AWS certification
        const awsCert = certifications.find(c => c.name.toLowerCase().includes('aws'));
        expect(awsCert).toBeDefined();
        expect(awsCert?.issuingOrganization).toBeTruthy();
        expect(awsCert?.issueDate).toBeTruthy();
      },
      TIMEOUT
    );
  });

  describe('Date Normalization', () => {
    test(
      'should normalize dates to YYYY-MM format',
      async () => {
        const resumeText = fs.readFileSync(
          path.join(__dirname, '../../fixtures/resumes/sample-resume.txt'),
          'utf-8'
        );

        const result = await agent.execute({ resumeText });
        const experiences = result.data!.experiences;

        experiences.forEach(exp => {
          // Start date should be in YYYY or YYYY-MM format
          expect(exp.startDate).toMatch(/^\d{4}(-\d{2})?$/);

          // End date (if not current) should also be normalized
          if (!exp.isCurrent && exp.endDate) {
            expect(exp.endDate).toMatch(/^\d{4}(-\d{2})?$/);
          }
        });
      },
      TIMEOUT
    );

    test(
      'should mark current positions correctly',
      async () => {
        const resumeText = fs.readFileSync(
          path.join(__dirname, '../../fixtures/resumes/sample-resume.txt'),
          'utf-8'
        );

        const result = await agent.execute({ resumeText });
        const experiences = result.data!.experiences;

        // First position is current
        const currentJobs = experiences.filter(e => e.isCurrent);
        expect(currentJobs.length).toBeGreaterThan(0);

        // Current jobs should have null or "Present" as end date
        currentJobs.forEach(job => {
          expect(job.endDate).toBeNull();
        });
      },
      TIMEOUT
    );
  });

  describe('Edge Cases', () => {
    test(
      'should handle very long resumes (truncation)',
      async () => {
        // Create a very long resume (>20000 chars)
        const longResume = 'John Doe\nSoftware Engineer\n\n' + 'A'.repeat(25000);

        const result = await agent.execute({ resumeText: longResume });

        // Should still succeed despite truncation
        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
      },
      TIMEOUT
    );

    test('should handle resumes with special characters', async () => {
      const resumeText = `José García
      Email: jose@email.com
      Développeur Senior
      Skills: C++, C#, Node.js`;

      const result = await agent.execute({ resumeText });

      expect(result.success).toBe(true);
      expect(result.data?.personalInfo?.name).toBeTruthy();
      expect(result.data?.personalInfo?.email).toBe('jose@email.com');
    });

    test('should handle resumes with minimal contact info', async () => {
      const resumeText = `Software Engineer

      Experience:
      - Company A (2020-2023)
      - Company B (2018-2020)

      Skills: Python, Django`;

      const result = await agent.execute({ resumeText });

      expect(result.success).toBe(true);
      expect(result.data?.experiences.length).toBeGreaterThan(0);
      expect(result.data?.skills.length).toBeGreaterThan(0);
    });
  });

  describe('Response Consistency', () => {
    test(
      'should produce consistent results with temperature=0',
      async () => {
        const resumeText = 'Jane Smith\nData Analyst\nPython, SQL';

        // Run twice with temperature=0
        const result1 = await agent.execute(
          { resumeText },
          { temperature: 0, maxRetries: 0 }
        );

        const result2 = await agent.execute(
          { resumeText },
          { temperature: 0, maxRetries: 0 }
        );

        expect(result1.success).toBe(true);
        expect(result2.success).toBe(true);

        // Results should be very similar (names and basic fields)
        // Allow small variation since AI isn't 100% deterministic even with temp=0
        expect(result1.data?.personalInfo?.name).toBeTruthy();
        expect(result2.data?.personalInfo?.name).toBeTruthy();

        // Skills count should be similar (allow ±2 difference)
        const skillDiff = Math.abs(
          (result1.data?.skills.length || 0) - (result2.data?.skills.length || 0)
        );
        expect(skillDiff).toBeLessThanOrEqual(2);
      },
      TIMEOUT
    );
  });

  describe('Error Handling', () => {
    test('should handle malformed resume gracefully', async () => {
      const malformedResume = `
        @@@@####
        Random text %$#@
        No structure here!
        1234567890
      `;

      const result = await agent.execute({ resumeText: malformedResume });

      // Should not crash, might succeed with minimal data or fail gracefully
      if (result.success) {
        expect(result.data).toBeDefined();
      } else {
        expect(result.error).toBeDefined();
        expect(result.error?.retryable).toBeDefined();
      }
    });
  });

  describe('Structure Validation', () => {
    test(
      'should return data matching expected structure',
      async () => {
        const resumeText = fs.readFileSync(
          path.join(__dirname, '../../fixtures/resumes/sample-resume.txt'),
          'utf-8'
        );

        const result = await agent.execute({ resumeText });
        const data = result.data!;

        // Validate required fields
        const requiredFields = [
          'personalInfo',
          'summary',
          'experiences',
          'educations',
          'skills',
          'certifications',
        ];

        const validation = validateStructure(data, requiredFields);
        expect(validation.valid).toBe(true);
        expect(validation.missing).toEqual([]);

        // Validate array types
        expect(Array.isArray(data.experiences)).toBe(true);
        expect(Array.isArray(data.educations)).toBe(true);
        expect(Array.isArray(data.skills)).toBe(true);
        expect(Array.isArray(data.certifications)).toBe(true);
      },
      TIMEOUT
    );
  });
});
