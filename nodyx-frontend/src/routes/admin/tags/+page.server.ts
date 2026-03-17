import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { apiFetch } from '$lib/api';

export const load: PageServerLoad = async ({ fetch }) => {
	const res  = await apiFetch(fetch, '/instance/tags');
	const { tags } = res.ok ? await res.json() : { tags: [] };
	return { tags };
};

export const actions: Actions = {
	create: async ({ fetch, request, cookies }) => {
		const token = cookies.get('token')!;
		const form  = await request.formData();
		const name  = (form.get('name')  as string).trim();
		const color = (form.get('color') as string) || '#6366f1';

		if (!name) return fail(400, { error: 'Le nom est obligatoire.' });

		const res = await apiFetch(fetch, '/instance/tags', {
			method: 'POST',
			headers: { Authorization: `Bearer ${token}` },
			body: JSON.stringify({ name, color }),
		});
		if (!res.ok) return fail(res.status, { error: (await res.json()).error ?? 'Erreur création tag' });
	},

	delete: async ({ fetch, request, cookies }) => {
		const token = cookies.get('token')!;
		const form  = await request.formData();
		const tagId = form.get('tag_id') as string;

		await apiFetch(fetch, `/instance/tags/${tagId}`, {
			method: 'DELETE',
			headers: { Authorization: `Bearer ${token}` },
		});
	},
};
