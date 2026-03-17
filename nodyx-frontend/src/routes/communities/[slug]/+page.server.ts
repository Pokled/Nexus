import { error } from '@sveltejs/kit'
import type { PageServerLoad, Actions } from './$types'
import { apiFetch } from '$lib/api'

export const load: PageServerLoad = async ({ params, fetch, cookies }) => {
	const { slug } = params
	const token = cookies.get('token')

	// Community info + categories + members in parallel
	const [communityRes, categoriesRes, membersRes] = await Promise.all([
		apiFetch(fetch, `/communities/${slug}`),
		apiFetch(fetch, `/forums/${slug}`),
		apiFetch(fetch, `/communities/${slug}/members`),
	])

	if (communityRes.status === 404) error(404, 'Communauté introuvable')
	if (!communityRes.ok) error(500, 'Erreur serveur')

	const { community } = await communityRes.json()
	const { categories } = categoriesRes.ok ? await categoriesRes.json() : { categories: [] }
	const { members }    = membersRes.ok    ? await membersRes.json()    : { members: [] }

	// Is the current user a member?
	let isMember = false
	let userRole: string | null = null
	if (token) {
		// We need the user id from the layout data — check via /users/me
		const meRes = await apiFetch(fetch, '/users/me', {
			headers: { Authorization: `Bearer ${token}` },
		})
		if (meRes.ok) {
			const { user } = await meRes.json()
			const membership = members.find((m: { user_id: string; role: string }) => m.user_id === user.id)
			if (membership) {
				isMember  = true
				userRole  = membership.role
			}
		}
	}

	return { community, categories, members, isMember, userRole }
}

export const actions: Actions = {
	join: async ({ fetch, params, cookies }) => {
		const token = cookies.get('token')
		if (!token) error(401, 'Non connecté')

		const res = await apiFetch(fetch, `/communities/${params.slug}/members`, {
			method: 'POST',
			headers: { Authorization: `Bearer ${token}` },
		})
		if (!res.ok) {
			const json = await res.json().catch(() => ({}))
			return { error: json.error ?? 'Impossible de rejoindre' }
		}
	},

	leave: async ({ fetch, params, cookies }) => {
		const token = cookies.get('token')
		if (!token) error(401, 'Non connecté')

		const res = await apiFetch(fetch, `/communities/${params.slug}/members`, {
			method: 'DELETE',
			headers: { Authorization: `Bearer ${token}` },
		})
		if (!res.ok && res.status !== 204) {
			const json = await res.json().catch(() => ({}))
			return { error: json.error ?? 'Impossible de quitter' }
		}
	},
}
