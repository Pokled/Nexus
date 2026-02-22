/**
 * NEXUS — Chat routes (REST)
 * WebSocket events are handled by src/socket/index.ts
 * Prefix: /api/v1/chat
 */

import { FastifyInstance } from 'fastify'
import { rateLimit } from '../middleware/rateLimit'
import { requireAuth } from '../middleware/auth'
import * as ChannelModel from '../models/channel'

// ── Resolve instance community (cached) ──────────────────────────────────────

import { db } from '../config/database'

let _communityId: string | null = null

async function getCommunityId(): Promise<string | null> {
  if (_communityId) return _communityId
  const slug = process.env.NEXUS_COMMUNITY_SLUG
  if (slug) {
    const { rows } = await db.query(`SELECT id FROM communities WHERE slug = $1`, [slug])
    if (rows[0]) { _communityId = rows[0].id; return _communityId }
  }
  const { rows } = await db.query(`SELECT id FROM communities ORDER BY created_at ASC LIMIT 1`)
  if (rows[0]) { _communityId = rows[0].id; return _communityId }
  return null
}

// ── Routes ───────────────────────────────────────────────────────────────────

export default async function chatRoutes(app: FastifyInstance) {

  // GET /api/v1/chat/channels — list all channels for this instance
  app.get('/channels', {
    preHandler: [rateLimit, requireAuth],
  }, async (_req, reply) => {
    const communityId = await getCommunityId()
    if (!communityId) return reply.code(503).send({ error: 'Community not configured' })

    const channels = await ChannelModel.listByCommunity(communityId)
    return reply.send({ channels })
  })

  // GET /api/v1/chat/channels/:id/history — paginated history (REST, for scroll-up)
  app.get('/channels/:id/history', {
    preHandler: [rateLimit, requireAuth],
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const q = request.query as { limit?: string; before?: string }
    const limit  = Math.min(Number(q.limit ?? 50), 100)
    const before = q.before

    const channel = await ChannelModel.findById(id)
    if (!channel) return reply.code(404).send({ error: 'Channel not found' })

    const messages = await ChannelModel.getHistory(id, limit, before)
    return reply.send({ messages })
  })

  // GET /api/v1/chat/members?q= — autocomplete @mention (members of this community)
  app.get('/members', {
    preHandler: [rateLimit, requireAuth],
  }, async (request, reply) => {
    const communityId = await getCommunityId()
    if (!communityId) return reply.code(503).send({ error: 'Community not configured' })

    const { q } = request.query as { q?: string }
    const search = (q ?? '').trim()

    const { rows } = await db.query<{ username: string; avatar: string | null }>(
      `SELECT u.username, u.avatar
       FROM users u
       JOIN community_members cm ON cm.user_id = u.id
       WHERE cm.community_id = $1
         AND ($2 = '' OR u.username ILIKE $3)
       ORDER BY u.username ASC
       LIMIT 8`,
      [communityId, search, `${search}%`]
    )

    return reply.send({ members: rows })
  })
}
