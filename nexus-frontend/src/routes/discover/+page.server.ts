import type { PageServerLoad } from './$types';
import { env } from '$env/dynamic/public';

const DIRECTORY_URL = (env.PUBLIC_DIRECTORY_URL ?? 'https://nexusnode.app').replace(/\/$/, '');

export const load: PageServerLoad = async ({ fetch, url }) => {
	const q    = url.searchParams.get('q')?.trim() ?? '';
	const page = url.searchParams.get('page') ?? '1';

	let results: any[] = [];
	let error: string | null = null;

	try {
		const params = new URLSearchParams({ page, limit: '20' });
		if (q) params.set('q', q);

		const res = await fetch(`${DIRECTORY_URL}/api/directory/search?${params}`);
		if (res.ok) {
			const json = await res.json();
			results = json.results ?? [];
		} else {
			error = 'Le moteur de recherche global est temporairement indisponible.';
		}
	} catch {
		error = 'Impossible de contacter le répertoire Nexus.';
	}

	return { q, page: parseInt(page, 10), results, error };
};
