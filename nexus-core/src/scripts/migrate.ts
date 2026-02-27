import fs   from 'fs'
import path from 'path'
import { db } from '../config/database'

// ── Migration runner ──────────────────────────────────────────────────────────
//
// Runs all pending SQL migrations in nexus-core/src/migrations/ in order.
// Tracks applied migrations in the schema_migrations table.
// Safe to call on every server start — already-applied migrations are skipped.

export async function runMigrations(): Promise<void> {
  await db.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version VARCHAR(255) PRIMARY KEY,
      run_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)

  const migrationsDir = path.join(process.cwd(), 'src', 'migrations')
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort()

  let applied = 0

  for (const file of files) {
    const version = file.replace('.sql', '')

    const { rowCount } = await db.query(
      'SELECT 1 FROM schema_migrations WHERE version = $1',
      [version]
    )

    if (rowCount && rowCount > 0) continue

    console.log(`[migrate] Applying ${file}...`)
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8')
    await db.query(sql)
    await db.query('INSERT INTO schema_migrations (version) VALUES ($1)', [version])
    applied++
  }

  if (applied === 0) {
    console.log('[migrate] Database up to date.')
  } else {
    console.log(`[migrate] ✓ ${applied} migration(s) applied.`)
  }
}
