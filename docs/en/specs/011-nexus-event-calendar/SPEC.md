# SPEC 011 — NEXUS EVENT CALENDAR
### "Moving from static content to real-time community life."

---

## 🎯 1. WHAT: The Vision

The Nexus Calendar is not a simple desk calendar. It is a **presence generator**. It allows planning life moments (voice sessions, streams, conferences, game releases, raids, IRL meetups) and transforming an intention into collective action.

Each event is a "door" to a Nexus space (Cinema Channel, Round Table, dedicated Thread).

---

## 🧠 2. WHY: The Impact

- **The Anti-Scroll:** Instead of scrolling endlessly, the user checks the calendar to know when to connect for real interaction.
- **Organic Engagement:** Creating a sense of anticipation and excitement (hype) within the community.
- **Global Visibility:** Thanks to SPEC 010 (Global Search), a public event becomes a beacon attracting users from other instances.
- **Professionalism:** Offering a layout worthy of Eventbrite, but 100% free and integrated.

---

## 🛠️ 3. TECHNICAL & STRUCTURAL ARCHITECTURE

### A. Event Body (Nexus-Editor)

Each event is a rich page using Nexus's rendering engine:

- **Immersive Banner:** Wide cover photo with title overlay.
- **Rich Content:** Use of tables (schedule/lineup), photo galleries, and embedded videos.
- **Logistics Sidebar:** Summary table (Venue, Price, Capacity, Registrations).

### B. Sovereign Geography (OpenStreetMap)

For physical events:

- **Mapping:** Native integration of Leaflet + OSM (zero Google tracking).
- **Itinerary:** Route calculation via free routing engine (bike/train/car) — OSRM (Open Source Routing Machine).
- **Rally Point:** Place a precise marker: "We meet in front of the statue at 7pm."

### C. PostgreSQL Data (The Foundation)

Table `community_events`:

```
id:             UUID (Primary Key)
community_id:   UUID (FK)
creator_id:     UUID (FK)
title:          VARCHAR(200)
description:    TEXT (Markdown support)
rich_content:   JSONB (structured content from Nexus-Editor)
start_at:       TIMESTAMP WITH TIME ZONE
end_at:         TIMESTAMP WITH TIME ZONE
type:           ENUM ('vocal', 'stream', 'irl', 'concert', 'meeting', 'release')
location_url:   VARCHAR(500) (Nexus voice channel link or external link)
location_data:  JSONB (GPS coordinates / voice channel name)
price_info:     VARCHAR (Free, Pay what you want, or amount)
is_public:      BOOLEAN (Visibility on Nexus-Directory)
is_indexed:     BOOLEAN (For global search)
```

### D. Real-time (Socket.io)

- **Start notifications:** 15 minutes before the event, the server emits an `event:starting_soon` signal to all connected members.
- **Participant counter:** Live update of the "I'm attending" count.

### E. Interface (SvelteKit)

- **"Timeline" view:** A clean horizontal bar on the dashboard.
- **Mini-Widget:** Integrated in the header or sidebar to see the "Next event" at a glance.

---

## 🔮 4. FUTURE PROJECTIONS

### A. "Time-Bridge" (P2P Synchronization)
The calendar manages the synchronization of all participants' clocks so that the "Cinema" stream starts at exactly the same microsecond for everyone.

### B. Ollama AI "Concierge"
The local AI analyzes the instance's habits: "Members are very active on Friday evenings — best time for the concert."

### C. Attendance Badge
Confirmed participation = A unique badge generated on the profile (SPEC 004). "I was there: Nexus v1 Launch."

---

## 🚀 5. "GENIUS & WILD ZONE"

- **"Ghost Presence" mode:** On the event page, see transparent avatar shadows of members currently consulting the page in real time. Feel the anticipation building!
- **Status Hologram:** When a registered event starts, the avatar in the header glows or wears a special accessory (e.g. a small golden ticket).
- **Live-Audio-Bridge:** A "Listen live" button for IRL events, connecting the organizer's microphone to the NEXUS_AUDIO engine for those who couldn't attend.
- **Social Weather:** A visual instance indicator that goes from "Calm" to "Buzzing" based on the density of upcoming events.
- **The "Astral Calendar":** A constellation view where each point is an event. The more participants, the brighter the star.

---

## 📋 6. IMPLEMENTATION RULES

- **Zero heavy dependencies:** No 50MB calendar library. Use CSS Grid and the existing rendering engine.
- **Modularity:** Admin activates/deactivates the calendar in `.env` or the admin panel.
- **SEO Ready:** Automatic JSON-LD Event tag generation so that AI and classic search engines display Nexus in "Rich Snippets."
- **Follow button** (Steam-style): Users receive a reminder notification before the event starts.
- **Hype counter:** More followers = higher visibility in global search (SPEC 010). Creates a snowball effect.
- **Nexus-Editor integration:** Full WYSIWYG for event pages — tables, galleries, video embeds.
- **Templates:** Pre-built structures (Concert, Conference, Stream templates).
- **Live-Blog:** During the event, the organizer can update the page live (Socket.io real-time updates for all viewers).

---

*The event is not just a line of text. It is a destination. A beautiful presentation multiplies participation threefold.*
