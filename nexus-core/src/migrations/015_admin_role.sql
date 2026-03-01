-- Migration 015: Add 'admin' to community_members role constraint
-- The initial migration only allowed ('owner', 'moderator', 'member').
-- Routes and middleware already reference 'admin' — fix the constraint.

ALTER TABLE community_members
  DROP CONSTRAINT IF EXISTS community_members_role;

ALTER TABLE community_members
  ADD CONSTRAINT community_members_role
  CHECK (role IN ('owner', 'admin', 'moderator', 'member'));

INSERT INTO schema_migrations (version) VALUES ('015') ON CONFLICT DO NOTHING;
