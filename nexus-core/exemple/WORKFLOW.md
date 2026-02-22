# NEXUS WORKFLOW — Spec-Driven Development
### Méthodologie de développement pour OpenClaw

---

## Commandes disponibles

### /nexus.context
Lis NEXUS_CONTEXT.md en entier avant toute action.
Confirme : "Contexte chargé. Prêt."

### /nexus.specify
Décris la fonctionnalité à construire.
Format : QUOI + POURQUOI. Pas de tech. Pas de code.
Produit : .specify/specs/XXX-nom/spec.md

### /nexus.plan
Crée le plan technique basé sur la spec.
Respecte la stack de NEXUS_CONTEXT.md sans exception.
Produit : .specify/specs/XXX-nom/plan.md

### /nexus.tasks
Découpe le plan en micro-tâches ordonnées.
Chaque tâche = 1 fichier, 1 action, 1 commit.
Produit : .specify/specs/XXX-nom/tasks.md

### /nexus.implement
Exécute les tâches une par une.
Commit après chaque tâche complétée.
Stop et demande validation si touching nexus-core.

### /nexus.status
Affiche l'état actuel du projet.
Lit git log, liste les specs en cours.

---

## Règles absolues

1. Toujours lire NEXUS_CONTEXT.md en premier
2. Jamais modifier nexus-core sans validation humaine
3. Un commit par tâche complétée
4. Code en anglais, commentaires en anglais
5. Si doute → demander, jamais inventer

---

*"Le réseau, ce sont les gens."*