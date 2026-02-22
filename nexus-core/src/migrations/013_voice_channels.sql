BEGIN;

ALTER TABLE channels
  ADD COLUMN type VARCHAR(10) NOT NULL DEFAULT 'text'
    CHECK (type IN ('text', 'voice'));

COMMENT ON COLUMN channels.type IS 'text = canal texte, voice = salon vocal WebRTC';

COMMIT;
