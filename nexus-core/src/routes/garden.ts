import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { requireAuth } from '../middleware/auth'
import { rateLimit } from '../middleware/rateLimit'
import { validate } from '../middleware/validate'
import {
  createSeed,
  waterSeed,
  listSeeds,
  getSeed,
  type SeedCategory,
  type GrowthStage,
} from '../services/gardenService'

const VALID_CATEGORIES = ['feature', 'design', 'plugin', 'event'] as const
const VALID_STAGES     = ['germe', 'pousse', 'fleur', 'fruit'] as const

const CreateSeedBody = z.object({
  title:       z.string().min(3).max(200),
  description: z.string().max(2000).optional(),
  category:    z.enum(VALID_CATEGORIES).default('feature'),
})

const ListSeedsQuery = z.object({
  category: z.enum(VALID_CATEGORIES).optional(),
  stage:    z.enum(VALID_STAGES).optional(),
  limit:    z.coerce.number().min(1).max(100).default(30),
  offset:   z.coerce.number().min(0).default(0),
})

export default async function gardenRoutes(app: FastifyInstance) {

  // ── POST /api/v1/garden/seeds — Plant a seed (propose an idea) ─────────────
  app.post('/seeds', {
    preHandler: [rateLimit, requireAuth, validate({ body: CreateSeedBody })],
  }, async (req, reply) => {
    const body = req.body as z.infer<typeof CreateSeedBody>
    const seed = await createSeed({
      userId:      req.user!.userId,
      title:       body.title,
      description: body.description,
      category:    body.category as SeedCategory,
    })
    return reply.code(201).send({ seed: { ...seed, growth_stage: 'germe', watered_by_me: false } })
  })

  // ── GET /api/v1/garden/seeds — List seeds ─────────────────────────────────
  app.get('/seeds', {
    preHandler: [validate({ query: ListSeedsQuery })],
  }, async (req, reply) => {
    const q = req.query as z.infer<typeof ListSeedsQuery>
    const seeds = await listSeeds({
      category:    q.category as SeedCategory | undefined,
      stage:       q.stage as GrowthStage | undefined,
      limit:       q.limit,
      offset:      q.offset,
      requesterId: req.user?.userId,
    })
    return reply.send({ seeds })
  })

  // ── GET /api/v1/garden/seeds/:id — Get one seed ────────────────────────────
  app.get<{ Params: { id: string } }>('/seeds/:id', async (req, reply) => {
    const seed = await getSeed(req.params.id, req.user?.userId)
    if (!seed) return reply.code(404).send({ error: 'Graine introuvable.' })
    return reply.send({ seed })
  })

  // ── POST /api/v1/garden/seeds/:id/water — Water a seed (vote) ─────────────
  app.post<{ Params: { id: string } }>('/seeds/:id/water', {
    preHandler: [rateLimit, requireAuth],
  }, async (req, reply) => {
    try {
      const result = await waterSeed(req.user!.userId, req.params.id)
      if (result.alreadyWatered) {
        return reply.code(409).send({ error: 'Tu as déjà arrosé cette graine.', water_count: result.waterCount })
      }
      return reply.send({ ok: true, water_count: result.waterCount })
    } catch (err: unknown) {
      if ((err as Error).message === 'Seed not found') {
        return reply.code(404).send({ error: 'Graine introuvable.' })
      }
      throw err
    }
  })
}
