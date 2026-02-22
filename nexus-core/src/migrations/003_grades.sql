-- ============================================================
-- NEXUS — Migration 003
-- 003_grades.sql
-- ============================================================

BEGIN;

-- Grades personnalisés par communauté
CREATE TABLE community_grades (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
  name         VARCHAR(100) NOT NULL,
  color        VARCHAR(7)   DEFAULT '#99AAB5',
  position     INTEGER      DEFAULT 0,
  permissions  JSONB        DEFAULT '{}',
  created_at   TIMESTAMP    DEFAULT NOW()
);

-- Grade attribué à un membre
ALTER TABLE community_members
ADD COLUMN grade_id UUID REFERENCES community_grades(id) ON DELETE SET NULL;

-- Index
CREATE INDEX idx_grades_community ON community_grades(community_id);
CREATE INDEX idx_members_grade    ON community_members(grade_id);

COMMIT;
