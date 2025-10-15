import { apiClient } from '@/lib/api';
import { TailoredResume, CoverLetter } from '@/types/ai';
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
   * STILL USING MOCK DATA - TO BE IMPLEMENTED
   */
  generateCoverLetter: async (
    resume: Resume,
    job: Job,
    tone: 'professional' | 'enthusiastic' | 'formal',
    notes: string,
    onProgress: (message: string, progress: number) => void
  ): Promise<CoverLetter> => {
    // Mock implementation - will be replaced with real API call later
    onProgress('Analyzing your background...', 25);
    await delay(1000);

    onProgress('Crafting opening paragraph...', 50);
    await delay(1500);

    onProgress('Highlighting relevant experience...', 75);
    await delay(1500);

    onProgress('Finalizing your cover letter...', 95);
    await delay(500);

    const toneIntros = {
      professional: `I am writing to express my strong interest in the ${job.title} position at ${job.company}.`,
      enthusiastic: `I am thrilled to apply for the ${job.title} position at ${job.company}!`,
      formal: `Dear Hiring Manager,\n\nI wish to formally submit my application for the ${job.title} position at ${job.company}.`
    };

    const content = `${toneIntros[tone]}

With ${resume.experience.length}+ years of experience in ${resume.experience[0]?.position || 'the field'}, I am confident that my background aligns perfectly with the requirements for this role. My expertise in ${resume.skills.slice(0, 3).join(', ')} has consistently enabled me to deliver exceptional results.

${resume.summary}

In my most recent role at ${resume.experience[0]?.company || 'my current company'}, I have successfully:
${resume.experience[0]?.description.slice(0, 3).map(desc => `• ${desc}`).join('\n') || '• Delivered high-impact projects'}

${notes ? `Additionally, ${notes}\n\n` : ''}I am particularly drawn to ${job.company} because of your commitment to innovation and excellence. I am excited about the opportunity to contribute to your team and help drive success in the ${job.title} role.

Thank you for considering my application. I look forward to the opportunity to discuss how my skills and experience can benefit ${job.company}.

Sincerely,
${resume.personalInfo.fullName}`;

    return {
      jobId: job.id,
      resumeId: resume.id,
      tone,
      content,
      createdAt: new Date().toISOString()
    };
  }
};
