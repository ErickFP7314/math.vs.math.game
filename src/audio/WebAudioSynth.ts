/**
 * WebAudioSynth - Pure procedural 8-bit sound synthesizer using native Web Audio API
 */
export class WebAudioSynth {
  private ctx: AudioContext | null = null;
  private isMuted = false;

  private initCtx(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  setMuted(muted: boolean): void {
    this.isMuted = muted;
  }

  toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  /**
   * Countdown beep for 3, 2, 1
   */
  playCountdown(count: number): void {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(count === 0 ? 880 : 440, ctx.currentTime);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  }

  /**
   * High chime for match start
   */
  playStart(): void {
    this.playCountdown(0);
  }

  private laserAudioBuffer: AudioBuffer | null = null;
  private isPreloading = false;

  async preloadAudio(): Promise<void> {
    if (this.laserAudioBuffer || this.isPreloading) return;
    this.isPreloading = true;
    try {
      const ctx = this.initCtx();
      const res = await fetch('/audio/laser_beam.mp3');
      if (res.ok) {
        const arrayBuf = await res.arrayBuffer();
        this.laserAudioBuffer = await ctx.decodeAudioData(arrayBuf);
      }
    } catch {
      // Audio fetch may fail in headless tests; procedural synth is used as fallback
    } finally {
      this.isPreloading = false;
    }
  }

  /**
   * Sharp laser/beam sound (authentic audio from 1.mp4)
   */
  playLaser(): void {
    if (this.isMuted) return;
    const ctx = this.initCtx();

    if (this.laserAudioBuffer) {
      try {
        const source = ctx.createBufferSource();
        source.buffer = this.laserAudioBuffer;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.35, ctx.currentTime);
        source.connect(gain);
        gain.connect(ctx.destination);
        source.start(0);
        return;
      } catch {
        // Fallback to synth if buffer playback encounters issue
      }
    }

    // Try HTML Audio element as immediate fallback if buffer not ready yet
    try {
      if (typeof window !== 'undefined' && typeof Audio !== 'undefined') {
        const audio = new Audio('/audio/laser_beam.mp3');
        audio.volume = 0.35;
        audio.play().catch(() => {});
        this.preloadAudio();
        return;
      }
    } catch {
      // Ignore and proceed to synth
    }

    // Procedural synthesized laser sound fallback
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(900, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.3);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  }

  /**
   * Impact bounce sound
   */
  playBounce(): void {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  }

  /**
   * Formula triggered chime
   */
  playChime(): void {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08); // A5

    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  }

  /**
   * Retro Victory Fanfare
   */
  playVictory(): void {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.12);

      gain.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.12 + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + i * 0.12);
      osc.stop(ctx.currentTime + i * 0.12 + 0.25);
    });
  }
}

export const soundManager = new WebAudioSynth();
