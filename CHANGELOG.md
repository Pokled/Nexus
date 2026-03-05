# Changelog

All notable changes to Nexus are documented here.
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), versioning follows [Semantic Versioning](https://semver.org/).

---

## [Unreleased]

---

## [1.0.0] — 2026-03-05

### Added
- **Profile theme system** — complete per-user personalization engine
  - 6 built-in presets: Défaut 🌑, Minuit 🌌, Forêt 🌲, Chaleur 🔥, Rose 🌸, Verre 💎
  - CSS variable architecture: `--p-bg`, `--p-card-bg`, `--p-card-border`, `--p-accent`, `--p-text`, `--p-text-muted`
  - Live preview editor in `/users/me/edit` — preset grid + 5 individual hex color pickers
  - Migration 024 — `metadata JSONB DEFAULT '{}'` on `user_profiles`
  - Theme stored as `metadata.theme` via PostgreSQL JSONB merge operator (`||`)
- **App-wide theming** — user's profile theme propagates to the entire interface: top nav, Galaxy Bar sidebar, members sidebar, bottom nav, page background — every logged-in user skins the app with their own preset
- **Mobile-responsive UI overhaul** — full mobile-first layout
  - Chat page: sliding channel drawer (hamburger button), VoicePanel always accessible on mobile
  - Forum pages: responsive category icon, title, and dropdown sizing
  - Admin settings: responsive two-column form layout
  - Bottom navigation bar (`lg:hidden`) with `--bottom-nav-h` CSS variable for safe content padding
- **Community favicon** — dynamic `<link rel="icon">` injected from the community logo in `<svelte:head>`
- **Asset library — 12 MB upload limit** (up from 5 MB)
  - `@fastify/multipart` limit updated to 12 MB
  - Migration 023 — DB constraint updated (`CHECK (file_size <= 12582912)`)
  - Per-type upload tooltips with design guidelines, recommended dimensions, format advice
- **Profile badges** — displayed at 56 × 56 px (doubled from 28 × 28 px)

### Fixed
- Profile `metadata` column was missing from `SELECT` in `GET /users/:username/profile` — theme was saved to DB but never returned to frontend
- Chat page channel sidebar visual gap on desktop — `fixed top-14` base class leaked through `lg:relative` override; restructured using `max-lg:` Tailwind prefix for mobile-only fixed positioning
- `@fastify/multipart` file size limit (5 MB) was independent of the DB constraint — both now consistently at 12 MB

---

## [0.5.0] — 2026-03-01

### Added
- **nexus-relay** — Rust P2P relay infrastructure (Phase 3.0-A ✅)
  - `nexus-relay server` — deployed on VPS: TCP:7443 (relay clients) + HTTP:7001 (Caddy proxy), tokio async, DashMap in-memory registry
  - `nexus-relay client` — 9MB static binary, outbound TCP connection only — **zero open ports, zero domain required**
  - Automatic `slug.nexusnode.app` provisioning — slug reserved in DB at registration, DNS wildcard served by relay proxy
  - Exponential backoff reconnection (1s → 2s → 4s → max 30s)
  - `install.sh` — option 2 "Nexus Relay (recommended)" → auto-downloads binary, generates systemd service, full URL without touching a router
  - `nexus-relay-client.service` — systemd unit, auto-restart, enabled on boot
  - GitHub Releases `v0.1.0-relay` + `v0.1.1-relay` — amd64 + arm64 static binaries
  - **Validated:** Raspberry Pi 4, zero open ports, zero Cloudflare account → `https://test.nexusnode.app` live ✅
- **Voice channel member interaction panel**
  - Click any member in the voice channel sidebar → opens their real-time stats in VoicePanel (RTT, jitter, packet loss, volume slider)
  - Click yourself ("vous") → green self-monitoring panel: live audio level meter, muted / deafened / PTT status badges
  - Interaction buttons per peer: Profile link, Direct Message (functional), File sharing + Mini-game (coming soon)
  - `voicePanel.ts` — shared Svelte writable store for cross-component panel targeting (discriminated union: `{ type: 'peer', socketId } | { type: 'self', username, avatar } | null`)
- **VoicePanel sidebar** — redesigned as a fixed-position left sidebar (Galaxy Bar layout)
  - Participant list with clickable member rows, animated connection indicator, member count badge
  - VoiceSettings popup — fixed-position (`bottom-24 left-1/2`), 360px wide, escapes sidebar overflow with backdrop blur overlay

### Fixed
- **nexus-relay concurrent requests** — relay client was processing requests sequentially. With Socket.IO long-polling (pingInterval 8s), one user's blocking GET delayed all others → relay server 10s timeout → 504 Gateway Timeout → Socket.IO disconnect → presence sidebar empty. Fixed by spawning a tokio task per request; writes are serialized via `mpsc`. Timeout ladder: `pingInterval(8s) < reqwest(12s) < relay-server(15s)`
- **online_count off-by-default** — `/info` and `/admin/stats` counted `redis.keys('nexus:heartbeat:*')` (set on API calls, 15 min TTL). Active Socket.IO session ≠ recent API call → count dropped to 0 after 15 min of browse-only activity. Fixed: `io.in('presence').fetchSockets()` — Socket.IO presence room as the source of truth, deduplicated by `userId`

### Infrastructure
- `relay.nexusnode.app` — DNS A record (grey cloud, no Cloudflare proxy) for direct TCP:7443 relay client connections
- UFW: port 7443/tcp opened on the VPS for relay client inbound connections
- `nexus-relay.service` — systemd unit active on VPS, ~1.3MB RAM, Restart=on-failure
- Caddy: `*.nexusnode.app` now routes to `localhost:7001` (nexus-relay HTTP proxy) instead of `localhost:3000` — relay handles routing (tunnel → active relay, 302 → DB URL, 404 → unknown)

---

## [0.4.0] — 2026-02-28

### Added
- **Production deployment** — full stack live on [nexusnode.app](https://nexusnode.app) (Hetzner CPX42, Ubuntu 24.04, PM2, Caddy, Cloudflare)
- **Directory API** — instance registry with automatic Cloudflare DNS subdomain provisioning
  - `GET /api/directory` — list active instances
  - `POST /api/directory/register` — register an instance, triggers URL check + DNS creation
  - `POST /api/directory/ping` — heartbeat to update member/online counts and `last_seen`
  - `DELETE /api/directory/:slug` — unregister and remove DNS record
- **Migration 014** — `directory_instances` table (slug, token, subdomain, cloudflare_record_id, last_seen…)
- **Scheduler** (`scheduler.ts`) — auto-pings the directory every 5 minutes with live member/online counts from DB + Socket.IO
- **Communities page** — replaced mock data with live `/api/directory` API data

### Infrastructure
- Caddy reverse proxy with Cloudflare Origin Certificate (Full Strict SSL)
- `*.nexusnode.app` wildcard block — all registered subdomains routed to the same stack
- `code.nexusnode.app` — code-server (VS Code in browser) for remote development
- Claude Code CLI installed on VPS for remote AI-assisted development

### Fixed
- Directory DNS creation: replaced `dnsLookup` (returned Cloudflare proxy IP) with `VPS_IP` env var

---


## [0.4.1] — 2026-03-01

### Added
- **`install.sh`** — one-click node installer for Ubuntu 22.04/24.04 and Debian 11/12
  - Detects the server's public IP automatically (used for TURN relay config)
  - Installs and configures: Node.js 20, PostgreSQL, Redis, coturn, Caddy, PM2
  - Grants PostgreSQL 15+ `CREATE ON SCHEMA public` (migration fix for fresh installs)
  - Configures UFW firewall (SSH, HTTP, HTTPS, TURN ports, WebRTC relay range)
  - Generates secure random secrets (DB password, JWT secret, TURN credential)
  - Bootstraps the instance community and creates the admin account automatically
  - Saves all credentials to `/root/nexus-credentials.txt` (chmod 600)
  - TURN URL uses server IP directly — bypasses Cloudflare proxy automatically
- **`docs/en/INSTALL.md`** — comprehensive English installation guide
  - Hardware requirements, OS compatibility table
  - VPS recommendations (Hetzner, DigitalOcean, Vultr, OVH)
  - Windows WSL2 step-by-step guide
  - Home server / NAT / CGNAT section with port forwarding table
  - VPN and WireGuard considerations (Phase 3 preview)
  - Common errors & fixes (port conflicts, DNS, TURN, SSL, uploads)
  - Post-install guide and admin tips
- **`docs/fr/INSTALL.md`** — guide d'installation complet en français (même contenu)
- **`nexus-core/src/migrations/015_admin_role.sql`** — fixes `community_members_role` constraint to include `'admin'` role (was missing from migration 001, causing DB errors when promoting users to admin)
- **GitHub CLI (`gh`)** — installed on the VPS for release management

### Fixed
- **DB constraint `community_members_role`** — migration 001 only allowed `('owner', 'moderator', 'member')`; the admin middleware and routes already referenced `'admin'`, causing a silent mismatch. Migration 015 aligns the constraint with the codebase.

### Changed
- **TURN relay** — removed hardcoded home server (`pokled.ddns.net`). TURN is now configured entirely via `.env` variables (`PUBLIC_TURN_URL`, `PUBLIC_TURN_USERNAME`, `PUBLIC_TURN_CREDENTIAL`), set automatically by `install.sh` using the detected public IP.
- **File uploads** — Caddy now routes `/uploads/*` to port 3000 (was missing, causing 404 on uploaded avatars/banners)
- **Instance directory** — backend scheduler pings directory every 5 minutes with live member/online stats

---

## [0.3.3] — 2026-02-28

### Fixed
- **Forum:** erreur 500 sur toutes les pages catégories — la requête SQL `GET /forums/threads` référençait `c.slug` (colonne inexistante sur la table `categories`)
- **TipTap:** warning "Duplicate extension names: link, underline" — StarterKit v3 inclut désormais ces extensions par défaut ; désactivées dans StarterKit, conservées avec leur config personnalisée

### Build
- `tsconfig.json` : exclut `src/tests/` du build de production — `npm run build` propre sans erreurs de test
- `tsconfig.test.json` : nouveau fichier dédié à vitest (`noEmit: true`, inclut les tests)

### Docs
- Documentation EN/FR complète — README, ARCHITECTURE, ROADMAP, MANIFESTO, CONTRIBUTING traduits intégralement
- `docs/en/specs/` : 8 specs traduites (002 à 013)
- `docs/fr/` : AUDIO et NEURAL-ENGINE ajoutés
- Tous les liens internes `docs/` corrigés
- README racine : diagramme réseau P2P, notice alpha, badge version mis à jour

---

## [0.3.2] — 2026-02-28

### Fixed
- **WebRTC TURN relay fully operational** — relay candidates now correctly advertise the public IP
  - `turn-server/server.js`: `externalIp` → `externalIps` (node-turn reads the plural form — one character, weeks of debugging)
  - `turn-server/server.js`: `relayIps: ['0.0.0.0']` → `['192.168.1.100']` — relay socket now binds to the actual LAN interface instead of wildcard (was causing `xor-relayed-address: 0.0.0.0` in ALLOCATE responses)
  - `turn-server/server.js`: added `credentials` config so node-turn can validate `MESSAGE-INTEGRITY` from browsers
  - PM2 process now started with explicit `--cwd` — `dotenv` was silently failing to find `.env` causing 40+ crash-restart cycles
  - Bbox port forwarding rule fixed: relay port range `49152–55440` was mapped to internal port `48000` instead of `49152`

- **WebRTC ICE reconnection loop** — `_scheduleRejoin` was destroying all peer connections when a single peer failed
  - Added `_dropPeer()`, `_hasOtherConnectedPeer()`, `_handlePeerFailure()` — only triggers full rejoin if no other connected peer exists
  - Per-peer ICE restart (2 attempts before escalating to rejoin)

- **Double-peer appearance on reconnect** — race condition where `voice:peer_joined` arrived before `voice:peer_left` for the same `userId`
  - `onPeerJoined` now detects stale peers by `userId` and calls `_dropPeer` before adding the new socket

### Changed
- **ICE config cleanup** — removed broken TCP/TLS TURN URL variants (`?transport=tcp`, port 443, `turns:`) injected via `configureICE` — these were timing out and delaying ICE gathering
- `iceCandidatePoolSize: 2` added to pre-gather relay candidates before ICE checking starts
- Added `[ICE gather]` + `[ICE config]` console debug logging for future diagnostics

### Security
- Removed two user logo uploads (`uploads/logos/`) that were accidentally tracked in git

---

## [0.3.1] — 2026-02-27

### Fixed
- **Screen sharing in voice channels** — the feature existed but did nothing (video was only shown locally, never sent to peers)
  - `voice.ts`: `startScreenShare()` now adds the video track to all active `RTCPeerConnection`s and triggers renegotiation (`createOffer` → `voice:offer`) for each peer
  - `voice.ts`: `stopScreenShare()` removes video senders and renegotiates to signal end of share
  - `voice.ts`: `ontrack` handler now splits audio/video — video tracks go to `remoteScreenStore`
  - `MediaCenter.svelte`: rewritten to use `startScreenShare`/`stopScreenShare` from `voice.ts`
  - Remote screens visible inside MediaCenter panel (with username + live badge)
  - Clip recording (rolling 60s) now connected to the actual shared stream

---

## [0.3.0] — 2026-02-27

### Added
- **`docker-compose.yml`** — full stack in one command: PostgreSQL 16 + Redis 7 + API + Frontend
  - PostgreSQL healthcheck ensures API waits for DB before starting
  - Volumes for persistent data (`postgres_data`, `redis_data`) and uploads bind-mount
- **`.env.example`** (root) — `DB_PASSWORD` for docker-compose
- **`nexus-core/src/scripts/migrate.ts`** — idempotent SQL migration runner
  - Creates `schema_migrations` tracking table on first run
  - Skips already-applied migrations — safe to call on every boot
- **`nexus-frontend/Dockerfile`** — multi-stage Node.js build (builder → runner, PORT=3001)

### Changed
- **`nexus-core/src/index.ts`** — `runMigrations()` called before `server.listen()`
- **`nexus-core/Dockerfile`** — `src/migrations/` copied into runner image; `uploads/` subdirs created

---

## [0.2.0] — 2026-02-27

### Added
- **Test suite** (nexus-core): 34 Vitest tests covering auth routes, middleware, and forum routes
  - `auth.test.ts` — 13 tests: register/login/logout with mocked DB + Redis
  - `middleware.test.ts` — 10 tests: `requireAuth`, `optionalAuth`, `rateLimit`
  - `forums.test.ts` — 11 tests: GET /threads, POST /threads, POST /posts
- **GitHub Actions CI** — automated test run on every push/PR to `main`
- **Docs restructuring** — all `.MD` files reorganized into `docs/{en,fr,es,it,de}/`
- **Multilingual documentation stubs** — `docs/es/`, `docs/it/`, `docs/de/` ready for future translations
- **Technical specs** moved to `docs/specs/` (8 specs: profiles, grades, social widgets, audio, search, calendar, galaxy bar, node)
- **Root `README.md`** in English with stack table, project status, and multilingual links
- **`Caddyfile.example`** — generic Caddy reverse proxy config
- **`ecosystem.config.example.js`** — PM2 config with relative paths
- **`turn-server/.env.example`** — template env vars for TURN server

### Security
- Removed sensitive files from git tracking: hardcoded IP addresses, absolute paths, user upload assets
- Sanitized `turn-server/server.js`: replaced hardcoded IP (`87.88.104.61`) and domain with env vars (`TURN_EXTERNAL_IP`, `TURN_REALM`)
- Updated `.gitignore` to exclude `uploads/avatars/*`, `uploads/banners/*`, `uploads/logos/*`, `.claude/`, `.nexus-context/`
- Added `.gitkeep` files to preserve `uploads/` directory structure

### Removed
- Dead files: `VoicePanel_old.svelte`, `svelte.config_old.js`, boilerplate SvelteKit README
- Redundant docs scattered across `nexus-core/` root (moved to `docs/`)

---

## [0.1.0] — 2026-02-20

### Added
- **Forum** — categories, threads, posts, reactions, thanks, tags, pin/lock/feature
- **Real-time chat** — channels, WebSocket (send/edit/delete/react/typing), @mentions, notifications
- **Voice channels** — WebRTC P2P mesh, TURN fallback, VAD, network stats (RTT/jitter/loss)
- **Screen sharing + clip recording** — `MediaCenter.svelte` (60s clips, snapshots)
- **User profiles** — avatar/banner upload, GitHub widget, bio, points
- **Communities + roles + permissions** — granular permission system with grades
- **Admin panel** — stats, moderation, branding (logo/banner), category/channel management
- **PostgreSQL full-text search** — instant search across threads and posts
- **Notifications** — reply, mention, thanks events
- **JWT auth** — sessions stored in Redis, 7-day TTL, logout blacklisting
- **Rate limiting** — sliding window via Redis, per-IP with `X-RateLimit-*` headers
- **AI assistant** — local Ollama integration (no cloud dependency)
- **13 SQL migrations** — complete schema from users to voice channels

[Unreleased]: https://github.com/Pokled/Nexus/compare/v0.5.0...HEAD
[0.5.0]: https://github.com/Pokled/Nexus/compare/v0.4.1...v0.5.0
[0.4.1]: https://github.com/Pokled/Nexus/compare/v0.3.3...v0.4.1
[0.3.3]: https://github.com/Pokled/Nexus/compare/v0.3.2...v0.3.3
[0.3.2]: https://github.com/Pokled/Nexus/compare/v0.3.1...v0.3.2
[0.3.1]: https://github.com/Pokled/Nexus/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/Pokled/Nexus/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/Pokled/Nexus/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/Pokled/Nexus/releases/tag/v0.1.0
