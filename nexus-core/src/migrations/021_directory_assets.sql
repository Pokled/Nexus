-- Migration 021: Cross-instance asset federation (v0.7)
-- Stores assets announced by remote Nexus instances to the nexusnode.app directory

CREATE TABLE IF NOT EXISTS directory_assets (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Source instance
  instance_id         INTEGER NOT NULL REFERENCES directory_instances(id) ON DELETE CASCADE,
  instance_slug       VARCHAR(63) NOT NULL,         -- denormalized for display

  -- Remote asset identity
  remote_asset_id     UUID NOT NULL,                -- UUID on the remote instance
  asset_type          VARCHAR(20) NOT NULL,
  name                VARCHAR(100) NOT NULL,
  description         TEXT,
  tags                TEXT[] DEFAULT '{}',

  -- Remote file references (served by the remote instance)
  file_hash           CHAR(64) NOT NULL,            -- SHA-256, used for deduplication
  file_url            TEXT NOT NULL,                -- e.g. https://monio.nexusnode.app/uploads/assets/abc.webp
  thumbnail_url       TEXT,                         -- e.g. https://monio.nexusnode.app/uploads/assets/abc_thumb.webp
  file_size           INTEGER,
  mime_type           VARCHAR(50),

  -- Deduplication: first instance that announced this hash
  canonical_instance_id INTEGER REFERENCES directory_instances(id) ON DELETE SET NULL,

  -- Stats (aggregated from remote)
  downloads           INTEGER DEFAULT 0,

  -- Timestamps
  announced_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW(),

  -- Prevent duplicate (instance, asset) pairs
  CONSTRAINT uq_directory_asset_instance UNIQUE (instance_id, remote_asset_id),

  CONSTRAINT valid_asset_type CHECK (asset_type IN (
    'frame', 'banner', 'font', 'badge', 'sticker', 'theme', 'emoji', 'sound'
  ))
);

CREATE INDEX IF NOT EXISTS idx_dir_assets_instance    ON directory_assets(instance_id);
CREATE INDEX IF NOT EXISTS idx_dir_assets_hash        ON directory_assets(file_hash);
CREATE INDEX IF NOT EXISTS idx_dir_assets_type        ON directory_assets(asset_type, announced_at DESC);
CREATE INDEX IF NOT EXISTS idx_dir_assets_canonical   ON directory_assets(canonical_instance_id);

-- Full-text search across federated assets
ALTER TABLE directory_assets
  ADD COLUMN IF NOT EXISTS search_vector TSVECTOR
    GENERATED ALWAYS AS (
      setweight(to_tsvector('french', coalesce(name, '')), 'A') ||
      setweight(to_tsvector('french', coalesce(description, '')), 'B')
    ) STORED;

CREATE INDEX IF NOT EXISTS idx_dir_assets_search ON directory_assets USING GIN(search_vector);

INSERT INTO schema_migrations (version) VALUES ('021') ON CONFLICT DO NOTHING;
