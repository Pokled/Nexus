<script lang="ts">
	import { page } from '$app/stores';

	const email = $derived($page.url.searchParams.get('email') ?? '');

	let resending   = $state(false);
	let resendDone  = $state(false);
	let resendError = $state('');

	async function resend() {
		if (!email || resending) return;
		resending   = true;
		resendError = '';
		try {
			const res = await fetch('/api/v1/auth/resend-verification', {
				method:  'POST',
				headers: { 'Content-Type': 'application/json' },
				body:    JSON.stringify({ email }),
			});
			if (res.ok) {
				resendDone = true;
			} else {
				const j = await res.json();
				resendError = j.error ?? 'Erreur lors du renvoi.';
			}
		} catch {
			resendError = 'Impossible de contacter le serveur.';
		} finally {
			resending = false;
		}
	}
</script>

<svelte:head>
	<title>Vérifiez votre email — Nodyx</title>
</svelte:head>

<div class="mx-auto max-w-md pt-16 px-4 text-center">

	<!-- Icône enveloppe -->
	<div class="mx-auto mb-6 w-20 h-20 rounded-2xl flex items-center justify-center text-4xl"
		style="background: rgba(200,145,74,0.1); border: 1px solid rgba(200,145,74,0.3);">
		✉
	</div>

	<h1 class="text-2xl font-bold text-white mb-3">Vérifiez votre email</h1>

	<p class="text-gray-400 text-sm leading-relaxed mb-2">
		Un lien d'activation a été envoyé à
	</p>
	{#if email}
		<p class="font-semibold mb-6" style="color: #c8914a;">{email}</p>
	{/if}

	<p class="text-gray-500 text-sm leading-relaxed mb-8">
		Cliquez sur le lien dans l'email pour activer votre compte. Pensez à vérifier vos spams.
	</p>

	<!-- Renvoi -->
	<div class="border border-gray-800 rounded-xl p-5 text-left">
		<p class="text-sm text-gray-400 mb-3">Vous n'avez rien reçu ?</p>

		{#if resendDone}
			<p class="text-sm text-green-400">Email renvoyé. Vérifiez votre boite (et vos spams).</p>
		{:else}
			{#if resendError}
				<p class="text-sm text-red-400 mb-2">{resendError}</p>
			{/if}
			<button
				onclick={resend}
				disabled={resending || !email}
				class="w-full rounded-lg px-4 py-2 text-sm font-semibold transition-colors
				       disabled:opacity-50 disabled:cursor-not-allowed"
				style="background: rgba(200,145,74,0.15); border: 1px solid rgba(200,145,74,0.4); color: #c8914a;"
			>
				{resending ? 'Envoi en cours...' : 'Renvoyer l\'email'}
			</button>
		{/if}
	</div>

	<p class="mt-6 text-sm text-gray-600">
		<a href="/auth/login" class="text-indigo-400 hover:text-indigo-300">Retour à la connexion</a>
	</p>
</div>
