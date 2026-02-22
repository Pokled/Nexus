import { FastifyRequest, FastifyReply } from 'fastify'
import { ZodSchema, ZodError } from 'zod'

// ── Types ────────────────────────────────────────────────────

interface ValidationTargets {
  body?:   ZodSchema
  query?:  ZodSchema
  params?: ZodSchema
}

// ── Helpers ──────────────────────────────────────────────────

function formatZodError(err: ZodError): string {
  return err.issues
    .map(issue => `${issue.path.join('.')}: ${issue.message}`)
    .join(', ')
}

// ── Middleware factory ────────────────────────────────────────

// Usage in a route:
//   preHandler: validate({ body: MySchema })
//   preHandler: validate({ body: BodySchema, query: QuerySchema })
export function validate(targets: ValidationTargets) {
  return async function (request: FastifyRequest, reply: FastifyReply): Promise<void> {
    if (targets.body !== undefined) {
      const result = targets.body.safeParse(request.body)
      if (!result.success) {
        return reply.code(400).send({
          error: formatZodError(result.error),
          code:  'VALIDATION_ERROR',
        })
      }
      request.body = result.data
    }

    if (targets.query !== undefined) {
      const result = targets.query.safeParse(request.query)
      if (!result.success) {
        return reply.code(400).send({
          error: formatZodError(result.error),
          code:  'VALIDATION_ERROR',
        })
      }
      request.query = result.data as FastifyRequest['query']
    }

    if (targets.params !== undefined) {
      const result = targets.params.safeParse(request.params)
      if (!result.success) {
        return reply.code(400).send({
          error: formatZodError(result.error),
          code:  'VALIDATION_ERROR',
        })
      }
      request.params = result.data as FastifyRequest['params']
    }
  }
}
