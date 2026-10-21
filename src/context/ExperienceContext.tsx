import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { FeatureModule, WeatherCondition, Poem } from '../types/index.ts';
import { loadFeaturesFromStorage, saveFeaturesToStorage } from '../config/features.ts';
import { INITIAL_POEMS } from '../data/poems.ts';
import { soundscapeEngine } from '../services/audioEngine.ts';
import { detectLocalWeather } from '../services/weatherService.ts';
import { NaturalSoundscape, getSoundscapeById } from '../config/soundscapes.ts';

interface ExperienceContextType {
  // Feature flags
  features: FeatureModule[];
  isFeatureEnabled: (id: string) => boolean;
  toggleFeature: (id: string) => void;
  addCustomFeature: (name: string, description: string, category: FeatureModule['category']) => void;

  // Predetermined Audio / Soundscape
  audioEnabled: boolean;
  volume: number;
  setVolume: (vol: number) => void;
  toggleAudio: () => Promise<void>;
  activeSoundscape: NaturalSoundscape;
  setActiveSoundscape: (id: string) => void;

  // Weather / Atmosphere
  weatherMode: 'auto' | WeatherCondition;
  activeWeather: WeatherCondition;
  weatherTemp: number;
  setWeatherMode: (mode: 'auto' | WeatherCondition) => void;

  // Focus Spotlight
  spotlightEnabled: boolean;
  toggleSpotlight: () => void;
  spotlightRadius: number;
  setSpotlightRadius: (r: number) => void;

  // Reading Navigation
  activePoemSlug: string | null;
  setActivePoemSlug: (slug: string | null) => void;

  // Visual Theme (Parchment vs Obsidian)
  theme: 'light' | 'dark';
  toggleTheme: () => void;

  // Drawers & Modals
  isChatOpen: boolean;
  setIsChatOpen: (open: boolean) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;

  // Catalog
  poems: Poem[];
  addPublishedPoem: (poem: Poem) => void;
}

const ExperienceContext = createContext<ExperienceContextType | undefined>(undefined);

const POEMS_STORAGE_KEY = 'thoughtfully_knit_catalog_v2';

export const ExperienceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 1. Features
  const [features, setFeatures] = useState<FeatureModule[]>(loadFeaturesFromStorage);

  const isFeatureEnabled = useCallback((id: string): boolean => {
    const feat = features.find((f) => f.id === id);
    return feat ? feat.enabled : true;
  }, [features]);

  const toggleFeature = useCallback((id: string) => {
    setFeatures((prev) => {
      const updated = prev.map((f) => (f.id === id ? { ...f, enabled: !f.enabled } : f));
      saveFeaturesToStorage(updated);
      return updated;
    });
  }, []);

  const addCustomFeature = useCallback((name: string, description: string, category: FeatureModule['category']) => {
    const newId = `custom_${Date.now()}`;
    const newModule: FeatureModule = {
      id: newId,
      name,
      description,
      category,
      enabled: true,
      badge: 'Custom Tool',
    };
    setFeatures((prev) => {
      const updated = [...prev, newModule];
      saveFeaturesToStorage(updated);
      return updated;
    });
  }, []);

  // 2. Audio State
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [volume, setVolumeState] = useState(0.45);
  const [activeSoundscape, setActiveSoundscapeState] = useState<NaturalSoundscape>(() => soundscapeEngine.getCurrentPreset());

  const setVolume = (v: number) => {
    setVolumeState(v);
    soundscapeEngine.setVolume(v);
  };

  const toggleAudio = async () => {
    if (audioEnabled) {
      soundscapeEngine.stop();
      setAudioEnabled(false);
    } else {
      const started = await soundscapeEngine.start();
      if (started) {
        setAudioEnabled(true);
      }
    }
  };

  const setActiveSoundscape = (id: string) => {
    const preset = getSoundscapeById(id);
    setActiveSoundscapeState(preset);
    soundscapeEngine.setSoundscape(id);
  };

  // If feature is disabled by user, stop audio
  useEffect(() => {
    if (!isFeatureEnabled('ambient_soundscape') && audioEnabled) {
      soundscapeEngine.stop();
      setAudioEnabled(false);
    }
  }, [isFeatureEnabled, audioEnabled]);

  // 3. Weather State
  const [weatherMode, setWeatherModeState] = useState<'auto' | WeatherCondition>('auto');
  const [activeWeather, setActiveWeather] = useState<WeatherCondition>('rain');
  const [weatherTemp, setWeatherTemp] = useState(20);

  useEffect(() => {
    let isMounted = true;
    if (weatherMode === 'auto') {
      detectLocalWeather().then(({ condition, temp }) => {
        if (isMounted) {
          setActiveWeather(condition);
          setWeatherTemp(temp);
          if (isFeatureEnabled('weather_adaptation')) {
            soundscapeEngine.setWeatherLayer(condition);
          }
        }
      });
    } else {
      setActiveWeather(weatherMode);
      if (isFeatureEnabled('weather_adaptation')) {
        soundscapeEngine.setWeatherLayer(weatherMode);
      }
    }
    return () => {
      isMounted = false;
    };
  }, [weatherMode, isFeatureEnabled]);

  const setWeatherMode = (mode: 'auto' | WeatherCondition) => {
    setWeatherModeState(mode);
    if (mode !== 'auto') {
      setActiveWeather(mode);
      if (isFeatureEnabled('weather_adaptation')) {
        soundscapeEngine.setWeatherLayer(mode);
      }
    }
  };

  // 4. Spotlight State
  const [spotlightEnabled, setSpotlightEnabled] = useState(true);
  const [spotlightRadius, setSpotlightRadius] = useState(210);

  const toggleSpotlight = () => {
    setSpotlightEnabled((prev) => !prev);
  };

  // 5. Reading Navigation
  const [activePoemSlug, setActivePoemSlug] = useState<string | null>(null);

  // 6. Visual Theme (Light Parchment vs Dark Obsidian)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('thoughtfully_knit_theme');
      if (saved === 'dark' || saved === 'light') return saved;
    } catch {
      /* noop */
    }
    return 'light';
  });

  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      try {
        localStorage.setItem('thoughtfully_knit_theme', theme);
      } catch {
        /* noop */
      }
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // 7. Drawers
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // 8. Catalog
  const [poems, setPoems] = useState<Poem[]>(() => {
    try {
      const stored = localStorage.getItem(POEMS_STORAGE_KEY);
      if (stored) {
        const parsed: Poem[] = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].fullText) {
          const existingSlugs = new Set(parsed.map((p) => p.slug));
          const missingDefaults = INITIAL_POEMS.filter((p) => !existingSlugs.has(p.slug));
          return [...parsed, ...missingDefaults];
        }
      }
    } catch {
      /* noop */
    }
    return INITIAL_POEMS;
  });

  const addPublishedPoem = (newPoem: Poem) => {
    setPoems((prev) => {
      const updated = [newPoem, ...prev.filter((p) => p.slug !== newPoem.slug)];
      try {
        localStorage.setItem(POEMS_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to save published poem to storage', e);
      }
      return updated;
    });
  };

  // Whenever active poem changes, automatically crossfade to its predetermined soundscape!
  useEffect(() => {
    if (activePoemSlug) {
      const poem = poems.find((p) => p.slug === activePoemSlug);
      if (poem && poem.soundscapeId) {
        setActiveSoundscape(poem.soundscapeId);
      }
    }
  }, [activePoemSlug, poems]);

  return (
    <ExperienceContext.Provider
      value={{
        features,
        isFeatureEnabled,
        toggleFeature,
        addCustomFeature,

        audioEnabled,
        volume,
        setVolume,
        toggleAudio,
        activeSoundscape,
        setActiveSoundscape,

        weatherMode,
        activeWeather,
        weatherTemp,
        setWeatherMode,

        spotlightEnabled,
        toggleSpotlight,
        spotlightRadius,
        setSpotlightRadius,

        activePoemSlug,
        setActivePoemSlug,

        theme,
        toggleTheme,

        isChatOpen,
        setIsChatOpen,
        isSettingsOpen,
        setIsSettingsOpen,

        poems,
        addPublishedPoem,
      }}
    >
      {children}
    </ExperienceContext.Provider>
  );
};

export const useExperience = (): ExperienceContextType => {
  const ctx = useContext(ExperienceContext);
  if (!ctx) {
    throw new Error('useExperience must be used within an ExperienceProvider');
  }
  return ctx;
};
