-- Migration: 20261014000000_add_missing_user_columns
-- Purpose: Add all missing User columns (and related backfill columns) that exist in schema.prisma
-- Strategy: Fully idempotent, data-preserving using ADD COLUMN IF NOT EXISTS / CREATE TABLE IF NOT EXISTS

-- ============================================================================
-- 1. USER MODEL MISSING COLUMNS
-- ============================================================================
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "githubUrl" TEXT NOT NULL DEFAULT '';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "linkedinUrl" TEXT NOT NULL DEFAULT '';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "portfolioUrl" TEXT NOT NULL DEFAULT '';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'active';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "profileVisibility" TEXT NOT NULL DEFAULT 'public';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "profileTheme" TEXT NOT NULL DEFAULT 'default';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "portfolioTemplate" TEXT NOT NULL DEFAULT 'bento';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "streakFreezeCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "streakFreezeUsedAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "notificationPrefs" JSONB;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "bio" TEXT NOT NULL DEFAULT '';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "avatarUrl" TEXT NOT NULL DEFAULT '';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "statsData" JSONB;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "overallProgress" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "role" TEXT NOT NULL DEFAULT 'student';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "emailVerified" BOOLEAN NOT NULL DEFAULT false;

-- ============================================================================
-- 2. ACHIEVEMENT MODEL COLUMNS (from untracked backfill)
-- ============================================================================
ALTER TABLE "Achievement" ADD COLUMN IF NOT EXISTS "custom" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Achievement" ADD COLUMN IF NOT EXISTS "icon" TEXT;
ALTER TABLE "Achievement" ADD COLUMN IF NOT EXISTS "description" TEXT;

-- ============================================================================
-- 3. ISSUEDCERTIFICATE MODEL COLUMNS (from untracked backfill)
-- ============================================================================
ALTER TABLE "IssuedCertificate" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'active';
ALTER TABLE "IssuedCertificate" ADD COLUMN IF NOT EXISTS "revokeReason" TEXT;
ALTER TABLE "IssuedCertificate" ADD COLUMN IF NOT EXISTS "revokedAt" TIMESTAMP(3);
ALTER TABLE "IssuedCertificate" ADD COLUMN IF NOT EXISTS "templateId" TEXT NOT NULL DEFAULT 'default';
ALTER TABLE "IssuedCertificate" ADD COLUMN IF NOT EXISTS "viewCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "IssuedCertificate" ADD COLUMN IF NOT EXISTS "shareCount" INTEGER NOT NULL DEFAULT 0;

-- ============================================================================
-- 4. PROJECTTEMPLATE MODEL COLUMNS (from untracked backfill)
-- ============================================================================
ALTER TABLE "ProjectTemplate" ADD COLUMN IF NOT EXISTS "downloadUrl" TEXT;
ALTER TABLE "ProjectTemplate" ADD COLUMN IF NOT EXISTS "evaluationChecklist" JSONB;
ALTER TABLE "ProjectTemplate" ADD COLUMN IF NOT EXISTS "guidelines" JSONB;

-- ============================================================================
-- 5. WEEKLY_XP TABLE (from untracked migration)
-- ============================================================================
CREATE TABLE IF NOT EXISTS "weekly_xp" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "weekStart" TIMESTAMP(3) NOT NULL,
    "weekEnd" TIMESTAMP(3) NOT NULL,
    "weekNumber" INTEGER NOT NULL DEFAULT 0,
    "totalXp" INTEGER NOT NULL DEFAULT 0,
    "rank" INTEGER,
    "activities" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "weekly_xp_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "weekly_xp_userId_idx" ON "weekly_xp"("userId");
CREATE INDEX IF NOT EXISTS "weekly_xp_weekStart_idx" ON "weekly_xp"("weekStart");
CREATE UNIQUE INDEX IF NOT EXISTS "weekly_xp_userId_weekStart_key" ON "weekly_xp"("userId", "weekStart");

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'weekly_xp_userId_fkey'
    ) THEN
        ALTER TABLE "weekly_xp" ADD CONSTRAINT "weekly_xp_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
