# Thoughtfully Knit: Living Literary Platform & Extensible Sensory System

Thoughtfully Knit is a hybrid literary publication and machine learning portfolio pairing a high-craft reading room with an extensible, modular sensory layer (ambient sentiment audio, weather-adapted verse, RAG archive chat, and reading spotlight) controlled via a dynamic Feature Registry and floating experience dock.

## User Review & Critical Decisions

> [!IMPORTANT]
> The plan has been revised to include a dynamic **Modular Feature Registry & Toggle Management System**:

- **Dynamic Feature Flags & Kill-Switches**: Readers and admins can toggle any sensory feature on or off in real time (e.g., Focus Spotlight, Ambient Soundscape, Weather Verse Adaptation, Ask the Archive RAG, or Ingestion Studio). Toggling a feature off completely unmounts its event listeners, audio synthesis context, or API probers, leaving the reading experience completely untouched.
- **Future-Proof Extensible Architecture**: Features are defined through a declarative `FeatureRegistry` with a `<FeatureGate featureId="...">` component pattern. Adding new future features (e.g., Text-to-Speech recitation, Speed-Reader RSVP mode, or custom visual themes) requires only adding a registration entry without refactoring core layouts.
- **Confirmed Ingestion Studio**: Visual in-app authoring workbench for splitting stanzas, analyzing 2D Valence & Arousal, and publishing directly to the archive.
- **Unified Full-Stack Express + Vite Architecture**: All server-side Gemini 2.5 Flash analysis, streaming RAG chat, Open-Meteo weather proxies, and feature configuration endpoints are housed inside an integrated TypeScript stack.

---

## 1. Overview & Core Concept

- **What It Does**: An editorial literary publication where each ambient machine learning feature is an independent, opt-in module. Users can enjoy a completely traditional, minimalist reading broadsheet or activate any combination of generative audio, dynamic weather verse, focus spotlights, and RAG archive chat.
- **Extensibility Principle**: Zero monolithic entanglement. Every sensory capability is governed by the Feature Registry (`site_configs` + `userPrefs`), enabling users to turn off any feature they don't want (like the spotlight) or register new experimental modules in the future.
- **Target Audience / Persona**: Literary readers seeking atmospheric focus, writers who want to inspect emotional sentiment in verse, and engineers evaluating clean, modular ML architecture.

---

## 2. Feature Registry & Modular Toggle System

### The Feature Registry Architecture

All capabilities are registered in a centralized configuration registry (`src/config/features.ts`):

| Feature ID | Name | Category | Default State | Description |
| :--- | :--- | :--- | :--- | :--- |
| `focus_spotlight` | **Focus Spotlight** | *Sensory* | `Enabled` | Radial contrast spotlight following reading cursor/scroll. |
| `ambient_soundscape` | **Ambient Soundscape** | *Sensory* | `Enabled` | Procedural Web Audio harmonic chords mapped to stanza valence & arousal. |
| `weather_adaptation` | **Weather Adaptation** | *Atmosphere* | `Enabled` | Open-Meteo live weather detection & stanza variant crossfades. |
| `rag_archive_chat` | **Ask the Archive** | *Intelligence* | `Enabled` | Gemini 2.5 streaming SSE RAG drawer over stanzas and private author notes. |
| `author_studio` | **Ingestion Studio** | *Authoring* | `Enabled` | Interactive authoring workbench for live stanza splitting and sentiment scoring. |
| `custom_extensions` | **Custom Extension Slots** | *Platform* | `Enabled` | Dynamic interface allowing users to register new sensory or reading tools. |

### Modular `<FeatureGate>` Pattern

Components are wrapped in `<FeatureGate featureId="...">`:
```tsx
<FeatureGate featureId="focus_spotlight" fallback={null}>
  <FocusSpotlight readingContainerRef={containerRef} />
</FeatureGate>
```
If a feature is disabled by the user or admin:
1. Its DOM elements and dock buttons are cleanly removed.
2. Its background workers (mouse move listeners, audio oscillators, geolocation calls) are terminated.
3. The layout automatically adapts with zero visual artifacts.

### The Experience Settings & Features Modal

Accessible via the floating dock's gear icon and top navigation:
- **Individual Toggle Switches**: Instant switches for every feature with live state persistence in `localStorage` and optional server sync (`/api/config`).
- **"Add Future Feature" Panel**: An extensible interface allowing users to create new custom feature triggers (e.g. setting custom audio pitch baselines, font scaling presets, or TTS hooks).

---

## 3. User Experience & Visual Design

### Key User Flows

1. **Curated Landing & Bento Archive (`/`)**:
   - 3-zone Top Bar: Wordmark (*Thoughtfully Knit*), single-line links (*Archive*, *Features & Settings*, *Author Studio*), and 1 primary CTA (*Start Reading*).
   - Bento masonry showcase with hand-crafted cover art, unboxed typographic metadata (reading time, emotional valence, tags separated by `·`), and theme filter buttons (*All*, *Solitude*, *Rain*, *Nostalgia*).
2. **Distraction-Free Reading Room (`/read/:slug`)**:
   - Centered editorial verse container (`max-w-prose`) with classical typographic hierarchy.
   - Discrete `<StanzaBlock>` items tracked via `IntersectionObserver`.
3. **The Floating Experience Dock (Dynamic)**:
   - Fixed bottom-right glassmorphic panel (`backdrop-blur-md bg-stone-900/85 text-stone-100 border border-stone-700/50 rounded-2xl shadow-2xl`).
   - Automatically adapts its control buttons based on active features:
     - Soundscape controls appear **only** if `ambient_soundscape` is enabled.
     - Atmosphere selector appears **only** if `weather_adaptation` is enabled.
     - Spotlight switch appears **only** if `focus_spotlight` is enabled.
     - RAG Drawer trigger appears **only** if `rag_archive_chat` is enabled.
     - Always includes the **Features & Settings Toggle Modal** to turn features on/off at will.
4. **Interactive Ingestion Studio (`/studio`)**:
   - Split-pane editor: Markdown frontmatter input on the left, live Gemini analysis on the right.
   - Shows stanza boundaries, 2D Valence & Arousal sentiment meters, and one-click "Publish to Archive".

### Visual Identity & Theme (60-30-10 Rule)

- **Aesthetic Direction**: High-editorial monograph, warm archival paper, literary restraint, anti-slop typography. No neon glows, no fake version tags, no pill badges on cards.
- **Color Palette & Mood**:
  - *60% Neutral Canvas*: Archival bone / warm parchment (`#FBF9F5`) in light mode, deep obsidian ink (`#121110`) in dark mode.
  - *30% Structural Surfaces & Media*: Linen card surfaces (`#F2EFE9` / `#1C1A18`), hairline dividers (`#E5E0D8` / `#2D2A26`), charcoal body ink (`#292524` / `#E7E5E4`).
  - *10% Focal Accent*: Deep cinnabar red (`#991B1B` / `#EF4444`) for active reading states and primary controls, balanced with sage mist (`#047857`) for weather accents.
- **Typography**:
  - *Display / Verse*: Classical editorial serif (*Cormorant Garamond* / *Playfair Display* styling).
  - *UI & Controls*: Clean architectural sans (*Plus Jakarta Sans* / *Inter*).
  - *Telemetry / Analytics*: Tabular monospace (*JetBrains Mono* / `tabular-nums`) strictly for sentiment numbers ($[-1.0, 1.0]$ valence, $[0.0, 1.0]$ arousal).

---

## 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       THOUGHTFULLY KNIT PLATFORM                            │
├──────────────────────────────────────┬──────────────────────────────────────┤
│           READER FRONTEND            │          INGESTION STUDIO            │
│  • Curated Bento Archive Grid        │  • Split-Pane Markdown Editor        │
│  • Distraction-Free Verse Room       │  • Stanza Segmentation Visualizer    │
│  • Stanza Intersection Tracking      │  • 2D Sentiment (Valence/Arousal)    │
│  • Floating Experience Dock          │  • Live Audio Preview & Publish CTA  │
└──────────────────┬───────────────────┴──────────────────┬───────────────────┘
                   │                                      │
                   ▼                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                FEATURE REGISTRY & DYNAMIC GATE ENGINE                       │
│  • FeatureManager: Manages toggle state (local storage + /api/config)       │
│  • <FeatureGate featureId="...">: Conditionally mounts modules              │
│  • Toggles: [Spotlight: ON/OFF] [Audio: ON/OFF] [Weather: ON/OFF] [RAG: ON] │
│  • Extension Hook: Allows registering new future tools into the dock        │
└──────────────────┬──────────────────────────────────────────────────────────┘
                   │
                   ▼ HTTP / SSE
┌─────────────────────────────────────────────────────────────────────────────┐
│                   SERVER-SIDE BACKEND (Express / server.ts)                 │
│  • POST /api/ingest   -> Gemini 2.5 Stanza Splitter & 2D Sentiment Scorer   │
│  • POST /api/chat     -> Hierarchical RAG Retrieval & SSE Streaming Chat    │
│  • GET  /api/weather  -> Open-Meteo Geolocation Proxy & Cache               │
│  • GET  /api/posts    -> Catalog of Published Poems & Stanzas               │
│  • POST /api/posts    -> Ingest New Poem to Archive                         │
│  • GET/POST /api/config -> Feature Flag Persistence & Kill-Switches         │
└──────────────────┬──────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        GEMINI AI API (@google/genai)                        │
│  • Model: gemini-3.8-flash for sentiment parsing & RAG chat streaming       │
│  • Model: gemini-embedding-2-preview for semantic vector indexing           │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Execution Steps

1. **Editorial Image Assets**: Generate 3 high-fidelity editorial visual assets via `generate_image` (a melancholic rain monograph cover, an atmospheric solitary landscape, and an archival library portrait).
2. **Server Infrastructure (`server.ts`)**: Implement Express server mounting Vite middlewares, providing `/api/posts`, `/api/ingest` (Gemini sentiment & stanza parsing), `/api/chat` (streaming SSE RAG over stanzas and author notes), `/api/weather` (Open-Meteo proxy), and `/api/config` (feature flag state).
3. **Feature Registry & Experience Context (`src/context/ExperienceContext.tsx` & `src/config/features.ts`)**: Build the dynamic feature toggle registry, storage persistence, and `<FeatureGate>` component.
4. **Procedural Web Audio Engine (`src/services/audioEngine.ts`)**: Implement harmonic synthesizer mapping stanza valence to pitch scales and arousal to filter modulation.
5. **Editorial Front-End Components**:
   - Clean 3-zone Top Bar with direct link to Feature Settings modal.
   - Bento Archive Grid with filter tabs and unboxed metadata.
   - Distraction-Free Reading Room with `<StanzaBlock>` elements and weather text transitions.
   - Modular Floating Glassmorphic Dock dynamically rendering only active features, with instant toggles for Focus Spotlight, Audio, Weather, and RAG.
   - Feature Settings Modal allowing toggling any existing feature and registering future extension tools.
   - Ingestion Studio with live sentiment gauges and publishing CTA.
6. **Preloaded Literary Catalog**: Ship with 4 deeply crafted poems featuring rich weather variants, stanzas, and author notes exploring grief, monsoon rain, memory, and solitude.
7. **Verification & Build**: Compile and verify clean builds, responsive typography, and functional controls.
