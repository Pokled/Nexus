# NEXUS — Vision des Salons Vocaux Innovants
### "Sortir du lot : Transformer la communication en expérience spatiale"

---

## 🎯 LA PHILOSOPHIE
Nexus ne veut pas être un "outil de réunion" de plus. L'objectif est de recréer la sensation physique d'être dans une pièce avec d'autres humains, tout en utilisant la puissance du numérique pour l'aspect collaboratif.

---

## 🖼️ CONCEPT 1 : LES SCÈNES DYNAMIQUES (UX)
Le salon ne doit pas être une grille fixe, mais un environnement qui s'adapte au contexte.

### A. La Table Ronde (1 à 8 personnes)
* **Visuel :** Les avatars sont disposés en cercle.
* **Interaction :** On voit des "chaises vides" qui symbolisent la place disponible, invitant au rapprochement.
* **Focus :** Idéal pour les discussions intimes, les petits groupes de travail ou les amis.

### B. L'Amphithéâtre / Cinéma (9 à 25+ personnes)
* **Visuel :** Les avatars des auditeurs sont dans des "gradins" en bas de l'écran. Le(s) haut-parleur(s) sont sur une "scène" en haut.
* **La Toile de Cinéma :** Si un utilisateur partage son écran ou une vidéo, elle s'affiche comme un projecteur sur le mur de fond de la scène.
* **Immersion :** Les avatars des spectateurs sont "assis" devant le contenu, créant une expérience de visionnage collectif (Watch Party).

---

## 🎭 CONCEPT 2 : L'AVATAR VIVANT (UI)
L'avatar (le "bonhomme") n'est pas une image morte, c'est un hub d'état.

* **L'Effet Outline (Halo) :** Un contour lumineux s'active autour de l'avatar quand il parle.
* **Bulles d'Action :**
    * *Bulle de texte :* Apparaît quand l'utilisateur tape un message dans le chat du salon (évite de couper la parole).
    * *Bulle Emoji :* Les réactions jaillissent de l'avatar.
* **États Organiques :**
    * *Sommeil (zZzz) :* L'avatar change de posture ou devient translucide si l'utilisateur est AFK.
    * *Silence (Mute) :* L'avatar a une expression ou un signe visuel clair (bouche masquée ou tête baissée).

---

## 📂 CONCEPT 3 : L'ESPACE DE PARTAGE CENTRAL
Le centre du salon (la table ou la scène) est une zone de dépôt interactive.

* **Objets Partagés :** Si je glisse un fichier PDF ou une image dans le salon, il apparaît visuellement "posé" au centre.
* **Consultation Collective :** Tout le monde peut cliquer sur l'objet central pour l'ouvrir, mais on voit toujours qui est en train de le regarder (petit indicateur sur l'avatar).

---

## 🛠️ RÉFLEXIONS TECHNIQUES (Pour l'Agent)
* **Moteur :** Utilisation de Svelte + CSS Grid/Flexbox + Framer Motion (ou équivalent Svelte) pour la fluidité.
* **Performance :** Rendu léger pour supporter les configurations comme le FX-8370. Priorité au SVG pour les avatars.
* **Protocole :** WebRTC P2P (Phase 3) pour la voix et le flux vidéo de la "toile".

---

> **Note du Chef de Projet :** Ce document est un carnet de vision. Il sera transformé en SPECS techniques lors du lancement de la Phase 3.