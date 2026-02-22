import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { apiFetch } from '$lib/api';

export const load: PageServerLoad = async ({ fetch, cookies, params }) => {
	const token = cookies.get('token');
	if (!token) {
		redirect(303, `/auth/login?redirectTo=/forum/${params.category}/new`);
	}

	// Load available tags for this community
	const tagsRes = await apiFetch(fetch, '/instance/tags');
	const { tags } = tagsRes.ok ? await tagsRes.json() : { tags: [] };

	return { tags };
};

export const actions: Actions = {
	default: async ({ fetch, request, params, cookies }) => {
		const token = cookies.get('token');
		if (!token) {
			redirect(303, '/auth/login');
		}

		const form    = await request.formData();
		const title   = (form.get('title')   as string).trim();
		const content = (form.get('content') as string).trim();
		const tagIds  = form.getAll('tag_ids') as string[];

		if (!title || !content) {
			return fail(400, { error: 'Le titre et le contenu sont obligatoires.' });
		}

		const res  = await apiFetch(fetch, '/forums/threads', {
			method: 'POST',
			headers: { Authorization: `Bearer ${token}` },
			body: JSON.stringify({
				category_id: params.category,
				title,
				content,
				tag_ids: tagIds.filter(Boolean),
			})
		});
		const json = await res.json();

		if (!res.ok) {
			return fail(res.status, { error: json.error });
		}

		redirect(303, `/forum/${params.category}/${json.thread.id}`);
	}
};
