import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { db } from '../config/database'
import { validate } from '../middleware/validate'
import { rateLimit } from '../middleware/rateLimit'

const SearchQuery = z.object({
  q:      z.string().min(1).max(200),
  type:   z.enum(['threads', 'posts', 'all']).optional(),
  limit:  z.coerce.number().int().min(1).max(50).optional(),
  offset: z.coerce.number().int().min(0).optional(),
})

// Resolve the community_id for this instance (cached)
let _communityId: string | null = null
async function getCommunityId(): Promise<string | null> {
  if (_communityId) return _communityId
  const slug = process.env.NEXUS_COMMUNITY_SLUG
  if (slug) {
    const { rows } = await db.query(
      `SELECT c.id FROM communities c WHERE c.slug = $1 LIMIT 1`,
      [slug]
    )
    if (rows[0]) { _communityId = rows[0].id; return _communityId }
  }
  const { rows } = await db.query(`SELECT id FROM communities ORDER BY created_at ASC LIMIT 1`)
  if (rows[0]) { _communityId = rows[0].id; return _communityId }
  return null
}

export default async function searchRoutes(app: FastifyInstance) {
  // GET /api/v1/search?q=...&type=threads|posts|all&limit=20&offset=0
  app.get('/', {
    preHandler: [rateLimit, validate({ query: SearchQuery })],
  }, async (request, reply) => {
    const { q, type = 'all', limit = 20, offset = 0 } = request.query as z.infer<typeof SearchQuery>
    const communityId = await getCommunityId()

    const doThreads = type === 'threads' || type === 'all'
    const doPosts   = type === 'posts'   || type === 'all'

    const [threadsRes, postsRes] = await Promise.all([
      doThreads && communityId
        ? db.query(
            `SELECT t.id, t.title, t.created_at,
                    u.username AS author_username,
                    cat.id     AS category_id,
                    cat.name   AS category_name,
                    ts_headline('french', t.title, plainto_tsquery('french', $1),
                      'StartSel=<mark>, StopSel=</mark>, MaxWords=20, MinWords=10'
                    ) AS headline
             FROM threads t
             JOIN users u      ON u.id = t.author_id
             JOIN categories cat ON cat.id = t.category_id
             WHERE cat.community_id = $2
               AND t.search_vector @@ plainto_tsquery('french', $1)
             ORDER BY ts_rank(t.search_vector, plainto_tsquery('french', $1)) DESC
             LIMIT $3 OFFSET $4`,
            [q, communityId, limit, offset]
          )
        : Promise.resolve({ rows: [] as any[] }),

      doPosts && communityId
        ? db.query(
            `SELECT p.id, p.thread_id, p.created_at,
                    t.title    AS thread_title,
                    cat.id     AS category_id,
                    u.username AS author_username,
                    ts_headline('french',
                      regexp_replace(p.content, '<[^>]+>', ' ', 'g'),
                      plainto_tsquery('french', $1),
                      'StartSel=<mark>, StopSel=</mark>, MaxWords=30, MinWords=15'
                    ) AS headline
             FROM posts p
             JOIN users u   ON u.id = p.author_id
             JOIN threads t ON t.id = p.thread_id
             JOIN categories cat ON cat.id = t.category_id
             WHERE cat.community_id = $2
               AND p.search_vector @@ plainto_tsquery('french', $1)
             ORDER BY ts_rank(p.search_vector, plainto_tsquery('french', $1)) DESC
             LIMIT $3 OFFSET $4`,
            [q, communityId, limit, offset]
          )
        : Promise.resolve({ rows: [] as any[] }),
    ])

    return reply.send({
      query:   q,
      threads: threadsRes.rows,
      posts:   postsRes.rows,
    })
  })
}
