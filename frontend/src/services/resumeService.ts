import { apiClient } from '@/lib/api';
import { Resume, CreateResumeData, UpdateResumeData } from '@/types/resume';

// Helper function to map backend resume to frontend Resume type
const mapBackendResumeToFrontend = (backendResume: any): Resume => {
  try {
    // Determine file type from mimeType or fileName
    let type: 'master' | 'tailored' | 'version' = 'version';
    if (backendResume.isPrimary) {
      type = 'master';
    } else if (backendResume.name?.startsWith('Tailored -') || backendResume.title?.startsWith('Tailored -')) {
      type = 'tailored';
    }

    // Extract file extension for display
    const fileExtension = backendResume.fileName?.split('.').pop()?.toLowerCase() ||
                          backendResume.mimeType?.split('/').pop() || 'file';

    // Check if parsedData contains an error
    const hasParseError = backendResume.parsedData &&
                          typeof backendResume.parsedData === 'object' &&
                          'error' in backendResume.parsedData;

    // Safely map skills
    let skills: string[] | undefined = undefined;
    if (!hasParseError && backendResume.parsedData?.skills && Array.isArray(backendResume.parsedData.skills)) {
      skills = backendResume.parsedData.skills.map((s: any) => {
        if (typeof s === 'string') return s;
        if (s && typeof s === 'object' && s.name) return s.name;
        return String(s);
      });
    }

    // Map experiences to match frontend interface
    // Check both top-level (from serializer) and parsedData (legacy)
    let experiences: any[] | undefined = undefined;
    const expSource = backendResume.experience || backendResume.parsedData?.experiences;
    if (!hasParseError && expSource && Array.isArray(expSource)) {
      experiences = expSource.map((exp: any) => ({
        ...exp,
        id: exp.id || `${exp.company}-${exp.position}`.toLowerCase().replace(/\s+/g, '-'),
        current: exp.isCurrent || exp.current || false,
        // Convert description string to array if needed
        description: typeof exp.description === 'string'
          ? exp.description.split('\n').filter((line: string) => line.trim())
          : Array.isArray(exp.description)
          ? exp.description
          : []
      }));
    }

    // Map educations to match frontend interface
    // Check both top-level (from serializer) and parsedData (legacy)
    let educations: any[] | undefined = undefined;
    const eduSource = backendResume.education || backendResume.parsedData?.educations;
    if (!hasParseError && eduSource && Array.isArray(eduSource)) {
      educations = eduSource.map((edu: any) => ({
        ...edu,
        id: edu.id || `${edu.institution}-${edu.degree}`.toLowerCase().replace(/\s+/g, '-'),
        current: edu.isCurrent || edu.current || false,
        field: edu.fieldOfStudy || edu.field || ''
      }));
    }

    return {
      id: backendResume.id,
      userId: backendResume.userId,
      name: backendResume.name || backendResume.title, // Backend serializer returns 'name', fallback to 'title'
      fileName: backendResume.fileName, // Add missing fileName field
      type: type,
      isMaster: backendResume.isPrimary,
      version: backendResume.version,
      fileUrl: backendResume.fileUrl,
      fileType: backendResume.mimeType || backendResume.fileType, // Accept both mimeType and fileType
      fileSize: backendResume.fileSize,
      rawText: backendResume.rawText,
      parsedData: hasParseError ? backendResume.parsedData : undefined, // Preserve error
      // Check both top-level (from serializer) and parsedData (legacy)
      personalInfo: hasParseError ? undefined : (backendResume.personalInfo || backendResume.parsedData?.personalInfo),
      summary: hasParseError ? undefined : (backendResume.summary || backendResume.parsedData?.summary),
      experience: experiences,
      education: educations,
      skills: skills,
      hasAnalysis: backendResume.hasAnalysis, // Whether resume has any analysis
      createdAt: backendResume.createdAt,
      updatedAt: backendResume.updatedAt,
    };
  } catch (error) {
    console.error('Error mapping backend resume:', error, backendResume);
    throw error;
  }
};

export const resumeService = {
  fetchResumes: async (): Promise<Resume[]> => {
    try {
      const response = await apiClient.get<any>('/resumes');

      // Backend returns: { success: true, data: [...], pagination: {...} }
      let resumes = [];
      if (response.data.success && Array.isArray(response.data.data)) {
        // Success response with data array
        resumes = response.data.data;
      } else if (response.data.data && response.data.data.resumes) {
        // Paginated response: { data: { resumes: [...], pagination: {...} } }
        resumes = response.data.data.resumes;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        // Array in data: { data: [...] }
        resumes = response.data.data;
      } else if (Array.isArray(response.data)) {
        // Direct array: [...]
        resumes = response.data;
      }

      return resumes.map((r: any) => {
        try {
          return mapBackendResumeToFrontend(r);
        } catch (error) {
          console.error('Failed to map resume:', r, error);
          // Skip this resume if mapping fails
          return null;
        }
      }).filter((r: any) => r !== null);
    } catch (error) {
      console.error('Failed to fetch resumes:', error);
      throw error;
    }
  },

  uploadResume: async (data: CreateResumeData): Promise<Resume> => {
    const formData = new FormData();
    formData.append('resume', data.file);  // Backend expects 'resume' not 'file'
    formData.append('title', data.name);   // Backend expects 'title' not 'name'
    if (data.isPrimary) {
      formData.append('isPrimary', 'true');
    }

    const response = await apiClient.post<any>('/resumes/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    // Backend wraps response in { success, data: { resume } }
    const backendResume = response.data.data?.resume || response.data.resume || response.data;
    return mapBackendResumeToFrontend(backendResume);
  },

  parseResume: async (resumeId: string): Promise<Resume> => {
    const response = await apiClient.post<any>(`/resumes/${resumeId}/parse`);
    const backendResume = response.data.data?.resume || response.data.resume || response.data;
    return mapBackendResumeToFrontend(backendResume);
  },

  updateResume: async (id: string, data: UpdateResumeData): Promise<Resume> => {
    const response = await apiClient.put<any>(`/resumes/${id}`, data);
    const backendResume = response.data.data?.resume || response.data.resume || response.data;
    return mapBackendResumeToFrontend(backendResume);
  },

  deleteResume: async (id: string): Promise<void> => {
    await apiClient.delete(`/resumes/${id}`);
  },

  downloadResume: async (id: string): Promise<Blob> => {
    const response = await apiClient.get(`/resumes/${id}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  setMasterResume: async (id: string): Promise<Resume> => {
    const response = await apiClient.patch<any>(`/resumes/${id}/set-master`);
    const backendResume = response.data.data?.resume || response.data.resume || response.data;
    return mapBackendResumeToFrontend(backendResume);
  },
};
