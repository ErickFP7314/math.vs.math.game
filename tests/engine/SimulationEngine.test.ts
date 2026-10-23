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
    expect(engine.rightEntity.isDead).toBe(true);
    // Player (derivative) must NOT take contact damage in Level 1
    expect(engine.leftEntity.hp).toBe(100);
    // CRITICAL: The match must NOT end prematurely when x^3 splits!
    expect(engine.status).toBe('COMBAT');
  });

  it('cancels active lasers and cleans up dead entities when differentiated or killed', () => {
    const testBus = new EventBus();
    const level1 = LevelRegistry.getLevel(1)!;
    const engine = new SimulationEngine(level1, testBus);

    engine.update(3.1);

    // Give rightEntity an active laser
    engine.activeLasers.push({
      id: 'test_enemy_laser',
      ownerId: engine.rightEntity.id,
      sourcePos: engine.rightEntity.position.clone(),
      curveType: 'CUBIC',
      isTelegraph: false,
      telegraphTime: 0,
      durationRemaining: 1.0,
      damage: 23,
    });
    expect(engine.activeLasers.length).toBe(1);

    // Force collision with d/dx: x^3 is differentiated, dies, and its laser is cancelled immediately
    engine.leftEntity.position = engine.rightEntity.position.clone();
    engine.update(1 / 60);

    expect(engine.rightEntity.isDead).toBe(true);
    // Active laser from dead x^3 must be cancelled, not remain as a ghost laser
    expect(engine.activeLasers.some((l) => l.ownerId === engine.rightEntity.id)).toBe(false);
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
    const level7 = LevelRegistry.getLevel(7)!;
    const engine = new SimulationEngine(level7, testBus);

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
    // Keep player safely away so random kinematics do not trigger a collision during this freeze check
    engine.leftEntity.position = vec2(-30, -30);
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
    expect(engine.rightEntity.hp).toBe(100); // 0 damage to enemy per Level 5 rules!

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

    // Wait until whip is ready (1s initial cooldown)
    engine.update(1.0);
    expect(engine.leftEntity.isReady()).toBe(true);

    // Hit 1: ∫ vs e^x -> spawns C1 and whip damages e^x (-12 HP: -7 and -5)
    engine.leftEntity.position = engine.rightEntity.position.clone();
    engine.update(1 / 60);

    expect(engine.rightEntity.hp).toBe(68); // 80 - 12
    expect(engine.subEntities.length).toBe(1);
    const c1 = engine.subEntities[0];
    expect(c1.polyDegree).toBe(0);

    // Move e^x away to collide specifically with c1
    engine.rightEntity.position = vec2(40, 40);

    // Hit 2: ∫ vs C1 -> upgrades to C1 x, spawns C2 and fires linear beam
    c1.position = vec2(0, 0);
    c1.invulnerabilityTimer = 0;
    engine.leftEntity.position = vec2(0, 0);
    engine.update(1 / 60);

    expect(c1.polyDegree).toBe(1);
    expect(c1.symbol).toBe('C_1 x');
    expect(engine.subEntities.length).toBe(2);

    // Hit 3: ∫ vs C1x -> upgrades to C1/2 x^2 and spawns C3
    engine.subEntities[1].position = vec2(-40, -40);
    c1.position = vec2(0, 0);
    c1.invulnerabilityTimer = 0;
    engine.leftEntity.position = vec2(0, 0);
    engine.update(1 / 60);

    expect(c1.polyDegree).toBe(2);
    expect(c1.symbol).toBe('\\frac{C_1}{2}x^2');
    expect(engine.subEntities.length).toBe(3);
  });

  describe('Level 3 (reglas2/nivel3.md) Specifications', () => {
    it('initializes Level 3 with e^x (80 HP, 1s initial cooldown) vs i (50 HP, State [i])', () => {
      const level3 = LevelRegistry.getLevel(3)!;
      const engine = new SimulationEngine(level3);

      expect(engine.leftEntity.symbol).toBe('eˣ');
      expect(engine.leftEntity.hp).toBe(80);
      expect(engine.leftEntity.maxHp).toBe(80);
      expect(engine.rightEntity.symbol).toBe('i');
      expect(engine.rightEntity.hp).toBe(50);
      expect(engine.rightEntity.maxHp).toBe(50);

      // Finish countdown
      engine.update(3.1);
      expect(engine.status).toBe('COMBAT');
      expect(engine.leftEntity.cooldownRemaining).toBeCloseTo(1.0, 1);
      expect(engine.rightEntity.currentPhaseIndex).toBe(0);
    });

    it('triggers Exponential Blade on player cooldown (1s initial, 3s loop)', () => {
      const level3 = LevelRegistry.getLevel(3)!;
      const engine = new SimulationEngine(level3);

      engine.update(3.1); // Combat starts, cooldown is 1.0s
      expect(engine.activeLasers.length).toBe(0);

      // Advance 1s -> Exponential blade telegraph activates
      engine.update(1.05);
      expect(engine.activeLasers.length).toBe(1);
      const blade = engine.activeLasers[0];
      expect(blade.curveType).toBe('EXPONENTIAL');
      expect(blade.isTelegraph).toBe(true);
      expect(engine.leftEntity.cooldownRemaining).toBeCloseTo(3.0, 1);

      // During telegraph, moving player updates laser sourcePos in real-time
      engine.leftEntity.position = vec2(-15, 8);
      engine.leftEntity.velocity = vec2(0, 0);
      engine.update(0.1);
      expect(blade.sourcePos.x).toBeCloseTo(-15, 1);
      expect(blade.sourcePos.y).toBeCloseTo(8, 1);

      // At end of telegraph (1s), laser becomes active
      engine.update(0.95);
      expect(blade.isTelegraph).toBe(false);
    });

    it('handles State 1 [i]: intangible, no bounce, deals -8 HP on overlap, vulnerable to blade and burn', () => {
      const testBus = new EventBus();
      const level3 = LevelRegistry.getLevel(3)!;
      const engine = new SimulationEngine(level3, testBus);

      engine.update(3.1); // Combat, State 0 ([i])
      expect(engine.rightEntity.currentPhaseIndex).toBe(0);

      const playerVelBefore = engine.leftEntity.velocity.clone();
      const enemyVelBefore = engine.rightEntity.velocity.clone();

      // Overlap player and enemy
      engine.leftEntity.position = vec2(0, 0);
      engine.rightEntity.position = vec2(0, 0);
      engine.update(1 / 60);

      // Intangible: NO elastic bounce, velocities NOT reversed/deflected
      expect(engine.leftEntity.velocity.x).toBe(playerVelBefore.x);
      expect(engine.leftEntity.velocity.y).toBe(playerVelBefore.y);
      expect(engine.rightEntity.velocity.x).toBe(enemyVelBefore.x);
      expect(engine.rightEntity.velocity.y).toBe(enemyVelBefore.y);

      // Deals -8 HP to player on contact
      expect(engine.leftEntity.hp).toBe(72); // 80 - 8
      expect(engine.rightEntity.hp).toBe(50); // Enemy receives 0 contact damage
    });

    it('handles State 2 [-1]: solid bounce (0 contact damage), reflects 100% of blade damage, inverts burn ticks', () => {
      const testBus = new EventBus();
      const level3 = LevelRegistry.getLevel(3)!;
      const engine = new SimulationEngine(level3, testBus);

      engine.update(3.1); // Combat
      engine.update(3.0); // Advance 3s -> State 1 ([-1])
      expect(engine.rightEntity.currentPhaseIndex).toBe(1);

      // Overlap player and enemy
      engine.leftEntity.position = vec2(-5, 0);
      engine.leftEntity.velocity = vec2(20, 0);
      engine.rightEntity.position = vec2(5, 0);
      engine.rightEntity.velocity = vec2(-20, 0);
      const playerHpBefore = engine.leftEntity.hp;
      const enemyHpBefore = engine.rightEntity.hp;

      engine.update(1 / 60);

      // Solid bounce: velocities deflected
      expect(engine.leftEntity.velocity.x).toBeLessThan(0);
      expect(engine.rightEntity.velocity.x).toBeGreaterThan(0);
      // 0 contact damage to both!
      expect(engine.leftEntity.hp).toBe(playerHpBefore);
      expect(engine.rightEntity.hp).toBe(enemyHpBefore);

      // Now test blade reflection in State [-1]:
      // Fire an active EXPONENTIAL laser touching enemy at x = 0 (scaled damage ~12)
      // At x = 0, y = 0 + exp(20 * 0.15) ≈ 20.08, so enemy at (0, 20) touches the beam
      engine.rightEntity.position = vec2(0, 20);
      engine.rightEntity.velocity = vec2(0, 0);
      engine.leftEntity.position = vec2(-20, 0);
      engine.leftEntity.velocity = vec2(0, 0);
      const initialPlayerHp = engine.leftEntity.hp;
      engine.activeLasers = [
        {
          id: 'test_exp_blade',
          ownerId: engine.leftEntity.id,
          sourcePos: vec2(-20, 0),
          curveType: 'EXPONENTIAL',
          isTelegraph: false,
          telegraphTime: 0,
          durationRemaining: 0.5,
          damage: 21,
        },
      ];

      engine.update(0.016);

      // Enemy takes 0 damage!
      expect(engine.rightEntity.hp).toBe(enemyHpBefore);
      // Player takes 100% reflected damage!
      expect(engine.leftEntity.hp).toBeLessThan(initialPlayerHp);

      // Test Quemadura inversion in State [-1]:
      engine.rightEntity.hp = 30;
      engine.rightEntity.addStatus({
        type: 'BURN',
        durationRemaining: 2.0,
        tickInterval: 0.5,
        tickDamage: 2,
      });

      const playerHpPreBurn = engine.leftEntity.hp;
      engine.update(0.55);

      // Enemy HEALS +2 HP!
      expect(engine.rightEntity.hp).toBe(32);
      // Player takes -2 HP reflected damage!
      expect(engine.leftEntity.hp).toBe(playerHpPreBurn - 2);
    });

    it('handles State 3 [-i]: intangible (-8 HP contact), reflects blade and inverts burn', () => {
      const level3 = LevelRegistry.getLevel(3)!;
      const engine = new SimulationEngine(level3);

      engine.update(3.1); // Combat
      engine.update(6.0); // Advance 6s -> State 2 ([-i])
      expect(engine.rightEntity.currentPhaseIndex).toBe(2);

      // Contact deals -8 HP and does not bounce
      engine.leftEntity.position = vec2(0, 0);
      engine.rightEntity.position = vec2(0, 0);
      const hpBefore = engine.leftEntity.hp;
      engine.update(1 / 60);
      expect(engine.leftEntity.hp).toBe(hpBefore - 8);

      // Reflects burn
      engine.rightEntity.hp = 20;
      engine.rightEntity.addStatus({
        type: 'BURN',
        durationRemaining: 2.0,
        tickInterval: 0.5,
        tickDamage: 2,
      });
      const pPreBurn = engine.leftEntity.hp;
      engine.update(0.55);
      expect(engine.rightEntity.hp).toBe(22);
      expect(engine.leftEntity.hp).toBe(pPreBurn - 2);
    });

    it('handles State 4 [1]: solid bounce (0 contact damage) and normal vulnerability', () => {
      const level3 = LevelRegistry.getLevel(3)!;
      const engine = new SimulationEngine(level3);

      engine.update(3.1); // Combat
      engine.update(9.0); // Advance 9s -> State 3 ([1])
      expect(engine.rightEntity.currentPhaseIndex).toBe(3);

      // Burn ticks normally: enemy takes damage, player takes no damage
      engine.rightEntity.hp = 40;
      engine.rightEntity.addStatus({
        type: 'BURN',
        durationRemaining: 2.0,
        tickInterval: 0.5,
        tickDamage: 2,
      });
      const playerHp = engine.leftEntity.hp;
      engine.update(0.55);

      expect(engine.rightEntity.hp).toBe(38); // 40 - 2
      expect(engine.leftEntity.hp).toBe(playerHp); // untouched
    });
  });

  describe('Level 4 (reglas2/nivel4.md) Specifications', () => {
    it('initializes Level 4 with ∂/∂y (100 HP, 0 cooldown) vs e^x (80 HP, 1s initial cooldown)', () => {
      const level4 = LevelRegistry.getLevel(4)!;
      const engine = new SimulationEngine(level4);

      expect(engine.leftEntity.symbol).toBe('∂/∂y');
      expect(engine.leftEntity.hp).toBe(100);
      expect(engine.leftEntity.maxHp).toBe(100);
      expect(engine.leftEntity.cooldownRemaining).toBe(0);

      expect(engine.rightEntity.symbol).toBe('eˣ');
      expect(engine.rightEntity.hp).toBe(80);
      expect(engine.rightEntity.maxHp).toBe(80);
      expect(engine.rightEntity.cooldownRemaining).toBe(1.0);

      // Skip countdown to combat
      engine.update(3.1);
      expect(engine.status).toBe('COMBAT');
      expect(engine.leftEntity.cooldownRemaining).toBe(0);
      expect(engine.rightEntity.cooldownRemaining).toBe(1.0);
    });

    it('Test 1: One-Shot kill on physical body collision (∂/∂y e^x = 0, -80 HP instant death)', () => {
      const testBus = new EventBus();
      let formulaReceived = '';
      let damageDealtToEnemy = 0;
      testBus.on('MATH_FORMULA', (payload: any) => {
        formulaReceived = payload.latex;
      });
      testBus.on('DAMAGE_DEALT', (payload: any) => {
        if (payload.targetId === 'exp') {
          damageDealtToEnemy = payload.amount;
        }
      });

      const level4 = LevelRegistry.getLevel(4)!;
      const engine = new SimulationEngine(level4, testBus);

      // Skip countdown into combat at 00:03
      engine.update(3.1);

      // Aim ∂/∂y straight at e^x
      engine.leftEntity.position = vec2(0, 0);
      engine.leftEntity.velocity = vec2(10, 0);
      engine.rightEntity.position = vec2(12, 0); // distance 12 <= R1 (6.5) + R2 (6.5) = 13.0
      engine.rightEntity.velocity = vec2(-10, 0);

      const playerHpBefore = engine.leftEntity.hp;

      // In the exact frame where distance <= R1 + R2:
      engine.update(1 / 60);

      // e^x drops from 80 to 0 instantly (-80 HP)
      expect(engine.rightEntity.hp).toBe(0);
      expect(engine.rightEntity.isDead).toBe(true);
      expect(damageDealtToEnemy).toBe(80);
      expect(formulaReceived).toContain('\\frac{\\partial}{\\partial y}');

      // Player receives 0 recoil/contact damage
      expect(engine.leftEntity.hp).toBe(playerHpBefore);

      // Match ends in VICTORY
      expect(engine.status).toBe('VICTORY');
    });

    it('Test 2: Harmless intangibility during 1s telegraph phase', () => {
      const level4 = LevelRegistry.getLevel(4)!;
      const engine = new SimulationEngine(level4);

      engine.update(3.1); // Combat starts, enemy cooldown is 1.0s
      // Keep entities apart so random directions from countdown do not trigger premature collision
      engine.leftEntity.position = vec2(-30, -30);
      engine.leftEntity.velocity = vec2(0, 0);
      engine.rightEntity.position = vec2(30, 30);
      engine.rightEntity.velocity = vec2(0, 0);

      expect(engine.activeLasers.length).toBe(0);

      // Advance 1s -> e^x triggers 1.0s telegraph of Exponential Blade
      engine.update(1.05);
      expect(engine.activeLasers.length).toBe(1);
      const blade = engine.activeLasers[0];
      expect(blade.isTelegraph).toBe(true);

      // Player passes through the curve at 0.5s of telegraphing
      // Place player on the curve safely away from enemy ball
      engine.leftEntity.position = vec2(blade.sourcePos.x - 10, blade.sourcePos.y);
      engine.leftEntity.velocity = vec2(0, 0);
      engine.rightEntity.velocity = vec2(0, 0);
      engine.update(0.5);

      // Player must keep 100/100 HP and have NO burn status while curve is telegraphing
      expect(engine.leftEntity.hp).toBe(100);
      expect(engine.leftEntity.hasStatus('BURN')).toBe(false);

      // Move player far away before 1.0s firing moment
      engine.leftEntity.position = vec2(-45, -45);
      engine.leftEntity.velocity = vec2(0, 0);
      engine.update(0.6); // Telegraph ends, blade fires in empty air

      expect(engine.leftEntity.hp).toBe(100);
      expect(engine.leftEntity.hasStatus('BURN')).toBe(false);
    });

    it('Test 3: Exact mathematical damage of blade cut (4 HP) + 5 ticks of Burn DoT (5x -2 HP = -14 HP total, 100 -> 86 HP)', () => {
      const level4 = LevelRegistry.getLevel(4)!;
      const engine = new SimulationEngine(level4);

      engine.update(3.1); // Combat

      // Position enemy safely away at (35, 35) and player at (-20, 0)
      // The exponential laser has sourcePos at (0, 0).
      // At x = -20: y = 0 + exp((-20 - 0) * 0.15) = exp(-3) ≈ 0.05.
      // So player at (-20, 0) touches the flat section of the curve!
      // And player and enemy are ~65 units apart so they never physically collide!
      engine.rightEntity.position = vec2(35, 35);
      engine.rightEntity.velocity = vec2(0, 0);
      engine.leftEntity.position = vec2(-20, 0);
      engine.leftEntity.velocity = vec2(0, 0);

      // Trigger blade directly at end of telegraph
      engine.activeLasers = [
        {
          id: 'blade_shot',
          ownerId: engine.rightEntity.id,
          sourcePos: vec2(0, 0),
          curveType: 'EXPONENTIAL',
          isTelegraph: false,
          telegraphTime: 0,
          durationRemaining: 0.5,
          damage: 4,
        },
      ];

      // Instant impact frame
      engine.update(0.016);

      // In the impact frame: 100 - 4 (impact) - 2 (1st instant burn tick) = 94 HP
      expect(engine.leftEntity.hp).toBe(94);
      expect(engine.leftEntity.hasStatus('BURN')).toBe(true);

      // Keep them separated during burn ticks
      engine.rightEntity.position = vec2(35, 35);
      engine.rightEntity.velocity = vec2(0, 0);
      engine.leftEntity.position = vec2(-35, -35);
      engine.leftEntity.velocity = vec2(0, 0);

      // Tick 1 after 0.75s: 94 - 2 = 92 HP
      engine.update(0.75);
      expect(engine.leftEntity.hp).toBe(92);

      // Tick 2 after 0.75s: 92 - 2 = 90 HP
      engine.update(0.75);
      expect(engine.leftEntity.hp).toBe(90);

      // Tick 3 after 0.75s: 90 - 2 = 88 HP
      engine.update(0.75);
      expect(engine.leftEntity.hp).toBe(88);

      // Tick 4 after 0.85s: 88 - 2 = 86 HP (burn finishes and expires)
      engine.update(0.85);
      expect(engine.leftEntity.hp).toBe(86);
      expect(engine.leftEntity.hasStatus('BURN')).toBe(false);

      // Total damage is exactly 14 HP (100 - 14 = 86 HP)
      expect(engine.leftEntity.hp).toBe(86);
    });

    it('Test 4: Absence of cooldowns and projectiles for the Player across 30 seconds', () => {
      const level4 = LevelRegistry.getLevel(4)!;
      const engine = new SimulationEngine(level4);

      engine.update(3.1); // Combat

      // Keep balls apart so they don't collide
      engine.leftEntity.position = vec2(-40, -40);
      engine.leftEntity.velocity = vec2(0, 0);
      engine.rightEntity.position = vec2(40, 40);
      engine.rightEntity.velocity = vec2(0, 0);

      // Player attempts to trigger skill
      const skillTriggered = engine.triggerSkill('LEFT');
      expect(skillTriggered).toBe(false);

      // Run for 30 seconds
      for (let s = 0; s < 30; s++) {
        engine.update(1.0);
        // Player cooldown remains 0
        expect(engine.leftEntity.cooldownRemaining).toBe(0);
        expect(engine.leftEntity.cooldownMax).toBe(0);
        // No lasers owned by player
        expect(engine.activeLasers.some((l) => l.ownerId === engine.leftEntity.id)).toBe(false);
      }
    });
  });

  describe('Level 5 (reglas2/nivel5.md) Specifications', () => {
    it('Test 1: Total Enemy Immunity and Strict 4-Step Derivative Cycle', () => {
      const level5 = LevelRegistry.getLevel(5)!;
      const engine = new SimulationEngine(level5);

      engine.update(3.1); // Enter combat

      expect(engine.leftEntity.symbol).toBe('d/dx');
      expect(engine.rightEntity.symbol).toBe('sin x');
      expect(engine.rightEntity.hp).toBe(100);
      expect(engine.leftEntity.hp).toBe(100);
      expect(engine.derivativeHitCount).toBe(0);

      // Hit 1: d/dx(sin x) = cos x
      engine.leftEntity.position = engine.rightEntity.position.clone();
      engine.update(1 / 60);
      expect(engine.rightEntity.symbol).toBe('cos x');
      expect(engine.rightEntity.hp).toBe(100);
      expect(engine.leftEntity.hp).toBe(100);
      expect(engine.derivativeHitCount).toBe(1);

      // Hit 2: d/dx(cos x) = -sin x
      engine.leftEntity.position = engine.rightEntity.position.clone();
      engine.update(1 / 60);
      expect(engine.rightEntity.symbol).toBe('-sin x');
      expect(engine.rightEntity.hp).toBe(100);
      expect(engine.leftEntity.hp).toBe(100);
      expect(engine.derivativeHitCount).toBe(2);

      // Hit 3: d/dx(-sin x) = -cos x
      engine.leftEntity.position = engine.rightEntity.position.clone();
      engine.update(1 / 60);
      expect(engine.rightEntity.symbol).toBe('-cos x');
      expect(engine.rightEntity.hp).toBe(100);
      expect(engine.leftEntity.hp).toBe(100);
      expect(engine.derivativeHitCount).toBe(3);

      // Hit 4: d/dx(-cos x) = sin x
      engine.leftEntity.position = engine.rightEntity.position.clone();
      engine.update(1 / 60);
      expect(engine.rightEntity.symbol).toBe('sin x');
      expect(engine.rightEntity.hp).toBe(100);
      expect(engine.leftEntity.hp).toBe(100);
      expect(engine.derivativeHitCount).toBe(4);
    });

    it('Test 2: Chain Rule Application after Collecting b = 2', () => {
      const level5 = LevelRegistry.getLevel(5)!;
      const engine = new SimulationEngine(level5);

      engine.update(3.1); // Enter combat

      // Force 1 collision to reach cos x
      engine.leftEntity.position = engine.rightEntity.position.clone();
      engine.update(1 / 60);
      expect(engine.rightEntity.symbol).toBe('cos x');
      expect(engine.rightEntity.frequency).toBe(1);

      // Separate player and enemy
      engine.leftEntity.position = vec2(-30, 0);
      engine.leftEntity.velocity = vec2(0, 0);
      engine.rightEntity.position = vec2(20, 0);
      engine.rightEntity.velocity = vec2(0, 0);

      // Enemy collects b = 2 node
      engine.orbs.push({
        id: 'test_orb_b2',
        type: 'FREQUENCY_X2',
        position: engine.rightEntity.position.clone(),
        radius: 4,
      });
      engine.update(1 / 60);
      expect(engine.rightEntity.frequency).toBe(2);
      expect(engine.rightEntity.symbol).toBe('cos 2x');

      // 1st collision with d/dx after collecting b = 2: d/dx(cos 2x) = -2sin 2x
      engine.leftEntity.position = engine.rightEntity.position.clone();
      engine.update(1 / 60);
      expect(engine.rightEntity.symbol).toBe('-2sin 2x');
      expect(engine.rightEntity.hp).toBe(100);
      expect(engine.leftEntity.hp).toBe(100);

      // 2nd collision with d/dx after collecting b = 2: d/dx(-2sin 2x) = -4cos 2x
      engine.leftEntity.position = engine.rightEntity.position.clone();
      engine.update(1 / 60);
      expect(engine.rightEntity.symbol).toBe('-4cos 2x');
      expect(engine.rightEntity.hp).toBe(100);
      expect(engine.leftEntity.hp).toBe(100);
    });

    it('Test 3: Cooldown Reduction from 2pi to pi', () => {
      const level5 = LevelRegistry.getLevel(5)!;
      const engine = new SimulationEngine(level5);

      engine.update(3.1); // Enter combat

      // Keep them apart so they do not collide physically
      engine.leftEntity.position = vec2(-40, -40);
      engine.leftEntity.velocity = vec2(0, 0);
      engine.rightEntity.position = vec2(40, 40);
      engine.rightEntity.velocity = vec2(0, 0);

      expect(engine.rightEntity.cooldownMax).toBeCloseTo(6.28, 2);
      expect(engine.rightEntity.cooldownRemaining).toBeCloseTo(6.28, 2);

      // Advance by 6.0 seconds - cooldown not yet reached
      engine.update(6.0);
      expect(engine.activeLasers.length).toBe(0);

      // Advance 0.3s (total 6.3s > 6.28s) -> 1st shot fires!
      engine.update(0.3);
      expect(engine.activeLasers.length).toBe(1);
      const firstLaser = engine.activeLasers[0];
      expect(firstLaser.ownerId).toBe(engine.rightEntity.id);
      expect(firstLaser.damage).toBe(25);

      // Cooldown reset to 6.28s
      expect(engine.rightEntity.cooldownMax).toBeCloseTo(6.28, 2);

      // Clear lasers
      engine.activeLasers = [];

      // Advance 2.0s into the second cycle
      engine.update(2.0);

      // Enemy collects b = 2
      engine.orbs.push({
        id: 'test_orb_b2_cooldown',
        type: 'FREQUENCY_X2',
        position: engine.rightEntity.position.clone(),
        radius: 4,
      });
      engine.update(1 / 60);
      expect(engine.rightEntity.frequency).toBe(2);

      // The current cooldown cycle in progress is NOT cut short
      expect(engine.rightEntity.cooldownRemaining).toBeGreaterThan(3.0);

      // Complete the remaining time of the 2nd cycle (~4.28s)
      engine.update(4.3);
      expect(engine.activeLasers.length).toBe(1);

      // Now upon completing the cycle, cooldownMax is updated to pi = 3.14s
      expect(engine.rightEntity.cooldownMax).toBeCloseTo(3.14, 2);
      expect(engine.rightEntity.cooldownRemaining).toBeCloseTo(3.14, 2);

      // Clear lasers
      engine.activeLasers = [];

      // Advance 3.0s: no new shot yet (3.0s < 3.14s)
      engine.update(3.0);
      expect(engine.activeLasers.length).toBe(0);

      // Advance 0.2s (total 3.2s > 3.14s): new shot fires exactly after 3.14s!
      engine.update(0.2);
      expect(engine.activeLasers.length).toBe(1);
      expect(engine.rightEntity.cooldownMax).toBeCloseTo(3.14, 2);
    });

    it('Test 4: Exclusivity of Power-Up Collection (Intangible to Player)', () => {
      const level5 = LevelRegistry.getLevel(5)!;
      const engine = new SimulationEngine(level5);

      engine.update(3.1); // Enter combat

      // Keep enemy far away
      engine.rightEntity.position = vec2(40, 40);
      engine.rightEntity.velocity = vec2(0, 0);

      const orbB2 = {
        id: 'orb_b2_test',
        type: 'FREQUENCY_X2' as const,
        position: vec2(-28, -14),
        radius: 4,
      };
      const orbA2 = {
        id: 'orb_a2_test',
        type: 'AMPLITUDE_X2' as const,
        position: vec2(18, 11),
        radius: 4,
      };
      engine.orbs = [orbB2, orbA2];

      // Player passes directly over orb_b2
      engine.leftEntity.position = vec2(-28, -14);
      engine.leftEntity.velocity = vec2(10, 0);
      engine.update(1 / 60);

      // Nodos amarillos no deben desaparecer, ni alterar su posición
      expect(engine.orbs.length).toBe(2);
      expect(engine.orbs[0].position.x).toBe(-28);
      expect(engine.orbs[0].position.y).toBe(-14);

      // Ni aplicar ningún efecto al Jugador o al Enemigo
      expect(engine.leftEntity.frequency).toBe(1);
      expect(engine.rightEntity.frequency).toBe(1);
      expect(engine.leftEntity.hp).toBe(100);

      // Player passes directly over orb_a2
      engine.leftEntity.position = vec2(18, 11);
      engine.leftEntity.velocity = vec2(10, 0);
      engine.update(1 / 60);

      expect(engine.orbs.length).toBe(2);
      expect(engine.orbs[1].position.x).toBe(18);
      expect(engine.orbs[1].position.y).toBe(11);
      expect(engine.leftEntity.amplitude).toBe(1);
      expect(engine.rightEntity.amplitude).toBe(1);

      // Verify timed spawning at 8.0s and 14.0s
      const freshEngine = new SimulationEngine(level5);
      freshEngine.update(3.1); // enter combat
      expect(freshEngine.orbs.length).toBe(0);

      // At 8.0s combat time, b = 2 spawns
      freshEngine.update(8.0);
      expect(freshEngine.orbs.some((o) => o.id === 'orb_b2')).toBe(true);

      // At 14.0s combat time, a = 2 spawns
      freshEngine.update(6.0);
      expect(freshEngine.orbs.some((o) => o.id === 'orb_a2')).toBe(true);
    });

    it('Test 5: Wave projectile deals -25 HP on hit and 0 on dodge', () => {
      const level5 = LevelRegistry.getLevel(5)!;
      const engine = new SimulationEngine(level5);

      engine.update(3.1); // Combat

      // Position enemy at (25, 0) and player at (-10, -10) directly on the sine wave:
      // at x = -10: y = 0 + 12 * sin(-10 * 0.2) ≈ -10.9, distance to (-10, -10) is ~0.9 <= 6.5
      engine.rightEntity.position = vec2(25, 0);
      engine.rightEntity.velocity = vec2(0, 0);
      engine.leftEntity.position = vec2(-10, -10);
      engine.leftEntity.velocity = vec2(0, 0);

      // Add a wave laser from enemy
      engine.activeLasers = [
        {
          id: 'test_wave',
          ownerId: engine.rightEntity.id,
          sourcePos: vec2(0, 0),
          curveType: 'SINE',
          isTelegraph: false,
          telegraphTime: 0,
          durationRemaining: 0.8,
          damage: 25,
        },
      ];

      engine.update(1 / 60);

      // Hits player for -25 HP
      expect(engine.leftEntity.hp).toBe(75);

      // Clear lasers and position player safely out of range (dodge)
      engine.activeLasers = [];
      engine.leftEntity.position = vec2(-40, -40); // Far away from wave

      engine.activeLasers = [
        {
          id: 'test_wave_miss',
          ownerId: engine.rightEntity.id,
          sourcePos: vec2(0, 0),
          curveType: 'SINE',
          isTelegraph: false,
          telegraphTime: 0,
          durationRemaining: 0.8,
          damage: 25,
        },
      ];

      engine.update(1 / 60);

      // Player took 0 damage on dodge
      expect(engine.leftEntity.hp).toBe(75);
    });

    it('Test 6: Directional traveling wave projectile lifecycle and boundary wall dissolution', () => {
      const level5 = LevelRegistry.getLevel(5)!;
      const testBus = new EventBus();
      const engine = new SimulationEngine(level5, testBus);

      engine.update(3.1); // Combat

      // Position enemy at (30, 0) and player at (-10, 0)
      engine.rightEntity.position = vec2(30, 0);
      engine.rightEntity.velocity = vec2(0, 0);
      engine.leftEntity.position = vec2(-10, 0);
      engine.leftEntity.velocity = vec2(0, 0);

      // Force enemy cooldown to ready so wave fires
      engine.rightEntity.cooldownRemaining = 0;
      engine.update(1 / 60);

      // Verify wave was spawned and is aimed directly toward the player
      expect(engine.activeLasers.length).toBe(1);
      const wave = engine.activeLasers[0];
      expect(wave.velocity).toBeDefined();
      expect(wave.velocity!.x).toBeLessThan(0); // Aimed left toward player
      expect(Math.abs(wave.velocity!.y)).toBeLessThan(0.01);

      // Advance wave along path until it reaches player at x = -10
      // Distance from 30 to -10 is 40 units; at speed 40 units/s, travel time is ~1.0s
      let formulaEmitted = false;
      testBus.on('MATH_FORMULA', (payload) => {
        if (payload.latex.includes('(-25)')) {
          formulaEmitted = true;
        }
      });

      // Update 0.8s: wave approaches player and hits
      engine.update(0.8);
      expect(engine.leftEntity.hp).toBe(75); // -25 HP dealt!
      expect(formulaEmitted).toBe(true);

      // Wave continues traveling past the player (does not deal damage again to the same target)
      engine.update(0.1);
      expect(engine.leftEntity.hp).toBe(75);

      // Listen for boundary wall dissolution formula
      let wallDissolved = false;
      testBus.on('MATH_FORMULA', (payload) => {
        if (payload.latex.includes('Disipación')) {
          wallDissolved = true;
        }
      });

      // Advance until wave reaches boundary wall (x <= -50)
      // At x = -10, distance to -50 is 40 units, ~1.0s at speed 40
      engine.update(1.2);

      // Wave collided with boundary wall and dissolved
      expect(wallDissolved).toBe(true);
      expect(engine.activeLasers.length).toBe(0);
    });
  });

  describe('Level 6 (reglas2/nivel6.md) Specifications', () => {
    it('Test 1: Node Collision Asymmetry (∫ bounces solidly, e^x phases through like a ghost)', () => {
      const level6 = LevelRegistry.getLevel(6)!;
      const engine = new SimulationEngine(level6);

      engine.update(3.1); // Enter combat

      // Place node C1 at the center
      const c1 = new BaseEntity({
        id: 'c1_node',
        name: 'C1',
        symbol: 'C_1',
        team: 'SUB_ENTITY',
        color: '#F57C00',
        bgColor: '#FFE0B2',
        hp: 2,
        maxHp: 2,
        radius: 4.5,
        mass: 1e9,
        position: vec2(0, 0),
        velocity: vec2(0, 0),
      });
      c1.cIndex = 1;
      c1.polyDegree = 0;
      engine.subEntities = [c1];

      // e^x launched directly toward C1 from (15, 0) with velocity (-30, 0)
      engine.rightEntity.position = vec2(15, 0);
      engine.rightEntity.velocity = vec2(-30, 0);

      // Keep player ∫ far away at (-40, -40)
      engine.leftEntity.position = vec2(-40, -40);
      engine.leftEntity.velocity = vec2(0, 0);

      // Advance physics: e^x moves through (0, 0) without bouncing or deflecting
      engine.update(0.6); // 15 - 30 * 0.6 = -3.0
      expect(engine.rightEntity.position.x).toBeLessThan(0);
      expect(engine.rightEntity.velocity.x).toBe(-30); // Velocity completely unhampered!
      expect(c1.polyDegree).toBe(0); // C1 not integrated by e^x
      expect(engine.subEntities.length).toBe(1);

      // Now launch ∫ toward C1 from (-15, 0) with velocity (30, 0)
      engine.rightEntity.position = vec2(40, 40);
      engine.rightEntity.velocity = vec2(0, 0);

      engine.leftEntity.position = vec2(-10, 0);
      engine.leftEntity.velocity = vec2(30, 0);

      // Update 1 frame to trigger collision
      engine.update(1 / 60);

      // ∫ bounces solidly: velocity.x reflected to negative
      expect(engine.leftEntity.velocity.x).toBeLessThan(0);
      // C1 transforms into C1 x and spawns C2
      expect(c1.polyDegree).toBe(1);
      expect(c1.symbol).toBe('C_1 x');
      expect(engine.subEntities.length).toBe(2);
    });

    it('Test 2: Exact Factorial Progression (C1 -> C1 x -> C1/2 x^2 -> C1/6 x^3 -> C1/24 x^4 -> C1/120 x^5)', () => {
      const level6 = LevelRegistry.getLevel(6)!;
      const engine = new SimulationEngine(level6);

      engine.update(3.1); // Enter combat

      // Start with C1 at (0, 0)
      const c1 = new BaseEntity({
        id: 'c1_factorial_test',
        name: 'C1',
        symbol: 'C_1',
        team: 'SUB_ENTITY',
        color: '#F57C00',
        bgColor: '#FFE0B2',
        hp: 2,
        maxHp: 2,
        radius: 4.5,
        mass: 1e9,
        position: vec2(0, 0),
        velocity: vec2(0, 0),
      });
      c1.cIndex = 1;
      c1.polyDegree = 0;
      engine.subEntities = [c1];

      // Keep e^x far away
      engine.rightEntity.position = vec2(40, 40);
      engine.rightEntity.velocity = vec2(0, 0);

      let prevRadius = c1.radius;

      // 5 successive bounces against the same C1 node:
      const expectedSymbols = [
        'C_1 x',
        '\\frac{C_1}{2}x^2',
        '\\frac{C_1}{6}x^3',
        '\\frac{C_1}{24}x^4',
        '\\frac{C_1}{120}x^5',
      ];

      for (let bounce = 0; bounce < 5; bounce++) {
        c1.invulnerabilityTimer = 0; // ready for next bounce
        engine.leftEntity.position = vec2(0, 0);
        engine.update(1 / 60);

        expect(c1.polyDegree).toBe(bounce + 1);
        expect(c1.symbol).toBe(expectedSymbols[bounce]);
        expect(c1.radius).toBeGreaterThan(prevRadius);
        prevRadius = c1.radius;

        // Move away newly spawned constants so only C1 is at (0, 0)
        for (let s = 1; s < engine.subEntities.length; s++) {
          engine.subEntities[s].position = vec2(-45, -45);
        }
      }

      // Initial C1 + 5 newly generated constants = 6 total sub-entities
      expect(engine.subEntities.length).toBe(6);
    });

    it('Test 3: Polynomial Beam Damage vs. Whip Strike Damage', () => {
      const level6 = LevelRegistry.getLevel(6)!;
      const engine = new SimulationEngine(level6);

      engine.update(3.1); // Enter combat
      expect(engine.rightEntity.hp).toBe(80);

      // Keep entities separated while waiting for whip cooldown
      engine.leftEntity.position = vec2(-35, 0);
      engine.leftEntity.velocity = vec2(0, 0);
      engine.rightEntity.position = vec2(35, 0);
      engine.rightEntity.velocity = vec2(0, 0);

      // Wait until whip is ready (1s initial cooldown)
      engine.update(1.0);
      expect(engine.leftEntity.isReady()).toBe(true);

      // Hit 1: Direct whip strike on e^x -> -7 and -5 (total -12 HP) and 5s cooldown
      engine.leftEntity.position = engine.rightEntity.position.clone();
      engine.update(1 / 60);

      expect(engine.rightEntity.hp).toBe(68); // 80 - 12
      expect(engine.leftEntity.cooldownRemaining).toBeCloseTo(5.0, 1);

      // Clear spawned constants & lasers
      engine.subEntities = [];
      engine.activeLasers = [];

      // Place a node at (0, 0) and position e^x at (10, 10)
      const cNode = new BaseEntity({
        id: 'c_beam_node',
        name: 'C1',
        symbol: 'C_1',
        team: 'SUB_ENTITY',
        color: '#F57C00',
        bgColor: '#FFE0B2',
        hp: 2,
        maxHp: 2,
        radius: 4.5,
        mass: 1e9,
        position: vec2(0, 0),
        velocity: vec2(0, 0),
      });
      cNode.cIndex = 1;
      cNode.polyDegree = 0;
      engine.subEntities = [cNode];

      engine.rightEntity.position = vec2(10, 10); // Sits on line y = x (LINEAR beam through (0, 0))
      engine.rightEntity.velocity = vec2(0, 0);

      // Whip is currently still on cooldown (~4.9s remaining)
      expect(engine.leftEntity.isReady()).toBe(false);

      // Player integrates cNode -> evolves to degree 1 (LINEAR beam) and fires haz
      engine.leftEntity.position = vec2(0, 0);
      engine.update(1 / 60);

      // Beam crosses e^x at (10, 10) and inflicts exactly -4 HP (68 - 4 = 64 HP)
      expect(engine.rightEntity.hp).toBe(64);

      // Whip cooldown is independent of beam firing
      expect(engine.leftEntity.isReady()).toBe(false);
    });

    it('Test 4: Node Destruction by e^x Exponential Blade', () => {
      const level6 = LevelRegistry.getLevel(6)!;
      const engine = new SimulationEngine(level6);

      engine.update(3.1); // Enter combat

      // Place node C1 at (0, 0) with 2 HP
      const c1 = new BaseEntity({
        id: 'c1_destructible',
        name: 'C1',
        symbol: 'C_1',
        team: 'SUB_ENTITY',
        color: '#F57C00',
        bgColor: '#FFE0B2',
        hp: 2,
        maxHp: 2,
        radius: 4.5,
        mass: 1e9,
        position: vec2(0, 0),
        velocity: vec2(0, 0),
      });
      engine.subEntities = [c1];

      // Keep player far away
      engine.leftEntity.position = vec2(-40, -40);

      // Shot 1: Exponential laser cuts across (0, 0)
      engine.activeLasers = [
        {
          id: 'exp_blade_1',
          ownerId: engine.rightEntity.id,
          sourcePos: vec2(0, -1), // y = -1 + exp(0.15 * x) -> at x = 0, y = 0
          curveType: 'EXPONENTIAL',
          isTelegraph: false,
          telegraphTime: 0,
          durationRemaining: 0.5,
          damage: 4,
        },
      ];

      engine.update(1 / 60);

      // C1 receives -1 damage
      expect(c1.hp).toBe(1);
      expect(c1.isDead).toBe(false);
      expect(engine.subEntities.length).toBe(1);

      // Shot 2: Exponential laser cuts across (0, 0) again
      engine.activeLasers = [
        {
          id: 'exp_blade_2',
          ownerId: engine.rightEntity.id,
          sourcePos: vec2(0, -1),
          curveType: 'EXPONENTIAL',
          isTelegraph: false,
          telegraphTime: 0,
          durationRemaining: 0.5,
          damage: 4,
        },
      ];

      engine.update(1 / 60);

      // C1 receives second -1 damage, HP drops to 0, node is destroyed and removed!
      expect(c1.hp).toBe(0);
      expect(c1.isDead).toBe(true);
      expect(engine.subEntities.length).toBe(0);
    });

    it('Test 5: Prevention of Sticking, Strong Repulsion, and Debounce between ∫ and e^x', () => {
      const level6 = LevelRegistry.getLevel(6)!;
      const engine = new SimulationEngine(level6);

      engine.update(3.1); // Enter combat
      expect(engine.subEntities.length).toBe(0);

      // Place ∫ and e^x colliding directly at the center
      engine.leftEntity.position = vec2(-5, 0);
      engine.leftEntity.velocity = vec2(20, 0);
      engine.rightEntity.position = vec2(5, 0);
      engine.rightEntity.velocity = vec2(-20, 0);

      // Frame 1: First collision occurs
      engine.update(1 / 60);

      // Exactly ONE constant is generated (C1)
      expect(engine.integralConstantCount).toBe(1);
      expect(engine.subEntities.length).toBe(1);

      // Repulsion velocities: player sent left, enemy sent right with strong knockback ("la mande lejos")
      expect(engine.leftEntity.velocity.x).toBeLessThan(0);
      expect(engine.rightEntity.velocity.x).toBeGreaterThan(30);

      // Positional separation prevents geometrical sticking
      const dist = engine.leftEntity.position.distanceTo(engine.rightEntity.position);
      const minDist = engine.leftEntity.radius + engine.rightEntity.radius;
      expect(dist).toBeGreaterThanOrEqual(minDist);

      // Simulate 15 consecutive frames (~0.25s) without external forces
      for (let f = 0; f < 15; f++) {
        engine.update(1 / 60);
      }

      // Crucial: No runaway multiplication! Constant count remains strictly 1
      expect(engine.integralConstantCount).toBe(1);
      expect(engine.subEntities.length).toBe(1);

      // Contact cooldown is active during separation
      expect(engine.level6ContactCooldown).toBeGreaterThan(0);
    });

    it('Test 6: Constant Spheres Motion, Freezing on Beam, Interruption by Blade, and Level Victory on e^x Death', () => {
      const level6 = LevelRegistry.getLevel(6)!;
      let matchOverEmitted = false;
      let matchWinner = '';
      const testBus = new EventBus();
      testBus.on('MATCH_OVER', (payload) => {
        matchOverEmitted = true;
        matchWinner = payload.winner;
      });

      const engine = new SimulationEngine(level6, testBus);
      engine.update(3.1); // Enter combat

      // 1. Spawn a constant sphere and verify it has motion
      engine.leftEntity.position = vec2(-30, -30);
      engine.leftEntity.velocity = vec2(0, 0);
      engine.rightEntity.position = vec2(30, 30);
      engine.rightEntity.velocity = vec2(0, 0);

      // Trigger one hit between ∫ and e^x to spawn a constant C1
      engine.leftEntity.position = engine.rightEntity.position.clone();
      engine.update(1 / 60);

      expect(engine.subEntities.length).toBe(1);
      const c1 = engine.subEntities[0];

      // Constant sphere has non-zero velocity and is NOT frozen initially
      expect(c1.velocity.magnitude()).toBeGreaterThan(10);
      const initialPos = c1.position.clone();

      // Separate ∫ and e^x
      engine.leftEntity.position = vec2(-40, -40);
      engine.leftEntity.velocity = vec2(0, 0);
      engine.rightEntity.position = vec2(40, 40);
      engine.rightEntity.velocity = vec2(0, 0);

      // Advance 5 frames: verify C1 actually moves
      for (let f = 0; f < 5; f++) {
        engine.update(1 / 60);
      }
      expect(c1.position.distanceTo(initialPos)).toBeGreaterThan(0.5);

      // 2. Player integrates C1 -> C1 must freeze while firing its polynomial ray
      c1.invulnerabilityTimer = 0;
      engine.leftEntity.position = c1.position.clone();
      engine.update(1 / 60);

      expect(c1.polyDegree).toBe(1); // upgraded to C1 x
      expect(engine.activeLasers.some((l) => l.ownerId === c1.id)).toBe(true);

      const frozenPos = c1.position.clone();
      // Advance 1 frame: since C1 is firing a ray, it must remain frozen in place
      engine.update(1 / 60);
      expect(c1.position.x).toBeCloseTo(frozenPos.x, 2);
      expect(c1.position.y).toBeCloseTo(frozenPos.y, 2);

      // 3. Enemy e^x cuts C1 with Exponential Blade while firing ray -> ray interrupts, C1 unfreezes and continues moving
      engine.activeLasers.push({
        id: 'blade_interrupt',
        ownerId: engine.rightEntity.id,
        sourcePos: vec2(c1.position.x, c1.position.y - 1),
        curveType: 'EXPONENTIAL',
        isTelegraph: false,
        telegraphTime: 0,
        durationRemaining: 0.5,
        damage: 4,
      });

      engine.update(1 / 60);

      // The ray owned by C1 was interrupted and removed!
      expect(engine.activeLasers.some((l) => l.ownerId === c1.id)).toBe(false);
      // C1 received -1 HP
      expect(c1.hp).toBe(1);

      // Advance frames: C1 continues moving forward
      const posAfterInterrupt = c1.position.clone();
      for (let f = 0; f < 5; f++) {
        engine.update(1 / 60);
      }
      expect(c1.position.distanceTo(posAfterInterrupt)).toBeGreaterThan(0.5);

      // 4. Enemy e^x reaches 0 HP -> Level transitions to VICTORY even with active constants
      expect(engine.status).toBe('COMBAT');
      expect(engine.subEntities.length).toBeGreaterThan(0);

      engine.rightEntity.takeDamage(engine.rightEntity.hp); // lethal damage
      expect(engine.rightEntity.hp).toBe(0);
      expect(engine.rightEntity.isDead).toBe(true);

      engine.update(1 / 60); // triggers checkMatchEnd

      expect(engine.status).toBe('VICTORY');
      expect(matchOverEmitted).toBe(true);
      expect(matchWinner).toBe('LEFT');
    });
  });
});
