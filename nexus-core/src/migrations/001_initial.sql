-- ============================================================
-- NEXUS — Migration initiale
-- 001_initial.sql
-- ============================================================

BEGIN;

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";  -- gen_random_uuid()

-- ============================================================
-- USERS
-- ============================================================

CREATE TABLE users (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  username    VARCHAR(50) NOT NULL UNIQUE,
  email       VARCHAR(255) NOT NULL UNIQUE,
  password    VARCHAR(255) NOT NULL,
  avatar      VARCHAR(500),
  bio         TEXT,
  points      INTEGER     NOT NULL DEFAULT 0,
  created_at  TIMESTAMP   NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMP   NOT NULL DEFAULT NOW(),

  CONSTRAINT users_username_length CHECK (char_length(username) >= 3),
  CONSTRAINT users_points_positive CHECK (points >= 0)
);

CREATE INDEX idx_users_username ON users (username);
CREATE INDEX idx_users_email    ON users (email);
CREATE INDEX idx_users_points   ON users (points DESC);

-- ============================================================
-- COMMUNITIES
-- ============================================================

CREATE TABLE communities (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(100) NOT NULL,
  slug        VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  avatar      VARCHAR(500),
  owner_id    UUID         NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  is_public   BOOLEAN      NOT NULL DEFAULT true,
  created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMP    NOT NULL DEFAULT NOW(),

  CONSTRAINT communities_slug_format CHECK (slug ~ '^[a-z0-9-]+$'),
  CONSTRAINT communities_name_length CHECK (char_length(name) >= 2)
);

CREATE INDEX idx_communities_slug     ON communities (slug);
CREATE INDEX idx_communities_owner_id ON communities (owner_id);
CREATE INDEX idx_communities_public   ON communities (is_public) WHERE is_public = true;

-- ============================================================
-- COMMUNITY_MEMBERS
-- ============================================================

CREATE TABLE community_members (
  community_id UUID        NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  user_id      UUID        NOT NULL REFERENCES users(id)       ON DELETE CASCADE,
  role         VARCHAR(20) NOT NULL DEFAULT 'member',
  joined_at    TIMESTAMP   NOT NULL DEFAULT NOW(),

  PRIMARY KEY (community_id, user_id),
  CONSTRAINT community_members_role CHECK (role IN ('owner', 'moderator', 'member'))
);

CREATE INDEX idx_community_members_user_id ON community_members (user_id);

-- ============================================================
-- CATEGORIES
-- ============================================================

CREATE TABLE categories (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID         NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  name         VARCHAR(100) NOT NULL,
  description  TEXT,
  position     INTEGER      NOT NULL DEFAULT 0,
  created_at   TIMESTAMP    NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMP    NOT NULL DEFAULT NOW(),

  CONSTRAINT categories_name_length       CHECK (char_length(name) >= 1),
  CONSTRAINT categories_position_positive CHECK (position >= 0)
);

CREATE INDEX idx_categories_community_id ON categories (community_id);
CREATE INDEX idx_categories_position     ON categories (community_id, position);

-- ============================================================
-- THREADS
-- ============================================================

CREATE TABLE threads (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID         NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  author_id   UUID         NOT NULL REFERENCES users(id)      ON DELETE RESTRICT,
  title       VARCHAR(300) NOT NULL,
  is_pinned   BOOLEAN      NOT NULL DEFAULT false,
  is_locked   BOOLEAN      NOT NULL DEFAULT false,
  views       INTEGER      NOT NULL DEFAULT 0,
  created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMP    NOT NULL DEFAULT NOW(),

  CONSTRAINT threads_title_length   CHECK (char_length(title) >= 3),
  CONSTRAINT threads_views_positive CHECK (views >= 0)
);

CREATE INDEX idx_threads_category_id ON threads (category_id);
CREATE INDEX idx_threads_author_id   ON threads (author_id);
CREATE INDEX idx_threads_pinned      ON threads (category_id, is_pinned DESC, created_at DESC);
CREATE INDEX idx_threads_created_at  ON threads (created_at DESC);

-- ============================================================
-- POSTS
-- ============================================================

CREATE TABLE posts (
  id         UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id  UUID      NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  author_id  UUID      NOT NULL REFERENCES users(id)   ON DELETE RESTRICT,
  content    TEXT      NOT NULL,
  is_edited  BOOLEAN   NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

  CONSTRAINT posts_content_not_empty CHECK (char_length(content) >= 1)
);

CREATE INDEX idx_posts_thread_id  ON posts (thread_id, created_at ASC);
CREATE INDEX idx_posts_author_id  ON posts (author_id);
CREATE INDEX idx_posts_created_at ON posts (created_at DESC);

-- ============================================================
-- updated_at auto-update trigger
-- ============================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_communities_updated_at
  BEFORE UPDATE ON communities
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_threads_updated_at
  BEFORE UPDATE ON threads
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMIT;
