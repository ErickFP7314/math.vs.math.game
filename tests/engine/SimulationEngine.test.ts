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

  it('triggers automated enemy attack every 3 seconds and freezes spheres during laser', () => {
    const testBus = new EventBus();
    let laserFiredEventReceived = false;
    testBus.on('LASER_FIRED', () => {
      laserFiredEventReceived = true;
    });

    const level1 = LevelRegistry.getLevel(1)!;
    const engine = new SimulationEngine(level1, testBus);

    // Skip countdown
    engine.update(3.1);
    expect(engine.status).toBe('COMBAT');
    expect(engine.isFrozen).toBe(false);

    // Advance 3.0 seconds into combat
    engine.update(3.0);

    // Laser was created by enemy auto-attack
    expect(engine.activeLasers.length).toBeGreaterThan(0);
    // Spheres must freeze while laser is in progress!
    expect(engine.isFrozen).toBe(true);

    const initialEnemyPos = engine.rightEntity.position.clone();
    const initialPlayerPos = engine.leftEntity.position.clone();
    // Advance slightly while frozen - enemy should NOT move, but player continues moving freely
    engine.update(0.1);
    expect(engine.rightEntity.position.x).toBe(initialEnemyPos.x);
    expect(engine.rightEntity.position.y).toBe(initialEnemyPos.y);
    expect(engine.leftEntity.position.x).not.toBe(initialPlayerPos.x);

    // Advance through telegraph (0.8s) so beam activates
    engine.update(0.8);
    expect(laserFiredEventReceived).toBe(true);

    // Advance past laser remaining duration (1.2s)
    engine.update(1.5);
    // Once laser finishes, spheres must unfreeze
    expect(engine.isFrozen).toBe(false);
  });

  it('interrupts active enemy laser when player collides with enemy sphere (Requirement 0.3)', () => {
    const level1 = LevelRegistry.getLevel(1)!;
    const engine = new SimulationEngine(level1);

    // Enter combat and advance until enemy attacks
    engine.update(3.1);
    engine.update(3.0);
    expect(engine.activeLasers.length).toBeGreaterThan(0);
    expect(engine.isFrozen).toBe(true);

    // Player strikes enemy sphere
    engine.leftEntity.position = engine.rightEntity.position.clone().add(vec2(1, 0));
    engine.update(0.016); // Trigger collision check

    // Active enemy laser should be destroyed and enemy unfrozen!
    expect(engine.activeLasers.length).toBe(0);
    expect(engine.isFrozen).toBe(false);
  });

  it('launches split enemy polynomial spheres in directions away from the player (Requirement 0.2)', () => {
    const level1 = LevelRegistry.getLevel(1)!;
    const engine = new SimulationEngine(level1);

    engine.update(3.1); // Enter combat

    // Position player to the left of the enemy x^3
    engine.leftEntity.position = vec2(-10, 0);
    engine.rightEntity.position = vec2(0, 0);

    // Collide player with enemy x^3
    engine.leftEntity.position = vec2(-2, 0);
    engine.update(0.016);

    // x^3 splits into 3 spheres of x^2
    expect(engine.subEntities.length).toBe(3);
    for (const sub of engine.subEntities) {
      // Since player was at x=-2 and enemy was at x=0, all spawned spheres should fly to the right (velocity.x > 0)
      expect(sub.velocity.x).toBeGreaterThan(0);
    }
  });

  it('emits DAMAGE_DEALT with position and laser damage amount when beam hits player (Requirement 0.4)', () => {
    const testBus = new EventBus();
    let damagePayload: any = null;
    testBus.on('DAMAGE_DEALT', (payload) => {
      damagePayload = payload;
    });

    const level1 = LevelRegistry.getLevel(1)!;
    const engine = new SimulationEngine(level1, testBus);

    engine.update(3.1);

    // Manually add an active horizontal laser hitting player
    engine.leftEntity.position = vec2(0, 0);
    engine.leftEntity.radius = 8;
    engine.activeLasers.push({
      id: 'test_laser_18',
      ownerId: engine.rightEntity.id,
      sourcePos: vec2(0, 0),
      curveType: 'HORIZONTAL',
      isTelegraph: false,
      telegraphTime: 0,
      durationRemaining: 1.0,
      damage: 18,
    });

    engine.update(0.016);

    expect(damagePayload).not.toBeNull();
    expect(damagePayload.targetId).toBe(engine.leftEntity.id);
    expect(damagePayload.amount).toBe(18);
    expect(damagePayload.position).toBeDefined();
  });
});
