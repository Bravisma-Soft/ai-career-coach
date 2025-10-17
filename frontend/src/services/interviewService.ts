import { apiClient } from '@/lib/api';
import {
  Interview,
  CreateInterviewData,
  UpdateInterviewData,
  MockInterviewSession,
  MockInterviewResult,
  MockQuestion,
  MockResponse
} from '@/types/interview';

/**
 * Map backend interview response to frontend Interview type
 */
function mapBackendInterview(backendInterview: any): Interview {
  const interviewers = backendInterview.interviewers || [];
  const firstInterviewer = Array.isArray(interviewers) && interviewers.length > 0
    ? interviewers[0]
    : null;

  return {
    id: backendInterview.id,
    jobId: backendInterview.jobId,
    companyName: backendInterview.job?.company || 'Unknown Company',
    jobTitle: backendInterview.job?.title || 'Unknown Position',
    date: backendInterview.scheduledAt,
    type: backendInterview.interviewType,
    status: backendInterview.outcome,
    interviewer: firstInterviewer,
    interviewers: interviewers,
    duration: backendInterview.duration || 60,
    location: backendInterview.location,
    meetingUrl: backendInterview.meetingUrl,
    locationOrLink: backendInterview.meetingUrl || backendInterview.location || '',
    notes: backendInterview.notes,
    questions: backendInterview.aiQuestions || [],
    questionsToAsk: backendInterview.aiQuestionsToAsk || [],
    createdAt: backendInterview.createdAt,
    updatedAt: backendInterview.updatedAt,
  };
}

export const interviewService = {
  /**
   * Fetch all interviews for the current user
   */
  fetchInterviews: async (): Promise<Interview[]> => {
    const response = await apiClient.get('/interviews');
    // Backend returns paginated response: { success, data: [...], pagination }
    const backendInterviews = response.data.data;

    if (!Array.isArray(backendInterviews)) {
      console.error('Unexpected response format:', response.data);
      return [];
    }

    return backendInterviews.map(mapBackendInterview);
  },

  /**
   * Create a new interview
   */
  createInterview: async (data: CreateInterviewData): Promise<Interview> => {
    const response = await apiClient.post('/interviews', data);
    return mapBackendInterview(response.data.data.interview);
  },

  /**
   * Update an existing interview
   */
  updateInterview: async (id: string, data: UpdateInterviewData): Promise<Interview> => {
    const response = await apiClient.put(`/interviews/${id}`, data);
    return mapBackendInterview(response.data.data.interview);
  },

  /**
   * Delete an interview
   */
  deleteInterview: async (id: string): Promise<void> => {
    await apiClient.delete(`/interviews/${id}`);
  },

  /**
   * Get interviews by job ID
   */
  getInterviewsByJob: async (jobId: string): Promise<Interview[]> => {
    const response = await apiClient.get(`/interviews/job/${jobId}`);
    const interviews = response.data.data;

    if (!Array.isArray(interviews)) {
      console.error('Unexpected response format for job interviews:', response.data);
      return [];
    }

    return interviews.map(mapBackendInterview);
  },

  /**
   * Prepare interview - Generate AI-powered questions and interviewer research
   * This is called when user clicks "Research Interviewer & Generate Questions"
   */
  prepareInterview: async (id: string): Promise<{
    questions: string[];
    questionsToAsk: string[];
    interviewerBackground?: string;
    interviewContext?: string;
  }> => {
    const response = await apiClient.post(`/interviews/${id}/prepare`);
    return response.data.data;
  },

  /**
   * Start mock interview session
   * Creates a new mock interview session with AI-generated questions
   */
  startMockInterview: async (
    interviewId: string,
    options?: {
      difficulty?: 'easy' | 'medium' | 'hard';
      numberOfQuestions?: number;
    }
  ): Promise<MockInterviewSession> => {
    const response = await apiClient.post('/mock-interviews', {
      interviewId,
      difficulty: options?.difficulty || 'medium',
      numberOfQuestions: options?.numberOfQuestions || 5,
    });

    const session = response.data.data.session;
    const history = session.conversationHistory || {};
    const questions = history.questions || [];

    return {
      id: session.id,
      interviewId: session.interviewId,
      startedAt: session.startedAt,
      endedAt: session.completedAt,
      currentQuestionIndex: 0,
      questions: questions.map((q: any) => ({
        id: q.id,
        text: q.question,
        category: q.category,
        difficulty: q.difficulty,
      })),
      responses: [],
      isActive: !session.isCompleted,
    };
  },

  /**
   * Submit answer to a mock interview question
   */
  submitMockAnswer: async (
    sessionId: string,
    questionId: string,
    answer: string
  ): Promise<MockResponse> => {
    const response = await apiClient.post(`/mock-interviews/${sessionId}/answer`, {
      questionId,
      answer,
    });

    const evaluation = response.data.data.evaluation;

    return {
      questionId,
      answer,
      score: evaluation.score,
      feedback: evaluation.detailedFeedback,
      strengths: evaluation.strengths,
      improvements: evaluation.improvements,
      submittedAt: new Date().toISOString(),
    };
  },

  /**
   * Complete mock interview and get final results
   */
  getMockResults: async (sessionId: string): Promise<MockInterviewResult> => {
    const response = await apiClient.post(`/mock-interviews/${sessionId}/complete`);

    const session = response.data.data.session;
    const history = session.conversationHistory || {};
    const answers = history.answers || [];
    const questions = history.questions || [];

    return {
      sessionId: session.id,
      interviewId: session.interviewId, // Include interviewId for navigation
      overallScore: session.overallScore || 0,
      strengths: session.strengths || [],
      improvements: session.areasToImprove || [],
      questionResults: answers.map((a: any) => {
        const question = questions.find((q: any) => q.id === a.questionId);
        return {
          question: {
            id: a.questionId,
            text: a.question,
            category: a.category,
            difficulty: question?.difficulty || 'medium',
          },
          response: {
            questionId: a.questionId,
            answer: a.answer,
            score: a.evaluation.score,
            feedback: a.evaluation.detailedFeedback,
            strengths: a.evaluation.strengths,
            improvements: a.evaluation.improvements,
            submittedAt: a.submittedAt,
          },
        };
      }),
      generalAdvice: session.aiSuggestions || [],
      completedAt: session.completedAt || new Date().toISOString(),
    };
  },

  /**
   * Get mock interview session by ID
   */
  getMockInterviewSession: async (sessionId: string): Promise<MockInterviewSession> => {
    const response = await apiClient.get(`/mock-interviews/${sessionId}`);

    const session = response.data.data.session;
    const history = session.conversationHistory || {};
    const questions = history.questions || [];
    const answers = history.answers || [];

    return {
      id: session.id,
      interviewId: session.interviewId,
      startedAt: session.startedAt,
      endedAt: session.completedAt,
      currentQuestionIndex: answers.length,
      questions: questions.map((q: any) => ({
        id: q.id,
        text: q.question,
        category: q.category,
        difficulty: q.difficulty,
      })),
      responses: answers.map((a: any) => ({
        questionId: a.questionId,
        answer: a.answer,
        score: a.evaluation.score,
        feedback: a.evaluation.detailedFeedback,
        strengths: a.evaluation.strengths,
        improvements: a.evaluation.improvements,
        submittedAt: a.submittedAt,
      })),
      isActive: !session.isCompleted,
    };
  },

  /**
   * Get all mock interview sessions for a scheduled interview
   */
  getMockInterviewsByInterview: async (interviewId: string) => {
    const response = await apiClient.get(`/mock-interviews/interview/${interviewId}/sessions`);
    return response.data.data.sessions;
  },

  /**
   * Delete a mock interview session
   */
  deleteMockInterview: async (sessionId: string): Promise<void> => {
    await apiClient.delete(`/mock-interviews/${sessionId}`);
  },
};
