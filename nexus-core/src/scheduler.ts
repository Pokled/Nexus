/**
 * Scheduler — tâches périodiques de nexus-core
 * Actuellement : ping directory toutes les 5 minutes
 */
import { db } from './config/database'
import { Server } from 'socket.io'

const PING_INTERVAL_MS = 5 * 60 * 1000 // 5 minutes

async function pingDirectory(io: Server) {
  const token = process.env.DIRECTORY_TOKEN
  if (!token) return // pas configuré, on skip silencieusement

  try {
    const [membersResult, instanceResult] = await Promise.all([
      db.query('SELECT COUNT(*) AS count FROM users'),
      db.query("SELECT url FROM directory_instances WHERE token = $1", [token]),
    ])

    const members = parseInt(membersResult.rows[0]?.count ?? '0', 10)
    const online  = io.sockets.sockets.size

    const targetUrl = instanceResult.rows[0]?.url ?? process.env.FRONTEND_URL ?? 'http://localhost:3000'
    const apiBase   = process.env.SELF_URL ?? 'http://localhost:3000'

    const res = await fetch(`${apiBase}/api/directory/ping`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ token, members, online }),
    })

    if (res.ok) {
      console.log(`[Scheduler] Directory ping OK — ${members} membres, ${online} en ligne`)
    } else {
      console.warn(`[Scheduler] Directory ping failed: HTTP ${res.status}`)
    }
  } catch (err) {
    console.error('[Scheduler] Directory ping error:', err)
  }
}

export function startScheduler(io: Server) {
  // Premier ping au démarrage (après 10s pour laisser le temps au serveur)
  setTimeout(() => pingDirectory(io), 10_000)

  // Puis toutes les 5 minutes
  setInterval(() => pingDirectory(io), PING_INTERVAL_MS)

  console.log('[Scheduler] Démarré — ping directory toutes les 5 min')
}
