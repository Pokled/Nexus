# NEXUS — Roadmap
### Version 1.0 — Le chemin réaliste

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
- [x] Route POST /api/v1/auth/register
- [x] Route POST /api/v1/auth/login + logout
- [x] Route GET  /api/v1/communities + /communities/:slug
- [x] Route POST /api/v1/communities/:slug/members (join/leave)
- [x] Routes forum (catégories, threads, posts) — CRUD complet
- [x] Middleware authentification JWT
- [x] Middleware rate limiting Redis
- [x] Validation Zod sur toutes les routes
- [x] Tracking "online" — heartbeat Redis 900s TTL
- [x] Routes instance — /instance/info, /instance/categories, /instance/threads/recent
- [x] Routes admin — stats, membres, threads (pin/lock/delete), catégories

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
- [x] Page liste catégories + threads
- [x] Page thread + posts + formulaire réponse
- [x] Formulaire inscription / connexion
- [x] Profils utilisateurs complets (bio, tags, links, GitHub widget)
- [x] Système de grades (CRUD admin + badge coloré)
- [x] Annuaire prévisuel (/communities — mock nexus-directory)
- [x] Panneau admin complet (/admin — 8 pages)
- [x] Navbar adaptive (liens contextuels, lien Admin pour owner/admin)

### 1.4 Self-hosting
- [x] docker-compose.yml (Nexus + PostgreSQL + Redis)
- [x] Dockerfile multi-stage
- [x] Script seed (données de démonstration)
- [ ] Documentation installation en 15 minutes
- [ ] .env.example documenté

### Critère de succès Phase 1
Une personne non-développeur peut :
1. Installer Nexus sur son serveur en moins de 15 minutes *(docker-compose — presque là)*
2. Configurer son instance via `.env` ✅
3. Créer des catégories et des threads ✅
4. Administrer sa communauté via le panneau admin ✅
5. Être trouvé sur Google ✅

---

## PHASE 2 — Chat temps réel + Annuaire
### Objectif : Les membres peuvent communiquer en live et l'annuaire est réel

Uniquement après que Phase 1 est stable et utilisée.

- [ ] Socket.io intégré dans le backend
- [ ] Canaux textuels configurables par l'admin
- [ ] Notifications temps réel (nouveau post, mention)
- [ ] Historique des messages en PostgreSQL
- [ ] nexus-directory — annuaire global réel (repo séparé)
- [ ] Enregistrement automatique d'une instance dans l'annuaire
- [ ] Sous-domaines nexus.io automatiques

---

## PHASE 3 — Réseau P2P
### Objectif : Nexus devient un vrai réseau décentralisé

Uniquement après que Phase 2 est stable.

- [ ] WireGuard mesh entre instances
- [ ] DHT pour découverte des pairs
- [ ] Gossip protocol pour synchronisation
- [ ] Phase hybride (serveurs publics comme relais)
- [ ] Salons vocaux WebRTC (P2P direct)
- [ ] Transition automatique vers P2P pur

---

## PHASE 4 — Enrichissement
### Objectif : Nexus devient la plateforme complète

- [ ] Éditeur WYSIWYG Tiptap (markdown + rich text)
- [ ] Réactions emoji sur les posts
- [ ] Mentions @utilisateur
- [ ] Partage de fichiers
- [ ] Whiteboard collaboratif
- [ ] Système de tâches (Trello-like)
- [ ] Ollama IA locale (assistant + modération)
- [ ] Marketplace plugins

---

## PHASE 5 — Mobile et réputation
### Objectif : Nexus dans la poche de tout le monde

- [ ] App iOS via Capacitor
- [ ] App Android via Capacitor
- [ ] Desktop via Tauri (.exe/.app/.sh ~10MB)
- [ ] NexusPoints (système de réputation communautaire)
- [ ] Badges et niveaux
- [ ] API publique documentée pour développeurs tiers

---

## RÈGLES DE LA ROADMAP

1. On ne commence pas Phase 2 sans que Phase 1 soit complète
2. Chaque fonctionnalité est d'abord un plugin avant d'entrer dans le core
3. Si une fonctionnalité n'est pas dans la phase courante, elle attend
4. La communauté peut voter pour reprioriser les phases futures
5. Le core reste simple. La complexité va dans les plugins.

---

## CE QUI N'EST JAMAIS DANS LA ROADMAP

- Publicité
- Vente de données
- Fonctionnalité qui nécessite un serveur central obligatoire
- Backdoor de quelque nature que ce soit
- Dépendance à un service propriétaire

---

*Version 1.1 — 19 février 2026*
*"Accroche et tiens."*
