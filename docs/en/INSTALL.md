# 🚀 Nexus — Complete Installation Guide

> **TL;DR:** Copy your repo to a Linux server, run `bash install.sh`, answer 5 questions. Done. ☕

---

## Table of Contents

- [Before You Start](#-before-you-start)
- [Where to Host?](#-where-to-host)
- [Do I Need a Domain Name?](#-do-i-need-a-domain-name)
- [Which Ports to Open?](#-which-ports-to-open)
- [Installation — The Easy Way](#-installation--the-easy-way-recommended)
- [Windows Users — WSL Guide](#-windows-users--wsl-guide)
- [Home Server / Behind NAT](#-home-server--behind-nat)
- [Behind a VPN or WireGuard](#-behind-a-vpn-or-wireguard)
- [Common Errors & Fixes](#-common-errors--fixes)
- [After Installation](#-after-installation)
- [Tips & Tricks](#-tips--tricks)

---

## 📋 Before You Start

### Minimum Hardware Requirements

| Component | Minimum | Recommended |
|---|---|---|
| CPU | 1 vCPU / 1 core | 2 vCPU or more |
| RAM | 1 GB | 2 GB or more |
| Disk | 10 GB SSD | 20 GB SSD |
| Bandwidth | 10 Mbps | 100 Mbps |
| OS | Ubuntu 22.04 | Ubuntu 24.04 LTS |

> 💡 **Real-world sizing:** A community of 50 active users runs comfortably on a €4/month VPS (Hetzner CX22, 2 vCPU / 4 GB RAM). Voice channels are P2P — they don't consume server bandwidth.

### Supported Operating Systems

| OS | Support | Notes |
|---|---|---|
| Ubuntu 24.04 LTS | ✅ Recommended | Best tested |
| Ubuntu 22.04 LTS | ✅ Supported | Works perfectly |
| Debian 12 (Bookworm) | ✅ Supported | Fully compatible |
| Debian 11 (Bullseye) | ✅ Supported | Compatible |
| Windows (WSL2) | ✅ Supported | [See WSL section](#-windows-users--wsl-guide) |
| macOS | ⚠️ Manual only | install.sh is Linux-only |
| CentOS / RHEL / Fedora | ❌ Not supported | Use Docker instead |
| Raspberry Pi OS | ✅ Supported | Use 64-bit version |

### What `install.sh` Installs Automatically

You don't need to install anything manually. The script handles:

- **Node.js 20 LTS** — JavaScript runtime
- **PostgreSQL 16** — Main database
- **Redis 7** — Cache & real-time sessions
- **Coturn** — TURN/STUN relay for voice channels (WebRTC NAT traversal)
- **Caddy** — Reverse proxy + automatic HTTPS (Let's Encrypt)
- **PM2** — Process manager (auto-restart, boot startup)

---

## 🖥️ Where to Host?

### Option 1 — VPS (Recommended for beginners)

A VPS (Virtual Private Server) is a remote Linux machine you rent by the month. It's always online, has a fixed IP, and you can SSH into it from anywhere.

**Recommended providers:**

| Provider | Entry plan | Monthly price | Notes |
|---|---|---|---|
| [Hetzner Cloud](https://hetzner.com/cloud) | CX22 (2 vCPU, 4 GB) | ~€3.5 | Best value in Europe |
| [DigitalOcean](https://digitalocean.com) | Basic (1 vCPU, 1 GB) | $6 | Beginner-friendly panel |
| [Vultr](https://vultr.com) | Cloud Compute 1 vCPU | $6 | Good global coverage |
| [OVH](https://ovh.com) | VPS Starter | ~€3 | French provider |

> 💡 **Tip:** Always choose a VPS located close to your users (Europe → Frankfurt or Paris, North America → New York or Dallas).

**How to create a VPS (example with Hetzner):**
1. Create an account on hetzner.com
2. Go to **Cloud → Projects → New Project**
3. Click **Add Server**
4. Choose: Location (e.g., Nuremberg), Image = **Ubuntu 24.04**, Type = **CX22**
5. Add your SSH public key (recommended) or set a root password
6. Click **Create & Buy**
7. Your server IP appears in the dashboard within 30 seconds

**Connect to your VPS:**
```bash
ssh root@YOUR_VPS_IP
```

---

### Option 2 — Home Server

A spare PC, an old laptop, or a Raspberry Pi plugged in at home. Works great, but requires:
- A static IP **or** a DDNS service (see [Home Server section](#-home-server--behind-nat))
- Port forwarding on your router
- Your machine needs to stay on 24/7

> ⚠️ **Warning:** Many ISPs block incoming port 80/443. Check with your ISP before investing time. Some ISPs (especially fiber) can provide a fixed IP for a small fee.

---

### Option 3 — Windows with WSL (Testing / Development)

You can run Nexus on Windows 10/11 using WSL2 (Windows Subsystem for Linux). This is great for testing or developing, but not ideal for a 24/7 production server.

→ [See the detailed WSL guide below](#-windows-users--wsl-guide)

---

## 🌐 Do I Need a Domain Name?

**Short answer: Yes, for production. No, for local testing.**

A domain name like `mycommunity.com` is what your users will type in their browser. Without one:
- You can only access Nexus via IP address (e.g., `http://46.225.20.193`)
- You won't get automatic HTTPS (Caddy needs a domain for Let's Encrypt)
- Your forum won't be indexed by Google

**Recommended domain registrars:**

| Registrar | Price/year | Notes |
|---|---|---|
| [Namecheap](https://namecheap.com) | ~$10 | Great UI, free WHOIS privacy |
| [Cloudflare Registrar](https://cloudflare.com/registrar) | At cost (~$8) | No markup, free DNS |
| [Gandi](https://gandi.net) | ~$15 | French provider, ethical |
| [OVH](https://ovh.com) | ~$7 | French provider |

**DNS setup (point your domain to your server):**

Once you have a domain, add an **A record** in your DNS panel:

```
Type  Name    Value           TTL
A     @       YOUR_SERVER_IP  300
A     www     YOUR_SERVER_IP  300
```

> 💡 **Cloudflare tip:** If you use Cloudflare as your DNS provider, you can enable the orange cloud (proxy) for HTTP/HTTPS — it gives you DDoS protection for free. **However, disable the proxy (grey cloud) for any TURN subdomain** — voice channels won't work through Cloudflare's proxy.

---

## 🔌 Which Ports to Open?

The `install.sh` script configures the firewall (UFW) automatically. Here's what it opens:

| Port | Protocol | Service | Required? |
|---|---|---|---|
| 22 | TCP | SSH | ✅ Yes (to manage your server) |
| 80 | TCP | HTTP | ✅ Yes (Let's Encrypt challenge) |
| 443 | TCP | HTTPS | ✅ Yes (your website) |
| 3478 | TCP + UDP | TURN/STUN (voice relay) | ✅ Yes (voice channels) |
| 5349 | TCP + UDP | TURN/STUN over TLS | ⚠️ Optional |
| 49152–65535 | UDP | WebRTC media relay | ✅ Yes (voice channels) |

> ❓ **What is a TURN relay?** When two users want to speak in a voice channel, they need a direct connection (P2P). If one of them is behind a NAT (like a 4G connection or a corporate network), the connection can't be established directly. The TURN relay acts as an intermediary — the voice goes through your server instead. This is only used as a fallback when P2P fails.

---

## 🚀 Installation — The Easy Way (Recommended)

### Step 1 — Clone the repository

On your Linux server (via SSH):

```bash
git clone https://github.com/Pokled/Nexus.git /opt/nexus-install
cd /opt/nexus-install
```

Or download just the install script:

```bash
curl -fsSL https://raw.githubusercontent.com/Pokled/Nexus/main/install.sh -o install.sh
```

### Step 2 — Run the installer

```bash
sudo bash install.sh
```

> 🔐 The script must run as root (or with sudo). It installs system packages, configures the firewall, and sets up services.

### Step 3 — Answer 5 questions

The installer will ask you:

```
? Domain name (e.g. mycommunity.com): mycommunity.com
? Community name (e.g. Linux France): My Awesome Community
? Unique community slug: my-awesome-community
? Primary language (fr/en/de/es/it/pt): en
? Admin username: alice
? Admin email: alice@example.com
? Admin password: ••••••••
```

That's it. The script handles everything else automatically (≈ 3–10 minutes depending on your server speed).

### Step 4 — Wait and enjoy ☕

The installer will show you a summary at the end:

```
╔══════════════════════════════════════════════════╗
║       ✔  Nexus installed successfully!           ║
╚══════════════════════════════════════════════════╝

  Instance : https://mycommunity.com
  Admin    : alice / alice@example.com
  Voice    : TURN relay on 46.225.20.193:3478

  Credentials saved in: /root/nexus-credentials.txt
```

> 💡 **DNS takes time.** After pointing your domain to your server IP, it can take up to 24–48 hours for DNS to propagate worldwide (usually 5–30 minutes in practice). Caddy will automatically obtain your SSL certificate once DNS resolves.

---

## 🪟 Windows Users — WSL Guide

WSL (Windows Subsystem for Linux) lets you run Ubuntu directly inside Windows. Nexus's `install.sh` runs perfectly inside WSL2.

### Step 1 — Enable WSL2

Open **PowerShell as Administrator** and run:

```powershell
wsl --install
```

This installs WSL2 and Ubuntu automatically. **Restart your PC** when prompted.

> 💡 If WSL is already installed, update it: `wsl --update`

### Step 2 — Open Ubuntu

After restarting, search for **"Ubuntu"** in the Start menu and open it. The first time, it will ask you to create a username and password for Linux.

### Step 3 — Update Ubuntu

```bash
sudo apt update && sudo apt upgrade -y
```

### Step 4 — Install Git (if needed)

```bash
sudo apt install -y git
```

### Step 5 — Clone Nexus

```bash
git clone https://github.com/Pokled/Nexus.git
cd Nexus
```

### Step 6 — Run the installer

```bash
sudo bash install.sh
```

> ⚠️ **WSL limitation:** Services started inside WSL don't automatically restart with Windows. For a 24/7 server, use a real Linux VPS or server. WSL is great for testing and development.

> 💡 **Access from your Windows browser:** Once the install is done, open your browser and go to `http://localhost` — Nexus will be there.

### Tips specific to WSL

- **File access:** Your Windows files are at `/mnt/c/Users/YourName/` inside WSL
- **WSL terminal shortcut:** In any Windows folder, type `wsl` in the address bar
- **VS Code integration:** Install the "WSL" extension for VS Code to edit files directly
- **Port forwarding:** If you want to expose WSL to your local network, you need to forward ports manually:
  ```powershell
  # Run as Administrator in PowerShell
  netsh interface portproxy add v4tov4 listenport=80 listenaddress=0.0.0.0 connectport=80 connectaddress=$(wsl hostname -I)
  netsh interface portproxy add v4tov4 listenport=443 listenaddress=0.0.0.0 connectport=443 connectaddress=$(wsl hostname -I)
  ```

---

## 🏠 Home Server / Behind NAT

Running Nexus on a machine at home (behind your router) requires a few extra steps.

### Step 1 — Find your public IP

Go to [whatismyip.com](https://whatismyip.com) — this is the IP the outside world sees.

> ⚠️ **Problem:** Most home ISPs assign **dynamic IPs** — your public IP can change. Solution: use a DDNS service.

### Step 2 — Set up DDNS (if you don't have a static IP)

A DDNS (Dynamic DNS) service maps a hostname to your current IP and updates automatically.

**Free options:**
- [DuckDNS](https://www.duckdns.org) — completely free, simple, reliable
- [No-IP](https://noip.com) — free tier available
- [Dynu](https://dynu.com) — free tier available

**Example with DuckDNS:**
1. Sign up at duckdns.org
2. Create a subdomain (e.g., `mycommunity.duckdns.org`)
3. Install the auto-update client on your server:
   ```bash
   # Add to crontab (updates every 5 minutes)
   */5 * * * * curl -s "https://www.duckdns.org/update?domains=mycommunity&token=YOUR_TOKEN&ip=" > /dev/null
   ```

### Step 3 — Port forwarding on your router

You need to forward traffic from your router to your server. The procedure varies by router brand.

**General steps:**
1. Log into your router admin panel (usually `http://192.168.1.1` or `http://192.168.0.1`)
2. Find the **Port Forwarding** or **NAT** section
3. Add these rules:

| External port | Protocol | Internal IP | Internal port |
|---|---|---|---|
| 80 | TCP | `YOUR_SERVER_LOCAL_IP` | 80 |
| 443 | TCP | `YOUR_SERVER_LOCAL_IP` | 443 |
| 3478 | TCP+UDP | `YOUR_SERVER_LOCAL_IP` | 3478 |
| 49152–65535 | UDP | `YOUR_SERVER_LOCAL_IP` | 49152–65535 |

> 💡 **Find your server's local IP:**
> ```bash
> ip addr show | grep 'inet ' | grep -v '127.0.0.1'
> # Usually something like 192.168.1.42
> ```

> 💡 **Give your server a fixed local IP:** In your router settings, look for **DHCP static lease** or **Address Reservation**. Bind your server's MAC address to a fixed local IP (e.g., `192.168.1.100`) so it never changes.

### Step 4 — CGNAT (Carrier-Grade NAT)

Some ISPs use CGNAT — your home connection shares a public IP with hundreds of other customers. In this case, port forwarding is **impossible**.

**How to check if you're behind CGNAT:**
```bash
# Your router's WAN IP (from router admin panel) vs your public IP (whatismyip.com)
# If they're different → you're behind CGNAT
```

**Solutions if you're behind CGNAT:**
1. **Ask your ISP** for a real public IP (sometimes free, sometimes a few €/month)
2. **Use a cheap VPS as a relay** — run Nginx on the VPS and tunnel traffic to your home server via SSH:
   ```bash
   # On your home server (creates a reverse tunnel)
   ssh -R 80:localhost:80 -R 443:localhost:443 user@VPS_IP -N
   ```
3. **Use Cloudflare Tunnel** — free, no port forwarding needed, no VPS needed (but Cloudflare sees your traffic)

---

## 🔒 Behind a VPN or WireGuard

### Running Nexus behind a traditional VPN (NordVPN, ExpressVPN, etc.)

If your server connects to a VPN (not common, but possible), all outgoing traffic goes through the VPN. This creates two problems:
- Your TURN server advertises the VPN's IP, not your server's real IP
- Let's Encrypt can't reach your server for the HTTP challenge

**Solution:** Configure the VPN to exclude local traffic and not route the server's public services through the VPN.

For most setups, **don't run a personal VPN on the same machine as Nexus**. Use it only for client devices.

---

### WireGuard P2P Mesh (Nexus Federation — Phase 3)

> 🔭 **This is coming in Phase 3** — Nexus nodes will form a WireGuard mesh network automatically, making the network truly decentralized and resilient.

Today, each Nexus instance is independent. In the future, instances will connect via WireGuard tunnels to:
- Share federation data (instance directory)
- Route traffic between communities
- Make the network resilient to individual node failure

**If you already run WireGuard on your server** (e.g., as a personal VPN or between servers), you need to be careful:

1. **Make sure Nexus services bind to the correct interface** — the script binds to `0.0.0.0` by default (all interfaces), which is correct
2. **Firewall rules** — UFW is set to allow the necessary ports on all interfaces. If you use WireGuard with strict routing, you may need to add WireGuard interface (`wg0`) rules manually:
   ```bash
   sudo ufw allow in on wg0 to any port 3478
   ```
3. **TURN external IP** — the `install.sh` auto-detects your public IP via `api.ipify.org`. If your server routes outbound traffic through WireGuard, this might return the WireGuard peer's IP instead of your server's real IP. Fix it:
   ```bash
   # Edit /etc/turnserver.conf
   # Change external-ip= to your actual public IP
   sudo systemctl restart coturn
   ```

---

## ❌ Common Errors & Fixes

### 🔴 "Address already in use" on port 80 or 443

Another service is using the port (often Apache or another Nginx instance).

```bash
# Find what's using port 80
sudo lsof -i :80
sudo lsof -i :443

# Stop Apache if present
sudo systemctl stop apache2
sudo systemctl disable apache2

# Then restart Caddy
sudo systemctl restart caddy
```

---

### 🔴 Domain doesn't resolve / SSL certificate fails

Caddy tries to get an SSL certificate from Let's Encrypt when it starts. If your domain doesn't point to the server yet, this fails.

```bash
# Check if your domain resolves to your server
dig +short yourdomain.com
# Should return your server IP

# Check Caddy logs for errors
sudo journalctl -u caddy -f

# Force Caddy to retry
sudo systemctl restart caddy
```

> ⏳ **DNS propagation takes time** — if you just changed your DNS, wait 5–30 minutes and try again.

---

### 🔴 Backend doesn't start (port 3000)

Check the PM2 logs:

```bash
pm2 logs nexus-core --lines 50
```

Common causes:
- **Wrong database password** — check `/opt/nexus/nexus-core/.env`
- **PostgreSQL not running** — `sudo systemctl start postgresql`
- **Redis not running** — `sudo systemctl start redis-server`
- **Port 3000 already used** — `sudo lsof -i :3000`

---

### 🔴 Voice channels show "Relay (TURN)" instead of "P2P" for some users

This is **normal and expected**. Users behind NAT (corporate networks, 4G, some ISPs) can't establish direct P2P connections. The TURN relay is the fallback — it works correctly, it's just using your server bandwidth.

True P2P only works when both users have publicly reachable IPs or compatible NAT types.

---

### 🔴 TURN relay not working at all (voice channels fail completely)

```bash
# Check coturn is running
sudo systemctl status coturn

# Check coturn logs
tail -f /var/log/coturn.log

# Test TURN connectivity (from your local machine)
# Use https://webrtc.github.io/samples/src/content/peerconnection/trickle-ice/
# Enter: turn:YOUR_SERVER_IP:3478 / user: nexus / credential: YOUR_CREDENTIAL
```

> 💡 **Cloudflare users:** If your domain is proxied by Cloudflare, port 3478 won't work via the domain name. The `install.sh` uses your server's **IP address directly** for the TURN URL (`turn:IP:3478`) to bypass this automatically.

---

### 🔴 "Failed to fetch" when uploading avatar/banner

Check that Caddy routes `/uploads/*` to port 3000:

```bash
cat /etc/caddy/Caddyfile
# Should contain: reverse_proxy /uploads/* localhost:3000
```

---

### 🔴 Frontend shows blank page or SvelteKit errors

```bash
pm2 logs nexus-frontend --lines 50
```

Common causes:
- Frontend build failed — rebuild: `cd /opt/nexus/nexus-frontend && npm run build && pm2 restart nexus-frontend`
- Wrong `PUBLIC_API_URL` in `.env` — should be `https://yourdomain.com` (no `/api/v1`)

---

## 🎛️ After Installation

### First login

1. Open `https://yourdomain.com` in your browser
2. Log in with the admin credentials you set during installation
3. You're the **owner** of the community — you have full access to the admin panel

### Admin panel

Access it via the menu → **Admin** (visible only to owners and admins).

From the admin panel you can:
- Upload a community logo and banner
- Create forum categories
- Create voice channels
- Manage members (promote, ban, assign grades)
- Configure community description

### Invite your first members

Share your instance URL. New users can register at `https://yourdomain.com/auth/register`.

To promote someone to moderator or admin:
1. Admin panel → **Members**
2. Find the user → **Edit role**
3. Choose: `member`, `moderator`, or `admin`

---

## 💡 Tips & Tricks

### Useful commands

```bash
# Check the status of all services
pm2 list

# View backend logs (real-time)
pm2 logs nexus-core

# View frontend logs
pm2 logs nexus-frontend

# Restart everything
pm2 restart all

# Rebuild and restart after an update
cd /opt/nexus/nexus-core && npm run build && pm2 restart nexus-core
cd /opt/nexus/nexus-frontend && npm run build && pm2 restart nexus-frontend

# Check Caddy (HTTPS/proxy)
sudo systemctl status caddy
sudo journalctl -u caddy -f

# Check coturn (voice relay)
sudo systemctl status coturn
tail -f /var/log/coturn.log

# Check disk usage
df -h

# Check memory usage
free -h

# Check who's connected via SSH
who
```

### Secure your server

```bash
# Change SSH port (optional but reduces noise)
# Edit /etc/ssh/sshd_config → Port 2222
sudo systemctl restart sshd

# Disable root login via SSH (use a normal user + sudo instead)
# Edit /etc/ssh/sshd_config → PermitRootLogin no

# Check fail2ban (blocks brute-force attempts)
sudo apt install -y fail2ban
sudo systemctl enable fail2ban --now
```

### Backups

```bash
# Backup PostgreSQL database
sudo -u postgres pg_dump nexus > /backup/nexus_$(date +%Y%m%d).sql

# Backup uploads (avatars, banners)
tar -czf /backup/uploads_$(date +%Y%m%d).tar.gz /opt/nexus/nexus-core/uploads/

# Automate with a daily cron job
crontab -e
# Add: 0 3 * * * sudo -u postgres pg_dump nexus > /backup/nexus_$(date +%Y%m%d).sql
```

### Update Nexus

```bash
cd /opt/nexus
git pull

# Rebuild backend
cd nexus-core && npm install && npm run build && pm2 restart nexus-core

# Rebuild frontend
cd ../nexus-frontend && npm install && npm run build && pm2 restart nexus-frontend
```

> 💡 **Migrations run automatically** — the backend applies any new SQL migrations on startup.

---

## 🆘 Still stuck?

- Browse [open Issues](https://github.com/Pokled/Nexus/issues)
- Start a [Discussion](https://github.com/Pokled/Nexus/discussions)
- Read the [Architecture docs](./ARCHITECTURE.md) to understand how things fit together

---

*Nexus Installation Guide — v0.4.1 — March 2026*
