# nodyx-frontend

The SvelteKit 5 frontend for [Nodyx](../README.md) — the self-hosted community platform.

Handles all UI: forum, real-time chat, voice channels, direct messages, calendar, notifications, admin panel, profiles, asset library, and instance directory.

---

## Stack

| | |
|---|---|
| Framework | SvelteKit 5 |
| Styling | Tailwind CSS v4 |
| Editor | TipTap (WYSIWYG — forums, calendar events) |
| Real-time | Socket.IO client |
| Voice | WebRTC + AudioContext chain |
| P2P | DataChannels mesh (typing, reactions, canvas, jukebox) |
| Build | `adapter-node` (production Node.js server) |

---

## Requirements

- Node.js 20+
- `nodyx-core` API running on port `3000`

---

## Development

```bash
cd nodyx-frontend
npm install
npm run dev       # Vite dev server on port 5173
npm run check     # svelte-check (type checking)
```

---

## Production build

```bash
npm run build          # outputs to build/
node build/index.js    # start production server (port 4173)
```

Environment variables expected at runtime:

```env
PORT=4173
ORIGIN=https://your-domain.com
PUBLIC_API_URL=https://your-domain.com
PUBLIC_SIGNET_URL=https://signet.nodyx.org
```

With PM2:
```bash
pm2 start ecosystem.config.js    # see root ecosystem.config.js
pm2 restart nodyx-frontend       # after every build
```

---

## Key pages

| Route | Description |
|---|---|
| `/` | Community home — activity feed, announcements |
| `/forum/` | Forum — category list |
| `/forum/[category]/` | Thread list |
| `/forum/[category]/[thread]/` | Thread view — posts, reactions, thanks, polls |
| `/chat` | Real-time chat — text + voice channels |
| `/dm/` | Direct messages — conversation list |
| `/dm/[id]` | DM conversation |
| `/notifications` | Notification center (read, clear, auto-purge 30d) |
| `/calendar` | Event calendar — list view |
| `/calendar/new` | Create an event |
| `/calendar/[id]` | Event detail — RSVP, OSM map |
| `/calendar/[id]/edit` | Edit event |
| `/discover` | Cross-instance global search |
| `/library` | Asset library — frames, banners, badges, stickers, sounds |
| `/library/[id]` | Asset detail — equip, download, P2P transfer |
| `/garden` | Community feature voting — organic growth stages |
| `/polls` | Poll management |
| `/whisper/[id]` | Ephemeral 1h chat room |
| `/users/[username]` | Public profile — theme, assets, stats |
| `/users/me/edit` | Profile editor — avatar, banner, theme, font |
| `/settings` | User settings — linked instances, Nodyx Signet devices |
| `/admin/` | Admin panel — dashboard, members, grades, bans, moderation |
| `/communities` | Instance directory — Galaxy Bar management |
| `/banned` | Ban landing page |

---

## Key lib files

| File | Description |
|---|---|
| `src/lib/api.ts` | `apiFetch` wrapper — SSR-safe, browser uses `PUBLIC_API_URL` |
| `src/lib/socket.ts` | Socket.IO client — stores: `socket`, `tokenStore`, `onlineMembersStore`, `unreadCountStore`, `dmUnreadStore` |
| `src/lib/voice.ts` | WebRTC engine — peer connections, ICE, AudioContext chain |
| `src/lib/voiceSettings.ts` | Persisted audio settings (localStorage) |
| `src/lib/p2p.ts` | WebRTC DataChannels mesh — typing, reactions, assets |
| `src/lib/canvas.ts` | NodyxCanvas — CRDT LWW state, P2P sync |
| `src/lib/jukebox.ts` | P2P collaborative Jukebox — YouTube queue, votes |
| `src/lib/linkify.ts` | `linkifyHtml()` + `linkifyText()` — link previews in chat |

---

## Part of the Nodyx monorepo

```
Nodyx/
├── nodyx-core/           ← Fastify API (backend)
├── nodyx-frontend/       ← SvelteKit app (this folder)
├── nodyx-authenticator/  ← Nodyx Signet PWA (passwordless login)
├── nodyx-relay/          ← Rust P2P TCP tunnel (home servers)
├── nodyx-turn/           ← Rust STUN/TURN server
└── docs/
```

→ See the [main README](../README.md) for full setup and architecture.
