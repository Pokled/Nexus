-- 008 — Thread tags (community-defined)

CREATE TABLE tags (
  id           UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID      NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  name         VARCHAR(50) NOT NULL,
  slug         VARCHAR(50) NOT NULL,
  color        VARCHAR(7)  NOT NULL DEFAULT '#6366f1',
  created_at   TIMESTAMP   NOT NULL DEFAULT NOW(),
  UNIQUE (community_id, slug)
);

CREATE TABLE thread_tags (
  thread_id UUID NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  tag_id    UUID NOT NULL REFERENCES tags(id)    ON DELETE CASCADE,
  PRIMARY KEY (thread_id, tag_id)
);
