-- Migration 017: Add name_color to user_profiles
-- Allows users to choose a display name text color for their profile banner

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS name_color VARCHAR(7) DEFAULT NULL;
