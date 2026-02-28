# NEXUS — Architecture
### Version 1.0 — Technical reference document

---

> This document is the technical law of Nexus.
> No architectural decision may be changed without project lead validation.
> Read this document before any implementation.

---

## 1. OVERVIEW

```
CLIENT
SvelteKit PWA / Tauri / Capacitor
        |
        | HTTP / WebSocket
        |
NEXUS CORE API
Fastify + TypeScript
/api/v1/...   +   Socket.io (real-time)
        |               |               |
   PostgreSQL        Redis         Meilisearch
   Persistent      Cache/PubSub    Search
   data                             SEO
```

---

## 2. API ROUTE STRUCTURE

All routes start with `/api/v1/`

```
/api/v1/
├── health                  GET  — Infrastructure status
├── auth/
│   ├── register            POST — Account creation
│   ├── login               POST — Login
│   └── logout              POST — Logout
├── communities/
│   ├── /                   GET  — List communities
│   ├── /                   POST — Create a community
│   ├── /:slug              GET  — One community
│   └── /:slug/members      GET  — Members
├── forums/
│   ├── /:community         GET  — Forum categories
│   ├── /categories         POST — Create a category
│   ├── /threads            GET  — Thread list
│   ├── /threads            POST — Create a thread
│   ├── /threads/:id        GET  — One thread + posts
│   └── /posts              POST — Create a post
├── users/
│   ├── /:id                GET  — Public profile
│   └── /me                 GET  — My profile
└── search/
    └── /                   GET  — Global search
```

---

## 3. POSTGRESQL DATA MODEL

### Main tables

```sql
-- Users
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

-- Communities
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

-- Forum categories
categories (
  id           UUID PRIMARY KEY,
  community_id UUID references communities(id),
  name         VARCHAR(100),
  description  TEXT,
  position     INTEGER,
  created_at   TIMESTAMP,
  updated_at   TIMESTAMP
)

-- Threads (topics)
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

-- Posts (replies)
posts (
  id          UUID PRIMARY KEY,
  thread_id   UUID references threads(id),
  author_id   UUID references users(id),
  content     TEXT,
  is_edited   BOOLEAN DEFAULT false,
  created_at  TIMESTAMP,
  updated_at  TIMESTAMP
)

-- Community members
community_members (
  community_id UUID references communities(id),
  user_id      UUID references users(id),
  role         VARCHAR(20),
  joined_at    TIMESTAMP
)
```

### Relationships
```
users ----------< community_members >---------- communities
communities ----< categories
categories -----< threads
threads --------< posts
users ----------< posts
users ----------< threads
```

---

## 4. REDIS — USAGE

```
User sessions           nexus:session:{token}       TTL 7 days
Profile cache           nexus:user:{id}              TTL 1 hour
Thread cache            nexus:thread:{id}            TTL 5 minutes
Chat Pub/Sub            nexus:chat:{community_id}    Real-time
Notification Pub/Sub    nexus:notif:{user_id}        Real-time
Rate limiting           nexus:rate:{ip}              TTL 1 minute
```

---

## 5. PLUGIN ARCHITECTURE

Plugins extend Nexus without modifying the core.

```
nexus-plugins/
└── my-plugin/
    ├── plugin.json      — Plugin manifest
    ├── index.ts         — Entry point
    ├── routes/          — Additional API routes
    ├── migrations/      — Additional PostgreSQL tables
    └── ui/              — Additional SvelteKit components
```

### plugin.json
```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "author": "Contributor",
  "nexusVersion": ">=1.0.0",
  "hooks": ["onPostCreate", "onUserJoin"],
  "routes": "/api/v1/plugins/my-plugin"
}
```

### Available hooks
```
onUserRegister      — After account creation
onUserJoin          — After joining a community
onThreadCreate      — After thread creation
onPostCreate        — After post creation
onCommunityCreate   — After community creation
```

---

## 6. SECURITY

```
Authentication    Signed JWT + refresh token in Redis
Passwords         bcrypt (cost factor 12)
Rate limiting     Redis — 100 req/min per IP
Validation        Zod on all inputs
CORS              Configurable per instance
Headers           Helmet.js (XSS, CSP, HSTS)
```

---

## 7. SOURCE FILE STRUCTURE

```
nexus-core/src/
├── index.ts                — Server entry point
├── fortunes.ts             — Random quotes
├── config/
│   └── database.ts         — PostgreSQL + Redis connections
├── routes/
│   ├── auth.ts             — Authentication
│   ├── communities.ts      — Communities
│   ├── forums.ts           — Forum + threads + posts
│   ├── users.ts            — Profiles
│   └── search.ts           — Search
├── models/
│   ├── user.ts             — User model
│   ├── community.ts        — Community model
│   ├── thread.ts           — Thread model
│   └── post.ts             — Post model
├── middleware/
│   ├── auth.ts             — JWT verification
│   ├── rateLimit.ts        — Redis rate limiting
│   └── validate.ts         — Zod validation
├── migrations/
│   └── 001_initial.sql     — Initial schema
└── plugins/
    └── loader.ts           — Plugin loader
```

---

## 8. RULES

1. Always create SQL migrations before TypeScript code
2. Always validate inputs with Zod
3. Always go through models, never direct SQL in routes
4. Always commit after each created file
5. Never put business logic in index.ts
6. One route file = one functional domain
7. All routes return JSON
8. Errors always follow the format: `{ error: string, code: string }`

---

*Version 1.0 — February 2026*
*"The network is the people."*
