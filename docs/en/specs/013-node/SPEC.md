# Node

## Definition

A **Node** is a structured, durable discussion.
It is designed to evolve over time and become, if the community chooses, a **collective reference**.

A Node is neither a chat, nor a strict wiki, nor a todo-list.
It can borrow from these formats without ever losing its history or freedom.

> Nexus does not govern Nodes.
> Each instance decides their use, visibility, and lifecycle.

---

## Philosophy

- **Time** is a feature
- **Quality** takes precedence over speed
- **Memory** is as important as discussion
- Nothing is mandatory — everything is **opt-in**

A Node can remain a simple discussion.
It can also mature, become structured, and become a knowledge reference point.

---

## Possible states of a Node

States are indicative.
They impose no workflow.

- **Active**
  Open discussion, free contributions.

- **Slow**
  Thoughtful contributions, no urgency, no time pressure.

- **Stabilized**
  Content is considered reliable at a given moment.

- **Archived**
  Read-only. The Node remains visible, referenced, and consultable.

---

## Components of a Node

A Node can contain:

- a **summary** (optional)
- **messages**
- some messages can become **Anchors**
- a **synthesis view** (optional)

No component is mandatory.

---

## Summary

The summary:
- is editable
- is versioned
- reflects the current state of the Node
- can be maintained by the community or a guardian

It allows understanding the essentials without re-reading the entire Node.

---

## Anchors

An **Anchor** is a message identified as structuring.

An Anchor:
- has a stable URL
- can be referenced by Nexus search
- can be linked from other Nodes
- remains anchored in its context (not extracted from the thread)

Anchors transform a Node into a navigable space.

---

## Synthesis view

The synthesis view is an **alternative reading** of the Node.

It allows:
- visualizing the key sections
- directly accessing Anchors
- quickly understanding the current state

The synthesis view does not duplicate content.

---

## Visibility and federation

Each Node can be:

- private
- visible only on the instance
- federated
- indexable by the Nexus engine
- indexable by external engines (if the admin chooses)

Even a non-visible Node can contribute to the network (relay, resilience).

---

## Moderation and editing

- Moderation remains **local to the instance**
- Community editing is possible via:
  - proposals
  - human validation
  - version history

AI can assist (flagging, summarizing), but **never decides**.

---

## What a Node is not

- not a feed
- not an algorithmic feed
- not a global reputation system
- not a social performance tool

A Node is a **place**, not a score.

---

## Intent

Nodes exist to:
- preserve knowledge
- foster long-form discussions
- enable discovery without centralization
- give depth back to the Web

A Node can live a long time.
It has no obligation to disappear.

---

## NODE_SCHEMA — Minimal technical schema

This document describes the minimal structure of a Node in Nexus.
The schema is intentionally simple and extensible.

### Identity

A Node is identified by:

- `node_id` (UUID / hash)
- `instance_id` (owning instance)
- `slug` (human-readable, optional)
- `created_at`
- `updated_at`

### Metadata

```json
{
  "title": "P2P behind NAT",
  "state": "slow",
  "visibility": "federated",
  "tags": ["p2p", "network", "webrtc"],
  "language": "en"
}
```

**States:** `active` | `slow` | `stabilized` | `archived`

**Visibility:** `private` | `local` | `federated` | `indexable`

### Messages (posts)

Each message:
- belongs to a Node
- preserves its chronological order
- is never rewritten

```json
{
  "post_id": "uuid",
  "author_id": "uuid",
  "content": "text",
  "created_at": "...",
  "is_anchor": false
}
```

### Anchors

An Anchor is a post marked as structuring.

```json
{
  "anchor_id": "a7",
  "post_id": "uuid",
  "label": "WebRTC Solution",
  "indexable": true
}
```

Characteristics:
- Stable URL: `/node/{id}#a7`
- Independently indexable
- Always linked to its context

### Summary

The summary is an object separate from the thread.

```json
{
  "summary": "Current Node synthesis...",
  "version": 3,
  "updated_at": "...",
  "editor_id": "uuid"
}
```

- versioned
- editable
- optional

### Synthesis view

The synthesis view is a projection of the Node:
- summary
- anchors
- state

No data duplication.

### History & editing

- no destructive deletion
- every modification creates a version
- proposals possible before validation

### Federation & search

A Node can expose:
- its metadata
- its summary
- its anchors

Raw content stays local unless explicitly chosen otherwise.

### Dependencies

A Node depends on:
- no central service
- no external engine

It remains valid offline.

---

## 🎛️ UX — Adaptation for existing forum

**Goal:**
👉 Transform certain forum categories into Nodes
👉 Without breaking what exists
👉 Without shocking current users

### 1. Where do Nodes appear?

**New category (or sub-category): Nodes**

Visually:
- Same layout as threads
- Discrete `NODE` badge
- 🧠 or 🔗 icon

Nothing new to learn.

### 2. Node header (key UX)

At the top of the thread:

```
🧠 Node — State: Slow
This Node is designed to last. Take your time.
```

Then:

```
Summary
[ content ]
Last updated: v3
[ propose a modification ]
```

**The summary is THE visible difference.**

### 3. Anchors in the thread

A message marked as Anchor:
- slightly different background
- colored left border
- 🔗 icon

```
🔗 Anchor — WebRTC Solution
```

- click → direct link
- visible in the table of contents

### 4. Automatic table of contents (column or block)

At the top or right:

```
Node table of contents
• Initial problem
• WebRTC solution
• Field tests
```

Generated from Anchors — very powerful for readability.

### 5. Synthesis view (simple toggle)

Discrete button:

```
[ Discussion ] [ Synthesis ]
```

Synthesis displays:
- summary
- state
- anchors
- status (stabilized / in progress)

Not another page — **another reading mode**.

### 6. Induced slowness (without forcing)

In a Node:
- no aggressive bumping
- no message counter
- visible dates
- message before replying:

> "This Node favors thoughtful responses."

### 7. Nexus search

In results:
- Node appears as an entity
- Anchor appears as a precise result
- Score based on:
  - stability
  - clarity
  - cross-references
  - NOT on activity

### 8. What you do NOT need to do

❌ Rethink the entire forum
❌ Add heavy roles
❌ Create a complex workflow
❌ Force Node usage

Nodes must **impose themselves through their utility**, not by rule.

---

## Summary

- Forum = base
- Node = **forum augmented by memory**
- Anchors = navigation
- Summary = transmission
- Synthesis = readability

---

*Respect Svelte format and Nexus core technologies. No new server-side languages or tools that would require new infrastructure.*
*"The network is the people." — AGPL-3.0*
