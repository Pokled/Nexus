-- 007 — Post reactions (emoji) + thanks

CREATE TABLE post_reactions (
  post_id    UUID        NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  emoji      VARCHAR(10) NOT NULL,
  created_at TIMESTAMP   NOT NULL DEFAULT NOW(),
  PRIMARY KEY (post_id, user_id, emoji)
);
CREATE INDEX idx_post_reactions_post ON post_reactions(post_id);

CREATE TABLE post_thanks (
  post_id    UUID      NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id    UUID      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (post_id, user_id)
);
CREATE INDEX idx_post_thanks_post ON post_thanks(post_id);
