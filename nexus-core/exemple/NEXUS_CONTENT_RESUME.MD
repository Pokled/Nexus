# NEXUS — Reprise de session v2
### Fichier de reprise — À lire AVANT de commencer

---

## 🧠 Contexte rapide

Projet **Nexus** — Plateforme communautaire décentralisée open source.
Alternative anti-GAFA à Discord + forum phpBB style années 2000.
Chef de projet : humain non-dev avec vision claire. Tu exécutes, il valide.

**Fichier de référence absolu :**
```
H:\Projets\Nexus\nexus-core\NEXUS_CONTEXT.md
```
Lis-le en entier avant de faire quoi que ce soit.

---

## 📍 Où on en est exactement

### Serveur
```
Windows Server 2019
AMD FX-8370 8 cœurs 4GHz
16 Go RAM
HDD (SSD en commande)
IP locale : 192.168.1.100
```

### Structure disques
```
H:\Projets\Nexus\
├── .nexus-context\
│   └── manifesto.md
└── nexus-core\          ← Le repo Git principal
    ├── src\
    │   ├── index.ts     ← Serveur Fastify vivant port 3000
    │   └── fortunes.ts  ← Phrases aléatoires
    ├── i18n\
    │   ├── fr\
    │   │   ├── MANIFESTO.md
    │   │   └── THANKS.md
    │   └── en\
    │       ├── MANIFESTO.md
    │       └── THANKS.md
    ├── community\
    │   ├── IRIS.MD      ← Superviseure officielle 🐱
    │   └── iris.jpg
    ├── .gitignore
    ├── package.json
    ├── tsconfig.json
    └── NEXUS_CONTEXT.md

N:\Api_Serv\Nexus\
├── server\
├── data\
└── logs\
```

### Git — 12 commits propres
```
0fbdec6  docs: Mise à jour NEXUS_CONTEXT
121c5d5  feat: Iris superviseure officielle
00b6ad2  fix: Uniformisation THANKS.md
4d5ea8e  feat: Versions anglaises MANIFESTO + THANKS
4d2bb39  feat: Structure i18n
a159e93  feat: npm run dev fonctionnel
0086de6  feat: Fortunes aléatoires
b5d1f04  feat: Premier serveur Fastify vivant
19a2732  fix: .gitignore
a8a698b  feat: Fastify installé
c2e06b6  docs: ADN du projet
045a2ce  Initial commit — Nexus est né le 18/02/2026 à 23h37
```

---

## ⚙️ Stack installée sur le serveur

```
Node.js     v24.12.0   ✅
Git         v2.52.0    ✅
TypeScript  v5.9.3     ✅
Fastify     v5.7.4     ✅
ts-node     v10.9.2    ✅
```

### Commande pour lancer Nexus
```powershell
cd H:\Projets\Nexus\nexus-core
npm run dev
```
→ Accessible sur http://192.168.1.100:3000

### Règle firewall déjà ouverte
Port 3000 TCP ouvert sur Windows Server.

---

## 🚫 Problème Docker rencontré

Docker Desktop **ne fonctionne pas** sur Windows Server 2019.
Il requiert Windows 10 Pro 22H2 minimum.

### Solutions à explorer en priorité
1. **Docker Engine sans Desktop** (zip direct)
2. **WSL2 + Docker Engine** (recommandé pour Windows Server)
3. **PostgreSQL + Redis installés directement** sur Windows en attendant le SSD + migration OS

---

## 🎯 Prochaines tâches dans l'ordre

### Priorité 1 — Infrastructure
- [ ] Résoudre Docker sur Windows Server 2019
- [ ] Installer PostgreSQL
- [ ] Installer Redis
- [ ] Créer `docker-compose.yml` (ou équivalent)

### Priorité 2 — Documentation
- [ ] Écrire `ARCHITECTURE.md`
- [ ] Écrire `ROADMAP.md`
- [ ] Écrire `CONTRIBUTING.md`
- [ ] Créer `i18n/README.md` (guide traducteurs)

### Priorité 3 — MVP
- [ ] Premier modèle de données Forum (PostgreSQL)
- [ ] Route API `/forums` dans Fastify
- [ ] SvelteKit frontend basique

---

## 📋 Règles de travail rappel

- Toujours `cd H:\Projets\Nexus\nexus-core` avant Git ou npm
- Ne jamais toucher nexus-core sans validation chef de projet
- Commit après chaque étape importante
- Format commit : `type: description courte`
- Code et commentaires en **anglais**
- Interface utilisateur multilingue via i18n/

---

## 😺 Note importante

**Iris** est la superviseure officielle du projet.
Son approbation est implicitement requise pour tout commit.

---

*Session précédente : 18-19 février 2026*
*Prochaine session : reprendre sur Docker / PostgreSQL*
*"Le réseau, ce sont les gens."*