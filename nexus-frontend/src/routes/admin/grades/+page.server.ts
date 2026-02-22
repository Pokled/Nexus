import type { PageServerLoad, Actions } from './$types'
import { apiFetch } from '$lib/api'

export const load: PageServerLoad = async ({ fetch, parent }) => {
	const { token } = await parent()

	// Get the community slug from the instance info
	const infoRes = await apiFetch(fetch, '/instance/info')
	const { slug } = await infoRes.json()

	const [gradesRes, membersRes] = await Promise.all([
		apiFetch(fetch, `/communities/${slug}/grades`),
		apiFetch(fetch, `/communities/${slug}/members`),
	])

	const { grades }  = gradesRes.ok  ? await gradesRes.json()  : { grades: [] }
	const { members } = membersRes.ok ? await membersRes.json() : { members: [] }

	return { slug, grades, members }
}

export const actions: Actions = {
	create: async ({ fetch, request, cookies }) => {
		const token = cookies.get('token')!
		const infoRes = await apiFetch(fetch, '/instance/info')
		const { slug } = await infoRes.json()
		const form = await request.formData()
		const body = {
			name:     form.get('name')     as string,
			color:    form.get('color')    as string,
			position: Number(form.get('position') ?? 0),
			permissions: {
				can_post:            form.get('can_post')            === 'on',
				can_create_thread:   form.get('can_create_thread')   === 'on',
				can_create_category: form.get('can_create_category') === 'on',
				can_moderate:        form.get('can_moderate')        === 'on',
				can_manage_members:  form.get('can_manage_members')  === 'on',
				can_manage_grades:   form.get('can_manage_grades')   === 'on',
			},
		}
		const res = await apiFetch(fetch, `/communities/${slug}/grades`, {
			method: 'POST',
			headers: { Authorization: `Bearer ${token}` },
			body: JSON.stringify(body),
		})
		if (!res.ok) return { error: (await res.json()).error ?? 'Erreur création grade' }
	},

	update: async ({ fetch, request, cookies }) => {
		const token = cookies.get('token')!
		const infoRes = await apiFetch(fetch, '/instance/info')
		const { slug } = await infoRes.json()
		const form    = await request.formData()
		const gradeId = form.get('grade_id') as string
		const body = {
			name:  form.get('name')  as string,
			color: form.get('color') as string,
			permissions: {
				can_post:            form.get('can_post')            === 'on',
				can_create_thread:   form.get('can_create_thread')   === 'on',
				can_create_category: form.get('can_create_category') === 'on',
				can_moderate:        form.get('can_moderate')        === 'on',
				can_manage_members:  form.get('can_manage_members')  === 'on',
				can_manage_grades:   form.get('can_manage_grades')   === 'on',
			},
		}
		const res = await apiFetch(fetch, `/communities/${slug}/grades/${gradeId}`, {
			method: 'PATCH',
			headers: { Authorization: `Bearer ${token}` },
			body: JSON.stringify(body),
		})
		if (!res.ok) return { error: (await res.json()).error ?? 'Erreur modification grade' }
	},

	delete: async ({ fetch, request, cookies }) => {
		const token   = cookies.get('token')!
		const infoRes = await apiFetch(fetch, '/instance/info')
		const { slug } = await infoRes.json()
		const form    = await request.formData()
		const gradeId = form.get('grade_id') as string
		const res = await apiFetch(fetch, `/communities/${slug}/grades/${gradeId}`, {
			method: 'DELETE',
			headers: { Authorization: `Bearer ${token}` },
		})
		if (!res.ok && res.status !== 204) return { error: (await res.json()).error ?? 'Erreur suppression' }
	},

	assign: async ({ fetch, request, cookies }) => {
		const token   = cookies.get('token')!
		const infoRes = await apiFetch(fetch, '/instance/info')
		const { slug } = await infoRes.json()
		const form    = await request.formData()
		const userId  = form.get('user_id')  as string
		const gradeId = form.get('grade_id') as string
		const res = await apiFetch(fetch, `/communities/${slug}/members/${userId}/grade`, {
			method: 'PATCH',
			headers: { Authorization: `Bearer ${token}` },
			body: JSON.stringify({ grade_id: gradeId === '' ? null : gradeId }),
		})
		if (!res.ok) return { error: (await res.json()).error ?? 'Erreur attribution grade' }
	},
}
