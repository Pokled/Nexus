# ⚡ Nexus Relay — Install without a domain or open ports

> **The problem:** You want to host Nexus at home — on a Raspberry Pi, an old PC, your home router setup — but you don't have a domain, and your ISP blocks incoming ports.
>
> **The solution:** Nexus Relay. A 9 MB Rust binary that establishes an **outbound** connection to our infrastructure, making your instance accessible at `your-slug.nexusnode.app` — with zero configuration.

---

## Table of Contents

- [How it works](#-how-it-works)
- [Requirements](#-requirements)
- [Installation](#-installation)
- [Comparison with other methods](#-comparison-with-other-methods)
- [Checking that the tunnel is active](#-checking-that-the-tunnel-is-active)
- [Troubleshooting](#-troubleshooting)
- [FAQ](#-faq)
- [For the curious — Technical architecture](#-for-the-curious--technical-architecture)

---

## 🔌 How it works

```
                    Your machine (at home)
                    ┌────────────────────────────────┐
                    │  nexus-core (port 3000)        │
                    │  nexus-frontend (port 4173)    │
                    │  Caddy (port 80, local)        │
                    │                                │
                    │  nexus-relay-client  ──────────┼──── outbound TCP connection ───►
                    └────────────────────────────────┘                                │
                                                                                      │
                                                               relay.nexusnode.app:7443
                                                               ┌────────────────────────────┐
                                                               │  nexus-relay-server        │
                                                               │                            │
                    ◄─────── HTTPS via Caddy ────────────────  │  *.nexusnode.app → :7001   │
                    Browser → your-slug.nexusnode.app           └────────────────────────────┘
```

1. **You run `bash install.sh`** and choose option `[2] Nexus Relay`
2. **`nexus-relay-client`** starts as a systemd service on your machine
3. It establishes an **outbound TCP connection** (port 7443) to `relay.nexusnode.app` — just like opening a website, not like opening a port
4. When someone visits `your-slug.nexusnode.app`, the HTTPS request arrives at our VPS, the relay server routes it through the tunnel, and your machine responds
5. **Your machine has no open ports.** Your router has nothing to forward. Your ISP only sees outbound traffic.

---

## 📋 Requirements

| Element | Required? | Notes |
|---|---|---|
| Personal domain | ❌ No | The relay provides `your-slug.nexusnode.app` for free |
| Open ports 80/443 | ❌ No | The relay only uses **outbound** traffic |
| Cloudflare account | ❌ No | Complete independence |
| Internet connection | ✅ Yes | Any connection works (fiber, 4G, satellite) |
| 64-bit Linux OS | ✅ Yes | Ubuntu 22.04/24.04, Debian 11/12, Raspberry Pi OS 64-bit |
| Architecture | ✅ `x86_64` or `aarch64` | PC/VPS or Raspberry Pi 3/4/5 |

> 💡 **Raspberry Pi 4, 8 GB RAM, Ubuntu Server 24.04 (arm64):** tested and validated in real-world conditions — March 1, 2026.

---

## 🚀 Installation

### Method 1 — Interactive installer (recommended)

```bash
git clone https://github.com/Pokled/Nexus.git && cd Nexus && sudo bash install.sh
```

When the installer asks for the network mode, choose **`2`**:

```
  Network connection mode
  ┌─ [1] Personal domain  — ports 80/443 open required
  ├─ [2] Nexus Relay       — recommended — no ports, no domain (RPi, home box, ...)
  └─ [3] sslip.io auto     — free automatic domain, open ports required

  ? Choice [1/2/3] (default: 2 — Nexus Relay):
```

**The installer handles everything:**
- Downloads the `nexus-relay` binary (amd64 or arm64 auto-detected)
- Registers your slug with the nexusnode.app directory
- Creates and starts the `nexus-relay-client` systemd service
- Configures Caddy in local HTTP mode (no ports to open)

**Result:** `your-slug.nexusnode.app` live in ~5 minutes.

---

### Method 2 — Binary only (existing installation)

If you already have a Nexus instance and just want to add the relay:

```bash
# 1. Download the binary
ARCH=$(uname -m | sed 's/x86_64/amd64/;s/aarch64/arm64/')
sudo curl -L "https://github.com/Pokled/Nexus/releases/download/v0.1.0-relay/nexus-relay-linux-${ARCH}" \
  -o /usr/local/bin/nexus-relay
sudo chmod +x /usr/local/bin/nexus-relay

# 2. Verify
nexus-relay --version

# 3. Create the service (replace YOUR_SLUG and YOUR_TOKEN with your real values)
sudo tee /etc/systemd/system/nexus-relay-client.service > /dev/null <<EOF
[Unit]
Description=Nexus Relay Client
After=network.target

[Service]
ExecStart=/usr/local/bin/nexus-relay client \
  --server relay.nexusnode.app:7443 \
  --slug YOUR_SLUG \
  --token YOUR_TOKEN \
  --local-port 80
Restart=on-failure
RestartSec=5s
User=root

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable --now nexus-relay-client
```

> 💡 Your token is available in `/root/nexus-credentials.txt` if you used `install.sh`, or in the JSON response from the nexusnode.app registration API.

---

## ⚖️ Comparison with other methods

| Method | Domain required | Ports to open | Third-party account | Dependency |
|---|---|---|---|---|
| **Nexus Relay** ⭐ | ❌ No | ❌ No | ❌ No | Our infrastructure only |
| VPS + own domain | ✅ Yes (~€1/year) | ✅ 80, 443 | ❌ No | None |
| sslip.io auto | ❌ No | ✅ 80, 443 | ❌ No | None |
| Cloudflare Tunnel | ✅ Yes (CF domain) | ❌ No | ✅ Cloudflare | Cloudflare |
| Tailscale + Funnel | ❌ No | ❌ No | ✅ Tailscale | Tailscale |
| Ngrok | ❌ No | ❌ No | ✅ Ngrok | Ngrok |

> **Nexus philosophy:** The relay is open source, self-hosted on our own VPS, and can be replaced by a community relay. Zero dependency on a third-party company.

---

## 🔍 Checking that the tunnel is active

```bash
# Service status
sudo systemctl status nexus-relay-client

# Live logs
sudo journalctl -u nexus-relay-client -f

# What you should see in the logs:
# → Connected to relay.nexusnode.app:7443
# → Registered as slug "your-slug" — OK
# → Forwarding GET / → HTTP 200
```

**From the outside:**

```bash
curl -I https://your-slug.nexusnode.app/
# HTTP/2 200
```

---

## 🔧 Troubleshooting

### The service won't start

```bash
sudo journalctl -u nexus-relay-client --no-pager -n 50
```

| Error | Cause | Solution |
|---|---|---|
| `Connection refused` | relay.nexusnode.app unreachable | Check your Internet connection |
| `Registration rejected: Invalid slug or token` | Incorrect token | Check `/root/nexus-credentials.txt` |
| `Binary not found` | Binary not installed | Reinstall with `install.sh` or Method 2 |
| `Address already in use` (port 80) | Another service listening on :80 | `sudo ss -tlnp \| grep :80` |

### Reconnection not working

The relay client reconnects automatically with exponential backoff (1s → 2s → 4s → max 30s). If the connection drops (Internet outage, relay server restart), it picks back up on its own. You don't need to do anything.

### My instance is not accessible from the Internet

1. Check the service is running: `systemctl is-active nexus-relay-client`
2. Check Caddy is running: `systemctl is-active caddy`
3. Check nexus-core is running: `pm2 status nexus-core`
4. Test locally: `curl http://localhost/api/v1/instance/info`

### Restart manually

```bash
sudo systemctl restart nexus-relay-client
```

---

## ❓ FAQ

**Q: Does my data transit through your server?**

Yes, HTTP requests transit through `relay.nexusnode.app`. But the content remains TLS-encrypted end-to-end (HTTPS between the browser and our Caddy server). We do not store request content. Your community's data (posts, messages, files) stays **exclusively on your machine**.

**Q: What happens if nexusnode.app is unavailable?**

Your local instance continues to work normally. Only access from the Internet via `your-slug.nexusnode.app` is interrupted. If you have your own domain, you can switch to it at any time.

**Q: Do voice channels work in Relay mode?**

Voice channels use WebRTC, which requires a TURN server to traverse NAT. In Relay mode, coturn is not installed (the required UDP ports are not open). Voice calls between members on the same local network will work. For cross-network calls, an external TURN server is needed — this is what **Phase 3.0-B (nexus-turn)** will solve in an integrated way.

**Q: Is the relay free?**

Yes, without limits during the beta period. We reserve the right to introduce reasonable limits if usage becomes excessive (bandwidth > several TB/month per instance, for example). The relay is open source — you can host your own.

**Q: How do I change my slug?**

The slug is registered at installation time. To change it, contact nexusnode.app support or delete and re-register your instance.

**Q: Does the relay work with Docker?**

Yes. The `nexus-relay client` binary can run outside the Docker container — just point `--local-port` to the port exposed by your container (default 80).

---

## 🏗️ For the curious — Technical architecture

### The relay server (nexusnode.app)

```
Port 7443 (public TCP)
└── Accepts connections from relay clients
    └── Authenticates via token (directory_instances table in PostgreSQL)
    └── Registers slug → TunnelHandle (DashMap in memory)

Port 7001 (HTTP, local only — receives requests from Caddy)
└── Extracts slug from Host header
    ├── Slug with active tunnel → forward through TCP tunnel
    ├── Slug in DB with URL → 302 redirect
    └── Unknown slug → 404
```

### The relay client (your machine)

```
nexus-relay client
└── TCP connection to relay.nexusnode.app:7443
    └── Sends: Register { slug, token }
    └── Receives: ServerMessage::Request { id, method, path, headers, body_b64 }
        └── Executes: reqwest → http://127.0.0.1:80{path}
        └── Sends: ClientMessage::Response { id, status, headers, body_b64 }
    └── Automatic reconnection if disconnected
```

### Transport protocol

JSON messages framed with a 4-byte big-endian length prefix:

```
[ 4 bytes: length (big-endian u32) ][ JSON payload ]
```

Maximum frame size: 16 MB.

### Repository

The `nexus-relay` source code is in the same repository as Nexus:

```
nexus-p2p/
└── crates/
    └── nexus-relay/
        └── src/
            ├── main.rs          — CLI (clap)
            ├── protocol.rs      — types + framing
            ├── server/          — relay server (VPS)
            └── client/          — relay client (your machine)
```

---

*Version 1.0 — March 1, 2026*
*Validated on Raspberry Pi 4 (arm64), Ubuntu Server 24.04, no open ports.*
