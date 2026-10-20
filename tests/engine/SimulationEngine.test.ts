import { describe, it, expect } from 'vitest';
import { SimulationEngine } from '../../src/core/engine/SimulationEngine';
import { LevelRegistry } from '../../src/core/levels/LevelRegistry';
import { EventBus } from '../../src/core/engine/EventBus';
import { vec2 } from '../../src/core/physics/Vector2D';
import { BaseEntity } from '../../src/core/entities/BaseEntity';

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
    // Player (derivative) must NOT take contact damage in Level 1
    expect(engine.leftEntity.hp).toBe(100);
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

  it('differentiates x^2 sub-entities into 2x on subsequent collision after 3s invulnerability', () => {
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
    expect(x2Ball.isInvulnerable()).toBe(true);

    // Move other sub-entities away to avoid multiple overlaps in single tick
    engine.subEntities[1].position = vec2(40, 40);
    engine.subEntities[2].position = vec2(-40, -40);

    // While invulnerable during the first 3 seconds, collision does NOT damage/differentiate it
    x2Ball.position = vec2(0, 0);
    engine.leftEntity.position = vec2(0, 0);
    engine.update(1 / 60);
    expect(engine.subEntities.length).toBe(3); // Still 3, immune!

    // Advance 3.1 seconds so spawn invulnerability timer expires
    engine.update(3.1);
    expect(x2Ball.isInvulnerable()).toBe(false);

    // Now collision differentiates single x^2 into two x balls
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
    // Keep entities separated while waiting for enemy attack to avoid random collision
    engine.leftEntity.position = vec2(-40, 0);
    engine.leftEntity.velocity = vec2(0, 0);
    engine.rightEntity.position = vec2(40, 0);
    engine.rightEntity.velocity = vec2(0, 0);
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

  it('emits simplified math result texts in Level 1 (3x^2, 2x, 1, 0) instead of full equation', () => {
    const testBus = new EventBus();
    const emittedFormulas: string[] = [];
    testBus.on('MATH_FORMULA', (payload) => {
      emittedFormulas.push(payload.latex);
    });

    const level1 = LevelRegistry.getLevel(1)!;
    const engine = new SimulationEngine(level1, testBus);

    engine.update(3.1);

    // Strike x^3 -> should emit '3x^2'
    engine.leftEntity.position = engine.rightEntity.position.clone();
    engine.update(1 / 60);
    expect(emittedFormulas).toContain('3x^2');
    expect(emittedFormulas.some((f) => f.includes('\\frac{d}{dx}'))).toBe(false);

    // Advance 3.1s so x^2 becomes vulnerable
    engine.update(3.1);

    // Isolate one x^2 and collide
    const x2 = engine.subEntities[0];
    x2.position = vec2(0, 0);
    engine.leftEntity.position = vec2(0, 0);
    engine.subEntities[1].position = vec2(40, 40);
    engine.subEntities[2].position = vec2(-40, -40);
    engine.update(1 / 60);

    // Should emit '2x'
    expect(emittedFormulas).toContain('2x');

    // Advance 3.1s so x becomes vulnerable
    engine.update(3.1);

    // Isolate an 'x' sub-entity and collide -> turns into 1
    const xEntity = engine.subEntities.find((e) => e.symbol === 'x')!;
    xEntity.position = vec2(0, 0);
    engine.leftEntity.position = vec2(0, 0);
    engine.update(1 / 60);

    // Should emit '1'
    expect(emittedFormulas).toContain('1');

    // Advance 3.1s so '1' becomes vulnerable
    engine.update(3.1);

    // Collide with '1' -> turns into 0
    const oneEntity = engine.subEntities.find((e) => e.symbol === '1')!;
    oneEntity.position = vec2(0, 0);
    engine.leftEntity.position = vec2(0, 0);
    engine.update(1 / 60);

    // Should emit '0'
    expect(emittedFormulas).toContain('0');
  });

  it('selectively interrupts only the laser of the collided enemy sphere while others keep firing', () => {
    const level1 = LevelRegistry.getLevel(1)!;
    const engine = new SimulationEngine(level1);

    engine.update(3.1);

    // Spawn 2 sub-entities manually
    engine.rightEntity.isDead = true;
    const subA = new BaseEntity({
      id: 'sub_A',
      name: 'x²',
      symbol: 'x²',
      team: 'SUB_ENTITY',
      color: '#FB8C00',
      bgColor: '#FFE0B2',
      hp: 1,
      maxHp: 1,
      radius: 6,
      mass: 1.0,
      position: vec2(10, 0),
      velocity: vec2(0, 0),
    });
    const subB = new BaseEntity({
      id: 'sub_B',
      name: 'x²',
      symbol: 'x²',
      team: 'SUB_ENTITY',
      color: '#FB8C00',
      bgColor: '#FFE0B2',
      hp: 1,
      maxHp: 1,
      radius: 6,
      mass: 1.0,
      position: vec2(-10, 0),
      velocity: vec2(0, 0),
    });
    subA.invulnerabilityTimer = 0;
    subB.invulnerabilityTimer = 0;
    engine.subEntities = [subA, subB];

    // Trigger enemy attack (Polynomial Barrage) -> both subA and subB add lasers
    engine.enemyShootTimer = 0;
    engine.update(0.016);

    expect(engine.activeLasers.length).toBe(2);
    expect(engine.frozenOwnerIds.has('sub_A')).toBe(true);
    expect(engine.frozenOwnerIds.has('sub_B')).toBe(true);

    // Player collides ONLY with subA
    engine.leftEntity.position = subA.position.clone();
    engine.update(0.016);

    // subA's laser should be interrupted and removed
    expect(engine.activeLasers.some((l) => l.ownerId === 'sub_A')).toBe(false);
    expect(engine.frozenOwnerIds.has('sub_A')).toBe(false);

    // subB's laser MUST still be active and subB remains frozen!
    expect(engine.activeLasers.some((l) => l.ownerId === 'sub_B')).toBe(true);
    expect(engine.frozenOwnerIds.has('sub_B')).toBe(true);
  });

  it('ensures player takes zero contact damage in Level 1 against polynomial spheres while taking laser damage', () => {
    const testBus = new EventBus();
    const level1 = LevelRegistry.getLevel(1)!;
    const engine = new SimulationEngine(level1, testBus);

    engine.update(3.1); // enter combat

    const initialHp = engine.leftEntity.hp; // 100

    // Collision with x^3
    engine.leftEntity.position = engine.rightEntity.position.clone();
    engine.update(1 / 60);

    // Player HP must stay exactly at initialHp (no contact damage)
    expect(engine.leftEntity.hp).toBe(initialHp);

    // Now simulate laser damage to player
    engine.leftEntity.takeDamage(18);
    expect(engine.leftEntity.hp).toBe(initialHp - 18);
  });

  it('stops AI decision loop and sphere kinematics when status is PAUSED', () => {
    const level1 = LevelRegistry.getLevel(1)!;
    const engine = new SimulationEngine(level1);

    engine.update(3.1);
    expect(engine.status).toBe('COMBAT');

    // Pause simulation (as done when victory/defeat modal is displayed)
    engine.status = 'PAUSED';
    const initialTimer = engine.enemyShootTimer;
    const initialPlayerPos = engine.leftEntity.position.clone();

    engine.update(1.0);

    // Position and AI timer should remain unchanged because updateCombat is not executed
    expect(engine.enemyShootTimer).toBe(initialTimer);
    expect(engine.leftEntity.position.x).toBe(initialPlayerPos.x);
    expect(engine.leftEntity.position.y).toBe(initialPlayerPos.y);
  });

  it('cycles Level 5 trig function on collision with d/dx with zero player contact damage', () => {
    const testBus = new EventBus();
    const level5 = LevelRegistry.getLevel(5)!;
    const engine = new SimulationEngine(level5, testBus);

    engine.update(3.1); // enter combat

    expect(engine.leftEntity.symbol).toBe('d/dx');
    expect(engine.rightEntity.symbol).toBe('sin x');
    const initialPlayerHp = engine.leftEntity.hp;

    // Hit 1: d/dx(sin x) = cos x
    engine.leftEntity.position = engine.rightEntity.position.clone();
    engine.update(1 / 60);
    expect(engine.rightEntity.symbol).toBe('cos x');
    expect(engine.leftEntity.hp).toBe(initialPlayerHp); // Zero contact damage!
    expect(engine.rightEntity.hp).toBe(86); // 100 - 14

    // Hit 2: d/dx(cos x) = -sin x
    engine.leftEntity.position = engine.rightEntity.position.clone();
    engine.update(1 / 60);
    expect(engine.rightEntity.symbol).toBe('-sin x');
    expect(engine.leftEntity.hp).toBe(initialPlayerHp);

    // Hit 3: d/dx(-sin x) = -cos x
    engine.leftEntity.position = engine.rightEntity.position.clone();
    engine.update(1 / 60);
    expect(engine.rightEntity.symbol).toBe('-cos x');

    // Hit 4: d/dx(-cos x) = sin x
    engine.leftEntity.position = engine.rightEntity.position.clone();
    engine.update(1 / 60);
    expect(engine.rightEntity.symbol).toBe('sin x');
    expect(engine.derivativeHitCount).toBe(4);
  });

  it('handles Level 6 constant creation and polynomial degree upgrading upon collision with ∫', () => {
    const testBus = new EventBus();
    const level6 = LevelRegistry.getLevel(6)!;
    const engine = new SimulationEngine(level6, testBus);

    engine.update(3.1); // enter combat

    expect(engine.leftEntity.symbol).toBe('∫');
    expect(engine.rightEntity.symbol).toBe('eˣ');

    // Hit 1: ∫ vs e^x -> spawns C1 and damages e^x
    engine.leftEntity.position = engine.rightEntity.position.clone();
    engine.update(1 / 60);

    expect(engine.rightEntity.hp).toBe(70); // 80 - 10
    expect(engine.subEntities.length).toBe(1);
    const c1 = engine.subEntities[0];
    expect(c1.polyDegree).toBe(0);

    // Move e^x away to collide specifically with c1
    engine.rightEntity.position = vec2(40, 40);

    // Hit 2: ∫ vs C1 -> upgrades to C1 x and spawns C2
    c1.position = vec2(0, 0);
    engine.leftEntity.position = vec2(0, 0);
    engine.update(1 / 60);

    expect(c1.polyDegree).toBe(1);
    expect(c1.symbol).toBe('C_{1}x');
    expect(engine.subEntities.length).toBe(2);

    // Hit 3: ∫ vs C1x -> upgrades to C1/2 x^2 and spawns C3
    engine.subEntities[1].position = vec2(-40, -40);
    c1.position = vec2(0, 0);
    engine.leftEntity.position = vec2(0, 0);
    engine.update(1 / 60);

    expect(c1.polyDegree).toBe(2);
    expect(c1.symbol).toContain('x^2');
    expect(engine.subEntities.length).toBe(3);
  });
});
