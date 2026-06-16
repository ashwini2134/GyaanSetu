-- AlterTable
ALTER TABLE "Progress" ADD COLUMN     "practiceAttempted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "practiceCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "projectCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "projectId" TEXT;
