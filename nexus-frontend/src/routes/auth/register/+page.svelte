<script lang="ts">
	import type { ActionData } from './$types';
	import { enhance } from '$app/forms';

	let { form }: { form: ActionData } = $props();

	let submitting = $state(false);
</script>

<svelte:head>
	<title>Inscription — Nexus</title>
</svelte:head>

<div class="mx-auto max-w-sm">
	<h1 class="text-2xl font-bold text-white mb-6">Créer un compte</h1>

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
					window.location.href = result.location;
				} else {
					submitting = false;
					const { applyAction } = await import('$app/forms');
					await applyAction(result);
				}
			};
		}}
		class="space-y-4"
	>
		<div>
			<label for="username" class="block text-sm text-gray-400 mb-1">Nom d'utilisateur</label>
			<input
				id="username"
				name="username"
				type="text"
				required
				minlength="3"
				maxlength="50"
				autocomplete="username"
				class="w-full rounded bg-gray-800 border border-gray-700 px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
			/>
		</div>

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
			<label for="password" class="block text-sm text-gray-400 mb-1">
				Mot de passe <span class="text-gray-600 text-xs">(8 caractères minimum)</span>
			</label>
			<input
				id="password"
				name="password"
				type="password"
				required
				minlength="8"
				autocomplete="new-password"
				class="w-full rounded bg-gray-800 border border-gray-700 px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
			/>
		</div>

		<button
			type="submit"
			disabled={submitting}
			class="w-full rounded bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 text-sm font-semibold text-white transition-colors"
		>
			{submitting ? 'Création...' : "S'inscrire"}
		</button>
	</form>

	<p class="mt-4 text-center text-sm text-gray-500">
		Déjà un compte ?
		<a href="/auth/login" class="text-indigo-400 hover:text-indigo-300">Se connecter</a>
	</p>
</div>
