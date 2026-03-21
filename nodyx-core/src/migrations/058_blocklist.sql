-- Migration 058 — Distributed IP blocklist
-- IPs reported by honeypot triggers across Nodyx instances

CREATE TABLE IF NOT EXISTS reported_ips (
  id            SERIAL      PRIMARY KEY,
  ip            INET        NOT NULL,
  reason        TEXT        NOT NULL DEFAULT 'honeypot',
  path          TEXT,
  instance_slug TEXT        NOT NULL DEFAULT 'unknown',
  reported_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reported_ips_ip ON reported_ips(ip);
CREATE INDEX IF NOT EXISTS idx_reported_ips_reported_at ON reported_ips(reported_at);
CREATE INDEX IF NOT EXISTS idx_reported_ips_instance ON reported_ips(instance_slug);
