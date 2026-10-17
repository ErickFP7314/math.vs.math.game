import { describe, it, expect } from 'vitest';
import { SimulationEngine } from '../../src/core/engine/SimulationEngine';
import { LevelRegistry } from '../../src/core/levels/LevelRegistry';
import { EventBus } from '../../src/core/engine/EventBus';

describe('SimulationEngine', () => {
  it('starts in countdown state and transitions to combat', () => {
    const testBus = new EventBus();
    const level1 = LevelRegistry.getLevel(1)!;
    const engine = new SimulationEngine(level1, testBus);

    expect(engine.status).toBe('COUNTDOWN');
    expect(engine.countdownRemaining).toBe(3.0);

    // Advance 3 seconds
    engine.update(3.1);

    expect(engine.status).toBe('COMBAT');
  });

  it('manages Level 1 derivative breakdown on collision', () => {
    const testBus = new EventBus();
    const level1 = LevelRegistry.getLevel(1)!;
    const engine = new SimulationEngine(level1, testBus);

    // Skip countdown
    engine.update(3.1);

    // Force collision between d/dx and x^3
    engine.leftEntity.position = engine.rightEntity.position.clone();
    engine.update(1 / 60);

    // x^3 should break into 3 balls of x^2, and global HP should drop
    expect(engine.subEntities.length).toBe(3);
    expect(engine.rightEntity.hp).toBe(15);
  });

  it('enforces Level 2 exponential immunity to d/dx', () => {
    const testBus = new EventBus();
    const level2 = LevelRegistry.getLevel(2)!;
    const engine = new SimulationEngine(level2, testBus);

    // Skip countdown
    engine.update(3.1);

    const initialHp = engine.rightEntity.hp; // 80

    // Force collision
    engine.leftEntity.position = engine.rightEntity.position.clone();
    engine.update(1 / 60);

    // Exponential stays at 80/80
    expect(engine.rightEntity.hp).toBe(initialHp);
    // d/dx should be burned
    expect(engine.leftEntity.hasStatus('BURN')).toBe(true);
  });

  it('executes Level 4 partial derivative one-shot kill', () => {
    const testBus = new EventBus();
    const level4 = LevelRegistry.getLevel(4)!;
    const engine = new SimulationEngine(level4, testBus);

    // Skip countdown
    engine.update(3.1);

    // Force collision
    engine.leftEntity.position = engine.rightEntity.position.clone();
    engine.update(1 / 60);

    // e^x should be dead (80 - 80 = 0)
    expect(engine.rightEntity.isDead).toBe(true);
    expect(engine.rightEntity.hp).toBe(0);
    expect(engine.status).toBe('VICTORY');
  });
});
