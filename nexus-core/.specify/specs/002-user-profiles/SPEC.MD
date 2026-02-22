# SPEC — Système de profil utilisateur
### À lire entièrement avant de coder quoi que ce soit

---

## Contexte

Chaque utilisateur Nexus a un profil enrichi.
Ce profil sert à DEUX endroits :

1. **Page profil complète** — `/users/:username`
2. **Mini-profil dans le forum** — affiché à gauche de chaque post

Le mini-profil est un composant réutilisable alimenté par les mêmes données.
Il faut donc construire le profil AVANT de finaliser la vue thread du forum.

---

## Étape 1 — Base de données

Fichier : `nexus-core/src/migrations/002_user_profiles.sql`

```sql
CREATE TABLE user_profiles (
  user_id       UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  display_name  VARCHAR(100),
  avatar_url    VARCHAR(500),
  banner_url    VARCHAR(500),
  bio           TEXT,
  status        VARCHAR(100),
  location      VARCHAR(100),
  tags          TEXT[]        DEFAULT '{}',
  links         JSONB         DEFAULT '[]',
  updated_at    TIMESTAMP     DEFAULT NOW()
);

-- Créer un profil vide automatiquement à chaque nouvel utilisateur
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_user_created
AFTER INSERT ON users
FOR EACH ROW EXECUTE FUNCTION create_user_profile();
```

Format du champ `links` (JSONB) :
```json
[
  { "label": "GitHub", "url": "https://github.com/username" },
  { "label": "Site", "url": "https://monsite.com" }
]
```

**Appliquer la migration :**
```powershell
$env:PATH += ";C:\Program Files\PostgreSQL\16\bin"
psql -U postgres -d nexus -f src/migrations/002_user_profiles.sql
```

---

## Étape 2 — Backend API

Fichier : `nexus-core/src/routes/users.ts`

Ajouter ces deux routes aux routes users existantes :

```
GET  /api/v1/users/:username/profile
→ Retourne le profil public complet
→ Accessible sans authentification
→ Combine users + user_profiles

PATCH /api/v1/users/me/profile
→ Modifie son propre profil
→ Authentification requise
→ Champs modifiables : display_name, bio, status, location, tags, links
→ avatar_url et banner_url : accepter une URL externe pour l'instant
```

Format de réponse GET :
```json
{
  "id": "uuid",
  "username": "testuser",
  "display_name": "Test User",
  "avatar_url": "https://...",
  "banner_url": "https://...",
  "bio": "Passionné de Linux et de café.",
  "status": "En train de coder Nexus",
  "location": "France",
  "tags": ["linux", "photo", "gaming"],
  "links": [
    { "label": "GitHub", "url": "https://github.com/testuser" }
  ],
  "points": 247,
  "created_at": "2026-02-18T23:37:00Z"
}
```

---

## Étape 3 — Composant mini-profil (SvelteKit)

Fichier : `nexus-frontend/src/lib/components/ProfileCard.svelte`

Ce composant s'affiche à GAUCHE de chaque post dans un thread.

**Données affichées dans le mini-profil :**
```
[Avatar 64x64]
Username
Points ⭐
Tags (max 3 affichés)
Membre depuis [mois année]
```

**Règles du composant :**
- Taille fixe, ne doit pas s'étendre
- Avatar avec fallback initiales si pas d'image
- Username cliquable → redirige vers /users/:username
- Maximum 3 tags affichés (les autres ignorés)
- Responsive : se place au-dessus du post sur mobile

**Interface TypeScript du composant :**
```typescript
interface ProfileCardProps {
  username: string
  displayName?: string
  avatarUrl?: string
  points: number
  tags: string[]
  memberSince: string  // ISO date string
}
```

---

## Étape 4 — Page profil complète (SvelteKit)

Fichier : `nexus-frontend/src/routes/users/[username]/+page.svelte`

**Ce qui s'affiche :**
```
[Bannière pleine largeur]
[Avatar]  Username / display_name
          Statut
          Location
          Membre depuis X
          Points ⭐

Bio

Tags : #linux  #photo  #gaming

Liens : GitHub | Site

Derniers posts (5 max)
```

**SEO :**
- Title : `{display_name} (@{username}) — Nexus`
- Description : bio tronquée à 160 caractères
- og:image : avatar_url

---

## Étape 5 — Intégration dans le forum

Fichier : `nexus-frontend/src/routes/forum/[category]/[thread]/+page.svelte`

Remplacer l'affichage actuel de l'auteur par le composant `ProfileCard`.

Structure d'un post dans le thread :
```
┌──────────────┬────────────────────────────────┐
│  ProfileCard │  Contenu du post               │
│  (gauche)    │                                │
│              │  [Date du post]                │
└──────────────┴────────────────────────────────┘
```

Les données du ProfileCard viennent du champ `author` déjà retourné
par `GET /api/v1/forums/threads/:id`.
Enrichir cette réponse avec avatar_url, tags, points si pas déjà présent.

---

## Ordre d'exécution OBLIGATOIRE

```
1. Migration SQL 002_user_profiles.sql
2. Appliquer la migration en base
3. Routes backend GET + PATCH profile
4. Composant ProfileCard.svelte
5. Page /users/[username]
6. Intégration ProfileCard dans thread view
7. Commit après chaque étape
```

---

## Ce qu'on ne fait PAS dans cette spec

- Upload d'avatar (fichier) → Phase 2, on accepte URL externe pour l'instant
- Modération des profils → Phase 2
- Profils privés → Phase 2
- Statistiques avancées → Phase 2

---

## Note Phase 2 — Chat et Vocal

Le composant ProfileCard DOIT être conçu pour être réutilisé dans :
- La liste des membres d'un salon chat (avatar + username + statut en ligne)
- Les messages de chat (mini avatar inline à gauche du message)
- La liste des participants d'un salon vocal (avatar + username + icône micro)

**Règle de conception dès maintenant :**
ProfileCard accepte une prop `variant` :
```typescript
variant: 'forum'  // gauche du post, taille moyenne
variant: 'chat'   // inline message, avatar petit
variant: 'vocal'  // liste participants, avatar moyen + statut
variant: 'full'   // page profil complète
```

Implémenter uniquement `variant: 'forum'` et `variant: 'full'` maintenant.
Prévoir les autres variants dans l'interface TypeScript sans les coder.
Cela évite de tout refactoriser quand le chat et le vocal arriveront en Phase 2.

---

## Critère de succès

Un utilisateur peut :
1. Voir son profil sur `/users/monusername`
2. Modifier sa bio, tags, liens via PATCH
3. Voir le mini-profil des auteurs dans chaque thread

*"Simple > Complexe. Toujours."*