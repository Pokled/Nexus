# CDC — Mettre en avant les traducteurs sur /translate

Statut : **VALIDÉ par Jonathan le 2026-08-22 (D1-D16), livré**
Date : 2026-08-22
Auteur : session Nodyx (nouvelle session, à froid, comme décidé)
Préalable au code (décision explicite du 22/08, cf. mémoire `project_translate_avatars_contributeurs`)

Boussole du CDC, la phrase de Jonathan : **« je tiens vraiment à mettre en avant les gens ».**
Ce n'est pas du reporting, c'est un geste de reconnaissance — même esprit que `CONTRIBUTORS.md`.

---

## 0. Décisions

| # | Sujet | Décision |
|---|---|---|
| D1 | Où calculer la donnée | **Côté serveur, `+page.server.ts`**, via `git log` sur le fichier de locale. Calculé une fois au démarrage du process (import top-level, module server-only), gardé en mémoire pour la durée de vie du process. Pas de script de build, pas de JSON généré à committer. |
| D2 | Fiabilité de l'auteur | **Révisé 2026-08-22, 2ᵉ correction du jour.** L'auteur git ne suffit pas : certaines traductions arrivent hors-PR (pièce jointe sur une issue) et sont committées PAR Pokled pour le compte de quelqu'un d'autre (`_integrated by maintainer_` dans `CONTRIBUTORS.md`). Repéré parce que Jonathan a demandé "qui a proposé le russe/portugais/allemand ?" et l'allemand s'est révélé être @forke24x7, invisible dans mon système car le commit `cc79147` est signé Pokled. Fix : quand un numéro d'issue/PR cité n'importe où dans le MESSAGE de commit (pas seulement en fin de sujet) correspond à une ligne de `CONTRIBUTORS.md`, cette ligne fait autorité sur l'identité — nom, avatar, profil, étoile — et l'auteur git redescend en simple repli. Toujours aucun appel API GitHub. |
| D3 | Nombre de contributeurs affichés | **3 derniers auteurs distincts** ayant touché le fichier de locale, du plus récent au plus ancien. Au-delà, pas de badge "+N" : 3 avatars suffisent pour l'esprit "pile qui s'écarte", un 4e serait juste du bruit visuel. |
| D4 | Extraction username GitHub | **Révisé 2026-08-22.** Regex `^(?:\d+\+)?([^@]+)@users\.noreply\.github\.com$` — GitHub sert deux formats noreply (avec et sans préfixe numérique). Le format initial (préfixe obligatoire) manquait le cas legacy : naranco66 (`es.json`, PR #19) tombait sans avatar/profil/étoile alors qu'il était bien présent dans les données, repéré parce que Jonathan a demandé de revérifier après le fix D10. Toujours aucun appel API GitHub : si l'email ne matche vraiment aucun des deux formats (adresse perso, ex. `jaronoah@gmail.com`), repli sur les initiales, sans lien cliquable. |
| D5 | Avatar | `https://github.com/<username>.png?size=64` — même pattern que `CONTRIBUTORS.md`, zéro appel API, zéro rate-limit. |
| D6 | Numéro de PR | Regex de fin de sujet de commit : `\(#(\d+)\)$`. Trouvé → lien `github.com/Pokled/nodyx/pull/<n>`. Absent (commit poussé directement, historique pré-#630) → lien vers le commit (`/commit/<sha>`) à la place, popup affiche "commit direct" plutôt que "PR". |
| D7 | Contenu de la popup au clic | Rien n'est retiré de l'idée d'origine, D12/D13 s'ajoutent dessus. En-tête chaleureux **"Merci, `{name}` !"**. Puis, dans l'ordre : avatar, nom, lien profil GitHub, date du commit, lien PR (ou commit si D6 tombe en repli), **et** le texte de la contribution — le blurb `CONTRIBUTORS.md` s'il existe (D12), sinon le titre du commit brut tel que prévu initialement (jamais les deux à la fois, ce serait redondant : le blurb *décrit déjà* la même contribution que le titre, en mieux). Le badge Star Rank (D13) s'affiche en plus, à côté du nom. **Pas d'appel API GitHub pour bio/stats** — cf D2, et ça éviterait un rate-limit anonyme (60/h) sur une page publique à trafic variable. |
| D8 | Horodatage par langue | Date du commit le plus récent touchant le fichier (`git log -1 --format=%ad`), affiché relatif (`il y a 3 jours`) via `Intl.RelativeTimeFormat`, déjà dispo puisque `Intl.NumberFormat` est utilisé sur la page. |
| D9 | Filtrage des commits | Aucun filtrage sur le contenu (pas de tri "chore" vs "feat"). **Un seul filtre, sur la personne** : cf D10. |
| D10 | **Révisé 2026-08-22, après premier déploiement.** Pokled dans la pile | Pokled (le mainteneur) n'apparaît **que sur `fr`**. Sur les 7 autres langues, ses commits restent dans l'historique git (freshness, `lastUpdated` inchangé) mais sont exclus de la pile d'avatars, filtrés par nom d'auteur (`MAINTAINER_NAME = 'Pokled'`) avant dédup. Repéré en prod : pt-BR affichait Pokled en 2ᵉ avatar à cause de son commit de scaffolding (`c2e4f2d`, seeding du fichier après la demande d'orfeu), à côté du vrai traducteur. Jonathan : « qui a fait la demande de PR (moi Pokled), je ne devrais que être sur la langue fr. » La pile existe pour mettre en avant des gens externes ; un mainteneur qui n'a que scaffoldé ou fait du batch sur une langue n'est pas ce geste-là, et se re-créditer lui-même le diluerait. Conséquence acceptée : es/de/ru/vi/pt-PT (aujourd'hui uniquement touchées par Pokled) affichent une pile **vide**, seule la date "Mis à jour" reste visible — c'est honnête, il n'y a *actuellement* personne d'autre à montrer. |
| D11 | Interaction visuelle | Pile CSS pure (`translateX` + léger `rotate` par index), écart au survol du groupe en `:hover` sur le conteneur, transition `transform`. Pas de JS au-delà du binding déjà nécessaire pour ouvrir la popup au clic. |
| D12 | Réutiliser `CONTRIBUTORS.md` dans la popup | Au chargement (même étape que D1), lire aussi `CONTRIBUTORS.md` (racine du dépôt) et parser la table `## Contribution log` : pour chaque ligne, extraire le numéro depuis la colonne "Issue / PR" (`/pull/(\d+)` ou `/issues/(\d+)`) et la colonne "Contribution" (le texte écrit à la main par Jonathan). Si le `prNumber` du commit matche une ligne, la popup affiche **ce texte-là** au lieu du titre de commit brut. Sinon, repli sur le titre de commit (D7). C'est la vraie phrase de remerciement déjà écrite par un humain, pas une donnée dupliquée à maintenir : une seule source, `CONTRIBUTORS.md`, cette page ne fait que la refléter ailleurs. |
| D14 | **Ajouté 2026-08-22, après livraison.** Bandeau collectif | En haut de page, avant le tableau : "N personnes ont donné une voix à Nodyx dans leur langue" + rangée d'avatars. Décompte GLOBAL, pas par langue : Pokled y est inclus (contrairement à la pile par langue, D10) car c'est un geste collectif, pas un crédit de fichier. Calculé dans la même passe que `getLocaleActivity()`, un `Map` global alimenté avant le filtre mainteneur. Pas de "M pays" : le champ `location` GitHub est un texte libre non fiable (villes, blagues, vide) — mentir sur un chiffre "pays" aurait trahi tout le principe du chantier. |
| D15 | **Ajouté 2026-08-22, 2ᵉ extension.** "Bien au-delà des traductions" | Jonathan : "on oublie du monde… la traduction ne fait pas tout, /translate est un appât à contribution." Nouvelle section en pied de page : une carte par personne ayant une ligne dans `CONTRIBUTORS.md`, **toutes catégories confondues** (bug, feature, docs, i18n) — pas seulement celles qui touchent un fichier de locale. `parseContributorsMd()` ne filtre plus sur la présence d'un lien GitHub (Yannick, sans compte GitHub, était auparavant invisible — cf `_(nodyx.org member)_`) : sans lien, repli sur initiales, comme partout ailleurs sur la page. Au clic, popup listant TOUTES ses contributions (type + texte + lien), pas une seule. CTA final vers `CONTRIBUTORS.md` complet. |
| D16 | Décompte par personne (D15) | Nombre de lignes qui lui appartiennent dans `CONTRIBUTORS.md`, tous types confondus — même barème de Star Rank que D13, réutilisé tel quel (cohérence : c'est le MÊME système de reconnaissance que celui déjà publié, pas un nouveau). |
| D13 | Star Rank dans la popup | Compter, dans la même table `CONTRIBUTORS.md`, le nombre de lignes dont la colonne "Contributor" correspond au même `username` (lien `github.com/<username>`). Mapper ce compte sur le barème déjà publié (1 → Rookie, 2-4 → Regular, 5-9 → Core Contributor, 10-19 → Nodyx Star, 20+ → Legend) et afficher un petit badge `🌟 Rookie` etc. **Uniquement si le compte ≥ 1** (un contributeur externe réel) — pas de badge pour Jonathan lui-même, ranger le mainteneur dans son propre barème serait absurde. |

---

## 1. Déclencheur

`/translate` affiche déjà un pourcentage par langue (`translationProgress.ts`), mais c'est froid : un chiffre, pas une personne. Jonathan veut que la page dise "quelqu'un a fait ça, voici qui" — horodatage + avatar(s) empilé(s) qui s'écartent au survol + popup avec le PR et des infos GitHub sur la personne, au clic.

## 2. État actuel du code (vérifié 2026-08-22)

- `nodyx-frontend/src/lib/translationProgress.ts` — `getTranslationProgress()` calcule tout depuis les JSON importés statiquement (`import fr from './locales/fr.json'`, etc). Aucune I/O, aucune donnée temporelle.
- `nodyx-frontend/src/routes/translate/+page.svelte` — consomme `getTranslationProgress()` directement dans le `<script>`, pas de `+page.server.ts` aujourd'hui. Table triable/filtrable, une ligne par `LocaleProgress`.
- `git log --follow -- nodyx-frontend/src/lib/locales/<code>.json` donne déjà tout ce qu'il faut : auteur, email, date, sujet du commit — vérifié sur `pt-BR.json`, `fr.json`, `es.json`.
- Pas de script de build qui touche à git aujourd'hui (`scripts/i18n/` ne fait que scanner/valider les clés, `package.json` → `"build": "vite build"` nu).

## 3. Modèle de données (nouveau)

```ts
interface LocaleContributor {
  authorName:  string
  username:    string | null   // null si l'email ne matche pas le pattern noreply
  avatarUrl:   string | null   // null si username est null
  profileUrl:  string | null   // null si username est null
  date:        string          // ISO, du commit
  prNumber:    number | null
  prUrl:       string | null   // si prNumber trouvé
  commitUrl:   string          // toujours présent, repli si pas de PR
  commitTitle: string
  blurb:       string | null   // texte CONTRIBUTORS.md si trouvé (D12), sinon null → l'UI retombe sur commitTitle
  starRank:    string | null   // "Rookie" | "Regular" | "Core Contributor" | "Nodyx Star" | "Legend", null si 0 entrée (D13)
}

interface LocaleActivity {
  lastUpdated:   string              // ISO, commit le plus récent
  contributors:  LocaleContributor[] // 3 max, dédupliqués par username/authorName, plus récent d'abord
}
```

Exposé par langue, en plus de `LocaleProgress` existant — pas une fusion dans `translationProgress.ts` (qui reste pur/synchrone/sans I/O), mais un module frère côté serveur, ex. `localeActivity.server.ts`.

## 4. Calcul

- `git log --follow --format="%H|%an|%ae|%aI|%s" -- nodyx-frontend/src/lib/locales/<code>.json`, exécuté via `child_process.execFileSync` (pas `exec`, pas d'interpolation de shell — le seul paramètre variable est `<code>`, contraint à `LOCALES.map(l => l.code)`, jamais une entrée utilisateur).
- Parsé ligne par ligne, dédupliqué par `username ?? authorName` en gardant la première occurrence (la plus récente).
- Calculé au chargement du module (top-level, une fois), dans `+page.server.ts` via un `load()` qui l'importe. Le process PM2 vit jusqu'au prochain déploiement : redémarrage = recalcul = toujours à jour avec le vrai contenu déployé, cohérent avec `[[gotcha_i18n_ne_deploie_pas_seul]]`.
- Le binaire `git` et le `.git` du dépôt sont présents en prod (`/var/www/nexus` est le dépôt cloné, cf CLAUDE.md infra). Pas de dépendance externe.

## 5. UI

- Nouvelle colonne (ou insertion dans la colonne langue existante) : pile de 1 à 3 avatars, `border-radius` rond, léger chevauchement (`margin-left: -10px` sauf le premier), `z-index` décroissant du plus récent au plus ancien.
- Au survol du conteneur : chaque avatar s'écarte (`transform: translateX(n * 8px)`), transition `160ms ease`.
- Auteur sans username (D4) : rond avec initiales sur fond neutre, à la place de l'avatar GitHub, même comportement de survol.
- Au clic sur un avatar (ou sur la pile) : popup (même registre que le reste de la page, sobre) avec le contenu de D7. Fermeture au clic dehors ou `Échap`.
- Horodatage (D8) à côté du nom de langue ou en fin de ligne, à trancher au moment du code selon ce qui respire le mieux dans la table existante — détail visuel, pas une décision de CDC.

## 6. i18n

Nouvelles chaînes utilisateur (popup, aria-labels, horodatage relatif si pas géré par `Intl.RelativeTimeFormat` seul) : clés `translate.contributors.*`, posées dans `fr.json` ET `en.json` dans la même PR, `tFn(...)` partout — conforme à `[[feedback_i18n_obligatoire]]`, portes CI à faire passer avant merge.

## 7. Hors-scope

- Pas d'appel API GitHub (bio, repos publics, followers) — cf D7.
- Pas de cache Redis/DB pour `LocaleActivity` ni pour le parsing de `CONTRIBUTORS.md` — la mémoire du process suffit vu la fréquence de déploiement et le volume (8 langues, un fichier `git log` chacune + un seul fichier markdown à parser, coût négligeable une fois au démarrage).
- **Idée pour plus tard, pas dans cette session** : célébrer une toute première contribution (badge "1ère contribution 🎉") demanderait de vérifier l'historique *global* de la personne sur tout le dépôt, pas juste ce fichier de locale — complexité qui dépasse le périmètre "par langue" de cette page. À reprendre si Jonathan veut ce geste précis, ailleurs (ex. sur la page d'accueil ou dans un futur widget "dernière étoile").

## 8. Risques + mitigations

| Risque | Mitigation |
|---|---|
| Injection shell via le code de langue | `execFileSync` avec argv séparés, jamais de concaténation shell ; `<code>` vient de `LOCALES` (const interne), jamais d'une requête |
| `git log` absent/lent en prod | Vérifié présent (dépôt cloné en prod) ; calcul une fois au démarrage, pas par requête |
| Auteur avec email perso (pas de username) | Repli initiales, pas de lien mort (D4) |
| Pas de numéro de PR trouvé | Repli lien commit, popup dit "commit direct" (D6) |
| Redémarrage PM2 sans nouveau déploiement (ex. crash) | Le recalcul redonne le même résultat tant que le `.git` n'a pas bougé : pas de risque de régression, juste un recalcul identique |
| `CONTRIBUTORS.md` est écrit à la main pour des humains, pas une API : une ligne mal formée, un lien qui change de forme, et le parsing (D12/D13) rate la correspondance | Parsing défensif : regex tolérante, non-match → `blurb`/`starRank` à `null`, l'UI retombe sur le commit brut (D7). Aucune exception ne doit remonter jusqu'à faire échouer le rendu de la page pour ça — dégrader, jamais planter |

## 9. Tests à valider

- Parsing du format `git log` (extraction username, PR number, dédup) — cas avec/sans PR number, avec/sans username, plusieurs commits même auteur consécutifs.
- Rendu popup : contenu correct par contributeur, fermeture Échap/clic dehors.
- i18n : 4 portes CI vertes (`i18n:check`, `i18n:ts:check`, `i18n:keys:check`, `i18n:parity:check`, `i18n:placeholders:check`).

---

**Validé : D1 à D13 ci-dessus, code à suivre.**
