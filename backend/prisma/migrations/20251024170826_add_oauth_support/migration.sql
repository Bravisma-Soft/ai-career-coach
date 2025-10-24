-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('LOCAL', 'GOOGLE', 'GITHUB', 'LINKEDIN');

-- AlterTable
ALTER TABLE "interviews" ALTER COLUMN "aiQuestions" DROP DEFAULT,
ALTER COLUMN "aiQuestionsToAsk" DROP DEFAULT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "profilePicture" TEXT,
ADD COLUMN     "provider" "AuthProvider" NOT NULL DEFAULT 'LOCAL',
ADD COLUMN     "providerData" JSONB,
ADD COLUMN     "providerId" TEXT,
ALTER COLUMN "password" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "users_provider_providerId_idx" ON "users"("provider", "providerId");
