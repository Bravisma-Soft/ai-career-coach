import { Resume } from '@prisma/client';
import { ParsedResumeData } from '@/ai/prompts/resume-parser.prompt';

/**
 * Serialized Resume DTO for API responses
 * Flattens parsedData fields to top-level for frontend consumption
 */
export interface SerializedResume {
  id: string;
  userId: string;
  name: string; // Maps to title
  fileName?: string; // Original file name (optional for backwards compatibility)
  type: 'master' | 'tailored' | 'version'; // Derived from isPrimary
  isMaster: boolean; // Maps to isPrimary
  version: number;
  fileUrl: string;
  fileType: string; // Maps to mimeType
  fileSize: number;
  rawText?: string;
  parsedData?: any; // Keep raw parsedData for debugging

  // Flattened parsed data fields (from parsedData JSON)
  personalInfo?: {
    fullName?: string;
    email?: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    website?: string;
  };
  summary?: string;
  experience?: Array<{
    id: string;
    company: string;
    position: string;
    location: string;
    startDate: string;
    endDate: string | null;
    current: boolean;
    description: string[];
  }>;
  education?: Array<{
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
  skills?: string[];

  createdAt: string;
  updatedAt: string;
}

/**
 * Serialize a Resume model to the API response format
 */
export function serializeResume(resume: Resume): SerializedResume {
  const parsedData = resume.parsedData as ParsedResumeData | null;

  // Transform parsed experience data
  const experience = parsedData?.experiences?.map((exp, index) => {
    const result = {
      id: `exp-${index}`,
      company: exp.company || '',
      position: exp.position || '',
      location: exp.location || '',
      startDate: exp.startDate || '',
      endDate: exp.endDate || null,
      current: exp.isCurrent || false,
      description: exp.achievements || [],
    };
    return result;
  });

  // Transform parsed education data
  const education = parsedData?.educations?.map((edu, index) => ({
    id: `edu-${index}`,
    institution: edu.institution || '',
    degree: edu.degree || '',
    field: edu.fieldOfStudy || '',
    location: edu.location || '',
    startDate: edu.startDate || '',
    endDate: edu.endDate || null,
    current: edu.isCurrent || false,
    gpa: edu.gpa,
  }));

  // Transform parsed skills data
  const skills = parsedData?.skills?.map(skill => skill.name) || [];

  // Transform personal info
  const personalInfo = parsedData?.personalInfo ? {
    fullName: parsedData.personalInfo.name || '',
    email: parsedData.personalInfo.email || '',
    phone: parsedData.personalInfo.phone || '',
    location: parsedData.personalInfo.location || '',
    linkedin: parsedData.personalInfo.linkedinUrl,
    website: parsedData.personalInfo.portfolioUrl,
  } : undefined;

  return {
    id: resume.id,
    userId: resume.userId,
    name: resume.title,
    fileName: resume.fileName,
    type: resume.isPrimary ? 'master' : 'version',
    isMaster: resume.isPrimary,
    version: resume.version,
    fileUrl: resume.fileUrl,
    fileType: resume.mimeType,
    fileSize: resume.fileSize,
    rawText: resume.rawText || undefined,
    parsedData: resume.parsedData || undefined,

    // Flattened parsed data
    personalInfo,
    summary: parsedData?.summary,
    experience,
    education,
    skills: skills.length > 0 ? skills : undefined,

    createdAt: resume.createdAt.toISOString(),
    updatedAt: resume.updatedAt.toISOString(),
  };
}

/**
 * Serialize multiple resumes
 */
export function serializeResumes(resumes: Resume[]): SerializedResume[] {
  return resumes.map(serializeResume);
}
