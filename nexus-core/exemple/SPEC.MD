# SPEC 004 — Widgets profil réseaux sociaux
### À lire entièrement avant de coder quoi que ce soit

---

## Contexte

Si un utilisateur renseigne des liens vers ses réseaux sociaux dans son profil,
Nexus affiche automatiquement un widget enrichi pour ce réseau.

**Règle absolue : rien ne s'affiche si le champ est vide.**
Pas de widget vide, pas de placeholder, pas d'invitation à connecter.

---

## Phase 1 — GitHub uniquement

GitHub est la priorité car :
- API publique et gratuite (pas de clé nécessaire pour les données publiques)
- Parfaitement adapté à la cible early adopters de Nexus
- Données riches et pertinentes

Les autres réseaux (YouTube, X, Instagram) sont en Phase 2.

---

## Étape 1 — Mise à jour base de données

Fichier : `nexus-core/src/migrations/004_social_links.sql`

```sql
-- Remplacer le champ links (JSONB générique) par des champs dédiés
ALTER TABLE user_profiles
ADD COLUMN github_username   VARCHAR(100),
ADD COLUMN youtube_channel   VARCHAR(200),
ADD COLUMN twitter_username  VARCHAR(100),
ADD COLUMN instagram_username VARCHAR(100),
ADD COLUMN website_url       VARCHAR(500);

-- Index pour recherche par github_username
CREATE INDEX idx_profiles_github ON user_profiles(github_username)
WHERE github_username IS NOT NULL;
```

---

## Étape 2 — Backend API

### Route GET /api/v1/users/:username/github
```
→ Accessible sans authentification
→ Appelle l'API GitHub publique
→ Met en cache dans Redis 1 heure (clé: nexus:github:{github_username})
→ Retourne les données formatées pour le widget
```

Format de réponse :
```json
{
  "login": "monusername",
  "name": "Mon Nom",
  "avatar_url": "https://avatars.githubusercontent.com/...",
  "bio": "Développeur passionné",
  "public_repos": 42,
  "followers": 128,
  "pinned_repos": [
    {
      "name": "mon-super-projet",
      "description": "Un projet génial",
      "language": "TypeScript",
      "stars": 47,
      "url": "https://github.com/monusername/mon-super-projet"
    }
  ]
}
```

### Appel GitHub API (sans clé)
```typescript
// Infos utilisateur
GET https://api.github.com/users/{github_username}

// Repos publics triés par stars
GET https://api.github.com/users/{github_username}/repos?sort=updated&per_page=6
```

**Note :** Sans clé API, limite à 60 requêtes/heure par IP.
Le cache Redis 1 heure résout ce problème.

---

## Étape 3 — Mise à jour route PATCH profil

Ajouter les nouveaux champs dans `PATCH /api/v1/users/me/profile` :
```typescript
github_username,
youtube_channel,
twitter_username,
instagram_username,
website_url
```

Validation Zod :
- `github_username` : alphanumérique + tirets, max 39 chars
- `website_url` : URL valide ou null

---

## Étape 4 — Composant GitHubWidget.svelte

Fichier : `nexus-frontend/src/lib/components/widgets/GitHubWidget.svelte`

```
┌─────────────────────────────────────┐
│ 🐙 GitHub — monusername             │
├─────────────────────────────────────┤
│ [Avatar]  Mon Nom                   │
│           Développeur passionné     │
│           📦 42 repos  👥 128 followers │
├─────────────────────────────────────┤
│ Repos récents                       │
│ ┌─────────────────────────────────┐ │
│ │ mon-super-projet           ⭐ 47│ │
│ │ Un projet génial  TypeScript   │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ autre-projet               ⭐ 12│ │
│ │ Description courte  Python     │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

Règles :
- Maximum 3 repos affichés
- Lien vers le profil GitHub sur le nom d'utilisateur
- Lien vers chaque repo sur le nom du repo
- Loading skeleton pendant le fetch
- Si erreur API → widget masqué silencieusement (pas d'erreur visible)

---

## Étape 5 — Intégration dans la page profil

Fichier : `nexus-frontend/src/routes/users/[username]/+page.svelte`

Ajouter après la bio :

```
[Bio]
[Tags]
[Liens]

--- Widgets réseaux sociaux ---
[GitHubWidget]     ← si github_username renseigné
[YouTubeWidget]    ← Phase 2
[TwitterWidget]    ← Phase 2
```

Le widget s'affiche uniquement si `profile.github_username` est renseigné.

---

## Étape 6 — Formulaire d'édition du profil

Fichier : `nexus-frontend/src/routes/users/me/edit/+page.svelte`

Section "Réseaux sociaux" dans le formulaire :
```
GitHub          [________________]  ex: monusername
YouTube         [________________]  ex: @machaîne
Twitter / X     [________________]  ex: monpseudo
Instagram       [________________]  ex: monpseudo
Site web        [________________]  ex: https://monsite.com
```

---

## Ordre d'exécution OBLIGATOIRE

```
1. Migration SQL 004_social_links.sql
2. Appliquer la migration en base
3. Route GET /api/v1/users/:username/github
4. Mise à jour PATCH /me/profile avec nouveaux champs
5. Composant GitHubWidget.svelte
6. Intégration GitHubWidget dans page profil
7. Formulaire édition profil /users/me/edit
8. Commit après chaque étape
```

---

## Ce qu'on ne fait PAS dans cette spec

- OAuth "Se connecter avec GitHub" → Phase 2
- Statistiques de contribution GitHub (graphe) → Phase 2

---

## Roadmap des widgets réseaux sociaux

### Phase 1 — Maintenant
```
GitHub      ✅ API publique gratuite
```

### Phase 2 — Prochaine itération
```
Twitch      → API publique, parfait pour streamers
Spotify     → API publique, afficher ce qu'on écoute
SoundCloud  → API publique, parfait pour musiciens
Steam       → API publique, jeux + heures de jeu
```

### Phase 3 — Iterations suivantes
```
YouTube     → clé API Google requise
LinkedIn    → API accessible, profil pro
DeviantArt  → API publique, parfait pour artistes
Reddit      → API publique, afficher profil
Mastodon    → parfait pour l'esprit Nexus
```

### Hors scope — Pas d'API profil public utilisable
```
WhatsApp, WeChat, QQ, Viber     → pas d'API profil
Telegram, Snapchat              → pas de profil public
Tumblr, Flixster                → services en déclin
G2A, EpicGames, Fab             → pas d'API profil
```

### Phase suivante selon faisabilité
```
Twitter/X   → API payante depuis 2023
Instagram   → API très restrictive depuis 2019
TikTok      → API très limitée
Pinterest   → API limitée
```

---

## Note importante — Respect de la vie privée

L'utilisateur choisit ce qu'il expose.
Nexus n'importe JAMAIS automatiquement des données externes.
Chaque champ réseau social est optionnel et rempli volontairement.

---

*"Le réseau, ce sont les gens."*