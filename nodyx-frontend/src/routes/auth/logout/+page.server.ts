import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { apiFetch } from '$lib/api';

export const actions: Actions = {
	default: async ({ fetch, cookies }) => {
		const token = cookies.get('token');
		if (token) {
			await apiFetch(fetch, '/auth/logout', {
				method: 'POST',
				headers: { Authorization: `Bearer ${token}` }
			});
			cookies.delete('token', { path: '/' });
		}
		redirect(303, '/');
	}
};
