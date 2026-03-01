import { error, redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'
import { apiFetch } from '$lib/api'

export const load: PageServerLoad = async ({ params, cookies, fetch }) => {
  const token = cookies.get('token')
  if (!token) redirect(302, '/auth/login')

  const res = await apiFetch(
    fetch,
    `/whispers/${params.id}`,
    { headers: { Authorization: `Bearer ${token}` } }
  )

  if (res.status === 404) error(404, 'Salon introuvable ou expiré')
  if (!res.ok) error(500, 'Erreur serveur')

  const { room, messages } = await res.json()
  return { room, messages }
}
