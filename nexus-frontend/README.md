# nexus-frontend

The SvelteKit frontend for [Nexus](../README.md) — the self-hosted community platform.

Handles all UI: forum, real-time chat, voice channels, admin panel, profiles, notifications, and instance directory.

---

## Stack

| | |
|---|---|
| Framework | SvelteKit 5 |
| Styling | Tailwind CSS v4 |
| Editor | TipTap (WYSIWYG) |
| Real-time | Socket.IO client |
| Voice | WebRTC + AudioContext chain |
| Build | `adapter-node` (production server) |

---

## Requirements

- Node.js 20+
- `nexus-core` API running on port `3000`

---

## Development

```bash
npm install
npm run dev       # Vite dev server on port 5173
```

> **Note:** In production the frontend runs as a compiled Node.js server (not Vite dev).
> Hot-reload via Caddy proxy requires the `adapter-node` build — see below.

---

## Production build

```bash
npm run build          # outputs to build/
node build/index.js    # start production server
```

Environment variables expected at runtime:

```env
PORT=5173
ORIGIN=https://your-domain.com
```

With PM2:
```bash
pm2 start ecosystem.config.js    # see root ecosystem.config.js
pm2 restart nexus-frontend       # after every build
```

---

## Key files

| File | Description |
|---|---|
| `src/routes/chat/+page.svelte` | Chat page — text + voice channels, typing, reactions, mentions |
| `src/routes/forum/` | Forum routes — category list, thread list, thread view |
| `src/lib/components/VoicePanel.svelte` | Floating voice bar — mute/deafen/PTT, P2P stats, speaking animations |
| `src/lib/components/VoiceSettings.svelte` | Audio settings — gain, noise filter, RNNoise, EQ |
| `src/lib/voice.ts` | WebRTC engine — peer connections, ICE, AudioContext chain |
| `src/lib/voiceSettings.ts` | Persisted audio settings store (localStorage) |

---

## Part of the Nexus monorepo

```
Nexus/
├── nexus-core/        ← Fastify API (backend)
├── nexus-frontend/    ← SvelteKit app (this folder)
├── turn-server/       ← Self-hosted TURN relay (WebRTC)
├── docs/              ← Documentation + screenshots
└── docker-compose.yml
```

→ See the [main README](../README.md) for full setup and architecture.
