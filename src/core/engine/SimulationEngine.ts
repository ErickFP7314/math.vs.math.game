import { Vector2D, vec2 } from '../physics/Vector2D';
import { ElasticSolver } from '../physics/ElasticSolver';
import { Curves } from '../math/Curves';
import { BaseEntity } from '../entities/BaseEntity';
import { LevelDefinition } from '../levels/LevelRegistry';
import { EventBus, globalEventBus } from './EventBus';

export type MatchStatus = 'COUNTDOWN' | 'COMBAT' | 'PAUSED' | 'VICTORY' | 'DEFEAT';

export interface ActiveLaser {
  id: string;
  ownerId: string;
  sourcePos: Vector2D;
  curveType: 'CUBIC' | 'PARABOLA' | 'LINEAR' | 'HORIZONTAL' | 'EXPONENTIAL' | 'SINE' | 'COSINE' | 'SECTOR';
  isTelegraph: boolean;
  telegraphTime: number;
  durationRemaining: number;
  damage: number;
  angle?: number;
  sectorSpan?: number;
  hitEntityIds?: string[];
  velocity?: Vector2D;
  amplitude?: number;
  frequency?: number;
}

export interface PowerOrb {
  id: string;
  type: 'AMPLITUDE_X2' | 'FREQUENCY_X2';
  position: Vector2D;
  radius: number;
}

export class SimulationEngine {
  level: LevelDefinition;
  status: MatchStatus = 'COUNTDOWN';
  countdownRemaining = 3.0; // 3 seconds initial countdown
  lastCountdownSecond = 4;

  leftEntity: BaseEntity;
  rightEntity: BaseEntity;
  subEntities: BaseEntity[] = [];
  activeLasers: ActiveLaser[] = [];
  orbs: PowerOrb[] = [];

  // Level-specific counters
  polyGlobalHp?: { current: number; max: number };
  derivativeHitCount = 0;
  integralConstantCount = 0;
  piDigits = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5, 8, 9, 7, 9];
  piCurrentDigitIndex = 0;
  imaginaryPhaseTimer = 0;
  level3ContactCooldown = 0;
  level5MatchTime = 0;
  level5SpawnedB2 = false;
  level5SpawnedA2 = false;
  level6ContactCooldown = 0;
  integralWhipAngle = 0;

  eventBus: EventBus;
  laserIdCounter = 0;
  orbSpawnTimer = 5.0;
  enemyShootTimer = 3.0;
  frozenOwnerIds: Set<string> = new Set();

  /** Backward-compatible getter: true when any laser is active */
  get isFrozen(): boolean {
    return this.frozenOwnerIds.size > 0;
  }

  constructor(level: LevelDefinition, eventBus = globalEventBus) {
    this.level = level;
    this.eventBus = eventBus;

    this.leftEntity = new BaseEntity(level.leftEntityConfig);
    this.rightEntity = new BaseEntity(level.rightEntityConfig);

    if (level.polynomialGlobalHp) {
      this.polyGlobalHp = {
        current: level.polynomialGlobalHp,
        max: level.polynomialGlobalHp,
      };
    }

    if (level.id === 2 || level.id === 4) {
      // Exponential is immune to d/dx in level 2
      if (level.id === 2) {
        this.rightEntity.isImmuneToDerivative = true;
      }
    }

    if (level.id === 3) {
      // Level 3: Initial setup (e^x starts with 1s cooldown, i starts in Phase 0: [i])
      this.leftEntity.cooldownRemaining = 1.0;
      this.rightEntity.currentPhaseIndex = 0;
      this.rightEntity.symbol = 'i';
      this.rightEntity.name = 'i';
    }

    if (level.id === 4) {
      // Level 4: Player ∂/∂y has no cooldown, Enemy e^x starts with 1s cooldown (3s loop)
      this.leftEntity.cooldownRemaining = 0;
      this.leftEntity.cooldownMax = 0;
      this.rightEntity.cooldownRemaining = 1.0;
      this.rightEntity.cooldownMax = 3.0;
    }

    if (level.id === 5) {
      // Level 5: Player d/dx has no cooldown, Enemy sin x starts with 6.28s cooldown (T = 2π/b)
      this.leftEntity.cooldownRemaining = 0;
      this.leftEntity.cooldownMax = 0;
      this.rightEntity.cooldownRemaining = 6.28;
      this.rightEntity.cooldownMax = 6.28;
      this.rightEntity.frequency = 1;
      this.rightEntity.amplitude = 1;
      this.rightEntity.trigPhase = 0;
      this.rightEntity.symbol = 'sin x';
      this.rightEntity.name = 'sin x';
    }

    if (level.id === 6) {
      // Level 6: Player starts with 1s cooldown for the whip; Enemy starts with 1s cooldown (3s loop)
      this.leftEntity.cooldownMax = 5.0;
      this.leftEntity.cooldownRemaining = 1.0;
      this.rightEntity.cooldownMax = 3.0;
      this.rightEntity.cooldownRemaining = 1.0;
      this.integralConstantCount = 0;
      this.level6ContactCooldown = 0;
      this.integralWhipAngle = 0;
    }
  }

  update(dt: number): void {
    if (this.status === 'PAUSED') return;

    if (this.status === 'COUNTDOWN') {
      this.countdownRemaining -= dt;
      const currentSecond = Math.ceil(this.countdownRemaining);
      if (currentSecond < this.lastCountdownSecond && currentSecond > 0) {
        this.lastCountdownSecond = currentSecond;
        this.eventBus.emit('MATCH_COUNTDOWN', { count: currentSecond });
      }

      if (this.countdownRemaining <= 0) {
        this.status = 'COMBAT';
        this.randomizeEntityDirections();
        if (this.level.id === 3) {
          // Rule 2: "al iniciar la partida tras la cuenta regresiva, el primer cooldown es de 1 segundo"
          this.leftEntity.cooldownRemaining = 1.0;
          this.rightEntity.currentPhaseIndex = 0;
          this.rightEntity.symbol = 'i';
          this.rightEntity.name = 'i';
          this.imaginaryPhaseTimer = 0;
          this.level3ContactCooldown = 0;
        }
        if (this.level.id === 4) {
          // Level 4: At second 0, e^x enters [Cooldown 1s], Player has no cooldown
          this.leftEntity.cooldownRemaining = 0;
          this.leftEntity.cooldownMax = 0;
          this.rightEntity.cooldownRemaining = 1.0;
          this.rightEntity.cooldownMax = 3.0;
        }
        if (this.level.id === 5) {
          // Level 5: Player d/dx has no cooldown, Enemy sin x starts with 6.28s cooldown
          this.leftEntity.cooldownRemaining = 0;
          this.leftEntity.cooldownMax = 0;
          this.rightEntity.cooldownRemaining = 6.28;
          this.rightEntity.cooldownMax = 6.28;
          this.rightEntity.frequency = 1;
          this.rightEntity.amplitude = 1;
          this.rightEntity.trigPhase = 0;
          this.rightEntity.symbol = 'sin x';
          this.rightEntity.name = 'sin x';
          this.derivativeHitCount = 0;
          this.level5MatchTime = 0;
          this.level5SpawnedB2 = false;
          this.level5SpawnedA2 = false;
        }
        if (this.level.id === 6) {
          // Level 6: Player whip starts at 1s cooldown, enemy e^x at 1s cooldown
          this.leftEntity.cooldownMax = 5.0;
          this.leftEntity.cooldownRemaining = 1.0;
          this.rightEntity.cooldownMax = 3.0;
          this.rightEntity.cooldownRemaining = 1.0;
          this.integralConstantCount = 0;
          this.level6ContactCooldown = 0;
          this.integralWhipAngle = 0;
          this.subEntities = [];
        }
        this.eventBus.emit('MATCH_START', { levelId: this.level.id });
      }
      return;
    }

    // Keep running combat / kinematics even after match over so spheres bounce smoothly for the victory phase
    if (this.status === 'COMBAT' || this.status === 'VICTORY' || this.status === 'DEFEAT') {
      this.updateCombat(dt);
    }
  }

  private updateCombat(dt: number): void {
    // Clean up dead sub-entities
    this.subEntities = this.subEntities.filter((e) => !e.isDead);

    // Cancel any lasers whose owners are dead or destroyed
    const livingIds = new Set<string>();
    if (!this.leftEntity.isDead) livingIds.add(this.leftEntity.id);
    if (!this.rightEntity.isDead) livingIds.add(this.rightEntity.id);
    for (const sub of this.subEntities) {
      if (!sub.isDead) livingIds.add(sub.id);
    }
    const hadDeadLasers = this.activeLasers.some((l) => !livingIds.has(l.ownerId));
    if (hadDeadLasers) {
      this.activeLasers = this.activeLasers.filter((l) => livingIds.has(l.ownerId));
      this.recalcFrozenOwners();
    }

    const allEntities = [this.leftEntity, this.rightEntity, ...this.subEntities].filter(
      (e) => !e.isDead
    );

    // 1. Update cooldowns, status effects, and kinematics
    for (const entity of allEntities) {
      entity.updateCooldown(dt);
      this.updateEntityStatusEffects(entity, dt);

      // Enemy spheres freeze only if THEY own an active laser; player (LEFT) always moves freely!
      const isEntityFrozen = entity.team !== 'LEFT' && this.isEntityFrozen(entity);
      if (!isEntityFrozen) {
        // Move entity if not static (static nodes have 0 velocity)
        if (entity.velocity.x !== 0 || entity.velocity.y !== 0) {
          entity.position = entity.position.add(entity.velocity.scale(dt));
          ElasticSolver.resolveBoundary(entity, this.level.arenaBounds);
        }
      }
    }

    // 2. Resolve entity-entity elastic collisions & math rules
    for (let i = 0; i < allEntities.length; i++) {
      for (let j = i + 1; j < allEntities.length; j++) {
        const a = allEntities[i];
        const b = allEntities[j];

        // Skip collisions between two frozen enemy spheres
        if (a.team !== 'LEFT' && b.team !== 'LEFT' && this.isEntityFrozen(a) && this.isEntityFrozen(b)) {
          continue;
        }

        // Level 6 specific collision filters:
        if (this.level.id === 6) {
          // Rule: Nodes do not collide with each other
          if (a.team === 'SUB_ENTITY' && b.team === 'SUB_ENTITY') {
            continue;
          }
          // Rule: e^x (RIGHT) is intangible to all orange nodes (SUB_ENTITY)
          if ((a.team === 'RIGHT' && b.team === 'SUB_ENTITY') || (b.team === 'RIGHT' && a.team === 'SUB_ENTITY')) {
            continue;
          }
        }

        // Check if collision is active
        if (ElasticSolver.checkCollision(a, b)) {
          this.handleMathCollision(a, b);
        }
      }
    }

    // 3. Update level-specific timers
    this.updateLevelMechanics(dt);

    // 4. Update lasers & check laser damage
    this.updateLasers(dt);

    // 5. Update orbs (Level 7 & Level 5)
    if (this.level.id === 7 || this.level.id === 5) {
      this.updateOrbs(dt);
    }

    // 6. AI decision loop for the opponent - only while match is actively in COMBAT
    if (this.status === 'COMBAT') {
      // Level 3 player Exponential Blade cycle and contact cooldown
      if (this.level.id === 3) {
        if (this.level3ContactCooldown > 0) {
          this.level3ContactCooldown -= dt;
        }
        if (this.leftEntity.isReady() && !this.leftEntity.isDead) {
          this.leftEntity.resetCooldown();
          this.laserIdCounter++;
          this.addLaser({
            id: `laser_${this.laserIdCounter}_exp_blade`,
            ownerId: this.leftEntity.id,
            sourcePos: this.leftEntity.position.clone(),
            curveType: 'EXPONENTIAL',
            isTelegraph: true,
            telegraphTime: 1.0,
            durationRemaining: 0.6,
            damage: 21,
          });
          this.eventBus.emit('SKILL_ACTIVATED', { entityId: this.leftEntity.id, skillName: 'Exponential Blade!' });
        }
      }

      // Level 4 & 6 enemy e^x Exponential Blade cycle (1s initial cooldown, 3s loop)
      if (this.level.id === 4 || this.level.id === 6) {
        if (this.rightEntity.isReady() && !this.rightEntity.isDead) {
          this.rightEntity.resetCooldown();
          this.laserIdCounter++;
          this.addLaser({
            id: `laser_${this.laserIdCounter}_enemy_exp_blade`,
            ownerId: this.rightEntity.id,
            sourcePos: this.rightEntity.position.clone(),
            curveType: 'EXPONENTIAL',
            isTelegraph: true,
            telegraphTime: 1.0,
            durationRemaining: 0.6,
            damage: 4,
          });
          this.eventBus.emit('SKILL_ACTIVATED', { entityId: this.rightEntity.id, skillName: 'Exponential Blade!' });
        }
      }

      // Level 5 enemy wave attack cycle (based strictly on period T = 2π/b)
      if (this.level.id === 5) {
        if (this.rightEntity.isReady() && !this.rightEntity.isDead) {
          const newCooldownMax = this.rightEntity.frequency >= 2 ? 3.14 : 6.28;
          this.rightEntity.cooldownMax = newCooldownMax;
          this.rightEntity.resetCooldown();
          this.laserIdCounter++;
          const isCos = this.rightEntity.symbol.includes('cos');
          const skillName = isCos ? '¡Onda Coseno!' : '¡Onda Seno!';

          const target = this.leftEntity;
          let dir = target.position.sub(this.rightEntity.position);
          if (dir.magnitude() > 0.001) {
            dir = dir.normalize();
          } else {
            dir = vec2(-1, 0);
          }
          const speed = 40;
          const amp = Math.abs(this.rightEntity.amplitude || 1);
          const freq = this.rightEntity.frequency || 1;

          this.addLaser({
            id: `laser_${this.laserIdCounter}_enemy_wave`,
            ownerId: this.rightEntity.id,
            sourcePos: this.rightEntity.position.clone(),
            curveType: isCos ? 'COSINE' : 'SINE',
            isTelegraph: false,
            telegraphTime: 0,
            durationRemaining: 5.0,
            damage: 25,
            velocity: dir.scale(speed),
            angle: Math.atan2(dir.y, dir.x),
            amplitude: amp,
            frequency: freq,
          });
          this.eventBus.emit('SKILL_ACTIVATED', { entityId: this.rightEntity.id, skillName });
        }
      }

      // Level 6: Integral Whip physical reach check against e^x
      if (this.level.id === 6) {
        const player = this.leftEntity;
        const enemy = this.rightEntity;

        if (!player.isDead && !enemy.isDead && player.isReady() && this.level6ContactCooldown <= 0) {
          const whipReach = player.radius + 6.0;
          const whipDir = vec2(Math.cos(this.integralWhipAngle), Math.sin(this.integralWhipAngle));
          const whipTip = player.position.add(whipDir.scale(whipReach));

          if (whipTip.distanceTo(enemy.position) <= enemy.radius + 1.5) {
            // Whip strikes e^x directly!
            player.cooldownMax = 5.0;
            player.resetCooldown();
            this.level6ContactCooldown = 0.6; // 600ms contact cooldown

            this.eventBus.emit('SKILL_ACTIVATED', { entityId: player.id, skillName: '¡Látigo ∫!' });

            enemy.takeDamage(7);
            this.eventBus.emit('DAMAGE_DEALT', {
              targetId: enemy.id,
              amount: 7,
              color: '#F57C00',
              position: { x: enemy.position.x, y: enemy.position.y },
            });

            enemy.takeDamage(5);
            this.eventBus.emit('DAMAGE_DEALT', {
              targetId: enemy.id,
              amount: 5,
              color: '#F57C00',
              position: { x: enemy.position.x, y: enemy.position.y - 4 },
            });

            this.integralConstantCount++;
            const cIndex = this.integralConstantCount;
            this.spawnConstantSphere(cIndex);

            this.eventBus.emit('MATH_FORMULA', {
              latex: `\\int e^x dx = e^x + C_{${cIndex}}`,
              position: { x: whipTip.x, y: whipTip.y },
              color: '#F57C00',
            });

            // Strong knockback: send e^x flying far away! ("la mande lejos")
            const normal = enemy.position.sub(player.position);
            const dist = normal.magnitude();
            const dir = dist > 0.001 ? normal.scale(1 / dist) : vec2(1, 0);

            enemy.velocity = dir.scale(55);
            player.velocity = dir.scale(-25);
          }
        }
      }

      this.updateAI(dt);
    }

    // 7. Check win/loss conditions
    this.checkMatchEnd();
  }

  private updateEntityStatusEffects(entity: BaseEntity, dt: number): void {
    for (let i = entity.statusEffects.length - 1; i >= 0; i--) {
      const effect = entity.statusEffects[i];
      effect.durationRemaining -= dt;

      if (effect.type === 'BURN') {
        effect.tickTimer = (effect.tickTimer || 0) + dt;
        const interval = effect.tickInterval || 1.0;
        if (effect.tickTimer >= interval) {
          effect.tickTimer -= interval;
          const dmg = effect.tickDamage || 2;

          // Rule 3 (Level 3): In reflection states [-1] and [-i], burn ticks invert (enemy heals +2 HP, reflects -2 HP to player)
          if (this.level.id === 3 && entity.id === this.rightEntity.id && (entity.currentPhaseIndex === 1 || entity.currentPhaseIndex === 2)) {
            entity.heal(dmg);
            this.leftEntity.takeDamage(dmg);
            this.eventBus.emit('DAMAGE_DEALT', {
              targetId: this.leftEntity.id,
              amount: dmg,
              color: '#D81B60',
              position: { x: this.leftEntity.position.x, y: this.leftEntity.position.y },
            });
            this.eventBus.emit('MATH_FORMULA', {
              latex: `\\times(-1) \\text{ Quemadura Invertida! (+}${dmg}/-${dmg})`,
              position: { x: entity.position.x, y: entity.position.y },
              color: '#D81B60',
            });
          } else {
            entity.takeDamage(dmg);
            this.eventBus.emit('DAMAGE_DEALT', {
              targetId: entity.id,
              amount: dmg,
              color: '#D32F2F',
              position: { x: entity.position.x, y: entity.position.y },
            });
          }
        }
      }

      if (effect.durationRemaining <= 0) {
        entity.statusEffects.splice(i, 1);
      }
    }
  }

  private handleMathCollision(a: BaseEntity, b: BaseEntity): void {
    // Level 3 specific collision rules (e^x vs i)
    if (this.level.id === 3 && ((a === this.leftEntity && b === this.rightEntity) || (b === this.leftEntity && a === this.rightEntity))) {
      if (this.status === 'VICTORY' || this.status === 'DEFEAT') {
        ElasticSolver.resolveCollision(a, b);
        return;
      }

      const isIntangible = this.rightEntity.currentPhaseIndex === 0 || this.rightEntity.currentPhaseIndex === 2; // [i] or [-i]
      if (isIntangible) {
        // Intangible: NO elastic bounce! Overlaps without bouncing.
        if (this.level3ContactCooldown <= 0) {
          this.level3ContactCooldown = 0.8;
          this.leftEntity.takeDamage(8);
          this.eventBus.emit('DAMAGE_DEALT', {
            targetId: this.leftEntity.id,
            amount: 8,
            color: '#D81B60',
            position: { x: this.leftEntity.position.x, y: this.leftEntity.position.y },
          });
          const phaseName = this.rightEntity.currentPhaseIndex === 0 ? 'i' : '-i';
          this.eventBus.emit('MATH_FORMULA', {
            latex: `${phaseName} \\text{ penetración! (-8 HP)}`,
            position: { x: this.leftEntity.position.x, y: this.leftEntity.position.y },
            color: '#D81B60',
          });
        }
        return;
      } else {
        // Solid states [-1] and [1]: Normal elastic bounce, 0 damage to both
        ElasticSolver.resolveCollision(a, b);
        return;
      }
    }

    // Level 6: Integral ∫ vs e^x -> Dedicated physics collision resolution & rules
    if (this.level.id === 6 && ((a === this.leftEntity && b === this.rightEntity) || (b === this.leftEntity && a === this.rightEntity))) {
      if (this.status === 'VICTORY' || this.status === 'DEFEAT') {
        ElasticSolver.resolveCollision(a, b);
        return;
      }

      const player = this.leftEntity;
      const enemy = this.rightEntity;
      const collisionPos = a.position.add(b.position).scale(0.5);

      const normal = enemy.position.sub(player.position);
      const dist = normal.magnitude();
      const dir = dist > 0.001 ? normal.scale(1 / dist) : vec2(1, 0);

      // Enforce immediate positional separation (+2.0 safety buffer) so they never overlap or stick
      const minDist = player.radius + enemy.radius;
      const overlap = minDist - dist;
      if (overlap > 0) {
        player.position = player.position.sub(dir.scale(overlap * 0.5 + 2.0));
        enemy.position = enemy.position.add(dir.scale(overlap * 0.5 + 2.0));
      }

      // If contact cooldown is active, bounce velocities only without spawning duplicate constants
      if (this.level6ContactCooldown > 0) {
        player.velocity = dir.scale(-28);
        enemy.velocity = dir.scale(35);
        return;
      }

      this.level6ContactCooldown = 0.6; // 600ms contact cooldown

      if (this.status === 'COMBAT') {
        this.integralConstantCount++;
        const cIndex = this.integralConstantCount;
        this.spawnConstantSphere(cIndex);

        this.eventBus.emit('MATH_FORMULA', {
          latex: `\\int e^x dx = e^x + C_{${cIndex}}`,
          position: { x: collisionPos.x, y: collisionPos.y },
          color: '#F57C00',
        });

        if (player.isReady()) {
          // Whip strike: -12 HP (-7 and -5) and 5s cooldown
          player.cooldownMax = 5.0;
          player.resetCooldown();

          this.eventBus.emit('SKILL_ACTIVATED', { entityId: player.id, skillName: '¡Látigo ∫!' });
          enemy.takeDamage(7);
          this.eventBus.emit('DAMAGE_DEALT', {
            targetId: enemy.id,
            amount: 7,
            color: '#F57C00',
            position: { x: enemy.position.x, y: enemy.position.y },
          });
          enemy.takeDamage(5);
          this.eventBus.emit('DAMAGE_DEALT', {
            targetId: enemy.id,
            amount: 5,
            color: '#F57C00',
            position: { x: enemy.position.x, y: enemy.position.y - 4 },
          });

          // Strong knockback repulsion ("la mande lejos")
          player.velocity = dir.scale(-28);
          enemy.velocity = dir.scale(50);
        } else {
          // Clean elastic bounce
          player.velocity = dir.scale(-28);
          enemy.velocity = dir.scale(35);
        }
      }
      return;
    }

    // Level 6: Integral ∫ vs Constant Sphere C_k (SUB_ENTITY)
    if (this.level.id === 6 && ((a === this.leftEntity && b.team === 'SUB_ENTITY') || (b === this.leftEntity && a.team === 'SUB_ENTITY'))) {
      const player = this.leftEntity;
      const node = a === this.leftEntity ? b : a;
      const collisionPos = player.position.add(node.position).scale(0.5);

      // Immediate positional separation (+1.5 safety buffer)
      const delta = player.position.sub(node.position);
      const dist = delta.magnitude();
      const dir = dist > 0.001 ? delta.scale(1 / dist) : vec2(-1, 0);
      const minDist = player.radius + node.radius;
      const overlap = minDist - dist;
      if (overlap > 0) {
        player.position = player.position.add(dir.scale(overlap + 1.5));
      }

      // Strong bounce velocities away from each other
      player.velocity = dir.scale(Math.max(25, player.velocity.magnitude()));
      node.velocity = dir.scale(-Math.max(20, node.velocity.magnitude() || 20));

      if (node.invulnerabilityTimer > 0) {
        return;
      }
      node.invulnerabilityTimer = 0.35; // 350ms debounce

      const k = node.polyDegree;
      const nextDegree = k + 1;
      node.polyDegree = nextDegree;
      const cNum = node.cIndex || 1;

      const factorials = [1, 1, 2, 6, 24, 120, 720, 5040];
      const prevDenom = factorials[k] || 1;
      const nextDenom = factorials[nextDegree] || (prevDenom * nextDegree);

      const prevSymbol = k === 0 ? `C_${cNum}` : k === 1 ? `C_${cNum} x` : `\\frac{C_${cNum}}{${prevDenom}}x^${k}`;
      const nextSymbol = nextDegree === 1 ? `C_${cNum} x` : `\\frac{C_${cNum}}{${nextDenom}}x^${nextDegree}`;
      const nextName = nextDegree === 1 ? `C${cNum}x` : `C${cNum}x^${nextDegree}/${nextDenom}`;

      node.symbol = nextSymbol;
      node.name = nextName;
      node.radius = Math.min(9, 4.5 + nextDegree * 0.7);

      this.integralConstantCount++;
      const nextC = this.integralConstantCount;
      this.spawnConstantSphere(nextC);

      // Fire Polynomic Beam passing through the node
      this.laserIdCounter++;
      const curveType: 'LINEAR' | 'PARABOLA' | 'CUBIC' =
        nextDegree === 1 ? 'LINEAR' : nextDegree === 2 ? 'PARABOLA' : 'CUBIC';

      this.addLaser({
        id: `laser_${this.laserIdCounter}_poly_${node.id}`,
        ownerId: node.id,
        sourcePos: node.position.clone(),
        curveType,
        isTelegraph: false,
        telegraphTime: 0,
        durationRemaining: 0.9,
        damage: 4,
      });

      const formulaLatex = `\\int ${prevSymbol} dx = ${nextSymbol} + C_{${nextC}}`;
      this.eventBus.emit('MATH_FORMULA', {
        latex: formulaLatex,
        position: { x: collisionPos.x, y: collisionPos.y },
        color: '#F57C00',
      });
      return;
    }

    // 1. Resolve elastic physics bounce first
    ElasticSolver.resolveCollision(a, b);

    // If match is already decided, maintain physics bouncing only without additional damage
    if (this.status === 'VICTORY' || this.status === 'DEFEAT') {
      return;
    }

    const collisionPos = a.position.add(b.position).scale(0.5);
    this.eventBus.emit('COLLISION', {
      entityAId: a.id,
      entityBId: b.id,
      position: { x: collisionPos.x, y: collisionPos.y },
    });

    // 2. Identify Player (LEFT) and Enemy (RIGHT or SUB_ENTITY)
    const isPlayerA = a.team === 'LEFT';
    const isPlayerB = b.team === 'LEFT';

    // Same team collision (e.g. sub-entity hitting sub-entity) -> elastic bounce only, no damage
    if ((isPlayerA && isPlayerB) || (!isPlayerA && !isPlayerB)) {
      return;
    }

    const player = isPlayerA ? a : b;
    const enemy = isPlayerA ? b : a;

    // Requirement 2: While blinking / invulnerable, child spheres are immune to player hits
    // (no damage to anyone, no message displayed, just normal elastic physics bouncing)
    if (enemy.isInvulnerable() || player.isInvulnerable()) {
      return;
    }

    // Interrupt only the specific enemy's laser when player strikes it (not all enemy lasers)
    const hadEnemyLaser = this.activeLasers.some((l) => l.ownerId === enemy.id);
    if (hadEnemyLaser) {
      this.activeLasers = this.activeLasers.filter((l) => l.ownerId !== enemy.id);
      this.frozenOwnerIds.delete(enemy.id);
      this.recalcFrozenOwners();
    }

    // Handle Imaginary Unit phase intangible check
    const imagEntity = a.symbol === 'i' ? a : b.symbol === 'i' ? b : null;
    if (imagEntity && (imagEntity.currentPhaseIndex === 0 || imagEntity.currentPhaseIndex === 2)) {
      const target = imagEntity === player ? enemy : player;
      if (imagEntity.isReady()) {
        target.takeDamage(8);
        imagEntity.resetCooldown();
        this.eventBus.emit('DAMAGE_DEALT', {
          targetId: target.id,
          amount: 8,
          color: '#D81B60',
          position: { x: target.position.x, y: target.position.y },
        });
        this.eventBus.emit('MATH_FORMULA', {
          latex: 'i \\text{ pierce! (-8)}',
          position: { x: target.position.x, y: target.position.y },
          color: '#D81B60',
        });
      }
      return;
    }

    // 3. Level-specific collision rules
    // Level 1: d/dx vs Polynomial (x³, x², x, 1)
    // In Level 1, player (derivative) receives zero contact damage from polynomial spheres (only laser damage)
    if (this.level.id === 1 || player.id === 'ddx' || player.symbol === 'd/dx') {
      const polySymbols = ['x³', 'x²', 'x', '1'];
      if (polySymbols.includes(enemy.symbol)) {
        this.applyDerivativeToPoly(enemy, collisionPos);
        return;
      }
    }

    // Level 5: d/dx vs sin(x) — cyclic immortality & chain rule scaling
    // 0 HP damage to both entities. Contact transforms enemy's trig function.
    if (this.level.id === 5 && player.symbol === 'd/dx') {
      this.derivativeHitCount++;
      const currentPhase = enemy.trigPhase !== undefined ? enemy.trigPhase : (
        enemy.symbol.includes('-cos') ? 3 :
        enemy.symbol.includes('-sin') ? 2 :
        enemy.symbol.includes('cos') ? 1 : 0
      );
      const nextPhase = (currentPhase + 1) % 4;
      enemy.trigPhase = nextPhase;

      const b = enemy.frequency || 1;
      if (b > 1) {
        enemy.amplitude = (enemy.amplitude || 1) * b;
      }
      const A = enemy.amplitude || 1;

      const currentExpr = enemy.symbol;

      const newAmpStr = A > 1 ? `${A}` : '';
      const newSignStr = (nextPhase === 2 || nextPhase === 3) ? '-' : '';
      const newTrigStr = (nextPhase === 0 || nextPhase === 2) ? 'sin' : 'cos';
      const argStr = b > 1 ? `${b}x` : 'x';
      const nextExpr = `${newSignStr}${newAmpStr}${newTrigStr} ${argStr}`.trim();

      enemy.symbol = nextExpr;
      enemy.name = nextExpr;

      // Update color to reflect transformation
      if (nextPhase === 1) enemy.color = '#9C27B0';
      else if (nextPhase === 2) enemy.color = '#E91E63';
      else if (nextPhase === 3) enemy.color = '#FF5722';
      else enemy.color = '#7B1FA2';

      const formatLatex = (str: string) => str.replace(/sin/g, '\\sin ').replace(/cos/g, '\\cos ');
      const formulaLatex = `\\frac{d}{dx}(${formatLatex(currentExpr)}) = ${formatLatex(nextExpr)}`;

      this.eventBus.emit('MATH_FORMULA', {
        latex: formulaLatex,
        position: { x: collisionPos.x, y: collisionPos.y },
        color: '#00ACC1',
      });
      return; // 0 damage to both player and enemy!
    }

    // Level 2: d/dx vs e^x (Eigenfunction Immunity + Reflected Burn)
    if (this.level.id === 2 || (player.symbol === 'd/dx' && enemy.symbol === 'eˣ')) {
      if (enemy.isImmuneToDerivative || enemy.symbol === 'eˣ') {
        this.derivativeHitCount++;
        this.eventBus.emit('MATH_FORMULA', {
          latex: '\\frac{d}{dx}e^x = e^x \\text{ [Immune!]}',
          position: { x: enemy.position.x, y: enemy.position.y },
          color: '#D32F2F',
        });
        player.takeDamage(4);
        player.addStatus({
          type: 'BURN',
          durationRemaining: 4.0,
          tickDamage: 2,
          tickInterval: 1.0,
        });
        this.eventBus.emit('DAMAGE_DEALT', {
          targetId: player.id,
          amount: 4,
          color: '#D32F2F',
          position: { x: player.position.x, y: player.position.y },
        });
        return;
      }
    }

    // Level 3: Integral vs Sine / Cosine cycle
    if (player.symbol === '∫' && (enemy.symbol === 'sin x' || enemy.symbol === 'cos x' || enemy.symbol === '-cos x' || enemy.symbol === '-sin x')) {
      let nextSymbol = '-cos x';
      let formulaLatex = '\\int \\sin x dx = -\\cos x';
      if (enemy.symbol === 'sin x') {
        nextSymbol = '-cos x';
        formulaLatex = '\\int \\sin x dx = -\\cos x';
      } else if (enemy.symbol === '-cos x') {
        nextSymbol = '-sin x';
        formulaLatex = '\\int -\\cos x dx = -\\sin x';
      } else if (enemy.symbol === '-sin x') {
        nextSymbol = 'cos x';
        formulaLatex = '\\int -\\sin x dx = \\cos x';
      } else if (enemy.symbol === 'cos x') {
        nextSymbol = 'sin x';
        formulaLatex = '\\int \\cos x dx = \\sin x';
      }
      enemy.symbol = nextSymbol;
      enemy.takeDamage(14);
      this.eventBus.emit('DAMAGE_DEALT', {
        targetId: enemy.id,
        amount: 14,
        color: '#00ACC1',
        position: { x: enemy.position.x, y: enemy.position.y },
      });
      this.eventBus.emit('MATH_FORMULA', {
        latex: formulaLatex,
        position: { x: collisionPos.x, y: collisionPos.y },
        color: '#00ACC1',
      });
      return;
    }

    // Level 4: Partial derivative ∂/∂y vs e^x -> Instant One-Shot!
    if (this.level.id === 4 || player.symbol === '∂/∂y') {
      const oneShotDmg = enemy.maxHp || 80;
      enemy.takeDamage(oneShotDmg);
      this.eventBus.emit('MATH_FORMULA', {
        latex: '\\frac{\\partial}{\\partial y} e^x = 0',
        position: { x: collisionPos.x, y: collisionPos.y },
        color: '#00C853',
      });
      this.eventBus.emit('DAMAGE_DEALT', {
        targetId: enemy.id,
        amount: oneShotDmg,
        isCrit: true,
        color: '#00C853',
        position: { x: enemy.position.x, y: enemy.position.y },
      });
      return;
    }

    // Level 8 & 9: Pi orbital digit contact
    if (this.level.id === 8 || this.level.id === 9 || player.symbol === 'π' || enemy.symbol === 'π') {
      const piEntity = player.symbol === 'π' ? player : enemy;
      const target = piEntity === player ? enemy : player;
      const digit = this.piDigits[this.piCurrentDigitIndex % this.piDigits.length];
      this.piCurrentDigitIndex++;
      piEntity.activeDecimalIndex = this.piCurrentDigitIndex;
      target.takeDamage(digit);
      this.eventBus.emit('DAMAGE_DEALT', {
        targetId: target.id,
        amount: digit,
        color: '#1976D2',
        position: { x: target.position.x, y: target.position.y },
      });
      this.eventBus.emit('MATH_FORMULA', {
        latex: `\\pi \\text{ Digit: -}${digit}`,
        position: { x: collisionPos.x, y: collisionPos.y },
        color: '#1976D2',
      });
      return;
    }

    // Level 10: Dirac Delta spike
    if (player.symbol === 'δ(x)' || enemy.symbol === 'δ(x)') {
      const deltaEntity = player.symbol === 'δ(x)' ? player : enemy;
      const target = deltaEntity === player ? enemy : player;
      target.takeDamage(25);
      this.eventBus.emit('DAMAGE_DEALT', {
        targetId: target.id,
        amount: 25,
        isCrit: true,
        color: '#FFEA00',
        position: { x: target.position.x, y: target.position.y },
      });
      this.eventBus.emit('MATH_FORMULA', {
        latex: '\\int \\delta(x)f(x)dx = f(0)',
        position: { x: collisionPos.x, y: collisionPos.y },
        color: '#FFEA00',
      });
      return;
    }

    // 4. GENERAL OPPOSING COLLISION DAMAGE FOR ALL LEVELS (Solves issue 2 & 5)
    // Calculate damage based on relative collision velocity
    const relSpeed = a.velocity.sub(b.velocity).magnitude();
    const baseDamage = Math.max(8, Math.min(22, Math.round(relSpeed * 0.35)));

    // Enemy takes full contact damage
    enemy.takeDamage(baseDamage);
    this.eventBus.emit('DAMAGE_DEALT', {
      targetId: enemy.id,
      amount: baseDamage,
      color: '#00ACC1',
      position: { x: enemy.position.x, y: enemy.position.y },
    });

    // Player takes minor recoil damage (30% of base)
    const recoilDamage = Math.max(2, Math.round(baseDamage * 0.3));
    player.takeDamage(recoilDamage);
    this.eventBus.emit('DAMAGE_DEALT', {
      targetId: player.id,
      amount: recoilDamage,
      color: '#FF5722',
      position: { x: player.position.x, y: player.position.y },
    });

    this.eventBus.emit('MATH_FORMULA', {
      latex: `\\Delta p = ${baseDamage}`,
      position: { x: collisionPos.x, y: collisionPos.y },
      color: '#00ACC1',
    });
  }

  private applyDerivativeToPoly(sphere: BaseEntity, collisionPos?: Vector2D): void {
    const pos = collisionPos || sphere.position;
    this.derivativeHitCount++;
    if (this.polyGlobalHp) {
      this.polyGlobalHp.current = Math.max(0, this.polyGlobalHp.current - 1);
      this.rightEntity.hp = this.polyGlobalHp.current;
    }

    // Calculate repulsion direction away from the player / hit (Requirement 0.2)
    let blastDir = sphere.position.sub(this.leftEntity.position);
    if (blastDir.magnitude() < 0.1 && collisionPos) {
      blastDir = sphere.position.sub(collisionPos);
    }
    if (blastDir.magnitude() < 0.1) {
      blastDir = vec2(1, 0); // fallback towards right
    } else {
      blastDir = blastDir.normalize();
    }
    const baseAngle = Math.atan2(blastDir.y, blastDir.x);
    const blastSpeed = 28;

    this.eventBus.emit('DAMAGE_DEALT', {
      targetId: sphere.id,
      amount: 1,
      color: '#00ACC1',
      position: { x: pos.x, y: pos.y },
    });

    if (sphere.symbol === 'x³') {
      sphere.isDead = true;
      this.interruptLaser(sphere.id);
      this.eventBus.emit('MATH_FORMULA', {
        latex: '3x^2',
        position: { x: pos.x, y: pos.y },
        color: '#00ACC1',
      });
      // Spawn 3 spheres of x^2 flying away from player in a spread cone
      for (let k = 0; k < 3; k++) {
        const spreadAngle = baseAngle + (k - 1) * 0.45; // -26°, 0°, +26°
        const dir = vec2(Math.cos(spreadAngle), Math.sin(spreadAngle));
        const offset = dir.scale(6);
        const sub = new BaseEntity({
          id: `poly_x2_${Date.now()}_${k}_${Math.random()}`,
          name: 'x²',
          symbol: 'x²',
          team: 'SUB_ENTITY',
          color: '#FB8C00',
          bgColor: '#FFE0B2',
          hp: 1,
          maxHp: 1,
          radius: 6,
          mass: 1.0,
          position: sphere.position.add(offset),
          velocity: dir.scale(blastSpeed + (k === 1 ? 4 : 0)),
        });
        sub.invulnerabilityTimer = 3.0; // 3 seconds invulnerability & blinking
        this.subEntities.push(sub);
      }
    } else if (sphere.symbol === 'x²') {
      sphere.isDead = true;
      this.interruptLaser(sphere.id);
      this.eventBus.emit('MATH_FORMULA', {
        latex: '2x',
        position: { x: pos.x, y: pos.y },
        color: '#00ACC1',
      });
      // Spawn 2 spheres of x flying away from player
      for (let k = 0; k < 2; k++) {
        const spreadAngle = baseAngle + (k === 0 ? -0.35 : 0.35);
        const dir = vec2(Math.cos(spreadAngle), Math.sin(spreadAngle));
        const offset = dir.scale(5);
        const sub = new BaseEntity({
          id: `poly_x_${Date.now()}_${k}_${Math.random()}`,
          name: 'x',
          symbol: 'x',
          team: 'SUB_ENTITY',
          color: '#FFA726',
          bgColor: '#FFF3E0',
          hp: 1,
          maxHp: 1,
          radius: 4.8,
          mass: 0.8,
          position: sphere.position.add(offset),
          velocity: dir.scale(blastSpeed * 1.1),
        });
        sub.invulnerabilityTimer = 3.0; // 3 seconds invulnerability & blinking
        this.subEntities.push(sub);
      }
    } else if (sphere.symbol === 'x') {
      this.interruptLaser(sphere.id);
      sphere.symbol = '1';
      sphere.name = '1';
      sphere.radius = 3.6;
      sphere.color = '#FFD54F';
      sphere.invulnerabilityTimer = 3.0; // 3 seconds invulnerability & blinking
      // Push the transformed sphere 1 away from player
      sphere.velocity = blastDir.scale(blastSpeed);
      this.eventBus.emit('MATH_FORMULA', {
        latex: '1',
        position: { x: pos.x, y: pos.y },
        color: '#00ACC1',
      });
    } else if (sphere.symbol === '1') {
      sphere.isDead = true;
      this.interruptLaser(sphere.id);
      this.eventBus.emit('MATH_FORMULA', {
        latex: '0',
        position: { x: pos.x, y: pos.y },
        color: '#00ACC1',
      });
    }

    // Clean up dead sub-entities
    this.subEntities = this.subEntities.filter((e) => !e.isDead);
  }

  private spawnConstantSphere(index: number, forcedPos?: Vector2D): BaseEntity {
    let pos = forcedPos;
    if (!pos) {
      // Find a safe spot with ample clearance from both Player (>= 22 units) and Enemy (>= 20 units)
      let bestPos = vec2((Math.random() - 0.5) * 60, (Math.random() - 0.5) * 50);
      let bestDist = 0;

      for (let attempts = 0; attempts < 35; attempts++) {
        const candidate = vec2((Math.random() - 0.5) * 60, (Math.random() - 0.5) * 50);
        const distPlayer = candidate.distanceTo(this.leftEntity.position);
        const distEnemy = candidate.distanceTo(this.rightEntity.position);
        const minDist = Math.min(distPlayer, distEnemy);

        // Check distance to existing sub-entities so they don't pile directly on each other
        const distToNodes = this.subEntities.length > 0
          ? Math.min(...this.subEntities.map((s) => candidate.distanceTo(s.position)))
          : 999;

        if (distPlayer >= 22 && distEnemy >= 20 && distToNodes >= 8) {
          bestPos = candidate;
          break;
        }

        if (minDist > bestDist) {
          bestDist = minDist;
          bestPos = candidate;
        }
      }
      pos = bestPos;
    }

    const angle = Math.random() * Math.PI * 2;
    const speed = 18 + Math.random() * 6; // initial drift speed 18-24
    const initialVel = vec2(Math.cos(angle) * speed, Math.sin(angle) * speed);

    const sub = new BaseEntity({
      id: `const_C_${index}_${Date.now()}_${Math.random()}`,
      name: `C${index}`,
      symbol: `C_${index}`,
      team: 'SUB_ENTITY',
      color: '#F57C00',
      bgColor: '#FFE0B2',
      hp: 2,
      maxHp: 2,
      radius: 4.5,
      mass: 1.0,
      position: pos,
      velocity: initialVel,
    });
    sub.cIndex = index;
    sub.polyDegree = 0;
    this.subEntities.push(sub);
    return sub;
  }

  private updateLevelMechanics(dt: number): void {
    // Level 6: Integral whip rotation and contact cooldown
    if (this.level.id === 6) {
      this.integralWhipAngle = (this.integralWhipAngle + dt * 3.5) % (Math.PI * 2);
      if (this.level6ContactCooldown > 0) {
        this.level6ContactCooldown -= dt;
      }
    }

    // Level 3 & 9: Imaginary unit phase rotation
    if (this.level.id === 3 || this.level.id === 9) {
      const imag = this.level.id === 3
        ? this.rightEntity
        : (this.leftEntity.id === 'imag' || this.leftEntity.symbol.includes('i'))
        ? this.leftEntity
        : this.rightEntity;
      if (imag) {
        this.imaginaryPhaseTimer += dt;
        while (this.imaginaryPhaseTimer >= 3.0) {
          this.imaginaryPhaseTimer -= 3.0;
          imag.currentPhaseIndex = (imag.currentPhaseIndex + 1) % 4;
          const phases = ['i (관통)', '-1 (반사)', '-i (관통+반사)', '1 (일반)'];
          const symbols = ['i', '-1', '-i', '1'];
          const latexPhases = ['i \\times i = -1', '-1 \\times i = -i', '-i \\times i = 1', '1 \\times i = i'];
          if (this.level.id === 3) {
            imag.symbol = symbols[imag.currentPhaseIndex];
            imag.name = symbols[imag.currentPhaseIndex];
          }
          this.eventBus.emit('MATH_FORMULA', {
            latex: latexPhases[imag.currentPhaseIndex],
            position: { x: imag.position.x, y: imag.position.y },
            color: '#D81B60',
          });
          imag.tag = phases[imag.currentPhaseIndex];
        }
      }
    }
  }

  private updateLasers(dt: number): void {
    for (let i = this.activeLasers.length - 1; i >= 0; i--) {
      const laser = this.activeLasers[i];
      if (laser.isTelegraph) {
        laser.telegraphTime -= dt;
        if (this.level.id === 3 && laser.ownerId === this.leftEntity.id) {
          laser.sourcePos = this.leftEntity.position.clone();
        }
        if ((this.level.id === 4 || this.level.id === 6) && laser.ownerId === this.rightEntity.id) {
          laser.sourcePos = this.rightEntity.position.clone();
        }
        if (laser.telegraphTime <= 0) {
          laser.isTelegraph = false; // Becomes active damaging beam
          this.eventBus.emit('LASER_FIRED', {
            laserId: laser.id,
            ownerId: laser.ownerId,
            curveType: laser.curveType,
          });
        }
      } else {
        laser.durationRemaining -= dt;

        // Advance moving projectile waves (Level 5 directional wave)
        if (laser.velocity) {
          laser.sourcePos = laser.sourcePos.add(laser.velocity.scale(dt));

          // Boundary check: wave collides with arena perimeter walls and dissolves
          const bounds = this.level.arenaBounds;
          if (
            laser.sourcePos.x <= bounds.minX ||
            laser.sourcePos.x >= bounds.maxX ||
            laser.sourcePos.y <= bounds.minY ||
            laser.sourcePos.y >= bounds.maxY
          ) {
            laser.durationRemaining = 0;
            this.eventBus.emit('MATH_FORMULA', {
              latex: '\\sim \\text{[Disipación]}',
              position: { x: laser.sourcePos.x, y: laser.sourcePos.y },
              color: laser.curveType === 'SINE' ? '#3F51B5' : '#D500F9',
            });
          }
        }

        // Damage detection against opposing entities
        const isPlayerLaser = laser.ownerId === this.leftEntity.id || (this.level.id === 6 && this.subEntities.some((s) => s.id === laser.ownerId));
        const targets = isPlayerLaser
          ? (!this.rightEntity.isDead ? [this.rightEntity] : [])
          : [
              ...(!this.leftEntity.isDead ? [this.leftEntity] : []),
              ...(this.level.id === 6 ? this.subEntities.filter((s) => !s.isDead) : []),
            ];

        for (const target of targets) {
          if (target.isInvulnerable() && !(this.level.id === 6 && target.team === 'SUB_ENTITY')) {
            continue;
          }
          if (!laser.hitEntityIds) {
            laser.hitEntityIds = [];
          }
          if (laser.hitEntityIds.includes(target.id)) {
            continue; // Already hit this target in this blast
          }

          let hit = false;
          if (laser.curveType === 'EXPONENTIAL') {
            hit = Curves.intersectsExponential(target.position, target.radius, laser.sourcePos, -50, 50, 0.15);
          } else if (laser.curveType === 'SECTOR') {
            hit = Curves.isInsideSector(
              target.position,
              laser.sourcePos,
              35,
              laser.angle || 0,
              laser.sectorSpan || Math.PI / 3
            );
          } else if (laser.curveType === 'CUBIC') {
            hit = Curves.intersectsCubic(target.position, target.radius, laser.sourcePos, -50, 50);
          } else if (laser.curveType === 'PARABOLA') {
            hit = Curves.intersectsParabola(target.position, target.radius, laser.sourcePos, -50, 50);
          } else if (laser.curveType === 'LINEAR') {
            hit = Curves.intersectsDiagonalLine(target.position, target.radius, laser.sourcePos, -50, 50);
          } else if (laser.curveType === 'HORIZONTAL') {
            hit = Curves.intersectsHorizontalLine(target.position, target.radius, laser.sourcePos.y, -50, 50);
          } else if (laser.curveType === 'SINE' || laser.curveType === 'COSINE') {
            if (laser.velocity) {
              const speed = laser.velocity.magnitude();
              if (speed > 0.001) {
                const dir = laser.velocity.scale(1 / speed);
                const halfLen = 12.0;
                const front = laser.sourcePos.add(dir.scale(halfLen));
                const back = laser.sourcePos.sub(dir.scale(halfLen));
                const seg = front.sub(back);
                const segLenSq = 24.0 * 24.0;
                const v = target.position.sub(back);
                const proj = (v.x * seg.x + v.y * seg.y) / segLenSq;
                const tClamped = Math.max(0, Math.min(1, proj));
                const closestPoint = back.add(seg.scale(tClamped));
                const distToAxis = target.position.distanceTo(closestPoint);

                const normS = (tClamped - 0.5) * 2;
                const envelope = Math.max(0, 1 - normS * normS);
                const effectiveAmp = Math.abs(laser.amplitude || 1) * 3.5 * envelope;
                const hitRadius = target.radius + Math.max(2.0, effectiveAmp);

                hit = distToAxis <= hitRadius;
              } else {
                hit = target.position.distanceTo(laser.sourcePos) <= target.radius + Math.abs(laser.amplitude || 1) * 3.5 + 2.0;
              }
            } else {
              hit = laser.curveType === 'SINE'
                ? Curves.intersectsSine(target.position, target.radius, laser.sourcePos, -50, 50)
                : Curves.intersectsCosine(target.position, target.radius, laser.sourcePos, -50, 50);
            }
          }

          if (hit) {
            laser.hitEntityIds.push(target.id);

            // Level 3 specific laser damage & reflection rules
            if (this.level.id === 3) {
              const normX = Math.max(0, Math.min(1, (target.position.x + 35) / 70));
              const rawDamage = Math.round(4 + 17 * normX);

              const isReflecting = target.currentPhaseIndex === 1 || target.currentPhaseIndex === 2; // [-1] or [-i]
              if (isReflecting) {
                // 100% of damage reflected back to player
                this.leftEntity.takeDamage(rawDamage);
                this.eventBus.emit('DAMAGE_DEALT', {
                  targetId: this.leftEntity.id,
                  amount: rawDamage,
                  color: '#D81B60',
                  position: { x: this.leftEntity.position.x, y: this.leftEntity.position.y },
                });
                this.eventBus.emit('MATH_FORMULA', {
                  latex: `\\times(-1) \\text{ Reflejado! (-}${rawDamage})`,
                  position: { x: target.position.x, y: target.position.y },
                  color: '#D81B60',
                });
              } else {
                // Normal hit on enemy [i] or [1]
                target.takeDamage(rawDamage);
                this.eventBus.emit('DAMAGE_DEALT', {
                  targetId: target.id,
                  amount: rawDamage,
                  color: '#D32F2F',
                  position: { x: target.position.x, y: target.position.y },
                });
                this.eventBus.emit('MATH_FORMULA', {
                  latex: `e^x \\text{ (-}${rawDamage})`,
                  position: { x: target.position.x, y: target.position.y },
                  color: '#D32F2F',
                });

                // Apply Quemadura if impact is in flat/low section near asymptote (target.position.x <= 0)
                if (target.position.x <= 0) {
                  target.addStatus({
                    type: 'BURN',
                    durationRemaining: 3.0,
                    tickInterval: 0.5,
                    tickDamage: 2,
                  });
                  this.eventBus.emit('MATH_FORMULA', {
                    latex: '\\text{Quemadura! (DoT)}',
                    position: { x: target.position.x, y: target.position.y - 6 },
                    color: '#FF5722',
                  });
                }
              }
              continue;
            }

            // Level 6 node damage from e^x Exponential Blade
            if (this.level.id === 6 && target.team === 'SUB_ENTITY') {
              // If node was firing a ray, interrupt and stop the ray ("ahi el rayo debe detenerse")
              const hadActiveLaser = this.activeLasers.some((l) => l.ownerId === target.id);
              if (hadActiveLaser) {
                this.activeLasers = this.activeLasers.filter((l) => l.ownerId !== target.id);
                this.frozenOwnerIds.delete(target.id);
                this.recalcFrozenOwners();
              }

              target.hp = Math.max(0, target.hp - 1);
              this.eventBus.emit('DAMAGE_DEALT', {
                targetId: target.id,
                amount: 1,
                color: '#D32F2F',
                position: { x: target.position.x, y: target.position.y },
              });
              if (target.hp <= 0) {
                target.isDead = true;
                this.eventBus.emit('MATH_FORMULA', {
                  latex: '\\dots',
                  position: { x: target.position.x, y: target.position.y },
                  color: '#F57C00',
                });
              } else {
                // Node was sliced but survived: ensure it keeps advancing ("la esfera debe seguir avanzando")
                if (target.velocity.magnitude() < 12) {
                  const angle = Math.random() * Math.PI * 2;
                  target.velocity = vec2(Math.cos(angle) * 20, Math.sin(angle) * 20);
                }
              }
              continue;
            }

            // Level 4 & 6 specific laser damage rules (e^x Exponential Blade vs player)
            if ((this.level.id === 4 || this.level.id === 6) && target.id === this.leftEntity.id) {
              const rawDamage = 4; // Flat cut impact damage per rules

              // 1. Instant impact damage (-4 HP)
              target.takeDamage(rawDamage);
              this.eventBus.emit('DAMAGE_DEALT', {
                targetId: target.id,
                amount: rawDamage,
                color: '#D32F2F',
                position: { x: target.position.x, y: target.position.y },
              });
              this.eventBus.emit('MATH_FORMULA', {
                latex: `e^x \\text{ (-}${rawDamage})`,
                position: { x: target.position.x, y: target.position.y },
                color: '#D32F2F',
              });

              // 2. Immediate first tick of Quemadura (-2 HP) on same frame!
              target.takeDamage(2);
              this.eventBus.emit('DAMAGE_DEALT', {
                targetId: target.id,
                amount: 2,
                color: '#FF5722',
                position: { x: target.position.x, y: target.position.y },
              });
              this.eventBus.emit('MATH_FORMULA', {
                latex: '\\text{Quemadura! (-2)}',
                position: { x: target.position.x, y: target.position.y - 6 },
                color: '#FF5722',
              });

              // 3. Subsequent 4 ticks of Quemadura: -2 HP every 0.75s (total 3.05s)
              target.addStatus({
                type: 'BURN',
                durationRemaining: 3.05,
                tickInterval: 0.75,
                tickDamage: 2,
                tickTimer: 0,
              });

              continue;
            }

            // Level 5 specific wave projectile damage vs player
            if (this.level.id === 5 && target.id === this.leftEntity.id) {
              target.takeDamage(laser.damage);
              this.eventBus.emit('DAMAGE_DEALT', {
                targetId: target.id,
                amount: laser.damage,
                color: '#D32F2F',
                position: { x: target.position.x, y: target.position.y },
              });
              this.eventBus.emit('MATH_FORMULA', {
                latex: `${laser.curveType === 'COSINE' ? '\\cos x' : '\\sin x'} \\text{ (-${laser.damage})}`,
                position: { x: target.position.x, y: target.position.y },
                color: '#D32F2F',
              });
              continue;
            }

            // Check reflection if target has REFLECT status or is 'i' in phase -1
            if (target.symbol === 'i' && (target.currentPhaseIndex === 1 || target.currentPhaseIndex === 2)) {
              // Reflect damage back to owner
              const owner = laser.ownerId === this.leftEntity.id ? this.leftEntity : this.rightEntity;
              owner.takeDamage(laser.damage);
              this.eventBus.emit('DAMAGE_DEALT', {
                targetId: owner.id,
                amount: laser.damage,
                color: '#D81B60',
                position: { x: owner.position.x, y: owner.position.y },
              });
              this.eventBus.emit('MATH_FORMULA', {
                latex: `\\times(-1) \\text{ Reflect! (-}${laser.damage})`,
                position: { x: target.position.x, y: target.position.y },
                color: '#D81B60',
              });
            } else {
              // If player laser hits polynomial sphere in Level 1, trigger differentiation
              if (isPlayerLaser && this.level.id === 1 && ['x³', 'x²', 'x', '1'].includes(target.symbol)) {
                this.applyDerivativeToPoly(target, target.position);
              } else {
                target.takeDamage(laser.damage);
                this.eventBus.emit('DAMAGE_DEALT', {
                  targetId: target.id,
                  amount: laser.damage,
                  color: isPlayerLaser ? '#00ACC1' : '#FF7043',
                  position: { x: target.position.x, y: target.position.y },
                });
              }
            }
          }
        }

        if (laser.durationRemaining <= 0) {
          this.activeLasers.splice(i, 1);
        }
      }
    }

    if (this.level.id === 6) {
      this.subEntities = this.subEntities.filter((e) => !e.isDead);
    }

    // Recalculate which entities are frozen based on remaining active lasers
    this.recalcFrozenOwners();
  }

  private updateOrbs(dt: number): void {
    if (this.level.id === 5) {
      this.level5MatchTime += dt;
      if (this.level5MatchTime >= 8.0 && !this.level5SpawnedB2) {
        this.level5SpawnedB2 = true;
        this.orbs.push({
          id: 'orb_b2',
          type: 'FREQUENCY_X2',
          position: vec2(-28, -14),
          radius: 4,
        });
      }
      if (this.level5MatchTime >= 14.0 && !this.level5SpawnedA2) {
        this.level5SpawnedA2 = true;
        this.orbs.push({
          id: 'orb_a2',
          type: 'AMPLITUDE_X2',
          position: vec2(18, 11),
          radius: 4,
        });
      }
    } else {
      this.orbSpawnTimer -= dt;
      if (this.orbSpawnTimer <= 0) {
        this.orbSpawnTimer = 6.0;
        if (this.orbs.length < 3) {
          const type = Math.random() > 0.5 ? 'AMPLITUDE_X2' : 'FREQUENCY_X2';
          this.orbs.push({
            id: `orb_${Date.now()}`,
            type,
            position: vec2((Math.random() - 0.5) * 60, (Math.random() - 0.5) * 100),
            radius: 4,
          });
        }
      }
    }

    // Check entity collection of orbs - in Level 5, orbs are intangible to player (d/dx)
    const collectors = this.level.id === 5 ? [this.rightEntity] : [this.leftEntity, this.rightEntity];
    for (let o = this.orbs.length - 1; o >= 0; o--) {
      const orb = this.orbs[o];
      for (const entity of collectors) {
        if (entity.position.distanceTo(orb.position) <= entity.radius + orb.radius) {
          if (orb.type === 'AMPLITUDE_X2') {
            entity.amplitude = Math.min(16, entity.amplitude * 2);
            this.eventBus.emit('MATH_FORMULA', {
              latex: `a \\times 2 = ${entity.amplitude} \\text{ [Amp x2]}`,
              position: { x: entity.position.x, y: entity.position.y },
              color: '#FFD54F',
            });
          } else {
            entity.frequency = 2;
            if (this.level.id === 5) {
              if (!entity.symbol.includes('2x')) {
                entity.symbol = entity.symbol.replace('x', '2x');
                entity.name = entity.symbol;
              }
              this.eventBus.emit('MATH_FORMULA', {
                latex: `\\text{¡Mejora de período! } y = ${entity.symbol}`,
                position: { x: entity.position.x, y: entity.position.y },
                color: '#FFD54F',
              });
            } else {
              entity.frequency = Math.min(16, entity.frequency * 2);
              entity.cooldownMax = Math.max(0.39, (2 * Math.PI) / entity.frequency);
              this.eventBus.emit('MATH_FORMULA', {
                latex: `b \\times 2 = ${entity.frequency} \\text{ [Freq x2]}`,
                position: { x: entity.position.x, y: entity.position.y },
                color: '#FFD54F',
              });
            }
          }
          this.eventBus.emit('ORB_COLLECTED', { entityId: entity.id, orbType: orb.type });
          this.orbs.splice(o, 1);
          break;
        }
      }
    }
  }

  private addLaser(laser: ActiveLaser): void {
    this.activeLasers.push(laser);
    if (this.level.id !== 3 && this.level.id !== 4 && this.level.id !== 5 && this.level.id !== 6) {
      this.frozenOwnerIds.add(laser.ownerId);
    }
    // In Level 6, constant nodes freeze when firing their polynomial beam!
    if (this.level.id === 6 && this.subEntities.some((s) => s.id === laser.ownerId)) {
      this.frozenOwnerIds.add(laser.ownerId);
    }
    if (!laser.isTelegraph) {
      this.eventBus.emit('LASER_FIRED', {
        laserId: laser.id,
        ownerId: laser.ownerId,
        curveType: laser.curveType,
      });
    }
  }

  private updateAI(dt: number): void {
    // Enemy automated attack every 3 seconds
    this.enemyShootTimer -= dt;
    if (this.enemyShootTimer <= 0) {
      this.enemyShootTimer = 3.0;
      this.triggerEnemyAttack();
    }
  }

  private triggerEnemyAttack(): void {
    if (this.level.id === 3 || this.level.id === 4 || this.level.id === 5 || this.level.id === 6) {
      // In Level 3, 4, 5 & 6, custom mechanics handle enemy attacks
      return;
    }

    if (!this.rightEntity.isDead) {
      this.rightEntity.cooldownRemaining = 0;
      this.triggerSkill('RIGHT');
      return;
    }

    // If main right entity is dead (e.g. polynomial split into x^2 balls), active sub-entities fire
    const activeSub = this.subEntities.filter((s) => !s.isDead);
    if (activeSub.length > 0) {
      this.laserIdCounter++;
      for (const sub of activeSub) {
        const curve = sub.symbol === 'x²' ? 'PARABOLA' : sub.symbol === 'x' ? 'LINEAR' : 'HORIZONTAL';
        this.addLaser({
          id: `laser_${this.laserIdCounter}_${sub.id}`,
          ownerId: sub.id,
          sourcePos: sub.position.clone(),
          curveType: curve,
          isTelegraph: true,
          telegraphTime: 0.8,
          durationRemaining: 1.2,
          damage: sub.symbol === 'x²' ? 23 : 18,
        });
      }
      this.eventBus.emit('SKILL_ACTIVATED', { entityId: activeSub[0].id, skillName: 'Polynomial Barrage!' });
    }
  }

  /**
   * Player or AI manual trigger for special skills
   */
  triggerSkill(team: 'LEFT' | 'RIGHT'): boolean {
    if ((this.level.id === 4 || this.level.id === 5) && team === 'LEFT') {
      return false; // Player has no ranged attacks or skills in Level 4 and Level 5
    }
    const entity = team === 'LEFT' ? this.leftEntity : this.rightEntity;
    if (entity.isDead || !entity.isReady()) return false;

    entity.resetCooldown();
    this.laserIdCounter++;

    // 1. Differential Operator d/dx (Player skill)
    if (entity.symbol === 'd/dx') {
      this.eventBus.emit('SKILL_ACTIVATED', { entityId: entity.id, skillName: "d/dx Tangent Slash!" });
      this.addLaser({
        id: `laser_${this.laserIdCounter}`,
        ownerId: entity.id,
        sourcePos: entity.position.clone(),
        curveType: 'LINEAR',
        isTelegraph: false,
        telegraphTime: 0,
        durationRemaining: 0.8,
        damage: 25,
      });
      this.eventBus.emit('MATH_FORMULA', {
        latex: '\\text{Tangent Slash! } f\'(x)',
        position: { x: entity.position.x, y: entity.position.y },
        color: '#00ACC1',
      });
      return true;
    }

    // 2. Partial Derivative ∂/∂y
    if (entity.symbol === '∂/∂y') {
      this.eventBus.emit('SKILL_ACTIVATED', { entityId: entity.id, skillName: "∂/∂y Multivariable Slice!" });
      this.addLaser({
        id: `laser_${this.laserIdCounter}`,
        ownerId: entity.id,
        sourcePos: entity.position.clone(),
        curveType: 'HORIZONTAL',
        isTelegraph: false,
        telegraphTime: 0,
        durationRemaining: 0.8,
        damage: 30,
      });
      this.eventBus.emit('MATH_FORMULA', {
        latex: '\\frac{\\partial}{\\partial y} \\text{ Slice!}',
        position: { x: entity.position.x, y: entity.position.y },
        color: '#00C853',
      });
      return true;
    }

    // 3. Integral Operator ∫
    if (entity.symbol === '∫') {
      this.eventBus.emit('SKILL_ACTIVATED', { entityId: entity.id, skillName: '∫ Whip!' });
      this.addLaser({
        id: `laser_${this.laserIdCounter}`,
        ownerId: entity.id,
        sourcePos: entity.position.clone(),
        curveType: 'LINEAR',
        isTelegraph: false,
        telegraphTime: 0,
        durationRemaining: 0.6,
        damage: 22,
      });
      for (const sub of this.subEntities) {
        if (!sub.isDead) {
          const curve = sub.polyDegree === 0 ? 'HORIZONTAL' : sub.polyDegree === 1 ? 'LINEAR' : sub.polyDegree === 2 ? 'PARABOLA' : 'CUBIC';
          this.addLaser({
            id: `laser_${this.laserIdCounter}_${sub.id}`,
            ownerId: sub.id,
            sourcePos: sub.position.clone(),
            curveType: curve,
            isTelegraph: false,
            telegraphTime: 0,
            durationRemaining: 0.6,
            damage: 10 + sub.polyDegree * 4,
          });
        }
      }
      this.eventBus.emit('MATH_FORMULA', {
        latex: '\\int f(x)dx \\text{ Whip Burst}',
        position: { x: entity.position.x, y: entity.position.y },
        color: '#F57C00',
      });
      return true;
    }

    // 4. Transcendental Pi π
    if (entity.symbol === 'π') {
      this.eventBus.emit('SKILL_ACTIVATED', { entityId: entity.id, skillName: 'π Sector Slice!' });
      this.addLaser({
        id: `laser_${this.laserIdCounter}`,
        ownerId: entity.id,
        sourcePos: entity.position.clone(),
        curveType: 'SECTOR',
        isTelegraph: false,
        telegraphTime: 0,
        durationRemaining: 0.8,
        damage: 22,
        sectorSpan: entity.sectorAngle || Math.PI / 3,
      });
      entity.sectorAngle = (entity.sectorAngle || Math.PI / 3) >= Math.PI * 2 ? Math.PI / 6 : (entity.sectorAngle || Math.PI / 3) * 1.5;
      return true;
    }

    // 5. Exponential e^x
    if (entity.symbol === 'eˣ' || entity.symbol === 'eˣʸ') {
      this.eventBus.emit('SKILL_ACTIVATED', { entityId: entity.id, skillName: 'Exponential Blade!' });
      this.addLaser({
        id: `laser_${this.laserIdCounter}`,
        ownerId: entity.id,
        sourcePos: entity.position.clone(),
        curveType: 'EXPONENTIAL',
        isTelegraph: false,
        telegraphTime: 0,
        durationRemaining: 0.7,
        damage: 18,
      });
      return true;
    }

    // 6. Sine / Cosine Wave
    if (entity.symbol.includes('sin') || entity.symbol.includes('cos')) {
      const isCos = entity.symbol.includes('cos');
      const skillName = isCos ? '¡Onda Coseno!' : '¡Onda Seno!';
      this.eventBus.emit('SKILL_ACTIVATED', { entityId: entity.id, skillName });

      const target = entity.id === this.leftEntity.id ? this.rightEntity : this.leftEntity;
      let dir = target.position.sub(entity.position);
      if (dir.magnitude() > 0.001) {
        dir = dir.normalize();
      } else {
        dir = entity.team === 'LEFT' ? vec2(1, 0) : vec2(-1, 0);
      }
      const speed = 40;
      const amp = Math.abs(entity.amplitude || 1);
      const freq = entity.frequency || 1;
      this.laserIdCounter++;

      this.addLaser({
        id: `laser_${this.laserIdCounter}`,
        ownerId: entity.id,
        sourcePos: entity.position.clone(),
        curveType: isCos ? 'COSINE' : 'SINE',
        isTelegraph: false,
        telegraphTime: 0,
        durationRemaining: 5.0,
        damage: 25,
        velocity: dir.scale(speed),
        angle: Math.atan2(dir.y, dir.x),
        amplitude: amp,
        frequency: freq,
      });
      return true;
    }

    // 7. Polynomial Team Invocations
    if (entity.symbol === 'x³' || (entity.team === 'RIGHT' && this.level.id === 1)) {
      this.eventBus.emit('SKILL_ACTIVATED', { entityId: entity.id, skillName: 'Graph Invocation!' });
      this.addLaser({
        id: `laser_${this.laserIdCounter}`,
        ownerId: entity.id,
        sourcePos: entity.position.clone(),
        curveType: 'CUBIC',
        isTelegraph: true,
        telegraphTime: 0.8,
        durationRemaining: 1.2,
        damage: 23,
      });
      for (const sub of this.subEntities) {
        this.addLaser({
          id: `laser_${this.laserIdCounter}_${sub.id}`,
          ownerId: sub.id,
          sourcePos: sub.position.clone(),
          curveType: sub.symbol === 'x²' ? 'PARABOLA' : sub.symbol === 'x' ? 'LINEAR' : 'HORIZONTAL',
          isTelegraph: true,
          telegraphTime: 0.8,
          durationRemaining: 1.2,
          damage: sub.symbol === 'x²' ? 23 : 18,
        });
      }
      return true;
    }

    // 8. General fallback skill
    this.eventBus.emit('SKILL_ACTIVATED', { entityId: entity.id, skillName: `${entity.symbol} Pulse!` });
    this.addLaser({
      id: `laser_${this.laserIdCounter}`,
      ownerId: entity.id,
      sourcePos: entity.position.clone(),
      curveType: 'LINEAR',
      isTelegraph: false,
      telegraphTime: 0,
      durationRemaining: 0.6,
      damage: 20,
    });
    return true;
  }

  /**
   * Apply user micro-impulse (e.g. mouse drag or touch)
   */
  applyImpulse(team: 'LEFT' | 'RIGHT', direction: Vector2D, strength = 20): void {
    const entity = team === 'LEFT' ? this.leftEntity : this.rightEntity;
    if (entity.isDead) return;

    const norm = direction.normalize();
    const maxSpeed = 40;
    const newVel = entity.velocity.add(norm.scale(strength));
    if (newVel.magnitude() > maxSpeed) {
      entity.velocity = newVel.normalize().scale(maxSpeed);
    } else {
      entity.velocity = newVel;
    }
  }

  private checkMatchEnd(): void {
    if (this.status !== 'COMBAT') return;

    // If the match has a global polynomial HP pool (e.g. Level 1)
    if (this.polyGlobalHp) {
      if (this.polyGlobalHp.current <= 0) {
        this.status = 'VICTORY';
        this.eventBus.emit('MATCH_OVER', {
          winner: 'LEFT',
          remainingHp: this.leftEntity.hp,
          symbol: this.leftEntity.symbol,
        });
        return;
      }
      if (this.leftEntity.isDead) {
        this.status = 'DEFEAT';
        this.eventBus.emit('MATCH_OVER', {
          winner: 'RIGHT',
          remainingHp: this.polyGlobalHp.current,
          symbol: 'x³',
        });
        return;
      }
      // Polynomial team still has HP in the pool and active spheres
      return;
    }

    // In Level 6, subEntities are player-generated constants (allies), NOT enemy minions!
    const livingRightSubEntities = this.level.id === 6
      ? []
      : this.subEntities.filter((e) => !e.isDead && e.team === 'SUB_ENTITY');

    if (this.leftEntity.isDead && (!this.rightEntity.isDead || livingRightSubEntities.length > 0)) {
      this.status = 'DEFEAT';
      this.eventBus.emit('MATCH_OVER', {
        winner: 'RIGHT',
        remainingHp: this.rightEntity.hp,
        symbol: this.rightEntity.symbol,
      });
    } else if (this.rightEntity.isDead && livingRightSubEntities.length === 0 && !this.leftEntity.isDead) {
      this.status = 'VICTORY';
      this.eventBus.emit('MATCH_OVER', {
        winner: 'LEFT',
        remainingHp: this.leftEntity.hp,
        symbol: this.leftEntity.symbol,
      });
    }
  }

  /**
   * Randomize initial ball trajectories on match start
   */
  randomizeEntityDirections(): void {
    const allEntities = [this.leftEntity, this.rightEntity, ...this.subEntities];
    for (const entity of allEntities) {
      const speed = entity.velocity.magnitude() || 25;
      const angle = Math.random() * Math.PI * 2;
      entity.velocity = vec2(Math.cos(angle) * speed, Math.sin(angle) * speed);
    }
  }

  /**
   * Check if a specific entity is frozen (it owns an active laser)
   */
  private isEntityFrozen(entity: BaseEntity): boolean {
    return this.frozenOwnerIds.has(entity.id);
  }

  /**
   * Interrupt and cancel any active laser owned by a specific entity
   */
  private interruptLaser(ownerId: string): void {
    const had = this.activeLasers.some((l) => l.ownerId === ownerId);
    if (had) {
      this.activeLasers = this.activeLasers.filter((l) => l.ownerId !== ownerId);
      this.frozenOwnerIds.delete(ownerId);
      this.recalcFrozenOwners();
    }
  }

  /**
   * Recalculate the frozenOwnerIds set from the current active lasers
   */
  private recalcFrozenOwners(): void {
    this.frozenOwnerIds.clear();
    for (const laser of this.activeLasers) {
      if (this.level.id !== 3 && this.level.id !== 4 && this.level.id !== 5 && this.level.id !== 6) {
        this.frozenOwnerIds.add(laser.ownerId);
      }
      // In Level 6, constant nodes freeze when firing their polynomial beam!
      if (this.level.id === 6 && this.subEntities.some((s) => s.id === laser.ownerId)) {
        this.frozenOwnerIds.add(laser.ownerId);
      }
    }
  }
}
