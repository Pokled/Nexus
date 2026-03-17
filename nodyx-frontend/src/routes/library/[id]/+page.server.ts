import { error } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'
import { apiFetch } from '$lib/api'

export const load: PageServerLoad = async ({ fetch, params }) => {
  const res = await apiFetch(fetch, `/assets/${params.id}`)
  if (res.status === 404) error(404, 'Asset introuvable.')
  if (!res.ok)           error(500, 'Erreur serveur.')
  const { asset } = await res.json()
  return { asset }
}
