# 🚀 Nexus — Guide d'installation complet

> **En bref :** Clone le repo sur un serveur Linux, lance `bash install.sh`, réponds à 5 questions. C'est tout. ☕

---

## Sommaire

- [Avant de commencer](#-avant-de-commencer)
- [Où héberger ?](#-où-héberger-)
- [Ai-je besoin d'un nom de domaine ?](#-ai-je-besoin-dun-nom-de-domaine-)
- [Quels ports ouvrir ?](#-quels-ports-ouvrir-)
- [Installation — La méthode simple](#-installation--la-méthode-simple-recommandée)
- [Utilisateurs Windows — Guide WSL](#-utilisateurs-windows--guide-wsl)
- [Serveur maison / Derrière un routeur (NAT)](#-serveur-maison--derrière-un-routeur-nat)
- [Derrière un VPN ou WireGuard](#-derrière-un-vpn-ou-wireguard)
- [Erreurs fréquentes et solutions](#-erreurs-fréquentes-et-solutions)
- [Après l'installation](#-après-linstallation)
- [Conseils et astuces](#-conseils-et-astuces)

---

## 📋 Avant de commencer

### Configuration matérielle minimale

| Composant | Minimum | Recommandé |
|---|---|---|
| CPU | 1 vCPU / 1 cœur | 2 vCPU ou plus |
| RAM | 1 Go | 2 Go ou plus |
| Disque | 10 Go SSD | 20 Go SSD |
| Bande passante | 10 Mbps | 100 Mbps |
| OS | Ubuntu 22.04 | Ubuntu 24.04 LTS |

> 💡 **Exemple réel :** Une communauté de 50 utilisateurs actifs tourne sans problème sur un VPS à 4€/mois (Hetzner CX22, 2 vCPU / 4 Go RAM). Les salons vocaux sont en P2P — ils ne consomment pas la bande passante du serveur.

### Systèmes d'exploitation supportés

| OS | Support | Notes |
|---|---|---|
| Ubuntu 24.04 LTS | ✅ Recommandé | Le mieux testé |
| Ubuntu 22.04 LTS | ✅ Supporté | Fonctionne parfaitement |
| Debian 12 (Bookworm) | ✅ Supporté | Entièrement compatible |
| Debian 11 (Bullseye) | ✅ Supporté | Compatible |
| Windows (WSL2) | ✅ Supporté | [Voir section WSL](#-utilisateurs-windows--guide-wsl) |
| macOS | ⚠️ Manuel seulement | install.sh est Linux uniquement |
| CentOS / RHEL / Fedora | ❌ Non supporté | Utilise Docker à la place |
| Raspberry Pi OS | ✅ Supporté | Utilise la version 64 bits |

### Ce que `install.sh` installe automatiquement

Tu n'as rien à installer manuellement. Le script s'occupe de tout :

- **Node.js 20 LTS** — Runtime JavaScript
- **PostgreSQL 16** — Base de données principale
- **Redis 7** — Cache et sessions temps réel
- **Coturn** — Relais TURN/STUN pour les salons vocaux (WebRTC, traversée NAT)
- **Caddy** — Reverse proxy + HTTPS automatique (Let's Encrypt)
- **PM2** — Gestionnaire de processus (redémarrage auto, démarrage au boot)

---

## 🖥️ Où héberger ?

### Option 1 — VPS (Recommandé pour débuter)

Un VPS (serveur privé virtuel) est une machine Linux distante louée au mois. Elle est toujours en ligne, a une IP fixe, et tu peux t'y connecter en SSH depuis n'importe où.

**Hébergeurs recommandés :**

| Hébergeur | Offre d'entrée | Prix/mois | Notes |
|---|---|---|---|
| [Hetzner Cloud](https://hetzner.com/cloud) | CX22 (2 vCPU, 4 Go) | ~3,5€ | Meilleur rapport qualité/prix en Europe |
| [DigitalOcean](https://digitalocean.com) | Basic (1 vCPU, 1 Go) | 6$ | Panel très accessible aux débutants |
| [Vultr](https://vultr.com) | Cloud Compute 1 vCPU | 6$ | Bonne couverture mondiale |
| [OVH](https://ovh.com) | VPS Starter | ~3€ | Hébergeur français |

> 💡 **Conseil :** Choisis toujours un VPS proche de tes utilisateurs (Europe → Frankfurt ou Paris, Amérique du Nord → New York ou Dallas).

**Comment créer un VPS (exemple avec Hetzner) :**
1. Crée un compte sur hetzner.com
2. Va dans **Cloud → Projects → New Project**
3. Clique sur **Add Server**
4. Choisis : Location (ex: Nuremberg), Image = **Ubuntu 24.04**, Type = **CX22**
5. Ajoute ta clé SSH publique (recommandé) ou définis un mot de passe root
6. Clique sur **Create & Buy**
7. L'IP de ton serveur apparaît dans le dashboard en 30 secondes

**Connexion à ton VPS :**
```bash
ssh root@IP_DE_TON_VPS
```

---

### Option 2 — Serveur maison

Un vieux PC, un laptop inutilisé, ou un Raspberry Pi branché chez toi. Ça marche très bien, mais ça demande :
- Une IP fixe **ou** un service DDNS (voir [section Serveur maison](#-serveur-maison--derrière-un-routeur-nat))
- La redirection de ports sur ton routeur
- Ta machine doit rester allumée 24h/24

> ⚠️ **Attention :** Beaucoup de FAI bloquent les ports entrants 80/443. Vérifie avec ton FAI avant d'investir du temps. Certains FAI (surtout la fibre) peuvent fournir une IP fixe contre une petite somme.

---

### Option 3 — Windows avec WSL (Test / Développement)

Tu peux faire tourner Nexus sur Windows 10/11 via WSL2 (Sous-système Windows pour Linux). Idéal pour tester ou développer, mais pas recommandé pour un serveur de production 24h/24.

→ [Voir le guide WSL détaillé ci-dessous](#-utilisateurs-windows--guide-wsl)

---

## 🌐 Ai-je besoin d'un nom de domaine ?

**Réponse courte : Oui, pour la production. Non, pour un test local.**

Un nom de domaine comme `macommunaute.fr` c'est ce que tes utilisateurs taperont dans leur navigateur. Sans ça :
- Tu accèdes à Nexus uniquement via l'IP (ex: `http://46.225.20.193`)
- Pas d'HTTPS automatique (Caddy a besoin d'un domaine pour Let's Encrypt)
- Ton forum ne sera pas indexé par Google

**Registrars de domaines recommandés :**

| Registrar | Prix/an | Notes |
|---|---|---|
| [Namecheap](https://namecheap.com) | ~10$ | Super UI, WHOIS gratuit |
| [Cloudflare Registrar](https://cloudflare.com/registrar) | Au coût (~8$) | Pas de marge, DNS gratuit |
| [Gandi](https://gandi.net) | ~15€ | Hébergeur français, éthique |
| [OVH](https://ovh.com) | ~7€ | Hébergeur français |

**Configuration DNS (pointer ton domaine vers ton serveur) :**

Une fois ton domaine acheté, ajoute un **enregistrement A** dans ton panneau DNS :

```
Type  Nom     Valeur          TTL
A     @       IP_SERVEUR      300
A     www     IP_SERVEUR      300
```

> 💡 **Astuce Cloudflare :** Si tu utilises Cloudflare comme DNS, tu peux activer le nuage orange (proxy) pour HTTP/HTTPS — ça te donne une protection DDoS gratuite. **Cependant, désactive le proxy (nuage gris) pour tout sous-domaine TURN** — les salons vocaux ne fonctionneront pas à travers le proxy Cloudflare.

---

## 🔌 Quels ports ouvrir ?

Le script `install.sh` configure le pare-feu (UFW) automatiquement. Voici ce qu'il ouvre :

| Port | Protocole | Service | Obligatoire ? |
|---|---|---|---|
| 22 | TCP | SSH | ✅ Oui (pour gérer ton serveur) |
| 80 | TCP | HTTP | ✅ Oui (challenge Let's Encrypt) |
| 443 | TCP | HTTPS | ✅ Oui (ton site web) |
| 3478 | TCP + UDP | TURN/STUN (relais vocal) | ✅ Oui (salons vocaux) |
| 5349 | TCP + UDP | TURN/STUN TLS | ⚠️ Optionnel |
| 49152–65535 | UDP | Relais médias WebRTC | ✅ Oui (salons vocaux) |

> ❓ **C'est quoi un relais TURN ?** Quand deux utilisateurs veulent parler dans un salon vocal, ils essaient d'établir une connexion directe (P2P). Si l'un d'eux est derrière un NAT restrictif (connexion 4G, réseau d'entreprise), la connexion directe est impossible. Le relais TURN sert d'intermédiaire — la voix passe par ton serveur. C'est uniquement un fallback quand le P2P échoue.

---

## 🚀 Installation — La méthode simple (Recommandée)

### Étape 1 — Clone le dépôt

Sur ton serveur Linux (via SSH) :

```bash
git clone https://github.com/Pokled/Nexus.git /opt/nexus-install
cd /opt/nexus-install
```

Ou télécharge juste le script d'installation :

```bash
curl -fsSL https://raw.githubusercontent.com/Pokled/Nexus/main/install.sh -o install.sh
```

### Étape 2 — Lance l'installateur

```bash
sudo bash install.sh
```

> 🔐 Le script doit être exécuté en root (ou avec sudo). Il installe des paquets système, configure le pare-feu et met en place les services.

### Étape 3 — Réponds à 5 questions

L'installateur va te demander :

```
? Nom de domaine (ex: macommunaute.fr): macommunaute.fr
? Nom de la communauté (ex: Linux France): Ma Super Communauté
? Slug unique de la communauté: ma-super-communaute
? Langue principale (fr/en/de/es/it/pt): fr
? Nom d'utilisateur admin: alice
? Email admin: alice@exemple.fr
? Mot de passe admin: ••••••••
```

C'est tout. Le script s'occupe du reste automatiquement (≈ 3 à 10 minutes selon la vitesse de ton serveur).

### Étape 4 — Attends et profite ☕

L'installateur affiche un résumé à la fin :

```
╔══════════════════════════════════════════════════╗
║       ✔  Nexus installé avec succès !            ║
╚══════════════════════════════════════════════════╝

  Instance : https://macommunaute.fr
  Admin    : alice / alice@exemple.fr
  Vocal    : Relais TURN sur 46.225.20.193:3478

  Credentials sauvegardés dans : /root/nexus-credentials.txt
```

> 💡 **Le DNS prend du temps.** Après avoir pointé ton domaine vers l'IP de ton serveur, la propagation DNS peut prendre jusqu'à 24–48h dans le monde entier (en pratique 5–30 minutes). Caddy obtiendra automatiquement ton certificat SSL dès que le DNS sera résolu.

---

## 🪟 Utilisateurs Windows — Guide WSL

WSL (Windows Subsystem for Linux) permet de faire tourner Ubuntu directement dans Windows. Le `install.sh` de Nexus fonctionne parfaitement dans WSL2.

### Étape 1 — Activer WSL2

Ouvre **PowerShell en Administrateur** et lance :

```powershell
wsl --install
```

Cela installe WSL2 et Ubuntu automatiquement. **Redémarre ton PC** quand c'est demandé.

> 💡 Si WSL est déjà installé, mets-le à jour : `wsl --update`

### Étape 2 — Ouvrir Ubuntu

Après le redémarrage, recherche **"Ubuntu"** dans le menu Démarrer et ouvre-le. La première fois, il te demandera de créer un nom d'utilisateur et un mot de passe Linux.

### Étape 3 — Mettre à jour Ubuntu

```bash
sudo apt update && sudo apt upgrade -y
```

### Étape 4 — Installer Git (si besoin)

```bash
sudo apt install -y git
```

### Étape 5 — Cloner Nexus

```bash
git clone https://github.com/Pokled/Nexus.git
cd Nexus
```

### Étape 6 — Lancer l'installateur

```bash
sudo bash install.sh
```

> ⚠️ **Limitation WSL :** Les services lancés dans WSL ne redémarrent pas automatiquement avec Windows. Pour un serveur 24h/24, utilise un vrai VPS Linux. WSL est parfait pour les tests et le développement.

> 💡 **Accès depuis ton navigateur Windows :** Une fois l'installation terminée, ouvre ton navigateur et va sur `http://localhost` — Nexus sera là.

### Conseils spécifiques à WSL

- **Accès aux fichiers :** Tes fichiers Windows sont accessibles via `/mnt/c/Users/TonNom/` dans WSL
- **Raccourci terminal WSL :** Dans n'importe quel dossier Windows, tape `wsl` dans la barre d'adresse
- **Intégration VS Code :** Installe l'extension "WSL" pour VS Code et édite tes fichiers directement
- **Redirection de ports :** Pour exposer WSL sur ton réseau local, redirige les ports manuellement :
  ```powershell
  # En Administrateur dans PowerShell
  netsh interface portproxy add v4tov4 listenport=80 listenaddress=0.0.0.0 connectport=80 connectaddress=$(wsl hostname -I)
  netsh interface portproxy add v4tov4 listenport=443 listenaddress=0.0.0.0 connectport=443 connectaddress=$(wsl hostname -I)
  ```

---

## 🏠 Serveur maison / Derrière un routeur (NAT)

Faire tourner Nexus sur une machine chez toi (derrière ton box/routeur) nécessite quelques étapes supplémentaires.

### Étape 1 — Trouve ton IP publique

Va sur [whatismyip.com](https://whatismyip.com) — c'est l'IP que le monde extérieur voit.

> ⚠️ **Problème :** La plupart des FAI attribuent des **IP dynamiques** — ton IP publique peut changer. Solution : utilise un service DDNS.

### Étape 2 — Configurer un DDNS (si tu n'as pas d'IP fixe)

Un service DDNS (DNS dynamique) associe un nom d'hôte à ton IP actuelle et se met à jour automatiquement.

**Options gratuites :**
- [DuckDNS](https://www.duckdns.org) — complètement gratuit, simple, fiable
- [No-IP](https://noip.com) — offre gratuite disponible
- [Dynu](https://dynu.com) — offre gratuite disponible

**Exemple avec DuckDNS :**
1. Inscris-toi sur duckdns.org
2. Crée un sous-domaine (ex: `macommunaute.duckdns.org`)
3. Installe le client de mise à jour automatique sur ton serveur :
   ```bash
   # Ajoute au crontab (mise à jour toutes les 5 minutes)
   */5 * * * * curl -s "https://www.duckdns.org/update?domains=macommunaute&token=TON_TOKEN&ip=" > /dev/null
   ```

### Étape 3 — Redirection de ports sur ton routeur

Tu dois rediriger le trafic depuis ta box vers ton serveur. La procédure varie selon le modèle de ta box.

**Étapes générales :**
1. Connecte-toi à l'interface d'administration de ta box (généralement `http://192.168.1.1` ou `http://192.168.0.1`)
2. Trouve la section **Redirection de ports**, **NAT**, ou **Virtual Server**
3. Ajoute ces règles :

| Port externe | Protocole | IP interne | Port interne |
|---|---|---|---|
| 80 | TCP | `IP_LOCALE_DU_SERVEUR` | 80 |
| 443 | TCP | `IP_LOCALE_DU_SERVEUR` | 443 |
| 3478 | TCP+UDP | `IP_LOCALE_DU_SERVEUR` | 3478 |
| 49152–65535 | UDP | `IP_LOCALE_DU_SERVEUR` | 49152–65535 |

> 💡 **Trouver l'IP locale de ton serveur :**
> ```bash
> ip addr show | grep 'inet ' | grep -v '127.0.0.1'
> # Généralement quelque chose comme 192.168.1.42
> ```

> 💡 **Donne une IP locale fixe à ton serveur :** Dans les paramètres de ta box, cherche **Bail DHCP statique** ou **Réservation d'adresse**. Associe l'adresse MAC de ton serveur à une IP locale fixe (ex: `192.168.1.100`) pour qu'elle ne change jamais.

### CG-NAT (Carrier-Grade NAT)

Certains FAI utilisent le CG-NAT — ta connexion partage une IP publique avec des centaines d'autres clients. Dans ce cas, la redirection de ports est **impossible**.

**Comment savoir si tu es derrière un CG-NAT :**
```bash
# Compare l'IP WAN de ta box (dans son interface) avec ton IP publique (whatismyip.com)
# Si elles sont différentes → tu es derrière un CG-NAT
```

> 💡 **Astuce Orange/SFR/Bouygues :** Beaucoup de box 4G et certaines offres fibre utilisent le CG-NAT. Appelle le support de ton FAI et demande une "IP publique fixe" — c'est parfois gratuit, parfois quelques €/mois.

**Solutions si tu es derrière un CG-NAT :**
1. **Demande à ton FAI** une IP publique réelle
2. **Utilise un VPS bon marché comme relais** — installe Nginx sur le VPS et tunnel le trafic vers ton serveur maison via SSH :
   ```bash
   # Sur ton serveur maison (crée un tunnel inverse)
   ssh -R 80:localhost:80 -R 443:localhost:443 user@IP_VPS -N
   ```
3. **Utilise Cloudflare Tunnel** — gratuit, sans redirection de ports, sans VPS (mais Cloudflare voit ton trafic)

---

## 🔒 Derrière un VPN ou WireGuard

### Nexus derrière un VPN traditionnel (NordVPN, ProtonVPN, etc.)

Si ton serveur se connecte à un VPN (peu courant, mais possible), tout le trafic sortant passe par le VPN. Ça crée deux problèmes :
- Ton serveur TURN annonce l'IP du VPN, pas la vraie IP de ton serveur
- Let's Encrypt ne peut pas atteindre ton serveur pour le challenge HTTP

**Solution :** Configure le VPN pour exclure le trafic local et ne pas router les services publics du serveur via le VPN.

Pour la plupart des configurations, **n'installe pas un VPN personnel sur la même machine que Nexus**. Utilise-le uniquement sur les appareils clients.

---

### WireGuard — Maillage P2P (Fédération Nexus — Phase 3)

> 🔭 **Ça arrive en Phase 3** — Les nœuds Nexus formeront automatiquement un réseau maillé WireGuard, rendant le réseau vraiment décentralisé et résilient.

Aujourd'hui, chaque instance Nexus est indépendante. À l'avenir, les instances se connecteront via des tunnels WireGuard pour :
- Partager les données de fédération (annuaire des instances)
- Router le trafic entre communautés
- Rendre le réseau résilient aux pannes individuelles

**Si tu as déjà WireGuard sur ton serveur** (ex: VPN personnel ou entre serveurs), attention :

1. **Assure-toi que les services Nexus écoutent sur la bonne interface** — le script utilise `0.0.0.0` par défaut (toutes les interfaces), ce qui est correct
2. **Règles de pare-feu** — UFW ouvre les ports nécessaires sur toutes les interfaces. Si tu utilises WireGuard avec un routage strict, tu devras peut-être ajouter les règles pour l'interface WireGuard (`wg0`) manuellement :
   ```bash
   sudo ufw allow in on wg0 to any port 3478
   ```
3. **IP externe TURN** — `install.sh` détecte ton IP publique automatiquement via `api.ipify.org`. Si ton serveur route le trafic sortant via WireGuard, ça pourrait retourner l'IP du pair WireGuard au lieu de ta vraie IP publique. Corrige-le :
   ```bash
   # Édite /etc/turnserver.conf
   # Modifie external-ip= avec ta vraie IP publique
   sudo systemctl restart coturn
   ```

---

## ❌ Erreurs fréquentes et solutions

### 🔴 "Address already in use" sur le port 80 ou 443

Un autre service utilise le port (souvent Apache ou une autre instance Nginx).

```bash
# Trouve ce qui utilise le port 80
sudo lsof -i :80
sudo lsof -i :443

# Arrête Apache si présent
sudo systemctl stop apache2
sudo systemctl disable apache2

# Puis redémarre Caddy
sudo systemctl restart caddy
```

---

### 🔴 Le domaine ne répond pas / Le certificat SSL échoue

Caddy essaie d'obtenir un certificat SSL de Let's Encrypt au démarrage. Si ton domaine ne pointe pas encore vers le serveur, ça échoue.

```bash
# Vérifie si ton domaine résout vers ton serveur
dig +short tondomain.fr
# Doit retourner l'IP de ton serveur

# Vérifie les logs Caddy pour les erreurs
sudo journalctl -u caddy -f

# Force Caddy à réessayer
sudo systemctl restart caddy
```

> ⏳ **La propagation DNS prend du temps** — si tu viens de changer ton DNS, attends 5–30 minutes et réessaie.

---

### 🔴 Le backend ne démarre pas (port 3000)

Consulte les logs PM2 :

```bash
pm2 logs nexus-core --lines 50
```

Causes courantes :
- **Mauvais mot de passe base de données** — vérifie `/opt/nexus/nexus-core/.env`
- **PostgreSQL pas lancé** — `sudo systemctl start postgresql`
- **Redis pas lancé** — `sudo systemctl start redis-server`
- **Port 3000 déjà utilisé** — `sudo lsof -i :3000`

---

### 🔴 Les salons vocaux affichent "Relay (TURN)" au lieu de "P2P" pour certains utilisateurs

C'est **normal et attendu**. Les utilisateurs derrière un NAT (réseaux d'entreprise, 4G, certains FAI) ne peuvent pas établir de connexions P2P directes. Le relais TURN est le fallback — il fonctionne correctement, il utilise simplement la bande passante de ton serveur.

Le vrai P2P ne fonctionne que quand les deux utilisateurs ont des IPs publiques accessibles ou des types NAT compatibles.

---

### 🔴 Le relais TURN ne fonctionne pas du tout (salons vocaux complètement en panne)

```bash
# Vérifie que coturn tourne
sudo systemctl status coturn

# Vérifie les logs coturn
tail -f /var/log/coturn.log

# Teste la connectivité TURN (depuis ta machine locale)
# Utilise https://webrtc.github.io/samples/src/content/peerconnection/trickle-ice/
# Saisis : turn:IP_SERVEUR:3478 / utilisateur: nexus / credential: TON_CREDENTIAL
```

> 💡 **Utilisateurs Cloudflare :** Si ton domaine est proxifié par Cloudflare, le port 3478 ne fonctionnera pas via le nom de domaine. `install.sh` utilise **l'adresse IP directement** pour l'URL TURN (`turn:IP:3478`) pour contourner ça automatiquement.

---

### 🔴 "Failed to fetch" lors de l'upload d'avatar/bannière

Vérifie que Caddy route `/uploads/*` vers le port 3000 :

```bash
cat /etc/caddy/Caddyfile
# Doit contenir : reverse_proxy /uploads/* localhost:3000
```

---

### 🔴 Le frontend affiche une page blanche ou des erreurs SvelteKit

```bash
pm2 logs nexus-frontend --lines 50
```

Causes courantes :
- Le build frontend a échoué — recompile : `cd /opt/nexus/nexus-frontend && npm run build && pm2 restart nexus-frontend`
- Mauvais `PUBLIC_API_URL` dans `.env` — doit être `https://tondomain.fr` (sans `/api/v1`)

---

## 🎛️ Après l'installation

### Première connexion

1. Ouvre `https://tondomain.fr` dans ton navigateur
2. Connecte-toi avec les identifiants admin définis pendant l'installation
3. Tu es **owner** de la communauté — tu as accès complet au panel admin

### Panel d'administration

Accessible via le menu → **Admin** (visible uniquement pour les owners et admins).

Depuis le panel admin, tu peux :
- Uploader un logo et une bannière de communauté
- Créer des catégories de forum
- Créer des salons vocaux
- Gérer les membres (promouvoir, bannir, attribuer des grades)
- Configurer la description de la communauté

### Inviter tes premiers membres

Partage l'URL de ton instance. Les nouveaux utilisateurs peuvent s'inscrire sur `https://tondomain.fr/auth/register`.

Pour promouvoir quelqu'un en modérateur ou admin :
1. Panel admin → **Membres**
2. Trouve l'utilisateur → **Modifier le rôle**
3. Choisis : `member`, `moderator`, ou `admin`

---

## 💡 Conseils et astuces

### Commandes utiles

```bash
# Vérifier l'état de tous les services
pm2 list

# Voir les logs du backend (temps réel)
pm2 logs nexus-core

# Voir les logs du frontend
pm2 logs nexus-frontend

# Redémarrer tout
pm2 restart all

# Recompiler et redémarrer après une mise à jour
cd /opt/nexus/nexus-core && npm run build && pm2 restart nexus-core
cd /opt/nexus/nexus-frontend && npm run build && pm2 restart nexus-frontend

# Vérifier Caddy (HTTPS/proxy)
sudo systemctl status caddy
sudo journalctl -u caddy -f

# Vérifier coturn (relais vocal)
sudo systemctl status coturn
tail -f /var/log/coturn.log

# Vérifier l'espace disque
df -h

# Vérifier la mémoire
free -h

# Voir qui est connecté en SSH
who
```

### Sécuriser ton serveur

```bash
# Changer le port SSH (optionnel mais réduit le bruit)
# Édite /etc/ssh/sshd_config → Port 2222
sudo systemctl restart sshd

# Désactiver la connexion root via SSH (utilise un utilisateur normal + sudo)
# Édite /etc/ssh/sshd_config → PermitRootLogin no

# Installer fail2ban (bloque les tentatives de brute-force)
sudo apt install -y fail2ban
sudo systemctl enable fail2ban --now
```

### Sauvegardes

```bash
# Sauvegarder la base de données PostgreSQL
sudo -u postgres pg_dump nexus > /backup/nexus_$(date +%Y%m%d).sql

# Sauvegarder les uploads (avatars, bannières)
tar -czf /backup/uploads_$(date +%Y%m%d).tar.gz /opt/nexus/nexus-core/uploads/

# Automatiser avec une tâche cron quotidienne
crontab -e
# Ajoute : 0 3 * * * sudo -u postgres pg_dump nexus > /backup/nexus_$(date +%Y%m%d).sql
```

### Mettre à jour Nexus

```bash
cd /opt/nexus
git pull

# Recompiler le backend
cd nexus-core && npm install && npm run build && pm2 restart nexus-core

# Recompiler le frontend
cd ../nexus-frontend && npm install && npm run build && pm2 restart nexus-frontend
```

> 💡 **Les migrations s'appliquent automatiquement** — le backend applique les nouvelles migrations SQL au démarrage.

---

## 🆘 Toujours bloqué ?

- Consulte les [Issues ouvertes](https://github.com/Pokled/Nexus/issues)
- Ouvre une [Discussion](https://github.com/Pokled/Nexus/discussions)
- Lis la [doc Architecture](./ARCHITECTURE.md) pour comprendre comment les pièces s'assemblent

---

*Guide d'installation Nexus — v0.4.1 — Mars 2026*
