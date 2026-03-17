-- Migration 018: Community assets library (v0.6 — local only, no federation)
-- Stores user-created assets: frames, banners, badges, stickers, fonts, themes, sounds, emoji

CREATE TABLE community_assets (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_type       VARCHAR(20) NOT NULL,
  name             VARCHAR(100) NOT NULL,
  description      TEXT,
  creator_id       UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at       TIMESTAMP DEFAULT NOW(),

  -- File (stored locally in uploads/assets/)
  file_path        TEXT NOT NULL,          -- e.g. "assets/abc123.webp"
  file_hash        CHAR(64) NOT NULL,      -- SHA-256 of original file
  file_size        INTEGER NOT NULL,       -- bytes
  mime_type        VARCHAR(50) NOT NULL,
  original_filename VARCHAR(255),
  thumbnail_path   TEXT,                   -- WebP thumbnail (e.g. "assets/abc123_thumb.webp")

  -- Discovery
  tags             TEXT[]  DEFAULT '{}',
  metadata         JSONB   DEFAULT '{}',   -- type-specific extra data

  -- Stats
  downloads        INTEGER DEFAULT 0,

  -- Moderation
  is_public        BOOLEAN DEFAULT true,
  is_banned        BOOLEAN DEFAULT false,

  -- Full-text search (name + description)
  search_vector    TSVECTOR GENERATED ALWAYS AS (
    setweight(to_tsvector('french', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('french', coalesce(description, '')), 'B')
  ) STORED,

  CONSTRAINT valid_asset_type CHECK (asset_type IN (
    'frame', 'banner', 'font', 'badge', 'sticker', 'theme', 'emoji', 'sound'
  )),
  CONSTRAINT valid_file_size CHECK (file_size <= 5242880)  -- 5 MB max
);

CREATE INDEX idx_assets_creator   ON community_assets(creator_id);
CREATE INDEX idx_assets_type      ON community_assets(asset_type, created_at DESC);
CREATE INDEX idx_assets_public    ON community_assets(is_public, created_at DESC) WHERE is_banned = false;
CREATE INDEX idx_assets_search    ON community_assets USING GIN(search_vector);
CREATE INDEX idx_assets_tags      ON community_assets USING GIN(tags);
CREATE INDEX idx_assets_hash      ON community_assets(file_hash);
