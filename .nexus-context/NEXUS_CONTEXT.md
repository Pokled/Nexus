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
Discord, Facebook et les GAFA ont centralisé les communautés. Des millions de discussions, tutoriels, et savoir collectif sont enfermés dans des silos privés — invisibles pour Google, inaccessibles sans compte, condamnés à disparaître si la plateforme ferme. Nexus répare ça. (referencement réactivé)

**Ce que Nexus offre concrètement :**
- Forums publics indexables par Google (le savoir appartient à internet)
- Chat temps réel communautaire
- Voix / partage d'écran
- Partage de fichiers
- Whiteboard collaboratif
- Système de tâches (type Trello)
- Profils humains riches
- IA locale intégrée (Ollama) pour assistance et modération
- Architecture plugin/module (comme Joomla)
- Self-hosting total — chacun héberge son instance

**Le réseau Nexus :**
Le réseau CE SONT LES GENS. Pas des datacenters centralisés. Chaque installation Nexus est simultanément client ET nœud. Comme BitTorrent. Plus il y a d'utilisateurs, plus le réseau est fort et résilient.

Deux serveurs publics existent UNIQUEMENT pour :
- Distribuer les mises à jour logiciel
- Servir de bootstrap pour trouver ses premiers pairs

C'est tout. Ils ne stockent aucune donnée utilisateur.

---

## 3. CE QUE NEXUS N'EST PAS — LES DÉRIVES INTERDITES

❌ Nexus n'est PAS un clone de Discord. Ne propose jamais une architecture qui y ressemble.
❌ Nexus n'est PAS centralisé. Ne propose jamais de serveur central qui stocke les données.
❌ Nexus n'est PAS une cryptomonnaie. Les NexusPoints sont des points de réputation, pas une crypto échangeable.
❌ Nexus n'est PAS construit sur Electron. Jamais. Trop lourd, trop lent.
❌ Nexus n'est PAS dépendant de services tiers propriétaires (AWS, Google Cloud, Azure, Vercel, Railway).
❌ Nexus n'est PAS un projet qui repart de zéro à chaque session. Tu lis ce fichier et tu continues là où on s'est arrêtés.

---

## 4. STACK TECHNIQUE — IMMUABLE

Ces choix sont définitifs. Tu ne les remets pas en question. Tu ne proposes pas d'alternatives sauf si une faille de sécurité critique est découverte, et seulement après validation humaine.

### Base de données
**PostgreSQL** — Données permanentes et relationnelles.
Pourquoi : Nexus a des données très relationnelles (users → communautés → catégories → threads → posts). PostgreSQL est open source, battle-tested, tient des millions d'utilisateurs, full-text search natif, JSON natif pour les plugins.
Pas MongoDB (chaos à l'échelle), pas SQLite (pas de production), pas MySQL (limitations).

### Cache & Temps réel
**Redis** — Sessions, cache, pub/sub, files de messages.
Pourquoi : Standard industrie, open source, self-hostable, parfait pour le chat temps réel et les notifications.

### Recherche & SEO
**Meilisearch** — Indexation et recherche full-text.
Pourquoi : Open source, écrit en Rust donc ultra rapide, self-hostable, parfait pour indexer les threads du forum et les rendre visibles sur Google.

### Backend
**TypeScript + Node.js + Fastify**
Pourquoi : TypeScript partout (cohérence front/back), Fastify 3x plus rapide qu'Express, modulaire par nature, communauté open source active.
Pas Python (performances réseau limitées, spaghetti à grande échelle), pas Go (courbe d'apprentissage pour la communauté).

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
WireGuard   ← Tunnel réseau chiffré
Ollama      ← IA locale
```

---

## 5. ARCHITECTURE MODULAIRE — LES RÈGLES ABSOLUES

```
H:\Projets\Nexus\
├── nexus-core\         ← SANCTUAIRE ABSOLU
├── nexus-plugins\      ← Terrain communautaire
├── nexus-themes\       ← Design libre
├── nexus-docs\         ← Documentation ouverte
└── .nexus-context\     ← CE DOSSIER (contexte agent)

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

## 6. PHILOSOPHIE — CE QUI GUIDE CHAQUE DÉCISION

Avant de proposer quoi que ce soit, pose-toi ces questions :

1. **Est-ce que ça respecte la vie privée ?** Si ça envoie des données vers un tiers, c'est non.
2. **Est-ce que c'est self-hostable ?** Si ça dépend d'un service externe, c'est non.
3. **Est-ce que c'est open source ?** Si c'est propriétaire, c'est non.
4. **Est-ce que ça touche au core ?** Si oui, stop et validation humaine.
5. **Est-ce que c'est simple ?** Si une solution plus simple fait pareil, on prend la simple.
6. **Est-ce que ça respecte la MANIFESTO.md ?** Si non, c'est non.

---

## 7. LICENCE & LÉGAL

**AGPL-3.0** — Toute modification du code core doit être publiée. Impossible de faire une version propriétaire fermée.

**Clause anti-backdoor** : Nexus ne contiendra jamais de backdoor. Si une autorité l'exige, la communauté a le droit explicite de forker le projet.

**Hébergement multi-juridictions** : GitHub + Codeberg + GitLab simultanément. Si l'un tombe, les autres survivent.

---

## 8. ÉTAT D'AVANCEMENT ACTUEL

### Fait ✅
- Vision produit définie et validée
- Stack technique arrêtée définitivement
- MANIFESTO.md écrit et validé
- Structure dossiers serveur définie
- Serveur : Windows Server 2019, AMD FX-8370, 16Go RAM, RX 570
- Drivers AMD installés (méthode INF manuelle)
- Disques : HDD pour l'instant, SSD en commande pour N:\Api_Serv

### En cours 🔨
- ARCHITECTURE.md à écrire
- STACK.md à écrire
- ROADMAP.md à écrire
- CONTRIBUTING.md à écrire
- Structure dossiers à créer sur H:\Projets\Nexus\

### Pas encore commencé ⏳
- Installation Node.js, PostgreSQL, Redis, Meilisearch sur le serveur
- Premier commit nexus-core
- Développement du forum indexable (priorité absolue MVP)

---

## 9. LA ROADMAP RÉALISTE

### Phase 1 — MVP (priorité absolue)
**Objectif : Une communauté peut s'installer et vivre sur Nexus**

Uniquement ces 3 choses, rien d'autre :
1. Forum public indexable (catégories → threads → posts → SEO)
2. Chat temps réel dans les communautés
3. Self-hosting en Docker en moins de 15 minutes

Tout le reste est un plugin. Sans exception.

### Phase 2 — Réseau P2P
Quand le MVP fonctionne et qu'il y a de vrais utilisateurs.
- WireGuard mesh
- DHT peer discovery
- Gossip protocol sync

### Phase 3 — Enrichissement
Quand le réseau P2P est stable.
- Voix / vidéo
- Whiteboard
- Trello intégré
- Ollama IA

### Phase 4 — Mobile & Scale
- Apps iOS/Android via Capacitor
- NexusPoints (réputation communautaire)
- Marketplace plugins

---

## 10. COMMENT TRAVAILLER AVEC LE CHEF DE PROJET

**Au début de chaque session :**
1. Lis ce fichier en entier
2. Vérifie l'état d'avancement (section 8)
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

---

## 11. PROCHAINE TÂCHE IMMÉDIATE

**Écrire ARCHITECTURE.md**

Ce fichier explique chaque choix technique avec son raisonnement. Pourquoi PostgreSQL et pas MongoDB. Pourquoi Fastify et pas Express. Pourquoi SvelteKit et pas React. Etc.

C'est le document qui évite les débats futiles dans la communauté. Chaque décision est documentée, argumentée, datée.

---

*Ce fichier est mis à jour après chaque session de travail.*
*Version : 1.0 — Février 2026*
*Projet : Nexus — L'internet communautaire libre*
*"Le réseau, ce sont les gens."*
