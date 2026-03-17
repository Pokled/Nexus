# Moteur Neural — Nodyx Guard Protocol

Nodyx intègre un Moteur Neural alimenté par une instance [Ollama](https://ollama.com) locale. Votre IA tourne sur votre propre matériel. Aucune donnée ne quitte votre serveur.

---

## Nodyx Guard Protocol

Le Guard Protocol est le système de modération du chat piloté par le Moteur Neural. Lorsqu'un message est envoyé, il est analysé par le LLM local qui retourne un **score de toxicité de 0 à 10**. Si le score dépasse le seuil (**8 par défaut**), le message est automatiquement supprimé et remplacé dans l'interface par :

```
🤖 Nodyx Guard Protocol
   Transmission neutralisée : Contenu toxique détecté
```

### Ce qu'il filtre actuellement

| Filtre | Statut |
|---|---|
| Grossièretés / insultes | ✅ Fonctionnel |
| Spam (texte répété / flooding) | ✅ Fonctionnel |
| Blocage d'URLs | ⚠️ Partiel — pas encore fiable |
| Discours haineux | ✅ Fonctionnel (dépend du modèle) |
| Menaces | ✅ Fonctionnel (dépend du modèle) |

### Comment fonctionne le score

Le LLM reçoit le message et retourne un score de toxicité entre 0 et 10 :

| Score | Signification | Action |
|---|---|---|
| 0–4 | Propre / bénin | Message délivré normalement |
| 5–7 | Limite | Message délivré, enregistré |
| 8–10 | Toxique / nuisible | Message supprimé automatiquement — Guard Protocol déclenché |

Le seuil est configurable. Un seuil plus bas = modération plus agressive.

---

## Modèle actif

Le modèle actif est configuré dans `nodyx-core/neural-config.json` :

```json
{
  "activeModel": "qwen2.5:3b"
}
```

`qwen2.5:3b` est le modèle recommandé pour les tâches de modération — suffisamment léger pour tourner sur du matériel modeste (4 Go de VRAM), suffisamment rapide pour l'analyse en temps réel du chat.

---

## Prérequis

- Ollama installé et en cours d'exécution sur la même machine que Nodyx
- Au moins un modèle téléchargé (voir les modèles recommandés ci-dessous)
- Caddy configuré pour proxy `/ollama/` → `localhost:11434` *(pour le scanner du panneau admin)*

---

## Installation

### 1. Installer Ollama

```bash
# Linux
curl -fsSL https://ollama.com/install.sh | sh

# macOS
brew install ollama

# Windows
# Télécharger depuis https://ollama.com/download
```

### 2. Télécharger le modèle recommandé

```bash
ollama pull qwen2.5:3b     # recommandé — rapide, précis, faible VRAM
```

Modèles alternatifs :

| Modèle | Taille | VRAM | Notes |
|---|---|---|---|
| `qwen2.5:3b` | 2.0 Go | 4 Go | **Recommandé** — rapide, bonne précision |
| `llama3.2:3b` | 2.0 Go | 4 Go | Bonne alternative |
| `mistral` | 4.1 Go | 6 Go | Meilleure qualité, plus lourd |
| `llama3.1:8b` | 4.9 Go | 8 Go | Meilleure précision |

### 3. Configurer le proxy Caddy *(pour le panneau admin)*

```caddyfile
handle /ollama/* {
    uri strip_prefix /ollama
    reverse_proxy localhost:11434
}
```

### 4. Sélectionner le modèle dans le panneau admin

1. Aller dans **Admin → Moteur Neural**
2. Cliquer sur **Scanner Ollama**
3. Cliquer sur **Activer** à côté du modèle souhaité

La sélection est sauvegardée dans `nodyx-core/neural-config.json` et prend effet immédiatement.

---

## Panneau admin

Le panneau Moteur Neural se trouve à `/admin/ai` (barre latérale Admin → **Instance → Moteur Neural**).

| Élément | Description |
|---|---|
| Jauge de disponibilité | Barre de 12 segments — violet = Ollama prêt, rouge = inaccessible |
| Liste des modèles | Tous les modèles détectés sur votre instance Ollama, avec la taille en Go |
| Indicateur actif | Point violet à côté du modèle actuellement sélectionné |
| Bouton Scanner | Re-scanne Ollama pour les modèles ajoutés ou supprimés |

---

## Confidentialité

Le Moteur Neural repose sur un principe fondamental : **votre IA, vos données, vos règles**.

- Toute l'inférence s'exécute localement — aucun appel à OpenAI, Anthropic, ou une API externe
- Le contenu des messages analysés par le LLM ne quitte jamais votre serveur
- Le proxy Caddy garantit qu'Ollama n'est pas exposé à l'internet public
- Vous choisissez le modèle, et vous pouvez l'arrêter à tout moment

---

## Feuille de route

| Fonctionnalité | Statut |
|---|---|
| Détection Ollama + liste des modèles | ✅ Fait |
| Sélection du modèle (admin UI + fichier config) | ✅ Fait |
| Scoring de toxicité du chat (0–10) | ✅ Fait |
| Suppression automatique au-dessus du seuil | ✅ Fait |
| Interface Guard Protocol | ✅ Fait |
| Blocage d'URLs | ⚠️ Partiel — en cours |
| Résumé de threads | ⏳ Prévu — Phase 4 |
| Suggestions de modération pour les admins | ⏳ Prévu — Phase 4 |
| Seuil configurable via panneau admin | ⏳ Prévu — Phase 4 |
