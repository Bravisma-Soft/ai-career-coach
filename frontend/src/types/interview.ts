export type InterviewType =
  | 'PHONE_SCREEN'
  | 'VIDEO_CALL'
  | 'IN_PERSON'
  | 'TECHNICAL'
  | 'BEHAVIORAL'
  | 'PANEL'
  | 'FINAL'
  | 'OTHER';

export type InterviewStatus =
  | 'PENDING'
  | 'PASSED'
  | 'FAILED'
  | 'CANCELLED'
  | 'RESCHEDULED'
  | 'NO_SHOW';

export interface Interviewer {
  name?: string;
  title?: string;
  linkedInUrl?: string;
  background?: string; // AI-generated research
}

export interface Interview {
  id: string;
  jobId: string;
  companyName: string;
  jobTitle: string;
  date: string; // ISO string - maps to scheduledAt
  type: InterviewType;
  status: InterviewStatus; // maps to outcome
  interviewer?: Interviewer; // First interviewer from interviewers array
  interviewers?: Interviewer[]; // Full array from backend
  duration: number; // minutes
  location?: string;
  locationOrLink?: string; // Legacy field, maps to meetingUrl or location
  meetingUrl?: string;
  notes?: string;
  questions?: string[]; // AI-generated questions (from aiQuestions)
  questionsToAsk?: string[]; // AI-generated questions to ask (from aiQuestionsToAsk)
  createdAt: string;
  updatedAt: string;
}

export interface CreateInterviewData {
  jobId: string;
  scheduledAt: string; // ISO string
  type: InterviewType;
  interviewers?: Interviewer[];
  duration?: number;
  location?: string;
  meetingUrl?: string;
  notes?: string;
}

export interface UpdateInterviewData extends Partial<CreateInterviewData> {
  status?: InterviewStatus;
}

export interface MockInterviewSession {
  id: string;
  interviewId: string;
  startedAt: string;
  endedAt?: string;
  currentQuestionIndex: number;
  questions: MockQuestion[];
  responses: MockResponse[];
  isActive: boolean;
}

export interface MockQuestion {
  id: string;
  text: string;
  category: 'behavioral' | 'technical' | 'general';
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface MockResponse {
  questionId: string;
  answer: string;
  score: number; // 0-100
  feedback: string;
  strengths: string[];
  improvements: string[];
  submittedAt: string;
}

export interface MockInterviewResult {
  sessionId: string;
  interviewId?: string; // For navigation back to interview
  overallScore: number; // 0-100
  strengths: string[];
  improvements: string[];
  questionResults: Array<{
    question: MockQuestion;
    response: MockResponse;
  }>;
  generalAdvice: string[];
  completedAt: string;
}
