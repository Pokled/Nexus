# NEXUS — Architecture
### Version 1.0 — Document de référence technique

---

> Ce document est la loi technique de Nexus.
> Aucun choix architectural ne peut être modifié sans validation du Chef de Projet.
> OpenClaw lit ce document avant toute implémentation.

---

## 1. VUE D'ENSEMBLE

```
CLIENT
SvelteKit PWA / Tauri / Capacitor
        |
        | HTTP / WebSocket
        |
NEXUS CORE API
Fastify + TypeScript
/api/v1/...   +   Socket.io (temps réel)
        |               |               |
   PostgreSQL        Redis         Meilisearch
   Données        Cache/PubSub     Recherche
   permanentes                       SEO
```

---

## 2. STRUCTURE DES ROUTES API

Toutes les routes commencent par `/api/v1/`

```
/api/v1/
├── health                  GET  — Etat de l infrastructure
├── auth/
│   ├── register            POST — Creation de compte
│   ├── login               POST — Connexion
│   └── logout              POST — Deconnexion
├── communities/
│   ├── /                   GET  — Liste des communautes
│   ├── /                   POST — Creer une communaute
│   ├── /:slug              GET  — Une communaute
│   └── /:slug/members      GET  — Membres
├── forums/
│   ├── /:community         GET  — Categories du forum
│   ├── /categories         POST — Creer une categorie
│   ├── /threads            GET  — Liste des threads
│   ├── /threads            POST — Creer un thread
│   ├── /threads/:id        GET  — Un thread + posts
│   └── /posts              POST — Creer un post
├── users/
│   ├── /:id                GET  — Profil public
│   └── /me                 GET  — Mon profil
└── search/
    └── /                   GET  — Recherche globale
```

---

## 3. MODELE DE DONNEES POSTGRESQL

### Tables principales

```sql
-- Utilisateurs
users (
  id          UUID PRIMARY KEY,
  username    VARCHAR(50) UNIQUE,
  email       VARCHAR(255) UNIQUE,
  password    VARCHAR(255),
  avatar      VARCHAR(500),
  bio         TEXT,
  points      INTEGER DEFAULT 0,
  created_at  TIMESTAMP,
  updated_at  TIMESTAMP
)

-- Communautes
communities (
  id          UUID PRIMARY KEY,
  name        VARCHAR(100),
  slug        VARCHAR(100) UNIQUE,
  description TEXT,
  avatar      VARCHAR(500),
  owner_id    UUID references users(id),
  is_public   BOOLEAN DEFAULT true,
  created_at  TIMESTAMP,
  updated_at  TIMESTAMP
)

-- Categories du forum
categories (
  id           UUID PRIMARY KEY,
  community_id UUID references communities(id),
  name         VARCHAR(100),
  description  TEXT,
  position     INTEGER,
  created_at   TIMESTAMP,
  updated_at   TIMESTAMP
)

-- Threads (sujets)
threads (
  id           UUID PRIMARY KEY,
  category_id  UUID references categories(id),
  author_id    UUID references users(id),
  title        VARCHAR(300),
  is_pinned    BOOLEAN DEFAULT false,
  is_locked    BOOLEAN DEFAULT false,
  views        INTEGER DEFAULT 0,
  created_at   TIMESTAMP,
  updated_at   TIMESTAMP
)

-- Posts (reponses)
posts (
  id          UUID PRIMARY KEY,
  thread_id   UUID references threads(id),
  author_id   UUID references users(id),
  content     TEXT,
  is_edited   BOOLEAN DEFAULT false,
  created_at  TIMESTAMP,
  updated_at  TIMESTAMP
)

-- Membres des communautes
community_members (
  community_id UUID references communities(id),
  user_id      UUID references users(id),
  role         VARCHAR(20),
  joined_at    TIMESTAMP
)
```

### Relations
```
users ----------< community_members >---------- communities
communities ----< categories
categories -----< threads
threads --------< posts
users ----------< posts
users ----------< threads
```

---

## 4. REDIS — UTILISATION

```
Sessions utilisateur    nexus:session:{token}       TTL 7 jours
Cache profils           nexus:user:{id}              TTL 1 heure
Cache threads           nexus:thread:{id}            TTL 5 minutes
Pub/Sub chat            nexus:chat:{community_id}    Temps reel
Pub/Sub notifications   nexus:notif:{user_id}        Temps reel
Rate limiting           nexus:rate:{ip}              TTL 1 minute
```

---

## 5. ARCHITECTURE DES PLUGINS

Les plugins etendent Nexus sans modifier le core.

```
nexus-plugins/
└── mon-plugin/
    ├── plugin.json      — Manifeste du plugin
    ├── index.ts         — Point d entree
    ├── routes/          — Routes API additionnelles
    ├── migrations/      — Tables PostgreSQL additionnelles
    └── ui/              — Composants SvelteKit additionnels
```

### plugin.json
```json
{
  "name": "mon-plugin",
  "version": "1.0.0",
  "author": "Contributeur",
  "nexusVersion": ">=1.0.0",
  "hooks": ["onPostCreate", "onUserJoin"],
  "routes": "/api/v1/plugins/mon-plugin"
}
```

### Hooks disponibles
```
onUserRegister      — Apres creation de compte
onUserJoin          — Apres rejoindre une communaute
onThreadCreate      — Apres creation d un thread
onPostCreate        — Apres creation d un post
onCommunityCreate   — Apres creation d une communaute
```

---

## 6. SECURITE

```
Authentification    JWT signe + refresh token dans Redis
Mots de passe       bcrypt (cost factor 12)
Rate limiting       Redis — 100 req/min par IP
Validation          Zod sur toutes les entrees
CORS                Configurable par instance
Headers             Helmet.js (XSS, CSP, HSTS)
```

---

## 7. STRUCTURE DES FICHIERS SOURCE

```
nexus-core/src/
├── index.ts                — Point d entree serveur
├── fortunes.ts             — Phrases aleatoires
├── config/
│   └── database.ts         — Connexions PostgreSQL + Redis
├── routes/
│   ├── auth.ts             — Authentification
│   ├── communities.ts      — Communautes
│   ├── forums.ts           — Forum + threads + posts
│   ├── users.ts            — Profils
│   └── search.ts           — Recherche
├── models/
│   ├── user.ts             — Modele utilisateur
│   ├── community.ts        — Modele communaute
│   ├── thread.ts           — Modele thread
│   └── post.ts             — Modele post
├── middleware/
│   ├── auth.ts             — Verification JWT
│   ├── rateLimit.ts        — Rate limiting Redis
│   └── validate.ts         — Validation Zod
├── migrations/
│   └── 001_initial.sql     — Schema initial
└── plugins/
    └── loader.ts           — Chargeur de plugins
```

---

## 8. REGLES POUR OPENLAW

1. Toujours creer les migrations SQL avant le code TypeScript
2. Toujours valider les entrees avec Zod
3. Toujours passer par les models, jamais SQL direct dans les routes
4. Toujours commiter apres chaque fichier cree
5. Jamais de logique metier dans index.ts
6. Un fichier de route = un domaine fonctionnel
7. Toutes les routes retournent du JSON
8. Les erreurs ont toujours le format : { error: string, code: string }

---

*Version 1.0 — Fevrier 2026*
*"Le reseau, ce sont les gens."*