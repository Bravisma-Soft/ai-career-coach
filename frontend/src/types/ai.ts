export interface TailoredResume {
  originalResumeId: string;
  jobId: string;
  matchScore: number;
  tailoredContent: {
    personalInfo: {
      fullName: string;
      email: string;
      phone: string;
      location: string;
      linkedin?: string;
      website?: string;
    };
    summary: string;
    experience: Array<{
      id: string;
      company: string;
      position: string;
      location: string;
      startDate: string;
      endDate: string | null;
      current: boolean;
      description: string[];
      changes?: string[];
    }>;
    education: Array<{
      id: string;
      institution: string;
      degree: string;
      field: string;
      location: string;
      startDate: string;
      endDate: string | null;
      current: boolean;
      gpa?: string;
    }>;
    skills: string[];
  };
  keywordAlignment: {
    matched: string[];
    missing: string[];
  };
  recommendations: string[];
  changes: Array<{
    section: string;
    type: 'added' | 'modified' | 'removed';
    description: string;
  }>;
}

export interface CoverLetter {
  jobId: string;
  resumeId: string;
  tone: 'professional' | 'enthusiastic' | 'formal';
  content: string;
  subject?: string;
  keyPoints?: string[];
  suggestions?: string[];
  wordCount?: number;
  estimatedReadTime?: string;
  createdAt: string;
}

export interface ResumeAnalysis {
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
    summary: {
      score: number | null;
      feedback: string;
      issues: string[];
    };
    experience: {
      score: number | null;
      feedback: string;
      issues: string[];
    };
    education: {
      score: number | null;
      feedback: string;
      issues: string[];
    };
    skills: {
      score: number | null;
      feedback: string;
      issues: string[];
    };
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

export interface JobAnalysis {
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
  salaryInsights: {
    estimatedRange: string;
    marketComparison: string;
    factors: string[];
  };
  applicationTips: string[];
}

export type AITask = 'tailoring' | 'cover-letter' | null;

export interface AIProgress {
  message: string;
  progress: number;
}
