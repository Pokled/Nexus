-- ── Migration 025 : Password reset tokens ──────────────────────────────────
-- Stocke le HASH SHA-256 du token (jamais le token brut).
-- TTL 1h, usage unique, audit trail complet.

CREATE TABLE IF NOT EXISTS password_resets (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash   TEXT        NOT NULL UNIQUE,   -- SHA-256(token_brut) en hex
  expires_at   TIMESTAMPTZ NOT NULL,
  used_at      TIMESTAMPTZ,                    -- NULL = non utilisé
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address   TEXT,
  user_agent   TEXT
);

CREATE INDEX IF NOT EXISTS idx_password_resets_token_hash ON password_resets (token_hash);
CREATE INDEX IF NOT EXISTS idx_password_resets_user_id    ON password_resets (user_id);
CREATE INDEX IF NOT EXISTS idx_password_resets_expires_at ON password_resets (expires_at);
