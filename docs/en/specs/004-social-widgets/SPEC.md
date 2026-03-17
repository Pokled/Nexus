# SPEC 004 — Social network profile widgets
### Read entirely before writing a single line of code

---

## Context

If a user enters links to their social networks in their profile,
Nodyx automatically displays a rich widget for that network.

**Absolute rule: nothing is displayed if the field is empty.**
No empty widget, no placeholder, no invitation to connect.

---

## Phase 1 — GitHub only

GitHub is the priority because:
- Free public API (no key required for public data)
- Perfectly suited to Nodyx's early adopter target audience
- Rich and relevant data

Other networks (YouTube, X, Instagram) are in Phase 2.

---

## Step 1 — Database update

File: `nodyx-core/src/migrations/004_social_links.sql`

```sql
-- Replace the generic links (JSONB) field with dedicated fields
ALTER TABLE user_profiles
ADD COLUMN github_username    VARCHAR(100),
ADD COLUMN youtube_channel    VARCHAR(200),
ADD COLUMN twitter_username   VARCHAR(100),
ADD COLUMN instagram_username VARCHAR(100),
ADD COLUMN website_url        VARCHAR(500);

-- Index for searching by github_username
CREATE INDEX idx_profiles_github ON user_profiles(github_username)
WHERE github_username IS NOT NULL;
```

---

## Step 2 — Backend API

### Route GET /api/v1/users/:username/github
```
→ Accessible without authentication
→ Calls the public GitHub API
→ Caches in Redis for 1 hour (key: nodyx:github:{github_username})
→ Returns data formatted for the widget
```

Response format:
```json
{
  "login": "myusername",
  "name": "My Name",
  "avatar_url": "https://avatars.githubusercontent.com/...",
  "bio": "Passionate developer",
  "public_repos": 42,
  "followers": 128,
  "pinned_repos": [
    {
      "name": "my-awesome-project",
      "description": "An amazing project",
      "language": "TypeScript",
      "stars": 47,
      "url": "https://github.com/myusername/my-awesome-project"
    }
  ]
}
```

### GitHub API calls (no key required)
```typescript
// User info
GET https://api.github.com/users/{github_username}

// Public repos sorted by last updated
GET https://api.github.com/users/{github_username}/repos?sort=updated&per_page=6
```

**Note:** Without an API key, limit is 60 requests/hour per IP.
The 1-hour Redis cache solves this problem.

---

## Step 3 — Update PATCH profile route

Add the new fields to `PATCH /api/v1/users/me/profile`:
```typescript
github_username,
youtube_channel,
twitter_username,
instagram_username,
website_url
```

Zod validation:
- `github_username`: alphanumeric + hyphens, max 39 chars
- `website_url`: valid URL or null

---

## Step 4 — GitHubWidget.svelte component

File: `nodyx-frontend/src/lib/components/widgets/GitHubWidget.svelte`

```
┌─────────────────────────────────────┐
│ 🐙 GitHub — myusername              │
├─────────────────────────────────────┤
│ [Avatar]  My Name                   │
│           Passionate developer      │
│           📦 42 repos  👥 128 followers │
├─────────────────────────────────────┤
│ Recent repos                        │
│ ┌─────────────────────────────────┐ │
│ │ my-awesome-project         ⭐ 47│ │
│ │ An amazing project  TypeScript  │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ another-project            ⭐ 12│ │
│ │ Short description  Python      │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

Rules:
- Maximum 3 repos displayed
- Link to GitHub profile on the username
- Link to each repo on the repo name
- Loading skeleton during fetch
- On API error → widget silently hidden (no visible error)

---

## Step 5 — Integration in the profile page

File: `nodyx-frontend/src/routes/users/[username]/+page.svelte`

Add after bio:

```
[Bio]
[Tags]
[Links]

--- Social network widgets ---
[GitHubWidget]     ← if github_username is set
[YouTubeWidget]    ← Phase 2
[TwitterWidget]    ← Phase 2
```

The widget is displayed only if `profile.github_username` is set.

---

## Step 6 — Profile edit form

File: `nodyx-frontend/src/routes/users/me/edit/+page.svelte`

"Social networks" section in the form:
```
GitHub          [________________]  e.g. myusername
YouTube         [________________]  e.g. @mychannel
Twitter / X     [________________]  e.g. myhandle
Instagram       [________________]  e.g. myhandle
Website         [________________]  e.g. https://mysite.com
```

---

## MANDATORY execution order

```
1. SQL migration 004_social_links.sql
2. Apply migration to database
3. Route GET /api/v1/users/:username/github
4. Update PATCH /me/profile with new fields
5. GitHubWidget.svelte component
6. GitHubWidget integration in profile page
7. Profile edit form /users/me/edit
8. Commit after each step
```

---

## What we do NOT do in this spec

- OAuth "Sign in with GitHub" → Phase 2
- GitHub contribution graph stats → Phase 2

---

## Social network widget roadmap

### Phase 1 — Now
```
GitHub      ✅ Free public API
```

### Phase 2 — Next iteration
```
Twitch      → Public API, perfect for streamers
Spotify     → Public API, display what you're listening to
SoundCloud  → Public API, perfect for musicians
Steam       → Public API, games + playtime
```

### Phase 3 — Following iterations
```
YouTube     → Google API key required
LinkedIn    → Accessible API, professional profile
DeviantArt  → Public API, perfect for artists
Reddit      → Public API, display profile
Mastodon    → Perfect for the Nodyx spirit
```

### Out of scope — No usable public profile API
```
WhatsApp, WeChat, QQ, Viber     → no profile API
Telegram, Snapchat              → no public profile
Tumblr, Flixster                → declining services
G2A, EpicGames, Fab             → no profile API
```

### Future depending on feasibility
```
Twitter/X   → Paid API since 2023
Instagram   → Very restrictive API since 2019
TikTok      → Very limited API
Pinterest   → Limited API
```

---

## Important note — Privacy

The user chooses what they expose.
Nodyx NEVER automatically imports external data.
Each social network field is optional and voluntarily filled in.

---

*"The network is the people."*
