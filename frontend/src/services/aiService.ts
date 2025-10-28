import { apiClient } from '@/lib/api';
import { TailoredResume, CoverLetter, ResumeAnalysis } from '@/types/ai';
import { Resume } from '@/types/resume';
import { Job } from '@/types/job';

// Helper delay function for progress updates
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const aiService = {
  /**
   * Tailor resume for a specific job using AI
   * NOW CONNECTED TO REAL BACKEND API
   */
  tailorResume: async (
    resume: Resume,
    job: Job,
    onProgress: (message: string, progress: number) => void
  ): Promise<TailoredResume> => {
    try {
      // Initial progress
      onProgress('Sending resume to AI...', 10);
      await delay(500);

      // Call the real backend API
      const response = await apiClient.post('/ai/resumes/tailor', {
        resumeId: resume.id,
        jobId: job.id,
        focusAreas: [], // Optional: can be added later
      });

      onProgress('Processing AI response...', 80);
      await delay(500);

      // Extract data from backend response
      const data = response.data.data || response.data;

      // Parse the tailored resume content (backend sends it as JSON string)
      let tailoredContent;
      try {
        tailoredContent = typeof data.tailoredResume.content === 'string'
          ? JSON.parse(data.tailoredResume.content)
          : data.tailoredResume.content;
      } catch (parseError) {
        console.error('Failed to parse tailored resume content:', parseError);
        tailoredContent = data.tailoredResume.content;
      }

      onProgress('Finalizing...', 95);
      await delay(300);

      // Map backend response to frontend TailoredResume type
      const result: TailoredResume = {
        originalResumeId: resume.id,
        jobId: job.id,
        matchScore: data.matchScore,
        tailoredContent: {
          personalInfo: {
            fullName: tailoredContent.personalInfo?.name || resume.personalInfo.fullName,
            email: tailoredContent.personalInfo?.email || resume.personalInfo.email,
            phone: tailoredContent.personalInfo?.phone || resume.personalInfo.phone,
            location: tailoredContent.personalInfo?.location || resume.personalInfo.location,
            linkedin: tailoredContent.personalInfo?.linkedinUrl,
            website: tailoredContent.personalInfo?.portfolioUrl || tailoredContent.personalInfo?.websiteUrl,
          },
          summary: tailoredContent.summary || resume.summary,
          experience: (tailoredContent.experiences || []).map((exp: any, index: number) => ({
            id: `exp-${index}`,
            company: exp.company,
            position: exp.position,
            location: exp.location || '',
            startDate: exp.startDate,
            endDate: exp.endDate,
            current: exp.isCurrent || false,
            description: exp.achievements || exp.description || [],
            changes: [], // Changes are tracked separately in the changes array
          })),
          education: (tailoredContent.educations || []).map((edu: any, index: number) => ({
            id: `edu-${index}`,
            institution: edu.institution,
            degree: edu.degree,
            field: edu.fieldOfStudy,
            location: edu.location || '',
            startDate: edu.startDate,
            endDate: edu.endDate,
            current: edu.isCurrent || false,
            gpa: edu.gpa?.toString(),
          })),
          skills: (tailoredContent.skills || []).map((skill: any) =>
            typeof skill === 'string' ? skill : skill.name
          ),
        },
        keywordAlignment: {
          matched: data.keywordOptimizations?.emphasized || [],
          missing: data.keywordOptimizations?.added || [],
        },
        recommendations: data.recommendations || [],
        changes: (data.changes || []).map((change: any) => ({
          section: change.section,
          type: change.type || 'modified',
          description: change.description || change.reason || '',
        })),
      };

      onProgress('Complete!', 100);

      return result;
    } catch (error: any) {
      console.error('AI Tailoring Error:', error);

      // Provide user-friendly error messages
      const errorMessage = error.response?.data?.message || error.message || 'Failed to tailor resume';

      // Check for specific error cases
      if (errorMessage.includes('parsed')) {
        throw new Error('Resume must be parsed before tailoring. Please parse the resume first.');
      } else if (errorMessage.includes('job description')) {
        throw new Error('Job description is too short or missing. Please add a detailed job description.');
      } else if (error.response?.status === 404) {
        throw new Error('Resume or job not found. Please try again.');
      } else if (error.response?.status === 403) {
        throw new Error('You do not have permission to access this resource.');
      } else {
        throw new Error(`AI tailoring failed: ${errorMessage}`);
      }
    }
  },

  /**
   * Generate cover letter using AI
   */
  generateCoverLetter: async (
    resume: Resume,
    job: Job,
    tone: 'professional' | 'enthusiastic' | 'formal',
    notes: string,
    onProgress: (message: string, progress: number) => void
  ): Promise<CoverLetter> => {
    try {
      onProgress('Analyzing your background...', 20);
      await delay(300);

      onProgress('Reviewing job requirements...', 35);
      await delay(300);

      onProgress('Generating cover letter with AI...', 50);

      const response = await apiClient.post('/ai/cover-letters/generate', {
        resumeId: resume.id,
        jobId: job.id,
        tone,
        notes: notes || '',
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to generate cover letter');
      }

      onProgress('Polishing and formatting...', 85);
      await delay(300);

      onProgress('Almost ready...', 95);
      await delay(200);

      const result = response.data.data;

      return {
        jobId: job.id,
        resumeId: resume.id,
        tone: result.tone,
        content: result.coverLetter,
        subject: result.subject,
        keyPoints: result.keyPoints,
        suggestions: result.suggestions,
        wordCount: result.wordCount,
        estimatedReadTime: result.estimatedReadTime,
        createdAt: new Date().toISOString(),
      };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';

      if (error.response?.status === 404) {
        throw new Error('Resume or job not found. Please try again.');
      } else if (error.response?.status === 400) {
        throw new Error(errorMessage);
      } else if (error.response?.status === 403) {
        throw new Error('You do not have permission to access this resource.');
      } else {
        throw new Error(`Cover letter generation failed: ${errorMessage}`);
      }
    }
  },

  /**
   * Get resume analysis by resume ID
   */
  getResumeAnalysis: async (resumeId: string): Promise<ResumeAnalysis | null> => {
    try {
      const response = await apiClient.get(`/ai/resumes/${resumeId}/analyze`);

      if (!response.data.success) {
        // Analysis doesn't exist yet
        return null;
      }

      return response.data.data;
    } catch (error: any) {
      // 404 means analysis doesn't exist yet
      if (error.response?.status === 404) {
        return null;
      }

      console.error('Failed to fetch resume analysis:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch resume analysis');
    }
  },

  /**
   * Trigger or re-analyze resume with optional target role/industry
   */
  analyzeResume: async (
    resumeId: string,
    targetRole?: string,
    targetIndustry?: string
  ): Promise<ResumeAnalysis> => {
    try {
      const response = await apiClient.post(`/ai/resumes/${resumeId}/analyze`, {
        targetRole: targetRole || null,
        targetIndustry: targetIndustry || null,
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to analyze resume');
      }

      return response.data.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';

      if (error.response?.status === 404) {
        throw new Error('Resume not found. Please try again.');
      } else if (error.response?.status === 400) {
        throw new Error(errorMessage);
      } else if (error.response?.status === 403) {
        throw new Error('You do not have permission to access this resource.');
      } else {
        throw new Error(`Resume analysis failed: ${errorMessage}`);
      }
    }
  }
};
