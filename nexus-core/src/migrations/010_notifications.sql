-- 010 — User notifications

CREATE TABLE notifications (
  id         UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type       VARCHAR(50) NOT NULL,  -- 'thread_reply' | 'post_thanks' | 'mention'
  actor_id   UUID    REFERENCES users(id) ON DELETE SET NULL,
  thread_id  UUID    REFERENCES threads(id) ON DELETE CASCADE,
  post_id    UUID    REFERENCES posts(id)   ON DELETE CASCADE,
  is_read    BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notif_user ON notifications(user_id, is_read, created_at DESC);
