import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { apiFetch } from '$lib/api';

export const actions: Actions = {
	default: async ({ fetch, request, cookies }) => {
		const form = await request.formData();
		const username       = form.get('username')         as string;
		const email          = form.get('email')            as string;
		const password       = form.get('password')         as string;
		const confirmPassword = form.get('confirm_password') as string;

		if (password !== confirmPassword) {
			return fail(400, { error: 'Les mots de passe ne correspondent pas.' });
		}

		const res  = await apiFetch(fetch, '/auth/register', {
			method: 'POST',
			body: JSON.stringify({ username, email, password })
		});
		const json = await res.json();

		if (!res.ok) {
			return fail(res.status, { error: json.error });
		}

		cookies.set('token', json.token, {
			path:     '/',
			httpOnly: true,
			sameSite: 'strict',
			maxAge:   60 * 60 * 24 * 7
		});

		redirect(303, '/');
	}
};
