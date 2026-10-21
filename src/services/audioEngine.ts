/**
 * Authentic Natural Soundscape Audio Engine
 * Plays authentic, pure nature field recordings:
 * - Rain sound (gentle rainfall & roof drops)
 * - Sea / Ocean waves sound (coastal surf)
 * - Morning birds sound (dawn meadow birdsong)
 * - Night crickets sound (nocturnal forest ambience)
 * - Crackling hearth sound (wood embers & fire)
 * - Mountain wind sound (gentle breeze through pines)
 * 
 * ZERO musical chords, zero synth oscillators, zero pitches.
 */

import { NaturalSoundscape, PRESET_SOUNDSCAPES, getSoundscapeById } from '../config/soundscapes.ts';
import { WeatherCondition } from '../types/index.ts';

const SOUND_FILE_MAP: Record<string, string> = {
  steady_rain: '/sounds/rain.mp3',
  ocean_waves: '/sounds/waves.mp3',
  morning_birds: '/sounds/birds.mp3',
  night_crickets: '/sounds/crickets.mp3',
  crackling_hearth: '/sounds/campfire.mp3',
  mountain_wind: '/sounds/wind.mp3',
};

class NaturalSoundEngine {
  private primaryAudio: HTMLAudioElement | null = null;
  private weatherAudio: HTMLAudioElement | null = null;
  private isRunning: boolean = false;
  private currentVolume: number = 0.5;
  private currentPreset: NaturalSoundscape = PRESET_SOUNDSCAPES[0];
  private currentWeather: WeatherCondition = 'rain';
  private fadeInterval: number | null = null;

  public async start(): Promise<boolean> {
    try {
      this.initPrimaryAudio(this.currentPreset.id);
      if (this.primaryAudio) {
        this.primaryAudio.volume = 0;
        await this.primaryAudio.play();
        this.fadeAudio(this.primaryAudio, this.currentVolume, 800);
      }

      this.updateWeatherLayer(this.currentWeather);
      this.isRunning = true;
      return true;
    } catch (err) {
      console.warn('NaturalSoundEngine start error:', err);
      return false;
    }
  }

  public stop(): void {
    if (!this.isRunning) return;

    if (this.primaryAudio) {
      const el = this.primaryAudio;
      this.fadeAudio(el, 0, 500, () => {
        try {
          el.pause();
          el.currentTime = 0;
        } catch { /* noop */ }
      });
    }

    if (this.weatherAudio) {
      const wEl = this.weatherAudio;
      this.fadeAudio(wEl, 0, 500, () => {
        try {
          wEl.pause();
          wEl.currentTime = 0;
        } catch { /* noop */ }
      });
    }

    this.isRunning = false;
  }

  public setVolume(vol: number): void {
    this.currentVolume = Math.max(0, Math.min(1, vol));
    if (this.primaryAudio && this.isRunning) {
      this.primaryAudio.volume = this.currentVolume;
    }
    if (this.weatherAudio && this.isRunning) {
      this.weatherAudio.volume = this.getWeatherTargetVolume();
    }
  }

  public setSoundscape(presetId: string): void {
    const preset = getSoundscapeById(presetId);
    this.currentPreset = preset;

    if (!this.isRunning) return;

    // Crossfade to the new natural sound file
    const oldAudio = this.primaryAudio;
    if (oldAudio) {
      this.fadeAudio(oldAudio, 0, 600, () => {
        try {
          oldAudio.pause();
          oldAudio.src = '';
        } catch { /* noop */ }
      });
    }

    this.initPrimaryAudio(preset.id);
    if (this.primaryAudio) {
      this.primaryAudio.volume = 0;
      this.primaryAudio.play().then(() => {
        if (this.primaryAudio) {
          this.fadeAudio(this.primaryAudio, this.currentVolume, 800);
        }
      }).catch((e) => console.warn('Soundscape switch play error:', e));
    }
  }

  public setWeatherLayer(weather: WeatherCondition): void {
    this.currentWeather = weather;
    if (!this.isRunning) return;
    this.updateWeatherLayer(weather);
  }

  private updateWeatherLayer(weather: WeatherCondition): void {
    // If current preset is already rain, don't double-play rain
    if (this.currentPreset.category === 'rain' || weather === 'clear') {
      if (this.weatherAudio) {
        const wEl = this.weatherAudio;
        this.fadeAudio(wEl, 0, 500, () => {
          try {
            wEl.pause();
          } catch { /* noop */ }
        });
      }
      return;
    }

    // When outside weather is rain or fog, layer gentle background rain or wind
    const weatherSoundSrc = weather === 'rain' ? '/sounds/rain.mp3' : '/sounds/wind.mp3';

    if (!this.weatherAudio) {
      this.weatherAudio = new Audio(weatherSoundSrc);
      this.weatherAudio.loop = true;
    } else if (!this.weatherAudio.src.endsWith(weatherSoundSrc)) {
      this.weatherAudio.src = weatherSoundSrc;
    }

    const targetVol = this.getWeatherTargetVolume();
    this.weatherAudio.volume = 0;
    this.weatherAudio.play().then(() => {
      if (this.weatherAudio) {
        this.fadeAudio(this.weatherAudio, targetVol, 1000);
      }
    }).catch(() => { /* user interaction pending */ });
  }

  private getWeatherTargetVolume(): number {
    if (this.currentWeather === 'rain') return this.currentVolume * 0.35;
    if (this.currentWeather === 'fog') return this.currentVolume * 0.25;
    if (this.currentWeather === 'night') return this.currentVolume * 0.15;
    return 0;
  }

  private initPrimaryAudio(presetId: string): void {
    const src = SOUND_FILE_MAP[presetId] || '/sounds/rain.mp3';
    this.primaryAudio = new Audio(src);
    this.primaryAudio.loop = true;
  }

  private fadeAudio(
    audio: HTMLAudioElement,
    targetVol: number,
    durationMs: number,
    onComplete?: () => void
  ): void {
    const steps = 16;
    const stepTime = durationMs / steps;
    const initialVol = audio.volume;
    const volDiff = targetVol - initialVol;
    let currentStep = 0;

    const interval = window.setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const newVol = Math.max(0, Math.min(1, initialVol + volDiff * progress));
      audio.volume = newVol;

      if (currentStep >= steps) {
        clearInterval(interval);
        audio.volume = targetVol;
        if (onComplete) onComplete();
      }
    }, stepTime);
  }

  public getIsRunning(): boolean {
    return this.isRunning;
  }

  public getCurrentPreset(): NaturalSoundscape {
    return this.currentPreset;
  }

  public getCurrentWeather(): WeatherCondition {
    return this.currentWeather;
  }
}

export const soundscapeEngine = new NaturalSoundEngine();
