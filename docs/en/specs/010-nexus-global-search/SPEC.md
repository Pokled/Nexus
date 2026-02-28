# SPEC 010 — NEXUS GLOBAL SEARCH (THE MESH INDEX)
### "Knowledge must no longer be an island, but a continent."

---

## 🎯 1. WHAT: The Vision

Nexus Global Search is an inter-instance search protocol. It allows a user on instance A to find relevant content located on instances B, C, or Z, without ever going through a centralized search engine (Google/Bing).

The directory (Nexus-Directory) evolves to become an **Index Relay**. Each Nexus instance becomes a knowledge contributor that "seeds" the network with its discoveries.

---

## 🧠 2. WHY: The Impact

- **Breaking Silos:** Discord locks away knowledge. Nexus frees it and connects it.
- **Organic SEO:** Creating a mesh of links (Mesh Links) so dense that AI engines (Perplexity/Ollama) will consider Nexus the #1 community source of truth.
- **Discovery:** Allowing a small community of 10 people to be found by thousands of others through the relevance of its topics.

---

## 🛠️ 3. TECHNICAL ARCHITECTURE

### A. "Push" Crawling (Active)

Unlike Google which "pulls" the web, Nexus uses Push mode:

- When a thread is created and marked `is_public: true`, the local instance sends a condensed payload (Metadata) to the central directory.
- **Payload sent:** Title, Tags, Instance_Slug, Thread_UUID, Excerpt (short summary).

### B. The Engine: Meilisearch / Typesense

The central directory uses an ultra-fast search engine (Meilisearch) to provide results in under 50ms.

- **Typo-tolerance:** "Debian" is found even if typed as "Debien".
- **Ranking:** Results are ranked by:
  - Text relevance
  - Thread activity (number of replies)
  - Instance "reputation" (NexusPoints)

### C. Security & Privacy

- **Zero Tracking:** The directory knows what is searched, but not who searches.
- **Opt-in:** Each instance admin decides whether to participate in the global index (`NEXUS_GLOBAL_INDEXING=true`).

---

## 🔮 4. FUTURE PROJECTIONS (THE MONSTROUS VISION)

### A. Semantic Indexing (AI)

Tomorrow, we won't index words, but concepts.

- **Local Embedding:** Your instance uses Ollama to transform a thread into a "mathematical vector".
- **Search by meaning:** You search "sound problem on Linux", the index proposes a thread titled "Alsa / Pipewire fix" because it understood it's the same topic.

### B. The P2P "Nexus-Bot" Crawler

If the central directory goes down, instances switch to Gossip Protocol mode. They exchange their indexes peer-to-peer. Search becomes totally indestructible.

---

## 🚀 5. "WILD ZONE" (RAW IDEAS)

- **The "Trending Mesh":** A 3D visualization (or map) of topics currently "burning" across the entire Nexus network. The more a topic is discussed, the brighter it glows on the map.
- **Knowledge Rewards:** If your thread on instance A helps 100 people coming from the global search engine, your instance earns "Flow Credits" or "Lighthouse of Knowledge" badges.
- **Search-to-Vocal:** Search not only returns text results, but also tells you if there's a "Cinema" Voice Channel currently live on that topic. "Looking for info on Rust? There's a live conference on the Dev-Nexus instance, click to enter."
- **The "Teleportation Button":** In search results, a button that lets you instantly join a third-party instance with your current Nexus identity (decentralized Single Sign-On).

---

## 📋 6. IMPLEMENTATION RULES

- **Migration:** Add `is_indexed BOOLEAN DEFAULT TRUE` to the threads table.
- **Worker:** Create a small `background-index-sync` service that runs every 10 minutes.
- **API:** Create the `POST /api/v1/network/announce` endpoint so instances communicate with the directory.

---

*With this SPEC, we are not just building a search function. We are building the foundations of a new Web where information is free, protected, and above all — findable.*
