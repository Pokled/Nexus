-- Migration 019: Nexus Garden — community feature voting (v0.6)
-- Seeds are feature proposals; the community "waters" them to grow and eventually harvest

CREATE TABLE feature_seeds (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title            VARCHAR(200) NOT NULL,
  description      TEXT,
  category         VARCHAR(20) NOT NULL DEFAULT 'feature',
  planted_by       UUID REFERENCES users(id) ON DELETE SET NULL,
  planted_at       TIMESTAMP DEFAULT NOW(),
  water_count      INTEGER DEFAULT 0,
  harvest_date     TIMESTAMP,               -- set when implemented
  implemented_by   UUID REFERENCES users(id),

  CONSTRAINT valid_seed_category CHECK (category IN ('feature', 'design', 'plugin', 'event'))
);

-- Prevent double-watering per user
CREATE TABLE seed_waters (
  user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  seed_id    UUID REFERENCES feature_seeds(id) ON DELETE CASCADE,
  watered_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id, seed_id)
);

CREATE INDEX idx_seeds_planted_by ON feature_seeds(planted_by);
CREATE INDEX idx_seeds_popular    ON feature_seeds(category, water_count DESC);
CREATE INDEX idx_seeds_recent     ON feature_seeds(planted_at DESC);
