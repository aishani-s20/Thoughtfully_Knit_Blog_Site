/**
 * Web Audio Generative Ambient Soundscape Engine for Thoughtfully Knit
 * Mathematically maps stanza emotional Valence (-1.0 to +1.0) and Arousal (0.0 to 1.0)
 * to procedural polyphonic chord voicings, low-pass filter contours, and gentle modulation.
 */

interface ChordVoicing {
  root: number;
  frequencies: number[];
  name: string;
}

// Warm ambient frequencies (Hz) for emotional chord voicings
const CHORDS_BY_VALENCE = {
  // Dark, Melancholic, Pensive (Valence < -0.2)
  melancholic: [
    { root: 146.83, frequencies: [146.83, 220.0, 261.63, 329.63, 440.0], name: 'D Minor 9th' }, // D3, A3, C4, E4, A4
    { root: 130.81, frequencies: [130.81, 196.0, 246.94, 311.13, 392.0], name: 'C Minor 7th' }, // C3, G3, B3, Eb4, G4
    { root: 110.0, frequencies: [110.0, 164.81, 220.0, 261.63, 329.63], name: 'A Minor 11th' }, // A2, E3, A3, C4, E4
  ],
  // Ethereal, Still, Contemplative (-0.2 <= Valence <= 0.2)
  contemplative: [
    { root: 146.83, frequencies: [146.83, 220.0, 293.66, 329.63, 440.0], name: 'D Sus2/4' }, // D3, A3, D4, E4, A4
    { root: 174.61, frequencies: [174.61, 261.63, 329.63, 392.0, 523.25], name: 'F Lydian 5th' }, // F3, C4, E4, G4, C5
    { root: 130.81, frequencies: [130.81, 196.0, 293.66, 392.0, 440.0], name: 'C Open Fifth' }, // C3, G3, D4, G4, A4
  ],
  // Luminous, Serene, Transcendent (Valence > 0.2)
  luminous: [
    { root: 174.61, frequencies: [174.61, 220.0, 261.63, 329.63, 440.0], name: 'F Major 7th' }, // F3, A3, C4, E4, A4
    { root: 130.81, frequencies: [130.81, 164.81, 196.0, 246.94, 329.63], name: 'C Major 9th' }, // C3, E3, G3, B3, E4
    { root: 196.0, frequencies: [196.0, 246.94, 293.66, 369.99, 440.0], name: 'G Lydian 9th' }, // G3, B3, D4, F#4, A4
  ],
};

class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private voices: { osc: OscillatorNode; gain: GainNode }[] = [];
  private lfo: OscillatorNode | null = null;
  private lfoGain: GainNode | null = null;
  
  private isRunning: boolean = false;
  private currentVolume: number = 0.45;
  private currentValence: number = 0.0;
  private currentArousal: number = 0.25;
  private currentChordName: string = 'Ambient Neutral';

  private initContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    return this.ctx;
  }

  public async start(): Promise<boolean> {
    try {
      const ctx = this.initContext();
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      if (this.isRunning) return true;

      // Master output with soft limiter / saturation gain
      this.masterGain = ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.001, ctx.currentTime);
      this.masterGain.gain.exponentialRampToValueAtTime(Math.max(0.001, this.currentVolume), ctx.currentTime + 2.0);

      // Low pass filter dynamically shaped by arousal
      this.filterNode = ctx.createBiquadFilter();
      this.filterNode.type = 'lowpass';
      this.filterNode.frequency.setValueAtTime(this.calculateCutoff(this.currentArousal), ctx.currentTime);
      this.filterNode.Q.setValueAtTime(1.8, ctx.currentTime);

      // LFO for organic breath-like filter modulation
      this.lfo = ctx.createOscillator();
      this.lfo.frequency.setValueAtTime(0.08, ctx.currentTime); // ~12 second breath cycle
      this.lfoGain = ctx.createGain();
      this.lfoGain.gain.setValueAtTime(120, ctx.currentTime);

      this.lfo.connect(this.lfoGain);
      this.lfoGain.connect(this.filterNode.frequency);
      this.lfo.start();

      this.filterNode.connect(this.masterGain);
      this.masterGain.connect(ctx.destination);

      // Spawn initial ambient polyphonic pad voices
      this.rebuildVoices(this.currentValence);

      this.isRunning = true;
      return true;
    } catch (err) {
      console.warn('AudioEngine start error:', err);
      return false;
    }
  }

  public stop(): void {
    if (!this.ctx || !this.isRunning) return;

    try {
      if (this.masterGain) {
        const now = this.ctx.currentTime;
        this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
        this.masterGain.gain.linearRampToValueAtTime(0.0001, now + 1.2);
        
        setTimeout(() => {
          this.teardownVoices();
          if (this.lfo) {
            try { this.lfo.stop(); } catch { /* noop */ }
            this.lfo.disconnect();
            this.lfo = null;
          }
          this.isRunning = false;
        }, 1250);
      } else {
        this.teardownVoices();
        this.isRunning = false;
      }
    } catch (e) {
      console.warn('AudioEngine stop error:', e);
      this.isRunning = false;
    }
  }

  public setVolume(vol: number): void {
    this.currentVolume = Math.max(0, Math.min(1, vol));
    if (this.ctx && this.masterGain && this.isRunning) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.linearRampToValueAtTime(this.currentVolume, now + 0.1);
    }
  }

  public updateSentiment(valence: number, arousal: number): void {
    this.currentValence = Math.max(-1.0, Math.min(1.0, valence));
    this.currentArousal = Math.max(0.0, Math.min(1.0, arousal));

    if (!this.ctx || !this.isRunning) return;

    const now = this.ctx.currentTime;

    // 1. Shift filter cutoff according to Arousal smoothly over 2 seconds
    if (this.filterNode) {
      const targetCutoff = this.calculateCutoff(this.currentArousal);
      this.filterNode.frequency.cancelScheduledValues(now);
      this.filterNode.frequency.exponentialRampToValueAtTime(Math.max(120, targetCutoff), now + 2.0);
    }

    // 2. Adjust LFO breathing rate according to arousal
    if (this.lfo) {
      const targetLfoRate = 0.05 + this.currentArousal * 0.18; // 0.05Hz to 0.23Hz
      this.lfo.frequency.cancelScheduledValues(now);
      this.lfo.frequency.linearRampToValueAtTime(targetLfoRate, now + 2.5);
    }

    // 3. Smoothly crossfade chord voicing according to Valence
    this.smoothCrossfadeChord(this.currentValence);
  }

  private calculateCutoff(arousal: number): number {
    // 220Hz (deep, submerged, intimate) to 2400Hz (bright, resonant, crisp)
    return 220 + Math.pow(arousal, 1.4) * 2180;
  }

  private pickChord(valence: number): ChordVoicing {
    if (valence < -0.2) {
      const list = CHORDS_BY_VALENCE.melancholic;
      return list[Math.floor(Math.abs(valence * 10)) % list.length];
    } else if (valence > 0.2) {
      const list = CHORDS_BY_VALENCE.luminous;
      return list[Math.floor(Math.abs(valence * 10)) % list.length];
    } else {
      const list = CHORDS_BY_VALENCE.contemplative;
      return list[0];
    }
  }

  private rebuildVoices(valence: number): void {
    if (!this.ctx || !this.filterNode) return;
    this.teardownVoices();

    const chord = this.pickChord(valence);
    this.currentChordName = chord.name;

    chord.frequencies.forEach((freq, idx) => {
      if (!this.ctx || !this.filterNode) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Soft sine waves with subtle triangle presence for warm organic sound
      osc.type = idx === 0 ? 'sine' : idx % 2 === 0 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      // Micro-detuning for lush analog shimmer
      const detuneCents = (idx - 2) * 3.5;
      osc.detune.setValueAtTime(detuneCents, this.ctx.currentTime);

      // Balanced voice amplitudes
      const targetGain = (0.28 / chord.frequencies.length) * (idx === 0 ? 1.3 : 1.0);
      gain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(targetGain, this.ctx.currentTime + 1.8);

      osc.connect(gain);
      gain.connect(this.filterNode);
      osc.start();

      this.voices.push({ osc, gain });
    });
  }

  private smoothCrossfadeChord(valence: number): void {
    if (!this.ctx || !this.filterNode) return;

    const chord = this.pickChord(valence);
    if (chord.name === this.currentChordName && this.voices.length > 0) {
      return; // Already playing this chord voicing
    }

    this.currentChordName = chord.name;
    const now = this.ctx.currentTime;

    // Gently glide existing oscillators to the new chord frequencies over 2.2 seconds
    this.voices.forEach((voice, idx) => {
      if (idx < chord.frequencies.length && this.ctx) {
        const targetFreq = chord.frequencies[idx];
        voice.osc.frequency.cancelScheduledValues(now);
        voice.osc.frequency.exponentialRampToValueAtTime(targetFreq, now + 2.2);
      }
    });

    // If chord has more notes, spawn additional voice
    if (chord.frequencies.length > this.voices.length) {
      for (let i = this.voices.length; i < chord.frequencies.length; i++) {
        const freq = chord.frequencies[i];
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(0.28 / chord.frequencies.length, now + 2.0);

        osc.connect(gain);
        gain.connect(this.filterNode);
        osc.start();

        this.voices.push({ osc, gain });
      }
    }
  }

  private teardownVoices(): void {
    this.voices.forEach(({ osc, gain }) => {
      try {
        osc.stop();
        osc.disconnect();
        gain.disconnect();
      } catch {
        /* noop */
      }
    });
    this.voices = [];
  }

  public getIsRunning(): boolean {
    return this.isRunning;
  }

  public getCurrentChordName(): string {
    return this.currentChordName;
  }

  public getSentiment(): { valence: number; arousal: number } {
    return { valence: this.currentValence, arousal: this.currentArousal };
  }
}

export const soundscapeEngine = new AudioEngine();
