<script lang="ts">
	import { enhance } from '$app/forms'
	import type { PageData, ActionData } from './$types'

	let { data, form }: { data: PageData; form: ActionData } = $props()
	const profile = $derived(data.profile)

	let submitting = $state(false)

	// Links — dynamic list of {label, url} rows
	let links = $state<Array<{ label: string; url: string }>>(
		(profile.links ?? []).map((l: { label: string; url: string }) => ({ ...l }))
	)

	function addLink() { links.push({ label: '', url: '' }) }
	function removeLink(i: number) { links.splice(i, 1) }

	// ── Avatar / Banner upload ─────────────────────────────────────────────────
	type UploadMode = 'url' | 'file'
	let avatarMode  = $state<UploadMode>('url')
	let bannerMode  = $state<UploadMode>('url')

	// Current URL values (bound to the hidden inputs sent in the main form)
	let avatarUrl   = $state<string>(profile.avatar_url ?? '')
	let bannerUrl   = $state<string>(profile.banner_url ?? '')

	// Preview (file object URL, shown immediately after selection)
	let avatarPreview = $state<string>(profile.avatar_url ?? '')
	let bannerPreview = $state<string>(profile.banner_url ?? '')

	let avatarUploading = $state(false)
	let bannerUploading = $state(false)
	let avatarError     = $state('')
	let bannerError     = $state('')

	async function uploadFile(type: 'avatar' | 'banner', file: File) {
		const { PUBLIC_API_URL } = await import('$env/static/public')
		const token = (data as Record<string, unknown>).token as string | null

		const fd = new FormData()
		fd.append('file', file)

		const res = await fetch(`${PUBLIC_API_URL}/api/v1/users/me/upload?type=${type}`, {
			method: 'POST',
			headers: token ? { Authorization: `Bearer ${token}` } : {},
			body: fd,
		})

		if (!res.ok) {
			const j = await res.json().catch(() => ({}))
			throw new Error(j.error ?? 'Erreur upload')
		}

		const { url } = await res.json()
		// url is a relative path like /uploads/avatars/uuid.jpg
		// Prefix with backend base URL so it resolves for any user
		const base = PUBLIC_API_URL.replace('/api/v1', '')
		return url.startsWith('http') ? url : base + url
	}

	async function handleAvatarFile(e: Event) {
		const file = (e.target as HTMLInputElement).files?.[0]
		if (!file) return
		// Instant local preview
		avatarPreview  = URL.createObjectURL(file)
		avatarError    = ''
		avatarUploading = true
		try {
			avatarUrl = await uploadFile('avatar', file)
		} catch (err: unknown) {
			avatarError = err instanceof Error ? err.message : 'Erreur upload'
		} finally {
			avatarUploading = false
		}
	}

	async function handleBannerFile(e: Event) {
		const file = (e.target as HTMLInputElement).files?.[0]
		if (!file) return
		bannerPreview  = URL.createObjectURL(file)
		bannerError    = ''
		bannerUploading = true
		try {
			bannerUrl = await uploadFile('banner', file)
		} catch (err: unknown) {
			bannerError = err instanceof Error ? err.message : 'Erreur upload'
		} finally {
			bannerUploading = false
		}
	}
</script>

<svelte:head>
	<title>Modifier mon profil — Nexus</title>
</svelte:head>

<div class="max-w-2xl mx-auto px-4 py-8">
	<h1 class="text-2xl font-bold text-white mb-6">Modifier mon profil</h1>

	{#if form?.error}
		<p class="mb-4 rounded bg-red-900/50 border border-red-700 px-4 py-2 text-sm text-red-300">
			{form.error}
		</p>
	{/if}

	<form
		method="POST"
		use:enhance={() => {
			submitting = true
			return async ({ update }) => {
				await update()
				submitting = false
			}
		}}
		class="space-y-8"
	>
		<!-- Identity -->
		<section>
			<h2 class="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">Identité</h2>
			<div class="space-y-4">
				<div>
					<label for="display_name" class="block text-sm text-gray-400 mb-1">Nom affiché</label>
					<input
						id="display_name"
						name="display_name"
						type="text"
						maxlength="100"
						value={profile.display_name ?? ''}
						class="w-full rounded bg-gray-800 border border-gray-700 px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
					/>
				</div>
				<div>
					<label for="status" class="block text-sm text-gray-400 mb-1">Statut</label>
					<input
						id="status"
						name="status"
						type="text"
						maxlength="100"
						placeholder="En train de coder..."
						value={profile.status ?? ''}
						class="w-full rounded bg-gray-800 border border-gray-700 px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
					/>
				</div>
				<div>
					<label for="location" class="block text-sm text-gray-400 mb-1">Localisation</label>
					<input
						id="location"
						name="location"
						type="text"
						maxlength="100"
						placeholder="Paris, France"
						value={profile.location ?? ''}
						class="w-full rounded bg-gray-800 border border-gray-700 px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
					/>
				</div>
				<div>
					<label for="bio" class="block text-sm text-gray-400 mb-1">Bio</label>
					<textarea
						id="bio"
						name="bio"
						maxlength="2000"
						rows="4"
						placeholder="Parlez-nous de vous..."
						class="w-full rounded bg-gray-800 border border-gray-700 px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 resize-none"
					>{profile.bio ?? ''}</textarea>
				</div>
			</div>
		</section>

		<!-- Links -->
		<section>
			<h2 class="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">Liens</h2>
			<div class="space-y-2">
				{#each links as link, i}
					<div class="flex gap-2 items-center">
						<input
							name="link_label_{i}"
							type="text"
							maxlength="50"
							placeholder="Label (ex: GitHub)"
							bind:value={link.label}
							class="w-36 shrink-0 rounded bg-gray-800 border border-gray-700 px-3 py-2 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-indigo-500"
						/>
						<input
							name="link_url_{i}"
							type="url"
							maxlength="500"
							placeholder="https://..."
							bind:value={link.url}
							class="flex-1 rounded bg-gray-800 border border-gray-700 px-3 py-2 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-indigo-500"
						/>
						<button
							type="button"
							onclick={() => removeLink(i)}
							class="text-red-400 hover:text-red-300 text-xs px-2 py-2 shrink-0"
							aria-label="Supprimer ce lien"
						>
							✕
						</button>
					</div>
				{/each}
				<button
					type="button"
					onclick={addLink}
					class="text-indigo-400 hover:text-indigo-300 text-sm mt-1"
				>
					+ Ajouter un lien
				</button>
			</div>
		</section>

		<!-- Tags -->
		<section>
			<h2 class="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">Tags</h2>
			<div>
				<label for="tags" class="block text-sm text-gray-400 mb-1">Tags <span class="text-gray-600 text-xs">(séparés par des virgules, max 10)</span></label>
				<input
					id="tags"
					name="tags"
					type="text"
					placeholder="linux, photo, gaming"
					value={profile.tags?.join(', ') ?? ''}
					class="w-full rounded bg-gray-800 border border-gray-700 px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
				/>
			</div>
		</section>

		<!-- Visuels -->
		<section>
			<h2 class="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">Visuels</h2>
			<div class="space-y-6">

				<!-- Hidden inputs used by the main form action -->
				<input type="hidden" name="avatar_url" value={avatarUrl} />
				<input type="hidden" name="banner_url" value={bannerUrl} />

				<!-- Avatar -->
				<div>
					<p class="text-sm text-gray-400 mb-2">Avatar</p>

					<!-- Preview -->
					{#if avatarPreview}
						<img src={avatarPreview} alt="Aperçu avatar" class="w-16 h-16 rounded-full object-cover mb-3 border border-gray-700" />
					{:else}
						<div class="w-16 h-16 rounded-full bg-indigo-800 flex items-center justify-center text-xl font-bold text-white mb-3 select-none">
							{profile.username?.charAt(0).toUpperCase() ?? '?'}
						</div>
					{/if}

					<!-- Mode toggle -->
					<div class="flex gap-1 mb-3">
						<button type="button" onclick={() => { avatarMode = 'url' }}
							class="px-3 py-1 rounded text-xs font-medium transition-colors {avatarMode === 'url' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-400 hover:text-white'}">
							URL internet
						</button>
						<button type="button" onclick={() => { avatarMode = 'file' }}
							class="px-3 py-1 rounded text-xs font-medium transition-colors {avatarMode === 'file' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-400 hover:text-white'}">
							Depuis mon PC
						</button>
					</div>

					{#if avatarMode === 'url'}
						<input
							type="url"
							maxlength="500"
							placeholder="https://..."
							bind:value={avatarUrl}
							oninput={() => { avatarPreview = avatarUrl }}
							class="w-full rounded bg-gray-800 border border-gray-700 px-3 py-2 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-indigo-500"
						/>
					{:else}
						<label class="flex items-center gap-3 cursor-pointer">
							<span class="px-3 py-1.5 rounded bg-gray-700 hover:bg-gray-600 text-sm text-gray-200 transition-colors">
								{avatarUploading ? 'Envoi…' : 'Choisir un fichier'}
							</span>
							<span class="text-xs text-gray-500">JPEG · PNG · WebP · GIF · max 5 Mo</span>
							<input type="file" accept="image/jpeg,image/png,image/webp,image/gif"
								class="sr-only" disabled={avatarUploading} onchange={handleAvatarFile} />
						</label>
						{#if avatarError}
							<p class="text-xs text-red-400 mt-1">{avatarError}</p>
						{/if}
					{/if}
				</div>

				<!-- Bannière -->
				<div>
					<p class="text-sm text-gray-400 mb-2">Bannière de profil</p>

					<!-- Preview -->
					{#if bannerPreview}
						<img src={bannerPreview} alt="Aperçu bannière" class="w-full h-24 object-cover rounded mb-3 border border-gray-700" />
					{:else}
						<div class="w-full h-24 rounded bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-600 text-xs mb-3">
							Aucune bannière
						</div>
					{/if}

					<!-- Mode toggle -->
					<div class="flex gap-1 mb-3">
						<button type="button" onclick={() => { bannerMode = 'url' }}
							class="px-3 py-1 rounded text-xs font-medium transition-colors {bannerMode === 'url' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-400 hover:text-white'}">
							URL internet
						</button>
						<button type="button" onclick={() => { bannerMode = 'file' }}
							class="px-3 py-1 rounded text-xs font-medium transition-colors {bannerMode === 'file' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-400 hover:text-white'}">
							Depuis mon PC
						</button>
					</div>

					{#if bannerMode === 'url'}
						<input
							type="url"
							maxlength="500"
							placeholder="https://..."
							bind:value={bannerUrl}
							oninput={() => { bannerPreview = bannerUrl }}
							class="w-full rounded bg-gray-800 border border-gray-700 px-3 py-2 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-indigo-500"
						/>
					{:else}
						<label class="flex items-center gap-3 cursor-pointer">
							<span class="px-3 py-1.5 rounded bg-gray-700 hover:bg-gray-600 text-sm text-gray-200 transition-colors">
								{bannerUploading ? 'Envoi…' : 'Choisir un fichier'}
							</span>
							<span class="text-xs text-gray-500">JPEG · PNG · WebP · GIF · max 5 Mo</span>
							<input type="file" accept="image/jpeg,image/png,image/webp,image/gif"
								class="sr-only" disabled={bannerUploading} onchange={handleBannerFile} />
						</label>
						{#if bannerError}
							<p class="text-xs text-red-400 mt-1">{bannerError}</p>
						{/if}
					{/if}
				</div>

			</div>
		</section>

		<!-- Social networks -->
		<section>
			<h2 class="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">Réseaux sociaux</h2>
			<div class="space-y-4">
				<div>
					<label for="github_username" class="block text-sm text-gray-400 mb-1">
						GitHub <span class="text-gray-600 text-xs">ex: monusername</span>
					</label>
					<input
						id="github_username"
						name="github_username"
						type="text"
						maxlength="39"
						placeholder="monusername"
						pattern="[a-zA-Z0-9-]+"
						value={profile.github_username ?? ''}
						class="w-full rounded bg-gray-800 border border-gray-700 px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
					/>
				</div>
				<div>
					<label for="youtube_channel" class="block text-sm text-gray-400 mb-1">
						YouTube <span class="text-gray-600 text-xs">ex: @machaîne</span>
					</label>
					<input
						id="youtube_channel"
						name="youtube_channel"
						type="text"
						maxlength="200"
						placeholder="@machaîne"
						value={profile.youtube_channel ?? ''}
						class="w-full rounded bg-gray-800 border border-gray-700 px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
					/>
				</div>
				<div>
					<label for="twitter_username" class="block text-sm text-gray-400 mb-1">
						Twitter / X <span class="text-gray-600 text-xs">ex: monpseudo</span>
					</label>
					<input
						id="twitter_username"
						name="twitter_username"
						type="text"
						maxlength="100"
						placeholder="monpseudo"
						value={profile.twitter_username ?? ''}
						class="w-full rounded bg-gray-800 border border-gray-700 px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
					/>
				</div>
				<div>
					<label for="instagram_username" class="block text-sm text-gray-400 mb-1">
						Instagram <span class="text-gray-600 text-xs">ex: monpseudo</span>
					</label>
					<input
						id="instagram_username"
						name="instagram_username"
						type="text"
						maxlength="100"
						placeholder="monpseudo"
						value={profile.instagram_username ?? ''}
						class="w-full rounded bg-gray-800 border border-gray-700 px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
					/>
				</div>
				<div>
					<label for="website_url" class="block text-sm text-gray-400 mb-1">
						Site web <span class="text-gray-600 text-xs">ex: https://monsite.com</span>
					</label>
					<input
						id="website_url"
						name="website_url"
						type="url"
						maxlength="500"
						placeholder="https://monsite.com"
						value={profile.website_url ?? ''}
						class="w-full rounded bg-gray-800 border border-gray-700 px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
					/>
				</div>
			</div>
		</section>

		<div class="flex items-center gap-4 pt-2">
			<button
				type="submit"
				disabled={submitting}
				class="rounded bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-2 text-sm font-semibold text-white transition-colors"
			>
				{submitting ? 'Enregistrement...' : 'Enregistrer'}
			</button>
			<a href="/users/{profile.username}" class="text-sm text-gray-500 hover:text-gray-300">
				Annuler
			</a>
		</div>
	</form>
</div>
