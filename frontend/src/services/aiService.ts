import { TailoredResume, CoverLetter } from '@/types/ai';
import { Resume } from '@/types/resume';
import { Job } from '@/types/job';

// Mock AI service with realistic delays and responses
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const aiService = {
  tailorResume: async (
    resume: Resume,
    job: Job,
    onProgress: (message: string, progress: number) => void
  ): Promise<TailoredResume> => {
    // Simulate AI processing with progress updates
    onProgress('Analyzing job requirements...', 20);
    await delay(1500);
    
    onProgress('Matching your experience...', 40);
    await delay(1500);
    
    onProgress('Optimizing keywords...', 60);
    await delay(1500);
    
    onProgress('Generating personalized content...', 80);
    await delay(1500);
    
    onProgress('Finalizing...', 95);
    await delay(500);

    // Generate mock tailored resume based on job description
    const jobKeywords = job.description.toLowerCase().split(/\s+/)
      .filter(word => word.length > 4)
      .slice(0, 10);

    const matched = resume.skills.filter(skill => 
      jobKeywords.some(keyword => skill.toLowerCase().includes(keyword))
    );
    
    const missing = ['Leadership', 'Project Management', 'Agile'].filter(
      skill => !resume.skills.includes(skill)
    );

    return {
      originalResumeId: resume.id,
      jobId: job.id,
      matchScore: Math.floor(70 + Math.random() * 20), // 70-90%
      tailoredContent: {
        personalInfo: resume.personalInfo,
        summary: `${resume.summary} Proven track record in ${job.jobTitle} with expertise in ${matched.join(', ')}.`,
        experience: resume.experience.map(exp => ({
          ...exp,
          description: [
            ...exp.description,
            `Successfully delivered projects aligned with ${job.companyName}'s requirements`
          ],
          changes: ['Added relevant achievement highlighting job-specific skills']
        })),
        education: resume.education,
        skills: [...resume.skills, ...missing.slice(0, 2)]
      },
      keywordAlignment: {
        matched,
        missing
      },
      recommendations: [
        'Consider adding specific metrics to quantify your achievements',
        'Highlight leadership experience relevant to this role',
        `Include keywords from ${job.companyName}'s job posting`,
        'Expand on technical skills mentioned in the job description'
      ],
      changes: [
        {
          section: 'Summary',
          type: 'modified',
          description: 'Enhanced summary to include job-specific keywords and achievements'
        },
        {
          section: 'Experience',
          type: 'modified',
          description: 'Added relevant accomplishments that match job requirements'
        },
        {
          section: 'Skills',
          type: 'added',
          description: 'Added missing skills that align with the job posting'
        }
      ]
    };
  },

  generateCoverLetter: async (
    resume: Resume,
    job: Job,
    tone: 'professional' | 'enthusiastic' | 'formal',
    notes: string,
    onProgress: (message: string, progress: number) => void
  ): Promise<CoverLetter> => {
    onProgress('Analyzing your background...', 25);
    await delay(1000);
    
    onProgress('Crafting opening paragraph...', 50);
    await delay(1500);
    
    onProgress('Highlighting relevant experience...', 75);
    await delay(1500);
    
    onProgress('Finalizing your cover letter...', 95);
    await delay(500);

    const toneIntros = {
      professional: `I am writing to express my strong interest in the ${job.jobTitle} position at ${job.companyName}.`,
      enthusiastic: `I am thrilled to apply for the ${job.jobTitle} position at ${job.companyName}!`,
      formal: `Dear Hiring Manager,\n\nI wish to formally submit my application for the ${job.jobTitle} position at ${job.companyName}.`
    };

    const content = `${toneIntros[tone]}

With ${resume.experience.length}+ years of experience in ${resume.experience[0]?.position || 'the field'}, I am confident that my background aligns perfectly with the requirements for this role. My expertise in ${resume.skills.slice(0, 3).join(', ')} has consistently enabled me to deliver exceptional results.

${resume.summary}

In my most recent role at ${resume.experience[0]?.company || 'my current company'}, I have successfully:
${resume.experience[0]?.description.slice(0, 3).map(desc => `• ${desc}`).join('\n') || '• Delivered high-impact projects'}

${notes ? `Additionally, ${notes}\n\n` : ''}I am particularly drawn to ${job.companyName} because of your commitment to innovation and excellence. I am excited about the opportunity to contribute to your team and help drive success in the ${job.jobTitle} role.

Thank you for considering my application. I look forward to the opportunity to discuss how my skills and experience can benefit ${job.companyName}.

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
