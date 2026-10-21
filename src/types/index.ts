export type WeatherCondition = 'rain' | 'clear' | 'fog' | 'night';

export interface Poem {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  author: string;
  publishedAt: string;
  readTime: string;
  coverGradient: string;
  tags: string[];
  authorNotes: string;
  fullText: string; // The complete, unbroken literary text
  soundscapeId: string; // ID of the LLM-chosen predetermined soundscape
  soundscapeName: string;
  soundscapeRationale: string;
  overallMood: string;
}

export type FeatureCategory = 'sensory' | 'atmosphere' | 'intelligence' | 'authoring' | 'platform';

export interface FeatureModule {
  id: string;
  name: string;
  category: FeatureCategory;
  description: string;
  enabled: boolean;
  isCore?: boolean;
  badge?: string;
}

export interface ExperienceSettings {
  audioEnabled: boolean;
  volume: number; // 0 to 1
  weatherMode: 'auto' | WeatherCondition;
  activeWeather: WeatherCondition;
  spotlightEnabled: boolean;
  spotlightRadius: number; // px
  isChatOpen: boolean;
  isSettingsOpen: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'archive';
  text: string;
  timestamp: string;
}
