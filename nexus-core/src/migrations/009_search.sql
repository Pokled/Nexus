-- 009 — Full-text search vectors + GIN indexes

ALTER TABLE threads ADD COLUMN IF NOT EXISTS search_vector tsvector;
ALTER TABLE posts   ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Populate existing rows
UPDATE threads SET search_vector = to_tsvector('french', COALESCE(title, ''));
UPDATE posts   SET search_vector = to_tsvector('french', COALESCE(regexp_replace(content, '<[^>]+>', ' ', 'g'), ''));

-- Trigger function for threads
CREATE OR REPLACE FUNCTION threads_search_vector_trigger() RETURNS trigger AS $$
BEGIN
  NEW.search_vector := to_tsvector('french', COALESCE(NEW.title, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS threads_search_vector_update ON threads;
CREATE TRIGGER threads_search_vector_update
  BEFORE INSERT OR UPDATE ON threads
  FOR EACH ROW EXECUTE FUNCTION threads_search_vector_trigger();

-- Trigger function for posts
CREATE OR REPLACE FUNCTION posts_search_vector_trigger() RETURNS trigger AS $$
BEGIN
  NEW.search_vector := to_tsvector('french', COALESCE(regexp_replace(NEW.content, '<[^>]+>', ' ', 'g'), ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS posts_search_vector_update ON posts;
CREATE TRIGGER posts_search_vector_update
  BEFORE INSERT OR UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION posts_search_vector_trigger();

-- GIN indexes
CREATE INDEX IF NOT EXISTS idx_threads_search ON threads USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_posts_search   ON posts   USING GIN(search_vector);
