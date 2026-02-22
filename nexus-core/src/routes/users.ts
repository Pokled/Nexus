import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'crypto'
import { createWriteStream, mkdirSync } from 'fs'
import { pipeline } from 'stream/promises'
import path from 'path'
import { rateLimit } from '../middleware/rateLimit'
import { requireAuth } from '../middleware/auth'
import { validate } from '../middleware/validate'
import * as UserModel from '../models/user'
import { db, redis } from '../config/database'

const UPLOADS_DIR = path.join(process.cwd(), 'uploads')
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const ALLOWED_TYPES = ['avatar', 'banner']

const PatchProfileBody = z.object({
  display_name:      z.string().max(100).nullable().optional(),
  bio:               z.string().max(2000).nullable().optional(),
  status:            z.string().max(100).nullable().optional(),
  location:          z.string().max(100).nullable().optional(),
  avatar_url:        z.string().max(500).nullable().optional(),
  banner_url:        z.string().max(500).nullable().optional(),
  tags:              z.array(z.string().max(30)).max(10).optional(),
  links:             z.array(z.object({
    label: z.string().max(50),
    url:   z.string().url().max(500),
  })).max(10).optional(),
  // Phase 1 social fields
  github_username:    z.string().regex(/^[a-zA-Z0-9-]{1,39}$/).optional().nullable(),
  // Phase 2 social fields — accepted but no widget yet
  youtube_channel:    z.string().max(200).optional().nullable(),
  twitter_username:   z.string().max(100).optional().nullable(),
  instagram_username: z.string().max(100).optional().nullable(),
  website_url:        z.string().url().max(500).optional().nullable(),
})

const GITHUB_CACHE_TTL = 3600 // 1 hour

// Cached community id for role lookups
let _communityIdForUsers: string | null = null
async function getCommunityIdForUsers(): Promise<string | null> {
  if (_communityIdForUsers) return _communityIdForUsers
  const slug = process.env.NEXUS_COMMUNITY_SLUG
  const { rows } = await db.query<{ id: string }>(
    slug
      ? `SELECT id FROM communities WHERE slug = $1 LIMIT 1`
      : `SELECT id FROM communities ORDER BY created_at ASC LIMIT 1`,
    slug ? [slug] : []
  )
  _communityIdForUsers = rows[0]?.id ?? null
  return _communityIdForUsers
}

export default async function userRoutes(app: FastifyInstance) {
  // GET /api/v1/users/me
  app.get('/me', {
    preHandler: [rateLimit, requireAuth],
  }, async (request, reply) => {
    const user = await UserModel.findById(request.user!.userId)
    if (!user) {
      return reply.code(404).send({ error: 'User not found', code: 'NOT_FOUND' })
    }
    // Include role + grade so the frontend can show admin controls and the user dropdown
    const communityId = await getCommunityIdForUsers()
    let role: string | null = null
    let grade: { name: string; color: string } | null = null
    if (communityId) {
      const { rows } = await db.query<{ role: string; grade_name: string | null; grade_color: string | null }>(
        `SELECT cm.role, cg.name AS grade_name, cg.color AS grade_color
         FROM community_members cm
         LEFT JOIN community_grades cg ON cg.id = cm.grade_id
         WHERE cm.user_id = $1 AND cm.community_id = $2`,
        [request.user!.userId, communityId]
      )
      role  = rows[0]?.role ?? null
      grade = rows[0]?.grade_name ? { name: rows[0].grade_name, color: rows[0].grade_color! } : null
    }
    return reply.send({ user: { ...user, role, grade } })
  })

  // PATCH /api/v1/users/me/profile
  app.patch('/me/profile', {
    preHandler: [rateLimit, requireAuth, validate({ body: PatchProfileBody })],
  }, async (request, reply) => {
    const data = request.body as z.infer<typeof PatchProfileBody>

    const fields: string[] = []
    const values: unknown[] = []
    let i = 1

    if (data.display_name      !== undefined) { fields.push(`display_name = $${i++}`);      values.push(data.display_name)      }
    if (data.bio               !== undefined) { fields.push(`bio = $${i++}`);               values.push(data.bio)               }
    if (data.status            !== undefined) { fields.push(`status = $${i++}`);            values.push(data.status)            }
    if (data.location          !== undefined) { fields.push(`location = $${i++}`);          values.push(data.location)          }
    if (data.avatar_url        !== undefined) { fields.push(`avatar_url = $${i++}`);        values.push(data.avatar_url)        }
    if (data.banner_url        !== undefined) { fields.push(`banner_url = $${i++}`);        values.push(data.banner_url)        }
    if (data.tags              !== undefined) { fields.push(`tags = $${i++}`);              values.push(data.tags)              }
    if (data.links             !== undefined) { fields.push(`links = $${i++}`);             values.push(JSON.stringify(data.links)) }
    if (data.github_username   !== undefined) { fields.push(`github_username = $${i++}`);   values.push(data.github_username)   }
    if (data.youtube_channel   !== undefined) { fields.push(`youtube_channel = $${i++}`);   values.push(data.youtube_channel)   }
    if (data.twitter_username  !== undefined) { fields.push(`twitter_username = $${i++}`);  values.push(data.twitter_username)  }
    if (data.instagram_username !== undefined) { fields.push(`instagram_username = $${i++}`); values.push(data.instagram_username) }
    if (data.website_url       !== undefined) { fields.push(`website_url = $${i++}`);       values.push(data.website_url)       }

    if (fields.length === 0) {
      return reply.code(400).send({ error: 'No fields to update', code: 'EMPTY_UPDATE' })
    }

    // If github_username changed, invalidate the GitHub cache
    if (data.github_username !== undefined && data.github_username !== null) {
      await redis.del(`github:${data.github_username}`)
    }

    fields.push(`updated_at = NOW()`)
    values.push(request.user!.userId)

    const { rows } = await db.query(
      `UPDATE user_profiles SET ${fields.join(', ')}
       WHERE user_id = $${i}
       RETURNING *`,
      values
    )

    // Synchronise users.avatar pour que le chat et le forum affichent le bon avatar
    if (data.avatar_url !== undefined) {
      await db.query(
        `UPDATE users SET avatar = $1 WHERE id = $2`,
        [data.avatar_url, request.user!.userId]
      )
    }

    return reply.send({ profile: rows[0] })
  })

  // GET /api/v1/users/:username/profile
  app.get('/:username/profile', {
    preHandler: [rateLimit],
  }, async (request, reply) => {
    const { username } = request.params as { username: string }

    const { rows } = await db.query(
      `SELECT
         u.id, u.username, u.points, u.created_at,
         p.display_name, p.avatar_url, p.banner_url,
         p.bio, p.status, p.location, p.tags, p.links,
         p.github_username, p.youtube_channel, p.twitter_username,
         p.instagram_username, p.website_url
       FROM users u
       LEFT JOIN user_profiles p ON p.user_id = u.id
       WHERE u.username = $1`,
      [username]
    )

    if (!rows[0]) {
      return reply.code(404).send({ error: 'User not found', code: 'NOT_FOUND' })
    }

    return reply.send(rows[0])
  })

  // GET /api/v1/users/:username/github
  app.get('/:username/github', {
    preHandler: [rateLimit],
  }, async (request, reply) => {
    const { username } = request.params as { username: string }

    // Look up github_username for this Nexus user
    const { rows } = await db.query(
      `SELECT p.github_username
       FROM users u
       LEFT JOIN user_profiles p ON p.user_id = u.id
       WHERE u.username = $1`,
      [username]
    )

    if (!rows[0] || !rows[0].github_username) {
      return reply.code(404).send({ error: 'No GitHub account linked', code: 'NOT_FOUND' })
    }

    const githubUsername = rows[0].github_username as string
    const cacheKey = `github:${githubUsername}`

    // Check Redis cache first
    const cached = await redis.get(cacheKey)
    if (cached) {
      return reply.send(JSON.parse(cached))
    }

    // Fetch from GitHub API (parallel: user + repos)
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'Nexus/1.0',
    }

    const [userRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${githubUsername}`, { headers }),
      fetch(`https://api.github.com/users/${githubUsername}/repos?sort=updated&per_page=6`, { headers }),
    ])

    if (!userRes.ok) {
      if (userRes.status === 404) {
        return reply.code(404).send({ error: 'GitHub user not found', code: 'NOT_FOUND' })
      }
      return reply.code(502).send({ error: 'GitHub API unavailable', code: 'UPSTREAM_ERROR' })
    }

    const ghUser = await userRes.json() as {
      login: string
      name: string | null
      avatar_url: string
      bio: string | null
      public_repos: number
      followers: number
    }

    type GhRepo = {
      name: string
      description: string | null
      language: string | null
      stargazers_count: number
      html_url: string
    }
    const repos: GhRepo[] = reposRes.ok ? (await reposRes.json() as GhRepo[]) : []

    const pinned_repos = repos
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, 3)
      .map(r => ({
        name:        r.name,
        description: r.description,
        language:    r.language,
        stars:       r.stargazers_count,
        url:         r.html_url,
      }))

    const data = {
      login:        ghUser.login,
      name:         ghUser.name,
      avatar_url:   ghUser.avatar_url,
      bio:          ghUser.bio,
      public_repos: ghUser.public_repos,
      followers:    ghUser.followers,
      pinned_repos,
    }

    // Cache for 1 hour
    await redis.set(cacheKey, JSON.stringify(data), 'EX', GITHUB_CACHE_TTL)

    return reply.send(data)
  })

  // POST /api/v1/users/me/upload?type=avatar|banner — upload image from client PC
  app.post('/me/upload', {
    preHandler: [requireAuth],
  }, async (request, reply) => {
    const { type } = request.query as { type?: string }
    if (!type || !ALLOWED_TYPES.includes(type)) {
      return reply.code(400).send({ error: 'type must be "avatar" or "banner"' })
    }

    const data = await request.file()
    if (!data) return reply.code(400).send({ error: 'No file provided' })

    if (!ALLOWED_MIME.includes(data.mimetype)) {
      return reply.code(400).send({ error: 'Format non supporté (JPEG, PNG, WebP, GIF)' })
    }

    const ext     = data.mimetype.split('/')[1].replace('jpeg', 'jpg')
    const folder  = `${type}s` // 'avatars' or 'banners'
    const filename = `${randomUUID()}.${ext}`
    const dir      = path.join(UPLOADS_DIR, folder)
    mkdirSync(dir, { recursive: true })

    await pipeline(data.file, createWriteStream(path.join(dir, filename)))

    const relativePath = `/uploads/${folder}/${filename}`
    return reply.send({ url: relativePath })
  })

  // GET /api/v1/users/:id
  app.get('/:id', {
    preHandler: [rateLimit],
  }, async (request, reply) => {
    const { id } = request.params as { id: string }

    const user = await UserModel.findById(id)
    if (!user) {
      return reply.code(404).send({ error: 'User not found', code: 'NOT_FOUND' })
    }

    return reply.send({ user })
  })
}
