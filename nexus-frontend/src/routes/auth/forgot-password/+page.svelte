<script lang="ts">
	import type { ActionData } from './$types'
	import { enhance } from '$app/forms'

	let { form }: { form: ActionData } = $props()
	let submitting = $state(false)
</script>

<svelte:head>
	<title>Mot de passe oublié — Nexus</title>
</svelte:head>

<div class="mx-auto max-w-sm">
	<h1 class="text-2xl font-bold text-white mb-2">Mot de passe oublié</h1>
	<p class="text-sm text-gray-500 mb-6">
		Entrez votre email. Si un compte existe, vous recevrez un lien valable <strong class="text-gray-400">1 heure</strong>.
	</p>

	{#if (form as any)?.sent}
		<!-- Succès — même message que le compte existe ou non -->
		<div class="rounded-lg border border-green-700/50 bg-green-900/20 px-5 py-4 text-sm text-green-300 space-y-2">
			<p class="font-semibold text-green-200">✓ Email envoyé (si votre adresse est enregistrée)</p>
			<p class="text-green-400/80 leading-relaxed">
				Consultez votre boîte de réception et cliquez sur le lien de réinitialisation.<br>
				Si vous ne recevez rien dans quelques minutes, vérifiez vos spams ou contactez un administrateur.
			</p>
		</div>
		<p class="mt-5 text-center text-sm text-gray-500">
			<a href="/auth/login" class="text-indigo-400 hover:text-indigo-300">← Retour à la connexion</a>
		</p>
	{:else}
		{#if (form as any)?.error}
			<p class="mb-4 rounded bg-red-900/50 border border-red-700 px-4 py-2 text-sm text-red-300">
				{(form as any).error}
			</p>
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
			<div>
				<label for="email" class="block text-sm text-gray-400 mb-1">Adresse email</label>
				<input
					id="email"
					name="email"
					type="email"
					required
					autocomplete="email"
					placeholder="vous@exemple.com"
					class="w-full rounded bg-gray-800 border border-gray-700 px-3 py-2 text-white placeholder-gray-600
					       focus:outline-none focus:border-indigo-500 transition-colors"
				/>
			</div>

			<!-- Bandeau sécurité -->
			<div class="rounded-lg border border-amber-700/30 bg-amber-900/10 px-4 py-3 text-xs text-amber-600/80 space-y-1">
				<p class="font-semibold text-amber-500/90">🔒 Comment ça marche</p>
				<ul class="space-y-0.5 pl-1">
					<li>• Le lien expire en <strong class="text-amber-400/80">1 heure</strong></li>
					<li>• Il ne peut être utilisé <strong class="text-amber-400/80">qu'une seule fois</strong></li>
					<li>• Toutes vos sessions seront déconnectées</li>
					<li>• Réponse identique que votre email existe ou non</li>
				</ul>
			</div>

			<button
				type="submit"
				disabled={submitting}
				class="w-full rounded bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed
				       px-4 py-2 text-sm font-semibold text-white transition-colors"
			>
				{submitting ? 'Envoi en cours…' : 'Envoyer le lien de réinitialisation'}
			</button>
		</form>

		<p class="mt-4 text-center text-sm text-gray-500">
			<a href="/auth/login" class="text-indigo-400 hover:text-indigo-300">← Retour à la connexion</a>
		</p>
	{/if}
</div>
