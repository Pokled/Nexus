import type { LayoutServerLoad } from './$types';
import { apiFetch } from '$lib/api';

// URLs stored in DB may include http://localhost:3000 prefix (legacy uploads)
// Normalize to relative path so browser fetches via Vite proxy / reverse proxy
function normalizeUrl(url: string | null): string | null {
	if (!url) return null;
	if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//.test(url)) {
		try { return new URL(url).pathname; } catch { return url; }
	}
	return url;
}

export const load: LayoutServerLoad = async ({ fetch, cookies, request }) => {
	const token = cookies.get('token');

	const [infoRes, userRes] = await Promise.all([
		apiFetch(fetch, '/instance/info'),
		token
			? apiFetch(fetch, '/users/me', { headers: { Authorization: `Bearer ${token}` } })
			: Promise.resolve(null),
	]);

	const infoJson = infoRes.ok ? await infoRes.json() : null;
	const communityName: string      = infoJson?.name       ?? 'Nexus';
	const communityLogoUrl: string | null   = normalizeUrl(infoJson?.logo_url   ?? null);
	const communityBannerUrl: string | null = normalizeUrl(infoJson?.banner_url ?? null);
	const memberCount: number        = infoJson?.member_count ?? 0;

	if (!token || !userRes?.ok) {
		return { user: null, communityName, communityLogoUrl, communityBannerUrl, memberCount, unreadCount: 0, token: null };
	}

	const { user } = await userRes.json();

	// Fetch unread notification count (non-blocking)
	let unreadCount = 0;
	try {
		const countRes = await apiFetch(fetch, '/notifications/unread-count', {
			headers: { Authorization: `Bearer ${token}` }
		});
		if (countRes.ok) {
			const json = await countRes.json();
			unreadCount = json.count ?? 0;
		}
	} catch {
		// Ignore notification errors
	}

	return { user, communityName, communityLogoUrl, communityBannerUrl, memberCount, unreadCount, token: token || null };
};
