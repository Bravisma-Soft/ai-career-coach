-- AlterTable: Add jobId column and update constraints
ALTER TABLE "resume_analyses" ADD COLUMN "jobId" TEXT;

-- DropIndex: Remove old unique constraint on resumeId only
DROP INDEX "resume_analyses_resumeId_key";

-- CreateIndex: Add index on jobId
CREATE INDEX "resume_analyses_jobId_idx" ON "resume_analyses"("jobId");

-- CreateIndex: Add composite unique constraint on (resumeId, jobId)
CREATE UNIQUE INDEX "resume_analyses_resumeId_jobId_key" ON "resume_analyses"("resumeId", "jobId");

-- AddForeignKey: Link jobId to jobs table
ALTER TABLE "resume_analyses" ADD CONSTRAINT "resume_analyses_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
