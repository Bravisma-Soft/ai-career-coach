/**
 * AI API Request/Response Types
 *
 * Type definitions for AI endpoints in the REST API
 */

// =====================================
// RESUME TAILORING
// =====================================

export interface TailorResumeRequest {
  resumeId: string;
  jobId: string;
  focusAreas?: string[];
}

export interface TailorResumeResponse {
  tailoredResume: {
    content: string;
    format: 'markdown' | 'html';
  };
  changes: Array<{
    section: string;
    type: 'added' | 'modified' | 'removed';
    description: string;
    before?: string;
    after?: string;
  }>;
  matchScore: number;
  recommendations: string[];
  keywordOptimizations: {
    added: string[];
    emphasized: string[];
  };
}

// =====================================
// RESUME ANALYSIS
// =====================================

export interface AnalyzeResumeRequest {
  resumeId: string;
  jobId?: string;
  targetRole?: string;
  targetIndustry?: string;
}

export interface AnalyzeResumeResponse {
  id: string;
  resumeId: string;
  jobId: string | null;
  overallScore: number;
  atsScore: number;
  readabilityScore: number;
  summaryScore: number | null;
  experienceScore: number | null;
  educationScore: number | null;
  skillsScore: number | null;
  strengths: string[];
  weaknesses: string[];
  sections: {
    summary: { score: number | null; feedback: string; issues: string[] };
    experience: { score: number | null; feedback: string; issues: string[] };
    education: { score: number | null; feedback: string; issues: string[] };
    skills: { score: number | null; feedback: string; issues: string[] };
  };
  keywordAnalysis: {
    targetRole: string;
    targetIndustry: string;
    matchedKeywords: string[];
    missingKeywords: string[];
    overusedWords: string[];
  };
  atsIssues: string[];
  suggestions: Array<{
    section: string;
    priority: 'high' | 'medium' | 'low';
    issue: string;
    suggestion: string;
    example: {
      before: string;
      after: string;
    };
    impact: string;
  }>;
  targetRole: string | null;
  targetIndustry: string | null;
  createdAt: string;
  updatedAt: string;
}

// =====================================
// COVER LETTER GENERATION
// =====================================

export interface GenerateCoverLetterRequest {
  resumeId: string;
  jobId: string;
  tone?: 'professional' | 'enthusiastic' | 'formal' | 'conversational';
  length?: 'short' | 'medium' | 'long';
  focusPoints?: string[];
}

export interface GenerateCoverLetterResponse {
  coverLetter: string;
  suggestions: string[];
  keyPoints: string[];
  tone: 'professional' | 'enthusiastic' | 'formal' | 'conversational';
  wordCount: number;
  estimatedReadTime: string;
}

// =====================================
// MOCK INTERVIEW
// =====================================

export interface StartMockInterviewRequest {
  jobId: string;
  interviewType: 'behavioral' | 'technical' | 'mixed';
  difficulty?: 'entry' | 'mid' | 'senior';
  numberOfQuestions?: number;
  focusAreas?: string[];
}

export interface StartMockInterviewResponse {
  sessionId: string;
  interviewType: 'behavioral' | 'technical' | 'mixed';
  difficulty: 'entry' | 'mid' | 'senior';
  totalQuestions: number;
  currentQuestion: {
    questionNumber: number;
    question: string;
    category: string;
    tips: string[];
  };
  expiresAt: string;
}

export interface RespondToInterviewRequest {
  answer: string;
}

export interface RespondToInterviewResponse {
  feedback: {
    score: number;
    strengths: string[];
    improvements: string[];
    detailedFeedback: string;
  };
  nextQuestion?: {
    questionNumber: number;
    question: string;
    category: string;
    tips: string[];
  };
  isComplete: boolean;
}

export interface EndMockInterviewResponse {
  summary: {
    overallScore: number;
    totalQuestions: number;
    averageScore: number;
    duration: string;
  };
  performance: {
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
  };
  questionResults: Array<{
    question: string;
    category: string;
    answer: string;
    score: number;
    feedback: string;
  }>;
}

// =====================================
// INTERVIEW PREPARATION
// =====================================

export interface PrepareInterviewRequest {
  jobId: string;
  resumeId?: string;
  focusAreas?: string[];
}

export interface PrepareInterviewResponse {
  commonQuestions: Array<{
    question: string;
    category: 'behavioral' | 'technical' | 'situational' | 'cultural';
    difficulty: 'easy' | 'medium' | 'hard';
    suggestedApproach: string;
    exampleAnswer?: string;
    tips: string[];
  }>;
  companyResearch: {
    about: string;
    culture: string[];
    values: string[];
    recentNews: string[];
    interviewTips: string[];
  };
  starExamples: Array<{
    title: string;
    situation: string;
    task: string;
    action: string;
    result: string;
    applicableQuestions: string[];
  }>;
  technicalTopics?: string[];
  questionsToAsk: string[];
}

// =====================================
// JOB MATCHING
// =====================================

export interface MatchJobsRequest {
  resumeId?: string;
  targetRole?: string;
  targetIndustry?: string;
  minMatchScore?: number;
  limit?: number;
}

export interface MatchJobsResponse {
  matches: Array<{
    jobId: string;
    job: {
      title: string;
      company: string;
      location?: string;
      workMode?: string;
    };
    matchScore: number;
    matchReasons: string[];
    skillsMatch: {
      matched: string[];
      missing: string[];
      percentage: number;
    };
    recommendation: string;
    estimatedFitLevel: 'excellent' | 'good' | 'fair' | 'stretch';
  }>;
  summary: {
    totalAnalyzed: number;
    averageMatchScore: number;
    topSkillGaps: string[];
  };
}

// =====================================
// JOB ANALYSIS
// =====================================

export interface AnalyzeJobRequest {
  jobId: string;
  resumeId?: string;
}

export interface AnalyzeJobResponse {
  analysis: {
    roleLevel: 'entry' | 'mid' | 'senior' | 'lead' | 'executive';
    keyResponsibilities: string[];
    requiredSkills: string[];
    preferredSkills: string[];
    redFlags: string[];
    highlights: string[];
  };
  matchAnalysis?: {
    overallMatch: number;
    skillsMatch: number;
    experienceMatch: number;
    matchReasons: string[];
    gaps: string[];
    recommendations: string[];
  };
  salaryInsights?: {
    estimatedRange: string;
    marketComparison: string;
    factors: string[];
  };
  applicationTips: string[];
}

// =====================================
// COMPANY RESEARCH
// =====================================

export interface ResearchCompanyRequest {
  companyName: string;
  jobId?: string;
}

export interface ResearchCompanyResponse {
  company: {
    name: string;
    description: string;
    industry: string;
    size?: string;
    founded?: string;
    headquarters?: string;
  };
  culture: {
    values: string[];
    workEnvironment: string[];
    employeeReviews: string[];
  };
  recentNews: Array<{
    title: string;
    summary: string;
    date?: string;
    relevance: string;
  }>;
  financials?: {
    status: string;
    growth: string;
    stability: string;
  };
  interviewProcess: {
    stages: string[];
    difficulty: string;
    tips: string[];
  };
  questionsToAsk: string[];
}

// =====================================
// INTERVIEWER RESEARCH
// =====================================

export interface ResearchInterviewerRequest {
  interviewerId: string;
  interviewerName?: string;
  linkedinUrl?: string;
  companyName?: string;
}

export interface ResearchInterviewerResponse {
  interviewer: {
    name: string;
    title?: string;
    department?: string;
    yearsAtCompany?: string;
  };
  background: {
    experience: string[];
    education: string[];
    specializations: string[];
  };
  commonInterests: string[];
  conversationStarters: string[];
  interviewStyle?: {
    type: string;
    focusAreas: string[];
    tips: string[];
  };
  questionsToConsider: string[];
}

// =====================================
// GENERIC AI ERROR RESPONSE
// =====================================

export interface AIErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    type: 'ai_error' | 'validation_error' | 'not_found' | 'rate_limit' | 'internal_error';
    details?: any;
  };
}

// =====================================
// AI USAGE TRACKING
// =====================================

export interface AIUsageMetadata {
  endpoint: string;
  userId: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cost: number;
  duration: number;
  timestamp: Date;
}
