# Nodyx Signet

> Passwordless authentication PWA for [Nodyx](../README.md) instances.

Nodyx Signet is a Progressive Web App (PWA) that acts as a hardware security key for your browser. It generates an **ECDSA P-256 keypair** per device, stores it encrypted (AES-GCM) in IndexedDB, and signs login challenges from any Nodyx instance — no password ever leaves your device.

Live at **[signet.nexusnode.app](https://signet.nexusnode.app)**

---

## How it works

```
1. Admin generates an enrollment token in Settings → Nodyx Signet
2. Admin shares a QR code (or link) with the user
3. User opens signet.nexusnode.app, scans the QR → lands on setup
4. User chooses a passphrase (encrypts the private key locally)
5. Keypair generated: public key sent to Hub, private key stays on device

Login flow:
6. User clicks "Connexion sans mot de passe" on the Nodyx login page
7. Hub creates a challenge (random bytes + TTL)
8. User opens Signet → sees pending challenge → enters passphrase
9. Signet decrypts private key → signs challenge → sends signature to Hub
10. Hub verifies signature against stored public key → issues JWT session
```

---

## Stack

| | |
|---|---|
| Framework | SvelteKit 5 |
| Crypto | Web Crypto API — ECDSA P-256 + AES-GCM |
| Storage | IndexedDB (via `idb`) |
| PWA | Service Worker + Web App Manifest |
| Styling | Tailwind CSS v4 |

---

## Crypto model

- **Keypair**: ECDSA P-256 (browser-native `crypto.subtle.generateKey`)
- **Private key encryption**: AES-GCM 256-bit, key derived from passphrase via PBKDF2 (SHA-256, 100k iterations)
- **Challenge signature**: SHA-256 digest, ECDSA signature returned as base64
- **Storage**: everything stays in IndexedDB on the device — the server never sees the private key

---

## Routes

| Route | Description |
|---|---|
| `/` | Splash — redirects to `/setup` (no device) or checks pending challenges |
| `/setup` | Enrollment — enter Hub URL + token, choose passphrase, generate keypair |
| `/keys` | Device list — all registered devices, revoke, check pending challenges |
| `/approve` | Challenge approval screen — enter passphrase, sign, send to Hub |

---

## QR enrollment flow

The Nodyx settings page generates a QR code encoding:

```
https://signet.nexusnode.app/setup?hub=https://your-instance.com&token=xxxx
```

Scanning from mobile opens Signet directly on the passphrase step — no manual URL or token entry.

---

## Development

```bash
cd nodyx-authenticator
npm install
npm run dev       # port 5174
```

Requires a running `nodyx-core` instance with `SIGNET_URL=https://signet.nexusnode.app` set in `.env` (or `http://localhost:5174` for local dev).

---

## Production

```bash
npm run build
node build/index.js
```

Hosted separately from the main Nodyx instance — `signet.nexusnode.app` is the official shared instance. Each Nodyx community can optionally self-host their own Signet.

---

## API endpoints used (nodyx-core `/api/auth/`)

> Note: authenticator routes are under `/api/auth/` — **not** `/api/v1/auth/`.

| Endpoint | Description |
|---|---|
| `GET /api/auth/hub-info` | Fetch Hub name + check Signet support |
| `POST /api/auth/devices` | Enroll a new device (submit public key) |
| `GET /api/auth/challenges/pending` | Poll for pending login challenges |
| `POST /api/auth/challenges/:id/approve` | Submit signed challenge |
| `POST /api/auth/challenges/:id/reject` | Reject a challenge |
| `DELETE /api/auth/devices/:id` | Revoke a device |

---

## Part of the Nodyx monorepo

```
Nodyx/
├── nodyx-core/           ← Fastify API (backend)
├── nodyx-frontend/       ← SvelteKit community app
├── nodyx-authenticator/  ← Nodyx Signet PWA (this folder)
├── nodyx-relay/          ← Rust P2P TCP tunnel
├── nodyx-turn/           ← Rust STUN/TURN server
└── docs/
```

→ See the [main README](../README.md) for full architecture and setup.
