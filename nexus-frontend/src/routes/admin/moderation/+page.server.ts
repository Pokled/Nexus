import { fail } from '@sveltejs/kit'
import type { PageServerLoad, Actions } from './$types'
import { apiFetch } from '$lib/api'

export const load: PageServerLoad = async ({ fetch, parent, url }) => {
	const { token } = await parent()
	const limit  = 50
	const offset = Number(url.searchParams.get('offset') ?? 0)
	const catFilter = url.searchParams.get('category_id') ?? ''

	const params = new URLSearchParams({ limit: String(limit), offset: String(offset) })
	if (catFilter) params.set('category_id', catFilter)

	const [threadsRes, catRes] = await Promise.all([
		apiFetch(fetch, `/admin/threads?${params}`, { headers: { Authorization: `Bearer ${token}` } }),
		apiFetch(fetch, '/instance/categories'),
	])

	const { threads, total } = await threadsRes.json()
	const { categories }     = await catRes.json()
	return { threads, total, categories, limit, offset, catFilter }
}

export const actions: Actions = {
	pin: async ({ fetch, request, cookies }) => {
		const token = cookies.get('token')!
		const form  = await request.formData()
		const id    = form.get('id')       as string
		const value = form.get('value') === 'true'
		const res = await apiFetch(fetch, `/admin/threads/${id}`, {
			method: 'PATCH',
			headers: { Authorization: `Bearer ${token}` },
			body: JSON.stringify({ is_pinned: value }),
		})
		if (!res.ok) return fail(400, { error: (await res.json()).error })
	},

	lock: async ({ fetch, request, cookies }) => {
		const token = cookies.get('token')!
		const form  = await request.formData()
		const id    = form.get('id')    as string
		const value = form.get('value') === 'true'
		const res = await apiFetch(fetch, `/admin/threads/${id}`, {
			method: 'PATCH',
			headers: { Authorization: `Bearer ${token}` },
			body: JSON.stringify({ is_locked: value }),
		})
		if (!res.ok) return fail(400, { error: (await res.json()).error })
	},

	delete: async ({ fetch, request, cookies }) => {
		const token = cookies.get('token')!
		const form  = await request.formData()
		const id    = form.get('id') as string
		const res = await apiFetch(fetch, `/admin/threads/${id}`, {
			method: 'DELETE',
			headers: { Authorization: `Bearer ${token}` },
		})
		if (!res.ok) return fail(400, { error: (await res.json()).error })
	},
}
