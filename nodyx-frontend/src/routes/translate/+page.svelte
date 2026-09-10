<!--
  État des traductions (translate.nodyx.org).

  Tableau de bord, pas plaquette : la table des langues est l'objet principal,
  triable et filtrable. Tous les chiffres viennent de translationProgress.ts,
  donc des fichiers de locale eux-mêmes : la page ne peut pas mentir.
-->
<script lang="ts">
	import { fade }                      from 'svelte/transition'
	import { t, locale, LOCALES }         from '$lib/i18n'
	import { getTranslationProgress, flagSvg } from '$lib/translationProgress'
	import type { LocaleProgress }    from '$lib/translationProgress'
	import type { LocaleContributor, GlobalContributor, AllContributor } from '$lib/localeActivity.server'

	let langMenuOpen = $state(false)
	function pickPageLocale(code: (typeof LOCALES)[number]['code']) {
		locale.setLocale(code)
		langMenuOpen = false
	}

	// Plusieurs photos par langue — cf static/biomes/. Jonathan : "imagine un
	// guide touristique par mise en avant de pays" — donc pas une photo figée,
	// une petite tournée qui défile toute seule tant qu'on reste sur la langue.
	// Le {#key} plus bas fait le fondu enchaîné à chaque changement (de photo
	// comme de langue).
	const BIOME_IMGS: Record<string, string[]> = {
		fr:      ['/biomes/fr-1.webp', '/biomes/fr-2.webp', '/biomes/fr-3.webp'],
		en:      ['/biomes/en-1.webp', '/biomes/en-2.webp', '/biomes/en-3.webp'],
		es:      ['/biomes/es-1.webp', '/biomes/es-2.webp', '/biomes/es-3.webp'],
		de:      ['/biomes/de-1.webp', '/biomes/de-2.webp', '/biomes/de-3.webp'],
		ru:      ['/biomes/ru-1.webp', '/biomes/ru-2.webp'],
		'pt-PT': ['/biomes/pt-PT-1.webp', '/biomes/pt-PT-2.webp'],
		'pt-BR': ['/biomes/pt-BR-1.webp', '/biomes/pt-BR-2.webp'],
		vi:      ['/biomes/vi-1.webp', '/biomes/vi-2.webp', '/biomes/vi-3.webp'],
	}
	const heroImages = $derived(BIOME_IMGS[$locale] ?? BIOME_IMGS.en)

	const ROTATION_MS = 6000

	let heroIndex = $state(0)
	// Repart de la première photo (celle qui donne le ton du pays) à chaque
	// changement de langue, plutôt que de garder un index qui ne correspond
	// plus à rien pour la nouvelle série.
	$effect(() => { $locale; heroIndex = 0 })
	$effect(() => {
		const n = heroImages.length
		if (n <= 1) return
		const id = setInterval(() => { heroIndex = (heroIndex + 1) % n }, ROTATION_MS)
		return () => clearInterval(id)
	})
	const heroImg = $derived(heroImages[heroIndex] ?? heroImages[0])
	// Un clic sur une barre saute directement à cette photo — le minuteur
	// continue de tourner sur son propre cycle, pas la peine de le relancer
	// pour un simple raccourci manuel.
	function jumpToHero(i: number) { heroIndex = i }

	// Les horizons pas encore franchis — de vraies photos aussi, pour ne pas
	// trahir l'idée en retombant sur des dégradés à cet endroit précis.
	const UNCLAIMED: { code: string; name: string; img: string; flagIcon: string }[] = [
		{ code: 'it', name: 'Italiano',     img: '/biomes/unclaimed/it.webp', flagIcon: 'twemoji:flag-italy' },
		{ code: 'ja', name: '日本語',        img: '/biomes/unclaimed/ja.webp', flagIcon: 'twemoji:flag-japan' },
		// Pas de drapeau "arabe" générique dans le bundle Twemoji : le Maroc est
		// une vraie langue arabophone parmi d'autres, choix pragmatique plutôt
		// que d'ajouter un nouvel asset pour un seul horizon non franchi.
		{ code: 'ar', name: 'العربية',      img: '/biomes/unclaimed/ar.webp', flagIcon: 'twemoji:flag-morocco' },
		{ code: 'hi', name: 'हिन्दी',        img: '/biomes/unclaimed/hi.webp', flagIcon: 'twemoji:flag-india' },
		{ code: 'uk', name: 'Українська',   img: '/biomes/unclaimed/uk.webp', flagIcon: 'twemoji:flag-ukraine' },
	]
	const heroFlagIcon = $derived(LOCALES.find((l) => l.code === $locale)?.flagIcon ?? '')

	let { data } = $props()
	const activity        = $derived(data.activity.locales as Record<string, { lastUpdated: string; contributors: LocaleContributor[] }>)
	const everyone         = $derived(data.activity.contributors as GlobalContributor[])
	const allContributors  = $derived(data.allContributors as AllContributor[])

	const tFn = $derived($t)

	const RANK_KEY: Record<string, string> = {
		rookie:  'translate.contributors.rank.rookie',
		regular: 'translate.contributors.rank.regular',
		core:    'translate.contributors.rank.core',
		star:    'translate.contributors.rank.star',
		legend:  'translate.contributors.rank.legend',
	}

	const rtf = $derived(new Intl.RelativeTimeFormat($locale, { numeric: 'auto' }))
	function relativeDate(iso: string): string {
		const days = Math.round((Date.now() - new Date(iso).getTime()) / 86_400_000)
		return rtf.format(days > 0 ? -days : 0, 'day')
	}

	let openPopup = $state<{ contributor: LocaleContributor; localeLabel: string } | null>(null)
	function showPopup(contributor: LocaleContributor, localeLabel: string) { openPopup = { contributor, localeLabel } }
	function closePopup() { openPopup = null }

	let openAllPopup = $state<AllContributor | null>(null)
	function showAllPopup(c: AllContributor) { openAllPopup = c }
	function closeAllPopup() { openAllPopup = null }

	function onKeydown(e: KeyboardEvent) {
		if (e.key !== 'Escape') return
		closePopup()
		closeAllPopup()
		langMenuOpen = false
	}

	const REPO    = 'https://github.com/Pokled/nodyx'
	const LOCALES_DIR = `${REPO}/tree/main/nodyx-frontend/src/lib/locales`

	// Le guide de contribution vit dans docs/<langue>/, il n'y en a pas a la
	// racine du depot. On envoie le visiteur droit sur la section traduction,
	// dans sa langue quand elle existe (fr, en, es), sinon en anglais.
	const GUIDES: Record<string, string> = {
		fr: 'docs/fr/CONTRIBUTING.md#traduire-nodyx',
		en: 'docs/en/CONTRIBUTING.md#translating-nodyx',
		es: 'docs/es/CONTRIBUTING.md#traducir-nodyx',
	}
	const CONTRIB = $derived(`${REPO}/blob/main/${GUIDES[$locale.slice(0, 2)] ?? GUIDES.en}`)

	// Une langue absente de la liste ne peut pas etre ajoutee par le visiteur seul :
	// le cablage est en dur dans i18n.ts (type Locale, LOCALES, imports, messages).
	// Le gabarit d'issue est donc la vraie porte d'entree, pas une pull request.
	const NEW_LANG = `${REPO}/issues/new?template=new_language.yml`
	const editUrl = (code: string) => `${REPO}/edit/main/nodyx-frontend/src/lib/locales/${code}.json`
	const viewUrl = (code: string) => `${REPO}/blob/main/nodyx-frontend/src/lib/locales/${code}.json`

	const progress = getTranslationProgress()

	// Les nombres suivent la langue affichée (séparateurs de milliers).
	const nf  = $derived(new Intl.NumberFormat($locale))
	const num = $derived((n: number) => nf.format(n))

	type SortKey = 'label' | 'pct' | 'translated' | 'missing'
	let sortKey = $state<SortKey>('pct')
	let sortDir = $state<'asc' | 'desc'>('desc')
	let query   = $state('')

	function sortBy(key: SortKey) {
		if (sortKey === key) sortDir = sortDir === 'asc' ? 'desc' : 'asc'
		else { sortKey = key; sortDir = key === 'label' ? 'asc' : 'desc' }
	}

	const rows = $derived((() => {
		const q = query.trim().toLowerCase()
		const out = progress.languages.filter(
			(l) => !q || l.label.toLowerCase().includes(q) || l.code.toLowerCase().includes(q),
		)
		return out.sort((a: LocaleProgress, b: LocaleProgress) => {
			const d = sortKey === 'label'
				? a.label.localeCompare(b.label)
				: (a[sortKey] as number) - (b[sortKey] as number)
			const tie = d === 0 ? a.label.localeCompare(b.label) : d
			return sortDir === 'asc' ? tie : -tie
		})
	})())

	const caret = $derived(sortDir === 'asc' ? '▲' : '▼')
</script>

<svelte:head>
	<title>{tFn('translate.meta.title')}</title>
	<meta name="description" content={tFn('translate.meta.desc')} />
</svelte:head>

<!-- ══ Barre d'application ══════════════════════════════════════════════════ -->
<header class="chrome">
	<a class="logo" href="/">
		<span class="mark"></span>
		Nodyx <span class="sub">{tFn('translate.chrome_sub')}</span>
	</a>
	<nav class="top">
		<a href="#languages">{tFn('translate.nav.languages')}</a>
		<a href={LOCALES_DIR} target="_blank" rel="noopener">{tFn('translate.nav.files')}</a>
	</nav>
	<span class="grow"></span>

	<!-- Le picker de langue du layout principal ne vit pas ici : /translate a
	     son propre chrome. Sans ce switcher, la page qui explique les
	     traductions n'était lisible qu'en fr/en — l'ironie a été relevée. -->
	<div class="langpick">
		<button type="button" class="langbtn" onclick={() => langMenuOpen = !langMenuOpen} aria-expanded={langMenuOpen} aria-haspopup="listbox">
			<span class="flag sm">{@html flagSvg(LOCALES.find((l) => l.code === $locale)?.flagIcon ?? '')}</span>
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
		</button>
		{#if langMenuOpen}
			<div class="lang-backdrop" role="presentation" onclick={() => langMenuOpen = false}></div>
			<ul class="langmenu" role="listbox">
				{#each LOCALES as l (l.code)}
					<li>
						<button type="button" class:active={l.code === $locale} onclick={() => pickPageLocale(l.code)}>
							<span class="flag sm">{@html flagSvg(l.flagIcon)}</span>
							{l.label}
						</button>
					</li>
				{/each}
			</ul>
		{/if}
	</div>

	<a class="cta" href={CONTRIB} target="_blank" rel="noopener">
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>
		{tFn('translate.contribute')}
	</a>
</header>

<!-- ══ Le paysage ═══════════════════════════════════════════════════════════
     Une vraie photo par langue, en fondu enchaîné au changement (cf $locale).
     Jonathan : "je veux voir ce dont tu es capable" — donc pas un dégradé,
     un vrai lieu, à chaque langue le sien. -->
<div class="hero">
	{#key heroImg}
		<img src={heroImg} alt="" class="hero-img" in:fade={{ duration: 650 }} />
	{/key}
	{#key $locale}
		<span class="hero-flag" in:fade={{ duration: 400, delay: 150 }}>{@html flagSvg(heroFlagIcon)}</span>
	{/key}

	<!-- Le minuteur de la tournée — façon stories, une barre par photo. Sans
	     lui la rotation se voyait mais ne s'expliquait pas. Cliquable : on
	     peut sauter directement à une photo plutôt que d'attendre. -->
	{#if heroImages.length > 1}
		<div class="hero-timer" role="tablist" aria-label={tFn('translate.title')}>
			{#each heroImages as img, i (img)}
				<button
					type="button"
					class="ht-bar"
					role="tab"
					aria-selected={i === heroIndex}
					onclick={() => jumpToHero(i)}
				>
					<span class="ht-fill" class:done={i < heroIndex}>
						{#if i === heroIndex}
							{#key heroIndex}
								<span class="ht-run" style="animation-duration:{ROTATION_MS}ms"></span>
							{/key}
						{/if}
					</span>
				</button>
			{/each}
		</div>
	{/if}

	<div class="hero-scrim"></div>
	<div class="hero-content">
		<h1>
			<span class="cico" aria-hidden="true">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 8 6 6M4 14l6-6 2-3M2 5h12M7 2h1M22 22l-5-10-5 10M14 18h6"/></svg>
			</span>
			{tFn('translate.title')}
		</h1>
		<p class="psub">{tFn('translate.subtitle', { n: progress.languages.length })}</p>
		<span class="updated">{tFn('translate.computed_hint')}</span>
	</div>
</div>

<div class="wrap">

	<!-- ══ Les gens ═════════════════════════════════════════════════════════
	     Avant le tableau de bord froid, les visages. Décompte collectif, pas
	     un crédit par langue (cf pile plus bas) : qui, un jour, a traduit
	     un mot de Nodyx pour quelqu'un d'autre. -->
	{#if everyone.length}
		<section class="people">
			<div class="people-row" role="group" aria-label={tFn('translate.people.aria')}>
				{#each everyone as p (p.username ?? p.authorName)}
					{#if p.profileUrl}
						<a class="pav" href={p.profileUrl} target="_blank" rel="noopener" title={p.username ?? p.authorName}>
							{#if p.avatarUrl}
								<img src={p.avatarUrl} alt="" loading="lazy" />
							{:else}
								<span class="cinit">{(p.authorName || '?').slice(0, 1).toUpperCase()}</span>
							{/if}
						</a>
					{:else}
						<span class="pav" title={p.authorName}>
							<span class="cinit">{(p.authorName || '?').slice(0, 1).toUpperCase()}</span>
						</span>
					{/if}
				{/each}
			</div>
			<p class="people-line">
				{tFn(everyone.length > 1 ? 'translate.people.many' : 'translate.people.one', { n: everyone.length })}
			</p>
		</section>
	{/if}

	<!-- ══ Vue d'ensemble ═══════════════════════════════════════════════════ -->
	<section class="overview">
		<div class="metrics">
			<div class="metric">
				<div class="v">{progress.overallPct}<span class="s">%</span></div>
				<div class="k">{tFn('translate.metric.translated')}</div>
			</div>
			<div class="metric">
				<div class="v">{progress.languages.length}</div>
				<div class="k">{tFn('translate.metric.languages')}</div>
			</div>
			<div class="metric">
				<div class="v em">{progress.completeCount}</div>
				<div class="k">{tFn('translate.metric.complete')}</div>
			</div>
			<div class="metric">
				<div class="v">{num(progress.total)}</div>
				<div class="k">{tFn('translate.metric.strings')}</div>
			</div>
			<div class="metric">
				<div class="v">{progress.languages.filter((l) => l.isCoreComplete).length}<span class="s">/{progress.languages.length}</span></div>
				<div class="k">{tFn('translate.metric.core')}</div>
			</div>
		</div>

		<div class="obar"><i style="width:{progress.overallPct}%"></i></div>
		<div class="obar-cap">
			<span>{tFn('translate.overall', { done: num(progress.translatedAll), total: num(progress.grandTotal) })}</span>
			<span>{progress.overallPct}%</span>
		</div>
	</section>

	<!-- ══ Les langues ══════════════════════════════════════════════════════ -->
	<section class="panel" id="languages">
		<div class="panel-head">
			<span class="ttl">{tFn('translate.nav.languages')}</span>
			<span class="cnt">
				{rows.length > 1
					? tFn('translate.lang_count_many', { n: rows.length })
					: tFn('translate.lang_count_one',  { n: rows.length })}
			</span>
			<span class="grow"></span>
			<div class="search">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
				<input type="text" bind:value={query} placeholder={tFn('translate.filter')} aria-label={tFn('translate.filter')} autocomplete="off" />
			</div>
		</div>

		<div class="tscroll">
			<table>
				<thead>
					<tr>
						<th><button type="button" class="sort" class:sorted={sortKey === 'label'} onclick={() => sortBy('label')}>
							{tFn('translate.col.language')} <span class="car">{caret}</span>
						</button></th>
						<th><button type="button" class="sort" class:sorted={sortKey === 'pct'} onclick={() => sortBy('pct')}>
							{tFn('translate.col.progress')} <span class="car">{caret}</span>
						</button></th>
						<th class="num"><button type="button" class="sort" class:sorted={sortKey === 'translated'} onclick={() => sortBy('translated')}>
							{tFn('translate.col.done')} <span class="car">{caret}</span>
						</button></th>
						<th class="num"><button type="button" class="sort" class:sorted={sortKey === 'missing'} onclick={() => sortBy('missing')}>
							{tFn('translate.col.remaining')} <span class="car">{caret}</span>
						</button></th>
						<th class="mid">{tFn('translate.col.core')}</th>
						<th>{tFn('translate.col.contributors')}</th>
						<th><span class="sr">{tFn('translate.col.actions')}</span></th>
					</tr>
				</thead>
				<tbody>
					{#each rows as l (l.code)}
						<tr>
							<td>
								<div class="lang">
									<span class="flag">{@html l.flagSvg}</span>
									<span class="id">
										<span class="nm">
											{l.label}
											{#if l.isSource}
												<span class="tag src">{tFn('translate.tag.source')}</span>
											{:else if l.isComplete}
												<span class="tag done">{tFn('translate.tag.complete')}</span>
											{/if}
										</span>
										<span class="cd">{l.code}.json</span>
									</span>
								</div>
							</td>
							<td>
								<div class="prog">
									<span class="pbar"><i class:done={l.isComplete} style="width:{l.pct}%"></i></span>
									<span class="pct" class:done={l.isComplete}>{l.pct}%</span>
								</div>
							</td>
							<td class="num">{num(l.translated)}</td>
							<td class="num" class:zero={l.missing === 0}>{num(l.missing)}</td>
							<td class="mid">
								{#if l.isCoreComplete}
									<span class="core-ok" title={tFn('translate.core_done')}>
										<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>
										<span class="sr">{tFn('translate.core_done')}</span>
									</span>
								{:else}
									<span class="core-no" aria-hidden="true">·</span>
								{/if}
							</td>
							<td>
								{#if activity[l.code]?.contributors.length}
									<div class="cstack" role="group" aria-label={tFn('translate.contributors.aria_stack', { lang: l.label })}>
										{#each activity[l.code].contributors as c, i (c.username ?? c.authorName)}
											<button
												type="button"
												class="cav"
												style="--i:{i}; z-index:{10 - i}"
												title={c.username ?? c.authorName}
												onclick={() => showPopup(c, l.label)}
											>
												{#if c.avatarUrl}
													<img src={c.avatarUrl} alt="" loading="lazy" />
												{:else}
													<span class="cinit">{(c.authorName || '?').slice(0, 1).toUpperCase()}</span>
												{/if}
											</button>
										{/each}
									</div>
								{/if}
								{#if activity[l.code]?.lastUpdated}
									<div class="clast">{tFn('translate.contributors.updated', { when: relativeDate(activity[l.code].lastUpdated) })}</div>
								{/if}
							</td>
							<td>
								<div class="acts">
									<a class="icat edit" href={editUrl(l.code)} target="_blank" rel="noopener" title={tFn('translate.action.edit')} aria-label={tFn('translate.action.edit')}>
										<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
									</a>
									<a class="icat" href={viewUrl(l.code)} target="_blank" rel="noopener" title={tFn('translate.action.view')} aria-label={tFn('translate.action.view')}>
										<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
									</a>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</section>

	<!-- ══ La langue absente ════════════════════════════════════════════════
	     La table ne montre que les langues livrees. Sans ce bloc, un visiteur
	     dont la langue manque n'a aucune porte : il en deduit que le projet ne
	     l'accepte pas. Signale dans la discussion #595.                       -->
	<section class="newlang">
		<svg class="globe" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
			<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18"/>
		</svg>
		<div class="txt">
			<h2>{tFn('translate.newlang.title')}</h2>
			<p>{tFn('translate.newlang.desc')}</p>
		</div>
		<a class="ask" href={NEW_LANG} target="_blank" rel="noopener">
			{tFn('translate.newlang.cta')}
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
		</a>
	</section>

	<!-- ══ Les horizons pas encore franchis ════════════════════════════════════
	     L'idée de Jonathan : montrer, pas juste dire, ce qui manque encore.
	     De vraies photos, pas des dégradés — même traitement que le paysage
	     d'en-tête. Chaque carte mène à la même porte que translate.newlang. -->
	<section class="horizons">
		{#each UNCLAIMED as u (u.code)}
			<a class="hcard" href={NEW_LANG} target="_blank" rel="noopener">
				<img src={u.img} alt="" loading="lazy" />
				<div class="hcard-scrim"></div>
				<span class="hcard-flag">{@html flagSvg(u.flagIcon)}</span>
				<div class="hcard-txt">
					<span class="hcard-name">{u.name}</span>
					<span class="hcard-tag">{tFn('translate.newlang.horizon')}</span>
				</div>
			</a>
		{/each}
	</section>

	<!-- ══ Le filet ═════════════════════════════════════════════════════════ -->
	<div class="info">
		<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="9"/></svg>
		<p>{@html tFn('translate.safety')}</p>
		<span class="grow"></span>
		<a class="more" href={CONTRIB} target="_blank" rel="noopener">{tFn('translate.safety_link')}</a>
	</div>

	<!-- ══ Bien au-delà des traductions ═════════════════════════════════════
	     /translate est une porte d'entrée, pas la seule. Ces gens ont aussi
	     corrigé des bugs, écrit des features, sauvé une nuit de prod — pour
	     ne pas les oublier derrière la seule vitrine des langues. -->
	{#if allContributors.length}
		<section class="allcontrib">
			<h2><span aria-hidden="true">✨</span> {tFn('translate.allcontrib.title')}</h2>
			<p class="allcontrib-sub">{tFn('translate.allcontrib.subtitle')}</p>
			<div class="allcontrib-grid">
				{#each allContributors as p (p.username ?? p.displayName)}
					<button type="button" class="acard" onclick={() => showAllPopup(p)}>
						{#if p.avatarUrl}
							<img src={p.avatarUrl} alt="" loading="lazy" />
						{:else}
							<span class="cinit big">{(p.displayName || '?').slice(0, 1).toUpperCase()}</span>
						{/if}
						<span class="acard-name">{p.displayName}</span>
						{#if p.starRank}
							<span class="acard-rank">🌟 {tFn(RANK_KEY[p.starRank])}</span>
						{/if}
						<span class="acard-count">
							{p.contributions.length > 1
								? tFn('translate.allcontrib.count_many', { n: p.contributions.length })
								: tFn('translate.allcontrib.count_one',  { n: p.contributions.length })}
						</span>
					</button>
				{/each}
			</div>
			<a class="allcontrib-more" href={`${REPO}/blob/main/CONTRIBUTORS.md`} target="_blank" rel="noopener">
				{tFn('translate.allcontrib.more')}
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
			</a>
		</section>
	{/if}

	<footer>
		<a href={REPO} target="_blank" rel="noopener">github.com/Pokled/nodyx</a>
		<span class="dot">·</span><span>AGPL-3.0</span>
		<span class="dot">·</span><span>{tFn('translate.footer_note')}</span>
	</footer>

</div>

<svelte:window onkeydown={onKeydown} />

{#if openPopup}
	{@const c = openPopup.contributor}
	<div class="pop-overlay" role="presentation" onclick={closePopup}>
		<div class="pop" role="dialog" aria-modal="true" tabindex="-1" onclick={(e) => e.stopPropagation()}>
			<button type="button" class="pop-close" onclick={closePopup} aria-label={tFn('translate.contributors.close')}>×</button>
			<div class="pop-head">
				{#if c.avatarUrl}
					<img class="pop-avatar" src={c.avatarUrl} alt="" />
				{:else}
					<span class="cinit big">{(c.authorName || '?').slice(0, 1).toUpperCase()}</span>
				{/if}
				<div class="pop-id">
					<h3>{tFn('translate.contributors.thanks', { name: c.username ?? c.authorName })}</h3>
					{#if c.starRank}
						<span class="pop-rank">🌟 {tFn(RANK_KEY[c.starRank])}</span>
					{/if}
				</div>
			</div>
			<p class="pop-blurb">{c.blurb ?? c.commitTitle}</p>
			<div class="pop-meta">
				<span>{relativeDate(c.date)}</span>
				{#if c.profileUrl}
					<a href={c.profileUrl} target="_blank" rel="noopener">{tFn('translate.contributors.view_profile')}</a>
				{/if}
				{#if c.prUrl && c.prNumber}
					<a href={c.prUrl} target="_blank" rel="noopener">{tFn('translate.contributors.view_pr', { n: c.prNumber })}</a>
				{:else}
					<a href={c.commitUrl} target="_blank" rel="noopener">{tFn('translate.contributors.view_commit')}</a>
				{/if}
			</div>
		</div>
	</div>
{/if}

{#if openAllPopup}
	{@const p = openAllPopup}
	<div class="pop-overlay" role="presentation" onclick={closeAllPopup}>
		<div class="pop pop-wide" role="dialog" aria-modal="true" tabindex="-1" onclick={(e) => e.stopPropagation()}>
			<button type="button" class="pop-close" onclick={closeAllPopup} aria-label={tFn('translate.contributors.close')}>×</button>
			<div class="pop-head">
				{#if p.avatarUrl}
					<img class="pop-avatar" src={p.avatarUrl} alt="" />
				{:else}
					<span class="cinit big">{(p.displayName || '?').slice(0, 1).toUpperCase()}</span>
				{/if}
				<div class="pop-id">
					<h3>{tFn('translate.contributors.thanks', { name: p.displayName })}</h3>
					{#if p.starRank}
						<span class="pop-rank">🌟 {tFn(RANK_KEY[p.starRank])}</span>
					{/if}
				</div>
			</div>
			<ul class="pop-list">
				{#each p.contributions as entry, i (i)}
					<li>
						<span class="pop-type">{entry.type}</span>
						{#if entry.prUrl}
							<a class="pop-entry-blurb" href={entry.prUrl} target="_blank" rel="noopener">{entry.blurb}</a>
						{:else}
							<span class="pop-entry-blurb">{entry.blurb}</span>
						{/if}
					</li>
				{/each}
			</ul>
			{#if p.profileUrl}
				<div class="pop-meta">
					<a href={p.profileUrl} target="_blank" rel="noopener">{tFn('translate.contributors.view_profile')}</a>
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	/* Registre visuel : outil, pas vitrine. Gris neutres, une seule couleur
	   d'accent (indigo) sur les actions, l'émeraude réservé à « complet ». */
	/* Fond chaud plutôt qu'un noir plat "dashboard" : deux lueurs discrètes,
	   couleur du bandeau des gens et de la barre de complétion, jamais assez
	   fortes pour distraire de la lecture. */
	:global(body) {
		background:
			radial-gradient(900px 500px at 8% -6%,  rgb(109 118 245 / 0.10), transparent 60%),
			radial-gradient(900px 560px at 100% 8%, rgb(46 206 147 / 0.07), transparent 55%),
			#0b0c11;
	}

	.wrap { max-width: 1120px; margin: 0 auto; padding: 26px 22px 90px; color: #e7e8ef; font-size: 14px; line-height: 1.45; }
	.sr { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }

	/* ── Barre d'application ─────────────────────────────────────────────── */
	.chrome {
		position: sticky; top: 0; z-index: 20;
		height: 54px; display: flex; align-items: center; gap: 26px; padding: 0 22px;
		background: rgb(14 15 21 / 0.88); backdrop-filter: blur(10px);
		border-bottom: 1px solid #1c1e28;
	}
	.logo { display: flex; align-items: center; gap: 9px; font-weight: 650; letter-spacing: -0.01em; color: #e7e8ef; text-decoration: none; }
	.logo .mark { width: 20px; height: 20px; border-radius: 6px; background: linear-gradient(135deg, var(--nx-accent), var(--nx-accent-2)); box-shadow: inset 0 0 0 1px rgb(255 255 255 / 0.1); }
	.logo .sub { color: #61647a; font-weight: 500; font-size: 13px; }
	nav.top { display: flex; gap: 4px; }
	nav.top a { font-size: 13px; color: #9698ab; padding: 6px 10px; border-radius: 7px; text-decoration: none; }
	nav.top a:hover { color: #e7e8ef; background: rgb(255 255 255 / 0.028); }
	.grow { flex: 1; }
	.cta {
		display: inline-flex; align-items: center; gap: 7px;
		font-size: 13px; font-weight: 600; color: #fff; text-decoration: none;
		background: var(--nx-accent); padding: 7px 13px; border-radius: 8px;
		box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.12);
	}
	.cta:hover { filter: brightness(1.07) saturate(1.05); transform: translateY(-1px); }
	.cta svg { width: 15px; height: 15px; }
	.cta, .allcontrib-more, .newlang .ask, .langbtn { transition: transform 0.15s ease, filter 0.15s ease, background 0.15s ease, border-color 0.15s ease; }

	/* ── Sélecteur de langue de la page ───────────────────────────────────── */
	.langpick { position: relative; margin-right: 6px; }
	.langbtn {
		display: inline-flex; align-items: center; gap: 6px; padding: 6px 9px;
		border: 1px solid #262936; border-radius: 8px; background: #12131b; color: #9698ab;
		cursor: pointer;
	}
	.langbtn:hover { color: #e7e8ef; border-color: #343a5e; }
	.langbtn svg { width: 13px; height: 13px; }
	.flag.sm { width: 18px; height: 18px; flex: none; border-radius: 4px; overflow: hidden; line-height: 0; display: inline-block; box-shadow: inset 0 0 0 1px rgb(255 255 255 / 0.12); }
	.flag.sm :global(svg) { display: block; width: 100%; height: 100%; }
	.lang-backdrop { position: fixed; inset: 0; z-index: 29; }
	.langmenu {
		position: absolute; top: calc(100% + 6px); right: 0; z-index: 30;
		list-style: none; margin: 0; padding: 6px; min-width: 170px; max-height: 60vh; overflow-y: auto;
		border: 1px solid #262936; border-radius: 10px; background: #12131b;
		box-shadow: 0 16px 40px rgb(0 0 0 / 0.4);
	}
	.langmenu button {
		display: flex; align-items: center; gap: 9px; width: 100%; padding: 7px 9px;
		border: 0; border-radius: 7px; background: none; color: #c5c7d6; font-size: 13px;
		font-family: inherit; text-align: left; cursor: pointer;
	}
	.langmenu button:hover { background: rgb(255 255 255 / 0.05); color: #e7e8ef; }
	.langmenu button.active { color: #8b93ff; font-weight: 600; }

	/* ── Le paysage ──────────────────────────────────────────────────────── */
	.hero { position: relative; height: 320px; overflow: hidden; }
	.hero-img {
		position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;
		/* Les 13 photos n'ont pas la même luminosité d'origine (désert vs aurore
		   nocturne) : on les ramène toutes au même registre pour que le texte
		   reste lisible quelle que soit la langue affichée. */
		filter: brightness(0.68) saturate(1.08);
	}
	.hero-scrim {
		position: absolute; inset: 0;
		background: linear-gradient(180deg, rgb(6 7 10 / 0.15) 0%, rgb(8 9 13 / 0.55) 55%, #0b0c11 100%);
	}
	.hero-flag {
		position: absolute; top: 16px; right: 22px; width: 40px; height: 40px; border-radius: 10px;
		overflow: hidden; line-height: 0; box-shadow: 0 4px 16px rgb(0 0 0 / 0.35), inset 0 0 0 1.5px rgb(255 255 255 / 0.35);
	}
	.hero-flag :global(svg) { display: block; width: 100%; height: 100%; }

	/* ── Le minuteur façon stories ─────────────────────────────────────────── */
	.hero-timer {
		position: absolute; top: 16px; left: 50%; transform: translateX(-50%);
		z-index: 2; width: 100%; max-width: 1120px; padding: 0 74px 0 22px;
		display: flex; gap: 6px; box-sizing: border-box;
	}
	.ht-bar {
		flex: 1; height: 12px; padding: 0; border: 0; background: none; cursor: pointer;
		display: flex; align-items: center;
	}
	.ht-fill {
		position: relative; width: 100%; height: 3px; border-radius: 999px;
		background: rgb(255 255 255 / 0.3); overflow: hidden;
	}
	.ht-fill.done { background: rgb(255 255 255 / 0.85); }
	.ht-run {
		position: absolute; inset: 0 100% 0 0; border-radius: 999px; background: #fff;
		animation-name: ht-grow; animation-timing-function: linear; animation-fill-mode: forwards;
	}
	@keyframes ht-grow { from { right: 100%; } to { right: 0%; } }
	.ht-bar:hover .ht-fill:not(.done) { background: rgb(255 255 255 / 0.5); }
	.hero-content {
		position: relative; height: 100%; max-width: 1120px; margin: 0 auto; padding: 0 22px 26px;
		display: flex; flex-direction: column; justify-content: flex-end;
	}
	h1 {
		margin: 0; font-size: 26px; font-weight: 750; letter-spacing: -0.02em; display: flex; align-items: center; gap: 12px;
		color: #fff; text-shadow: 0 2px 16px rgb(0 0 0 / 0.35);
	}
	.cico {
		width: 32px; height: 32px; border-radius: 9px; flex: none; display: grid; place-items: center;
		color: #fff; background: rgb(255 255 255 / 0.14); backdrop-filter: blur(6px);
		border: 1px solid rgb(255 255 255 / 0.28);
	}
	.cico svg { width: 18px; height: 18px; }
	.psub { margin: 9px 0 0; color: rgb(255 255 255 / 0.82); font-size: 14px; padding-left: 44px; max-width: 62ch; text-shadow: 0 1px 10px rgb(0 0 0 / 0.4); }
	.updated { margin: 14px 0 0 44px; color: rgb(255 255 255 / 0.55); font: 500 12px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }

	/* ── Les gens ────────────────────────────────────────────────────────── */
	/* Le cœur émotionnel de la page, pas une ligne de plus dans un tableau :
	   plus grand, plus chaud, une vraie lueur — le reste peut rester sobre,
	   pas cette section-là. */
	.people {
		display: flex; align-items: center; gap: 18px; flex-wrap: wrap;
		margin-top: 22px; padding: 20px 22px;
		border: 1px solid rgb(109 118 245 / 0.22); border-radius: 16px;
		background: linear-gradient(135deg, rgb(109 118 245 / 0.14), rgb(46 206 147 / 0.08));
		box-shadow: 0 1px 0 rgb(255 255 255 / 0.04) inset, 0 20px 50px -30px rgb(109 118 245 / 0.5);
	}
	.people-row { display: flex; }
	.pav {
		width: 44px; height: 44px; border-radius: 50%; flex: none;
		margin-left: -12px; overflow: hidden; text-decoration: none;
		border: 2.5px solid #0b0c11; background: #1c1e28;
		transition: transform 0.18s cubic-bezier(.34,1.56,.64,1);
	}
	.pav:first-child { margin-left: 0; }
	.pav:hover, .pav:focus-visible { transform: translateY(-5px) scale(1.06); z-index: 1; position: relative; }
	.pav img { display: block; width: 100%; height: 100%; object-fit: cover; }
	.people-line { margin: 0; font-size: 15px; font-weight: 600; color: #eef0ff; }

	/* ── Vue d'ensemble ──────────────────────────────────────────────────── */
	.overview { margin: 26px 0 30px; }
	.metrics { display: flex; flex-wrap: wrap; gap: 10px; }
	/* Chips colorées plutôt que des colonnes de tableur grises : chaque
	   métrique a sa propre teinte douce, discrète mais vivante. */
	.metric {
		padding: 12px 18px; border-radius: 12px; background: rgb(255 255 255 / 0.03);
		border: 1px solid rgb(255 255 255 / 0.05); transition: transform 0.15s ease, background 0.15s ease;
	}
	.metric:hover { transform: translateY(-2px); }
	.metric:nth-child(1) { background: rgb(109 118 245 / 0.09); border-color: rgb(109 118 245 / 0.18); }
	.metric:nth-child(2) { background: rgb(167 139 250 / 0.09); border-color: rgb(167 139 250 / 0.18); }
	.metric:nth-child(3) { background: rgb(46 206 147 / 0.09);  border-color: rgb(46 206 147 / 0.18); }
	.metric:nth-child(4) { background: rgb(245 196 81 / 0.09);  border-color: rgb(245 196 81 / 0.18); }
	.metric:nth-child(5) { background: rgb(56 189 248 / 0.09);  border-color: rgb(56 189 248 / 0.18); }
	.metric .v { font: 700 19px/1 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; letter-spacing: -0.02em; font-variant-numeric: tabular-nums; }
	.metric .v .s { color: #61647a; font-weight: 600; font-size: 14px; }
	.metric .v.em { color: #2ece93; }
	.metric .k { color: #61647a; font-size: 11px; text-transform: uppercase; letter-spacing: 0.07em; margin-top: 6px; }
	.obar { margin-top: 20px; height: 6px; border-radius: 999px; background: rgb(255 255 255 / 0.065); overflow: hidden; }
	.obar > i { display: block; height: 100%; border-radius: 999px; background: linear-gradient(90deg, var(--nx-accent), #8b93ff); }
	.obar-cap { margin-top: 9px; display: flex; justify-content: space-between; gap: 12px; font: 500 12px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; color: #61647a; }

	/* ── Panneau + table ─────────────────────────────────────────────────── */
	.panel { border: 1px solid #1c1e28; border-radius: 11px; background: #0f1016; overflow: hidden; scroll-margin-top: 70px; }
	.panel-head { display: flex; align-items: center; gap: 14px; padding: 13px 16px; border-bottom: 1px solid #1c1e28; background: #12131b; }
	.panel-head .ttl { font-weight: 650; font-size: 14px; }
	.panel-head .cnt { font: 500 12px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; color: #61647a; }
	.search { position: relative; }
	.search svg { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); width: 14px; height: 14px; color: #61647a; pointer-events: none; }
	.search input {
		width: 210px; background: #0b0c11; border: 1px solid #262936; color: #e7e8ef;
		font-family: inherit; font-size: 13px; padding: 7px 11px 7px 30px; border-radius: 8px; outline: none;
	}
	.search input:focus-visible { border-color: var(--nx-accent); box-shadow: 0 0 0 3px rgb(109 118 245 / 0.15); }
	.search input::placeholder { color: #61647a; }

	/* `position: relative` N'EST PAS DECORATIF, il corrige un debordement.
	   La page defilait horizontalement de 337 px sous 727 px de large, sans
	   qu'aucun element visible ne depasse : la zone a droite etait vide.
	   Cause, trouvee au troisieme essai. Les libelles `.sr` reserves aux lecteurs
	   d'ecran sont en `position: absolute`. Sans ancetre positionne, leur bloc
	   conteneur est le bloc conteneur INITIAL, pas ce conteneur defilant : ils
	   lui echappaient et etendaient la zone defilable du document jusqu'a 727 px,
	   la ou se trouve le dernier d'entre eux dans la table de 800 px.
	   Mesure : `body` ne debordait pas (390 pour 390), seul `html` debordait.
	   C'est la signature d'un element positionne par rapport au bloc initial.
	   En rendant ce conteneur positionne, les `.sr` redeviennent les siens, donc
	   contenus et rognes. Ils restent lus par les lecteurs d'ecran. */
	.tscroll { overflow-x: auto; position: relative; }
	table { width: 100%; border-collapse: collapse; min-width: 820px; }
	th { text-align: left; padding: 0; border-bottom: 1px solid #1c1e28; white-space: nowrap; }
	th.mid { padding: 11px 16px; text-align: center; }
	th.mid, th:last-child { font: 600 11px/1 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; letter-spacing: 0.06em; text-transform: uppercase; color: #61647a; }
	button.sort {
		width: 100%; background: none; border: 0; cursor: pointer; text-align: inherit;
		font: 600 11px/1 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
		letter-spacing: 0.06em; text-transform: uppercase; color: #61647a; padding: 11px 16px;
	}
	th.num button.sort { text-align: right; }
	button.sort:hover { color: #9698ab; }
	button.sort .car { opacity: 0; margin-left: 5px; font-size: 9px; }
	button.sort.sorted { color: #9698ab; }
	button.sort.sorted .car { opacity: 1; color: #8b93ff; }

	tbody tr { border-bottom: 1px solid #1c1e28; transition: background 0.12s; }
	tbody tr:last-child { border-bottom: 0; }
	tbody tr:hover { background: rgb(255 255 255 / 0.028); }
	td { padding: 12px 16px; vertical-align: middle; }
	td.num { text-align: right; font: 500 13px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-variant-numeric: tabular-nums; color: #9698ab; white-space: nowrap; }
	td.num.zero { color: #61647a; }
	td.mid { text-align: center; }

	.lang { display: flex; align-items: center; gap: 12px; }
	.flag { width: 26px; height: 26px; flex: none; border-radius: 5px; overflow: hidden; line-height: 0; box-shadow: inset 0 0 0 1px rgb(255 255 255 / 0.12); }
	.flag :global(svg) { display: block; width: 100%; height: 100%; }
	.id { display: flex; flex-direction: column; gap: 2px; }
	.nm { font-weight: 600; letter-spacing: -0.01em; }
	.cd { font: 500 11.5px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; color: #61647a; }
	.tag { font: 600 10px/1 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; text-transform: uppercase; letter-spacing: 0.04em; padding: 3px 6px; border-radius: 5px; margin-left: 4px; }
	.tag.src { color: #9698ab; border: 1px solid #262936; }
	.tag.done { color: #2ece93; border: 1px solid rgb(46 206 147 / 0.3); background: rgb(46 206 147 / 0.08); }

	.prog { display: flex; align-items: center; gap: 12px; min-width: 200px; }
	.pbar { position: relative; flex: 1; height: 7px; border-radius: 999px; background: rgb(255 255 255 / 0.065); overflow: hidden; }
	.pbar > i { position: absolute; inset: 0 auto 0 0; height: 100%; border-radius: 999px; background: var(--nx-accent); }
	.pbar > i.done { background: #2ece93; }
	.pct { font: 600 13px/1 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-variant-numeric: tabular-nums; min-width: 3.6ch; text-align: right; }
	.pct.done { color: #2ece93; }

	.core-ok { color: #2ece93; display: inline-flex; }
	.core-ok svg { width: 15px; height: 15px; }
	.core-no { color: #61647a; }

	.acts { display: flex; gap: 4px; justify-content: flex-end; }
	.icat { width: 30px; height: 30px; display: grid; place-items: center; border-radius: 7px; color: #61647a; border: 1px solid transparent; }
	.icat:hover { color: #e7e8ef; background: #0b0c11; border-color: #262936; }
	.icat svg { width: 15px; height: 15px; }
	tr:hover .icat.edit { color: #8b93ff; }

	/* ── Filet + pied ────────────────────────────────────────────────────── */
	/* La porte d'entree d'une langue absente. Meme registre sobre que le reste,
	   mais un contour un peu plus present : c'est la seule action de la page qui
	   ne concerne pas une langue deja listee. */
	.newlang {
		display: flex; align-items: center; gap: 15px; margin-top: 16px; padding: 16px 18px;
		border: 1px solid #24273a; border-radius: 10px; background: #0f1016;
	}
	.newlang .globe { width: 26px; height: 26px; flex: none; color: #8b93ff; opacity: .85; }
	.newlang .txt { flex: 1; min-width: 0; }
	.newlang h2 { margin: 0 0 3px; font-size: 14px; font-weight: 600; color: #e7e8ef; }
	.newlang p  { margin: 0; font-size: 13px; line-height: 1.5; color: #9698ab; }
	/* Classe distincte de `.cta` : celle-ci habille le bouton plein de l'en-tete,
	   et l'heriter apporterait son ombre interne sans qu'on l'ait demande. */
	.newlang .ask {
		flex: none; display: inline-flex; align-items: center; justify-content: center; gap: 7px;
		padding: 9px 15px; border-radius: 8px; border: 1px solid #343a5e;
		background: #191c2e; color: #b9beff; font-size: 13px; font-weight: 600;
		text-decoration: none; transition: background .15s, border-color .15s;
	}
	.newlang .ask svg { width: 15px; height: 15px; }
	.newlang .ask:hover { background: #202541; border-color: #4a527f; transform: translateY(-1px); }
	.newlang .ask:focus-visible { outline: 2px solid #8b93ff; outline-offset: 2px; }

	/* ── Les horizons pas encore franchis ─────────────────────────────────── */
	.horizons { display: flex; gap: 10px; margin-top: 10px; overflow-x: auto; padding-bottom: 2px; }
	.hcard {
		position: relative; flex: none; width: 194px; height: 132px; border-radius: 12px; overflow: hidden;
		text-decoration: none; box-shadow: inset 0 0 0 1px rgb(255 255 255 / 0.08);
		transition: transform 0.18s ease;
	}
	.hcard:hover, .hcard:focus-visible { transform: translateY(-3px); }
	.hcard img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; filter: brightness(0.75) saturate(1.05); transition: filter 0.18s ease; }
	.hcard:hover img { filter: brightness(0.9) saturate(1.1); }
	.hcard-scrim { position: absolute; inset: 0; background: linear-gradient(180deg, transparent 40%, rgb(6 7 10 / 0.75) 100%); }
	.hcard-flag {
		position: absolute; top: 9px; right: 9px; width: 26px; height: 26px; border-radius: 7px;
		overflow: hidden; line-height: 0; box-shadow: 0 2px 8px rgb(0 0 0 / 0.35), inset 0 0 0 1px rgb(255 255 255 / 0.35);
	}
	.hcard-flag :global(svg) { display: block; width: 100%; height: 100%; }
	.hcard-txt { position: absolute; left: 11px; right: 11px; bottom: 9px; display: flex; flex-direction: column; gap: 2px; }
	.hcard-name { color: #fff; font-size: 13.5px; font-weight: 700; text-shadow: 0 1px 6px rgb(0 0 0 / 0.5); }
	.hcard-tag { color: rgb(255 255 255 / 0.75); font-size: 11px; line-height: 1.3; }

	.info {
		display: flex; align-items: center; gap: 13px; margin-top: 16px; padding: 13px 16px;
		border: 1px solid #1c1e28; border-radius: 10px; background: #0f1016; color: #9698ab; font-size: 13px;
	}
	.info svg.i { width: 17px; height: 17px; flex: none; color: #2ece93; }
	.info p { margin: 0; }
	.info :global(b) { color: #e7e8ef; font-weight: 600; }
	.info :global(code) { font: 500 12px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; color: #8b93ff; }
	.info .more { color: #8b93ff; font-weight: 600; white-space: nowrap; text-decoration: none; }
	.info .more:hover { text-decoration: underline; }

	/* ── Bien au-delà des traductions ─────────────────────────────────────── */
	.allcontrib { margin-top: 22px; }
	.allcontrib h2 { margin: 0; font-size: 16px; font-weight: 700; letter-spacing: -0.01em; }
	.allcontrib-sub { margin: 6px 0 16px; color: #9698ab; font-size: 13.5px; max-width: 62ch; }
	.allcontrib-grid { display: flex; flex-wrap: wrap; gap: 10px; }
	.acard {
		display: flex; flex-direction: column; align-items: center; gap: 6px;
		width: 108px; padding: 14px 10px; cursor: pointer; text-align: center;
		border: 1px solid #1c1e28; border-radius: 12px; background: #0f1016;
		font-family: inherit; transition: border-color 0.15s, background 0.15s, transform 0.15s;
	}
	.acard:hover, .acard:focus-visible {
		border-color: #4a527f; background: #12131b;
		transform: translateY(-3px);
		box-shadow: 0 10px 24px rgb(109 118 245 / 0.12);
	}
	.acard img, .acard .cinit { width: 44px; height: 44px; border-radius: 50%; object-fit: cover; }
	.acard .cinit { display: grid; place-items: center; background: #1c1e28; font-size: 15px; color: #9698ab; }
	.acard-name { font-size: 12.5px; font-weight: 650; color: #e7e8ef; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
	.acard-rank { font-size: 10.5px; color: #f5c451; }
	.acard-count { font-size: 11px; color: #61647a; }
	.allcontrib-more {
		display: inline-flex; align-items: center; gap: 7px; margin-top: 14px;
		font-size: 13px; font-weight: 600; color: #8b93ff; text-decoration: none;
	}
	.allcontrib-more:hover { text-decoration: underline; }
	.allcontrib-more svg { width: 14px; height: 14px; }

	footer { margin-top: 30px; display: flex; gap: 16px; flex-wrap: wrap; align-items: center; color: #61647a; font: 500 12px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
	footer a { color: inherit; text-decoration: none; }
	footer a:hover { color: #9698ab; }
	footer .dot { color: #262936; }

	/* ── Pile de contributeurs ───────────────────────────────────────────── */
	.cstack { display: flex; align-items: center; }
	.cav {
		--i: 0;
		width: 26px; height: 26px; border-radius: 50%; flex: none; position: relative;
		margin-left: -10px; padding: 0; overflow: hidden; cursor: pointer;
		border: 2px solid #0f1016; background: #1c1e28;
		transition: transform 0.16s ease;
	}
	.cav:first-child { margin-left: 0; }
	.cav img { display: block; width: 100%; height: 100%; object-fit: cover; }
	.cav:focus-visible { outline: 2px solid #8b93ff; outline-offset: 2px; }
	.cstack:hover .cav { transform: translateX(calc(var(--i) * 8px)); }
	.cinit {
		width: 100%; height: 100%; display: grid; place-items: center;
		font: 600 11px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; color: #9698ab;
	}
	.clast { margin-top: 5px; color: #61647a; font-size: 11px; }

	/* ── Popup contributeur ──────────────────────────────────────────────── */
	.pop-overlay {
		position: fixed; inset: 0; z-index: 50; display: grid; place-items: center;
		background: rgb(6 7 10 / 0.65); backdrop-filter: blur(2px); padding: 20px;
	}
	.pop {
		position: relative; width: 100%; max-width: 380px; padding: 20px;
		border: 1px solid #262936; border-radius: 12px; background: #12131b;
		box-shadow: 0 20px 50px rgb(0 0 0 / 0.4);
	}
	.pop-close {
		position: absolute; top: 10px; right: 10px; width: 28px; height: 28px;
		display: grid; place-items: center; border-radius: 7px; border: 0; background: none;
		color: #61647a; font-size: 18px; line-height: 1; cursor: pointer;
	}
	.pop-close:hover { color: #e7e8ef; background: rgb(255 255 255 / 0.06); }
	.pop-head { display: flex; align-items: center; gap: 12px; padding-right: 20px; }
	.pop-avatar { width: 48px; height: 48px; border-radius: 50%; flex: none; object-fit: cover; }
	.cinit.big { width: 48px; height: 48px; border-radius: 50%; flex: none; font-size: 18px; background: #1c1e28; }
	.pop-id h3 { margin: 0; font-size: 15.5px; font-weight: 700; letter-spacing: -0.01em; }
	.pop-rank { display: inline-block; margin-top: 4px; font-size: 11.5px; color: #f5c451; }
	.pop-blurb { margin: 14px 0 0; font-size: 13.5px; line-height: 1.55; color: #c5c7d6; }
	.pop-meta { margin-top: 14px; display: flex; align-items: center; gap: 12px; flex-wrap: wrap; font-size: 12px; color: #61647a; }
	.pop-meta a { color: #8b93ff; font-weight: 600; text-decoration: none; }
	.pop-meta a:hover { text-decoration: underline; }

	.pop-wide { max-width: 440px; }
	.pop-list { list-style: none; margin: 14px 0 0; padding: 0; display: flex; flex-direction: column; gap: 10px; max-height: 45vh; overflow-y: auto; }
	.pop-list li { padding-bottom: 10px; border-bottom: 1px solid #1c1e28; }
	.pop-list li:last-child { border-bottom: 0; padding-bottom: 0; }
	.pop-type {
		display: inline-block; margin-bottom: 4px; padding: 2px 6px; border-radius: 5px;
		font: 600 10.5px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
		color: #8b93ff; background: rgb(109 118 245 / 0.1); border: 1px solid rgb(109 118 245 / 0.22);
	}
	.pop-entry-blurb { display: block; font-size: 13px; line-height: 1.5; color: #c5c7d6; text-decoration: none; }
	a.pop-entry-blurb:hover { color: #e7e8ef; text-decoration: underline; }

	@media (max-width: 640px) {
		.metric { padding: 10px 14px; }
		.search input { width: 150px; }

		/* En colonne, `align-items: center` empecherait le bouton de prendre la
		   largeur : on repasse explicitement en `stretch`. */
		.newlang { flex-direction: column; align-items: stretch; text-align: left; gap: 12px; }
		.newlang .globe { width: 22px; height: 22px; }

		/* La barre etait en ligne unique, hauteur fixe et sans repli : a 390px le
		   bouton sortait de 149px hors ecran, mesure. On autorise le repli plutot
		   que de masquer le lien « Fichiers », qui n'a pas d'autre acces ici. */
		.chrome { height: auto; flex-wrap: wrap; gap: 8px 14px; padding: 9px 14px; }
		.chrome .grow { display: none; }
		nav.top { flex: 1; }
	}
</style>
