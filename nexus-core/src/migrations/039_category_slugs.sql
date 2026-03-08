-- Migration 039 — Slugs pour les catégories (SEO niveau 3)
-- Les slugs sont générés par TypeScript (NFD correct) via regen-category-slugs.ts
ALTER TABLE categories ADD COLUMN IF NOT EXISTS slug VARCHAR(200);

CREATE UNIQUE INDEX IF NOT EXISTS categories_slug_unique ON categories(slug) WHERE slug IS NOT NULL;
