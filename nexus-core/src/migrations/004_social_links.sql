-- ============================================================
-- NEXUS — Migration 004
-- 004_social_links.sql
-- ============================================================

BEGIN;

-- Dedicated social link columns on user_profiles
ALTER TABLE user_profiles
ADD COLUMN github_username    VARCHAR(100),
ADD COLUMN youtube_channel    VARCHAR(200),
ADD COLUMN twitter_username   VARCHAR(100),
ADD COLUMN instagram_username VARCHAR(100),
ADD COLUMN website_url        VARCHAR(500);

-- Index for lookup by github_username
CREATE INDEX idx_profiles_github ON user_profiles(github_username)
WHERE github_username IS NOT NULL;

COMMIT;
