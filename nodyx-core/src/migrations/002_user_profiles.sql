-- ============================================================
-- NEXUS — Migration 002
-- 002_user_profiles.sql
-- ============================================================

BEGIN;

CREATE TABLE user_profiles (
  user_id       UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  display_name  VARCHAR(100),
  avatar_url    VARCHAR(500),
  banner_url    VARCHAR(500),
  bio           TEXT,
  status        VARCHAR(100),
  location      VARCHAR(100),
  tags          TEXT[]    DEFAULT '{}',
  links         JSONB     DEFAULT '[]',
  updated_at    TIMESTAMP DEFAULT NOW()
);

-- Créer un profil vide automatiquement à chaque nouvel utilisateur
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_user_created
AFTER INSERT ON users
FOR EACH ROW EXECUTE FUNCTION create_user_profile();

-- Créer les profils manquants pour les utilisateurs existants
INSERT INTO user_profiles (user_id)
SELECT id FROM users
WHERE id NOT IN (SELECT user_id FROM user_profiles);

COMMIT;
