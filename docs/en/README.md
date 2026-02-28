# NEXUS

> *"The network is the people."*

**Nexus** is a decentralized, open source, free community communication platform.

It is the internet of the 2000s rebuilt with the tools of 2026.

---

## Why Nexus exists

Discord, Facebook, and Big Tech have locked millions of communities inside private silos.
Discussions, tutorials, collective knowledge — invisible to Google, inaccessible without an account, condemned to disappear the day the platform shuts down.

**Nexus fixes that.**

- Public forums **indexable by Google**
- Reactions, thanks, tags, full-text search
- Real-time community chat *(Phase 2)*
- Voice / screen sharing *(Phase 3)*
- **Self-hostable** on any server
- **P2P network** — users are the network
- **Open source** — AGPL-3.0

---

## One instance = one community

Nexus is not deployed as a multi-community platform.
**Each Nexus installation is a sovereign community**, configured via `.env`:

```env
NEXUS_COMMUNITY_NAME=Linux & Open Source
NEXUS_COMMUNITY_DESCRIPTION=The English-speaking free software community.
NEXUS_COMMUNITY_LANGUAGE=en
NEXUS_COMMUNITY_COUNTRY=US
NEXUS_COMMUNITY_SLUG=linux
```

Instances discover each other through the **nexus-directory** — the global registry *(Phase 2)*.

---

## Project status

**Phase 1 MVP — Complete**

```
Infrastructure              ✓  Fastify + PostgreSQL + Redis
Forum backend               ✓  25+ routes (auth, forum, grades, admin)
Instance = Community        ✓  NEXUS_COMMUNITY_NAME via .env
Infinite categories         ✓  parent_id recursive + PostgreSQL CTE
WYSIWYG editor              ✓  Tiptap (bold, code, tables, images, iframes)
Reactions & Thanks          ✓  6 emojis + Thanks button (+5 karma)
Thread tags                 ✓  admin-defined, colored pills
Full-text search            ✓  PostgreSQL tsvector/GIN, highlighted excerpts
Notifications               ✓  reply, thanks received, @mention + bell
Admin panel                 ✓  Dashboard, members, grades, moderation, tags
SEO                         ✓  Sitemap, RSS, robots.txt, JSON-LD, llms.txt
SvelteKit frontend          ✓  SSR + SEO, 20+ pages
Docker self-hosting         ✓  docker-compose.yml
Real-time chat              ○  Phase 2 (Socket.io)
Voice channels              ○  Phase 3 (WebRTC)
P2P network                 ○  Phase 3 (WireGuard mesh)
```

---

## Installation

### Option A — Docker (recommended)

The simplest method. Requires Docker Desktop or Docker Engine.

```bash
git clone https://github.com/Pokled/Nexus
cd Nexus/nexus-core
cp .env.example .env
# Edit .env with your community information
docker-compose up -d
```

The API starts on `http://localhost:3000`

---

### Option B — Windows Server without Docker (PowerShell Easy-Install)

A PowerShell script automates the full installation in under 15 minutes:
Node.js, PostgreSQL, Redis, database configuration, migrations, and registration as a Windows service.

```powershell
# Run PowerShell as Administrator, then:
.\scripts\Install-Nexus.ps1

# Or with a custom installation path:
.\scripts\Install-Nexus.ps1 -NexusPath "D:\Apps\Nexus"
```

The script automatically installs and configures:
- **Chocolatey** (Windows package manager)
- **Node.js LTS** + **PostgreSQL 16** + **Redis**
- **NSSM** to register Nexus as a Windows service (auto-start)
- Firewall rule for the API port

---

### Option C — Manual installation (Linux/Mac/Windows)

**Prerequisites:** Node.js 20+, PostgreSQL 16+, Redis 7+

```bash
git clone https://github.com/Pokled/Nexus
cd Nexus/nexus-core
npm install
cp .env.example .env
```

Edit `.env` with your values, then create the database:

```sql
-- As a PostgreSQL superuser
CREATE ROLE nexus_user LOGIN PASSWORD 'your_password';
CREATE DATABASE nexus OWNER nexus_user;
GRANT ALL PRIVILEGES ON DATABASE nexus TO nexus_user;
```

Apply migrations:

```bash
# Linux/Mac (peer auth or password)
PGPASSWORD=your_password psql -U nexus_user -d nexus -f src/migrations/001_initial.sql
# ... repeat for 002 to 013

# Windows
$env:PGPASSWORD="your_password"
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U nexus_user -d nexus -f src\migrations\001_initial.sql
# ... repeat for 002 to 013
```

Start:

```bash
npm run dev       # development (ts-node, port 3000)
npm run build     # TypeScript compilation
npm start         # production (node dist/)
```

---

## HTTPS reverse proxy — Caddy (recommended)

[Caddy](https://caddyserver.com) is a reverse proxy that automatically manages SSL certificates via Let's Encrypt. No manual SSL configuration.

```bash
# Install Caddy
choco install caddy       # Windows
apt install caddy         # Debian/Ubuntu
brew install caddy        # macOS

# Run with the example configuration (from repo root)
caddy run --config nexus-core/scripts/Caddyfile.example
```

An annotated example is available in [`nexus-core/scripts/Caddyfile.example`](../../nexus-core/scripts/Caddyfile.example).

---

## Environment variables

See [`nexus-core/.env.example`](../../nexus-core/.env.example) for the full annotated list.

| Variable | Required | Description |
|---|---|---|
| `NEXUS_COMMUNITY_NAME` | Yes | Community display name |
| `NEXUS_COMMUNITY_SLUG` | Yes | URL slug (lowercase letters, hyphens) |
| `NEXUS_COMMUNITY_LANGUAGE` | No | Language (default: `en`) |
| `JWT_SECRET` | Yes | JWT secret — **32+ random characters in production** |
| `DB_HOST` / `DB_PORT` / `DB_NAME` | Yes | PostgreSQL connection |
| `DB_USER` / `DB_PASSWORD` | Yes | PostgreSQL credentials |
| `REDIS_HOST` / `REDIS_PORT` | No | Redis (default: `localhost:6379`) |
| `PORT` | No | API port (default: `3000`) |
| `NODE_ENV` | No | `development` or `production` |

---

## Tech stack

| Layer | Technology |
|---|---|
| API | TypeScript + Fastify |
| Database | PostgreSQL 16 |
| Cache / Rate limiting | Redis 7 |
| Full-text search | PostgreSQL tsvector + GIN |
| Frontend | SvelteKit + Tailwind v4 |
| Editor | Tiptap (WYSIWYG) |
| Desktop | Tauri *(Phase 5)* |
| Mobile | Capacitor *(Phase 5)* |
| P2P network | WireGuard + DHT *(Phase 3)* |
| Local AI | Ollama *(Phase 4)* |

---

## Demo accounts

After `npm run seed`:

| Email | Password | Role |
|---|---|---|
| `bob@nexus.demo` | `demo1234` | member |
| `charlie@nexus.demo` | `demo1234` | owner (gaming) |

---

## Documentation

- [ROADMAP.md](./ROADMAP.md) — The path to the complete vision
- [ARCHITECTURE.md](./ARCHITECTURE.md) — How Nexus is built
- [CONTRIBUTING.md](./CONTRIBUTING.md) — How to contribute
- [MANIFESTO.md](./MANIFESTO.md) — The founding principles

---

## Contributing

Nexus belongs to its community. All contributions are welcome.

Read [CONTRIBUTING.md](./CONTRIBUTING.md) before you start.

```
nexus-plugins/    →  Create plugins
nexus-themes/     →  Create themes
i18n/             →  Translate into your language
nexus-docs/       →  Improve documentation
```

---

## License

AGPL-3.0 — The code belongs to its community.

If Nexus betrays its principles, the Manifesto explicitly authorizes
anyone to fork the project and continue.

---

## Official supervisor

**Iris** — Approves every commit since February 18, 2026. 🐱

---

*Born February 18, 2026 at 11:37 PM.*
*"Fork us if we betray you."*
