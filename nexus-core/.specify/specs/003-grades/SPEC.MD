# SPEC 003 — Système de grades et rôles
### À lire entièrement avant de coder quoi que ce soit

---

## Contexte

Nexus a deux niveaux de rôles :

1. **Rôles système** — fixes, définis par Nexus
2. **Grades personnalisés** — créés par les admins de chaque communauté

Un utilisateur peut avoir un rôle système ET un grade personnalisé.
Le grade personnalisé s'affiche en priorité dans le ProfileCard.

---

## Niveau 1 — Rôles système

Déjà en place dans `community_members.role` :
```
owner       → Créateur, droits absolus, ne peut pas être retiré
admin       → Droits complets sauf supprimer la communauté
moderator   → Peut modérer posts et threads
member      → Membre standard
```

Ces rôles ne sont PAS renommables. Ils sont internes à Nexus.

---

## Niveau 2 — Grades personnalisés

Créés librement par les admins d'une communauté.
Exemples :
```
Communauté Linux     → "Kernel Master", "Contributeur", "Padawan"
Communauté Photo     → "Photographe Pro", "Amateur", "Curieux"
Communauté Gaming    → "Grand Maître", "Joueur", "Noob"
```

---

## Étape 1 — Base de données

Fichier : `nexus-core/src/migrations/003_grades.sql`

```sql
-- Grades personnalisés par communauté
CREATE TABLE community_grades (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
  name         VARCHAR(100) NOT NULL,
  color        VARCHAR(7) DEFAULT '#99AAB5',  -- hex color
  position     INTEGER DEFAULT 0,             -- ordre d'affichage
  permissions  JSONB DEFAULT '{}',            -- droits associés
  created_at   TIMESTAMP DEFAULT NOW()
);

-- Grade attribué à un membre
ALTER TABLE community_members
ADD COLUMN grade_id UUID REFERENCES community_grades(id) ON DELETE SET NULL;

-- Index
CREATE INDEX idx_grades_community ON community_grades(community_id);
CREATE INDEX idx_members_grade ON community_members(grade_id);
```

Format du champ `permissions` (JSONB) :
```json
{
  "can_post": true,
  "can_create_thread": true,
  "can_create_category": false,
  "can_moderate": false,
  "can_manage_members": false,
  "can_manage_grades": false
}
```

---

## Étape 2 — Backend API

### Routes grades (admin uniquement)

```
GET    /api/v1/communities/:slug/grades
→ Liste tous les grades de la communauté

POST   /api/v1/communities/:slug/grades
→ Créer un grade
→ Body: { name, color, position, permissions }

PATCH  /api/v1/communities/:slug/grades/:id
→ Modifier un grade (nom, couleur, permissions)

DELETE /api/v1/communities/:slug/grades/:id
→ Supprimer un grade (les membres perdent ce grade)

PATCH  /api/v1/communities/:slug/members/:userId/grade
→ Attribuer ou retirer un grade à un membre
→ Body: { grade_id } ou { grade_id: null }
```

### Middleware de permissions
Créer `src/middleware/permissions.ts` :
```typescript
// Vérifie si l'utilisateur a la permission requise
// dans la communauté donnée
checkPermission(permission: keyof Permissions)
```

---

## Étape 3 — Mise à jour ProfileCard

Fichier : `nexus-frontend/src/lib/components/ProfileCard.svelte`

Ajouter sous le username :
```
[Avatar]
Username
[Badge grade coloré]   ← NOUVEAU
⭐ Points
#tags
```

Le badge grade :
- Couleur de fond = `grade.color`
- Texte blanc ou noir selon la luminosité
- Absent si pas de grade attribué

---

## Étape 4 — Interface d'administration des grades

Fichier : `nexus-frontend/src/routes/communities/[slug]/admin/grades/+page.svelte`

Interface simple :
```
Grades de la communauté

[+ Créer un grade]

┌─────────────────┬──────────┬─────────────────────┬──────────┐
│ Nom             │ Couleur  │ Permissions         │ Actions  │
├─────────────────┼──────────┼─────────────────────┼──────────┤
│ Kernel Master   │ 🔴 rouge │ modération + posts  │ ✏️ 🗑️   │
│ Contributeur    │ 🟠 orange│ posts + threads     │ ✏️ 🗑️   │
│ Padawan         │ 🟢 vert  │ posts seulement     │ ✏️ 🗑️   │
└─────────────────┴──────────┴─────────────────────┴──────────┘
```

Accessible uniquement aux owner et admin.

---

## Ordre d'exécution OBLIGATOIRE

```
1. Migration SQL 003_grades.sql
2. Appliquer la migration en base
3. Routes backend grades CRUD
4. Middleware permissions
5. Mise à jour ProfileCard avec badge grade
6. Page admin/grades
7. Commit après chaque étape
```

---

## Ce qu'on ne fait PAS dans cette spec

- Interface d'attribution des grades par membre → Phase suivante
- Grades globaux Nexus (hors communauté) → Phase 2
- Hiérarchie de grades héritée → Phase 2

---

*"Simple > Complexe. Toujours."*