<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	function formatDate(iso: string) {
		return new Date(iso).toLocaleDateString('fr-FR', {
			day: '2-digit', month: 'short', year: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>Forum — Nexus</title>
	<meta name="description" content="Liste des discussions — forum Nexus" />
	<meta property="og:title"       content="Forum — Nexus" />
	<meta property="og:type"        content="website" />
	{@html `<script type="application/ld+json">${JSON.stringify({
		"@context": "https://schema.org",
		"@type": "CollectionPage",
		"name": "Forum — Nexus",
		"description": "Liste des discussions",
		"hasPart": data.threads.map((t: any) => ({
			"@type": "DiscussionForumPosting",
			"headline": t.title,
			"author": { "@type": "Person", "name": t.author_username },
			"datePublished": t.created_at,
			"commentCount": t.post_count
		}))
	})}</script>`}
</svelte:head>

<div class="mb-6 flex items-center justify-between">
	<div>
		<a href="/" class="text-sm text-gray-500 hover:text-gray-300">← Accueil</a>
		<h1 class="mt-1 text-2xl font-bold text-white">Discussions</h1>
	</div>
	{#if data.user}
		<a
			href="/forum/{data.categoryId}/new"
			class="rounded bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition-colors"
		>
			+ Nouveau sujet
		</a>
	{:else}
		<a href="/auth/login" class="text-sm text-gray-500 hover:text-gray-300">
			Connectez-vous pour poster
		</a>
	{/if}
</div>

{#if data.threads.length === 0}
	<p class="text-gray-500">Aucun sujet dans cette catégorie.</p>
{:else}
	<div class="space-y-2">
		{#each data.threads as thread}
			<a
				href="/forum/{data.categoryId}/{thread.id}"
				class="flex items-center gap-4 rounded-lg border border-gray-800 bg-gray-900 px-5 py-4 hover:border-indigo-700 transition-colors"
			>
				<div class="flex-1 min-w-0">
					<div class="flex flex-wrap items-center gap-1.5 mb-1">
						{#if thread.is_pinned}
							<span class="text-xs font-medium text-indigo-400">📌 Épinglé</span>
						{/if}
						{#if thread.is_locked}
							<span class="text-xs font-medium text-gray-500">🔒 Verrouillé</span>
						{/if}
						{#each (thread.tags ?? []) as tag}
							<span class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium"
								style="background-color: {tag.color}22; color: {tag.color}; border: 1px solid {tag.color}44">
								{tag.name}
							</span>
						{/each}
					</div>
					<p class="font-medium text-white truncate">{thread.title}</p>
					<p class="mt-0.5 text-xs text-gray-500">
						Par {thread.author_username} · {formatDate(thread.created_at)}
					</p>
				</div>
				<div class="text-right shrink-0">
					<p class="text-sm font-medium text-gray-300">{thread.post_count}</p>
					<p class="text-xs text-gray-500">réponses</p>
				</div>
			</a>
		{/each}
	</div>
{/if}
