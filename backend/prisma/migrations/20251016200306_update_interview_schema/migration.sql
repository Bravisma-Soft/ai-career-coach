-- AlterEnum: Update InterviewType enum
ALTER TYPE "InterviewType" RENAME TO "InterviewType_old";
CREATE TYPE "InterviewType" AS ENUM ('PHONE_SCREEN', 'VIDEO_CALL', 'IN_PERSON', 'TECHNICAL', 'BEHAVIORAL', 'PANEL', 'FINAL', 'OTHER');

-- Migrate existing Interview data to new enum values
-- PHONE -> PHONE_SCREEN, VIDEO -> VIDEO_CALL, ONSITE -> IN_PERSON
ALTER TABLE "interviews"
  ALTER COLUMN "interviewType" DROP DEFAULT,
  ALTER COLUMN "interviewType" TYPE "InterviewType"
    USING (
      CASE "interviewType"::text
        WHEN 'PHONE' THEN 'PHONE_SCREEN'::"InterviewType"
        WHEN 'VIDEO' THEN 'VIDEO_CALL'::"InterviewType"
        WHEN 'ONSITE' THEN 'IN_PERSON'::"InterviewType"
        WHEN 'TECHNICAL' THEN 'TECHNICAL'::"InterviewType"
        WHEN 'BEHAVIORAL' THEN 'BEHAVIORAL'::"InterviewType"
        WHEN 'PANEL' THEN 'PANEL'::"InterviewType"
        WHEN 'FINAL' THEN 'FINAL'::"InterviewType"
        ELSE 'OTHER'::"InterviewType"
      END
    );

-- Migrate MockInterview interviewType
ALTER TABLE "mock_interviews"
  ALTER COLUMN "interviewType" DROP DEFAULT,
  ALTER COLUMN "interviewType" TYPE "InterviewType"
    USING (
      CASE "interviewType"::text
        WHEN 'PHONE' THEN 'PHONE_SCREEN'::"InterviewType"
        WHEN 'VIDEO' THEN 'VIDEO_CALL'::"InterviewType"
        WHEN 'ONSITE' THEN 'IN_PERSON'::"InterviewType"
        WHEN 'TECHNICAL' THEN 'TECHNICAL'::"InterviewType"
        WHEN 'BEHAVIORAL' THEN 'BEHAVIORAL'::"InterviewType"
        WHEN 'PANEL' THEN 'PANEL'::"InterviewType"
        WHEN 'FINAL' THEN 'FINAL'::"InterviewType"
        ELSE 'OTHER'::"InterviewType"
      END
    );

-- Drop old enum
DROP TYPE "InterviewType_old";

-- AlterEnum: Update InterviewOutcome enum
ALTER TYPE "InterviewOutcome" RENAME TO "InterviewOutcome_old";
CREATE TYPE "InterviewOutcome" AS ENUM ('PENDING', 'PASSED', 'FAILED', 'CANCELLED', 'RESCHEDULED', 'NO_SHOW');

-- Migrate existing data (old enum has PASSED, FAILED, PENDING)
ALTER TABLE "interviews"
  ALTER COLUMN "outcome" DROP DEFAULT,
  ALTER COLUMN "outcome" TYPE "InterviewOutcome"
    USING (
      CASE "outcome"::text
        WHEN 'PENDING' THEN 'PENDING'::"InterviewOutcome"
        WHEN 'PASSED' THEN 'PASSED'::"InterviewOutcome"
        WHEN 'FAILED' THEN 'FAILED'::"InterviewOutcome"
        ELSE 'PENDING'::"InterviewOutcome"
      END
    ),
  ALTER COLUMN "outcome" SET DEFAULT 'PENDING'::"InterviewOutcome";

-- Drop old enum
DROP TYPE "InterviewOutcome_old";

-- AlterTable: Add new columns to interviews
ALTER TABLE "interviews"
  ADD COLUMN "meetingUrl" TEXT,
  ADD COLUMN "interviewers" JSONB,
  ADD COLUMN "round" INTEGER,
  ADD COLUMN "preparationNotes" TEXT,
  ADD COLUMN "aiQuestions" TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "aiQuestionsToAsk" TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "aiInterviewerBackground" TEXT;

-- Rename notes column (prepNotes -> notes, we'll use preparationNotes for prep)
-- First, check if we need to preserve any prepNotes data
UPDATE "interviews"
  SET "preparationNotes" = COALESCE("prepNotes", '')
  WHERE "prepNotes" IS NOT NULL;

-- Add new notes column
ALTER TABLE "interviews" ADD COLUMN "notes" TEXT;

-- Drop old interviewer columns
ALTER TABLE "interviews"
  DROP COLUMN IF EXISTS "interviewerName",
  DROP COLUMN IF EXISTS "interviewerEmail",
  DROP COLUMN IF EXISTS "interviewerPhone",
  DROP COLUMN IF EXISTS "prepNotes";

-- AlterTable: Update mock_interviews
ALTER TABLE "mock_interviews"
  ADD COLUMN "interviewId" TEXT,
  ADD COLUMN "totalQuestions" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "completedQuestions" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Create index on interviewId
CREATE INDEX "mock_interviews_interviewId_idx" ON "mock_interviews"("interviewId");

-- Add foreign key constraint
ALTER TABLE "mock_interviews"
  ADD CONSTRAINT "mock_interviews_interviewId_fkey"
  FOREIGN KEY ("interviewId")
  REFERENCES "interviews"("id")
  ON DELETE SET NULL
  ON UPDATE CASCADE;

-- Add mockInterviews relation to interviews (no changes needed, relation is virtual)
