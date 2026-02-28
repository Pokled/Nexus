# SPEC 003 — Grades and roles system
### Read entirely before writing a single line of code

---

## Context

Nexus has two levels of roles:

1. **System roles** — fixed, defined by Nexus
2. **Custom grades** — created by the admins of each community

A user can have a system role AND a custom grade.
The custom grade takes display priority in the ProfileCard.

---

## Level 1 — System roles

Already in place in `community_members.role`:
```
owner       → Creator, absolute rights, cannot be removed
admin       → Full rights except deleting the community
moderator   → Can moderate posts and threads
member      → Standard member
```

These roles are NOT renameable. They are internal to Nexus.

---

## Level 2 — Custom grades

Created freely by community admins.
Examples:
```
Linux community    → "Kernel Master", "Contributor", "Padawan"
Photo community    → "Pro Photographer", "Amateur", "Curious"
Gaming community   → "Grand Master", "Player", "Noob"
```

---

## Step 1 — Database

File: `nexus-core/src/migrations/003_grades.sql`

```sql
-- Custom grades per community
CREATE TABLE community_grades (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
  name         VARCHAR(100) NOT NULL,
  color        VARCHAR(7) DEFAULT '#99AAB5',  -- hex color
  position     INTEGER DEFAULT 0,             -- display order
  permissions  JSONB DEFAULT '{}',            -- associated rights
  created_at   TIMESTAMP DEFAULT NOW()
);

-- Grade assigned to a member
ALTER TABLE community_members
ADD COLUMN grade_id UUID REFERENCES community_grades(id) ON DELETE SET NULL;

-- Indexes
CREATE INDEX idx_grades_community ON community_grades(community_id);
CREATE INDEX idx_members_grade ON community_members(grade_id);
```

Format of the `permissions` field (JSONB):
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

## Step 2 — Backend API

### Grade routes (admin only)

```
GET    /api/v1/communities/:slug/grades
→ List all grades for the community

POST   /api/v1/communities/:slug/grades
→ Create a grade
→ Body: { name, color, position, permissions }

PATCH  /api/v1/communities/:slug/grades/:id
→ Modify a grade (name, color, permissions)

DELETE /api/v1/communities/:slug/grades/:id
→ Delete a grade (members lose that grade)

PATCH  /api/v1/communities/:slug/members/:userId/grade
→ Assign or remove a grade from a member
→ Body: { grade_id } or { grade_id: null }
```

### Permissions middleware
Create `src/middleware/permissions.ts`:
```typescript
// Checks if the user has the required permission
// in the given community
checkPermission(permission: keyof Permissions)
```

---

## Step 3 — ProfileCard update

File: `nexus-frontend/src/lib/components/ProfileCard.svelte`

Add below the username:
```
[Avatar]
Username
[Colored grade badge]   ← NEW
⭐ Points
#tags
```

The grade badge:
- Background color = `grade.color`
- White or black text based on luminosity
- Absent if no grade assigned

---

## Step 4 — Grade administration interface

File: `nexus-frontend/src/routes/communities/[slug]/admin/grades/+page.svelte`

Simple interface:
```
Community grades

[+ Create a grade]

┌─────────────────┬──────────┬─────────────────────┬──────────┐
│ Name            │ Color    │ Permissions         │ Actions  │
├─────────────────┼──────────┼─────────────────────┼──────────┤
│ Kernel Master   │ 🔴 red   │ moderation + posts  │ ✏️ 🗑️   │
│ Contributor     │ 🟠 orange│ posts + threads     │ ✏️ 🗑️   │
│ Padawan         │ 🟢 green │ posts only          │ ✏️ 🗑️   │
└─────────────────┴──────────┴─────────────────────┴──────────┘
```

Accessible only to owners and admins.

---

## MANDATORY execution order

```
1. SQL migration 003_grades.sql
2. Apply migration to database
3. Backend grade CRUD routes
4. Permissions middleware
5. ProfileCard update with grade badge
6. admin/grades page
7. Commit after each step
```

---

## What we do NOT do in this spec

- Per-member grade assignment UI → next phase
- Global Nexus grades (outside community) → Phase 2
- Inherited grade hierarchy → Phase 2

---

*"Simple > Complex. Always."*
