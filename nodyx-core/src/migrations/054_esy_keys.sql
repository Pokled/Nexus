-- 052 — ESY E2E Encryption Keys & DM Encryption Fields
-- Adds ECDH public key storage on users + encryption metadata on DM messages.
-- The private key NEVER leaves the user's browser.

-- Public key (ECDH P-256, stored as base64-encoded JWK public key)
ALTER TABLE users ADD COLUMN IF NOT EXISTS public_key TEXT;

-- DM message encryption fields
-- is_encrypted: true when the content is an AES-256-GCM + ESY ciphertext (base64)
-- encryption_nonce: base64-encoded 12-byte AES-GCM nonce
ALTER TABLE dm_messages ADD COLUMN IF NOT EXISTS is_encrypted    BOOLEAN DEFAULT FALSE;
ALTER TABLE dm_messages ADD COLUMN IF NOT EXISTS encryption_nonce TEXT;

-- Index so we can quickly filter encrypted conversations
CREATE INDEX IF NOT EXISTS idx_dm_messages_encrypted ON dm_messages(conversation_id) WHERE is_encrypted = TRUE;
