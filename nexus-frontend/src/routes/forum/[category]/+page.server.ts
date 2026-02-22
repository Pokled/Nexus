import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { apiFetch } from '$lib/api';

export const load: PageServerLoad = async ({ fetch, params }) => {
	const res  = await apiFetch(fetch, `/forums/threads?category_id=${params.category}`);
	const json = await res.json();

	if (!res.ok) {
		error(res.status, json.error ?? 'Erreur');
	}

	return { threads: json.threads, categoryId: params.category };
};
