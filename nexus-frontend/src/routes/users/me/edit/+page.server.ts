import { error, redirect } from '@sveltejs/kit'
import type { PageServerLoad, Actions } from './$types'
import { apiFetch } from '$lib/api'

export const load: PageServerLoad = async ({ fetch, cookies, parent }) => {
	const token = cookies.get('token')
	if (!token) redirect(302, '/auth/login?redirectTo=/users/me/edit')

	const { user } = await parent()
	if (!user) redirect(302, '/auth/login?redirectTo=/users/me/edit')

	// Load the current profile
	const res = await apiFetch(fetch, `/users/${user.username}/profile`)
	if (!res.ok) error(500, 'Erreur serveur')

	const profile = await res.json()
	return { profile, token }
}

export const actions: Actions = {
	default: async ({ fetch, request, cookies }) => {
		const token = cookies.get('token')
		if (!token) error(401, 'Non connecté')

		const form = await request.formData()

		// Build the patch body with only non-empty values
		const body: Record<string, unknown> = {}

		const fields = [
			'display_name', 'bio', 'status', 'location',
			'avatar_url', 'banner_url',
			'github_username', 'youtube_channel', 'twitter_username',
			'instagram_username', 'website_url',
		]

		for (const field of fields) {
			const val = form.get(field) as string | null
			if (val !== null) {
				// Send null to clear the field, string otherwise
				body[field] = val.trim() === '' ? null : val.trim()
			}
		}

		// Tags: split by comma, trim, filter empty
		const tagsRaw = form.get('tags') as string | null
		if (tagsRaw !== null) {
			body['tags'] = tagsRaw
				.split(',')
				.map(t => t.trim())
				.filter(t => t.length > 0)
		}

		// Links: collect link_label_N + link_url_N pairs
		const links: Array<{ label: string; url: string }> = []
		let idx = 0
		while (form.has(`link_label_${idx}`)) {
			const label = (form.get(`link_label_${idx}`) as string).trim()
			const url   = (form.get(`link_url_${idx}`)   as string).trim()
			if (label && url) links.push({ label, url })
			idx++
		}
		// Only send links if the section was present in the form (idx > 0 means fields existed)
		if (idx > 0) {
			body['links'] = links
		}

		if (Object.keys(body).length === 0) {
			return { error: 'Aucune modification à enregistrer.' }
		}

		const res = await apiFetch(fetch, '/users/me/profile', {
			method: 'PATCH',
			headers: { Authorization: `Bearer ${token}` },
			body: JSON.stringify(body),
		})

		if (!res.ok) {
			const json = await res.json()
			return { error: json.error ?? 'Erreur lors de la mise à jour.' }
		}

		const { user } = await (await apiFetch(fetch, '/users/me', {
			headers: { Authorization: `Bearer ${token}` },
		})).json()

		redirect(302, `/users/${user.username}`)
	},
}
