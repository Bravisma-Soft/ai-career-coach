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
  type: ResumeType;
  isMaster: boolean;
  version: number;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  personalInfo: ResumePersonalInfo;
  summary: string;
  experience: ResumeExperience[];
  education: ResumeEducation[];
  skills: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateResumeData {
  name: string;
  type: ResumeType;
  file: File;
}

export interface UpdateResumeData {
  name?: string;
  personalInfo?: ResumePersonalInfo;
  summary?: string;
  experience?: ResumeExperience[];
  education?: ResumeEducation[];
  skills?: string[];
}
