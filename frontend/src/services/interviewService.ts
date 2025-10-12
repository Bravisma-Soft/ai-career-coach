import { 
  Interview, 
  CreateInterviewData, 
  UpdateInterviewData,
  MockInterviewSession,
  MockInterviewResult,
  MockQuestion,
  MockResponse
} from '@/types/interview';

// Mock data
const mockInterviews: Interview[] = [
  {
    id: '1',
    jobId: 'job-1',
    companyName: 'TechCorp',
    jobTitle: 'Senior Frontend Developer',
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'Video',
    status: 'scheduled',
    interviewer: {
      name: 'Sarah Johnson',
      title: 'Engineering Manager',
      linkedInUrl: 'https://linkedin.com/in/sarahjohnson',
    },
    duration: 60,
    locationOrLink: 'https://zoom.us/j/123456789',
    notes: 'Prepare React and TypeScript examples',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

let mockData = [...mockInterviews];

export const interviewService = {
  fetchInterviews: async (): Promise<Interview[]> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return mockData;
  },

  createInterview: async (data: CreateInterviewData): Promise<Interview> => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    // Find job details from the jobId (you'd fetch this from jobs store/service)
    const newInterview: Interview = {
      id: `interview-${Date.now()}`,
      ...data,
      companyName: 'Sample Company', // Would come from job data
      jobTitle: 'Sample Position', // Would come from job data
      status: 'scheduled',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    mockData.push(newInterview);
    return newInterview;
  },

  updateInterview: async (id: string, data: UpdateInterviewData): Promise<Interview> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    const index = mockData.findIndex((i) => i.id === id);
    if (index === -1) throw new Error('Interview not found');
    
    mockData[index] = {
      ...mockData[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    
    return mockData[index];
  },

  deleteInterview: async (id: string): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    mockData = mockData.filter((i) => i.id !== id);
  },

  prepareInterview: async (id: string): Promise<{
    questions: string[];
    questionsToAsk: string[];
    interviewerBackground?: string;
  }> => {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    return {
      questions: [
        'Tell me about yourself and your experience with frontend development.',
        'Describe a challenging technical problem you solved recently.',
        'How do you approach code reviews and collaboration with team members?',
        'What are your thoughts on testing strategies for React applications?',
        'Where do you see yourself in 5 years?',
      ],
      questionsToAsk: [
        'What does a typical day look like for someone in this role?',
        'How does the team approach professional development and learning?',
        'What are the biggest challenges the team is currently facing?',
        'How do you measure success in this position?',
        'What is the team culture like?',
      ],
      interviewerBackground: 'Sarah Johnson has 10+ years in software engineering, currently leading a team of 8 developers. She previously worked at Microsoft and Google, focusing on frontend architecture and team leadership.',
    };
  },

  startMockInterview: async (interviewId: string): Promise<MockInterviewSession> => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    const mockQuestions: MockQuestion[] = [
      {
        id: 'q1',
        text: 'Tell me about a time when you had to learn a new technology quickly. How did you approach it?',
        category: 'behavioral',
        difficulty: 'medium',
      },
      {
        id: 'q2',
        text: 'Explain the concept of closures in JavaScript and provide a practical example.',
        category: 'technical',
        difficulty: 'medium',
      },
      {
        id: 'q3',
        text: 'Describe a situation where you had to deal with conflicting priorities. How did you handle it?',
        category: 'behavioral',
        difficulty: 'medium',
      },
      {
        id: 'q4',
        text: 'What is your approach to debugging complex issues in production?',
        category: 'technical',
        difficulty: 'hard',
      },
      {
        id: 'q5',
        text: 'How do you stay updated with the latest trends and technologies in web development?',
        category: 'general',
        difficulty: 'easy',
      },
    ];
    
    return {
      id: `session-${Date.now()}`,
      interviewId,
      startedAt: new Date().toISOString(),
      currentQuestionIndex: 0,
      questions: mockQuestions,
      responses: [],
      isActive: true,
    };
  },

  submitMockAnswer: async (
    sessionId: string, 
    answer: string
  ): Promise<MockResponse> => {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    // Mock AI evaluation
    const score = Math.floor(Math.random() * 30) + 70; // 70-100
    
    return {
      questionId: `q${Math.floor(Math.random() * 5) + 1}`,
      answer,
      score,
      feedback: 'Great answer! You demonstrated clear communication and relevant experience.',
      strengths: [
        'Clear structure using STAR method',
        'Specific examples provided',
        'Good technical understanding',
      ],
      improvements: [
        'Could provide more metrics or outcomes',
        'Consider adding a reflection on lessons learned',
      ],
      submittedAt: new Date().toISOString(),
    };
  },

  getMockResults: async (sessionId: string): Promise<MockInterviewResult> => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Mock results
    return {
      sessionId,
      overallScore: 82,
      strengths: [
        'Strong technical knowledge and clear explanations',
        'Good use of real-world examples',
        'Professional communication style',
        'Demonstrated problem-solving abilities',
      ],
      improvements: [
        'Practice providing more concise answers',
        'Include more quantifiable achievements',
        'Prepare more questions about company culture',
        'Work on reducing filler words',
      ],
      questionResults: [],
      generalAdvice: [
        'Research the company culture and recent news before the interview',
        'Prepare 3-4 strong questions to ask the interviewer',
        'Practice the STAR method for behavioral questions',
        'Have specific examples ready that showcase your skills',
      ],
      completedAt: new Date().toISOString(),
    };
  },
};
