export type WeatherCondition = 'rain' | 'clear' | 'fog' | 'night';

export interface StanzaSentiment {
  valence: number; // -1.0 (melancholic/dark) to +1.0 (bright/transcendent)
  arousal: number; // 0.0 (still/calm) to 1.0 (tense/intense)
  dominantEmotion: string;
  musicalKey?: string;
}

export interface Stanza {
  id: string;
  index: number;
  baseText: string;
  weatherVariants: {
    rain?: string;
    clear?: string;
    fog?: string;
    night?: string;
  };
  sentiment: StanzaSentiment;
  embedding?: number[];
}

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
  stanzas: Stanza[];
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
  spotlightMode: 'cursor' | 'scroll' | 'center';
  activeStanzaIndex: number;
  isChatOpen: boolean;
  isSettingsOpen: boolean;
}

export interface ChatCitation {
  poemTitle: string;
  poemSlug: string;
  stanzaIndex: number;
  textSnippet: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'archive';
  text: string;
  timestamp: string;
  citations?: ChatCitation[];
}
