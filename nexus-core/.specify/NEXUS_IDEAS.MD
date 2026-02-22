# NEXUS — Carnet d'idées
### Les bonnes idées notées avant d'être oubliées

---

> Ce fichier n'est PAS une spec.
> C'est un carnet de vision.
> Les idées ici seront transformées en specs quand leur phase arrivera.

---

## 💬 SPEC 005 — Chat temps réel

### Idées retenues
- Salons de chat par communauté et par catégorie
- Messages en temps réel via Socket.io
- Historique persistant en PostgreSQL
- ProfileCard `variant: 'chat'` — mini avatar inline à gauche du message
- Indicateur "en train d'écrire..."
- Réactions emoji sur les messages
- Mentions @username avec notification

### À décider
- Messages éphémères ou permanents ?
- Modération des messages (suppression, signalement) ?
- Threads dans les messages (reply) ?

---

## 🎤 SPEC 006 — Salons vocaux

### Idées retenues

#### Affichage adaptatif selon le nombre de participants
```
1 à 8 personnes   → TABLE RONDE
                    Avatars disposés en cercle
                    Chaises vides visibles (invitation à rejoindre)
                    Tout le monde est égal visuellement

9 à 20 personnes  → GRILLE
                    Avatars en grille régulière
                    Indicateur micro actif/coupé
                    Statut "parle en ce moment" mis en avant

21+ personnes     → SCÈNE
                    Speakers en avant (grands avatars)
                    Audience derrière (petits avatars)
                    Style conférence / concert
                    Main levée pour demander la parole
```

#### Vue "Table ronde" (1-8 personnes)
```
        🪑          🪑
    🪑      👤      🪑
        👤      👤
    🪑              🪑
        🪑          🪑

    3/8 participants
```
- Chaises vides = places disponibles (cliquer pour rejoindre)
- Chaises occupées = avatar du participant
- Animation subtile quand quelqu'un parle
- SVG animé, pas une image statique

#### Technique
- WebRTC pour l'audio P2P
- ProfileCard `variant: 'vocal'` déjà prévu
- Partage d'écran en Phase 3

### Philosophie
La forme du salon change selon la dynamique humaine.
Petit groupe = table ronde, tout le monde égal.
Grand groupe = scène, speakers et audience.
C'est la vraie vie, reproduite numériquement.

---

## ✍️ SPEC 007 — Éditeur de contenu (Tiptap)

### Vision
WYSIWYG puissant et intuitif. L'utilisateur n'écrit pas de code.
Il voit directement le résultat. Comme Notion, mais pour un forum.

### Stack retenue
- **Tiptap** (basé sur ProseMirror) — open source, extensible
- Stockage en base : **JSON ProseMirror** (pas HTML brut)
- Rendu : HTML sanitisé côté serveur

### Fonctionnalités prévues

#### Formatage texte
- Gras, Italique, Souligné, Barré
- Titres H1 H2 H3
- Couleur de texte

#### Médias
- Images par URL ou upload
- GIFs animés — picker Tenor/Giphy intégré
- Lecteur vidéo embarqué automatique
  (coller un lien YouTube/Twitch/Vimeo → embed automatique)

#### Mise en page
- Listes à puces et numérotées
- Tableaux
- Citations (blockquote)
- Séparateur horizontal
- Spoiler (contenu masqué, révélé au clic)

#### Code
- Code inline
- Bloc de code avec coloration syntaxique (50+ langages)

#### Interactivité
- Emojis — picker complet (emoji-mart)
- Mentions @username avec suggestion
- Sondage intégré dans un post

### Extensions Tiptap nécessaires
```
@tiptap/extension-image
@tiptap/extension-color
@tiptap/extension-table
@tiptap/extension-mention
tiptap-extension-video
emoji-mart
giphy-js
lowlight (coloration syntaxique)
```

### Stockage
```json
{
  "type": "doc",
  "content": [
    { "type": "paragraph", "content": [...] }
  ]
}
```
JSON en base → rendu HTML sécurisé à l'affichage.
Jamais de HTML brut stocké directement.

---

## 🎨 Autres idées en vrac

### Personnalisation du profil
- Thème de couleur personnalisé pour son profil
- Badge "Fondateur" pour les membres avant la v1.0
- Trophées communautaires (décernés par les admins)

### Forum
- Mode "Question / Réponse" pour les threads techniques
  (une réponse marquée comme "Solution" par l'auteur)
- Polls / sondages dans les threads
- Tags sur les threads (filtrables)

### Communauté
- Événements communautaires avec date/heure
- Annonces épinglées avec durée configurable
- Statistiques publiques de la communauté
  (membres actifs, posts par jour, etc.)

### Nexus Points (réputation)
- Gagner des points en postant, recevant des likes
- Perdre des points si posts signalés et supprimés
- Paliers de réputation avec badges automatiques
  Ex: 0-100pts "Nouveau", 100-500pts "Régulier", 500+ "Vétéran"
- Les points sont par communauté ET globaux

### Self-hosting
- Interface d'administration web (pas juste CLI)
- Tableau de bord santé du serveur
- Backup automatique PostgreSQL configurable
- Migration facile depuis phpBB / Discourse

---

## 🌐 Vision réseau P2P et annuaire

### Modèle exact de Nexus

Nexus est DEUX choses simultanément :
1. Un logiciel de communauté (forum + chat + vocal)
2. Un nœud de réseau P2P

### Annuaire global (nexus-directory)

Repo séparé : `nexus-directory`
Hébergé sur le serveur officiel Nexus

```
Quelqu'un installe Nexus en Australie
→ Il remplit : nom, description, langue, thématique, pays
→ Son instance s'enregistre dans l'annuaire
→ Il reçoit automatiquement un sous-domaine :
  australia-gaming.nexus.io
→ Il apparaît dans l'annuaire public
→ N'importe qui peut le trouver et le rejoindre
```

### Sous-domaines gratuits nexus.io

```
Domaine nexus.io          ~15€/an
SSL wildcard Let's Encrypt   0€
DNS wildcard                 0€
Nginx reverse proxy          0€

Total : ~15€/an pour héberger 700+ instances
```

### Évolution des coûts avec le P2P

```
Phase 1 — 0 à 50 nœuds
Ton serveur fait tout
~0-6€/mois

Phase 2 — 50 à 700 nœuds
Chaque instance héberge son contenu
Ton serveur gère uniquement l'annuaire
~6-20€/mois

Phase 3 — 700+ nœuds P2P actifs
WireGuard mesh complet
Les nœuds se parlent directement
Ton serveur devient presque invisible
~30€/mois MAX peu importe le nombre de nœuds
```

### La beauté du modèle P2P

```
Aujourd'hui
100% du trafic → ton serveur

Avec P2P complet
Annuaire        → ton serveur (léger)
Contenu forum   → chaque nœud (distribué)
Chat/vocal      → P2P direct (zéro transit)
Fichiers/médias → CDN distribué (zéro transit)
```

Comme BitTorrent — plus il y a d'utilisateurs,
plus le réseau est fort et moins le serveur central travaille.
Ton serveur à 30€/mois pourrait tenir des millions d'utilisateurs.

### Phases d'implémentation réseau
```
Phase 1  Serveurs publics officiels (1-2 serveurs)
Phase 2  Instances privées rejoignent comme nœuds
Phase 3  WireGuard mesh P2P complet
         DHT pour découverte des pairs
         Gossip protocol pour synchronisation
```

---

## 🚫 Idées rejetées et pourquoi

```
OAuth Google        → Donne des données aux GAFA, contre le Manifeste
Electron desktop    → Trop lourd, Tauri est la bonne réponse
Crypto / NFT        → Hors sujet, contre l'esprit communautaire
Publicité           → Jamais, principe fondateur
Serveur central     → Contre la décentralisation
```

---

*"Le réseau, ce sont les gens."*
*Mis à jour : Février 2026*