import { fail } from '@sveltejs/kit'
import type { PageServerLoad, Actions } from './$types'
import { apiFetch } from '$lib/api'

export const load: PageServerLoad = async ({ fetch, parent }) => {
	const { token } = await parent()
	const res = await apiFetch(fetch, '/admin/members', {
		headers: { Authorization: `Bearer ${token}` },
	})
	const { members } = await res.json()
	return { members }
}

export const actions: Actions = {
	changeRole: async ({ fetch, request, cookies }) => {
		const token = cookies.get('token')!
		const data  = await request.formData()
		const userId = data.get('user_id') as string
		const role   = data.get('role')   as string

		const res = await apiFetch(fetch, `/admin/members/${userId}`, {
			method:  'PATCH',
			headers: { Authorization: `Bearer ${token}` },
			body:    JSON.stringify({ role }),
		})
		if (!res.ok) return fail(400, { error: (await res.json()).error })
		return { ok: true }
	},

	kick: async ({ fetch, request, cookies }) => {
		const token  = cookies.get('token')!
		const data   = await request.formData()
		const userId = data.get('user_id') as string

		const res = await apiFetch(fetch, `/admin/members/${userId}`, {
			method:  'DELETE',
			headers: { Authorization: `Bearer ${token}` },
		})
		if (!res.ok) return fail(400, { error: (await res.json()).error })
		return { ok: true }
	},
}
