<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import type { PageData } from './$types';
	import ProfileCard from '$lib/components/ProfileCard.svelte';
	import NexusEditor from '$lib/components/editor/NexusEditor.svelte';
	import PostReactions from '$lib/components/PostReactions.svelte';

	let { data }: { data: PageData } = $props();

	// ── Réactivité ────────────────────────────────────────────────────────
	const thread = $derived(data.thread);
	const posts  = $derived(data.posts);
	const user   = $derived(data.user);
	const isMod  = $derived(user?.role === 'owner' || user?.role === 'admin' || user?.role === 'moderator');

	// ── État local ────────────────────────────────────────────────────────
	let replyKey      = $state(0);
	let editingPostId = $state<string | null>(null);
	let deletingPostId = $state<string | null>(null);
	let confirmDeleteThread = $state(false);
	let editingTitle  = $state(false);
	let titleInput    = $state('');
	let submitting    = $state(false);

	function startEditTitle() {
		titleInput   = thread.title;
		editingTitle = true;
	}

	function formatDate(iso: string) {
		return new Date(iso).toLocaleDateString('fr-FR', {
			day: '2-digit', month: 'short', year: 'numeric',
			hour: '2-digit', minute: '2-digit'
		});
	}

	const canEditTitle = $derived(user && (user.id === thread.author_id || isMod));
	function canEdit(post: any)   { return user && (user.id === post.author_id || isMod); }
	function canDelete(post: any) { return user && (user.id === post.author_id || isMod); }
</script>

<svelte:head>
	<title>{thread.title} — Nexus</title>
	<meta name="description" content="Discussion : {thread.title} par {thread.author_username}" />
	<meta property="og:title"       content="{thread.title} — Nexus" />
	<meta property="og:description" content="Discussion par {thread.author_username} · {thread.post_count} réponse(s)" />
	<meta property="og:type"        content="article" />
	{@html `<script type="application/ld+json">${JSON.stringify({
		"@context": "https://schema.org",
		"@type": "DiscussionForumPosting",
		"headline": thread.title,
		"author": { "@type": "Person", "name": thread.author_username },
		"datePublished": thread.created_at,
		"commentCount": thread.post_count,
	})}</script>`}
</svelte:head>

<!-- ── En-tête du thread ─────────────────────────────────────────────────── -->
<div class="mb-6">
	<a href="/forum/{thread.category_id}" class="text-sm text-gray-500 hover:text-gray-300">← Retour</a>

	<div class="mt-3 flex items-start justify-between gap-4 flex-wrap">
		<!-- Titre + badges -->
		<div class="flex-1 min-w-0">
			<div class="flex flex-wrap items-center gap-2 mb-1">
				{#if thread.is_pinned}
					<span class="inline-flex items-center gap-1 text-xs font-medium text-indigo-400 bg-indigo-900/30 border border-indigo-800/50 px-2 py-0.5 rounded-full">
						📌 Épinglé
					</span>
				{/if}
				{#if thread.is_locked}
					<span class="inline-flex items-center gap-1 text-xs font-medium text-gray-400 bg-gray-800 border border-gray-700 px-2 py-0.5 rounded-full">
						🔒 Verrouillé
					</span>
				{/if}
				{#each (thread.tags ?? []) as tag}
					<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
						style="background-color: {tag.color}22; color: {tag.color}; border: 1px solid {tag.color}55">
						{tag.name}
					</span>
				{/each}
			</div>
			{#if editingTitle}
				<form method="POST" action="?/editTitle"
					use:enhance={() => {
						return async ({ update }) => {
							editingTitle = false;
							await update({ reset: false });
						}
					}}
					class="flex items-center gap-2 mt-1"
				>
					<input
						type="text"
						name="title"
						bind:value={titleInput}
						maxlength="300"
						required
						autofocus
						class="flex-1 rounded-lg bg-gray-800 border border-indigo-600 px-3 py-1.5 text-white text-xl font-bold focus:outline-none focus:border-indigo-400"
					/>
					<button type="submit"
						class="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold text-white transition-colors">
						Enregistrer
					</button>
					<button type="button" onclick={() => editingTitle = false}
						class="px-3 py-1.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-sm text-gray-300 transition-colors">
						Annuler
					</button>
				</form>
			{:else}
				<div class="flex items-start gap-2 group/title">
					<h1 class="text-2xl font-bold text-white">{thread.title}</h1>
					{#if canEditTitle}
						<button
							type="button"
							onclick={startEditTitle}
							class="opacity-0 group-hover/title:opacity-100 transition-opacity mt-1 p-1 rounded text-gray-600 hover:text-gray-300 hover:bg-gray-800"
							title="Modifier le titre"
						>
							<svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
								<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
								<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
							</svg>
						</button>
					{/if}
				</div>
			{/if}
			<p class="mt-1 text-sm text-gray-500">
				Par <span class="text-gray-400">{thread.author_username}</span>
				· {formatDate(thread.created_at)}
				· {thread.views} vues
			</p>
		</div>

		<!-- Boutons de modération (owners/admins seulement) -->
		{#if isMod}
			<div class="flex items-center gap-2 flex-shrink-0">
				<!-- Épingler/Désépingler -->
				<form method="POST" action="?/pinThread" use:enhance={() => {
					return async ({ update }) => { await update({ reset: false }) }
				}}>
					<input type="hidden" name="is_pinned" value={!thread.is_pinned} />
					<button type="submit"
						class="px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors
						{thread.is_pinned
							? 'border-indigo-700 text-indigo-400 bg-indigo-900/20 hover:bg-indigo-900/40'
							: 'border-gray-700 text-gray-400 hover:text-indigo-400 hover:border-indigo-700'}"
						title={thread.is_pinned ? 'Désépingler' : 'Épingler'}>
						📌 {thread.is_pinned ? 'Désépingler' : 'Épingler'}
					</button>
				</form>

				<!-- Verrouiller/Déverrouiller -->
				<form method="POST" action="?/lockThread" use:enhance={() => {
					return async ({ update }) => { await update({ reset: false }) }
				}}>
					<input type="hidden" name="is_locked" value={!thread.is_locked} />
					<button type="submit"
						class="px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors
						{thread.is_locked
							? 'border-amber-700 text-amber-400 bg-amber-900/20 hover:bg-amber-900/40'
							: 'border-gray-700 text-gray-400 hover:text-amber-400 hover:border-amber-700'}"
						title={thread.is_locked ? 'Déverrouiller' : 'Verrouiller'}>
						🔒 {thread.is_locked ? 'Déverrouiller' : 'Verrouiller'}
					</button>
				</form>

				<!-- Promouvoir / rétrograder -->
				<form method="POST" action="?/featureThread" use:enhance={() => {
					return async ({ update }) => { await update({ reset: false }) }
				}}>
					<input type="hidden" name="is_featured" value={!thread.is_featured} />
					<button type="submit"
						class="px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors
						{thread.is_featured
							? 'border-yellow-700 text-yellow-400 bg-yellow-900/20 hover:bg-yellow-900/40'
							: 'border-gray-700 text-gray-400 hover:text-yellow-400 hover:border-yellow-700'}"
						title={thread.is_featured ? 'Rétrograder (retirer de la une)' : 'Promouvoir en article mis en avant'}>
						⭐ {thread.is_featured ? 'Rétrograder' : 'Promouvoir'}
					</button>
				</form>

				<!-- Supprimer le thread -->
				{#if !confirmDeleteThread}
					<button type="button"
						onclick={() => confirmDeleteThread = true}
						class="px-3 py-1.5 rounded-lg border border-red-800 text-xs font-medium text-red-400 hover:bg-red-900/20 transition-colors">
						🗑 Supprimer
					</button>
				{:else}
					<form method="POST" action="?/deleteThread" use:enhance>
						<span class="text-xs text-red-400 mr-1">Confirmer ?</span>
						<button type="submit" class="px-2 py-1 rounded bg-red-700 hover:bg-red-600 text-xs text-white font-medium">
							Oui, supprimer
						</button>
						<button type="button" onclick={() => confirmDeleteThread = false}
							class="ml-1 px-2 py-1 rounded bg-gray-700 text-xs text-gray-300 hover:bg-gray-600">
							Annuler
						</button>
					</form>
				{/if}
			</div>
		{/if}
	</div>
</div>

<!-- ── Liste des posts ────────────────────────────────────────────────────── -->
<div class="space-y-4">
	{#each posts as post (post.id)}
		<article class="flex flex-wrap sm:flex-nowrap gap-4 rounded-lg border border-gray-800 bg-gray-900 p-4">
			<!-- Profil auteur -->
			<ProfileCard
				username={post.author_username}
				avatarUrl={post.author_avatar ?? undefined}
				points={post.author_points}
				tags={post.author_tags ?? []}
				memberSince={post.author_member_since}
				grade={post.author_grade_name ? { name: post.author_grade_name, color: post.author_grade_color ?? '#99AAB5' } : null}
				variant="forum"
			/>

			<!-- Contenu du post -->
			<div class="flex-1 min-w-0">
				<!-- Méta + actions -->
				<div class="flex items-center justify-between mb-3 gap-2">
					<div class="flex items-center gap-2">
						<span class="text-xs text-gray-500">{formatDate(post.created_at)}</span>
						{#if post.is_edited}
							<span class="text-xs text-gray-600 italic">modifié</span>
						{/if}
					</div>

					<!-- Boutons Edit / Delete (auteur ou mod) -->
					{#if canEdit(post) || canDelete(post)}
						<div class="flex items-center gap-1">
							{#if canEdit(post) && editingPostId !== post.id}
								<button type="button"
									onclick={() => { editingPostId = post.id; deletingPostId = null }}
									class="px-2 py-1 rounded text-xs text-gray-500 hover:text-indigo-400 hover:bg-indigo-900/20 transition-colors"
									title="Modifier ce message">
									✏️ Éditer
								</button>
							{/if}
							{#if canDelete(post)}
								{#if deletingPostId !== post.id}
									<button type="button"
										onclick={() => { deletingPostId = post.id; editingPostId = null }}
										class="px-2 py-1 rounded text-xs text-gray-500 hover:text-red-400 hover:bg-red-900/20 transition-colors"
										title="Supprimer ce message">
										🗑 Supprimer
									</button>
								{:else}
									<!-- Confirmation suppression -->
									<span class="text-xs text-red-400">Confirmer ?</span>
									<form method="POST" action="?/deletePost" use:enhance={() => {
										return async ({ update }) => {
											deletingPostId = null
											await update()
										}
									}} class="inline-flex items-center gap-1 ml-1">
										<input type="hidden" name="post_id" value={post.id} />
										<button type="submit"
											class="px-2 py-1 rounded bg-red-700 hover:bg-red-600 text-xs text-white font-medium">
											Oui
										</button>
										<button type="button" onclick={() => deletingPostId = null}
											class="px-2 py-1 rounded bg-gray-700 text-xs text-gray-300 hover:bg-gray-600">
											Non
										</button>
									</form>
								{/if}
							{/if}
						</div>
					{/if}
				</div>

				<!-- Mode édition inline -->
				{#if editingPostId === post.id}
					<form method="POST" action="?/editPost"
						use:enhance={() => {
							return async ({ update }) => {
								editingPostId = null
								await update()
							}
						}}
						class="space-y-2"
					>
						<input type="hidden" name="post_id" value={post.id} />
						<NexusEditor
							name="content"
							initialContent={post.content}
							compact={true}
						/>
						<div class="flex gap-2">
							<button type="submit"
								class="px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-colors">
								Enregistrer
							</button>
							<button type="button"
								onclick={() => editingPostId = null}
								class="px-3 py-1.5 rounded bg-gray-700 hover:bg-gray-600 text-xs text-gray-300 transition-colors">
								Annuler
							</button>
						</div>
					</form>
				{:else}
					<!-- Contenu HTML rendu -->
					<div class="nexus-prose">
						{@html post.content}
					</div>
					<!-- Réactions + Merci -->
					<PostReactions
						postId={post.id}
						reactions={post.reactions ?? []}
						thanksCount={post.thanks_count ?? 0}
						userThanked={post.user_thanked ?? false}
						isOwnPost={user?.id === post.author_id}
						isLoggedIn={!!user}
					/>
				{/if}
			</div>
		</article>
	{/each}
</div>

<!-- ── Formulaire de réponse ──────────────────────────────────────────────── -->
{#if !thread.is_locked}
	{#if user}
		<div class="mt-8 border-t border-gray-800 pt-6">
			<h2 class="text-sm font-semibold text-gray-400 mb-3">Répondre</h2>
			<form method="POST" action="?/reply"
				use:enhance={() => {
					submitting = true
					return async ({ update }) => {
						submitting = false
						replyKey++    // Vide l'éditeur en le remontant
						await update()
					}
				}}
				class="space-y-3"
			>
				{#key replyKey}
					<NexusEditor
						name="content"
						placeholder="Votre réponse..."
						compact={true}
					/>
				{/key}
				<button
					type="submit"
					disabled={submitting}
					class="rounded bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 px-4 py-2 text-sm font-semibold text-white transition-colors"
				>
					{submitting ? 'Publication...' : 'Publier'}
				</button>
			</form>
		</div>
	{:else}
		<div class="mt-8 border-t border-gray-800 pt-6 text-center">
			<p class="text-sm text-gray-500 mb-3">Vous devez être connecté pour répondre.</p>
			<a href="/auth/login" class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold text-white transition-colors">
				Se connecter
			</a>
		</div>
	{/if}
{:else}
	<p class="mt-6 text-sm text-gray-500 border-t border-gray-800 pt-4">Ce sujet est verrouillé.</p>
{/if}
