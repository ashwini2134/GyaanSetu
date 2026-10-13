-- AlterTable: Add missing notificationPrefs column to User
-- Preserves all existing data by adding nullable JSONB column
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "notificationPrefs" JSONB;
