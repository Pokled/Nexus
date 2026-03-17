import type { PageServerLoad } from './$types';
import { apiFetch } from '$lib/api';

export const load: PageServerLoad = async ({ fetch, url }) => {
	const q = url.searchParams.get('q')?.trim() ?? '';

	if (!q) {
		return { q: '', threads: [], posts: [] };
	}

	const res  = await apiFetch(fetch, `/search?q=${encodeURIComponent(q)}&type=all&limit=20`);
	const json = res.ok ? await res.json() : { threads: [], posts: [] };

	return {
		q,
		threads: json.threads ?? [],
		posts:   json.posts   ?? [],
	};
};
