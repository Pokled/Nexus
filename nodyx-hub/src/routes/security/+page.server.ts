import { getPool } from '$lib/server/pg';
import type { PageServerLoad } from './$types';

// ── Tool detection (mirrors honeypot.ts) ──────────────────────────────────────
function detectTool(ua: string): string {
  const u = (ua ?? '').toLowerCase();
  if (/curl\//.test(u))              return 'curl';
  if (/python-requests/.test(u))     return 'python-requests';
  if (/python\//.test(u))            return 'python';
  if (/nikto/.test(u))               return 'Nikto';
  if (/sqlmap/.test(u))              return 'sqlmap';
  if (/nmap/.test(u))                return 'Nmap';
  if (/nuclei/.test(u))              return 'Nuclei';
  if (/gobuster/.test(u))            return 'Gobuster';
  if (/dirbuster/.test(u))           return 'DirBuster';
  if (/masscan/.test(u))             return 'Masscan';
  if (/zgrab/.test(u))               return 'ZGrab';
  if (/go-http-client/.test(u))      return 'Go HTTP';
  if (/wget\//.test(u))              return 'wget';
  if (/hydra/.test(u))               return 'Hydra';
  if (/metasploit/.test(u))          return 'Metasploit';
  if (/acunetix/.test(u))            return 'Acunetix';
  if (/nessus/.test(u))              return 'Nessus';
  if (/openvas/.test(u))             return 'OpenVAS';
  if (/burpsuite|burp/.test(u))      return 'Burp Suite';
  if (/semrush|ahrefs|mj12bot|dotbot/.test(u)) return 'SEO Bot';
  if (/mozilla\//.test(u))           return 'Browser';
  return 'Unknown';
}

export const load: PageServerLoad = async () => {
  const pool = getPool();

  const [
    statsRow,
    timelineRows,
    topIpsRows,
    topPathsRows,
    topMethodsRows,
    byInstanceRows,
    localBlocklistRows,
    networkBlocklistRows,
    recentRows,
    pixelStatsRow,
    pixelHitsRows,
    credentialAttemptsRows,
    credentialStatsRow,
    trapStatsRows,
    fingerprintRows,
  ] = await Promise.all([

    // ── Global stats ────────────────────────────────────────────────────────
    pool.query(`
      SELECT
        COUNT(*)                                                        AS total,
        COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '1 day')  AS today,
        COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') AS week7,
        COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '1 hour') AS last_hour,
        COUNT(DISTINCT ip) FILTER (WHERE created_at > NOW() - INTERVAL '30 days') AS unique_ips_30d,
        COUNT(DISTINCT ip)                                              AS blocked_total
      FROM honeypot_hits
    `).catch(() => ({ rows: [{ total: '0', today: '0', week7: '0', last_hour: '0', unique_ips_30d: '0', blocked_total: '0' }] })),

    // ── Hourly timeline — last 48h ──────────────────────────────────────────
    pool.query(`
      SELECT
        date_trunc('hour', created_at) AS hour,
        COUNT(*) AS hits
      FROM honeypot_hits
      WHERE created_at > NOW() - INTERVAL '48 hours'
      GROUP BY 1
      ORDER BY 1
    `).catch(() => ({ rows: [] })),

    // ── Top offensive IPs (local instance, last 30d) ────────────────────────
    pool.query(`
      SELECT
        ip,
        COUNT(*)         AS hits,
        MAX(country)     AS country,
        MAX(city)        AS city,
        MAX(isp)         AS isp,
        MAX(org)         AS org,
        MAX(created_at)  AS last_seen,
        MIN(created_at)  AS first_seen,
        array_agg(DISTINCT path ORDER BY path) FILTER (WHERE path IS NOT NULL) AS paths
      FROM honeypot_hits
      WHERE created_at > NOW() - INTERVAL '30 days'
      GROUP BY ip
      ORDER BY hits DESC
      LIMIT 20
    `).catch(() => ({ rows: [] })),

    // ── Top targeted paths (local, last 30d) ───────────────────────────────
    pool.query(`
      SELECT path, COUNT(*) AS hits
      FROM honeypot_hits
      WHERE created_at > NOW() - INTERVAL '30 days'
      GROUP BY path
      ORDER BY hits DESC
      LIMIT 15
    `).catch(() => ({ rows: [] })),

    // ── Methods breakdown ───────────────────────────────────────────────────
    pool.query(`
      SELECT method, COUNT(*) AS hits
      FROM honeypot_hits
      WHERE created_at > NOW() - INTERVAL '30 days'
      GROUP BY method
      ORDER BY hits DESC
    `).catch(() => ({ rows: [] })),

    // ── Per-instance breakdown (federated — reported_ips) ──────────────────
    pool.query(`
      SELECT
        instance_slug,
        COUNT(*)               AS total_hits,
        COUNT(DISTINCT ip)     AS unique_ips,
        MAX(reported_at)       AS last_hit,
        MIN(reported_at)       AS first_hit,
        (
          SELECT ri2.path
          FROM reported_ips ri2
          WHERE ri2.instance_slug = ri.instance_slug
            AND ri2.reported_at > NOW() - INTERVAL '30 days'
          GROUP BY ri2.path
          ORDER BY COUNT(*) DESC
          LIMIT 1
        ) AS top_path
      FROM reported_ips ri
      WHERE reported_at > NOW() - INTERVAL '30 days'
      GROUP BY instance_slug
      ORDER BY total_hits DESC
    `).catch(() => ({ rows: [] })),

    // ── Local blocklist — toutes les IPs qui ont touché le honeypot (local) ─
    pool.query(`
      SELECT
        ip,
        COUNT(*)        AS total_hits,
        MAX(country)    AS country,
        MAX(city)       AS city,
        MAX(isp)        AS isp,
        MAX(org)        AS org,
        MIN(created_at) AS first_seen,
        MAX(created_at) AS last_seen,
        array_agg(DISTINCT path ORDER BY path) FILTER (WHERE path IS NOT NULL) AS paths
      FROM honeypot_hits
      GROUP BY ip
      ORDER BY total_hits DESC, last_seen DESC
      LIMIT 500
    `).catch(() => ({ rows: [] })),

    // ── Network blocklist (federated reported_ips — threshold) ────────────
    pool.query(`
      SELECT
        ip::text,
        COUNT(*)                                                   AS total_hits,
        COUNT(DISTINCT instance_slug)                              AS instance_count,
        array_agg(DISTINCT instance_slug ORDER BY instance_slug)   AS instances,
        MIN(reported_at)                                           AS first_seen,
        MAX(reported_at)                                           AS last_seen
      FROM reported_ips
      WHERE reported_at > NOW() - INTERVAL '30 days'
      GROUP BY ip
      HAVING COUNT(DISTINCT instance_slug) >= 2 OR COUNT(*) >= 3
      ORDER BY total_hits DESC
      LIMIT 200
    `).catch(() => ({ rows: [] })),

    // ── Last 100 detailed attacks (local) ──────────────────────────────────
    pool.query(`
      SELECT
        incident_id, ip, path, method,
        user_agent, country, city, isp, org,
        headers, created_at
      FROM honeypot_hits
      ORDER BY created_at DESC
      LIMIT 100
    `).catch(() => ({ rows: [] })),

    // ── Tracking pixel — aggregate stats ───────────────────────────────────
    pool.query(`
      SELECT
        COUNT(*)                                                           AS total,
        COUNT(*) FILTER (WHERE viewed_at > NOW() - INTERVAL '1 day')      AS today,
        COUNT(DISTINCT incident_id)                                        AS unique_incidents
      FROM honeypot_pixel_hits
    `).catch(() => ({ rows: [{ total: '0', today: '0', unique_incidents: '0' }] })),

    // ── Tracking pixel — last 50 hits with incident context ────────────────
    pool.query(`
      SELECT
        p.incident_id,
        p.ip::text        AS pixel_ip,
        p.user_agent,
        p.referer,
        p.viewed_at,
        h.ip::text        AS original_ip,
        h.country,
        h.city,
        h.isp,
        h.path            AS original_path
      FROM honeypot_pixel_hits p
      LEFT JOIN honeypot_hits h ON h.incident_id = p.incident_id
      ORDER BY p.viewed_at DESC
      LIMIT 50
    `).catch(() => ({ rows: [] })),

    // ── Credential attempts (last 100) ──────────────────────────────────
    pool.query(`
      SELECT ip::text, username, password, login_path, country, city, isp, attempted_at
      FROM honeypot_credential_attempts
      ORDER BY attempted_at DESC LIMIT 100
    `).catch(() => ({ rows: [] })),

    // ── Credential stats ────────────────────────────────────────────────
    pool.query(`
      SELECT
        COUNT(*) AS total,
        COUNT(DISTINCT ip::text) AS unique_ips,
        COUNT(*) FILTER (WHERE attempted_at > NOW() - INTERVAL '1 day') AS today
      FROM honeypot_credential_attempts
    `).catch(() => ({ rows: [{ total: '0', unique_ips: '0', today: '0' }] })),

    // ── Pièges actifs — agrégat par type × cible (30j) ─────────────────
    pool.query(`
      WITH traps AS (
        -- Faux logins (credential_attempts)
        SELECT
          'login'        AS trap_type,
          login_path     AS target,
          COUNT(*)       AS hits,
          MAX(attempted_at) AS last_hit
        FROM honeypot_credential_attempts
        WHERE attempted_at > NOW() - INTERVAL '30 days'
        GROUP BY login_path

        UNION ALL

        -- Canary files (honeypot_hits filtrés par extension)
        SELECT
          'canary'       AS trap_type,
          path           AS target,
          COUNT(*)       AS hits,
          MAX(created_at) AS last_hit
        FROM honeypot_hits
        WHERE created_at > NOW() - INTERVAL '30 days'
          AND (
            path ~* '\\.env(\\.|$)' OR path ~* 'backup\\.sql' OR path ~* 'dump\\.sql'
            OR path ~* 'db\\.sql' OR path ~* 'database\\.sql' OR path ~* 'config\\.json'
            OR path ~* 'credentials\\.json' OR path ~* 'id_rsa' OR path ~* 'database\\.yml'
            OR path ~* 'wp-config\\.php' OR path ~* 'config\\.php'
          )
        GROUP BY path

        UNION ALL

        -- Honeytokens cliqués
        SELECT
          'honeytoken'   AS trap_type,
          '/_ht'         AS target,
          COUNT(*)       AS hits,
          MAX(created_at) AS last_hit
        FROM honeypot_hits
        WHERE created_at > NOW() - INTERVAL '30 days'
          AND (path = '/_ht' OR path LIKE '%/_ht%')
        GROUP BY target
      )
      SELECT trap_type, target, hits, last_hit
      FROM traps
      ORDER BY last_hit DESC
      LIMIT 30
    `).catch(() => ({ rows: [] })),

    // ── Fingerprints récurrents (visits > 1) ────────────────────────────
    pool.query(`
      SELECT
        fp_hash,
        visits,
        ip_list,
        incident_ids,
        first_seen,
        last_seen
      FROM honeypot_fingerprints
      ORDER BY visits DESC, last_seen DESC
      LIMIT 50
    `).catch(() => ({ rows: [] })),
  ]);

  const raw   = statsRow.rows[0] ?? {};
  const stats = {
    total:        parseInt(raw.total          ?? '0', 10),
    today:        parseInt(raw.today          ?? '0', 10),
    week7:        parseInt(raw.week7          ?? '0', 10),
    lastHour:     parseInt(raw.last_hour      ?? '0', 10),
    uniqueIps30d: parseInt(raw.unique_ips_30d ?? '0', 10),
    blocked:      parseInt(raw.blocked_total  ?? '0', 10),  // toutes les IPs distinctes vues localement
    networkBlocked: networkBlocklistRows.rows.length,       // IPs confirmées multi-instances
    instances:    byInstanceRows.rows.length,
  };

  // ── Build 48h sparkline (fill every hour) ─────────────────────────────────
  const now = new Date();
  const timeline: { label: string; hits: number }[] = [];
  for (let i = 47; i >= 0; i--) {
    const h = new Date(now);
    h.setMinutes(0, 0, 0);
    h.setHours(h.getHours() - i);
    const isoHour = h.toISOString().slice(0, 13);
    const found   = (timelineRows.rows as any[]).find(
      r => new Date(r.hour).toISOString().slice(0, 13) === isoHour
    );
    timeline.push({
      label: `${String(h.getDate()).padStart(2,'0')}/${String(h.getMonth()+1).padStart(2,'0')} ${String(h.getHours()).padStart(2,'0')}h`,
      hits:  found ? parseInt(found.hits, 10) : 0,
    });
  }

  // ── Tool breakdown from recent hits ───────────────────────────────────────
  const toolCounts: Record<string, number> = {};
  for (const row of recentRows.rows as any[]) {
    const tool = detectTool(row.user_agent ?? '');
    toolCounts[tool] = (toolCounts[tool] ?? 0) + 1;
  }
  const toolBreakdown = Object.entries(toolCounts)
    .sort((a, b) => b[1] - a[1]);

  // ── Annotate recent hits with tool ────────────────────────────────────────
  const recentHits = (recentRows.rows as any[]).map(row => ({
    ...row,
    tool: detectTool(row.user_agent ?? ''),
  }));

  const pixelRaw   = pixelStatsRow.rows[0] ?? {}
  const pixelStats = {
    total:           parseInt(pixelRaw.total            ?? '0', 10),
    today:           parseInt(pixelRaw.today            ?? '0', 10),
    uniqueIncidents: parseInt(pixelRaw.unique_incidents ?? '0', 10),
  }

  const credRaw   = credentialStatsRow.rows[0] ?? {}
  const credentialStats = {
    total:     parseInt(credRaw.total      ?? '0', 10),
    uniqueIps: parseInt(credRaw.unique_ips ?? '0', 10),
    today:     parseInt(credRaw.today      ?? '0', 10),
  }

  return {
    stats,
    timeline,
    topIps:              topIpsRows.rows,
    topPaths:            topPathsRows.rows,
    topMethods:          topMethodsRows.rows,
    byInstance:          byInstanceRows.rows,
    localBlocklist:      localBlocklistRows.rows,
    networkBlocklist:    networkBlocklistRows.rows,
    recentHits,
    toolBreakdown,
    pixelStats,
    pixelHits:           pixelHitsRows.rows,
    credentialAttempts:  credentialAttemptsRows.rows,
    credentialStats,
    trapStats:           trapStatsRows.rows,
    fingerprints:        fingerprintRows.rows,
    updatedAt:    new Date().toISOString(),
  };
};
