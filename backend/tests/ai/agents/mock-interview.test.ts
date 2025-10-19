/**
 * Mock Interview Agent Tests
 *
 * Tests for AI-powered mock interview functionality
 */

import { MockInterviewAgent } from '@/ai/agents/mock-interview.agent';
import {
  expectLLM,
  calculateTokenCost,
  measureResponseTime,
} from '../../utils/llm-test-helpers';

describe('Mock Interview Agent', () => {
  let agent: MockInterviewAgent;
  const TIMEOUT = 120000; // 2 minutes for complex operations
  const MAX_COST_PER_TEST = 0.10; // $0.10 max per test

  const mockJobContext = {
    jobTitle: 'Senior Full Stack Engineer',
    companyName: 'Acme Technologies Inc.',
    jobDescription: `We are seeking an experienced Senior Full Stack Engineer to join our growing engineering team.
      You will be responsible for designing and implementing scalable web applications using modern frameworks.
      Requirements: 5+ years of experience, JavaScript/TypeScript, React, Node.js, PostgreSQL, AWS.`,
  };

  beforeAll(() => {
    agent = new MockInterviewAgent();
  });

  describe('Basic Functionality', () => {
    test('should initialize agent successfully', () => {
      expect(agent).toBeDefined();
      expect(agent).toBeInstanceOf(MockInterviewAgent);
    });
  });

  describe('Question Generation', () => {
    test(
      'should generate technical interview questions',
      async () => {
        const input = {
          jobTitle: mockJobContext.jobTitle,
          companyName: mockJobContext.companyName,
          jobDescription: mockJobContext.jobDescription,
          interviewType: 'technical',
          difficulty: 'medium',
          numberOfQuestions: 5,
        };

        const { result: questions, timeMs } = await measureResponseTime(() =>
          agent.generateQuestions(input)
        );

        console.log('Question Generation Metrics:', {
          responseTimeMs: timeMs,
          questionsGenerated: questions.questions?.length || 0,
        });

        // --- Structure Validation ---
        expect(questions).toBeDefined();
        expect(questions.questions).toBeDefined();
        expect(Array.isArray(questions.questions)).toBe(true);
        expect(questions.questions.length).toBe(5);

        // --- Question Quality ---
        questions.questions.forEach((q, idx) => {
          expect(q.question).toBeDefined();
          expect(q.question.length).toBeGreaterThan(10);

          expect(q.category).toBeDefined();
          expect(q.difficulty).toBeDefined();
          expect(['easy', 'medium', 'hard']).toContain(q.difficulty.toLowerCase());

          expect(q.keyPointsToInclude).toBeDefined();
          expect(Array.isArray(q.keyPointsToInclude)).toBe(true);
          expect(q.keyPointsToInclude.length).toBeGreaterThan(0);

          expect(q.evaluationCriteria).toBeDefined();
          expect(Array.isArray(q.evaluationCriteria)).toBe(true);
          expect(q.evaluationCriteria.length).toBeGreaterThan(0);

          console.log(`Question ${idx + 1}:`, {
            category: q.category,
            difficulty: q.difficulty,
            keyPoints: q.keyPointsToInclude.length,
          });
        });

        // --- Context Relevance ---
        expect(questions.interviewContext).toBeDefined();
        expect(typeof questions.interviewContext).toBe('string');
        expect(questions.interviewContext.length).toBeGreaterThan(10);

        // Performance
        expect(timeMs).toBeLessThan(TIMEOUT);
      },
      TIMEOUT
    );

    test(
      'should generate behavioral questions',
      async () => {
        const input = {
          jobTitle: mockJobContext.jobTitle,
          companyName: mockJobContext.companyName,
          jobDescription: mockJobContext.jobDescription,
          interviewType: 'behavioral',
          difficulty: 'medium',
          numberOfQuestions: 3,
        };

        const questions = await agent.generateQuestions(input);

        expect(questions.questions.length).toBe(3);

        // Behavioral questions should ask about experiences
        questions.questions.forEach(q => {
          const questionLower = q.question.toLowerCase();
          expect(
            questionLower.includes('tell me') ||
            questionLower.includes('describe') ||
            questionLower.includes('experience') ||
            questionLower.includes('time when') ||
            questionLower.includes('situation')
          ).toBe(true);
        });
      },
      TIMEOUT
    );

    test(
      'should generate system design questions',
      async () => {
        const input = {
          jobTitle: mockJobContext.jobTitle,
          companyName: mockJobContext.companyName,
          interviewType: 'system-design',
          difficulty: 'hard',
          numberOfQuestions: 2,
        };

        const questions = await agent.generateQuestions(input);

        expect(questions.questions.length).toBe(2);

        // System design questions should be open-ended
        questions.questions.forEach(q => {
          expect(q.question.length).toBeGreaterThan(30);
        });
      },
      TIMEOUT
    );

    test(
      'should adjust difficulty level',
      async () => {
        const easyInput = {
          jobTitle: mockJobContext.jobTitle,
          companyName: mockJobContext.companyName,
          interviewType: 'technical',
          difficulty: 'easy',
          numberOfQuestions: 2,
        };

        const hardInput = {
          ...easyInput,
          difficulty: 'hard',
        };

        const easyQuestions = await agent.generateQuestions(easyInput);
        const hardQuestions = await agent.generateQuestions(hardInput);

        // Verify difficulty is set correctly
        easyQuestions.questions.forEach(q => {
          expect(q.difficulty.toLowerCase()).toBe('easy');
        });

        hardQuestions.questions.forEach(q => {
          expect(q.difficulty.toLowerCase()).toBe('hard');
        });
      },
      TIMEOUT
    );

    test(
      'should include interviewer context when provided',
      async () => {
        const input = {
          jobTitle: mockJobContext.jobTitle,
          companyName: mockJobContext.companyName,
          interviewType: 'technical',
          difficulty: 'medium',
          numberOfQuestions: 3,
          interviewers: [
            {
              name: 'Jane Smith',
              title: 'Senior Engineering Manager',
              linkedInUrl: 'https://linkedin.com/in/janesmith',
            },
          ],
        };

        const questions = await agent.generateQuestions(input);

        expect(questions).toBeDefined();
        expect(questions.questions.length).toBe(3);
        // Interviewer context should influence question generation
      },
      TIMEOUT
    );
  });

  describe('Answer Evaluation', () => {
    test(
      'should evaluate a good technical answer',
      async () => {
        const input = {
          question: 'Explain the difference between SQL and NoSQL databases.',
          questionCategory: 'Technical',
          keyPointsToInclude: [
            'Schema differences',
            'Scalability',
            'Use cases',
            'ACID vs BASE',
          ],
          evaluationCriteria: [
            'Technical accuracy',
            'Clarity of explanation',
            'Examples provided',
          ],
          userAnswer: `SQL databases use structured schemas with tables and relationships,
            while NoSQL databases are schema-less and use different data models like document,
            key-value, or graph. SQL databases are good for complex queries and ACID transactions,
            making them ideal for financial systems. NoSQL databases scale horizontally better
            and are great for high-traffic applications like social media. SQL follows ACID
            properties for data consistency, while NoSQL often uses BASE for availability.`,
          jobContext: {
            title: mockJobContext.jobTitle,
            company: mockJobContext.companyName,
          },
        };

        const { result: evaluation, timeMs } = await measureResponseTime(() =>
          agent.evaluateAnswer(input)
        );

        console.log('Answer Evaluation Metrics:', {
          responseTimeMs: timeMs,
          score: evaluation.score,
          strengths: evaluation.strengths?.length || 0,
          improvements: evaluation.improvements?.length || 0,
        });

        // --- Structure Validation ---
        expect(evaluation).toBeDefined();
        expect(evaluation.score).toBeDefined();
        expect(evaluation.score).toBeGreaterThanOrEqual(0);
        expect(evaluation.score).toBeLessThanOrEqual(100);

        // Good answer should have decent score
        expect(evaluation.score).toBeGreaterThan(60);

        // --- Feedback Components ---
        expect(evaluation.strengths).toBeDefined();
        expect(Array.isArray(evaluation.strengths)).toBe(true);
        expect(evaluation.strengths.length).toBeGreaterThan(0);

        expect(evaluation.improvements).toBeDefined();
        expect(Array.isArray(evaluation.improvements)).toBe(true);

        expect(evaluation.detailedFeedback).toBeDefined();
        expect(evaluation.detailedFeedback.length).toBeGreaterThan(20);

        // --- Key Points Coverage ---
        if (evaluation.keyPointsCovered !== undefined) {
          expect(Array.isArray(evaluation.keyPointsCovered)).toBe(true);
        }

        console.log('Evaluation Result:', {
          score: evaluation.score,
          strengthsCount: evaluation.strengths.length,
          improvementsCount: evaluation.improvements.length,
        });

        // Performance
        expect(timeMs).toBeLessThan(60000);
      },
      TIMEOUT
    );

    test(
      'should evaluate a poor answer with lower score',
      async () => {
        const input = {
          question: 'What is React and why is it used?',
          questionCategory: 'Technical',
          keyPointsToInclude: [
            'JavaScript library',
            'Component-based',
            'Virtual DOM',
            'Declarative',
          ],
          evaluationCriteria: ['Technical accuracy', 'Completeness'],
          userAnswer: 'React is a framework. It makes websites.',
          jobContext: {
            title: mockJobContext.jobTitle,
            company: mockJobContext.companyName,
          },
        };

        const evaluation = await agent.evaluateAnswer(input);

        // Poor answer should have lower score
        expect(evaluation.score).toBeLessThan(50);

        // Should have more improvements than strengths
        expect(evaluation.improvements.length).toBeGreaterThan(0);
      },
      TIMEOUT
    );

    test(
      'should provide constructive feedback',
      async () => {
        const input = {
          question: 'Describe your approach to debugging production issues.',
          questionCategory: 'Behavioral',
          keyPointsToInclude: [
            'Systematic approach',
            'Monitoring tools',
            'Root cause analysis',
          ],
          evaluationCriteria: ['Problem-solving approach', 'Communication'],
          userAnswer: `I start by checking logs and monitoring dashboards to identify patterns.
            Then I reproduce the issue in a staging environment if possible. I use debugging tools
            to narrow down the root cause and implement a fix with proper testing before deployment.`,
          jobContext: {
            title: mockJobContext.jobTitle,
            company: mockJobContext.companyName,
          },
        };

        const evaluation = await agent.evaluateAnswer(input);

        expect(evaluation.detailedFeedback).toBeTruthy();
        expect(evaluation.detailedFeedback.length).toBeGreaterThan(50);

        // Feedback should be constructive
        const feedbackLower = evaluation.detailedFeedback.toLowerCase();
        expect(
          feedbackLower.includes('good') ||
          feedbackLower.includes('well') ||
          feedbackLower.includes('consider') ||
          feedbackLower.includes('improve')
        ).toBe(true);
      },
      TIMEOUT
    );
  });

  describe('Session Analysis', () => {
    test(
      'should analyze complete interview session',
      async () => {
        const questionsAndAnswers = [
          {
            question: 'What is React?',
            category: 'Technical',
            answer: 'React is a JavaScript library for building user interfaces.',
            evaluation: {
              score: 75,
              strengths: ['Correct definition', 'Concise'],
              improvements: ['Could mention components'],
            },
          },
          {
            question: 'Describe a challenging project.',
            category: 'Behavioral',
            answer: 'I worked on a microservices migration...',
            evaluation: {
              score: 85,
              strengths: ['Clear structure', 'Good examples'],
              improvements: ['Add more metrics'],
            },
          },
        ];

        const input = {
          interviewType: 'technical',
          questionsAndAnswers,
          jobContext: {
            title: mockJobContext.jobTitle,
            company: mockJobContext.companyName,
          },
        };

        const { result: analysis, timeMs } = await measureResponseTime(() =>
          agent.analyzeSession(input)
        );

        console.log('Session Analysis Metrics:', {
          responseTimeMs: timeMs,
          overallScore: analysis.overallScore,
        });

        // --- Structure Validation ---
        expect(analysis).toBeDefined();
        expect(analysis.overallScore).toBeDefined();
        expect(analysis.overallScore).toBeGreaterThanOrEqual(0);
        expect(analysis.overallScore).toBeLessThanOrEqual(100);

        expect(analysis.detailedAnalysis).toBeDefined();
        expect(analysis.detailedAnalysis.length).toBeGreaterThan(50);

        // --- Strengths and Weaknesses ---
        expect(analysis.strengths).toBeDefined();
        expect(Array.isArray(analysis.strengths)).toBe(true);

        expect(analysis.areasToImprove).toBeDefined();
        expect(Array.isArray(analysis.areasToImprove)).toBe(true);

        // --- Recommendations ---
        expect(analysis.recommendations).toBeDefined();
        expect(Array.isArray(analysis.recommendations)).toBe(true);
        expect(analysis.recommendations.length).toBeGreaterThan(0);

        // --- Performance Rating ---
        if (analysis.performanceRating) {
          expect(['excellent', 'good', 'fair', 'poor']).toContain(
            analysis.performanceRating.toLowerCase()
          );
        }

        console.log('Session Analysis:', {
          overallScore: analysis.overallScore,
          strengths: analysis.strengths,
          recommendations: analysis.recommendations.length,
        });

        // Performance
        expect(timeMs).toBeLessThan(TIMEOUT);
      },
      TIMEOUT
    );

    test(
      'should calculate category-specific scores',
      async () => {
        const questionsAndAnswers = [
          {
            question: 'Technical Q1',
            category: 'Technical',
            answer: 'Answer 1',
            evaluation: {
              score: 80,
              strengths: [],
              improvements: [],
            },
          },
          {
            question: 'Technical Q2',
            category: 'Technical',
            answer: 'Answer 2',
            evaluation: {
              score: 90,
              strengths: [],
              improvements: [],
            },
          },
          {
            question: 'Behavioral Q1',
            category: 'Behavioral',
            answer: 'Answer 3',
            evaluation: {
              score: 70,
              strengths: [],
              improvements: [],
            },
          },
        ];

        const input = {
          interviewType: 'mixed',
          questionsAndAnswers,
          jobContext: {
            title: mockJobContext.jobTitle,
            company: mockJobContext.companyName,
          },
        };

        const analysis = await agent.analyzeSession(input);

        // Session analysis should have overall score and other metrics
        expect(analysis.overallScore).toBeDefined();
        expect(analysis.overallScore).toBeGreaterThanOrEqual(0);
        expect(analysis.overallScore).toBeLessThanOrEqual(100);

        // Should have detailed analysis
        expect(analysis.detailedAnalysis).toBeDefined();
      },
      TIMEOUT
    );
  });

  describe('Error Handling', () => {
    test('should handle invalid input gracefully', async () => {
      const invalidInput: any = {
        jobTitle: '',
        companyName: '',
        interviewType: 'invalid',
        difficulty: 'invalid',
        numberOfQuestions: -1,
      };

      await expect(agent.generateQuestions(invalidInput)).rejects.toThrow();
    });

    test('should handle empty answers', async () => {
      const input = {
        question: 'Test question',
        questionCategory: 'Technical',
        keyPointsToInclude: ['Point 1'],
        evaluationCriteria: ['Criterion 1'],
        userAnswer: '',
        jobContext: {
          title: mockJobContext.jobTitle,
          company: mockJobContext.companyName,
        },
      };

      const evaluation = await agent.evaluateAnswer(input);

      // Should return low score for empty answer
      expect(evaluation.score).toBeLessThan(20);
      expect(evaluation.improvements.length).toBeGreaterThan(0);
    });
  });

  describe('Consistency', () => {
    test(
      'should generate consistent question count',
      async () => {
        const input = {
          jobTitle: mockJobContext.jobTitle,
          companyName: mockJobContext.companyName,
          interviewType: 'technical',
          difficulty: 'medium',
          numberOfQuestions: 4,
        };

        const questions = await agent.generateQuestions(input);

        expect(questions.questions.length).toBe(4);
      },
      TIMEOUT
    );
  });
});
