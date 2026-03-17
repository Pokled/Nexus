-- Migration 016: Add logo_url and banner_url to communities table
-- These columns were used in admin/branding and instance/info routes
-- but were never added via a migration — only patched on the main VPS DB.

ALTER TABLE communities
  ADD COLUMN IF NOT EXISTS logo_url   VARCHAR(500),
  ADD COLUMN IF NOT EXISTS banner_url VARCHAR(500);

INSERT INTO schema_migrations (version) VALUES ('016') ON CONFLICT DO NOTHING;
