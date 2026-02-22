BEGIN;

CREATE TABLE channels (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  name         VARCHAR(100) NOT NULL,
  slug         VARCHAR(100) NOT NULL,
  description  VARCHAR(500),
  position     INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (community_id, slug),
  CONSTRAINT channels_slug_format CHECK (slug ~ '^[a-z0-9-]+$')
);
CREATE INDEX idx_channels_community ON channels(community_id, position);

CREATE TABLE channel_messages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
  author_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content    TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT channel_messages_length CHECK (
    char_length(content) >= 1 AND char_length(content) <= 2000
  )
);
CREATE INDEX idx_channel_messages_channel ON channel_messages(channel_id, created_at DESC);

COMMIT;
