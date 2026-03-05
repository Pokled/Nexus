-- Migration 024: Add metadata JSONB column to user_profiles
-- Stores per-user profile customization data (theme, etc.)
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}';
