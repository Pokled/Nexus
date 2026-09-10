/**
 * Activité récente par langue pour /translate : qui a traduit quoi en
 * dernier, calculé depuis git (jamais saisi à la main), enrichi avec le
 * texte déjà écrit à la main dans CONTRIBUTORS.md quand la PR y figure.
 *
 * Calculé une fois par démarrage de process (mémoïsé), pas par requête :
 * un redémarrage PM2 après déploiement recalcule, donc reste toujours
 * cohérent avec ce qui est réellement déployé (cf gotcha_i18n_ne_deploie_pas_seul).
 */
import { execFileSync } from 'node:child_process'
import { readFileSync }  from 'node:fs'
import path              from 'node:path'
import { LOCALES, type Locale } from './i18n'

const REPO_ROOT = path.resolve(process.cwd(), '..')
const REPO      = 'https://github.com/Pokled/nodyx'

/** Nom d'auteur git du mainteneur — cf note dans getLocaleActivity(). */
const MAINTAINER_NAME     = 'Pokled'
/**
 * Son username GitHub réel, connu par avance (contrairement aux autres
 * contributeurs) : certains de ses commits utilisent son adresse email
 * personnelle plutôt que l'adresse noreply GitHub (aucun problème à ça,
 * c'est son dépôt), ce qui ferait autrement échouer l'extraction du
 * username et retomber sur une initiale sans avatar ni lien profil.
 */
const MAINTAINER_USERNAME = 'Pokled'
const SOURCE_LOCALE: Locale = 'fr'

export interface LocaleContributor {
	authorName:  string
	username:    string | null
	avatarUrl:   string | null
	profileUrl:  string | null
	date:        string
	prNumber:    number | null
	prUrl:       string | null
	commitUrl:   string
	commitTitle: string
	/** Phrase écrite à la main dans CONTRIBUTORS.md pour cette PR, si trouvée. */
	blurb:       string | null
	starRank:    string | null
}

export interface LocaleActivity {
	lastUpdated:  string
	contributors: LocaleContributor[]
}

/** Une personne, tous locales confondus — pour le bandeau "N personnes ont traduit Nodyx". */
export interface GlobalContributor {
	authorName: string
	username:   string | null
	avatarUrl:  string | null
	profileUrl: string | null
}

export interface LocaleActivityResult {
	locales:      Record<Locale, LocaleActivity>
	/** Tout le monde qui a touché un fichier de locale, un par personne, Pokled inclus — décompte collectif, pas un crédit par langue (cf D10). */
	contributors: GlobalContributor[]
}

// GitHub sert deux formats d'adresse noreply : le préfixe numérique actuel
// (`12345+username@…`) et l'ancien format sans préfixe (`username@…`, encore
// vu sur des comptes plus anciens — ex. naranco66 sur son commit de 2026-04-27).
// Repéré en prod : ce contributeur existait déjà dans les données mais tombait
// sans avatar, sans lien profil, sans étoile faute de matcher la regex stricte.
const NOREPLY_EMAIL = /^(?:\d+\+)?([^@]+)@users\.noreply\.github\.com$/

function usernameFromEmail(email: string): string | null {
	const m = NOREPLY_EMAIL.exec(email)
	return m ? m[1] : null
}

interface RawCommit { sha: string; authorName: string; email: string; date: string; subject: string; message: string }

// Séparateurs de contrôle (unit/record separator) plutôt que `|` : le corps
// complet du commit (%B) peut contenir à peu près n'importe quel caractère
// visible, jamais ceux-là.
const FIELD_SEP  = '\x1f'
const RECORD_SEP = '\x1e'

function gitLogForLocale(code: string): RawCommit[] {
	const file = `nodyx-frontend/src/lib/locales/${code}.json`
	let out: string
	try {
		out = execFileSync(
			'git',
			// -c safe.directory : le process PM2 tourne sous un utilisateur qui ne possède
			// pas /var/www/nexus, git refuse par défaut ("dubious ownership"). Scoper le
			// contournement à cet appel évite de toucher la config git globale du serveur.
			[
				'-c', `safe.directory=${REPO_ROOT}`, '-C', REPO_ROOT, 'log', '--follow',
				`--format=%H${FIELD_SEP}%an${FIELD_SEP}%ae${FIELD_SEP}%aI${FIELD_SEP}%B${RECORD_SEP}`,
				'--', file,
			],
			{ encoding: 'utf-8' },
		)
	} catch {
		return []
	}
	return out
		.split(RECORD_SEP)
		.map((r) => r.replace(/^\n/, ''))
		.filter(Boolean)
		.map((record) => {
			const [sha, authorName, email, date, message] = record.split(FIELD_SEP)
			return { sha, authorName, email, date, message, subject: message.split('\n')[0] }
		})
}

const PR_IN_SUBJECT = /\(#(\d+)\)\s*$/
const ISSUE_REF     = /#(\d+)/g

/** Cherche, dans tout le message de commit, un numéro qui correspond à une ligne connue de CONTRIBUTORS.md. */
function findKnownReference(message: string, rowsByPr: Map<number, ContributionRow>): { prNumber: number; row: ContributionRow } | null {
	for (const m of message.matchAll(ISSUE_REF)) {
		const n   = Number(m[1])
		const row = rowsByPr.get(n)
		if (row) return { prNumber: n, row }
	}
	return null
}

interface ContributionRow {
	/** null pour un contributeur sans lien GitHub (ex. "Yannick (nodyx.org member)") — il compte quand même. */
	username:    string | null
	displayName: string
	type:        string
	blurb:       string
	prNumber:    number | null
	prUrl:       string | null
	date:        string
}

/** Parsing défensif : une ligne mal formée ne casse rien, elle est juste ignorée. */
function parseContributorsMd(): ContributionRow[] {
	let raw: string
	try {
		raw = readFileSync(path.join(REPO_ROOT, 'CONTRIBUTORS.md'), 'utf-8')
	} catch {
		return []
	}
	const logStart = raw.indexOf('## Contribution log')
	if (logStart === -1) return []

	const rows: ContributionRow[] = []
	for (const line of raw.slice(logStart).split('\n')) {
		if (!line.startsWith('|') || /^\|\s*-+\s*\|/.test(line)) continue
		// Contributor | Contribution | Type | Issue/PR | Fix/polish | Date
		const cells = line.split('|').slice(1, -1).map((c) => c.trim())
		if (cells.length < 6) continue
		const [contributorCell, contributionCell, typeCell, prCell, , dateCell] = cells
		if (contributorCell === 'Contributor') continue

		const userMatch    = /github\.com\/([^/)\s]+)/.exec(contributorCell)
		const username      = userMatch ? userMatch[1] : null
		// Sans lien GitHub, le nom brut porte parfois une précision entre parenthèses
		// ("Yannick (nodyx.org member)") : gardée pour l'affichage, pas pour la clé de dédup.
		const displayName   = username ?? contributorCell.replace(/^\[|\]$/g, '')
		const prMatch       = /\/(pull|issues)\/(\d+)/.exec(prCell ?? '')
		const prNumber      = prMatch ? Number(prMatch[2]) : null
		const prUrl         = prMatch ? `${REPO}/${prMatch[1]}/${prMatch[2]}` : null

		rows.push({ username, displayName, type: typeCell.replace(/`/g, ''), blurb: contributionCell, prNumber, prUrl, date: dateCell })
	}
	return rows
}

/** Identifiants stables, traduits côté UI (translate.contributors.rank.*) — pas le libellé anglais de CONTRIBUTORS.md. */
const RANK_THRESHOLDS: [number, string][] = [
	[20, 'legend'],
	[10, 'star'],
	[5,  'core'],
	[2,  'regular'],
	[1,  'rookie'],
]

function rankFor(count: number): string | null {
	for (const [min, label] of RANK_THRESHOLDS) if (count >= min) return label
	return null
}

let cached: LocaleActivityResult | null = null

export function getLocaleActivity(): LocaleActivityResult {
	if (cached) return cached

	const rows = parseContributorsMd()

	const starCounts = new Map<string | null, number>()
	for (const r of rows) starCounts.set(r.username, (starCounts.get(r.username) ?? 0) + 1)

	const rowsByPr = new Map<number, ContributionRow>()
	for (const r of rows) if (r.prNumber !== null && !rowsByPr.has(r.prNumber)) rowsByPr.set(r.prNumber, r)

	const locales = {} as Record<Locale, LocaleActivity>
	const globalSeen = new Map<string, GlobalContributor>()

	for (const { code } of LOCALES) {
		const commits = gitLogForLocale(code)
		const seenKeys = new Set<string>()
		const contributors: LocaleContributor[] = []

		for (const c of commits) {
			// L'auteur git n'est pas toujours le vrai contributeur : certaines
			// traductions arrivent hors-PR (pièce jointe sur une issue, message
			// Discord…) et sont committées PAR Pokled pour le compte de quelqu'un
			// d'autre — cf CONTRIBUTORS.md "_integrated by maintainer_" (ex. la
			// traduction allemande de @forke24x7, commit cc79147, issue #5).
			// Quand le numéro d'issue/PR cité dans le message (pas seulement en
			// fin de sujet) correspond à une ligne de CONTRIBUTORS.md, cette
			// ligne fait autorité sur l'identité, pas le commit git.
			const known    = findKnownReference(c.message, rowsByPr)
			const subjectPr = PR_IN_SUBJECT.exec(c.subject)
			const prNumber  = known?.prNumber ?? (subjectPr ? Number(subjectPr[1]) : null)

			const gitUsername = usernameFromEmail(c.email)
				?? (c.authorName === MAINTAINER_NAME ? MAINTAINER_USERNAME : null)
			const effectiveUsername   = known?.row.username ?? gitUsername
			const effectiveAuthorName = known?.row.username ?? c.authorName

			// Décompte collectif ("N personnes ont traduit Nodyx") : tout le monde
			// compte, Pokled inclus — contrairement à la pile par langue plus bas,
			// ce n'est pas un crédit par fichier mais "qui a, un jour, mis la main
			// à la pâte". Alimenté AVANT l'exclusion du mainteneur ci-dessous.
			const globalKey = effectiveUsername ?? effectiveAuthorName
			if (!globalSeen.has(globalKey)) {
				globalSeen.set(globalKey, {
					authorName: effectiveAuthorName,
					username:   effectiveUsername,
					avatarUrl:  effectiveUsername ? `https://github.com/${effectiveUsername}.png?size=64` : null,
					profileUrl: effectiveUsername ? `https://github.com/${effectiveUsername}` : null,
				})
			}

			// Pokled est le mainteneur, pas un traducteur : il ne compte comme
			// contributeur "mis en avant" que sur `fr`, sa propre langue. Sur les
			// autres, ses commits (scaffolding, wiring, batch) restent dans
			// l'historique git mais ne prennent pas la place d'un vrai traducteur
			// externe dans la pile — sinon la pile ne ferait que refléter le
			// mainteneur qui se félicite lui-même. L'identité effective (pas
			// l'auteur git brut) est ce qui compte ici : un commit de Pokled qui
			// relaie la traduction de quelqu'un d'autre ne l'exclut pas.
			if (effectiveAuthorName === MAINTAINER_NAME && code !== SOURCE_LOCALE) continue

			const key = effectiveUsername ?? effectiveAuthorName
			if (seenKeys.has(key)) continue
			seenKeys.add(key)

			contributors.push({
				authorName:  effectiveAuthorName,
				username:    effectiveUsername,
				avatarUrl:   effectiveUsername ? `https://github.com/${effectiveUsername}.png?size=64` : null,
				profileUrl:  effectiveUsername ? `https://github.com/${effectiveUsername}` : null,
				date:        c.date,
				prNumber,
				prUrl:       prNumber ? `${REPO}/pull/${prNumber}` : null,
				commitUrl:   `${REPO}/commit/${c.sha}`,
				commitTitle: c.subject,
				blurb:       known?.row.blurb ?? null,
				starRank:    effectiveUsername ? rankFor(starCounts.get(effectiveUsername) ?? 0) : null,
			})

			if (contributors.length >= 3) break
		}

		locales[code] = {
			lastUpdated: commits[0]?.date ?? new Date(0).toISOString(),
			contributors,
		}
	}

	cached = { locales, contributors: [...globalSeen.values()] }
	return cached
}

/** Une contribution telle que loguée dans CONTRIBUTORS.md — pas que de la traduction. */
export interface ContributionEntry {
	type:    string
	blurb:   string
	prUrl:   string | null
	date:    string
}

/** Une personne, toutes ses contributions au dépôt confondues (bug, feature, docs, i18n…). */
export interface AllContributor {
	displayName:   string
	username:      string | null
	avatarUrl:     string | null
	profileUrl:    string | null
	starRank:      string | null
	contributions: ContributionEntry[]
}

let cachedAll: AllContributor[] | null = null

/**
 * Tout le monde qui a une ligne dans CONTRIBUTORS.md, groupé par personne —
 * pour montrer que Nodyx se construit avec des bugs, des features, des docs,
 * pas seulement des traductions. /translate n'en est qu'une porte d'entrée.
 */
export function getAllContributors(): AllContributor[] {
	if (cachedAll) return cachedAll

	const rows  = parseContributorsMd()
	const byKey = new Map<string, AllContributor>()

	for (const r of rows) {
		const key = r.username ?? r.displayName
		let entry = byKey.get(key)
		if (!entry) {
			entry = {
				displayName: r.displayName,
				username:    r.username,
				avatarUrl:   r.username ? `https://github.com/${r.username}.png?size=80` : null,
				profileUrl:  r.username ? `https://github.com/${r.username}` : null,
				starRank:    null,
				contributions: [],
			}
			byKey.set(key, entry)
		}
		entry.contributions.push({ type: r.type, blurb: r.blurb, prUrl: r.prUrl, date: r.date })
	}

	const list = [...byKey.values()]
	for (const p of list) {
		p.contributions.sort((a, b) => b.date.localeCompare(a.date))
		p.starRank = rankFor(p.contributions.length)
	}
	list.sort((a, b) => b.contributions.length - a.contributions.length || a.displayName.localeCompare(b.displayName))

	cachedAll = list
	return list
}
