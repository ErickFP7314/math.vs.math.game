/**
 * GameLoop - Fixed timestep accumulator loop for deterministic simulation
 */
export class GameLoop {
  readonly fixedDt: number; // in seconds (e.g. 1 / 60)
  readonly maxAccumulator: number; // in seconds (e.g. 0.25)
  private accumulator = 0;
  private isRunning = false;
  private lastTime = 0;
  private animationFrameId: number | null = null;

  private onUpdate: (dt: number) => void;
  private onRender: (alpha: number) => void;

  constructor(
    onUpdate: (dt: number) => void,
    onRender: (alpha: number) => void,
    fps = 60,
    maxAccumulator = 0.25
  ) {
    this.onUpdate = onUpdate;
    this.onRender = onRender;
    this.fixedDt = 1 / fps;
    this.maxAccumulator = maxAccumulator;
  }

  /**
   * Manual tick method used for headless testing or manual drive
   * @param deltaMs Delta time in milliseconds
   */
  tick(deltaMs: number): void {
    let deltaSec = deltaMs / 1000;
    if (deltaSec > this.maxAccumulator) {
      deltaSec = this.maxAccumulator;
    }

    this.accumulator += deltaSec;

    while (this.accumulator >= this.fixedDt) {
      this.onUpdate(this.fixedDt);
      this.accumulator -= this.fixedDt;
    }

    const alpha = this.accumulator / this.fixedDt;
    this.onRender(alpha);
  }

  /**
   * Start loop using requestAnimationFrame (for browser client)
   */
  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();

    const loop = (currentTime: number) => {
      if (!this.isRunning) return;

      const deltaMs = currentTime - this.lastTime;
      this.lastTime = currentTime;

      this.tick(deltaMs);

      this.animationFrameId = requestAnimationFrame(loop);
    };

    this.animationFrameId = requestAnimationFrame(loop);
  }

  /**
   * Stop loop
   */
  stop(): void {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.accumulator = 0;
  }
}
