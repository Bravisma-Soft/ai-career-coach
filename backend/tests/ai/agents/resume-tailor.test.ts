/**
 * Resume Tailor Agent Tests
 *
 * Tests for AI-powered resume tailoring functionality
 */

import { ResumeTailorAgent, ResumeTailorInput } from '@/ai/agents/resume-tailor.agent';
import { ParsedResumeData } from '@/ai/prompts/resume-parser.prompt';
import {
  expectLLM,
  calculateTokenCost,
  measureResponseTime,
  calculateKeywordMatchScore,
} from '../../utils/llm-test-helpers';
import fs from 'fs';
import path from 'path';

describe('Resume Tailor Agent', () => {
  let agent: ResumeTailorAgent;
  const TIMEOUT = 120000; // 2 minutes for tailoring (complex operation)
  const MAX_COST_PER_TEST = 0.15; // $0.15 max per test

  // Mock resume data
  const mockResume: ParsedResumeData = {
    personalInfo: {
      name: 'John Doe',
      email: 'john.doe@email.com',
      phone: '(555) 123-4567',
      location: 'San Francisco, CA',
      city: 'San Francisco',
      state: 'CA',
      country: 'USA',
      linkedinUrl: 'linkedin.com/in/johndoe',
      githubUrl: 'github.com/johndoe',
      portfolioUrl: null,
      websiteUrl: null,
    },
    summary:
      'Experienced software engineer with 8+ years of expertise in full-stack development, cloud architecture, and team leadership.',
    experiences: [
      {
        company: 'Tech Corp',
        position: 'Senior Software Engineer',
        location: 'San Francisco, CA',
        startDate: '2020-01',
        endDate: null,
        isCurrent: true,
        description:
          'Led development of microservices architecture serving 10M+ users',
        achievements: [
          'Reduced latency by 40%',
          'Mentored team of 5 junior developers',
          'Reduced deployment time from 2 hours to 15 minutes',
        ],
        technologies: ['Node.js', 'Express', 'PostgreSQL', 'React', 'TypeScript'],
      },
      {
        company: 'StartupXYZ',
        position: 'Software Engineer',
        location: 'Palo Alto, CA',
        startDate: '2017-06',
        endDate: '2019-12',
        isCurrent: false,
        description: 'Developed customer-facing features using React and TypeScript',
        achievements: ['Improved page load times by 60%', 'Maintained 90%+ test coverage'],
        technologies: ['React', 'TypeScript', 'Redux', 'WebSockets'],
      },
    ],
    educations: [
      {
        institution: 'Stanford University',
        degree: 'Bachelor of Science',
        fieldOfStudy: 'Computer Science',
        location: 'Stanford, CA',
        startDate: '2011',
        endDate: '2015',
        isCurrent: false,
        gpa: 3.8,
        honors: [],
        coursework: ['Data Structures', 'Algorithms', 'Database Systems'],
      },
    ],
    skills: [
      { name: 'JavaScript', category: 'Programming Languages', level: 'Expert' },
      { name: 'TypeScript', category: 'Programming Languages', level: 'Advanced' },
      { name: 'Python', category: 'Programming Languages', level: 'Intermediate' },
      { name: 'React', category: 'Frontend', level: 'Expert' },
      { name: 'Node.js', category: 'Backend', level: 'Advanced' },
      { name: 'PostgreSQL', category: 'Databases', level: 'Advanced' },
      { name: 'AWS', category: 'Cloud', level: 'Intermediate' },
      { name: 'Docker', category: 'DevOps', level: 'Intermediate' },
    ],
    certifications: [
      {
        name: 'AWS Certified Solutions Architect - Associate',
        issuingOrganization: 'AWS',
        issueDate: '2022',
        expiryDate: null,
        credentialId: null,
      },
    ],
  };

  const mockJob = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, '../../fixtures/jobs/sample-job.json'),
      'utf-8'
    )
  );

  beforeAll(() => {
    agent = new ResumeTailorAgent();
  });

  describe('Basic Functionality', () => {
    test('should initialize agent successfully', () => {
      expect(agent).toBeDefined();
      expect(agent).toBeInstanceOf(ResumeTailorAgent);
    });

    test('should validate input - reject missing resume', async () => {
      const input: any = {
        jobDescription: 'Test job',
        jobTitle: 'Engineer',
        companyName: 'Test Co',
      };

      const result = await agent.execute(input);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('INVALID_INPUT');
    });

    test('should validate input - reject empty job description', async () => {
      const input: ResumeTailorInput = {
        resume: mockResume,
        jobDescription: '',
        jobTitle: 'Engineer',
        companyName: 'Test Co',
      };

      const result = await agent.execute(input);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('INVALID_INPUT');
    });

    test('should validate input - reject short job description', async () => {
      const input: ResumeTailorInput = {
        resume: mockResume,
        jobDescription: 'Short',
        jobTitle: 'Engineer',
        companyName: 'Test Co',
      };

      const result = await agent.execute(input);

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('at least 50 characters');
    });
  });

  describe('Resume Tailoring', () => {
    test(
      'should tailor resume for job posting',
      async () => {
        const input: ResumeTailorInput = {
          resume: mockResume,
          jobDescription: mockJob.description,
          jobTitle: mockJob.title,
          companyName: mockJob.company,
        };

        const { result, timeMs } = await measureResponseTime(() =>
          agent.execute(input)
        );

        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();

        const tailored = result.data!;

        // Calculate metrics - add null safety for usage fields
        const tokenCost = result.usage
          ? calculateTokenCost(
              result.usage.input_tokens || result.usage.inputTokens || 0,
              result.usage.output_tokens || result.usage.outputTokens || 0
            )
          : 0;

        console.log('Resume Tailor Metrics:', {
          responseTimeMs: timeMs,
          tokenUsage: result.usage,
          cost: `$${tokenCost.toFixed(4)}`,
          matchScore: tailored.matchScore,
          changesCount: tailored.changes?.length || 0,
          estimatedImpact: tailored.estimatedImpact,
        });

        // --- Basic Structure Validation ---
        expect(tailored.tailoredResume).toBeDefined();
        expect(tailored.matchScore).toBeDefined();
        expect(tailored.matchScore).toBeGreaterThan(0);
        expect(tailored.matchScore).toBeLessThanOrEqual(100);

        // --- Changes Tracking ---
        expect(tailored.changes).toBeDefined();
        expect(Array.isArray(tailored.changes)).toBe(true);

        if (tailored.changes.length > 0) {
          const firstChange = tailored.changes[0];
          expect(firstChange.section).toBeTruthy();
          expect(firstChange.field).toBeTruthy();
          expect(firstChange.reason).toBeTruthy();
        }

        // --- Keyword Alignment ---
        expect(tailored.keywordAlignment).toBeDefined();
        expect(tailored.keywordAlignment.matched).toBeDefined();
        expect(Array.isArray(tailored.keywordAlignment.matched)).toBe(true);
        expect(tailored.keywordAlignment.missing).toBeDefined();
        expect(tailored.keywordAlignment.suggestions).toBeDefined();

        // --- Recommendations ---
        expect(tailored.recommendations).toBeDefined();
        expect(Array.isArray(tailored.recommendations)).toBe(true);

        // --- Impact Assessment ---
        expect(tailored.estimatedImpact).toBeDefined();
        expect(['high', 'medium', 'low']).toContain(tailored.estimatedImpact);

        // --- Tailored Resume Structure ---
        const resume = tailored.tailoredResume;
        expect(resume.personalInfo).toBeDefined();
        expect(resume.experiences).toBeDefined();
        expect(resume.educations).toBeDefined();
        expect(resume.skills).toBeDefined();

        // Personal info should be preserved
        expect(resume.personalInfo.name).toBe(mockResume.personalInfo.name);
        expect(resume.personalInfo.email).toBe(mockResume.personalInfo.email);

        // LLM Quality Metrics
        expectLLM(tailored, {
          responseTimeMs: timeMs,
          cost: tokenCost,
          tokenUsage: result.usage,
        })
          .hasRequiredFields([
            'tailoredResume',
            'matchScore',
            'changes',
            'keywordAlignment',
            'recommendations',
            'estimatedImpact',
          ])
          .respondedWithin(120000) // 2 minutes max
          .costLessThan(MAX_COST_PER_TEST)
          .assert();

        // Performance assertions
        expect(timeMs).toBeLessThan(120000);
        expect(tokenCost).toBeLessThan(MAX_COST_PER_TEST);
      },
      TIMEOUT
    );

    test(
      'should produce higher match score for relevant experience',
      async () => {
        const input: ResumeTailorInput = {
          resume: mockResume,
          jobDescription: mockJob.description,
          jobTitle: mockJob.title,
          companyName: mockJob.company,
        };

        const result = await agent.execute(input);

        expect(result.success).toBe(true);
        const matchScore = result.data!.matchScore;

        // With relevant experience, match score should be decent
        expect(matchScore).toBeGreaterThan(50); // At least 50%
      },
      TIMEOUT
    );

    test(
      'should identify matched and missing keywords',
      async () => {
        const input: ResumeTailorInput = {
          resume: mockResume,
          jobDescription: mockJob.description,
          jobTitle: mockJob.title,
          companyName: mockJob.company,
        };

        const result = await agent.execute(input);
        const alignment = result.data!.keywordAlignment;

        // Should have some matched keywords
        expect(alignment.matched.length).toBeGreaterThan(0);

        // Matched keywords should be from the job description
        const jobDescLower = mockJob.description.toLowerCase();
        const matchedLower = alignment.matched.map(k => k.toLowerCase());

        // At least some matched keywords should appear in job description
        const validMatches = matchedLower.filter(
          keyword =>
            jobDescLower.includes(keyword) ||
            mockResume.skills.some(s => s.name.toLowerCase().includes(keyword))
        );

        expect(validMatches.length).toBeGreaterThan(0);
      },
      TIMEOUT
    );

    test(
      'should provide actionable recommendations',
      async () => {
        const input: ResumeTailorInput = {
          resume: mockResume,
          jobDescription: mockJob.description,
          jobTitle: mockJob.title,
          companyName: mockJob.company,
        };

        const result = await agent.execute(input);
        const recommendations = result.data!.recommendations;

        // Should have at least one recommendation
        expect(recommendations.length).toBeGreaterThan(0);

        // Recommendations should be strings with content
        recommendations.forEach(rec => {
          expect(typeof rec).toBe('string');
          expect(rec.length).toBeGreaterThan(10);
        });
      },
      TIMEOUT
    );
  });

  describe('Data Integrity', () => {
    test(
      'should preserve personal information exactly',
      async () => {
        const input: ResumeTailorInput = {
          resume: mockResume,
          jobDescription: mockJob.description,
          jobTitle: mockJob.title,
          companyName: mockJob.company,
        };

        const result = await agent.execute(input);
        const tailoredResume = result.data!.tailoredResume;

        // Personal info should not be modified
        expect(tailoredResume.personalInfo.name).toBe(mockResume.personalInfo.name);
        expect(tailoredResume.personalInfo.email).toBe(mockResume.personalInfo.email);
        expect(tailoredResume.personalInfo.phone).toBe(mockResume.personalInfo.phone);
        expect(tailoredResume.personalInfo.linkedinUrl).toBe(
          mockResume.personalInfo.linkedinUrl
        );
      },
      TIMEOUT
    );

    test(
      'should not fabricate experience',
      async () => {
        const input: ResumeTailorInput = {
          resume: mockResume,
          jobDescription: mockJob.description,
          jobTitle: mockJob.title,
          companyName: mockJob.company,
        };

        const result = await agent.execute(input);
        const tailoredResume = result.data!.tailoredResume;

        // Should not add new companies
        const originalCompanies = mockResume.experiences.map(e => e.company);
        const tailoredCompanies = tailoredResume.experiences.map(e => e.company);

        // All tailored companies should be from original
        tailoredCompanies.forEach(company => {
          expect(originalCompanies).toContain(company);
        });

        // Experience count should not exceed original
        expect(tailoredResume.experiences.length).toBeLessThanOrEqual(
          mockResume.experiences.length
        );
      },
      TIMEOUT
    );

    test(
      'should not fabricate education',
      async () => {
        const input: ResumeTailorInput = {
          resume: mockResume,
          jobDescription: mockJob.description,
          jobTitle: mockJob.title,
          companyName: mockJob.company,
        };

        const result = await agent.execute(input);
        const tailoredResume = result.data!.tailoredResume;

        // Should not add new institutions
        const originalInstitutions = mockResume.educations.map(e => e.institution);
        const tailoredInstitutions = tailoredResume.educations.map(e => e.institution);

        tailoredInstitutions.forEach(institution => {
          expect(originalInstitutions).toContain(institution);
        });
      },
      TIMEOUT
    );
  });

  describe('Change Tracking', () => {
    test(
      'should track all modifications made',
      async () => {
        const input: ResumeTailorInput = {
          resume: mockResume,
          jobDescription: mockJob.description,
          jobTitle: mockJob.title,
          companyName: mockJob.company,
        };

        const result = await agent.execute(input);
        const changes = result.data!.changes;

        // If changes were made, they should be documented
        if (changes.length > 0) {
          changes.forEach(change => {
            expect(change.section).toBeTruthy();
            expect(change.field).toBeTruthy();
            expect(change.original).toBeDefined();
            expect(change.modified).toBeDefined();
            expect(change.reason).toBeTruthy();

            // Reason should explain the change
            expect(change.reason.length).toBeGreaterThan(10);
          });
        }
      },
      TIMEOUT
    );
  });

  describe('Edge Cases', () => {
    test(
      'should handle resume with minimal experience',
      async () => {
        const minimalResume: ParsedResumeData = {
          ...mockResume,
          experiences: [mockResume.experiences[0]], // Only one job
        };

        const input: ResumeTailorInput = {
          resume: minimalResume,
          jobDescription: mockJob.description,
          jobTitle: mockJob.title,
          companyName: mockJob.company,
        };

        const result = await agent.execute(input);

        expect(result.success).toBe(true);
        expect(result.data?.tailoredResume).toBeDefined();
      },
      TIMEOUT
    );

    test(
      'should handle very long job descriptions',
      async () => {
        const longJobDesc = mockJob.description + '\n\n' + mockJob.description.repeat(5);

        const input: ResumeTailorInput = {
          resume: mockResume,
          jobDescription: longJobDesc,
          jobTitle: mockJob.title,
          companyName: mockJob.company,
        };

        const result = await agent.execute(input);

        expect(result.success).toBe(true);
      },
      TIMEOUT
    );
  });

  describe('Match Score Accuracy', () => {
    test(
      'should calculate reasonable match scores',
      async () => {
        const input: ResumeTailorInput = {
          resume: mockResume,
          jobDescription: mockJob.description,
          jobTitle: mockJob.title,
          companyName: mockJob.company,
        };

        const result = await agent.execute(input);
        const matchScore = result.data!.matchScore;

        // Match score should be in valid range
        expect(matchScore).toBeGreaterThanOrEqual(0);
        expect(matchScore).toBeLessThanOrEqual(100);

        // For a relevant resume, score should be reasonable
        expect(matchScore).toBeGreaterThan(30); // At least 30%
      },
      TIMEOUT
    );
  });
});
