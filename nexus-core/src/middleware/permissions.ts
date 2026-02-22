import { FastifyRequest, FastifyReply } from 'fastify'
import { db } from '../config/database'
import type { Permissions } from '../models/grade'

// Default permissions for each system role
const ROLE_PERMISSIONS: Record<string, Permissions> = {
  owner: {
    can_post:            true,
    can_create_thread:   true,
    can_create_category: true,
    can_moderate:        true,
    can_manage_members:  true,
    can_manage_grades:   true,
  },
  admin: {
    can_post:            true,
    can_create_thread:   true,
    can_create_category: true,
    can_moderate:        true,
    can_manage_members:  true,
    can_manage_grades:   true,
  },
  moderator: {
    can_post:            true,
    can_create_thread:   true,
    can_create_category: false,
    can_moderate:        true,
    can_manage_members:  false,
    can_manage_grades:   false,
  },
  member: {
    can_post:            true,
    can_create_thread:   true,
    can_create_category: false,
    can_moderate:        false,
    can_manage_members:  false,
    can_manage_grades:   false,
  },
}

/**
 * Verify the authenticated user has the required permission in the community
 * identified by :slug in the route params.
 *
 * Resolution order:
 *   1. System role (owner/admin → all permissions)
 *   2. Grade permissions (if member has an assigned grade)
 *   3. Default role permissions (moderator / member)
 */
export function checkPermission(permission: keyof Permissions) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    if (!request.user) {
      reply.code(401).send({ error: 'Authentication required', code: 'UNAUTHORIZED' })
      return
    }

    const { slug } = request.params as { slug: string }

    // Fetch community + member + grade in one query
    const { rows } = await db.query<{
      community_id: string
      role: string
      grade_permissions: Permissions | null
    }>(
      `SELECT
         cm.community_id,
         cm.role,
         cg.permissions AS grade_permissions
       FROM communities c
       JOIN community_members cm ON cm.community_id = c.id AND cm.user_id = $1
       LEFT JOIN community_grades cg ON cg.id = cm.grade_id
       WHERE c.slug = $2`,
      [request.user.userId, slug]
    )

    if (!rows[0]) {
      reply.code(403).send({ error: 'Not a member of this community', code: 'FORBIDDEN' })
      return
    }

    const { role, grade_permissions } = rows[0]

    // Owner/admin always pass
    if (role === 'owner' || role === 'admin') return

    // Grade permissions override default role permissions when assigned
    const effectivePerms: Permissions =
      grade_permissions ?? ROLE_PERMISSIONS[role] ?? ROLE_PERMISSIONS['member']

    if (!effectivePerms[permission]) {
      reply.code(403).send({ error: `Missing permission: ${permission}`, code: 'FORBIDDEN' })
    }
  }
}
