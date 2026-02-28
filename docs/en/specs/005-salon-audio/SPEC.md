# NEXUS — AUDIO VISION & IMMERSION
### "Sound is not optional — it is the emotion of the network."

---

## 🎧 1. THE PROCESSING CHAIN (STUDIO QUALITY)
For "Go Nexus" to become the standard, the sound must be perfect, even with a mediocre microphone.

* **Opus Full-Band codec:** 48kHz sampling rate (CD quality) by default.
* **DeepFilterNet (Local AI):** Replacement for Krisp. Uses an ultra-lightweight deep learning model (WASM) to reconstruct the voice and suppress 100% of background noise (keyboard, construction, wind).
* **Native Ducking:** Automatically lowers the volume of music/ambient sound as soon as a voice is detected.
* **Auto-Gain & Limiter:** Nobody saturates, nobody is inaudible. Nexus intelligently levels volumes.

---

## 🎵 2. THE SOCIAL JUKEBOX (NATIVE MUSIC)
Music is no longer a bot — it's a member of the room.

* **P2P Turntable:** Broadcasts files (MP3, FLAC) or web streams in perfect millisecond synchronization between all participants.
* **Reactive Visualizers:** The interface (round table borders, cinema lights) reacts in real time to the music frequencies.
* **Democratic Queue:** Upvote/Downvote voting system on the current playlist.

---

## 🚀 3. INNOVATIVE FEATURES (THE WILD IDEAS)

### A. The "Sound Wall" Spatial (3D Audio)
* **The idea:** If your friend's avatar is to the left on the "Round Table", you hear them on the left in your headphones.
* **The effect:** Total immersion. If someone "approaches" your avatar, the sound becomes louder and more intimate. Physical proximity is recreated.

### B. The "Universal Translator" (Ollama AI)
* **The idea:** Use Whisper (via local Ollama) to transcribe and translate in real time as floating subtitles above the avatar.
* **The effect:** A French speaker and a Japanese speaker can talk in the same Nexus voice channel. The language barrier shatters.

### C. "Shadow Zones" (Whispering)
* **The idea:** In a large channel (Cinema), you can drag your avatar against another member's to create a "private bubble."
* **The effect:** You hear each other at 100%, while the rest of the channel becomes a distant murmur (30%). Perfect for private conversations without leaving the room.

### D. The Audio "Time Capsule"
* **The idea:** An "Instant Replay" button that, thanks to the local buffer, lets you re-listen to the last 30 seconds (e.g. "What did they say? I didn't catch it").
* **The effect:** No need to ask for repeats — full control over the temporal flow of the discussion.

### E. Presence Text-to-Speech
* **The idea:** If you're in "read-only" mode (at work, for example), you type text and Nexus converts it to speech (TTS) with a unique timbre for your avatar.
* **The effect:** You participate in the voice channel without speaking, with a "voice" that represents you.

---

## 🛠️ TECHNICAL SUMMARY FOR IMPLEMENTATION
1. **Transport:** WebRTC (Phase 3).
2. **Processing:** WebAssembly (WASM) for RNNoise or DeepFilterNet.
3. **Sync:** NTP-like via Socket.io for music.
4. **AI:** Ollama Connector for optional transcription/translation.

---

> "In Nexus, silence is pure, music is shared, and every voice has its place in space."
