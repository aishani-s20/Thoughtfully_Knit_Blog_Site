import { FeatureModule } from '../types/index.ts';

export const INITIAL_FEATURES: FeatureModule[] = [
  {
    id: 'focus_spotlight',
    name: 'Focus Spotlight',
    category: 'sensory',
    description: 'Hardware-accelerated CSS radial contrast mask following cursor and scroll for deep reading immersion.',
    enabled: true,
    badge: 'Sensory',
  },
  {
    id: 'ambient_soundscape',
    name: 'Ambient Soundscape',
    category: 'sensory',
    description: 'Procedural Web Audio harmonic chords dynamically shaped by the active stanza emotional valence and arousal.',
    enabled: true,
    badge: 'Generative',
  },
  {
    id: 'weather_adaptation',
    name: 'Weather Verse Adaptation',
    category: 'atmosphere',
    description: 'Grounds poetry in your local weather (via Open-Meteo) or manual dock override with subtle stanza line transitions.',
    enabled: true,
    badge: 'Grounding',
  },
  {
    id: 'rag_archive_chat',
    name: 'Ask the Archive (RAG)',
    category: 'intelligence',
    description: 'Conversational assistant with streaming token responses, citing stanzas and private author backstory notes.',
    enabled: true,
    badge: 'Gemini RAG',
  },
  {
    id: 'author_studio',
    name: 'Author Ingestion Studio',
    category: 'authoring',
    description: 'Interactive in-browser workbench to write, split stanzas, score 2D sentiment, and publish new works to the archive.',
    enabled: true,
    badge: 'Workbench',
  },
  {
    id: 'gaze_experimental',
    name: 'Paced Typography Scroll',
    category: 'sensory',
    description: 'Soft auto-pacer that gently tracks verse reading cadence and stanza dwell time.',
    enabled: false,
    badge: 'Experimental',
  },
];

const STORAGE_KEY = 'thoughtfully_knit_features';

export function loadFeaturesFromStorage(): FeatureModule[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved: FeatureModule[] = JSON.parse(raw);
      // Merge with initial list to make sure any newly added defaults exist
      const savedMap = new Map(saved.map((f) => [f.id, f]));
      return INITIAL_FEATURES.map((feat) => {
        if (savedMap.has(feat.id)) {
          return { ...feat, enabled: savedMap.get(feat.id)!.enabled };
        }
        return feat;
      }).concat(
        saved.filter((s) => !INITIAL_FEATURES.some((f) => f.id === s.id))
      );
    }
  } catch (e) {
    console.warn('Failed to parse features from localStorage', e);
  }
  return INITIAL_FEATURES;
}

export function saveFeaturesToStorage(features: FeatureModule[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(features));
  } catch (e) {
    console.warn('Failed to save features to localStorage', e);
  }
}
