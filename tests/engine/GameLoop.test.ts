import { describe, it, expect, vi } from 'vitest';
import { GameLoop } from '../../src/core/engine/GameLoop';

describe('GameLoop', () => {
  it('advances fixed steps deterministically on update', () => {
    const updateFn = vi.fn();
    const renderFn = vi.fn();
    const loop = new GameLoop(updateFn, renderFn);

    // Provide delta time corresponding to exactly 2 ticks (33.34ms)
    loop.tick((2 / 60) * 1000);

    expect(updateFn).toHaveBeenCalledTimes(2);
    expect(updateFn).toHaveBeenCalledWith(1 / 60);
    expect(renderFn).toHaveBeenCalledTimes(1);
  });

  it('clamps accumulator to prevent spiral of death on long pause', () => {
    const updateFn = vi.fn();
    const renderFn = vi.fn();
    const loop = new GameLoop(updateFn, renderFn);

    // Simulate 5000ms pause (e.g. tab switched away)
    loop.tick(5000);

    // Max steps allowed should be capped at MAX_ACCUMULATOR (0.25s) / (1/60) = 15 steps
    expect(updateFn.mock.calls.length).toBeLessThanOrEqual(16);
    expect(renderFn).toHaveBeenCalledTimes(1);
  });
});
