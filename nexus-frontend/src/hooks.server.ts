import type { HandleFetch } from '@sveltejs/kit';

// Strip the Origin header for external directory/search requests.
// SvelteKit SSR automatically adds an Origin header to outgoing fetch calls,
// which triggers CORS rejection on remote Nexus instances (they only whitelist
// their own frontend). The directory API is public — no auth needed, no CORS.
export const handleFetch: HandleFetch = ({ request, fetch }) => {
	const url = request.url;
	// Target: any nexusnode.app (or custom) directory endpoint, OR any /api/directory path
	if (url.includes('/api/directory')) {
		const headers = new Headers(request.headers);
		headers.delete('origin');
		return fetch(new Request(url, { method: request.method, headers }));
	}
	return fetch(request);
};
