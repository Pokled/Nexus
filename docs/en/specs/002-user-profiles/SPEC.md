# SPEC — User Profile System
### Read entirely before writing a single line of code

---

## Context

Every Nexus user has an enriched profile.
This profile is used in TWO places:

1. **Full profile page** — `/users/:username`
2. **Mini-profile in the forum** — displayed to the left of each post

The mini-profile is a reusable component fed by the same data.
The profile must therefore be built BEFORE finalizing the thread view in the forum.

---

## Step 1 — Database

File: `nexus-core/src/migrations/002_user_profiles.sql`

```sql
CREATE TABLE user_profiles (
  user_id       UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  display_name  VARCHAR(100),
  avatar_url    VARCHAR(500),
  banner_url    VARCHAR(500),
  bio           TEXT,
  status        VARCHAR(100),
  location      VARCHAR(100),
  tags          TEXT[]        DEFAULT '{}',
  links         JSONB         DEFAULT '[]',
  updated_at    TIMESTAMP     DEFAULT NOW()
);

-- Automatically create an empty profile on each new user
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_user_created
AFTER INSERT ON users
FOR EACH ROW EXECUTE FUNCTION create_user_profile();
```

Format of the `links` field (JSONB):
```json
[
  { "label": "GitHub", "url": "https://github.com/username" },
  { "label": "Website", "url": "https://mysite.com" }
]
```

**Apply the migration:**
```powershell
$env:PATH += ";C:\Program Files\PostgreSQL\16\bin"
psql -U postgres -d nexus -f src/migrations/002_user_profiles.sql
```

---

## Step 2 — Backend API

File: `nexus-core/src/routes/users.ts`

Add these two routes to the existing user routes:

```
GET  /api/v1/users/:username/profile
→ Returns the full public profile
→ Accessible without authentication
→ Combines users + user_profiles

PATCH /api/v1/users/me/profile
→ Edit your own profile
→ Authentication required
→ Editable fields: display_name, bio, status, location, tags, links
→ avatar_url and banner_url: accept an external URL for now
```

GET response format:
```json
{
  "id": "uuid",
  "username": "testuser",
  "display_name": "Test User",
  "avatar_url": "https://...",
  "banner_url": "https://...",
  "bio": "Passionate about Linux and coffee.",
  "status": "Coding Nexus right now",
  "location": "France",
  "tags": ["linux", "photo", "gaming"],
  "links": [
    { "label": "GitHub", "url": "https://github.com/testuser" }
  ],
  "points": 247,
  "created_at": "2026-02-18T23:37:00Z"
}
```

---

## Step 3 — Mini-profile component (SvelteKit)

File: `nexus-frontend/src/lib/components/ProfileCard.svelte`

This component is displayed to the LEFT of each post in a thread.

**Data displayed in the mini-profile:**
```
[Avatar 64x64]
Username
Points ⭐
Tags (max 3 shown)
Member since [month year]
```

**Component rules:**
- Fixed size, must not expand
- Avatar with initials fallback if no image
- Clickable username → redirects to /users/:username
- Maximum 3 tags displayed (others ignored)
- Responsive: stacks above the post on mobile

**TypeScript interface for the component:**
```typescript
interface ProfileCardProps {
  username: string
  displayName?: string
  avatarUrl?: string
  points: number
  tags: string[]
  memberSince: string  // ISO date string
}
```

---

## Step 4 — Full profile page (SvelteKit)

File: `nexus-frontend/src/routes/users/[username]/+page.svelte`

**What is displayed:**
```
[Full-width banner]
[Avatar]  Username / display_name
          Status
          Location
          Member since X
          Points ⭐

Bio

Tags: #linux  #photo  #gaming

Links: GitHub | Website

Last posts (5 max)
```

**SEO:**
- Title: `{display_name} (@{username}) — Nexus`
- Description: bio truncated to 160 characters
- og:image: avatar_url

---

## Step 5 — Forum integration

File: `nexus-frontend/src/routes/forum/[category]/[thread]/+page.svelte`

Replace the current author display with the `ProfileCard` component.

Structure of a post in the thread:
```
┌──────────────┬────────────────────────────────┐
│  ProfileCard │  Post content                  │
│  (left)      │                                │
│              │  [Post date]                   │
└──────────────┴────────────────────────────────┘
```

The ProfileCard data comes from the `author` field already returned
by `GET /api/v1/forums/threads/:id`.
Enrich that response with avatar_url, tags, points if not already present.

---

## MANDATORY execution order

```
1. SQL migration 002_user_profiles.sql
2. Apply migration to database
3. Backend routes GET + PATCH profile
4. ProfileCard.svelte component
5. /users/[username] page
6. ProfileCard integration in thread view
7. Commit after each step
```

---

## What we do NOT do in this spec

- Avatar file upload → Phase 2, external URL accepted for now
- Profile moderation → Phase 2
- Private profiles → Phase 2
- Advanced statistics → Phase 2

---

## Phase 2 note — Chat and Voice

The ProfileCard component MUST be designed to be reused in:
- Chat channel member list (avatar + username + online status)
- Chat messages (small inline avatar to the left of the message)
- Voice channel participant list (avatar + username + mic icon)

**Design rule from now:**
ProfileCard accepts a `variant` prop:
```typescript
variant: 'forum'  // left of post, medium size
variant: 'chat'   // inline message, small avatar
variant: 'vocal'  // participant list, medium avatar + status
variant: 'full'   // full profile page
```

Implement only `variant: 'forum'` and `variant: 'full'` now.
Declare the other variants in the TypeScript interface without implementing them.
This avoids a full refactor when chat and voice arrive in Phase 2.

---

## Success criteria

A user can:
1. See their profile at `/users/myusername`
2. Edit their bio, tags, and links via PATCH
3. See the mini-profile of authors in each thread

*"Simple > Complex. Always."*
