# Project Blueprint & Plan of Action: Thoughtfully Knit

## 1. Executive Summary & System Architecture

**Thoughtfully Knit** is a hybrid literary platform and machine learning portfolio. It pairs a fast, SEO-optimized reading room with an opt-in "living" sensory layer controlled from a floating glassmorphic dock.

To maximize both reading performance and engineering portfolio value, the system uses a **decoupled two-service monorepo architecture** sharing a single PostgreSQL (`pgvector`) database:

| Layer | Technology Stack | Core Responsibilities |
| :--- | :--- | :--- |
| **Frontend & Edge Web App** (`/frontend`) | Next.js (App Router, TypeScript), Tailwind CSS, Tone.js, MediaPipe Tasks Vision | Static/ISR poem rendering, masonry gallery filtering, IP-based weather lookup, scroll-synced generative audio, and 60fps focus/gaze spotlight. |
| **ML & AI Microservice** (`/backend`) | Python, FastAPI,Pydantic, SQLAlchemy/asyncpg, OpenAI/Gemini SDK, HuggingFace Transformers | Automated poem ingestion (stanza splitting + 2D sentiment scoring), hierarchical vector embedding generation, and streaming SSE RAG chat. |
| **Database & Vector Store** (`PostgreSQL`) | Managed PostgreSQL (Supabase or Neon) + `pgvector` extension | Relational storage for poems and stanza metadata, global admin kill-switches (`site_configs`), and vector embeddings (`post_embeddings`). |

### How the Authoring & Ingestion Workflow Works

Instead of manually typing SQL rows or hand-coding React components every time you write a poem, you will use an **Automated Drop-and-Ingest Workflow**:

1. **Write in Plain Markdown:** You write a poem as a simple `.md` file inside a `/content/poems/` folder, with metadata at the top (title, tags, cover image, optional weather variants) and an optional `## Author Notes` section at the bottom explaining the poem's hidden themes or backstory.
2. **Run the FastAPI Ingestion Script:** When you run `python scripts/ingest.py`, your Python service automatically:
   * Splits the poem into individual stanzas.
   * Runs sentiment analysis on each stanza to score **Valence** (emotional positivity/darkness) and **Arousal** (intensity/calm) for Tone.js audio mapping.
   * Generates vector embeddings for both the stanzas and your private `Author Notes`.
   * Upserts the structured data into PostgreSQL and triggers Next.js on-demand revalidation so the new poem appears live immediately.

## 2. Phase 1: Monorepo Setup & Core Frontend Foundation

**Goal:** Build the static, distraction-free literary shell and floating experience dock with zero heavy AI libraries loaded by default.

* **Task 1.1: Initialize Monorepo Structure**
  * Create root directory with `/frontend` (Next.js App Router, TypeScript, Tailwind CSS) and `/backend` (FastAPI Python virtual environment).
  * Configure `next/font` pairing an editorial serif (*Newsreader* or *Cormorant Garamond*) for verse with a clean geometric sans-serif (*Plus Jakarta Sans* or *Inter*) for UI controls.
* **Task 1.2: Build the Curated Landing Gallery (`/`)**
  * Create a responsive masonry/bento gallery grid using `next/image` with blurred placeholders for hand-curated cover art.
  * Implement client-side URL-synced filter pills (e.g., *Nostalgia*, *Monsoon*, *Solitude*, *Grief*) with smooth layout transitions.
* **Task 1.3: Build the Distraction-Free Reading Room (`/read/[slug]`)**
  * Use semantic slug routing (`/read/the-weight-of-rain`) instead of numeric IDs for SEO.
  * Render poems as structured stanza blocks (`<StanzaBlock index={i} />`) inside a centered `max-w-prose` container with generous vertical rhythm.
* **Task 1.4: Build the Floating Experience Dock**
  * Create a fixed bottom-right glassmorphic panel (`backdrop-blur-md bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/50`).
  * Include four modular controls:
    1. **Ambient Audio Toggle** (Play/Pause + subtle volume slider).
    2. **Atmosphere / Weather Mode** (Auto IP-Weather vs. manual *Rain / Clear / Night* override).
    3. **Focus Spotlight Toggle** (Cursor/Scroll Spotlight vs. Experimental Webcam Gaze).
    4. **Ask the Archive Drawer** (Expandable streaming RAG chat drawer).

## 3. Phase 2: Database Schema & Automated Python Ingestion

**Goal:** Store poems at stanza granularity so audio, weather variants, and RAG retrieval operate with high precision.

* **Task 2.1: Provision PostgreSQL with `pgvector`**
  * Enable the `vector` extension (`CREATE EXTENSION IF NOT EXISTS vector;`).
* **Task 2.2: Define Core & Stanza Tables**
  * `posts`: `id (UUID)`, `slug (TEXT UNIQUE)`, `title`, `published_at`, `cover_image_url`, `tags (TEXT[])`, `author_notes (TEXT)`.
  * `post_stanzas`: `id (UUID)`, `post_id (FK)`, `stanza_index (INT)`, `base_text (TEXT)`, `weather_variants (JSONB)`, `sentiment_valence (FLOAT)`, `sentiment_arousal (FLOAT)`.
* **Task 2.3: Define Feature Config & Vector Tables**
  * `site_configs`: `feature_key (TEXT PRIMARY KEY)`, `is_enabled_by_admin (BOOLEAN)`, `updated_at (TIMESTAMP)`.
  * `post_embeddings`: `id (UUID)`, `post_id (FK)`, `chunk_type (TEXT: 'poem' | 'stanza' | 'author_note')`, `chunk_text (TEXT)`, `embedding (VECTOR(1536))`.
* **Task 2.4: Build the FastAPI Ingestion & Sentiment Pipeline (`/backend/scripts/ingest.py`)**
  * Parse local `.md` poem files into stanzas.
  * Compute 2D sentiment scores (`valence` in `[-1.0, 1.0]`, `arousal` in `[0.0, 1.0]`) per stanza using a lightweight classifier or structured LLM extraction prompt.
  * Generate embeddings for each stanza plus `author_notes` and write all records to PostgreSQL in a single transaction.
* **Task 2.5: Connect Next.js Data Layer**
  * Fetch poem and stanza data via Server Components using Incremental Static Regeneration (`revalidateTag('poems')`).
  * Expose a lightweight `/api/config` route handler to fetch `site_configs` dynamically so admin kill-switches take effect immediately without rebuilding static pages.

## 4. Phase 3: State Management & Lazy-Loaded Feature Gates

**Goal:** Keep initial page load near-instant (95+ Lighthouse score) by loading heavy audio and computer-vision bundles only when toggled on.

* **Task 3.1: Implement `ExperienceContext`**
  * Merge server-fetched `site_configs` (admin kill-switches) with client-side `localStorage` preferences (`userPrefs`).
  * Track active reading state: `activeStanzaIndex`, `weatherCondition`, `isAudioActive`, `focusMode ('off' | 'cursor' | 'gaze')`, and `isChatOpen`.
* **Task 3.2: Build `<FeatureGate>` with Dynamic Imports**
  * Evaluate `isEnabledByAdmin && userPrefEnabled`.
  * Wrap heavy client modules (`ToneAudioEngine`, `MediaPipeGazeTracker`) in `next/dynamic(..., { ssr: false })` inside `<FeatureGate>` so visitors who only want to read plain text never download WASM or audio synthesis files.

## 5. Phase 4: AI & Interactive Microservices

**Goal:** Deliver each interactive literature feature as an isolated, fault-tolerant module.

* **Task 4.1: Context-Aware Prose (Zero-Prompt Weather Adaptation)**
  * **Server Resolution:** Read edge geolocation headers (`x-vercel-ip-latitude`, `x-vercel-ip-longitude`, or city fallback) in a Next.js Route Handler and query OpenWeatherMap (cached for 30 minutes per city).
  * **Stanza Rendering:** If a stanza has `weather_variants` in JSONB (e.g., `{"rain": "...", "clear": "..."}`), smoothly crossfade the stanza lines to match either the live local weather or the user's manual weather switcher in the dock.
* **Task 4.2: Sentiment-Driven Ambient Audio (Tone.js + IntersectionObserver)**
  * **Scroll Tracking:** Attach an `IntersectionObserver` to `<StanzaBlock>` elements to update `activeStanzaIndex` as the reader scrolls.
  * **Generative Soundscape:** Map the active stanza's precomputed `sentiment_valence` to harmonic scale selection (e.g., Lydian/Major warm pad vs. Dorian/Minor melancholic pad) and `sentiment_arousal` to low-pass filter cutoff frequency and reverb wet mix using smooth `rampTo()` transitions over 2 seconds.
* **Task 4.3: Streaming Literary RAG Microservice (FastAPI + SSE)**
  * **FastAPI Endpoint (`POST /api/v1/chat`):** Accept user question and optional `current_post_id`.
  * **Hybrid Retrieval:** Query `post_embeddings` using `pgvector` cosine similarity (`<=>`), prioritizing chunks from the currently open poem alongside global `author_note` chunks across the archive.
  * **Streaming Response:** Stream tokens back via `StreamingResponse` (`text/event-stream`) with inline links to referenced poems (`/read/[slug]`).
* **Task 4.4: Focus & Gaze-Paced Typography (CSS Mask + MediaPipe)**
  * **Default Focus Mode (Cursor/Scroll Spotlight):** Apply a hardware-accelerated CSS radial gradient mask (`mask-image: radial-gradient(circle 180px at var(--focus-x) var(--focus-y), black 40%, rgba(0,0,0,0.15) 100%)`) over the reading container, avoiding slow `backdrop-filter: blur()` repaints.
  * **Experimental Webcam Gaze Mode:** Dynamically load `@mediapipe/tasks-vision` (`FaceLandmarker`), run a quick 4-corner click calibration overlay to map iris landmarks to viewport coordinates, and apply exponential smoothing (`lerp(current, target, 0.12)`) before updating `--focus-x` and `--focus-y`.

## 6. Execution Roadmap: 14-Day Vertical Slice Plan

| Milestone Window | Focus Area | Concrete Deliverables & Verification Criteria |
| :--- | :--- | :--- |
| **Days 1–3** | **Foundation & Reading UI** | Monorepo initialized; landing masonry grid with tag filtering; `/read/[slug]` page rendering mock stanza JSON; Floating Experience Dock wired to `ExperienceContext`. |
| **Days 4–5** | **Database & Python Ingestion** | Supabase/Neon PostgreSQL + `pgvector` live; FastAPI `/backend` scaffolded; `ingest.py` parsing local Markdown poems into `posts` and `post_stanzas` with 2D sentiment scores. |
| **Days 6–8** | **Weather Prose & Tone.js Audio** | IP weather route + manual dock override switching stanza variants; `IntersectionObserver` triggering smooth Tone.js ambient chord shifts per stanza. |
| **Days 9–11** | **FastAPI Streaming RAG Chat** | `ingest.py` populating `post_embeddings` (stanzas + `author_notes`); FastAPI `/api/v1/chat` streaming answers via SSE into the Floating Dock chat drawer. |
| **Days 12–13** | **Spotlight & MediaPipe Gaze** | 60fps CSS radial mask working with cursor/scroll; optional MediaPipe webcam hook with 4-point calibration and LERP smoothing wrapped in `<FeatureGate>`. |
| **Day 14** | **Deployment & Portfolio Polish** | Next.js deployed on Vercel; FastAPI deployed on Render/Railway; `site_configs` kill-switches verified; architecture README documented for recruiters. |
