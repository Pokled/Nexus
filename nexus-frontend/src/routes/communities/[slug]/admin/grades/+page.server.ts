import { error, redirect } from '@sveltejs/kit'
import type { PageServerLoad, Actions } from './$types'
import { apiFetch } from '$lib/api'

export const load: PageServerLoad = async ({ params, fetch, cookies }) => {
	const token = cookies.get('token')
	if (!token) redirect(302, `/auth/login?redirectTo=/communities/${params.slug}/admin/grades`)

	// Load community info, grade list, and member list in parallel
	const [communityRes, gradesRes, membersRes] = await Promise.all([
		apiFetch(fetch, `/communities/${params.slug}`),
		apiFetch(fetch, `/communities/${params.slug}/grades`),
		apiFetch(fetch, `/communities/${params.slug}/members`),
	])

	if (communityRes.status === 404) error(404, 'Communauté introuvable')
	if (!communityRes.ok) error(500, 'Erreur serveur')

	const { community } = await communityRes.json()
	const { grades }    = gradesRes.ok  ? await gradesRes.json()  : { grades: [] }
	const { members }   = membersRes.ok ? await membersRes.json() : { members: [] }

	return { community, grades, members }
}

export const actions: Actions = {
	create: async ({ fetch, request, params, cookies }) => {
		const token = cookies.get('token')
		if (!token) error(401, 'Non connecté')

		const form  = await request.formData()
		const body  = {
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

		const res = await apiFetch(fetch, `/communities/${params.slug}/grades`, {
			method: 'POST',
			headers: { Authorization: `Bearer ${token}` },
			body: JSON.stringify(body),
		})

		if (!res.ok) {
			const json = await res.json()
			return { error: json.error ?? 'Erreur lors de la création' }
		}
	},

	delete: async ({ fetch, request, params, cookies }) => {
		const token = cookies.get('token')
		if (!token) error(401, 'Non connecté')

		const form    = await request.formData()
		const gradeId = form.get('grade_id') as string

		const res = await apiFetch(fetch, `/communities/${params.slug}/grades/${gradeId}`, {
			method: 'DELETE',
			headers: { Authorization: `Bearer ${token}` },
		})

		if (!res.ok && res.status !== 204) {
			const json = await res.json()
			return { error: json.error ?? 'Erreur lors de la suppression' }
		}
	},

	assign: async ({ fetch, request, params, cookies }) => {
		const token = cookies.get('token')
		if (!token) error(401, 'Non connecté')

		const form    = await request.formData()
		const userId  = form.get('user_id')  as string
		const gradeId = form.get('grade_id') as string | null

		const res = await apiFetch(fetch, `/communities/${params.slug}/members/${userId}/grade`, {
			method: 'PATCH',
			headers: { Authorization: `Bearer ${token}` },
			body: JSON.stringify({ grade_id: gradeId === '' ? null : gradeId }),
		})

		if (!res.ok) {
			const json = await res.json()
			return { error: json.error ?? 'Erreur lors de l\'attribution du grade' }
		}
	},

	update: async ({ fetch, request, params, cookies }) => {
		const token = cookies.get('token')
		if (!token) error(401, 'Non connecté')

		const form    = await request.formData()
		const gradeId = form.get('grade_id') as string
		const body    = {
			name:     form.get('name')  as string,
			color:    form.get('color') as string,
			permissions: {
				can_post:            form.get('can_post')            === 'on',
				can_create_thread:   form.get('can_create_thread')   === 'on',
				can_create_category: form.get('can_create_category') === 'on',
				can_moderate:        form.get('can_moderate')        === 'on',
				can_manage_members:  form.get('can_manage_members')  === 'on',
				can_manage_grades:   form.get('can_manage_grades')   === 'on',
			},
		}

		const res = await apiFetch(fetch, `/communities/${params.slug}/grades/${gradeId}`, {
			method: 'PATCH',
			headers: { Authorization: `Bearer ${token}` },
			body: JSON.stringify(body),
		})

		if (!res.ok) {
			const json = await res.json()
			return { error: json.error ?? 'Erreur lors de la modification' }
		}
	},
}
