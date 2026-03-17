import { FastifyRequest, FastifyReply } from 'fastify'
import { redis } from '../config/database'

const WINDOW_SECONDS = 60
const MAX_REQUESTS   = 100

// ── Middleware ───────────────────────────────────────────────

export async function rateLimit(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const ip  = request.ip
  const key = `rate:${ip}`

  const count = await redis.incr(key)

  if (count === 1) {
    // First request in this window — set the expiry
    await redis.expire(key, WINDOW_SECONDS)
  }

  if (count > MAX_REQUESTS) {
    const ttl = await redis.ttl(key)
    reply.header('Retry-After', String(ttl))
    return reply.code(429).send({
      error: `Too many requests — limit is ${MAX_REQUESTS} per minute`,
      code:  'RATE_LIMITED',
    })
  }

  reply.header('X-RateLimit-Limit',     String(MAX_REQUESTS))
  reply.header('X-RateLimit-Remaining', String(Math.max(0, MAX_REQUESTS - count)))
}
