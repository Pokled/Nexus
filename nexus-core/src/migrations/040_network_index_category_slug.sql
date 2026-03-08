-- Migration 040 — Ajout category_slug dans network_index (URLs avec slugs cross-instances)
ALTER TABLE network_index ADD COLUMN IF NOT EXISTS category_slug VARCHAR(200);
