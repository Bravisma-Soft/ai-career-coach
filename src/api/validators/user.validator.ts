import { z } from 'zod';

// Profile validation
export const updateProfileSchema = z.object({
  body: z.object({
    phone: z.string().optional(),
    bio: z.string().max(5000).optional(),
    location: z.string().max(255).optional(),
    city: z.string().max(100).optional(),
    state: z.string().max(100).optional(),
    country: z.string().max(100).optional(),
    zipCode: z.string().max(20).optional(),
    linkedinUrl: z.string().url().optional().or(z.literal('')),
    githubUrl: z.string().url().optional().or(z.literal('')),
    portfolioUrl: z.string().url().optional().or(z.literal('')),
    websiteUrl: z.string().url().optional().or(z.literal('')),
    currentJobTitle: z.string().max(200).optional(),
    currentCompany: z.string().max(200).optional(),
    yearsOfExperience: z.number().int().min(0).max(100).optional(),
    desiredJobTitle: z.string().max(200).optional(),
    desiredSalaryMin: z.number().int().min(0).optional(),
    desiredSalaryMax: z.number().int().min(0).optional(),
    desiredWorkMode: z.enum(['REMOTE', 'HYBRID', 'ONSITE']).optional(),
    desiredJobTypes: z.array(z.string()).optional(),
    willingToRelocate: z.boolean().optional(),
    preferredLocations: z.array(z.string()).optional(),
    availableStartDate: z.string().datetime().optional().or(z.null()),
    profilePictureUrl: z.string().url().optional().or(z.literal('')),
    timezone: z.string().optional(),
    preferredLanguage: z.string().optional(),
  }),
});

// Experience validation
export const createExperienceSchema = z.object({
  body: z.object({
    company: z.string().min(1).max(200),
    position: z.string().min(1).max(200),
    description: z.string().max(5000).optional(),
    location: z.string().max(255).optional(),
    workMode: z.enum(['REMOTE', 'HYBRID', 'ONSITE']).optional(),
    startDate: z.string().datetime(),
    endDate: z.string().datetime().optional().or(z.null()),
    isCurrent: z.boolean().default(false),
    achievements: z.array(z.string()).optional(),
    technologies: z.array(z.string()).optional(),
  }),
});

export const updateExperienceSchema = z.object({
  params: z.object({
    id: z.string().cuid(),
  }),
  body: z.object({
    company: z.string().min(1).max(200).optional(),
    position: z.string().min(1).max(200).optional(),
    description: z.string().max(5000).optional(),
    location: z.string().max(255).optional(),
    workMode: z.enum(['REMOTE', 'HYBRID', 'ONSITE']).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional().or(z.null()),
    isCurrent: z.boolean().optional(),
    achievements: z.array(z.string()).optional(),
    technologies: z.array(z.string()).optional(),
  }),
});

export const deleteExperienceSchema = z.object({
  params: z.object({
    id: z.string().cuid(),
  }),
});

// Education validation
export const createEducationSchema = z.object({
  body: z.object({
    institution: z.string().min(1).max(200),
    degree: z.string().min(1).max(200),
    fieldOfStudy: z.string().min(1).max(200),
    location: z.string().max(255).optional(),
    startDate: z.string().datetime(),
    endDate: z.string().datetime().optional().or(z.null()),
    isCurrent: z.boolean().default(false),
    gpa: z.number().min(0).max(5).optional(),
    achievements: z.array(z.string()).optional(),
    coursework: z.array(z.string()).optional(),
  }),
});

export const updateEducationSchema = z.object({
  params: z.object({
    id: z.string().cuid(),
  }),
  body: z.object({
    institution: z.string().min(1).max(200).optional(),
    degree: z.string().min(1).max(200).optional(),
    fieldOfStudy: z.string().min(1).max(200).optional(),
    location: z.string().max(255).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional().or(z.null()),
    isCurrent: z.boolean().optional(),
    gpa: z.number().min(0).max(5).optional(),
    achievements: z.array(z.string()).optional(),
    coursework: z.array(z.string()).optional(),
  }),
});

export const deleteEducationSchema = z.object({
  params: z.object({
    id: z.string().cuid(),
  }),
});

// Skill validation
export const createSkillSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100),
    category: z.string().max(100).optional(),
    level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']),
    yearsOfExperience: z.number().int().min(0).max(100).optional(),
    endorsements: z.number().int().min(0).default(0).optional(),
  }),
});

export const updateSkillSchema = z.object({
  params: z.object({
    id: z.string().cuid(),
  }),
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    category: z.string().max(100).optional(),
    level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']).optional(),
    yearsOfExperience: z.number().int().min(0).max(100).optional(),
    endorsements: z.number().int().min(0).optional(),
  }),
});

export const deleteSkillSchema = z.object({
  params: z.object({
    id: z.string().cuid(),
  }),
});

// Certification validation
export const createCertificationSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(200),
    issuingOrganization: z.string().min(1).max(200),
    issueDate: z.string().datetime(),
    expiryDate: z.string().datetime().optional().or(z.null()),
    credentialId: z.string().max(200).optional(),
    credentialUrl: z.string().url().optional().or(z.literal('')),
    doesNotExpire: z.boolean().default(false),
  }),
});

export const updateCertificationSchema = z.object({
  params: z.object({
    id: z.string().cuid(),
  }),
  body: z.object({
    name: z.string().min(1).max(200).optional(),
    issuingOrganization: z.string().min(1).max(200).optional(),
    issueDate: z.string().datetime().optional(),
    expiryDate: z.string().datetime().optional().or(z.null()),
    credentialId: z.string().max(200).optional(),
    credentialUrl: z.string().url().optional().or(z.literal('')),
    doesNotExpire: z.boolean().optional(),
  }),
});

export const deleteCertificationSchema = z.object({
  params: z.object({
    id: z.string().cuid(),
  }),
});

// Export types
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>['body'];
export type CreateExperienceInput = z.infer<typeof createExperienceSchema>['body'];
export type UpdateExperienceInput = z.infer<typeof updateExperienceSchema>['body'];
export type CreateEducationInput = z.infer<typeof createEducationSchema>['body'];
export type UpdateEducationInput = z.infer<typeof updateEducationSchema>['body'];
export type CreateSkillInput = z.infer<typeof createSkillSchema>['body'];
export type UpdateSkillInput = z.infer<typeof updateSkillSchema>['body'];
export type CreateCertificationInput = z.infer<typeof createCertificationSchema>['body'];
export type UpdateCertificationInput = z.infer<typeof updateCertificationSchema>['body'];
