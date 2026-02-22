# NEXUS — Roadmap
### Version 1.2 — Le chemin réaliste

---

> "Un projet qui veut tout faire en même temps ne fait rien bien."
> La roadmap Nexus est construite sur une règle simple :
> chaque phase doit fonctionner parfaitement avant de passer à la suivante.

---

## PHASE 1 — MVP Forum + Admin
### Objectif : Une communauté peut s'installer, se configurer, et vivre sur Nexus

### 1.1 Backend Forum
- [x] Migration SQL initiale (users, communities, categories, threads, posts)
- [x] Migration 002 — user_profiles (bio, avatar, tags, links, social fields)
- [x] Migration 003 — grades (grades, community_grades, community_members.grade_id)
- [x] Migration 004 — social links (github, youtube, twitter, instagram, website)
- [x] Migration 005 — categories.parent_id (catégories infinies, CTE récursive)
- [x] Migration 006 — threads.is_featured (articles mis en avant)
- [x] Migration 007 — post_reactions + post_thanks (réactions emoji + karma)
- [x] Migration 008 — tags + thread_tags (tags community-scoped)
- [x] Migration 009 — search_vector + triggers GIN (full-text français)
- [x] Migration 010 — notifications (thread_reply, post_thanks, mention)
- [x] Route POST /api/v1/auth/register
- [x] Route POST /api/v1/auth/login + logout
- [x] Route GET  /api/v1/communities + /communities/:slug
- [x] Route POST /api/v1/communities/:slug/members (join/leave)
- [x] Routes forum (catégories, threads, posts) — CRUD complet
- [x] Édition du titre de thread (auteur + mods)
- [x] Réactions emoji sur les posts (6 emojis, toggle)
- [x] Bouton Merci (+5 karma à l'auteur, 1 par user/post)
- [x] Tags sur les threads (admin crée, sélection à la création)
- [x] Recherche full-text PostgreSQL (ts_headline, filtre communauté)
- [x] Notifications (réponse, merci reçu, @mention)
- [x] Middleware authentification JWT
- [x] Middleware rate limiting Redis
- [x] Validation Zod sur toutes les routes
- [x] Tracking "online" — heartbeat Redis 900s TTL
- [x] Routes instance — /instance/info, /instance/categories, /instance/threads/recent
- [x] Routes admin — stats, membres, threads (pin/lock/delete), catégories, tags

### 1.2 SEO et indexation
- [x] Routes forum rendues en HTML statique (SvelteKit SSR)
- [x] Balises meta dynamiques (title, description, og:*)
- [x] Sitemap.xml automatique
- [x] Robots.txt configurable
- [x] RSS feed
- [x] JSON-LD Schema.org (Forum, DiscussionForumPosting)
- [x] llms.txt (pour les agents IA)

### 1.3 Frontend
- [x] SvelteKit initialisé + Tailwind v4
- [x] Homepage = communauté de l'instance (NEXUS_COMMUNITY_NAME via .env)
- [x] Arbre de catégories récursif (CategoryTree.svelte)
- [x] Page liste catégories + threads (avec pills de tags)
- [x] Page thread + posts + formulaire réponse
- [x] Éditeur WYSIWYG (Tiptap — gras, code, tableaux, images, iframes)
- [x] Formulaire inscription / connexion
- [x] Profils utilisateurs complets (bio, tags, links, GitHub widget)
- [x] Système de grades (CRUD admin + badge coloré)
- [x] Annuaire prévisuel (/communities — mock nexus-directory)
- [x] Panneau admin complet (/admin — 9 pages dont Tags)
- [x] Navbar adaptive (loupe recherche, cloche notifications, lien Admin)
- [x] Page /search — onglets Threads/Posts, extraits surlignés
- [x] Page /notifications — liste + marquer lu + polling 30s

### 1.4 Self-hosting
- [x] docker-compose.yml (Nexus + PostgreSQL + Redis)
- [x] Dockerfile multi-stage
- [x] Script seed (données de démonstration)
- [x] Script PowerShell "Nexus-Easy-Install" — automatise Node/PostgreSQL/Redis sur Windows Server sans Docker
- [x] Configuration Caddy Server documentée — reverse proxy HTTPS automatique (alternative à Nginx, zéro dépendance)
- [x] Documentation installation en 15 minutes
- [x] .env.example documenté

### Critère de succès Phase 1
Une personne non-développeur peut :
1. Installer Nexus sur son serveur en moins de 15 minutes
2. Configurer son instance via `.env` ou le Setup Wizard ✅ (`.env` OK, Wizard → Phase 2)
3. Créer des catégories, des threads, des tags ✅
4. Administrer sa communauté via le panneau admin ✅
5. Être trouvé sur Google ✅

---

## PHASE 2 — Chat temps réel + Annuaire + Identité réseau
### Objectif : Les membres communiquent en live, l'annuaire est réel, chaque instance a son URL

Uniquement après que Phase 1 est stable et utilisée.

### 2.1 Chat temps réel
- [ ] WebSocket (Socket.io) intégré dans Fastify
- [ ] Canaux textuels configurables par l'admin
- [ ] Notifications temps réel (WebSocket — remplace le polling 30s)
- [ ] Historique des messages persisté en PostgreSQL

### 2.2 nexus-directory (repo séparé)
- [ ] Service d'annuaire global réel — API d'enregistrement des instances
- [ ] Page /communities alimentée par l'annuaire réel (fin du mock)
- [ ] Enregistrement automatique d'une instance au premier démarrage

### 2.3 Identité réseau — `jaimeleschats.nexus.io`
- [ ] Chaque instance choisit un slug unique à l'installation
- [ ] Le slug est réservé auprès du nexus-directory (API REST)
- [ ] Le nexus-directory gère le DNS dynamique + certificat wildcard `*.nexus.io`
- [ ] Caddy côté nexus.io route `jaimeleschats.nexus.io → IP:port du nœud`
- [ ] L'admin n'a aucun DNS à configurer — URL propre en 1 clic

### 2.4 UX d'installation
- [ ] Nexus-Setup-Wizard — interface web au premier lancement (remplace les modifs manuelles du `.env`)
- [ ] Choix du slug `*.nexus.io` depuis le wizard
- [ ] Node-Key cryptographique générée à l'installation (identité unique du nœud)

---

## PHASE 3 — Réseau P2P + Salons vocaux
### Objectif : Nexus devient un vrai réseau décentralisé avec de l'audio/vidéo

Uniquement après que Phase 2 est stable.

### 3.1 Salons vocaux
- [ ] WebRTC P2P direct pour petits groupes (mode Table Ronde — 2 à 8 personnes)
- [ ] Mode Amphi/Cinéma — diffusion 1→N (9 à 25+ personnes, vidéo sur "toile")
- [ ] Nodes-as-a-Service — un Raspberry Pi peut devenir relais de flux media pour soulager le serveur principal

### 3.2 Réseau maillé
- [ ] WireGuard mesh — tunnel chiffré entre instances volontaires
- [ ] DHT pour découverte des pairs sans serveur central
- [ ] Gossip protocol pour synchronisation légère entre nœuds
- [ ] Annuaire de secours distribué (si le nexus-directory central tombe, les nœuds prennent le relais)
- [ ] Transition automatique vers connexion P2P directe si disponible

---

## PHASE 4 — Enrichissement de la plateforme
### Objectif : Nexus devient la plateforme communautaire complète

- [ ] Partage de fichiers (hébergé sur le nœud, pas de CDN central)
- [ ] Whiteboard collaboratif (temps réel via WebSocket)
- [ ] Système de tâches léger (Trello-like, par communauté)
- [ ] Ollama IA locale — assistant de savoir (indexe le forum local) + aide à la modération
- [ ] Marketplace plugins — API stable pour extensions tierces
- [ ] Data Sharding distribué pour les fichiers lourds (inspiration IPFS/BitTorrent — nœuds volontaires)

---

## PHASE 5 — Mobile et réputation
### Objectif : Nexus dans la poche de tout le monde

- [ ] App iOS via Capacitor
- [ ] App Android via Capacitor
- [ ] Desktop via Tauri (.exe/.app/.sh ~10MB, autonome)
- [ ] NexusPoints — système de réputation communautaire inter-instances
- [ ] Badges et niveaux
- [ ] API publique documentée pour développeurs tiers

---

## RÈGLES DE LA ROADMAP

1. On ne commence pas une phase sans que la précédente soit stable et utilisée
2. On ne casse pas ce qui marche — on propose des alternatives (ex: Caddy vs Nginx)
3. La complexité est cachée : l'utilisateur voit un bouton, le script gère la complexité
4. Chaque ajout doit être cohérent avec l'aspect décentralisé et souverain
5. Le core reste simple. La complexité va dans les plugins.
6. La communauté peut voter pour reprioriser les phases futures

---

## CE QUI N'EST JAMAIS DANS LA ROADMAP

- Publicité
- Vente de données
- Fonctionnalité qui nécessite un serveur central **obligatoire** (le nexus-directory est optionnel — sans lui, l'instance reste fonctionnelle sur son propre domaine)
- Backdoor de quelque nature que ce soit
- Dépendance à un service propriétaire tiers

---

*Version 1.3 — 20 février 2026*
*"Accroche et tiens."*
