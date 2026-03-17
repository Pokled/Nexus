-- Migration 022: Whisper rooms — ephemeral chat rooms (v0.7)
-- Rooms expire after 1h of inactivity. Messages cascade-deleted with the room.

CREATE TABLE IF NOT EXISTS whisper_rooms (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id    UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Optional context (where the whisper was started from)
  context_type  VARCHAR(20),   -- 'asset' | 'thread' | 'voice' | null
  context_id    TEXT,          -- uuid or id of the context object
  context_label TEXT,          -- human-readable label ("Cadre Doré", "Sujet XYZ"…)

  -- Room metadata
  name          VARCHAR(100),

  -- Timestamps
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  expires_at    TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '1 hour')
);

CREATE INDEX IF NOT EXISTS idx_whisper_creator     ON whisper_rooms(creator_id);
CREATE INDEX IF NOT EXISTS idx_whisper_expires     ON whisper_rooms(expires_at);
CREATE INDEX IF NOT EXISTS idx_whisper_context     ON whisper_rooms(context_type, context_id);

CREATE TABLE IF NOT EXISTS whisper_messages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id    UUID NOT NULL REFERENCES whisper_rooms(id) ON DELETE CASCADE,
  user_id    UUID REFERENCES users(id) ON DELETE SET NULL,
  username   VARCHAR(50) NOT NULL,
  avatar     TEXT,
  content    TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_whisper_messages_room ON whisper_messages(room_id, created_at DESC);

INSERT INTO schema_migrations (version) VALUES ('022') ON CONFLICT DO NOTHING;
