-- 060 — Honeypot advanced features
-- Tables: honeypot_credential_attempts, honeypot_fingerprints

-- ── Feature 1 : Faux formulaire de login ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS honeypot_credential_attempts (
  id            BIGSERIAL    PRIMARY KEY,
  incident_id   TEXT         NOT NULL,
  ip            INET         NOT NULL,
  login_path    TEXT         NOT NULL DEFAULT '/',
  username      TEXT         NOT NULL DEFAULT '',
  password      TEXT         NOT NULL DEFAULT '',
  country       TEXT,
  city          TEXT,
  isp           TEXT,
  user_agent    TEXT,
  attempted_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hca_ip          ON honeypot_credential_attempts(ip);
CREATE INDEX IF NOT EXISTS idx_hca_attempted   ON honeypot_credential_attempts(attempted_at DESC);
CREATE INDEX IF NOT EXISTS idx_hca_incident    ON honeypot_credential_attempts(incident_id);

-- ── Feature 2 : Fingerprint persistant ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS honeypot_fingerprints (
  fp_hash      TEXT         PRIMARY KEY,
  visits       INTEGER      NOT NULL DEFAULT 1,
  ip_list      TEXT[]       NOT NULL DEFAULT '{}',
  incident_ids TEXT[]       NOT NULL DEFAULT '{}',
  screen       TEXT,
  cores        INTEGER,
  tz           TEXT,
  first_seen   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  last_seen    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hfp_last_seen ON honeypot_fingerprints(last_seen DESC);
