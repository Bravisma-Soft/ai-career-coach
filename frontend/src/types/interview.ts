export type InterviewType = 
  | 'Phone' 
  | 'Video' 
  | 'Onsite' 
  | 'Technical' 
  | 'Behavioral' 
  | 'Panel';

export type InterviewStatus = 
  | 'scheduled' 
  | 'completed' 
  | 'cancelled';

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
  date: string; // ISO string
  type: InterviewType;
  status: InterviewStatus;
  interviewer?: Interviewer;
  duration: number; // minutes
  locationOrLink: string;
  notes?: string;
  questions?: string[]; // AI-generated questions
  questionsToAsk?: string[]; // AI-generated questions to ask
  createdAt: string;
  updatedAt: string;
}

export interface CreateInterviewData {
  jobId: string;
  date: string;
  type: InterviewType;
  interviewer?: Partial<Interviewer>;
  duration: number;
  locationOrLink: string;
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
