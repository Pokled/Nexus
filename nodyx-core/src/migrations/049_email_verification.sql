-- Migration 049: Email verification
-- Existing users default to verified (don't lock out current members).
-- New users created after this migration get email_verified = false when SMTP is configured.

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS email_verified          BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS email_verification_token TEXT;

CREATE INDEX IF NOT EXISTS idx_users_email_verification_token
  ON users(email_verification_token)
  WHERE email_verification_token IS NOT NULL;
