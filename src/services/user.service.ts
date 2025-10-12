import { prisma } from '@/database/client';
import { logger } from '@/config/logger';
import {
  NotFoundError,
  ForbiddenError,
  BadRequestError,
} from '@/utils/ApiError';
import {
  UpdateProfileInput,
  CreateExperienceInput,
  UpdateExperienceInput,
  CreateEducationInput,
  UpdateEducationInput,
  CreateSkillInput,
  UpdateSkillInput,
  CreateCertificationInput,
  UpdateCertificationInput,
} from '@/api/validators/user.validator';
import { UserProfile, Experience, Education, Skill, Certification } from '@prisma/client';

export class UserService {
  /**
   * Get user profile with all related data
   */
  async getProfile(userId: string) {
    const profile = await prisma.userProfile.findUnique({
      where: { userId },
      include: {
        experiences: {
          orderBy: [{ isCurrent: 'desc' }, { startDate: 'desc' }],
        },
        educations: {
          orderBy: [{ isCurrent: 'desc' }, { startDate: 'desc' }],
        },
        skills: {
          orderBy: [{ category: 'asc' }, { level: 'desc' }],
        },
        certifications: {
          orderBy: { issueDate: 'desc' },
        },
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            createdAt: true,
          },
        },
      },
    });

    if (!profile) {
      // Create profile if it doesn't exist
      return await this.createProfile(userId);
    }

    return profile;
  }

  /**
   * Create user profile
   */
  private async createProfile(userId: string) {
    const profile = await prisma.userProfile.create({
      data: { userId },
      include: {
        experiences: true,
        educations: true,
        skills: true,
        certifications: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            createdAt: true,
          },
        },
      },
    });

    logger.info(`Profile created for user: ${userId}`);
    return profile;
  }

  /**
   * Update user profile
   */
  async updateProfile(
    userId: string,
    data: UpdateProfileInput
  ): Promise<UserProfile> {
    // Ensure profile exists
    let profile = await prisma.userProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      profile = await prisma.userProfile.create({
        data: { userId },
      });
    }

    // Parse dates if present
    const updateData: any = { ...data };
    if (data.availableStartDate) {
      updateData.availableStartDate = new Date(data.availableStartDate);
    }

    const updatedProfile = await prisma.userProfile.update({
      where: { userId },
      data: updateData,
    });

    logger.info(`Profile updated for user: ${userId}`);
    return updatedProfile;
  }

  // =================================
  // EXPERIENCE METHODS
  // =================================

  /**
   * Add work experience
   */
  async addExperience(
    userId: string,
    data: CreateExperienceInput
  ): Promise<Experience> {
    // Get or create profile
    let profile = await prisma.userProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      profile = await prisma.userProfile.create({
        data: { userId },
      });
    }

    const experience = await prisma.experience.create({
      data: {
        userProfileId: profile.id,
        ...data,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
      },
    });

    logger.info(`Experience added for user: ${userId}`);
    return experience;
  }

  /**
   * Update work experience
   */
  async updateExperience(
    experienceId: string,
    userId: string,
    data: UpdateExperienceInput
  ): Promise<Experience> {
    // Verify ownership
    const experience = await prisma.experience.findUnique({
      where: { id: experienceId },
      include: { userProfile: true },
    });

    if (!experience) {
      throw new NotFoundError('Experience not found');
    }

    if (experience.userProfile.userId !== userId) {
      throw new ForbiddenError('Not authorized to update this experience');
    }

    // Parse dates if present
    const updateData: any = { ...data };
    if (data.startDate) {
      updateData.startDate = new Date(data.startDate);
    }
    if (data.endDate !== undefined) {
      updateData.endDate = data.endDate ? new Date(data.endDate) : null;
    }

    const updated = await prisma.experience.update({
      where: { id: experienceId },
      data: updateData,
    });

    logger.info(`Experience updated: ${experienceId}`);
    return updated;
  }

  /**
   * Delete work experience
   */
  async deleteExperience(experienceId: string, userId: string): Promise<void> {
    // Verify ownership
    const experience = await prisma.experience.findUnique({
      where: { id: experienceId },
      include: { userProfile: true },
    });

    if (!experience) {
      throw new NotFoundError('Experience not found');
    }

    if (experience.userProfile.userId !== userId) {
      throw new ForbiddenError('Not authorized to delete this experience');
    }

    await prisma.experience.delete({
      where: { id: experienceId },
    });

    logger.info(`Experience deleted: ${experienceId}`);
  }

  // =================================
  // EDUCATION METHODS
  // =================================

  /**
   * Add education
   */
  async addEducation(
    userId: string,
    data: CreateEducationInput
  ): Promise<Education> {
    // Get or create profile
    let profile = await prisma.userProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      profile = await prisma.userProfile.create({
        data: { userId },
      });
    }

    const education = await prisma.education.create({
      data: {
        userProfileId: profile.id,
        ...data,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
      },
    });

    logger.info(`Education added for user: ${userId}`);
    return education;
  }

  /**
   * Update education
   */
  async updateEducation(
    educationId: string,
    userId: string,
    data: UpdateEducationInput
  ): Promise<Education> {
    // Verify ownership
    const education = await prisma.education.findUnique({
      where: { id: educationId },
      include: { userProfile: true },
    });

    if (!education) {
      throw new NotFoundError('Education not found');
    }

    if (education.userProfile.userId !== userId) {
      throw new ForbiddenError('Not authorized to update this education');
    }

    // Parse dates if present
    const updateData: any = { ...data };
    if (data.startDate) {
      updateData.startDate = new Date(data.startDate);
    }
    if (data.endDate !== undefined) {
      updateData.endDate = data.endDate ? new Date(data.endDate) : null;
    }

    const updated = await prisma.education.update({
      where: { id: educationId },
      data: updateData,
    });

    logger.info(`Education updated: ${educationId}`);
    return updated;
  }

  /**
   * Delete education
   */
  async deleteEducation(educationId: string, userId: string): Promise<void> {
    // Verify ownership
    const education = await prisma.education.findUnique({
      where: { id: educationId },
      include: { userProfile: true },
    });

    if (!education) {
      throw new NotFoundError('Education not found');
    }

    if (education.userProfile.userId !== userId) {
      throw new ForbiddenError('Not authorized to delete this education');
    }

    await prisma.education.delete({
      where: { id: educationId },
    });

    logger.info(`Education deleted: ${educationId}`);
  }

  // =================================
  // SKILL METHODS
  // =================================

  /**
   * Add skill
   */
  async addSkill(userId: string, data: CreateSkillInput): Promise<Skill> {
    // Get or create profile
    let profile = await prisma.userProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      profile = await prisma.userProfile.create({
        data: { userId },
      });
    }

    // Check for duplicate skill
    const existing = await prisma.skill.findFirst({
      where: {
        userProfileId: profile.id,
        name: data.name,
      },
    });

    if (existing) {
      throw new BadRequestError('Skill already exists');
    }

    const skill = await prisma.skill.create({
      data: {
        userProfileId: profile.id,
        ...data,
      },
    });

    logger.info(`Skill added for user: ${userId}`);
    return skill;
  }

  /**
   * Update skill
   */
  async updateSkill(
    skillId: string,
    userId: string,
    data: UpdateSkillInput
  ): Promise<Skill> {
    // Verify ownership
    const skill = await prisma.skill.findUnique({
      where: { id: skillId },
      include: { userProfile: true },
    });

    if (!skill) {
      throw new NotFoundError('Skill not found');
    }

    if (skill.userProfile.userId !== userId) {
      throw new ForbiddenError('Not authorized to update this skill');
    }

    const updated = await prisma.skill.update({
      where: { id: skillId },
      data,
    });

    logger.info(`Skill updated: ${skillId}`);
    return updated;
  }

  /**
   * Delete skill
   */
  async deleteSkill(skillId: string, userId: string): Promise<void> {
    // Verify ownership
    const skill = await prisma.skill.findUnique({
      where: { id: skillId },
      include: { userProfile: true },
    });

    if (!skill) {
      throw new NotFoundError('Skill not found');
    }

    if (skill.userProfile.userId !== userId) {
      throw new ForbiddenError('Not authorized to delete this skill');
    }

    await prisma.skill.delete({
      where: { id: skillId },
    });

    logger.info(`Skill deleted: ${skillId}`);
  }

  // =================================
  // CERTIFICATION METHODS
  // =================================

  /**
   * Add certification
   */
  async addCertification(
    userId: string,
    data: CreateCertificationInput
  ): Promise<Certification> {
    // Get or create profile
    let profile = await prisma.userProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      profile = await prisma.userProfile.create({
        data: { userId },
      });
    }

    const certification = await prisma.certification.create({
      data: {
        userProfileId: profile.id,
        ...data,
        issueDate: new Date(data.issueDate),
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
      },
    });

    logger.info(`Certification added for user: ${userId}`);
    return certification;
  }

  /**
   * Update certification
   */
  async updateCertification(
    certificationId: string,
    userId: string,
    data: UpdateCertificationInput
  ): Promise<Certification> {
    // Verify ownership
    const certification = await prisma.certification.findUnique({
      where: { id: certificationId },
      include: { userProfile: true },
    });

    if (!certification) {
      throw new NotFoundError('Certification not found');
    }

    if (certification.userProfile.userId !== userId) {
      throw new ForbiddenError('Not authorized to update this certification');
    }

    // Parse dates if present
    const updateData: any = { ...data };
    if (data.issueDate) {
      updateData.issueDate = new Date(data.issueDate);
    }
    if (data.expiryDate !== undefined) {
      updateData.expiryDate = data.expiryDate ? new Date(data.expiryDate) : null;
    }

    const updated = await prisma.certification.update({
      where: { id: certificationId },
      data: updateData,
    });

    logger.info(`Certification updated: ${certificationId}`);
    return updated;
  }

  /**
   * Delete certification
   */
  async deleteCertification(
    certificationId: string,
    userId: string
  ): Promise<void> {
    // Verify ownership
    const certification = await prisma.certification.findUnique({
      where: { id: certificationId },
      include: { userProfile: true },
    });

    if (!certification) {
      throw new NotFoundError('Certification not found');
    }

    if (certification.userProfile.userId !== userId) {
      throw new ForbiddenError('Not authorized to delete this certification');
    }

    await prisma.certification.delete({
      where: { id: certificationId },
    });

    logger.info(`Certification deleted: ${certificationId}`);
  }
}

// Export singleton instance
export const userService = new UserService();
