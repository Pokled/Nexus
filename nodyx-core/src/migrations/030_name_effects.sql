-- Migration 030: username visual effects
-- name_glow        : hex color for text glow (e.g. '#6366f1')
-- name_glow_intensity: blur radius in px (5-40)
-- name_animation   : hover/permanent animation key
-- name_font_family : CSS font-family name (Google Font or custom)
-- name_font_url    : URL to uploaded font file (null for Google Fonts)

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS name_glow           VARCHAR(7)   DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS name_glow_intensity SMALLINT     DEFAULT 10,
  ADD COLUMN IF NOT EXISTS name_animation      VARCHAR(30)  DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS name_font_family    VARCHAR(100) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS name_font_url       TEXT         DEFAULT NULL;
