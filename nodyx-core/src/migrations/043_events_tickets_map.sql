-- Migration 043 — Billetterie + géolocalisation sur events
-- Permet d'afficher un prix, un lien d'achat, et une carte OSM.

ALTER TABLE events ADD COLUMN IF NOT EXISTS ticket_price    NUMERIC(10,2);    -- NULL = gratuit
ALTER TABLE events ADD COLUMN IF NOT EXISTS ticket_currency VARCHAR(3)  NOT NULL DEFAULT 'EUR';
ALTER TABLE events ADD COLUMN IF NOT EXISTS ticket_url      TEXT;              -- lien achat externe
ALTER TABLE events ADD COLUMN IF NOT EXISTS location_lat    DOUBLE PRECISION;  -- pour OSM embed
ALTER TABLE events ADD COLUMN IF NOT EXISTS location_lng    DOUBLE PRECISION;
