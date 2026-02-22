import type { RequestHandler } from './$types';
import { apiFetch } from '$lib/api';

const BASE_URL = 'https://nexus.example.com'; // remplacé par PUBLIC_SITE_URL en prod

function url(path: string, lastmod?: string, priority = '0.7', changefreq = 'weekly') {
	return `
  <url>
    <loc>${BASE_URL}${path}</loc>
    ${lastmod ? `<lastmod>${new Date(lastmod).toISOString().split('T')[0]}</lastmod>` : ''}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

export const GET: RequestHandler = async ({ fetch }) => {
	const urls: string[] = [];

	// Pages statiques
	urls.push(url('/', undefined, '1.0', 'daily'));

	// Communautés et catégories
	try {
		const commRes  = await apiFetch(fetch, '/communities');
		const { communities } = await commRes.json();

		for (const community of communities ?? []) {
			urls.push(url(`/c/${community.slug}`, community.updated_at, '0.8', 'daily'));

			const catRes  = await apiFetch(fetch, `/forums/${community.slug}`);
			const { categories } = await catRes.json();

			for (const category of categories ?? []) {
				urls.push(url(`/forum/${category.id}`, category.updated_at, '0.8', 'daily'));

				// Threads de chaque catégorie
				const threadRes  = await apiFetch(fetch, `/forums/threads?category_id=${category.id}&limit=100`);
				const { threads } = await threadRes.json();

				for (const thread of threads ?? []) {
					urls.push(url(
						`/forum/${category.id}/${thread.id}`,
						thread.updated_at,
						'0.6',
						'weekly'
					));
				}
			}
		}
	} catch {
		// Si l'API est down, on retourne au moins les pages statiques
	}

	const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('')}
</urlset>`;

	return new Response(sitemap, {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'public, max-age=3600'
		}
	});
};
