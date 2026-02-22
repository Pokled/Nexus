import { db } from '../config/database'

// ── Types ────────────────────────────────────────────────────

export interface Community {
  id:          string
  name:        string
  slug:        string
  description: string | null
  avatar:      string | null
  owner_id:    string
  is_public:   boolean
  created_at:  Date
  updated_at:  Date
}

export interface CommunityMember {
  community_id: string
  user_id:      string
  role:         'owner' | 'admin' | 'moderator' | 'member'
  joined_at:    Date
  username:     string
  avatar:       string | null
  grade_id:     string | null
  grade_name:   string | null
  grade_color:  string | null
}

export interface Category {
  id:           string
  community_id: string
  name:         string
  description:  string | null
  position:     number
  parent_id:    string | null
  thread_count: number
  created_at:   Date
  updated_at:   Date
}

export interface CategoryNode extends Category {
  children: CategoryNode[]
}

// ── Community queries ────────────────────────────────────────

export async function findById(id: string): Promise<Community | null> {
  const { rows } = await db.query<Community>(
    `SELECT * FROM communities WHERE id = $1`,
    [id]
  )
  return rows[0] ?? null
}

export async function findBySlug(slug: string): Promise<Community | null> {
  const { rows } = await db.query<Community>(
    `SELECT * FROM communities WHERE slug = $1`,
    [slug]
  )
  return rows[0] ?? null
}

export async function list(opts: {
  limit?:  number
  offset?: number
  public_only?: boolean
} = {}): Promise<Community[]> {
  const limit  = opts.limit  ?? 20
  const offset = opts.offset ?? 0
  const { rows } = await db.query<Community>(
    `SELECT * FROM communities
     WHERE ($1::boolean IS FALSE OR is_public = true)
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,
    [opts.public_only ?? true, limit, offset]
  )
  return rows
}

export async function create(data: {
  name:        string
  slug:        string
  description?: string
  owner_id:    string
  is_public?:  boolean
}): Promise<Community> {
  const { rows } = await db.query<Community>(
    `INSERT INTO communities (name, slug, description, owner_id, is_public)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [data.name, data.slug, data.description ?? null, data.owner_id, data.is_public ?? true]
  )
  return rows[0]
}

export async function update(id: string, data: {
  name?:        string
  description?: string
  avatar?:      string
  is_public?:   boolean
}): Promise<Community | null> {
  const fields: string[] = []
  const values: unknown[] = []
  let i = 1

  if (data.name        !== undefined) { fields.push(`name = $${i++}`);        values.push(data.name)        }
  if (data.description !== undefined) { fields.push(`description = $${i++}`); values.push(data.description) }
  if (data.avatar      !== undefined) { fields.push(`avatar = $${i++}`);      values.push(data.avatar)      }
  if (data.is_public   !== undefined) { fields.push(`is_public = $${i++}`);   values.push(data.is_public)   }

  if (fields.length === 0) return findById(id)

  values.push(id)
  const { rows } = await db.query<Community>(
    `UPDATE communities SET ${fields.join(', ')}
     WHERE id = $${i}
     RETURNING *`,
    values
  )
  return rows[0] ?? null
}

// ── Member queries ───────────────────────────────────────────

export async function getMembers(communityId: string): Promise<CommunityMember[]> {
  const { rows } = await db.query<CommunityMember>(
    `SELECT cm.community_id, cm.user_id, cm.role, cm.joined_at,
            u.username, u.avatar,
            cm.grade_id,
            cg.name  AS grade_name,
            cg.color AS grade_color
     FROM community_members cm
     JOIN users u ON u.id = cm.user_id
     LEFT JOIN community_grades cg ON cg.id = cm.grade_id
     WHERE cm.community_id = $1
     ORDER BY cm.joined_at ASC`,
    [communityId]
  )
  return rows
}

export async function getMember(communityId: string, userId: string): Promise<CommunityMember | null> {
  const { rows } = await db.query<CommunityMember>(
    `SELECT cm.community_id, cm.user_id, cm.role, cm.joined_at,
            u.username, u.avatar,
            cm.grade_id,
            cg.name  AS grade_name,
            cg.color AS grade_color
     FROM community_members cm
     JOIN users u ON u.id = cm.user_id
     LEFT JOIN community_grades cg ON cg.id = cm.grade_id
     WHERE cm.community_id = $1 AND cm.user_id = $2`,
    [communityId, userId]
  )
  return rows[0] ?? null
}

export async function addMember(communityId: string, userId: string, role: CommunityMember['role'] = 'member'): Promise<void> {
  await db.query(
    `INSERT INTO community_members (community_id, user_id, role)
     VALUES ($1, $2, $3)
     ON CONFLICT (community_id, user_id) DO NOTHING`,
    [communityId, userId, role]
  )
}

export async function removeMember(communityId: string, userId: string): Promise<void> {
  await db.query(
    `DELETE FROM community_members WHERE community_id = $1 AND user_id = $2`,
    [communityId, userId]
  )
}

// ── Category queries ─────────────────────────────────────────

export async function getCategories(communityId: string): Promise<Category[]> {
  const { rows } = await db.query<Category>(
    `SELECT c.*,
            (SELECT COUNT(*)::int FROM threads t WHERE t.category_id = c.id) AS thread_count
     FROM categories c
     WHERE community_id = $1
     ORDER BY position ASC, created_at ASC`,
    [communityId]
  )
  return rows
}

// Returns categories as a recursive tree (root categories with nested children).
// Uses a PostgreSQL recursive CTE — depth is unbounded.
export async function getCategoryTree(communityId: string): Promise<CategoryNode[]> {
  const { rows } = await db.query<Category>(
    `WITH RECURSIVE cat_tree AS (
       SELECT c.*,
              (SELECT COUNT(*)::int FROM threads t WHERE t.category_id = c.id) AS thread_count,
              0 AS depth
       FROM categories c
       WHERE c.community_id = $1 AND c.parent_id IS NULL

       UNION ALL

       SELECT c.*,
              (SELECT COUNT(*)::int FROM threads t WHERE t.category_id = c.id) AS thread_count,
              ct.depth + 1
       FROM categories c
       JOIN cat_tree ct ON c.parent_id = ct.id
     )
     SELECT * FROM cat_tree ORDER BY depth, position, name`,
    [communityId]
  )

  // Build tree from flat ordered list
  const map = new Map<string, CategoryNode>()
  const roots: CategoryNode[] = []

  for (const row of rows) {
    map.set(row.id, { ...row, children: [] })
  }
  for (const row of rows) {
    const node = map.get(row.id)!
    if (row.parent_id) {
      map.get(row.parent_id)?.children.push(node)
    } else {
      roots.push(node)
    }
  }

  return roots
}

export async function createCategory(data: {
  community_id: string
  name:         string
  description?: string
  position?:    number
  parent_id?:   string
}): Promise<Category> {
  const { rows } = await db.query<Category>(
    `INSERT INTO categories (community_id, name, description, position, parent_id)
     VALUES ($1, $2, $3, COALESCE($4, (
       SELECT COALESCE(MAX(position), -1) + 1 FROM categories
       WHERE community_id = $1 AND parent_id IS NOT DISTINCT FROM $5
     )), $5)
     RETURNING *,
       (SELECT COUNT(*)::int FROM threads t WHERE t.category_id = id) AS thread_count`,
    [data.community_id, data.name, data.description ?? null, data.position ?? null, data.parent_id ?? null]
  )
  return rows[0]
}
