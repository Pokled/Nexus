-- Migration 006: Featured threads
-- Allows mods/admins to promote threads as featured articles on the homepage

ALTER TABLE threads ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT false;
CREATE INDEX IF NOT EXISTS idx_threads_featured ON threads (is_featured) WHERE is_featured = true;
