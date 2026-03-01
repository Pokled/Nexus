# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Nexus is a self-hosted, open-source, decentralized community platform — Forum + real-time chat + voice channels. **One instance = one community**, no exceptions. License: AGPL-3.0.

## Architecture

Two independent apps, one reverse proxy:

```
nexus-core/    → Fastify v5 + TypeScript API (port 3000)
nexus-frontend/ → SvelteKit 5 + Tailwind v4 (port 5173)
Caddy          → /api/* + /socket.io/* → 3000 | * → 5173
```

### nexus-core

- Entry point: `src/index.ts` — registers all routes, attaches Socket.IO **after** `server.listen()` (Fastify v5 incompatibility with fastify-socket.io)
- Routes: `src/routes/` — one file per domain (`auth`, `admin`, `communities`, `forums`, `chat`, `users`, `search`, `notifications`, `instance`), all prefixed `/api/v1/`
- Middleware: `src/middleware/` — `requireAuth` (JWT + Redis session check), `optionalAuth`, `adminOnly`, `permissions`, `rateLimit`, `validate`
- Socket.IO: `src/socket/index.ts` (chat events) + `src/socket/voice.ts` (WebRTC signaling), shared instance via `src/socket/io.ts`
- Database: `src/config/database.ts` exports `db` (pg Pool) and `redis` (ioredis). Migrations run automatically at startup from `src/migrations/` (001–013)
- Auth: JWT Bearer token + Redis session (`session:<token>`, 7-day TTL). Online presence tracked via `heartbeat:<userId>` (15-min TTL)

### nexus-frontend

- `src/lib/api.ts` — `apiFetch` wrapper; uses `PUBLIC_API_URL` in browser, `http://127.0.0.1:3000/api/v1` server-side (SSR bypass)
- `src/lib/socket.ts` — Socket.IO client (dynamic import, SSR-safe), stores: `socket`, `tokenStore`, `onlineMembersStore`, `unreadCountStore`
- `src/lib/voice.ts` — WebRTC + AudioContext chain (`ctx.resume()` required for browser autoplay policy)
- `src/lib/voiceSettings.ts` — persisted to localStorage
- Key components: `VoicePanel.svelte` (floating bar), `VoiceSettings.svelte` (audio chain config), `MediaCenter.svelte` (screenshare/clips), `CategoryTree.svelte`, `NexusEditor` (TipTap WYSIWYG)

## Commands

### nexus-core (dev)
```bash
cd nexus-core
npm run dev          # ts-node src/index.ts
npm run build        # tsc → dist/
npm run test         # vitest run
npm run test:watch   # vitest interactive
npm run seed         # seed DB with test data
npm run seed:reset   # drop + reseed
```

### nexus-frontend (dev)
```bash
cd nexus-frontend
npm run dev          # vite dev
npm run build        # vite build → build/
npm run check        # svelte-check (type checking)
```

### Production (VPS)
```bash
# Rebuild and restart backend
cd /var/www/nexus/nexus-core && npm run build && pm2 restart nexus-core

# Rebuild and restart frontend
cd /var/www/nexus/nexus-frontend && npm run build && pm2 restart nexus-frontend

# Status
pm2 list
pm2 logs nexus-core --lines 50
pm2 logs nexus-frontend --lines 50
```

## Key Rules

- **nexus-core = SANCTUAIRE** — any modification requires explicit validation from the project owner
- No proprietary/centralized services, no Electron, no React
- New DB changes go through a new migration file in `src/migrations/` (increment number, e.g. `014_...sql`)
- Socket.IO must be attached after `server.listen()`, not before (Fastify v5 constraint)
- SSR in SvelteKit: never use `browser`-only APIs in `+page.server.ts` or `+layout.server.ts`; guard with `if (browser)` or dynamic imports in `.svelte` files

## Environment Variables

`.env` files are never committed. Reference `.env.example` in `nexus-core/`.

Key vars for nexus-core: `JWT_SECRET`, `DB_HOST/PORT/NAME/USER/PASSWORD`, `REDIS_HOST/PORT`, `FRONTEND_URL`, `NODE_ENV`, `NEXUS_COMMUNITY_NAME/SLUG/LANGUAGE`

Key vars for nexus-frontend: `PUBLIC_API_URL` (browser-facing API URL)

## Infrastructure (Production)

- VPS: Hetzner CPX42, Ubuntu 24.04, IP `46.225.20.193`
- Repo: `/var/www/nexus`
- PM2 ecosystem: `/var/www/nexus/ecosystem.config.js`
- Caddy config: `/etc/caddy/Caddyfile`
- SSL: Cloudflare Origin Certificate (`/etc/caddy/nexusnode.pem` + `.key`)
- PostgreSQL: DB `nexus`, user `nexus`, 13 migrations applied
