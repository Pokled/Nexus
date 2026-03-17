import { db } from '../config/database'

export interface ReactionSummary {
  emoji:        string
  count:        number
  user_reacted: boolean
}

export async function toggleReaction(
  postId: string,
  userId: string,
  emoji:  string
): Promise<{ added: boolean }> {

  const { rows } = await db.query(
    `SELECT 1 FROM post_reactions WHERE post_id = $1 AND user_id = $2 AND emoji = $3`,
    [postId, userId, emoji]
  )

  if (rows.length > 0) {
    await db.query(
      `DELETE FROM post_reactions WHERE post_id = $1 AND user_id = $2 AND emoji = $3`,
      [postId, userId, emoji]
    )
    return { added: false }
  }

  await db.query(
    `INSERT INTO post_reactions (post_id, user_id, emoji) VALUES ($1, $2, $3)
     ON CONFLICT DO NOTHING`,
    [postId, userId, emoji]
  )
  return { added: true }
}

// Bulk fetch reactions for a list of post IDs
export async function getReactionsForPosts(
  postIds:   string[],
  viewerId?: string
): Promise<Map<string, ReactionSummary[]>> {
  if (postIds.length === 0) return new Map()

  const { rows } = await db.query<{
    post_id:      string
    emoji:        string
    count:        number
    user_reacted: boolean
  }>(
    `SELECT post_id, emoji, COUNT(*)::int AS count,
            BOOL_OR(user_id = $2) AS user_reacted
     FROM post_reactions
     WHERE post_id = ANY($1)
     GROUP BY post_id, emoji
     ORDER BY post_id, count DESC`,
    [postIds, viewerId ?? '00000000-0000-0000-0000-000000000000']
  )

  const map = new Map<string, ReactionSummary[]>()
  for (const row of rows) {
    if (!map.has(row.post_id)) map.set(row.post_id, [])
    map.get(row.post_id)!.push({
      emoji:        row.emoji,
      count:        row.count,
      user_reacted: row.user_reacted,
    })
  }
  return map
}
