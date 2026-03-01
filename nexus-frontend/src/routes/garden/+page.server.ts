import type { PageServerLoad, Actions } from './$types'
import { apiFetch } from '$lib/api'

export const load: PageServerLoad = async ({ fetch, url, cookies }) => {
  const token    = cookies.get('token') ?? ''
  const category = url.searchParams.get('category') ?? ''
  const offset   = Number(url.searchParams.get('offset') ?? '0')

  const params = new URLSearchParams({ limit: '30', offset: String(offset) })
  if (category) params.set('category', category)

  const headers = token ? { Authorization: `Bearer ${token}` } : {}
  const res = await apiFetch(fetch, `/garden/seeds?${params}`, { headers })
  const { seeds } = res.ok ? await res.json() : { seeds: [] }

  return { seeds, category, offset, token: token ? token : null }
}

export const actions: Actions = {
  plant: async ({ fetch, request, cookies }) => {
    const token = cookies.get('token')
    if (!token) return { error: 'Non connecté.' }

    const form        = await request.formData()
    const title       = (form.get('title') as string)?.trim()
    const description = (form.get('description') as string)?.trim()
    const category    = (form.get('category') as string) ?? 'feature'

    if (!title) return { error: 'Le titre est requis.' }

    const res = await apiFetch(fetch, '/garden/seeds', {
      method:  'POST',
      headers: { Authorization: `Bearer ${token}` },
      body:    JSON.stringify({ title, description, category }),
    })
    if (!res.ok) {
      const json = await res.json()
      return { error: json.error ?? 'Erreur serveur.' }
    }
    return { planted: true }
  },
}
