BEGIN;

CREATE TABLE channel_message_reactions (
  message_id UUID NOT NULL REFERENCES channel_messages(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES users(id)            ON DELETE CASCADE,
  emoji      VARCHAR(10) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (message_id, user_id, emoji)
);
CREATE INDEX idx_cmr_message ON channel_message_reactions(message_id);

ALTER TABLE channel_messages ADD COLUMN is_deleted BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE channel_messages ADD COLUMN edited_at  TIMESTAMP;

-- Relâcher la contrainte de longueur sur content (les messages supprimés ont content='')
ALTER TABLE channel_messages DROP CONSTRAINT IF EXISTS channel_messages_length;

COMMIT;
