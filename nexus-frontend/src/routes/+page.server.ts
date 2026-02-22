import type { PageServerLoad } from './$types';
import { apiFetch } from '$lib/api';

export const load: PageServerLoad = async ({ fetch }) => {
	const [infoRes, catRes, threadsRes, featuredRes] = await Promise.all([
		apiFetch(fetch, '/instance/info'),
		apiFetch(fetch, '/instance/categories'),
		apiFetch(fetch, '/instance/threads/recent'),
		apiFetch(fetch, '/instance/threads/featured'),
	]);

	const [infoJson, catJson, threadsJson, featuredJson] = await Promise.all([
		infoRes.json(),
		catRes.json(),
		threadsRes.json(),
		featuredRes.json(),
	]);

	return {
		instance:   infoJson,
		categories: catJson.categories      ?? [],
		threads:    threadsJson.threads      ?? [],
		articles:   featuredJson.articles    ?? [],
	};
};
