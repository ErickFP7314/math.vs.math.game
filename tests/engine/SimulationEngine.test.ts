import { describe, it, expect } from 'vitest';
import { SimulationEngine } from '../../src/core/engine/SimulationEngine';
import { LevelRegistry } from '../../src/core/levels/LevelRegistry';
import { EventBus } from '../../src/core/engine/EventBus';
import { vec2 } from '../../src/core/physics/Vector2D';

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
    // CRITICAL: The match must NOT end prematurely when x^3 splits!
    expect(engine.status).toBe('COMBAT');
  });

  it('supports player directional steering impulse', () => {
    const testBus = new EventBus();
    const level1 = LevelRegistry.getLevel(1)!;
    const engine = new SimulationEngine(level1, testBus);

    engine.update(3.1); // Combat state
    const originalVel = engine.leftEntity.velocity.clone();
    
    // Apply upward impulse
    engine.applyImpulse('LEFT', originalVel.clone().normalize(), 15);
    expect(engine.leftEntity.velocity.magnitude()).toBeGreaterThan(0);
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

  it('differentiates x^2 sub-entities into 2x on subsequent collision', () => {
    const testBus = new EventBus();
    const level1 = LevelRegistry.getLevel(1)!;
    const engine = new SimulationEngine(level1, testBus);

    engine.update(3.1);

    // Initial collision: x^3 -> 3 x^2
    engine.leftEntity.position = engine.rightEntity.position.clone();
    engine.update(1 / 60);

    expect(engine.subEntities.length).toBe(3);
    const x2Ball = engine.subEntities[0];
    expect(x2Ball.symbol).toBe('x²');

    // Move other sub-entities away to avoid multiple overlaps in single tick
    engine.subEntities[1].position = vec2(40, 40);
    engine.subEntities[2].position = vec2(-40, -40);

    // Second collision: d/dx with single x^2 sub-entity
    x2Ball.position = vec2(0, 0);
    engine.leftEntity.position = vec2(0, 0);
    engine.update(1 / 60);

    // One x^2 was differentiated into two x balls, net count: (3 - 1) + 2 = 4
    expect(engine.subEntities.length).toBe(4);
    expect(engine.rightEntity.hp).toBe(14);
  });

  it('activates player d/dx Tangent Slash skill', () => {
    const testBus = new EventBus();
    const level1 = LevelRegistry.getLevel(1)!;
    const engine = new SimulationEngine(level1, testBus);

    engine.update(3.1);

    expect(engine.activeLasers.length).toBe(0);
    const triggered = engine.triggerSkill('LEFT');
    expect(triggered).toBe(true);
    expect(engine.activeLasers.length).toBeGreaterThan(0);
    expect(engine.leftEntity.isReady()).toBe(false);
  });

  it('deals contact collision damage to enemies in standard matches', () => {
    const testBus = new EventBus();
    const level5 = LevelRegistry.getLevel(5)!;
    const engine = new SimulationEngine(level5, testBus);

    engine.update(3.1);
    const initialEnemyHp = engine.rightEntity.hp;

    // Collide player into enemy
    engine.leftEntity.position = engine.rightEntity.position.clone();
    engine.update(1 / 60);

    expect(engine.rightEntity.hp).toBeLessThan(initialEnemyHp);
  });
});
