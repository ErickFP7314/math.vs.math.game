/**
 * WebAudioSynth - Hybrid audio engine using preloaded authentic MP3 buffers with procedural synth fallback
 */

function getAudioUrl(path: string): string {
  const meta = import.meta as unknown as { env?: { BASE_URL?: string } };
  const base = meta?.env?.BASE_URL || './';
  const cleanBase = base.endsWith('/') ? base : `${base}/`;
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${cleanBase}${cleanPath}`;
}

export class WebAudioSynth {
  private ctx: AudioContext | null = null;
  private isMuted = false;
  private buffers: Record<string, AudioBuffer | null> = {
    laser: null,
    enemyLaser: null,
    bounce: null,
    countdown: null,
    victory: null,
  };
  private isPreloading = false;

  constructor() {
    this.ensureContextUnlocked();
  }

  /**
   * Unlock AudioContext on first user interaction for mobile Safari / Chrome autoplay policies
   */
  private ensureContextUnlocked(): void {
    if (typeof window === 'undefined') return;
    const unlock = () => {
      this.initCtx();
      this.preloadAudio().catch(() => {});
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('touchstart', unlock);
      window.removeEventListener('click', unlock);
    };
    window.addEventListener('pointerdown', unlock, { once: true, passive: true });
    window.addEventListener('touchstart', unlock, { once: true, passive: true });
    window.addEventListener('click', unlock, { once: true, passive: true });
  }

  private initCtx(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
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
   * Preload all authentic MP3 audio buffers relative to base URL (handles GitHub Pages sub-paths)
   */
  async preloadAudio(): Promise<void> {
    if (this.isPreloading || typeof window === 'undefined') return;
    this.isPreloading = true;

    const audioFiles: Record<string, string> = {
      laser: 'audio/laser_beam.mp3',
      enemyLaser: 'audio/enemy_laser.mp3',
      bounce: 'audio/bounce.mp3',
      countdown: 'audio/countdown.mp3',
      victory: 'audio/victory.mp3',
    };

    const ctx = this.initCtx();

    await Promise.all(
      Object.entries(audioFiles).map(async ([key, filePath]) => {
        if (this.buffers[key]) return;
        try {
          const url = getAudioUrl(filePath);
          const res = await fetch(url);
          if (res.ok && ctx) {
            const arrayBuf = await res.arrayBuffer();
            this.buffers[key] = await ctx.decodeAudioData(arrayBuf);
          }
        } catch {
          // Fallback to procedural synth if fetch or decode fails
        }
      })
    );

    this.isPreloading = false;
  }

  private playBuffer(buffer: AudioBuffer | null, volume = 0.35): boolean {
    if (!buffer) return false;
    const ctx = this.initCtx();
    if (!ctx) return false;
    try {
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(volume, ctx.currentTime);
      source.connect(gain);
      gain.connect(ctx.destination);
      source.start(0);
      return true;
    } catch {
      return false;
    }
  }

  private playAudioElement(filePath: string, volume = 0.35): boolean {
    if (typeof window === 'undefined' || typeof Audio === 'undefined') return false;
    try {
      const audio = new Audio(getAudioUrl(filePath));
      audio.volume = volume;
      audio.play().catch(() => {});
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Countdown sound for 3, 2, 1
   */
  playCountdown(count: number): void {
    if (this.isMuted) return;

    if (count > 0 && this.playBuffer(this.buffers.countdown, 0.4)) {
      return;
    }

    const ctx = this.initCtx();
    if (!ctx) return;
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

  /**
   * Sharp laser/beam sound (authentic audio from 1.mp4)
   */
  playLaser(isEnemy = false): void {
    if (this.isMuted) return;

    const buffer = isEnemy ? (this.buffers.enemyLaser || this.buffers.laser) : this.buffers.laser;
    if (this.playBuffer(buffer, 0.35)) {
      return;
    }

    // Try HTML Audio element as immediate fallback if buffer not ready yet
    const file = isEnemy ? 'audio/enemy_laser.mp3' : 'audio/laser_beam.mp3';
    if (this.playAudioElement(file, 0.35)) {
      this.preloadAudio().catch(() => {});
      return;
    }

    // Procedural synthesized laser sound fallback
    const ctx = this.initCtx();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(isEnemy ? 750 : 900, ctx.currentTime);
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

    if (this.playBuffer(this.buffers.bounce, 0.25)) {
      return;
    }

    const ctx = this.initCtx();
    if (!ctx) return;
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
   * Heavy damage hit sound
   */
  playDamage(): void {
    if (this.isMuted) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(35, ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.28, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {
      // AudioContext unavailable in headless environments
    }
  }

  /**
   * Formula triggered chime
   */
  playChime(): void {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;
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

    if (this.playBuffer(this.buffers.victory, 0.45)) {
      return;
    }

    const ctx = this.initCtx();
    if (!ctx) return;
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
