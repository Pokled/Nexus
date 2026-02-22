<script lang="ts">
	import type { PageData } from './$types'
	import ProfileCard from '$lib/components/ProfileCard.svelte'
	import GitHubWidget from '$lib/components/widgets/GitHubWidget.svelte'

	let { data }: { data: PageData } = $props()
	const profile = $derived(data.profile)

	const title = $derived(`${profile.display_name || profile.username} (@${profile.username}) — Nexus`)
	const description = $derived(profile.bio
		? profile.bio.slice(0, 160)
		: `Profil de ${profile.display_name || profile.username} sur Nexus.`)
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	{#if profile.avatar_url}
		<meta property="og:image" content={profile.avatar_url} />
	{/if}
	<meta property="og:type" content="profile" />
</svelte:head>

<!-- Banner -->
<div class="w-full h-40 bg-gray-800 overflow-hidden">
	{#if profile.banner_url}
		<img
			src={profile.banner_url}
			alt="Bannière de {profile.display_name || profile.username}"
			class="w-full h-full object-cover"
		/>
	{/if}
</div>

<!-- Profile header -->
<div class="max-w-3xl mx-auto px-4">
	<!-- Avatar overlapping banner -->
	<div class="-mt-10 mb-4">
		<ProfileCard
			username={profile.username}
			displayName={profile.display_name}
			avatarUrl={profile.avatar_url}
			points={profile.points}
			tags={profile.tags ?? []}
			memberSince={profile.created_at}
			variant="full"
		/>
	</div>

	<!-- Extended info: status + location -->
	<div class="flex flex-wrap gap-4 text-sm text-gray-400 mb-6">
		{#if profile.status}
			<span class="flex items-center gap-1">
				<span aria-hidden="true">💬</span>
				{profile.status}
			</span>
		{/if}
		{#if profile.location}
			<span class="flex items-center gap-1">
				<span aria-hidden="true">📍</span>
				{profile.location}
			</span>
		{/if}
	</div>

	<!-- Bio -->
	{#if profile.bio}
		<section class="mb-6">
			<h2 class="text-xs uppercase tracking-widest text-gray-500 mb-2">Bio</h2>
			<p class="text-gray-300 whitespace-pre-line">{profile.bio}</p>
		</section>
	{/if}

	<!-- Tags -->
	{#if profile.tags?.length > 0}
		<section class="mb-6">
			<h2 class="text-xs uppercase tracking-widest text-gray-500 mb-2">Tags</h2>
			<ul class="flex flex-wrap gap-2">
				{#each profile.tags as tag}
					<li class="bg-gray-800 text-indigo-300 rounded px-2 py-0.5 text-sm">#{tag}</li>
				{/each}
			</ul>
		</section>
	{/if}

	<!-- Links -->
	{#if profile.links?.length > 0}
		<section class="mb-6">
			<h2 class="text-xs uppercase tracking-widest text-gray-500 mb-2">Liens</h2>
			<ul class="flex flex-wrap gap-3">
				{#each profile.links as link}
					<li>
						<a
							href={link.url}
							target="_blank"
							rel="noopener noreferrer"
							class="text-indigo-400 hover:text-indigo-300 text-sm underline underline-offset-2"
						>
							{link.label}
						</a>
					</li>
				{/each}
			</ul>
		</section>
	{/if}

	<!-- Social widgets — only rendered when the field is set -->
	{#if profile.github_username}
		<section class="mb-6">
			<GitHubWidget nexusUsername={profile.username} />
		</section>
	{/if}
	<!-- Phase 2: YouTubeWidget, TwitterWidget, etc. -->
</div>
