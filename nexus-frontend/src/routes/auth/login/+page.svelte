<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import { enhance } from '$app/forms';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let submitting = $state(false);
</script>

<svelte:head>
	<title>Connexion — Nexus</title>
</svelte:head>

<div class="mx-auto max-w-sm">
	<h1 class="text-2xl font-bold text-white mb-6">Connexion</h1>

	{#if form?.error}
		<p class="mb-4 rounded bg-red-900/50 border border-red-700 px-4 py-2 text-sm text-red-300">
			{form.error}
		</p>
	{/if}

	<form
		method="POST"
		use:enhance={() => {
			submitting = true;
			return async ({ result }) => {
				if (result.type === 'redirect') {
					// Force full page navigation so the cookie is sent in the next request
					window.location.href = result.location;
				} else {
					submitting = false;
					// Re-run the default update for error results
					const { applyAction } = await import('$app/forms');
					await applyAction(result);
				}
			};
		}}
		class="space-y-4"
	>
		<input type="hidden" name="redirectTo" value={form?.redirectTo ?? data.redirectTo} />

		<div>
			<label for="email" class="block text-sm text-gray-400 mb-1">Email</label>
			<input
				id="email"
				name="email"
				type="email"
				required
				autocomplete="email"
				class="w-full rounded bg-gray-800 border border-gray-700 px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
			/>
		</div>

		<div>
			<label for="password" class="block text-sm text-gray-400 mb-1">Mot de passe</label>
			<input
				id="password"
				name="password"
				type="password"
				required
				autocomplete="current-password"
				class="w-full rounded bg-gray-800 border border-gray-700 px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
			/>
		</div>

		<button
			type="submit"
			disabled={submitting}
			class="w-full rounded bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 text-sm font-semibold text-white transition-colors"
		>
			{submitting ? 'Connexion...' : 'Se connecter'}
		</button>
	</form>

	<p class="mt-4 text-center text-sm text-gray-500">
		Pas de compte ?
		<a href="/auth/register" class="text-indigo-400 hover:text-indigo-300">S'inscrire</a>
	</p>
</div>
