import { FeatureModule } from '../types/index.ts';

export const INITIAL_FEATURES: FeatureModule[] = [
  {
    id: 'focus_spotlight',
    name: 'Focus Spotlight',
    category: 'sensory',
    description: 'Hardware-accelerated reading focus mask that keeps current text in full focus while softening peripheral lines.',
    enabled: true,
    badge: 'Sensory',
  },
  {
    id: 'ambient_soundscape',
    name: 'Predetermined Nature Sounds',
    category: 'sensory',
    description: 'Authentic nature sounds (rain, sea waves, morning birds, night crickets, fire, wind) tagged by theme and chosen by AI to match the entire poem as a cohesive work.',
    enabled: true,
    badge: 'Nature Sounds',
  },
  {
    id: 'weather_adaptation',
    name: 'Atmospheric Sound Layering',
    category: 'atmosphere',
    description: 'Adapts acoustic soundscapes to real-time weather (rain patter, night drones, coastal breeze) without altering poem text.',
    enabled: true,
    badge: 'Acoustic Layer',
  },
  {
    id: 'rag_archive_chat',
    name: 'Ask the Archive (RAG)',
    category: 'intelligence',
    description: 'Conversational assistant with streaming token responses, citing verse and private author backstory notes.',
    enabled: true,
    badge: 'Gemini RAG',
  },
  {
    id: 'author_studio',
    name: 'Author Ingestion Studio',
    category: 'authoring',
    description: 'Interactive workbench to evaluate entire poems and predict the best predetermined soundscape profile.',
    enabled: true,
    badge: 'Workbench',
  },
];

const STORAGE_KEY = 'thoughtfully_knit_features';

export function loadFeaturesFromStorage(): FeatureModule[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved: FeatureModule[] = JSON.parse(raw);
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
