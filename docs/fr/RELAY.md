# ⚡ Nodyx Relay — Installer sans domaine ni port ouvert

> **Le problème :** Tu veux héberger Nodyx chez toi — sur un Raspberry Pi, un vieux PC, ta Freebox — mais tu n'as pas de domaine, et ton FAI bloque les ports entrants.
>
> **La solution :** Nodyx Relay. Un binaire Rust de 9 Mo qui établit une connexion **sortante** vers notre infrastructure, et rend ton instance accessible sous `ton-slug.nodyx.org` — sans rien configurer.

---

## Sommaire

- [Comment ça marche ?](#-comment-ça-marche-)
- [Prérequis](#-prérequis)
- [Installation](#-installation)
- [Comparaison avec les autres méthodes](#-comparaison-avec-les-autres-méthodes)
- [Vérifier que le tunnel est actif](#-vérifier-que-le-tunnel-est-actif)
- [Dépannage](#-dépannage)
- [Questions fréquentes](#-questions-fréquentes)
- [Pour les curieux — Architecture technique](#-pour-les-curieux--architecture-technique)

---

## 🔌 Comment ça marche ?

```
                    Ta machine (chez toi)
                    ┌────────────────────────────────┐
                    │  nodyx-core (port 3000)        │
                    │  nodyx-frontend (port 4173)    │
                    │  Caddy (port 80, local)        │
                    │                                │
                    │  nodyx-relay-client  ──────────┼──── connexion TCP sortante ────►
                    └────────────────────────────────┘                                │
                                                                                      │
                                                               relay.nodyx.org:7443
                                                               ┌────────────────────────────┐
                                                               │  nodyx-relay-server        │
                                                               │                            │
                    ◄─────── HTTPS via Caddy ────────────────  │  *.nodyx.org → :7001       │
                    Browser → ton-slug.nodyx.org               └────────────────────────────┘
```

1. **Tu lances `bash install.sh`** et tu choisis l'option `[2] Nodyx Relay`
2. **`nodyx-relay-client`** démarre en tant que service systemd sur ta machine
3. Il établit une **connexion TCP sortante** (port 7443) vers `relay.nodyx.org` — comme ouvrir un site web, pas comme ouvrir un port
4. Quand quelqu'un visite `ton-slug.nodyx.org`, la requête HTTPS arrive sur notre VPS, le relay server la fait transiter par le tunnel, et ta machine répond
5. **Ta machine n'a aucun port ouvert.** Ton routeur n'a rien à rediriger. Ton FAI ne voit que du trafic sortant.

---

## 📋 Prérequis

| Élément | Requis ? | Notes |
|---|---|---|
| Domaine personnel | ❌ Non | Le relay fournit `ton-slug.nodyx.org` gratuitement |
| Ports 80/443 ouverts | ❌ Non | Le relay utilise uniquement du trafic **sortant** |
| Compte Cloudflare | ❌ Non | Indépendance totale |
| Connexion Internet | ✅ Oui | N'importe quelle connexion fonctionne (fibre, 4G, satellite) |
| OS Linux 64 bits | ✅ Oui | Ubuntu 22.04/24.04, Debian 11/12, Raspberry Pi OS 64 bits |
| Architecture | ✅ `x86_64` ou `aarch64` | PC/VPS ou Raspberry Pi 3/4/5 |

> 💡 **Raspberry Pi 4, 8 Go RAM, Ubuntu Server 24.04 (arm64) :** testé et validé en conditions réelles — 1er mars 2026.

---

## 🚀 Installation

### Méthode 1 — Installeur interactif (recommandé)

```bash
git clone https://github.com/Pokled/Nodyx.git && cd Nodyx && sudo bash install.sh
```

Quand l'installeur te demande le mode réseau, choisis **`2`** :

```
  Mode de connexion réseau
  ┌─ [1] Domaine personnel  — ports 80/443 ouverts requis
  ├─ [2] Nodyx Relay         — recommandé — aucun port, aucun domaine (RPi, box, ...)
  └─ [3] sslip.io auto       — domaine gratuit automatique, ports ouverts requis

  ? Choix [1/2/3] (défaut: 2 — Nodyx Relay):
```

**L'installeur s'occupe de tout :**
- Télécharge le binaire `nodyx-relay` (amd64 ou arm64 détecté automatiquement)
- Enregistre ton slug auprès de l'annuaire nodyx.org
- Crée et démarre le service systemd `nodyx-relay-client`
- Configure Caddy en mode HTTP local (pas de ports à ouvrir)

**Résultat :** `ton-slug.nodyx.org` en ligne en ~5 minutes.

---

### Méthode 2 — Binaire seul (instance déjà installée)

Si tu as déjà une instance Nodyx et tu veux juste ajouter le relay :

```bash
# 1. Télécharger le binaire
ARCH=$(uname -m | sed 's/x86_64/amd64/;s/aarch64/arm64/')
sudo curl -L "https://github.com/Pokled/Nodyx/releases/download/v0.1.0-relay/nodyx-relay-linux-${ARCH}" \
  -o /usr/local/bin/nodyx-relay
sudo chmod +x /usr/local/bin/nodyx-relay

# 2. Vérifier
nodyx-relay --version

# 3. Créer le service (remplace TON_SLUG et TON_TOKEN par tes vraies valeurs)
sudo tee /etc/systemd/system/nodyx-relay-client.service > /dev/null <<EOF
[Unit]
Description=Nodyx Relay Client
After=network.target

[Service]
ExecStart=/usr/local/bin/nodyx-relay client \
  --server relay.nodyx.org:7443 \
  --slug TON_SLUG \
  --token TON_TOKEN \
  --local-port 80
Restart=on-failure
RestartSec=5s
User=root

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable --now nodyx-relay-client
```

> 💡 Le token est disponible dans `/root/nodyx-credentials.txt` si tu as utilisé `install.sh`, ou dans la réponse JSON de l'API d'enregistrement nodyx.org.

---

## ⚖️ Comparaison avec les autres méthodes

| Méthode | Domaine requis | Ports à ouvrir | Compte tiers | Dépendance |
|---|---|---|---|---|
| **Nodyx Relay** ⭐ | ❌ Non | ❌ Non | ❌ Non | Notre infra uniquement |
| VPS + domaine propre | ✅ Oui (~1€/an) | ✅ 80, 443 | ❌ Non | Aucune |
| sslip.io auto | ❌ Non | ✅ 80, 443 | ❌ Non | Aucune |
| Cloudflare Tunnel | ✅ Oui (CF) | ❌ Non | ✅ Cloudflare | Cloudflare |
| Tailscale + Funnel | ❌ Non | ❌ Non | ✅ Tailscale | Tailscale |
| Ngrok | ❌ Non | ❌ Non | ✅ Ngrok | Ngrok |

> **Philosophie Nodyx :** Le relay est open source, auto-hébergé sur notre propre VPS, et peut être remplacé par un relay communautaire. Zéro dépendance à une entreprise tierce.

---

## 🔍 Vérifier que le tunnel est actif

```bash
# État du service
sudo systemctl status nodyx-relay-client

# Logs en temps réel
sudo journalctl -u nodyx-relay-client -f

# Ce que tu dois voir dans les logs :
# → Connected to relay.nodyx.org:7443
# → Registered as slug "ton-slug" — OK
# → Forwarding GET / → HTTP 200
```

**Depuis l'extérieur :**

```bash
curl -I https://ton-slug.nodyx.org/
# HTTP/2 200
```

---

## 🔧 Dépannage

### Le service ne démarre pas

```bash
sudo journalctl -u nodyx-relay-client --no-pager -n 50
```

| Erreur | Cause | Solution |
|---|---|---|
| `Connection refused` | relay.nodyx.org injoignable | Vérifie ta connexion Internet |
| `Registration rejected: Invalid slug or token` | Token incorrect | Vérifie `/root/nodyx-credentials.txt` |
| `Binary not found` | Binaire non installé | Réinstalle avec `install.sh` ou méthode 2 |
| `Address already in use` (port 80) | Un autre service écoute sur :80 | `sudo ss -tlnp | grep :80` |

### La reconnexion ne fonctionne pas

Le relay client se reconnecte automatiquement avec un backoff exponentiel (1s → 2s → 4s → max 30s). Si la connexion est perdue (coupure Internet, redémarrage du relay server), il reprend tout seul. Tu n'as rien à faire.

### Mon instance n'est pas accessible depuis Internet

1. Vérifie que le service tourne : `systemctl is-active nodyx-relay-client`
2. Vérifie que Caddy tourne : `systemctl is-active caddy`
3. Vérifie que nodyx-core tourne : `pm2 status nodyx-core`
4. Teste en local : `curl http://localhost/api/v1/instance/info`

### Redémarrer manuellement

```bash
sudo systemctl restart nodyx-relay-client
```

---

## ❓ Questions fréquentes

**Q : Mes données transitent-elles par votre serveur ?**

Oui, les requêtes HTTP transitent par `relay.nodyx.org`. Mais le contenu reste chiffré en TLS bout en bout (HTTPS entre le navigateur et notre serveur Caddy). Nous ne stockons pas le contenu des requêtes. Les données de ta communauté (posts, messages, fichiers) restent **exclusivement sur ta machine**.

**Q : Que se passe-t-il si nodyx.org est indisponible ?**

Ton instance locale continue de fonctionner normalement. Seul l'accès depuis Internet via `ton-slug.nodyx.org` est interrompu. Si tu as un domaine propre, tu peux basculer dessus à tout moment.

**Q : Est-ce que les salons vocaux fonctionnent en mode Relay ?**

Les salons vocaux utilisent WebRTC, qui nécessite un serveur TURN pour traverser le NAT. En mode Relay, coturn n'est pas installé (les ports UDP requis ne sont pas ouverts). Les salons vocaux entre membres du même réseau local fonctionneront. Pour les appels inter-réseaux, il faudra un serveur TURN externe — c'est ce que **Phase 3.0-B (nodyx-turn)** résoudra de façon intégrée.

**Q : Est-ce que le relay est gratuit ?**

Oui, sans limite pendant la période beta. Nous nous réservons le droit d'introduire des limites raisonnables si l'usage devient excessif (bande passante > plusieurs To/mois par instance, par exemple). Le relay est open source — tu peux héberger le tien.

**Q : Comment changer mon slug ?**

Le slug est enregistré à l'installation. Pour le changer, contacte le support nodyx.org ou supprime et re-enregistre ton instance.

**Q : Est-ce que le relay fonctionne avec Docker ?**

Oui. Le binaire `nodyx-relay client` peut tourner en dehors du container Docker — il suffit de pointer `--local-port` sur le port exposé par ton container (par défaut 80).

---

## 🏗️ Pour les curieux — Architecture technique

### Le serveur relay (nodyx.org)

```
Port 7443 (TCP public)
└── Accepte les connexions des relay clients
    └── Authentifie via le token (table directory_instances en PostgreSQL)
    └── Enregistre slug → TunnelHandle (DashMap en mémoire)

Port 7001 (HTTP, local seulement — reçoit les requêtes de Caddy)
└── Extrait le slug depuis le header Host
    ├── Slug avec tunnel actif → forward via le tunnel TCP
    ├── Slug en DB avec URL → 302 redirect
    └── Slug inconnu → 404
```

### Le client relay (ta machine)

```
nodyx-relay client
└── Connexion TCP vers relay.nodyx.org:7443
    └── Envoi: Register { slug, token }
    └── Réception: ServerMessage::Request { id, method, path, headers, body_b64 }
        └── Exécute: reqwest → http://127.0.0.1:80{path}
        └── Envoi: ClientMessage::Response { id, status, headers, body_b64 }
    └── Reconnexion automatique si déconnecté
```

### Protocole de transport

Messages JSON encadrés par un préfixe de longueur 4 octets big-endian :

```
[ 4 bytes: length (big-endian u32) ][ JSON payload ]
```

Taille maximale des frames : 16 Mo.

### Dépôt

Le code source de `nodyx-relay` est dans le même repo que Nodyx :

```
nodyx-p2p/
└── crates/
    └── nodyx-relay/
        └── src/
            ├── main.rs          — CLI (clap)
            ├── protocol.rs      — types + framing
            ├── server/          — serveur relay (VPS)
            └── client/          — client relay (ta machine)
```

---

*Version 1.0 — 1er mars 2026*
*Validé sur Raspberry Pi 4 (arm64), Ubuntu Server 24.04, aucun port ouvert.*
