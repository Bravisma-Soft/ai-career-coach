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

export type AITask = 'tailoring' | 'cover-letter' | null;

export interface AIProgress {
  message: string;
  progress: number;
}
