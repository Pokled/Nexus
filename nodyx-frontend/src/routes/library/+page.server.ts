import type { PageServerLoad } from './$types'
import { apiFetch } from '$lib/api'

export const load: PageServerLoad = async ({ fetch, url }) => {
  const tab    = (url.searchParams.get('tab') ?? 'local') as 'local' | 'community'
  const q      = url.searchParams.get('q') ?? ''
  const type   = url.searchParams.get('type') ?? ''
  const offset = Number(url.searchParams.get('offset') ?? '0')

  const params = new URLSearchParams({ limit: '24', offset: String(offset) })
  if (q)    params.set('q', q)
  if (type) params.set('type', type)

  if (tab === 'community') {
    // Federated search across all directory instances
    const res = await apiFetch(fetch, `/directory/assets/search?${params}`)
    const json = res.ok ? await res.json() : { assets: [], total: 0 }
    return { tab, assets: json.assets ?? [], total: json.total ?? 0, q, type, offset }
  }

  // Local community library
  const res = await apiFetch(fetch, `/assets?${params}`)
  const json = res.ok ? await res.json() : { assets: [] }
  return { tab, assets: json.assets ?? [], total: null, q, type, offset }
}
