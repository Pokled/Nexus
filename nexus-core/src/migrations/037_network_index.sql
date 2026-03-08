-- Migration 037 — Global Search network index (SPEC 010)
-- Stores thread metadata announced by remote instances for cross-instance search.
-- Active only on the directory instance (nexusnode.app), harmless elsewhere.

CREATE TABLE IF NOT EXISTS network_index (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_slug   VARCHAR(100) NOT NULL,
  instance_url    TEXT         NOT NULL,
  thread_id       UUID         NOT NULL,
  thread_slug     VARCHAR(300),
  title           TEXT         NOT NULL,
  excerpt         TEXT         NOT NULL DEFAULT '',
  tags            TEXT[]       NOT NULL DEFAULT '{}',
  reply_count     INT          NOT NULL DEFAULT 0,
  search_vector   TSVECTOR,
  announced_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE (instance_slug, thread_id)
);

CREATE INDEX IF NOT EXISTS network_index_fts      ON network_index USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS network_index_instance  ON network_index(instance_slug);
CREATE INDEX IF NOT EXISTS network_index_updated   ON network_index(updated_at DESC);
