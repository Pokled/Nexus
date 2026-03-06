BEGIN;

-- Reply-to support for channel messages
ALTER TABLE channel_messages ADD COLUMN reply_to_id UUID REFERENCES channel_messages(id) ON DELETE SET NULL;

-- Pinned message per channel (one pin per channel)
ALTER TABLE channels ADD COLUMN pinned_message_id UUID REFERENCES channel_messages(id) ON DELETE SET NULL;

COMMIT;
