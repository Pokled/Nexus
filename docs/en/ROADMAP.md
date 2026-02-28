# NEXUS — Roadmap
### Version 1.3 — The realistic path

---

> "A project that tries to do everything at once does nothing well."
> The Nexus roadmap is built on one simple rule:
> each phase must work perfectly before moving to the next.

---

## PHASE 1 — Forum MVP + Admin
### Goal: A community can install, configure, and live on Nexus

### 1.1 Forum Backend
- [x] Initial SQL migration (users, communities, categories, threads, posts)
- [x] Migration 002 — user_profiles (bio, avatar, tags, links, social fields)
- [x] Migration 003 — grades (grades, community_grades, community_members.grade_id)
- [x] Migration 004 — social links (github, youtube, twitter, instagram, website)
- [x] Migration 005 — categories.parent_id (infinite categories, recursive CTE)
- [x] Migration 006 — threads.is_featured (featured articles)
- [x] Migration 007 — post_reactions + post_thanks (emoji reactions + karma)
- [x] Migration 008 — tags + thread_tags (community-scoped tags)
- [x] Migration 009 — search_vector + GIN triggers (full-text search)
- [x] Migration 010 — notifications (thread_reply, post_thanks, mention)
- [x] Route POST /api/v1/auth/register
- [x] Route POST /api/v1/auth/login + logout
- [x] Route GET  /api/v1/communities + /communities/:slug
- [x] Route POST /api/v1/communities/:slug/members (join/leave)
- [x] Forum routes (categories, threads, posts) — full CRUD
- [x] Thread title editing (author + mods)
- [x] Emoji reactions on posts (6 emojis, toggle)
- [x] Thanks button (+5 karma to author, 1 per user/post)
- [x] Thread tags (admin creates, selected at creation)
- [x] PostgreSQL full-text search (ts_headline, community filter)
- [x] Notifications (reply, thanks received, @mention)
- [x] JWT authentication middleware
- [x] Redis rate limiting middleware
- [x] Zod validation on all routes
- [x] "Online" tracking — Redis heartbeat 900s TTL
- [x] Instance routes — /instance/info, /instance/categories, /instance/threads/recent
- [x] Admin routes — stats, members, threads (pin/lock/delete), categories, tags

### 1.2 SEO and indexing
- [x] Forum routes rendered as static HTML (SvelteKit SSR)
- [x] Dynamic meta tags (title, description, og:*)
- [x] Automatic sitemap.xml
- [x] Configurable robots.txt
- [x] RSS feed
- [x] JSON-LD Schema.org (Forum, DiscussionForumPosting)
- [x] llms.txt (for AI agents)

### 1.3 Frontend
- [x] SvelteKit initialized + Tailwind v4
- [x] Homepage = instance community (NEXUS_COMMUNITY_NAME via .env)
- [x] Recursive category tree (CategoryTree.svelte)
- [x] Category + thread list page (with tag pills)
- [x] Thread + posts page + reply form
- [x] WYSIWYG editor (Tiptap — bold, code, tables, images, iframes)
- [x] Registration / login form
- [x] Complete user profiles (bio, tags, links, GitHub widget)
- [x] Grade system (admin CRUD + colored badge)
- [x] Preview directory (/communities — mock nexus-directory)
- [x] Full admin panel (/admin — 9 pages including Tags)
- [x] Adaptive navbar (search, notifications bell, Admin link)
- [x] /search page — Threads/Posts tabs, highlighted excerpts
- [x] /notifications page — list + mark read + 30s polling

### 1.4 Self-hosting
- [x] docker-compose.yml (Nexus + PostgreSQL + Redis)
- [x] Multi-stage Dockerfile
- [x] Seed script (demo data)
- [x] PowerShell "Nexus-Easy-Install" script — automates Node/PostgreSQL/Redis on Windows Server without Docker
- [x] Caddy Server configuration documented — automatic HTTPS reverse proxy (alternative to Nginx, zero dependency)
- [x] 15-minute installation documentation
- [x] Documented .env.example

### Phase 1 success criteria
A non-developer can:
1. Install Nexus on their server in under 15 minutes
2. Configure their instance via `.env` or Setup Wizard ✅ (`.env` OK, Wizard → Phase 2)
3. Create categories, threads, and tags ✅
4. Manage their community via the admin panel ✅
5. Be found on Google ✅

---

## PHASE 2 — Real-time Chat + Directory + Network Identity
### Goal: Members communicate live, the directory is real, each instance has its URL

Only after Phase 1 is stable and in use.

### 2.1 Real-time chat
- [ ] WebSocket (Socket.io) integrated into Fastify
- [ ] Text channels configurable by admin
- [ ] Real-time notifications (WebSocket — replaces 30s polling)
- [ ] Message history persisted in PostgreSQL

### 2.2 nexus-directory (separate repo)
- [ ] Real global directory service — instance registration API
- [ ] /communities page fed by the real directory (end of mock)
- [ ] Automatic instance registration on first startup

### 2.3 Network identity — `myclub.nexus.io`
- [ ] Each instance chooses a unique slug at installation
- [ ] The slug is reserved with the nexus-directory (REST API)
- [ ] The nexus-directory manages dynamic DNS + wildcard certificate `*.nexus.io`
- [ ] Caddy on nexus.io routes `myclub.nexus.io → node IP:port`
- [ ] Admin has no DNS to configure — clean URL in 1 click

### 2.4 Installation UX
- [ ] Nexus-Setup-Wizard — web interface on first launch (replaces manual `.env` edits)
- [ ] `*.nexus.io` slug selection from the wizard
- [ ] Cryptographic Node-Key generated at installation (unique node identity)

---

## PHASE 3 — P2P Network + Voice Channels
### Goal: Nexus becomes a truly decentralized network with audio/video

Only after Phase 2 is stable.

### 3.1 Voice channels
- [ ] WebRTC P2P direct for small groups (Round Table mode — 2 to 8 people)
- [ ] Amphitheater/Cinema mode — 1→N broadcast (9 to 25+ people, video on "screen")
- [ ] Nodes-as-a-Service — a Raspberry Pi can become a media stream relay to relieve the main server

### 3.2 Mesh network
- [ ] WireGuard mesh — encrypted tunnel between voluntary instances
- [ ] DHT for peer discovery without a central server
- [ ] Gossip protocol for lightweight node synchronization
- [ ] Distributed backup directory (if central nexus-directory goes down, nodes take over)
- [ ] Automatic transition to direct P2P connection if available

---

## PHASE 4 — Platform enrichment
### Goal: Nexus becomes the complete community platform

- [ ] File sharing (hosted on the node, no central CDN)
- [ ] Collaborative whiteboard (real-time via WebSocket)
- [ ] Lightweight task system (Trello-like, per community)
- [ ] Local Ollama AI — knowledge assistant (indexes local forum) + moderation help
- [ ] Plugin marketplace — stable API for third-party extensions
- [ ] Distributed data sharding for large files (inspired by IPFS/BitTorrent — voluntary nodes)

---

## PHASE 5 — Mobile and reputation
### Goal: Nexus in everyone's pocket

- [ ] iOS app via Capacitor
- [ ] Android app via Capacitor
- [ ] Desktop via Tauri (.exe/.app/.sh ~10MB, standalone)
- [ ] NexusPoints — inter-instance community reputation system
- [ ] Badges and levels
- [ ] Documented public API for third-party developers

---

## ROADMAP RULES

1. Don't start a phase without the previous one being stable and in use
2. Don't break what works — propose alternatives (e.g. Caddy vs Nginx)
3. Complexity is hidden: the user sees a button, the script handles the complexity
4. Every addition must be consistent with the decentralized and sovereign aspect
5. The core stays simple. Complexity goes into plugins.
6. The community can vote to reprioritize future phases

---

## WHAT'S NEVER IN THE ROADMAP

- Advertising
- Data selling
- Features that require a **mandatory** central server (nexus-directory is optional — without it, the instance remains functional on its own domain)
- Backdoors of any kind
- Dependency on a proprietary third-party service

---

*Version 1.3 — February 20, 2026*
*"Hang on and hold tight."*
