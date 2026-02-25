<div align="center">
  <img src="https://raw.githubusercontent.com/Pokled/Nexus/main/nexus-logo.png" alt="Nexus Logo" width="120"/>

  # 🌐 NEXUS

  [![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
  [![GitHub stars](https://img.shields.io/github/stars/Pokled/Nexus?style=social)](https://github.com/Pokled/Nexus/stargazers)
  [![GitHub forks](https://img.shields.io/github/forks/Pokled/Nexus?style=social)](https://github.com/Pokled/Nexus/network/members)
  [![Discord](https://img.shields.io/badge/chat-on%20Discord-7289da)](https://discord.gg/votrelien) <!-- À créer -->

  ### **L'internet des années 2000, reconstruit avec les outils de 2026**

  *Forum décentralisé · Chat temps réel · Vocal P2P · IA locale*

  [🚀 Site Web](https://pokled.github.io/Nexus/) •
  [📖 Documentation](https://github.com/Pokled/Nexus/wiki) •
  [💬 Communauté](https://pokled.ddns.net) •
  [🐛 Signaler un bug](https://github.com/Pokled/Nexus/issues)

</div>

---

## ✨ **Pourquoi Nexus ?**

On a tous vu l'internet changer. Les forums indépendants, les TeamSpeak auto-hébergés, les petites communautés... tout ça a été remplacé par des silos centralisés.

**Discord, c'est pratique, mais :**
- 🔒 Vos discussions appartiennent à une entreprise
- 📊 Vos données sont analysées, revendues
- 🌍 Si le serveur tombe, votre communauté disparaît
- 💸 Les fonctionnalités deviennent payantes

**Nexus propose une autre voie :**
- 🏠 **Auto-hébergement** : votre communauté chez vous, sur un Raspberry Pi
- 🔐 **Vie privée** : zéro tracking, zéro revente de données
- 🌐 **Réseau P2P** : insubmersible, décentralisé
- 🧠 **IA locale** : modération et assistance, sans cloud
- 🎨 **Extensible** : plugins, thèmes, personnalisation infinie

> *"Le réseau, ce sont les gens."*

---

## 🎯 **Fonctionnalités**

### ✅ **Déjà disponibles**

| | |
|---|---|
| **Forum structuré** | Catégories et sous-catégories infinies. Éditeur WYSIWYG avec GIFs, vidéos embarquées, code coloré. Mémoire longue de la communauté. |
| **Chat temps réel** | Salons instantanés. Mentions, réactions, historique. Bots communautaires. |
| **Salons vocaux** | Tables rondes visuelles, audio 3D spatial, diagnostic réseau intégré. WebRTC P2P direct. |
| **Profils riches** | Avatar, bio, tags, widgets GitHub/Twitch/Spotify. Grades personnalisés. |
| **Administration** | Dashboard complet, gestion des membres, grades, catégories, modération. |
| **Système de plugins** | Extensible sans toucher au core. |
| **Installation 1 clic** | Tourne sur un Raspberry Pi 4 ou un vieux FX-8370. |

### 🚧 **En cours de développement**

- [ ] Réseau P2P (WireGuard) – Phase 3
- [ ] Annuaire global (nexus-directory)
- [ ] Applications mobiles (Capacitor)
- [ ] Desktop natif (Tauri)
- [ ] Recherche full-text (Meilisearch)

---

## 🛠️ **Stack technique**
Frontend → SvelteKit (SSR) + Tailwind CSS
Desktop → Tauri (Rust)
Mobile → Capacitor
Backend API → Node.js + Fastify + TypeScript
Base de données → PostgreSQL
Cache & temps réel → Redis
Recherche → Meilisearch
Réseau P2P → WireGuard + WebRTC
IA locale → Ollama
Licence → AGPL-3.0

text

---

## 🚀 **Premiers pas**

### **Option 1 : Essayer l'instance de démonstration**

👉 [**https://pokled.ddns.net**](https://pokled.ddns.net)

Compte de test : `demo / demo` (ou créez le vôtre)

### **Option 2 : Installer en local**

**Prérequis :** Docker, Docker Compose

```bash
# Cloner le dépôt
git clone https://github.com/Pokled/Nexus.git
cd Nexus

# Lancer avec Docker
docker-compose up -d

# Accéder à l'application
# http://localhost:3000
Installation manuelle (sans Docker) :

bash
# Backend
cd nexus-core
npm install
cp .env.example .env  # Configurez votre base de données
npm run dev

# Frontend (dans un autre terminal)
cd nexus-frontend
npm install
npm run dev
🤝 Contribuer
Nexus appartient à sa communauté. Les contributions sont les bienvenues !

Vous pouvez aider :
🐛 Signaler des bugs : ouvrir une issue

💡 Proposer des idées : discussions GitHub

💻 Coder : lire CONTRIBUTING.md

🌍 Traduire : aider sur l'internationalisation

🎨 Créer des thèmes : dans nexus-themes

Règles simples :
Le core est protégé – les plugins sont le terrain de jeu

AGPL-3.0 – tout le monde partage ses améliorations

L'humain avant la technologie

📚 Documentation
Architecture – Comment Nexus est construit

Manifeste – La vision du projet

Contribuer – Guide pour les développeurs

API – Documentation de l'API

🌟 Qui utilise Nexus ?
Nexus est encore en alpha, mais déjà utilisé par des :

🧑‍💻 Développeurs curieux

🎮 Communautés de joueurs

🏫 Associations étudiantes

🔧 Passionnés de self-hosting

Rejoignez le mouvement !

📜 Licence
Copyright (C) 2026 Pokled

Ce programme est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la GNU Affero General Public License telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la GNU Affero General Public License pour plus de détails.

Vous devriez avoir reçu une copie de la GNU Affero General Public License avec ce programme. Sinon, consultez https://www.gnu.org/licenses/.

<div align="center">
⭐ Si vous aimez le projet, n'hésitez pas à mettre une étoile ! ⭐
Construit pour & par des gens qui croient en un internet libre

Pokled.
