import { UserProfile, Experience, Education, Skill, Certification, NotificationSettings, PrivacySettings } from '@/types/profile';

// Mock data
const mockProfile: UserProfile = {
  id: 'profile-1',
  userId: 'test-user-1',
  fullName: 'Test User',
  email: 'test@example.com',
  phone: '+1 (555) 123-4567',
  location: 'San Francisco, CA',
  linkedinUrl: 'https://linkedin.com/in/testuser',
  portfolioUrl: 'https://testuser.dev',
  photoUrl: '',
  headline: 'Senior Software Engineer | Full Stack Developer',
  summary: 'Passionate software engineer with 5+ years of experience building scalable web applications. Specialized in React, Node.js, and cloud technologies.',
  yearsOfExperience: 5,
  targetRoles: ['Senior Software Engineer', 'Tech Lead', 'Engineering Manager'],
  targetIndustries: ['Technology', 'Fintech', 'Healthcare'],
  targetLocations: ['San Francisco, CA', 'New York, NY', 'Remote'],
  salaryMin: 150000,
  salaryMax: 200000,
  workAuthorization: 'US Citizen',
  noticePeriod: '2 weeks',
  openToRemote: true,
  experiences: [
    {
      id: 'exp-1',
      company: 'Tech Corp',
      title: 'Senior Software Engineer',
      location: 'San Francisco, CA',
      startDate: '2021-01',
      endDate: null,
      current: true,
      description: 'Leading development of customer-facing applications',
      achievements: [
        'Increased application performance by 40%',
        'Led team of 5 engineers',
        'Implemented CI/CD pipeline',
      ],
    },
  ],
  educations: [
    {
      id: 'edu-1',
      institution: 'State University',
      degree: 'Bachelor of Science',
      field: 'Computer Science',
      location: 'Berkeley, CA',
      startDate: '2015-09',
      endDate: '2019-05',
      current: false,
      gpa: '3.8',
    },
  ],
  skills: [
    { id: 'skill-1', name: 'React', category: 'technical', proficiency: 'expert' },
    { id: 'skill-2', name: 'TypeScript', category: 'technical', proficiency: 'advanced' },
    { id: 'skill-3', name: 'Leadership', category: 'soft', proficiency: 'advanced' },
  ],
  certifications: [
    {
      id: 'cert-1',
      name: 'AWS Solutions Architect',
      issuer: 'Amazon Web Services',
      issueDate: '2022-06',
      expiryDate: '2025-06',
      credentialId: 'AWS-12345',
      credentialUrl: 'https://aws.amazon.com/verify/12345',
    },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockNotificationSettings: NotificationSettings = {
  emailNotifications: {
    applicationUpdates: true,
    interviewReminders: true,
    jobMatches: true,
    weeklyDigest: false,
  },
  pushNotifications: {
    applicationUpdates: true,
    interviewReminders: true,
    jobMatches: false,
    weeklyDigest: false,
  },
};

const mockPrivacySettings: PrivacySettings = {
  profileVisibility: 'public',
  dataRetention: 'standard',
};

export const profileService = {
  fetchProfile: async (): Promise<UserProfile> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return mockProfile;
  },

  updateProfile: async (data: Partial<UserProfile>): Promise<UserProfile> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { ...mockProfile, ...data };
  },

  uploadPhoto: async (file: File): Promise<string> => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return URL.createObjectURL(file);
  },

  addExperience: async (data: Omit<Experience, 'id'>): Promise<Experience> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { ...data, id: `exp-${Date.now()}` };
  },

  updateExperience: async (id: string, data: Partial<Experience>): Promise<Experience> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const experience = mockProfile.experiences.find((e) => e.id === id);
    return { ...experience!, ...data };
  },

  deleteExperience: async (id: string): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
  },

  addEducation: async (data: Omit<Education, 'id'>): Promise<Education> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { ...data, id: `edu-${Date.now()}` };
  },

  updateEducation: async (id: string, data: Partial<Education>): Promise<Education> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const education = mockProfile.educations.find((e) => e.id === id);
    return { ...education!, ...data };
  },

  deleteEducation: async (id: string): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
  },

  addSkill: async (data: Omit<Skill, 'id'>): Promise<Skill> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return { ...data, id: `skill-${Date.now()}` };
  },

  deleteSkill: async (id: string): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
  },

  addCertification: async (data: Omit<Certification, 'id'>): Promise<Certification> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { ...data, id: `cert-${Date.now()}` };
  },

  updateCertification: async (id: string, data: Partial<Certification>): Promise<Certification> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const certification = mockProfile.certifications.find((c) => c.id === id);
    return { ...certification!, ...data };
  },

  deleteCertification: async (id: string): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
  },

  fetchNotificationSettings: async (): Promise<NotificationSettings> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockNotificationSettings;
  },

  updateNotificationSettings: async (settings: NotificationSettings): Promise<NotificationSettings> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return settings;
  },

  fetchPrivacySettings: async (): Promise<PrivacySettings> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockPrivacySettings;
  },

  updatePrivacySettings: async (settings: PrivacySettings): Promise<PrivacySettings> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return settings;
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
  },

  exportData: async (): Promise<Blob> => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const data = JSON.stringify(mockProfile, null, 2);
    return new Blob([data], { type: 'application/json' });
  },

  deleteAccount: async (): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  },
};
