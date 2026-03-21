-- Migration 059 — Tracking pixel hits
-- Logs every time a honeypot scary-page pixel is loaded (initial view + revisits)

CREATE TABLE IF NOT EXISTS honeypot_pixel_hits (
  id          BIGSERIAL     PRIMARY KEY,
  incident_id TEXT          NOT NULL,
  ip          INET,
  user_agent  TEXT,
  referer     TEXT,
  viewed_at   TIMESTAMPTZ   DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS honeypot_pixel_hits_incident_id_idx ON honeypot_pixel_hits (incident_id);
CREATE INDEX IF NOT EXISTS honeypot_pixel_hits_viewed_at_idx   ON honeypot_pixel_hits (viewed_at DESC);
