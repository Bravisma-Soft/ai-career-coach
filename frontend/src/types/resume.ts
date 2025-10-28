export type ResumeType = 'master' | 'tailored' | 'version';

export interface ResumeExperience {
  id: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string | null;
  current: boolean;
  description: string[];
}

export interface ResumeEducation {
  id: string;
  institution: string;
  degree: string;
  field: string;
  location: string;
  startDate: string;
  endDate: string | null;
  current: boolean;
  gpa?: string;
}

export interface ResumePersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  website?: string;
}

export interface Resume {
  id: string;
  userId: string;
  name: string;
  fileName?: string;  // Original file name (optional for backwards compatibility)
  type: ResumeType;
  isMaster: boolean;
  version: number;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  rawText?: string;  // Raw text extracted from document
  parsedData?: any;  // Raw parsed data from backend (may contain error)
  personalInfo?: ResumePersonalInfo;  // Optional until parsed
  summary?: string;  // Optional until parsed
  experience?: ResumeExperience[];  // Optional until parsed
  education?: ResumeEducation[];  // Optional until parsed
  skills?: string[];  // Optional until parsed
  hasAnalysis?: boolean;  // Whether AI analysis exists for this resume
  createdAt: string;
  updatedAt: string;
}

export interface CreateResumeData {
  name: string;
  type: ResumeType;
  file: File;
  isPrimary?: boolean;
}

export interface UpdateResumeData {
  name?: string;
  personalInfo?: ResumePersonalInfo;
  summary?: string;
  experience?: ResumeExperience[];
  education?: ResumeEducation[];
  skills?: string[];
}
