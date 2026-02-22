# NEXUS — VISION AUDIO & IMMERSION
### "Le son n'est pas une option, c'est l'émotion du réseau."

---

## 🎧 1. LA CHAÎNE DE TRAITEMENT (QUALITÉ STUDIO)
Pour que "Go Nexus" devienne la norme, le son doit être parfait, même avec un micro médiocre.

* **Codec Opus Full-Band :** Échantillonnage à 48kHz (qualité CD) par défaut.
* **DeepFilterNet (IA Locale) :** Remplacement de Krisp. Utilisation d'un modèle de deep learning ultra-léger (WASM) pour reconstruire la voix et supprimer 100% des bruits (clavier, travaux, vent).
* **Ducking Natif :** Baisse automatique du volume de la musique/ambiance dès qu'une voix est détectée.
* **Auto-Gain & Limiteur :** Personne ne sature, personne n'est inaudible. Nexus nivelle les volumes intelligemment.

---

## 🎵 2. LE SOCIAL JUKEBOX (MUSIQUE NATIVE)
La musique n'est plus un bot, c'est un membre de la pièce.

* **Platine P2P :** Diffusion de fichiers (MP3, FLAC) ou flux web en parfaite synchronisation millimétrée entre tous les participants.
* **Visualiseurs Réactifs :** L'interface (bordures de la table ronde, lumières du cinéma) réagit en temps réel aux fréquences de la musique.
* **File d'attente Démocratique :** Système de vote "Upvote/Downvote" sur la playlist en cours.

---

## 🚀 3. FONCTIONNALITÉS INNOVANTES (LES IDÉES FARFELUES)

### A. Le "Mur de Son" Spatial (Audio 3D)
* **L'idée :** Si l'avatar de ton pote est à gauche sur la "Table Ronde", tu l'entends à gauche dans ton casque. 
* **L'effet :** Une immersion totale. Si quelqu'un "s'approche" de ton avatar, le son devient plus fort et plus intime. On recrée la proximité physique.

### B. Le "Traducteur Universel" (IA Ollama)
* **L'idée :** Utiliser Whisper (via Ollama en local) pour transcrire et traduire en direct sous forme de sous-titres flottants au-dessus de l'avatar.
* **L'effet :** Un Français et un Japonais peuvent discuter dans un salon vocal Nexus. La barrière de la langue explose.

### C. Les "Zones d'Ombre" (Chuchotement)
* **L'idée :** Dans un grand salon (Cinéma), tu peux faire glisser ton avatar contre celui d'un autre membre pour créer une "bulle privée". 
* **L'effet :** Vous vous entendez entre vous à 100%, tandis que le reste du salon devient un murmure lointain (30%). Parfait pour les secrets ou les apartés sans quitter la pièce.

### D. La "Capsule Temporelle" Audio
* **L'idée :** Un bouton "Instant Replay" qui, grâce à la mémoire tampon locale, permet de réécouter les 30 dernières secondes (ex: "Il a dit quoi ? j'ai pas entendu").
* **L'effet :** Plus besoin de faire répéter, on a un contrôle total sur le flux temporel de la discussion.

### E. Synthèse Vocale de Présence
* **L'idée :** Si tu es en mode "Lecture seule" (au travail par exemple), tu tapes du texte et Nexus le transforme en voix (TTS) avec un timbre unique pour ton avatar.
* **L'effet :** Tu participes au vocal sans parler, avec une "voix" qui te représente.

---

## 🛠️ RÉSUMÉ TECHNIQUE POUR L'IMPLÉMENTATION
1.  **Transport :** WebRTC (Phase 3).
2.  **Traitement :** WebAssembly (WASM) pour RNNoise ou DeepFilterNet.
3.  **Synchro :** NTP-like via Socket.io pour la musique.
4.  **IA :** Ollama Connector pour la transcription/traduction optionnelle.

---

> "Dans Nexus, le silence est pur, la musique est partagée, et chaque voix a sa place dans l'espace."