-- CreateTable
CREATE TABLE "job_analyses" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "resumeId" TEXT,
    "roleLevel" TEXT NOT NULL,
    "keyResponsibilities" JSONB NOT NULL,
    "requiredSkills" TEXT[],
    "preferredSkills" TEXT[],
    "redFlags" TEXT[],
    "highlights" TEXT[],
    "overallMatch" DOUBLE PRECISION,
    "skillsMatch" DOUBLE PRECISION,
    "experienceMatch" DOUBLE PRECISION,
    "matchReasons" TEXT[],
    "gaps" TEXT[],
    "recommendations" JSONB NOT NULL,
    "estimatedSalaryMin" DOUBLE PRECISION,
    "estimatedSalaryMax" DOUBLE PRECISION,
    "salaryCurrency" TEXT DEFAULT 'USD',
    "marketComparison" TEXT NOT NULL,
    "salaryFactors" TEXT[],
    "applicationTips" JSONB NOT NULL,
    "analysisContext" JSONB,
    "analysisMetadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "job_analyses_jobId_idx" ON "job_analyses"("jobId");

-- CreateIndex
CREATE INDEX "job_analyses_resumeId_idx" ON "job_analyses"("resumeId");

-- CreateIndex
CREATE UNIQUE INDEX "job_analyses_jobId_resumeId_key" ON "job_analyses"("jobId", "resumeId");

-- AddForeignKey
ALTER TABLE "job_analyses" ADD CONSTRAINT "job_analyses_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_analyses" ADD CONSTRAINT "job_analyses_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "resumes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
