import { error } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'
import { apiFetch } from '$lib/api'

export const load: PageServerLoad = async ({ params, fetch }) => {
	const { username } = params

	const res = await apiFetch(fetch, `/users/${username}/profile`)

	if (res.status === 404) {
		error(404, 'Utilisateur introuvable')
	}
	if (!res.ok) {
		error(500, 'Erreur serveur')
	}

	const profile = await res.json()
	return { profile }
}
