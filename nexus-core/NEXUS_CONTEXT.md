# NEXUS_CONTEXT.md
### Fichier de contexte permanent — À lire ABSOLUMENT avant chaque session

---

> ⚠️ **INSTRUCTION CRITIQUE POUR L'AGENT**
> Tu es l'agent de développement du projet Nexus.
> Tu ne commences AUCUNE tâche sans avoir lu ce fichier en entier.
> Tu ne proposes AUCUNE technologie qui contredit ce fichier.
> Tu ne modifies AUCUNE décision architecturale sans validation humaine explicite.
> Ce fichier est ta bible. Pas une suggestion. Une obligation.

---

## 1. QUI EST TON INTERLOCUTEUR

Tu travailles avec un humain visionnaire, non-développeur, qui pilote ce projet avec une vision claire et des convictions fortes. Il n'a pas besoin que tu lui expliques les concepts de base longuement. Il a besoin que tu sois précis, efficace, et que tu respectes ses décisions sans dériver.

Il s'appelle le Chef de Projet. C'est lui qui valide. Toi tu exécutes et tu proposes. Jamais l'inverse.

Quand il dit NON à quelque chose, c'est NON. Tu ne reviens pas dessus.
Quand il dit OUI, tu exécutes sans sur-complexifier.
Quand tu ne sais pas, tu dis que tu ne sais pas. Pas d'invention.

---

## 2. QU'EST-CE QUE NEXUS — LA VISION

Nexus est une plateforme de communication communautaire, décentralisée, open source et libre.

**En une phrase :** C'est l'internet des années 2000 reconstruit avec les outils de 2026.

**Le problème qu'il résout :**
Discord, Facebook et les GAFA ont centralisé les communautés. Des millions de discussions, tutoriels, et savoir collectif sont enfermés dans des silos privés — invisibles pour Google, inaccessibles sans compte, condamnés à disparaître si la plateforme ferme. Nexus répare ça.

---

## 3. LA NATURE DUALE DE NEXUS — L'ESSENTIEL

> **C'est le concept fondateur. Tout le reste en découle.**

**Nexus est DEUX choses simultanément :**

### Côté 1 — Une plateforme communautaire
- Forum public indexable (le savoir appartient à internet)
- Chat temps réel dans la communauté
- Salons vocaux
- Partage de fichiers, whiteboard, tâches
- Profils humains riches
- IA locale intégrée (Ollama)

### Côté 2 — Un nœud de réseau P2P
- Chaque instance Nexus installée quelque part dans le monde contribue automatiquement au réseau
- Elle partage sa bande passante et son stockage
- Plus il y a de nœuds, plus le réseau est fort, résilient, et gratuit à opérer
- Comme BitTorrent — le réseau grandit avec ses utilisateurs

**Ces deux rôles sont inséparables. On n'installe pas "juste le forum". On installe Nexus.**

---

## 4. MODÈLE D'INSTANCE — UNE INSTANCE = UNE COMMUNAUTÉ

```
Une instance Nexus = une communauté souveraine
```

- La page d'accueil de l'instance EST la communauté de cette instance
- Le nom de la communauté est configuré via `.env` : `NEXUS_COMMUNITY_NAME`
- Chaque instance est autonome, auto-suffisante, et appartient à celui qui l'héberge
- Il n'y a pas de "super-admin central". Nexus n'a pas de compte Nexus.io.
- L'administrateur de l'instance est souverain sur son instance

**Exemples d'instances :**
```
linux-fr.nexus.io      → La communauté Linux francophone
gaming-quebec.nexus.io → Gamers québécois
photo-club.nexus.io    → Cercle photographique local
mon-labo.nexus.io      → Homelab d'un passionné
```

Chaque instance est distincte. Les membres s'inscrivent sur l'instance qui les intéresse. Les identités ne sont pas fédérées (pour l'instant — voir Phase 3).

---

## 5. LE RÉSEAU NEXUS — LES TROIS PHASES

### Phase 1 — Serveurs publics officiels
```
Qui  : 1 à 2 serveurs gérés par l'équipe Nexus
Rôle : Distribuer les mises à jour logiciel
       Servir de bootstrap pour trouver ses premiers pairs
       Héberger le nexus-directory (l'annuaire)
Coût : ~6€/mois
Note : Ces serveurs ne stockent AUCUNE donnée utilisateur
```

### Phase 2 — Instances privées rejoignent comme nœuds
```
Qui  : N'importe qui peut installer Nexus et rejoindre le réseau
Rôle : Chaque instance héberge son propre contenu
       Le serveur officiel ne gère plus que l'annuaire
Coût : ~6-20€/mois côté officiel (quasi inchangé peu importe le nombre de nœuds)
```

### Phase 3 — WireGuard mesh P2P complet
```
Qui  : Les nœuds se parlent directement entre eux
Rôle : DHT pour la découverte des pairs (comme BitTorrent)
       Gossip protocol pour synchronisation des données
       WireGuard pour les tunnels chiffrés inter-nœuds
       Chat/vocal = P2P direct, zéro transit par le serveur officiel
Coût : ~30€/mois MAX côté officiel, peu importe le nombre de nœuds
```

**La beauté du modèle :**
```
Aujourd'hui (Phase 1)
  100% du trafic → serveur officiel

Phase 3 terminée
  Annuaire        → serveur officiel (léger)
  Contenu forum   → chaque nœud (distribué)
  Chat/vocal      → P2P direct (zéro transit)
  Fichiers/médias → CDN distribué (zéro transit)

Résultat : Un serveur à 30€/mois peut tenir des millions d'utilisateurs.
```

---

## 6. L'ANNUAIRE GLOBAL — nexus-directory

Repo séparé : `nexus-directory`
Hébergé sur le serveur officiel Nexus.

**Flux d'enregistrement :**
```
Quelqu'un installe Nexus → Il remplit : nom, description, langue, thématique, pays
→ Son instance s'enregistre dans l'annuaire
→ Il reçoit automatiquement un sous-domaine : nom-choisi.nexus.io
→ Il apparaît dans l'annuaire public, navigable par langue / pays / thème
→ N'importe qui peut le trouver et le rejoindre
```

**Coût des sous-domaines :**
```
Domaine nexus.io           ~15€/an
SSL wildcard Let's Encrypt    0€
DNS wildcard                  0€
Nginx reverse proxy           0€

Total : ~15€/an pour héberger des centaines d'instances
```

**Ce que l'annuaire contient :**
- Nom de l'instance, description, thématique
- Langue principale, pays hébergement
- Nombre de membres (public)
- Statut du nœud (en ligne, version, santé)
- Lien vers l'instance

**Ce que l'annuaire ne contient PAS :**
- Aucune donnée utilisateur
- Aucun contenu des forums
- Aucun message privé

---

## 7. CE QUE NEXUS N'EST PAS — LES DÉRIVES INTERDITES

❌ Nexus n'est PAS un clone de Discord. Ne propose jamais une architecture qui y ressemble.
❌ Nexus n'est PAS centralisé. Ne propose jamais de serveur central qui stocke les données utilisateurs.
❌ Nexus n'est PAS une cryptomonnaie. Les NexusPoints sont des points de réputation, pas une crypto échangeable.
❌ Nexus n'est PAS construit sur Electron. Jamais. Trop lourd, trop lent.
❌ Nexus n'est PAS dépendant de services tiers propriétaires (AWS, Google Cloud, Azure, Vercel, Railway).
❌ Nexus n'est PAS un projet qui repart de zéro à chaque session. Tu lis ce fichier et tu continues là où on s'est arrêtés.
❌ Nexus n'est PAS une plateforme multi-communautés sur une seule instance. Une instance = une communauté.

---

## 8. STACK TECHNIQUE — IMMUABLE

Ces choix sont définitifs. Tu ne les remets pas en question. Tu ne proposes pas d'alternatives sauf si une faille de sécurité critique est découverte, et seulement après validation humaine.

### Base de données
**PostgreSQL** — Données permanentes et relationnelles.
Pourquoi : Nexus a des données très relationnelles (users → catégories → threads → posts). PostgreSQL est open source, battle-tested, full-text search natif, JSON natif pour les plugins.

### Cache & Temps réel
**Redis** — Sessions, cache, pub/sub, files de messages.
Pourquoi : Standard industrie, open source, self-hostable, parfait pour le chat temps réel et les notifications.

### Recherche & SEO
**Meilisearch** — Indexation et recherche full-text.
Pourquoi : Open source, écrit en Rust donc ultra rapide, self-hostable, parfait pour indexer les threads du forum et les rendre visibles sur Google.

### Backend
**TypeScript + Node.js + Fastify**
Pourquoi : TypeScript partout (cohérence front/back), Fastify 3x plus rapide qu'Express, modulaire par nature, communauté open source active.

### Temps réel réseau
**Socket.io** sur WebSockets natifs.
Pourquoi : Gère le fallback automatiquement, parfait pour le chat et les notifications live.

### Frontend
**SvelteKit**
Pourquoi : Plus léger que React, plus accessible pour les contributeurs communautaires, produit du HTML pur indexable par Google nativement. Un seul codebase pour web, desktop et mobile.

### Desktop
**Tauri**
Pourquoi : Open source, écrit en Rust, produit des .exe/.app/.sh ultra légers (~10MB vs 150MB pour Electron). Utilise le même code SvelteKit.

### Mobile
**Capacitor**
Pourquoi : Le même code SvelteKit devient une app iOS et Android native. Pas de réécriture en Swift ou Kotlin.

### Réseau P2P
**WireGuard** — Tunnel chiffré entre nœuds.
**DHT (Distributed Hash Table)** — Découverte des pairs (même technologie que BitTorrent).
**Gossip Protocol** — Synchronisation des données entre nœuds.
**STUN/TURN (Coturn)** — Fallback NAT traversal.

### Sécurité & Authentification
**Tokens JWT signés cryptographiquement** — Authentification sans identité réelle.
**Zero Knowledge Proof** — Prouver qu'on a le droit sans dire qui on est. Pas de KYC.
**Chiffrement E2E** — Intégré au cœur, pas optionnel.

### IA locale
**Ollama** — Modèles LLM locaux pour assistant communautaire et modération.
Pourquoi : Aucune donnée envoyée à OpenAI ou autre. 100% local, 100% privé.

### Résumé stack en une vue
```
PostgreSQL  ← Données permanentes
Redis       ← Cache, sessions, temps réel
Meilisearch ← Recherche & SEO
Fastify     ← API & logique métier
SvelteKit   ← Interface (web + desktop + mobile)
Socket.io   ← Chat & notifications live
Tauri       ← Packaging desktop (.exe/.app/.sh)
Capacitor   ← Packaging mobile (iOS/Android)
WireGuard   ← Tunnel réseau chiffré (Phase 3)
Ollama      ← IA locale
```

---

## 9. ARCHITECTURE MODULAIRE — LES RÈGLES ABSOLUES

```
H:\Projets\Nexus\
├── nexus-core\         ← SANCTUAIRE ABSOLU — le logiciel
├── nexus-frontend\     ← Interface SvelteKit
├── nexus-directory\    ← Annuaire global des instances (futur repo)
├── nexus-plugins\      ← Terrain communautaire
├── nexus-themes\       ← Design libre
└── nexus-docs\         ← Documentation ouverte

N:\Api_Serv\Nexus\
├── server\             ← Instance en production
├── data\               ← PostgreSQL + Redis
└── logs\               ← Logs serveur
```

### ⚠️ RÈGLE ABSOLUE — LE CORE EST INTOUCHABLE

**nexus-core ne peut être modifié par personne sans validation explicite du Chef de Projet.**

Le core contient :
- Le protocole réseau P2P
- Le système de chiffrement
- L'architecture des plugins (l'API que les plugins utilisent)
- La gestion des identités et tokens
- La logique de bootstrap réseau

Les contributeurs travaillent dans nexus-plugins et nexus-themes.
Les plugins ÉTENDENT Nexus. Ils ne MODIFIENT pas Nexus.
Si une tâche touche nexus-core, tu STOPS et tu demandes validation avant de continuer.

---

## 10. PHILOSOPHIE — CE QUI GUIDE CHAQUE DÉCISION

Avant de proposer quoi que ce soit, pose-toi ces questions :

1. **Est-ce que ça respecte la vie privée ?** Si ça envoie des données vers un tiers, c'est non.
2. **Est-ce que c'est self-hostable ?** Si ça dépend d'un service externe, c'est non.
3. **Est-ce que c'est open source ?** Si c'est propriétaire, c'est non.
4. **Est-ce que ça touche au core ?** Si oui, stop et validation humaine.
5. **Est-ce que c'est simple ?** Si une solution plus simple fait pareil, on prend la simple.
6. **Est-ce que ça respecte la MANIFESTO.md ?** Si non, c'est non.

---

## 11. LICENCE & LÉGAL

**AGPL-3.0** — Toute modification du code core doit être publiée. Impossible de faire une version propriétaire fermée.

**Clause anti-backdoor** : Nexus ne contiendra jamais de backdoor. Si une autorité l'exige, la communauté a le droit explicite de forker le projet.

**Hébergement multi-juridictions** : GitHub + Codeberg + GitLab simultanément. Si l'un tombe, les autres survivent.

---

## 12. ÉTAT D'AVANCEMENT ACTUEL

*Dernière mise à jour : 27 février 2026*

### Fait ✅

#### Infrastructure & base
- Vision produit définie et validée
- Stack technique arrêtée définitivement
- MANIFESTO.md écrit (FR + EN)
- Structure dossiers H: et N: créée
- Git initialisé — commits propres et sémantiques
- PostgreSQL connecté (nexus_user, DB nexus)
- Redis connecté (sessions, cache, rate limiting, heartbeat online)
- Iris nommée superviseure officielle 🐱
- **Docker** — docker-compose.yml (postgres:16 + redis:7 + nexus multi-stage build), migrations auto-run
- **Script seed** — 5 users, 2 communautés, 10 threads, 36 posts, idempotent, --reset flag

#### Backend — 13 migrations SQL
001 tables de base · 002 user_profiles · 003 grades · 004 social_links · 005 categories_parent ·
006 featured_threads · 007 reactions_thanks · 008 tags · 009 search_vector · 010 notifications ·
011 channels+messages · 012 chat_polish (édition/soft-delete) · 013 voice_channels

#### Backend — Routes API complètes
- **Auth** : register, login, logout (JWT + sessions Redis 7j, rate limiting)
- **Users** : profil complet, avatar/banner upload local, GitHub widget (cache Redis 1h)
- **Communities** : CRUD communautés, membres, grades (permissions JSONB)
- **Forum** : catégories hiérarchiques (CTE récursive), threads, posts, réactions emoji, thanks, tags (max 5), pin/lock/feature, HTML sanitization, mentions @
- **Chat REST** : channels (text+voice), historique paginé, autocomplete mentions
- **Notifications** : thread_reply, mention, post_thanks — liste, unread count, mark read
- **Search** : full-text PostgreSQL FTS (search_vector GiST, tsquery French locale, headlines)
- **Instance** : info publique, category tree, threads récents, tags CRUD, featured threads
- **Admin** : stats dashboard (activity 7j, top contributors), membres (rôle/kick), catégories CRUD, threads modération, channels CRUD + réordonner, branding upload (logo/banner)

#### Backend — Temps réel Socket.io
- **Chat WebSocket** : join/leave channel, send/edit/delete message, réactions toggle, typing indicator, mentions @username avec notifications, historique 50 derniers messages au join
- **Vocal WebRTC** : signaling P2P complet (SDP offer/answer, ICE candidates), seat management 8 max par channel, VAD (speaking detection), stats réseau (RTT/jitter/packet loss/P2P vs TURN), reconnexion/double-tab géré
- **Présence** : online/offline broadcast, liste initiale au connect, dedup par userId

#### Frontend — 20+ pages SvelteKit
- Homepage (stats live, arbre catégories, activité récente, featured threads)
- Forum : catégories → threads → thread view + replies (refonte visuelle complète)
- Auth : login (redirectTo), register, logout
- Chat : channels text + voice, typing, réactions, édition inline, mentions autocomplete, scroll infini, éditeur WYSIWYG modal (Ctrl+Maj+E)
- Profils : `/users/[username]` public, `/users/me/edit` édition
- Notifications : liste avec mark-read
- Search : résultats full-text avec highlights
- Admin : dashboard, membres, catégories, grades, tags, channels text/voice, settings, modération, AI settings
- Communities : annuaire (mock nexus-directory)
- SEO : sitemap.xml, rss.xml, robots.txt, llms.txt, JSON-LD Schema.org

#### Frontend — Composants
- **VoicePanel** — barre flottante : mute/deafen, PTT, avatars circulaires avec speaking animations, stats réseau live (RTT/jitter/perte/P2P vs TURN), volume peer-by-peer
- **MediaCenter** — screen sharing (`getDisplayMedia`), clip recording 60s rolling buffer, snapshots PNG
- **NexusEditor** — éditeur WYSIWYG rich text intégré
- **ProfileCard** — variants forum/full/chat/vocal, badge grade coloré
- **CategoryTree**, **PostReactions**, **NetworkDoctor**, **GitHubWidget**

#### Spec rédigée
- **Node** (`.specify/specs/013-node/`) — concept forum augmenté : états (actif/lent/stabilisé/archivé), anchors navigables (URL stables), résumé versionné, vue synthèse. À implémenter.

### En cours 🔨
- Cohérence visuelle forum (pages catégorie et thread en refonte)
- README.md self-hosting

### Pas encore commencé ⏳
- Meilisearch (actuellement : PostgreSQL FTS natif)
- nexus-directory vrai (annuaire global + sous-domaines nexus.io)
- Implémentation concept Node (spec rédigée, code à faire)
- NexusPoints (réputation communautaire)
- Réseau P2P WireGuard (Phase 3)
- Apps desktop Tauri / mobile Capacitor

---

## 13. LA ROADMAP RÉALISTE

### Phase 1 — MVP communauté (priorité absolue)
**Objectif : Une communauté peut s'installer, configurer son nom, et vivre sur Nexus**

1. Forum public indexable (catégories → threads → posts → SEO) ✅
2. Instance = communauté unique (`NEXUS_COMMUNITY_NAME` via .env)
3. Chat temps réel dans la communauté (Socket.io)
4. Self-hosting Docker en moins de 15 minutes ✅ (docker-compose.yml fait)
5. nexus-directory : annuaire + sous-domaines nexus.io

Tout le reste est un plugin. Sans exception.

### Phase 2 — Réseau de nœuds
Quand le MVP fonctionne et qu'il y a de vrais instances dans la nature.
- Instances privées s'enregistrent dans le nexus-directory
- Chaque instance héberge son propre contenu
- Le serveur officiel ne gère plus que l'annuaire
- Protocole de découverte inter-instances

### Phase 3 — P2P complet
Quand le réseau de nœuds est stable.
- WireGuard mesh entre nœuds
- DHT pour découverte des pairs
- Gossip protocol pour synchronisation
- Chat/vocal P2P direct (zéro transit serveur)

### Phase 4 — Enrichissement
- ~~Voix / vidéo WebRTC~~ ✅ WebRTC vocal P2P implémenté
- Whiteboard collaboratif
- Trello intégré
- Ollama IA locale (UI admin `/admin/ai` faite, intégration backend à compléter)

### Phase 5 — Mobile & Scale
- Apps iOS/Android via Capacitor
- Desktop via Tauri
- NexusPoints (réputation communautaire)
- Marketplace plugins

---

## 14. COMMENT TRAVAILLER AVEC LE CHEF DE PROJET

**Au début de chaque session :**
1. Lis ce fichier en entier
2. Vérifie l'état d'avancement (section 12)
3. Demande : "On continue sur [tâche en cours] ?"

**Pendant le travail :**
- Découpe chaque tâche en micro-étapes
- Valide chaque étape avant de passer à la suivante
- Si tu touches au core, STOP et demande validation
- Si tu as un doute sur un choix technique, propose 2 options MAX avec les pour/contre, laisse le Chef décider
- Jamais de sur-ingénierie. Simple > Complexe. Toujours.

**Si tu es perdu :**
Dis-le clairement. "Je ne suis pas sûr de la direction à prendre sur ce point." C'est mieux que d'inventer quelque chose qui déraille le projet.

**Ce que tu ne fais JAMAIS :**
- Remettre en question la stack technique
- Modifier le core sans validation
- Proposer des services propriétaires ou centralisés
- Ignorer ce fichier
- Partir dans une direction non validée par le Chef de Projet
- Proposer une architecture multi-communautés sur une seule instance

---

## 15. PROCHAINE TÂCHE RECOMMANDÉE

Le MVP communautaire est fonctionnellement complet (forum + chat texte + chat vocal WebRTC).

Priorités possibles selon décision du Chef de Projet :

1. **Implémenter le concept Node** — spec rédigée (`.specify/specs/013-node/`), prête à coder. Enrichissement forum avec états, anchors, résumé versionné, vue synthèse. Ne casse rien de l'existant.

2. **nexus-directory** — permettre aux premières vraies instances de s'enregistrer et apparaître dans l'annuaire public.

3. **Meilisearch** — remplacer le FTS PostgreSQL par Meilisearch pour une recherche plus rapide et pertinente.

4. **README self-hosting** — documenter l'installation Docker pour les premières communautés externes.

---

*Ce fichier est mis à jour après chaque session de travail.*
*Version : 3.0 — Février 2026*
*Projet : Nexus — L'internet communautaire libre*
*"Le réseau, ce sont les gens."*
