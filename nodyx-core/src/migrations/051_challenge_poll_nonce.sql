-- Migration 051 : ajout poll_nonce sur authenticator_challenges
-- Protège le polling de statut contre les IDOR (accès non autorisé via UUID connu)
ALTER TABLE authenticator_challenges
  ADD COLUMN IF NOT EXISTS poll_nonce TEXT;
