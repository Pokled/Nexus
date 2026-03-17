<script lang="ts">
	import type { PageData, ActionData } from './$types'
	import { enhance } from '$app/forms'

	let { data, form }: { data: PageData; form: ActionData } = $props()

	let submitting = $state(false)
	let showPwd    = $state(false)
	let showConfirm = $state(false)
	let password   = $state('')
	let confirm    = $state('')

	// Indicateur de force du mot de passe
	const strength = $derived(() => {
		if (!password) return 0
		let score = 0
		if (password.length >= 8)  score++
		if (password.length >= 12) score++
		if (/[A-Z]/.test(password)) score++
		if (/[0-9]/.test(password)) score++
		if (/[^A-Za-z0-9]/.test(password)) score++
		return score
	})

	const strengthLabel = $derived(() => {
		const s = strength()
		if (s <= 1) return { label: 'Faible',    color: 'bg-red-500' }
		if (s <= 3) return { label: 'Moyen',     color: 'bg-amber-500' }
		return           { label: 'Fort',        color: 'bg-green-500' }
	})

	const passwordsMatch = $derived(confirm.length > 0 && password === confirm)
	const passwordsMismatch = $derived(confirm.length > 0 && password !== confirm)
</script>

<svelte:head>
	<title>Nouveau mot de passe — Nodyx</title>
</svelte:head>

<div class="mx-auto max-w-sm">
	<h1 class="text-2xl font-bold text-white mb-1">Nouveau mot de passe</h1>
	<p class="text-sm text-gray-500 mb-6">
		Bonjour <strong class="text-gray-300">{data.username}</strong> — choisissez un nouveau mot de passe sécurisé.
	</p>

	{#if (form as any)?.error}
		<div class="mb-4 rounded border border-red-700 bg-red-900/40 px-4 py-2.5 text-sm text-red-300">
			{(form as any).error}
		</div>
	{/if}

	<form
		method="POST"
		use:enhance={() => {
			submitting = true
			return async ({ update }) => {
				submitting = false
				await update()
			}
		}}
		class="space-y-4"
	>
		<!-- Nouveau mot de passe -->
		<div>
			<label for="password" class="block text-sm text-gray-400 mb-1">Nouveau mot de passe</label>
			<div class="relative">
				<input
					id="password"
					name="password"
					type={showPwd ? 'text' : 'password'}
					bind:value={password}
					required
					minlength="8"
					autocomplete="new-password"
					class="w-full rounded bg-gray-800 border border-gray-700 px-3 py-2 pr-10 text-white
					       focus:outline-none focus:border-indigo-500 transition-colors"
				/>
				<button type="button" onclick={() => showPwd = !showPwd}
					class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 text-xs px-1 py-0.5">
					{showPwd ? 'Cacher' : 'Voir'}
				</button>
			</div>

			<!-- Indicateur de force -->
			{#if password.length > 0}
				<div class="mt-1.5 space-y-1">
					<div class="flex gap-1">
						{#each [1,2,3,4,5] as step}
							<div class="h-1 flex-1 rounded-full {strength() >= step ? strengthLabel().color : 'bg-gray-700'} transition-colors"></div>
						{/each}
					</div>
					<p class="text-xs text-gray-500">Force : <span class="font-medium text-gray-400">{strengthLabel().label}</span></p>
				</div>
			{/if}
		</div>

		<!-- Confirmation -->
		<div>
			<label for="confirm" class="block text-sm text-gray-400 mb-1">Confirmer le mot de passe</label>
			<div class="relative">
				<input
					id="confirm"
					name="confirm"
					type={showConfirm ? 'text' : 'password'}
					bind:value={confirm}
					required
					autocomplete="new-password"
					class="w-full rounded bg-gray-800 border px-3 py-2 pr-10 text-white
					       focus:outline-none focus:border-indigo-500 transition-colors
					       {passwordsMismatch ? 'border-red-600' : passwordsMatch ? 'border-green-600' : 'border-gray-700'}"
				/>
				<button type="button" onclick={() => showConfirm = !showConfirm}
					class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 text-xs px-1 py-0.5">
					{showConfirm ? 'Cacher' : 'Voir'}
				</button>
			</div>
			{#if passwordsMismatch}
				<p class="mt-1 text-xs text-red-400">Les mots de passe ne correspondent pas.</p>
			{:else if passwordsMatch}
				<p class="mt-1 text-xs text-green-400">✓ Les mots de passe correspondent.</p>
			{/if}
		</div>

		<!-- Info sécurité -->
		<div class="rounded-lg border border-amber-700/25 bg-amber-900/8 px-4 py-3 text-xs text-amber-600/70 space-y-0.5">
			<p class="font-semibold text-amber-500/80 mb-1">🔒 Ce qui va se passer</p>
			<p>• Toutes vos sessions actives seront <strong class="text-amber-400/80">déconnectées</strong></p>
			<p>• Ce lien sera <strong class="text-amber-400/80">inutilisable</strong> après confirmation</p>
		</div>

		<button
			type="submit"
			disabled={submitting || passwordsMismatch || password.length < 8}
			class="w-full rounded bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed
			       px-4 py-2 text-sm font-semibold text-white transition-colors"
		>
			{submitting ? 'Réinitialisation…' : 'Confirmer le nouveau mot de passe'}
		</button>
	</form>

	<p class="mt-4 text-center text-sm text-gray-500">
		<a href="/auth/forgot-password" class="text-indigo-400 hover:text-indigo-300">← Faire une nouvelle demande</a>
	</p>
</div>
