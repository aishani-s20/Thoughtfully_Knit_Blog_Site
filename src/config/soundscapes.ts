export interface NaturalSoundscape {
  id: string;
  name: string;
  tags: string[];
  description: string;
  category: 'rain' | 'ocean' | 'birds' | 'crickets' | 'hearth' | 'wind';
}

export const PRESET_SOUNDSCAPES: NaturalSoundscape[] = [
  {
    id: 'steady_rain',
    name: 'Rain Sound',
    tags: ['rain', 'monsoon', 'water', 'grief', 'solitude', 'roof', 'puddle', 'window', 'downpour'],
    description: 'Gentle, soothing rain sound pattering on roof, leaves, and window glass.',
    category: 'rain',
  },
  {
    id: 'ocean_waves',
    name: 'Sea Sound',
    tags: ['coast', 'sea', 'ocean', 'waves', 'shore', 'tide', 'cliff', 'water', 'distance', 'winter'],
    description: 'Rhythmic sea waves and coastal surf rolling against the shore and receding.',
    category: 'ocean',
  },
  {
    id: 'morning_birds',
    name: 'Morning Birds Sound',
    tags: ['birds', 'morning', 'sunlight', 'meadow', 'dawn', 'trees', 'spring', 'hope', 'clarity'],
    description: 'Fresh morning birds singing in a dawn meadow with a gentle breeze.',
    category: 'birds',
  },
  {
    id: 'night_crickets',
    name: 'Night Crickets Sound',
    tags: ['night', 'crickets', 'darkness', 'silence', 'midnight', 'sleep', 'stars', 'quiet', 'stillness'],
    description: 'Soothing nocturnal field crickets under a quiet starlit sky.',
    category: 'crickets',
  },
  {
    id: 'crackling_hearth',
    name: 'Fireplace & Hearth Sound',
    tags: ['fire', 'hearth', 'embers', 'warmth', 'craft', 'winter', 'cabin', 'wood', 'flame', 'heritage'],
    description: 'Warm crackling fireplace with burning wood logs and gentle embers.',
    category: 'hearth',
  },
  {
    id: 'mountain_wind',
    name: 'Mountain Wind Sound',
    tags: ['wind', 'pines', 'mountain', 'air', 'solitude', 'stone', 'silence', 'altitude', 'breeze'],
    description: 'Serene mountain wind softly moving through wild pine trees.',
    category: 'wind',
  },
];

export function getSoundscapeById(id: string): NaturalSoundscape {
  return PRESET_SOUNDSCAPES.find((s) => s.id === id) || PRESET_SOUNDSCAPES[0];
}
