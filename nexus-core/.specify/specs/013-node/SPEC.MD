# Node (Nœud)

## Définition

Un **Node** est une discussion structurée et durable.  
Il est conçu pour évoluer dans le temps et devenir, si la communauté le souhaite, une **référence collective**.

Un Node n’est ni un chat, ni un wiki strict, ni une todo-list.  
Il peut emprunter à ces formats sans jamais perdre son historique ni sa liberté.

> Nexus ne gouverne pas les Nodes.  
> Chaque instance décide de leur usage, de leur visibilité et de leur cycle de vie.

---

## Philosophie

- Le **temps** est une fonctionnalité
- La **qualité** prime sur la vitesse
- La **mémoire** est aussi importante que la discussion
- Rien n’est obligatoire, tout est **opt-in**

Un Node peut rester une simple discussion.  
Il peut aussi mûrir, se structurer et devenir un point de connaissance.

---

## États possibles d’un Node

Les états sont indicatifs.  
Ils n’imposent aucun workflow.

- **Actif**  
  Discussion ouverte, contributions libres.

- **Lent**  
  Contributions réfléchies, pas d’urgence, pas de pression temporelle.

- **Stabilisé**  
  Le contenu est considéré comme fiable à un instant donné.

- **Archivé**  
  Lecture seule. Le Node reste visible, référencé et consultable.

---

## Composants d’un Node

Un Node peut contenir :

- un **résumé** (optionnel)
- des **messages**
- certains messages peuvent devenir des **Anchors**
- une **vue synthèse** (optionnelle)

Aucun composant n’est obligatoire.

---

## Résumé

Le résumé :
- est éditable
- est versionné
- reflète l’état actuel du Node
- peut être maintenu par la communauté ou un gardien

Il permet de comprendre l’essentiel sans relire l’intégralité du Node.

---

## Anchors (Ancrages)

Un **Anchor** est un message identifié comme structurant.

Un Anchor :
- possède une URL stable
- peut être référencé par la recherche Nexus
- peut être lié depuis d’autres Nodes
- reste ancré dans son contexte (pas extrait du fil)

Les Anchors transforment un Node en espace navigable.

---

## Vue synthèse

La vue synthèse est une **lecture alternative** du Node.

Elle permet :
- de visualiser les sections clés
- d’accéder directement aux Anchors
- de comprendre rapidement l’état d’avancement

La vue synthèse ne duplique pas le contenu.

---

## Visibilité et fédération

Chaque Node peut être :

- privé
- visible uniquement sur l’instance
- fédéré
- indexable par le moteur Nexus
- indexable par des moteurs externes (si l’admin le souhaite)

Même un Node non visible peut contribuer au réseau (relais, résilience).

---

## Modération et édition

- La modération reste **locale à l’instance**
- L’édition communautaire est possible via :
  - propositions
  - validation humaine
  - historique des versions

L’IA peut assister (signalement, résumé), mais **ne décide jamais**.

---

## Ce qu’un Node n’est pas

- pas un flux
- pas un feed algorithmique
- pas un système de réputation globale
- pas un outil de performance sociale

Un Node est un **lieu**, pas un score.

---

## Intention

Les Nodes existent pour :
- préserver la connaissance
- favoriser les discussions longues
- permettre la découverte sans centralisation
- redonner de la profondeur au Web

Un Node peut vivre longtemps.  
Il n’a aucune obligation de disparaître.


exemple idée de ce node. (A améliorer agrémenter.)

<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8" />
<title>Nexus – Thread lent</title>

<style>
body {
  font-family: system-ui, sans-serif;
  background: #f6f6f6;
  margin: 0;
  padding: 2rem;
  color: #222;
}

.thread {
  max-width: 900px;
  margin: auto;
  background: #fff;
  padding: 1.5rem;
  border-radius: 6px;
  box-shadow: 0 0 0 1px #ddd;
}

.thread h1 {
  margin-top: 0;
}

.notice {
  background: #eef4ff;
  border-left: 4px solid #4a6ee0;
  padding: 0.75rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.summary {
  background: #fafafa;
  border: 1px solid #ddd;
  padding: 1rem;
  margin-bottom: 1rem;
}

.summary small {
  color: #666;
}

.toolbar {
  margin-bottom: 1rem;
}

.toolbar button {
  margin-right: 0.5rem;
}

.anchors {
  background: #f0f0f0;
  padding: 0.75rem;
  margin-bottom: 1rem;
}

.anchors a {
  display: block;
  font-size: 0.9rem;
  color: #333;
  text-decoration: none;
}

.post {
  border-top: 1px solid #eee;
  padding: 1rem 0;
}

.post.anchor {
  background: #fffbe6;
  border-left: 4px solid #e6c200;
  padding-left: 0.75rem;
}

.meta {
  font-size: 0.8rem;
  color: #666;
}

.hidden {
  display: none;
}
</style>
</head>

<body>

<div class="thread">

  <h1>P2P derrière NAT : retours d’expérience</h1>

  <div class="notice">
    Ce sujet est pensé pour durer.  
    Les réponses rapides n’ont aucun intérêt ici.
  </div>

  <div class="summary">
    <strong>Résumé</strong><br />
    Nexus permet un P2P fonctionnel derrière NAT grâce à WebRTC,
    un relais de courtoisie et une signalisation légère.
    <br /><small>Dernière mise à jour : v3 – 12 février 2026</small>
  </div>

  <div class="toolbar">
    <button onclick="showDiscussion()">Vue discussion</button>
    <button onclick="showSynthesis()">Vue synthèse</button>
  </div>

  <div class="anchors">
    <strong>Sommaire</strong>
    <a href="#a1">Problème initial</a>
    <a href="#a2">Solution WebRTC + TURN light</a>
    <a href="#a3">Tests 4G / VPS de courtoisie</a>
  </div>

  <div id="discussion">

    <div class="post anchor" id="a1">
      <div class="meta">Alice — 3 janvier</div>
      <strong>[Problème]</strong><br />
      Les connexions P2P échouent souvent derrière NAT strict ou CGNAT.
    </div>

    <div class="post anchor" id="a2">
      <div class="meta">Bob — 6 janvier</div>
      <strong>[Solution]</strong><br />
      Utilisation de WebRTC avec TURN intégré à l’API Nexus.
    </div>

    <div class="post anchor" id="a3">
      <div class="meta">Charlie — 10 janvier</div>
      <strong>[Retour terrain]</strong><br />
      Tests validés en LAN, 4G et distant. Relais uniquement en fallback.
    </div>

    <div class="post">
      <div class="meta">Dave — 15 janvier</div>
      Discussion complémentaire et nuances…
    </div>

  </div>

  <div id="synthesis" class="hidden">
    <h3>Synthèse</h3>
    <ul>
      <li>✔ Problème NAT identifié</li>
      <li>✔ Solution WebRTC validée</li>
      <li>✔ Tests terrain concluants</li>
    </ul>
    <p>
      Ce sujet constitue une référence pour les déploiements Nexus
      en environnement contraint.
    </p>
  </div>

</div>

<script>
function showDiscussion() {
  document.getElementById("discussion").classList.remove("hidden");
  document.getElementById("synthesis").classList.add("hidden");
}

function showSynthesis() {
  document.getElementById("discussion").classList.add("hidden");
  document.getElementById("synthesis").classList.remove("hidden");
}
</script>

</body>
</html>



NODE_SCHEMA.md (tech + data, minimal)

UX adaptée à ton forum actuel (ce que tu ajoutes, pas ce que tu casses)

Tu peux copier-coller tel quel.

📄 NODE_SCHEMA.md
# Node – Schema minimal

Ce document décrit la structure minimale d’un Node dans Nexus.
Le schema est volontairement simple et extensible.

---

## Identité

Un Node est identifié par :

- `node_id` (UUID / hash)
- `instance_id` (instance propriétaire)
- `slug` (lisible, optionnel)
- `created_at`
- `updated_at`

---

## Métadonnées

```json
{
  "title": "P2P derrière NAT",
  "state": "lent",
  "visibility": "federated",
  "tags": ["p2p", "network", "webrtc"],
  "language": "fr"
}
États (state)

active

lent

stabilized

archived

Visibilité (visibility)

private

local

federated

indexable

Contenu
Messages (posts)

Chaque message :

appartient à un Node

conserve son ordre chronologique

n’est jamais réécrit

{
  "post_id": "uuid",
  "author_id": "uuid",
  "content": "texte",
  "created_at": "...",
  "is_anchor": false
}
Anchors (Ancrages)

Un Anchor est un post marqué comme structurant.

{
  "anchor_id": "a7",
  "post_id": "uuid",
  "label": "Solution WebRTC",
  "indexable": true
}

Caractéristiques :

URL stable : /node/{id}#a7

indexable indépendamment

toujours lié à son contexte

Résumé

Le résumé est un objet séparé du fil.

{
  "summary": "Synthèse actuelle du Node...",
  "version": 3,
  "updated_at": "...",
  "editor_id": "uuid"
}

versionné

éditable

optionnel

Vue synthèse

La vue synthèse est une projection du Node :

résumé

anchors

état

Aucune donnée dupliquée.

Historique & édition

aucune suppression destructive

toute modification crée une version

propositions possibles avant validation

Fédération & recherche

Un Node peut exposer :

ses métadonnées

son résumé

ses anchors

Le contenu brut reste local sauf choix explicite.

Dépendances

Un Node ne dépend :

ni d’un service central

ni d’un moteur externe

Il reste valide hors ligne.


---

# 🎛️ UX – Adaptation à **pokled.ddns.net**

Objectif :  
👉 **transformer certaines catégories du forum en Nodes**  
👉 sans casser l’existant  
👉 sans choquer les utilisateurs actuels

---

## 1️⃣ Où apparaissent les Nodes ?
### Nouvelle catégorie (ou sous-catégorie)
**📂 Nodes / Nœuds**

Visuellement :
- même layout que les threads
- badge discret `NODE`
- icône 🧠 ou 🔗

👉 Rien de nouveau à apprendre.

---

## 2️⃣ En-tête d’un Node (clé UX)

En haut du thread :


🧠 Node — État : Lent
Ce Node est pensé pour durer. Prenez votre temps.


Puis :


Résumé
[ contenu ]
Dernière mise à jour : v3
[ proposer une modification ]


👉 **Le résumé est LA différence visible.**

---

## 3️⃣ Anchors dans le fil
Un message marqué Anchor :
- fond légèrement différent
- bord gauche coloré
- icône 🔗


🔗 Anchor — Solution WebRTC


- clic → lien direct
- visible dans le sommaire

---

## 4️⃣ Sommaire automatique (colonne ou bloc)
En haut ou à droite :


Sommaire du Node
• Problème initial
• Solution WebRTC
• Tests terrain


👉 Généré à partir des Anchors  
👉 Très fort pour la lisibilité

---

## 5️⃣ Vue Synthèse (toggle simple)
Bouton discret :


[ Discussion ] [ Synthèse ]


Synthèse affiche :
- résumé
- état
- anchors
- statut (stabilisé / en cours)

👉 Pas une autre page, **une autre lecture**.

---

## 6️⃣ Lenteur induite (sans forcer)
Dans un Node :
- pas de bump agressif
- pas de compteur de messages
- dates visibles
- message avant réponse :

> “Ce Node privilégie les réponses réfléchies.”

---

## 7️⃣ Recherche Nexus
Dans les résultats :
- Node apparaît comme entité
- Anchor apparaît comme résultat précis
- score basé sur :
  - stabilité
  - clarté
  - références croisées
  - pas sur l’activité

---

## 8️⃣ Ce que TU N’AS PAS à faire
❌ Repenser tout le forum  
❌ Ajouter des rôles lourds  
❌ Créer un workflow complexe  
❌ Forcer l’usage des Nodes  

Les Nodes doivent **s’imposer par leur utilité**, pas par règle.

---

## 🧭 Résumé clair
- Forum = base
- Node = **forum augmenté par la mémoire**
- Anchors = navigation
- Résumé = transmission
- Synthèse = lisibilité

---


Bien evidement respecter le format svelte et les techno core de Nexus. Pas d'ajout de nouveau language qui obligerait d'implementer de nouveaux outils techno serveur etc. 