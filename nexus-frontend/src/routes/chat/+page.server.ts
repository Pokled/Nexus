import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { apiFetch } from '$lib/api';

export const load: PageServerLoad = async ({ fetch, cookies }) => {
	const token = cookies.get('token');
	if (!token) throw redirect(302, '/auth/login');

	const res = await apiFetch(fetch, '/chat/channels', {
		headers: { Authorization: `Bearer ${token}` },
	});

	const channels = res.ok ? (await res.json()).channels ?? [] : [];

	return { channels, token };
};
