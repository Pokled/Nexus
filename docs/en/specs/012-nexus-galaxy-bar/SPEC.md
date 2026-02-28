# SPEC 012 — NEXUS GALAXY BAR (MULTI-INSTANCE SWITCHER)
### "Navigate between worlds, without ever leaving the network."

---

## 🎯 1. WHAT: The Vision

The Galaxy Bar is a persistent sidebar located at the far left of the screen. It allows users to see and instantly switch between all the Nexus instances they are members of.

It must embody the power of the network while remaining an elegant and discreet design element.

---

## 🧠 2. WHY: The Impact

- **Cohesion:** The user understands they belong to a galaxy of communities.
- **Fluidity:** Switching from a "Gaming" instance to a "Linux" instance happens in one click, without re-entering credentials.
- **Visual Urgency:** Know at a glance if something important is happening elsewhere (notifications, events).

---

## 🎨 3. DESIGN & ERGONOMICS (THE "LOOK & FEEL")

### A. Uniformity and Dimensions

- **Width:** 72px (standard for optimal icon visibility without eating reading space).
- **Balance:** The Galaxy Bar (left) and Member Bar (right) share the same frosted glass aesthetic (Glassmorphism) for perfect symmetry.
- **Shapes:** Instance icons are not simple circles. We use **Squircles** (squares with very rounded corners) that give a more "premium" feel.

### B. Card Format

Instead of narrow circles, give breathing room and elegance:

- **"Vertical Card" format:** Rounded rectangles or organic shapes.
- **Instance thumbnail:** Beautiful community thumbnail. If no image, generate a unique color gradient based on its name with its initial.
- **Rich tooltip on hover:** Not just an ugly black text — an elegant small card appears with the name, online member count, and possibly the next calendar event.

### C. Icon States

- **Rest:** 0.7 opacity, desaturated colors.
- **Hover:** Icon regains full color, scales up slightly (scale 1.1), rich tooltip shown (Name + Online count).
- **Active:** Glowing border (Halo) in the main color of the target instance.

---

## 🛠️ 4. TECHNICAL ARCHITECTURE

### A. The "Global Switcher" (Logic)

- **Decentralized SSO:** Use of a shared JWT token or session key recognized by the parent domain (`*.nexus.io`).
- **Zero Latency:** Uses SvelteKit prefetch: when the mouse hovers over an instance icon, the browser already starts loading data so the click feels instant.
- **"+" button (Discovery):** At the bottom of the list, a button that opens the Nexus-Directory directly to discover new communities to join.

### B. "Bio-Luminescent" Notification System

Instead of an aggressive red badge:

- **New message:** A small discrete white dot.
- **Direct mention / Urgency:** A pulsing halo behind the instance icon.
- **Live event:** A small "Live" icon at the bottom of the instance icon.
- **AI Priority:** If a message mentions you directly or a friend is in a channel, the icon can have a subtle animation.

### C. Zero-Reload Navigation (SPA Power)

- **Unique identity:** Since the user has their Nexus account, clicking another instance in the left bar already has them logged in (automatic SSO).
- **Drag & drop reordering:** Users can reorganize their instances.

---

## 🔮 5. FUTURE POSSIBILITIES

### A. "Drag-to-Share"
- **Idea:** You're on instance A, you see a great thread. Drag it onto instance B's icon in the Galaxy Bar.
- **Effect:** Nexus automatically offers to share this link in instance B's general channel. Cross-community sharing becomes child's play.

### B. "Folders" (Instance Groups)
- **Idea:** Group instances by theme (e.g., a "Dev" folder, a "Leisure" folder).
- **Effect:** Manage 50 instances without the bar becoming unreadable.

### C. "PiP Preview" (Picture-in-Picture)
- **Idea:** Right-click on an instance → a floating mini-window shows the live chat or voice channel without changing pages.

---

## 📋 6. IMPLEMENTATION RULES

- **Persistence:** The Galaxy Bar must be included in the root `__layout.svelte` to never disappear during navigation.
- **Performance:** The instance list is stored in the Svelte Store for ultra-fast access.
- **Accessibility:** Full keyboard support (Alt+1, Alt+2...) to switch instances quickly.
- **Drag & Drop:** Drag-to-reorder instances in the bar.

---

*With the Galaxy Bar, Nexus becomes a true social operating system. Users are no longer "lost" on the web — they are "home" everywhere in the network.*
