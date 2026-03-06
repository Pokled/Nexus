# Table Templates — Thèmes de la Table collaborative

Un **table template** définit l'identité visuelle d'un salon vocal dans Nexus :
surface de la table, couleurs, texture, widgets activés par défaut.

L'hôte du salon choisit le template. Il est synchronisé via DataChannel
(`table:theme:set`) — tous les participants voient le même rendu.

---

## Structure d'un template

```
mon-template/
  template.json    ← métadonnées + palette CSS (obligatoire)
  preview.svg      ← miniature 280×160 pour le sélecteur (obligatoire)
  grain.svg        ← texture generative SVG pour la surface (optionnel)
```

---

## Format `template.json`

```json
{
  "id": "mon-template",
  "name": "Mon Template",
  "author": "Ton pseudo",
  "description": "Une courte description (1-2 phrases max)",
  "version": "1.0.0",
  "license": "AGPL-3.0",

  "theme": {
    "--table-bg":      "#1c1814",
    "--table-rim":     "#2d2520",
    "--table-grain":   "wood",
    "--accent":        "#c8914a",
    "--accent-hover":  "#d9a05c",
    "--text-primary":  "#e8e0d5",
    "--text-muted":    "#9a8f82",
    "--bg":            "#131210",
    "--voice-ring":    "#c8914a"
  },

  "defaults": {
    "widgets": ["jukebox", "dice"]
  }
}
```

### Propriétés CSS disponibles

| Variable | Rôle |
|----------|------|
| `--table-bg` | Couleur de remplissage de la surface de la table |
| `--table-rim` | Bordure/rebord de la table (légèrement plus clair) |
| `--table-grain` | `"wood"`, `"felt"`, `"stone"`, `"none"` — texture SVG |
| `--accent` | Couleur des éléments actifs (parle, focus, hover) |
| `--accent-hover` | Variante hover de l'accent |
| `--text-primary` | Texte principal |
| `--text-muted` | Texte secondaire, labels discrets |
| `--bg` | Fond général du salon (autour de la table) |
| `--voice-ring` | Couleur de l'onde audio sur les avatars |

### Widgets disponibles

| ID | Description |
|----|-------------|
| `jukebox` | Lecteur audio collaboratif |
| `dice` | Dés RPG (d4–d100) |
| `timer` | Timer partagé (Pomodoro / Blitz / Custom) |
| `scores` | Tableau des scores |

---

## `preview.svg` — Miniature du sélecteur

Dimensions : **280×160px**. Doit représenter visuellement le thème
(table ovale avec la palette de couleurs). Pas d'obligation de réalisme —
une représentation abstraite suffit.

---

## Templates officiels (exemples)

| ID | Ambiance | Accent | Surface |
|----|----------|--------|---------|
| `brasserie-de-nuit` | Bois chaud, intime | Ambre `#c8914a` | `wood` |
| `table-de-feutre` | Poker, jeux de salon | Vert `#2d7a4a` | `felt` |
| `pierre-et-braise` | RPG, dramatique | Braise `#e84545` | `stone` |

Inspirez-vous de ces trois templates pour créer le vôtre.

---

## Soumettre un template

1. Fork le repo Nexus
2. Crée ton dossier `plugins/table-templates/mon-template/`
3. Ajoute `template.json` + `preview.svg` (+ `grain.svg` si texture custom)
4. Ouvre une Pull Request — la review est rapide pour les templates

*Format stable depuis v1.0. Breaking changes seront versionnés.*
