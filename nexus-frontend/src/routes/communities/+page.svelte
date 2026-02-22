<script lang="ts">
	// ── Mock instances — will be replaced by the real nexus-directory API (Phase 2) ──
	interface NexusInstance {
		subdomain:   string     // name.nexus.io
		name:        string
		description: string
		language:    string     // ISO 639-1
		country:     string     // ISO 3166-1 alpha-2
		theme:       string
		members:     number
		online:      number
		online_status: 'up' | 'down'
		version:     string
		registered:  string     // YYYY-MM
	}

	const INSTANCES: NexusInstance[] = [
		{
			subdomain:    'linux-fr',
			name:         'Linux & Open Source',
			description:  'La communauté francophone du logiciel libre. Kernel, distros, homelab, actualités.',
			language:     'fr', country: 'FR', theme: 'tech',
			members: 1247, online: 34, online_status: 'up', version: '1.0.0', registered: '2026-02',
		},
		{
			subdomain:    'rust-developers',
			name:         'Rust Developers',
			description:  'A global community for Rust programmers. No gatekeeping, just good code.',
			language:     'en', country: 'US', theme: 'tech',
			members: 3891, online: 112, online_status: 'up', version: '1.0.0', registered: '2026-02',
		},
		{
			subdomain:    'gaming-quebec',
			name:         'Gaming Québécois',
			description:  'Jeux vidéo, eSport et sessions multijoueur pour les gamers du Québec.',
			language:     'fr', country: 'CA', theme: 'gaming',
			members: 834, online: 61, online_status: 'up', version: '1.0.0', registered: '2026-02',
		},
		{
			subdomain:    'photo-berlin',
			name:         'Fotografie Berlin',
			description:  'Für Fotografen in Berlin und Brandenburg. Street, portrait, analog.',
			language:     'de', country: 'DE', theme: 'creative',
			members: 562, online: 18, online_status: 'up', version: '1.0.0', registered: '2026-03',
		},
		{
			subdomain:    'homelab-eu',
			name:         'Homelab Europe',
			description:  'Self-hosting, NAS, Proxmox, NixOS, and everything in between.',
			language:     'en', country: 'EU', theme: 'tech',
			members: 1423, online: 47, online_status: 'up', version: '1.0.0', registered: '2026-03',
		},
		{
			subdomain:    'musique-paris',
			name:         'Musique & Production',
			description:  'Beatmakers, compositeurs, ingés son. Partage, critique, collab.',
			language:     'fr', country: 'FR', theme: 'creative',
			members: 389, online: 12, online_status: 'up', version: '1.0.0', registered: '2026-03',
		},
		{
			subdomain:    'cybersec-eu',
			name:         'CyberSec Europe',
			description:  'CTF, pentesting, threat intel, OSINT. For defenders and ethical hackers.',
			language:     'en', country: 'EU', theme: 'tech',
			members: 734, online: 29, online_status: 'up', version: '1.0.0', registered: '2026-03',
		},
		{
			subdomain:    'anime-world',
			name:         'Anime & Manga World',
			description:  'Global community for anime and manga fans. Reviews, recs, art shares.',
			language:     'en', country: 'JP', theme: 'culture',
			members: 5134, online: 203, online_status: 'up', version: '1.0.0', registered: '2026-03',
		},
		{
			subdomain:    'sciences-libres',
			name:         'Sciences Libres',
			description:  'Astronomie, physique, biologie. La science accessible à tous, sans jargon inutile.',
			language:     'fr', country: 'FR', theme: 'science',
			members: 278, online: 9, online_status: 'up', version: '1.0.0', registered: '2026-04',
		},
		{
			subdomain:    'indie-gamedev',
			name:         'Indie Game Dev',
			description:  'Solo devs and small studios sharing progress, feedback, and dev logs.',
			language:     'en', country: 'US', theme: 'gaming',
			members: 1612, online: 55, online_status: 'up', version: '1.0.0', registered: '2026-04',
		},
		{
			subdomain:    'cuisine-fr',
			name:         'Cuisine & Gastronomie',
			description:  'Recettes, techniques, restaurants, vins. Pour les passionnés de bonne table.',
			language:     'fr', country: 'FR', theme: 'culture',
			members: 456, online: 14, online_status: 'up', version: '1.0.0', registered: '2026-04',
		},
		{
			subdomain:    'astro-amateur',
			name:         'Astronomie Amateur',
			description:  'Observations, matériel, astrophoto. Pour ceux qui regardent le ciel la nuit.',
			language:     'fr', country: 'FR', theme: 'science',
			members: 198, online: 6, online_status: 'up', version: '1.0.0', registered: '2026-04',
		},
	]

	const THEMES = [
		{ key: 'all',      label: 'Tous' },
		{ key: 'tech',     label: '💻 Tech' },
		{ key: 'gaming',   label: '🎮 Gaming' },
		{ key: 'creative', label: '🎨 Créatif' },
		{ key: 'science',  label: '🔬 Science' },
		{ key: 'culture',  label: '🎌 Culture' },
	]

	const LANGUAGES = [
		{ key: 'all', label: 'Toutes' },
		{ key: 'fr',  label: '🇫🇷 Français' },
		{ key: 'en',  label: '🇬🇧 English' },
		{ key: 'de',  label: '🇩🇪 Deutsch' },
	]

	let themeFilter    = $state('all')
	let langFilter     = $state('all')
	let searchQuery    = $state('')

	const filtered = $derived(
		INSTANCES.filter(i => {
			if (themeFilter !== 'all' && i.theme !== themeFilter) return false
			if (langFilter  !== 'all' && i.language !== langFilter) return false
			if (searchQuery) {
				const q = searchQuery.toLowerCase()
				return i.name.toLowerCase().includes(q)
				    || i.description.toLowerCase().includes(q)
				    || i.subdomain.toLowerCase().includes(q)
			}
			return true
		})
	)

	const totalMembers = $derived(filtered.reduce((s, i) => s + i.members, 0))
	const totalOnline  = $derived(filtered.reduce((s, i) => s + i.online,  0))

	function flag(country: string): string {
		if (!country || country.length !== 2 || country === 'EU') return '🌐'
		return country.toUpperCase().split('').map(c =>
			String.fromCodePoint(0x1f1e6 - 65 + c.charCodeAt(0))
		).join('')
	}

	const THEME_COLORS: Record<string, string> = {
		tech:     'bg-blue-900/50 text-blue-400 border-blue-800/50',
		gaming:   'bg-purple-900/50 text-purple-400 border-purple-800/50',
		creative: 'bg-pink-900/50 text-pink-400 border-pink-800/50',
		science:  'bg-cyan-900/50 text-cyan-400 border-cyan-800/50',
		culture:  'bg-orange-900/50 text-orange-400 border-orange-800/50',
	}
</script>

<svelte:head>
	<title>Annuaire des instances — Réseau Nexus</title>
	<meta name="description" content="Découvrez toutes les communautés du réseau Nexus. Chaque instance est une communauté indépendante et auto-hébergée." />
</svelte:head>

<!-- ── Header ─────────────────────────────────────────────────────────────── -->
<div class="mb-8">
	<div class="flex items-start justify-between gap-4 flex-wrap">
		<div>
			<div class="flex items-center gap-2 mb-2">
				<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
				             bg-indigo-900/60 text-indigo-300 border border-indigo-800/60">
					<span class="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
					Réseau Nexus — Phase 1
				</span>
			</div>
			<h1 class="text-3xl font-bold text-white">Annuaire des instances</h1>
			<p class="text-gray-400 mt-1 max-w-xl">
				Chaque instance est une communauté indépendante. Hébergée par ses membres.
				Accessible à tous. Plus il y en a, plus le réseau est fort.
			</p>
		</div>

		<!-- Network stats -->
		<div class="flex gap-4 text-center shrink-0">
			<div class="px-4 py-3 rounded-lg bg-gray-900 border border-gray-800">
				<div class="text-xl font-bold text-white">{INSTANCES.length}</div>
				<div class="text-xs text-gray-500">instances</div>
			</div>
			<div class="px-4 py-3 rounded-lg bg-gray-900 border border-gray-800">
				<div class="text-xl font-bold text-white">{INSTANCES.reduce((s,i)=>s+i.members,0).toLocaleString('fr-FR')}</div>
				<div class="text-xs text-gray-500">membres</div>
			</div>
			<div class="px-4 py-3 rounded-lg bg-gray-900 border border-gray-800">
				<div class="text-xl font-bold text-green-400">{INSTANCES.reduce((s,i)=>s+i.online,0)}</div>
				<div class="text-xs text-gray-500">en ligne</div>
			</div>
		</div>
	</div>
</div>

<!-- ── Filters ────────────────────────────────────────────────────────────── -->
<div class="flex flex-wrap gap-4 mb-6">
	<!-- Search -->
	<div class="relative flex-1 min-w-[200px]">
		<svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
		     fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
			      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
		</svg>
		<input
			type="text"
			placeholder="Rechercher une instance..."
			bind:value={searchQuery}
			class="w-full pl-9 pr-4 py-2 rounded-lg bg-gray-900 border border-gray-800
			       text-sm text-gray-200 placeholder-gray-600
			       focus:outline-none focus:border-indigo-700 transition-colors"
		/>
	</div>

	<!-- Theme filter -->
	<div class="flex gap-1 flex-wrap">
		{#each THEMES as t}
			<button
				onclick={() => themeFilter = t.key}
				class="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
				       {themeFilter === t.key
				         ? 'bg-indigo-700 text-white'
				         : 'bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800'}"
			>
				{t.label}
			</button>
		{/each}
	</div>

	<!-- Language filter -->
	<div class="flex gap-1 flex-wrap">
		{#each LANGUAGES as l}
			<button
				onclick={() => langFilter = l.key}
				class="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
				       {langFilter === l.key
				         ? 'bg-gray-700 text-white'
				         : 'bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800'}"
			>
				{l.label}
			</button>
		{/each}
	</div>
</div>

<!-- ── Results count ──────────────────────────────────────────────────────── -->
<div class="flex items-center justify-between mb-4 text-xs text-gray-600">
	<span>{filtered.length} instance{filtered.length > 1 ? 's' : ''} trouvée{filtered.length > 1 ? 's' : ''}</span>
	{#if themeFilter !== 'all' || langFilter !== 'all' || searchQuery}
		<span class="text-gray-500">
			{totalMembers.toLocaleString('fr-FR')} membres ·
			<span class="text-green-600">{totalOnline} en ligne</span>
		</span>
	{/if}
</div>

<!-- ── Grid ───────────────────────────────────────────────────────────────── -->
{#if filtered.length === 0}
	<div class="text-center py-16 border border-dashed border-gray-800 rounded-xl">
		<p class="text-gray-500">Aucune instance ne correspond à ces filtres.</p>
	</div>
{:else}
	<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
		{#each filtered as instance}
			<div class="flex flex-col rounded-xl border border-gray-800 bg-gray-900/50
			            hover:border-indigo-800/60 hover:bg-gray-900/80 transition-all group p-5">

				<!-- Top row: avatar + status -->
				<div class="flex items-start justify-between mb-3">
					<div class="flex items-center gap-3">
						<!-- Avatar initials -->
						<div class="w-10 h-10 rounded-lg bg-indigo-900 flex items-center justify-center
						            text-base font-bold text-indigo-200 select-none shrink-0">
							{instance.name.charAt(0).toUpperCase()}
						</div>
						<div>
							<h2 class="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors leading-tight">
								{instance.name}
							</h2>
							<span class="text-xs text-gray-600 font-mono">{instance.subdomain}.nexus.io</span>
						</div>
					</div>

					<!-- Online status dot -->
					<div class="flex items-center gap-1.5 shrink-0">
						<span class="w-2 h-2 rounded-full {instance.online_status === 'up' ? 'bg-green-400' : 'bg-gray-600'}"></span>
						<span class="text-xs text-gray-600">{instance.online_status === 'up' ? 'en ligne' : 'hors ligne'}</span>
					</div>
				</div>

				<!-- Description -->
				<p class="text-xs text-gray-400 leading-relaxed line-clamp-2 flex-1 mb-4">
					{instance.description}
				</p>

				<!-- Tags row -->
				<div class="flex flex-wrap items-center gap-1.5 mb-4">
					<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs border
					             {THEME_COLORS[instance.theme] ?? 'bg-gray-800 text-gray-400 border-gray-700'}">
						{THEMES.find(t => t.key === instance.theme)?.label ?? instance.theme}
					</span>
					<span class="px-2 py-0.5 rounded text-xs bg-gray-800 text-gray-400 border border-gray-700">
						{flag(instance.country)} {instance.language.toUpperCase()}
					</span>
					<span class="px-2 py-0.5 rounded text-xs bg-gray-800 text-gray-500 border border-gray-700 font-mono">
						v{instance.version}
					</span>
				</div>

				<!-- Stats + CTA -->
				<div class="flex items-center justify-between pt-3 border-t border-gray-800/60">
					<div class="flex items-center gap-3 text-xs text-gray-500">
						<span>
							<span class="text-gray-300 font-medium">{instance.members.toLocaleString('fr-FR')}</span>
							membres
						</span>
						<span class="text-green-500">
							<span class="font-medium">{instance.online}</span> en ligne
						</span>
					</div>
					<a
						href="https://{instance.subdomain}.nexus.io"
						target="_blank"
						rel="noopener"
						class="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors
						       flex items-center gap-1"
					>
						Visiter
						<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
							      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
						</svg>
					</a>
				</div>
			</div>
		{/each}
	</div>
{/if}

<!-- ── Register your instance CTA ────────────────────────────────────────── -->
<div class="mt-10 rounded-xl border border-dashed border-indigo-900/60 bg-indigo-950/20 p-8 text-center">
	<div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-900/60
	            border border-indigo-800 mb-4">
		<svg class="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
			      d="M12 4v16m8-8H4"/>
		</svg>
	</div>
	<h3 class="text-lg font-semibold text-white mb-2">Vous avez une instance Nexus ?</h3>
	<p class="text-sm text-gray-400 max-w-md mx-auto mb-5">
		Enregistrez-la dans l'annuaire et recevez un sous-domaine gratuit
		<code class="text-indigo-400">votre-nom.nexus.io</code>.
		Votre communauté devient visible dans le réseau.
	</p>
	<div class="flex flex-wrap gap-3 justify-center">
		<a
			href="https://github.com/nexus"
			target="_blank"
			rel="noopener"
			class="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-700 hover:bg-indigo-600
			       text-sm font-semibold text-white transition-colors"
		>
			Enregistrer mon instance
		</a>
		<a
			href="https://github.com/nexus"
			target="_blank"
			rel="noopener"
			class="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gray-800 hover:bg-gray-700
			       border border-gray-700 text-sm font-semibold text-gray-200 transition-colors"
		>
			Installer Nexus
		</a>
	</div>
	<p class="text-xs text-gray-600 mt-4">
		Sous-domaine gratuit · SSL automatique · AGPL-3.0
	</p>
</div>
