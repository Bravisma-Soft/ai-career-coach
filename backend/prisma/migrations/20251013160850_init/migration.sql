-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "JobType" AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'TEMPORARY');

-- CreateEnum
CREATE TYPE "WorkMode" AS ENUM ('REMOTE', 'HYBRID', 'ONSITE');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('INTERESTED', 'APPLIED', 'INTERVIEW_SCHEDULED', 'INTERVIEW_COMPLETED', 'OFFER_RECEIVED', 'REJECTED', 'ACCEPTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "ApplicationMethod" AS ENUM ('MANUAL', 'AUTOMATED');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'REJECTED', 'ACCEPTED');

-- CreateEnum
CREATE TYPE "InterviewType" AS ENUM ('PHONE', 'VIDEO', 'ONSITE', 'TECHNICAL', 'BEHAVIORAL', 'PANEL', 'FINAL');

-- CreateEnum
CREATE TYPE "InterviewOutcome" AS ENUM ('PASSED', 'FAILED', 'PENDING');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('RESUME', 'COVER_LETTER', 'PORTFOLIO', 'TRANSCRIPT', 'REFERENCE', 'OTHER');

-- CreateEnum
CREATE TYPE "GoalStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'ABANDONED');

-- CreateEnum
CREATE TYPE "SkillLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerifiedAt" TIMESTAMP(3),
    "lastLoginAt" TIMESTAMP(3),
    "passwordResetToken" TEXT,
    "passwordResetExpires" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "phone" TEXT,
    "bio" TEXT,
    "location" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "zipCode" TEXT,
    "linkedinUrl" TEXT,
    "githubUrl" TEXT,
    "portfolioUrl" TEXT,
    "websiteUrl" TEXT,
    "currentJobTitle" TEXT,
    "currentCompany" TEXT,
    "yearsOfExperience" INTEGER,
    "desiredJobTitle" TEXT,
    "desiredSalaryMin" INTEGER,
    "desiredSalaryMax" INTEGER,
    "desiredWorkMode" "WorkMode",
    "desiredJobTypes" TEXT[],
    "willingToRelocate" BOOLEAN NOT NULL DEFAULT false,
    "preferredLocations" TEXT[],
    "availableStartDate" TIMESTAMP(3),
    "profilePictureUrl" TEXT,
    "timezone" TEXT,
    "preferredLanguage" TEXT NOT NULL DEFAULT 'en',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "experiences" (
    "id" TEXT NOT NULL,
    "userProfileId" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "description" TEXT,
    "location" TEXT,
    "workMode" "WorkMode",
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "achievements" TEXT[],
    "technologies" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "experiences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "educations" (
    "id" TEXT NOT NULL,
    "userProfileId" TEXT NOT NULL,
    "institution" TEXT NOT NULL,
    "degree" TEXT NOT NULL,
    "fieldOfStudy" TEXT NOT NULL,
    "location" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "gpa" DOUBLE PRECISION,
    "achievements" TEXT[],
    "coursework" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "educations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skills" (
    "id" TEXT NOT NULL,
    "userProfileId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "level" "SkillLevel" NOT NULL,
    "yearsOfExperience" INTEGER,
    "endorsements" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certifications" (
    "id" TEXT NOT NULL,
    "userProfileId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "issuingOrganization" TEXT NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL,
    "expiryDate" TIMESTAMP(3),
    "credentialId" TEXT,
    "credentialUrl" TEXT,
    "doesNotExpire" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "certifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resumes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "rawText" TEXT,
    "parsedData" JSONB,
    "version" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastUsedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resumes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jobs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "companyUrl" TEXT,
    "location" TEXT,
    "workMode" "WorkMode" NOT NULL,
    "jobType" "JobType" NOT NULL,
    "salaryMin" INTEGER,
    "salaryMax" INTEGER,
    "salaryCurrency" TEXT DEFAULT 'USD',
    "jobUrl" TEXT,
    "jobDescription" TEXT,
    "requirements" TEXT[],
    "responsibilities" TEXT[],
    "benefits" TEXT[],
    "status" "JobStatus" NOT NULL DEFAULT 'INTERESTED',
    "source" TEXT,
    "referralName" TEXT,
    "postedDate" TIMESTAMP(3),
    "applicationDeadline" TIMESTAMP(3),
    "savedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "appliedAt" TIMESTAMP(3),
    "matchScore" DOUBLE PRECISION,
    "aiAnalysis" JSONB,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "status_changes" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "fromStatus" "JobStatus",
    "toStatus" "JobStatus" NOT NULL,
    "reason" TEXT,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "status_changes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "applications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "resumeId" TEXT,
    "applicationMethod" "ApplicationMethod" NOT NULL DEFAULT 'MANUAL',
    "status" "ApplicationStatus" NOT NULL DEFAULT 'DRAFT',
    "coverLetter" TEXT,
    "applicationUrl" TEXT,
    "confirmationNumber" TEXT,
    "submittedAt" TIMESTAMP(3),
    "responseReceivedAt" TIMESTAMP(3),
    "aiGeneratedCoverLetter" BOOLEAN NOT NULL DEFAULT false,
    "aiOptimizationApplied" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interviews" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "interviewType" "InterviewType" NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER,
    "location" TEXT,
    "interviewerName" TEXT,
    "interviewerEmail" TEXT,
    "interviewerPhone" TEXT,
    "outcome" "InterviewOutcome" NOT NULL DEFAULT 'PENDING',
    "completedAt" TIMESTAMP(3),
    "prepNotes" TEXT,
    "questionsAsked" TEXT[],
    "feedback" TEXT,
    "followUpSentAt" TIMESTAMP(3),
    "reminderSent" BOOLEAN NOT NULL DEFAULT false,
    "reminderSentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mock_interviews" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "interviewType" "InterviewType" NOT NULL,
    "targetRole" TEXT,
    "targetCompany" TEXT,
    "difficulty" TEXT,
    "duration" INTEGER,
    "overallScore" DOUBLE PRECISION,
    "technicalScore" DOUBLE PRECISION,
    "communicationScore" DOUBLE PRECISION,
    "problemSolvingScore" DOUBLE PRECISION,
    "aiAnalysis" JSONB,
    "aiSuggestions" TEXT[],
    "strengths" TEXT[],
    "areasToImprove" TEXT[],
    "conversationHistory" JSONB NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mock_interviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "jobId" TEXT,
    "documentType" "DocumentType" NOT NULL,
    "title" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "description" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "career_goals" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "targetDate" TIMESTAMP(3),
    "status" "GoalStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "milestones" JSONB,
    "aiRecommendations" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "career_goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "results" JSONB NOT NULL,
    "score" DOUBLE PRECISION,
    "aiInsights" JSONB,
    "recommendations" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT,
    "context" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_passwordResetToken_key" ON "users"("passwordResetToken");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_refreshToken_key" ON "sessions"("refreshToken");

-- CreateIndex
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");

-- CreateIndex
CREATE INDEX "sessions_refreshToken_idx" ON "sessions"("refreshToken");

-- CreateIndex
CREATE INDEX "sessions_expiresAt_idx" ON "sessions"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_userId_key" ON "user_profiles"("userId");

-- CreateIndex
CREATE INDEX "user_profiles_userId_idx" ON "user_profiles"("userId");

-- CreateIndex
CREATE INDEX "experiences_userProfileId_idx" ON "experiences"("userProfileId");

-- CreateIndex
CREATE INDEX "experiences_isCurrent_idx" ON "experiences"("isCurrent");

-- CreateIndex
CREATE INDEX "educations_userProfileId_idx" ON "educations"("userProfileId");

-- CreateIndex
CREATE INDEX "educations_isCurrent_idx" ON "educations"("isCurrent");

-- CreateIndex
CREATE INDEX "skills_userProfileId_idx" ON "skills"("userProfileId");

-- CreateIndex
CREATE INDEX "skills_category_idx" ON "skills"("category");

-- CreateIndex
CREATE INDEX "certifications_userProfileId_idx" ON "certifications"("userProfileId");

-- CreateIndex
CREATE INDEX "resumes_userId_idx" ON "resumes"("userId");

-- CreateIndex
CREATE INDEX "resumes_isPrimary_idx" ON "resumes"("isPrimary");

-- CreateIndex
CREATE INDEX "resumes_isActive_idx" ON "resumes"("isActive");

-- CreateIndex
CREATE INDEX "jobs_userId_idx" ON "jobs"("userId");

-- CreateIndex
CREATE INDEX "jobs_status_idx" ON "jobs"("status");

-- CreateIndex
CREATE INDEX "jobs_workMode_idx" ON "jobs"("workMode");

-- CreateIndex
CREATE INDEX "jobs_jobType_idx" ON "jobs"("jobType");

-- CreateIndex
CREATE INDEX "jobs_appliedAt_idx" ON "jobs"("appliedAt");

-- CreateIndex
CREATE INDEX "status_changes_jobId_idx" ON "status_changes"("jobId");

-- CreateIndex
CREATE INDEX "status_changes_changedAt_idx" ON "status_changes"("changedAt");

-- CreateIndex
CREATE INDEX "applications_userId_idx" ON "applications"("userId");

-- CreateIndex
CREATE INDEX "applications_jobId_idx" ON "applications"("jobId");

-- CreateIndex
CREATE INDEX "applications_resumeId_idx" ON "applications"("resumeId");

-- CreateIndex
CREATE INDEX "applications_status_idx" ON "applications"("status");

-- CreateIndex
CREATE INDEX "applications_submittedAt_idx" ON "applications"("submittedAt");

-- CreateIndex
CREATE INDEX "interviews_userId_idx" ON "interviews"("userId");

-- CreateIndex
CREATE INDEX "interviews_jobId_idx" ON "interviews"("jobId");

-- CreateIndex
CREATE INDEX "interviews_scheduledAt_idx" ON "interviews"("scheduledAt");

-- CreateIndex
CREATE INDEX "interviews_outcome_idx" ON "interviews"("outcome");

-- CreateIndex
CREATE INDEX "mock_interviews_userId_idx" ON "mock_interviews"("userId");

-- CreateIndex
CREATE INDEX "mock_interviews_isCompleted_idx" ON "mock_interviews"("isCompleted");

-- CreateIndex
CREATE INDEX "mock_interviews_createdAt_idx" ON "mock_interviews"("createdAt");

-- CreateIndex
CREATE INDEX "documents_jobId_idx" ON "documents"("jobId");

-- CreateIndex
CREATE INDEX "documents_documentType_idx" ON "documents"("documentType");

-- CreateIndex
CREATE INDEX "career_goals_userId_idx" ON "career_goals"("userId");

-- CreateIndex
CREATE INDEX "career_goals_status_idx" ON "career_goals"("status");

-- CreateIndex
CREATE INDEX "career_goals_priority_idx" ON "career_goals"("priority");

-- CreateIndex
CREATE INDEX "assessments_userId_idx" ON "assessments"("userId");

-- CreateIndex
CREATE INDEX "assessments_type_idx" ON "assessments"("type");

-- CreateIndex
CREATE INDEX "conversations_userId_idx" ON "conversations"("userId");

-- CreateIndex
CREATE INDEX "conversations_context_idx" ON "conversations"("context");

-- CreateIndex
CREATE INDEX "messages_conversationId_idx" ON "messages"("conversationId");

-- CreateIndex
CREATE INDEX "messages_createdAt_idx" ON "messages"("createdAt");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experiences" ADD CONSTRAINT "experiences_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "educations" ADD CONSTRAINT "educations_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skills" ADD CONSTRAINT "skills_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certifications" ADD CONSTRAINT "certifications_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resumes" ADD CONSTRAINT "resumes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "status_changes" ADD CONSTRAINT "status_changes_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "resumes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interviews" ADD CONSTRAINT "interviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interviews" ADD CONSTRAINT "interviews_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mock_interviews" ADD CONSTRAINT "mock_interviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_goals" ADD CONSTRAINT "career_goals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
