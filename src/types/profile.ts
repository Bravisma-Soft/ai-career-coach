export interface Experience {
  id: string;
  company: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string | null;
  current: boolean;
  description: string;
  achievements: string[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  location: string;
  startDate: string;
  endDate: string | null;
  current: boolean;
  gpa?: string;
  description?: string;
}

export interface Skill {
  id: string;
  name: string;
  category: 'technical' | 'soft' | 'language' | 'tool';
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
}

export interface UserProfile {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phone?: string;
  location?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  photoUrl?: string;
  headline?: string;
  summary?: string;
  yearsOfExperience?: number;
  targetRoles: string[];
  targetIndustries: string[];
  targetLocations: string[];
  salaryMin?: number;
  salaryMax?: number;
  workAuthorization?: string;
  noticePeriod?: string;
  openToRemote: boolean;
  experiences: Experience[];
  educations: Education[];
  skills: Skill[];
  certifications: Certification[];
  createdAt: string;
  updatedAt: string;
}

export interface NotificationSettings {
  emailNotifications: {
    applicationUpdates: boolean;
    interviewReminders: boolean;
    jobMatches: boolean;
    weeklyDigest: boolean;
  };
  pushNotifications: {
    applicationUpdates: boolean;
    interviewReminders: boolean;
    jobMatches: boolean;
    weeklyDigest: boolean;
  };
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'connections';
  dataRetention: 'standard' | 'extended';
}
