-- ── 005 — Infinite subcategories ────────────────────────────────────────────
--
-- Adds parent_id to categories for recursive nesting.
-- A category with parent_id NULL is a root category.
-- Depth is unbounded — the application builds the tree.

ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES categories(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_categories_parent
  ON categories(parent_id)
  WHERE parent_id IS NOT NULL;
