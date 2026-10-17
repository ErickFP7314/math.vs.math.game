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
  integralConstantCount = 0;
  piDigits = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5, 8, 9, 7, 9];
  piCurrentDigitIndex = 0;
  imaginaryPhaseTimer = 0;

  eventBus: EventBus;
  laserIdCounter = 0;
  orbSpawnTimer = 5.0;

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

    if (level.id === 2 || level.id === 4 || level.id === 5) {
      // Exponential is immune to d/dx in level 2
      if (level.id === 2) {
        this.rightEntity.isImmuneToDerivative = true;
      }
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
        this.eventBus.emit('MATCH_START', { levelId: this.level.id });
      }
      return;
    }

    if (this.status === 'COMBAT') {
      this.updateCombat(dt);
    }
  }

  private updateCombat(dt: number): void {
    const allEntities = [this.leftEntity, this.rightEntity, ...this.subEntities].filter(
      (e) => !e.isDead
    );

    // 1. Update cooldowns and status effects
    for (const entity of allEntities) {
      entity.updateCooldown(dt);
      this.updateEntityStatusEffects(entity, dt);

      // Move entity: p = p + v * dt
      entity.position = entity.position.add(entity.velocity.scale(dt));

      // Boundary bounce
      ElasticSolver.resolveBoundary(entity, this.level.arenaBounds);
    }

    // 2. Resolve entity-entity elastic collisions & math rules
    for (let i = 0; i < allEntities.length; i++) {
      for (let j = i + 1; j < allEntities.length; j++) {
        const a = allEntities[i];
        const b = allEntities[j];

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

    // 5. Update orbs (Level 7)
    if (this.level.id === 7) {
      this.updateOrbs(dt);
    }

    // 6. AI decision loop for the opponent (Right entity)
    this.updateAI(dt);

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
          entity.takeDamage(dmg);
          this.eventBus.emit('DAMAGE_DEALT', {
            targetId: entity.id,
            amount: dmg,
            color: '#D32F2F',
            position: { x: entity.position.x, y: entity.position.y },
          });
        }
      }

      if (effect.durationRemaining <= 0) {
        entity.statusEffects.splice(i, 1);
      }
    }
  }

  private handleMathCollision(a: BaseEntity, b: BaseEntity): void {
    // Determine which is left and which is right
    const left = a.team === 'LEFT' ? a : b.team === 'LEFT' ? b : null;
    const right = a.team === 'RIGHT' ? a : b.team === 'RIGHT' ? b : null;

    // Handle Imaginary Unit phase intangible check
    const imagEntity = a.symbol === 'i' ? a : b.symbol === 'i' ? b : null;
    if (imagEntity && (imagEntity.currentPhaseIndex === 0 || imagEntity.currentPhaseIndex === 2)) {
      // Phase i or -i: Intangible pierce! Deals -8 HP without physical bounce
      const target = imagEntity === a ? b : a;
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
          latex: 'i \\text{ 관통! (-8)}',
          position: { x: target.position.x, y: target.position.y },
        });
      }
      return; // No bounce
    }

    // Default: Elastic bounce between circles
    ElasticSolver.resolveCollision(a, b);

    const collisionPos = a.position.add(b.position).scale(0.5);
    this.eventBus.emit('COLLISION', {
      entityAId: a.id,
      entityBId: b.id,
      position: { x: collisionPos.x, y: collisionPos.y },
    });

    // Level-specific collision rules
    if (!left || !right) return;

    // Level 1: d/dx vs Polynomial
    if (this.level.id === 1) {
      if ((a.id === 'ddx' && b.team !== 'LEFT') || (b.id === 'ddx' && a.team !== 'LEFT')) {
        const polySphere = a.id === 'ddx' ? b : a;
        this.applyDerivativeToPoly(polySphere);
      }
    }

    // Level 2: d/dx vs e^x
    if (this.level.id === 2) {
      if ((a.id === 'ddx' && b.id === 'exp') || (b.id === 'ddx' && a.id === 'exp')) {
        // e^x is immune
        this.eventBus.emit('MATH_FORMULA', {
          latex: '\\frac{d}{dx}e^x = e^x \\text{ [면역!]}',
          position: { x: right.position.x, y: right.position.y },
          color: '#D32F2F',
        });
        // Burn operator d/dx
        left.takeDamage(4);
        left.addStatus({
          type: 'BURN',
          durationRemaining: 4.0,
          tickDamage: 2,
          tickInterval: 1.0,
        });
        this.eventBus.emit('DAMAGE_DEALT', {
          targetId: left.id,
          amount: 4,
          color: '#D32F2F',
          position: { x: left.position.x, y: left.position.y },
        });
      }
    }

    // Level 4: Partial derivative ∂/∂y vs e^x -> Instant One-Shot!
    if (this.level.id === 4) {
      if ((a.id === 'partial_y' && b.id === 'exp') || (b.id === 'partial_y' && a.id === 'exp')) {
        right.takeDamage(80);
        this.eventBus.emit('MATH_FORMULA', {
          latex: '\\frac{\\partial}{\\partial y}(e^x) = 0 \\text{ [CRITICAL -80!]}',
          position: { x: 0, y: 0 },
          color: '#00C853',
        });
        this.eventBus.emit('DAMAGE_DEALT', {
          targetId: right.id,
          amount: 80,
          isCrit: true,
          color: '#00C853',
          position: { x: right.position.x, y: right.position.y },
        });
      }
    }

    // Level 6: Integral ∫ vs e^x -> spawns constants Cn
    if (this.level.id === 6) {
      if ((a.id === 'integral' && b.id === 'exp') || (b.id === 'integral' && a.id === 'exp')) {
        this.integralConstantCount++;
        const cIndex = this.integralConstantCount;
        this.eventBus.emit('MATH_FORMULA', {
          latex: `\\int e^x dx = e^x + C_{${cIndex}}`,
          position: { x: left.position.x, y: left.position.y },
          color: '#F57C00',
        });
        // Spawn constant sphere
        this.spawnConstantSphere(cIndex, left.position);
      }
    }

    // Level 8 & 9: Pi orbital digit contact
    if (this.level.id === 8 || this.level.id === 9) {
      const piEntity = a.symbol === 'π' ? a : b.symbol === 'π' ? b : null;
      const target = piEntity === a ? b : a;
      if (piEntity && target) {
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
          position: { x: target.position.x, y: target.position.y },
        });
      }
    }
  }

  private applyDerivativeToPoly(sphere: BaseEntity): void {
    if (this.polyGlobalHp) {
      this.polyGlobalHp.current = Math.max(0, this.polyGlobalHp.current - 1);
      this.rightEntity.hp = this.polyGlobalHp.current;
    }

    if (sphere.symbol === 'x³') {
      sphere.isDead = true;
      this.eventBus.emit('MATH_FORMULA', {
        latex: '\\frac{d}{dx}(x^3) = 3x^2',
        position: { x: sphere.position.x, y: sphere.position.y },
        color: '#00ACC1',
      });
      // Spawn 3 spheres of x^2
      for (let k = 0; k < 3; k++) {
        const offset = vec2((k - 1) * 6, (k - 1) * 4);
        const sub = new BaseEntity({
          id: `poly_x2_${Date.now()}_${k}`,
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
          velocity: vec2(Math.sin(k * 2) * 20, Math.cos(k * 2) * 20),
        });
        this.subEntities.push(sub);
      }
    } else if (sphere.symbol === 'x²') {
      sphere.isDead = true;
      this.eventBus.emit('MATH_FORMULA', {
        latex: '\\frac{d}{dx}(x^2) = 2x',
        position: { x: sphere.position.x, y: sphere.position.y },
        color: '#00ACC1',
      });
      // Spawn 2 spheres of x
      for (let k = 0; k < 2; k++) {
        const offset = vec2((k === 0 ? -1 : 1) * 5, 0);
        const sub = new BaseEntity({
          id: `poly_x_${Date.now()}_${k}`,
          name: 'x',
          symbol: 'x',
          team: 'SUB_ENTITY',
          color: '#FFA726',
          bgColor: '#FFF3E0',
          hp: 1,
          maxHp: 1,
          radius: 4.5,
          mass: 0.8,
          position: sphere.position.add(offset),
          velocity: vec2((k === 0 ? -15 : 15), 15),
        });
        this.subEntities.push(sub);
      }
    } else if (sphere.symbol === 'x') {
      sphere.symbol = '1';
      sphere.radius = 3.5;
      sphere.color = '#FFD54F';
      this.eventBus.emit('MATH_FORMULA', {
        latex: '\\frac{d}{dx}(x) = 1',
        position: { x: sphere.position.x, y: sphere.position.y },
        color: '#00ACC1',
      });
    } else if (sphere.symbol === '1') {
      sphere.isDead = true;
      this.eventBus.emit('MATH_FORMULA', {
        latex: '\\frac{d}{dx}(1) = 0',
        position: { x: sphere.position.x, y: sphere.position.y },
        color: '#00ACC1',
      });
    }

    // Clean up dead sub-entities
    this.subEntities = this.subEntities.filter((e) => !e.isDead);
  }

  private spawnConstantSphere(index: number, pos: Vector2D): void {
    const sub = new BaseEntity({
      id: `const_C_${index}`,
      name: `C${index}`,
      symbol: `C${index}`,
      team: 'SUB_ENTITY',
      color: '#F57C00',
      bgColor: '#FFE0B2',
      hp: 1,
      maxHp: 1,
      radius: 4,
      mass: 0.8,
      position: pos.add(vec2((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10)),
      velocity: vec2((Math.random() - 0.5) * 30, (Math.random() - 0.5) * 30),
    });
    this.subEntities.push(sub);
  }

  private updateLevelMechanics(dt: number): void {
    // Level 3 & 9: Imaginary unit phase rotation
    if (this.level.id === 3 || this.level.id === 9) {
      const imag = this.leftEntity.symbol === 'i' ? this.leftEntity : this.rightEntity.symbol === 'i' ? this.rightEntity : null;
      if (imag) {
        this.imaginaryPhaseTimer += dt;
        if (this.imaginaryPhaseTimer >= 3.0) {
          this.imaginaryPhaseTimer -= 3.0;
          imag.currentPhaseIndex = (imag.currentPhaseIndex + 1) % 4;
          const phases = ['i (관통)', '-1 (반사)', '-i (관통+반사)', '1 (일반)'];
          const latexPhases = ['i \\times i = -1', '-1 \\times i = -i', '-i \\times i = 1', '1 \\times i = i'];
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
        if (laser.telegraphTime <= 0) {
          laser.isTelegraph = false; // Becomes active damaging beam
        }
      } else {
        laser.durationRemaining -= dt;

        // Damage detection against opposing entity
        const target = laser.ownerId === this.leftEntity.id ? this.rightEntity : this.leftEntity;
        if (!target.isDead) {
          let hit = false;
          if (laser.curveType === 'EXPONENTIAL') {
            hit = Curves.intersectsExponential(target.position, target.radius, laser.sourcePos, -45, 45);
          } else if (laser.curveType === 'SECTOR') {
            hit = Curves.isInsideSector(
              target.position,
              laser.sourcePos,
              30,
              laser.angle || 0,
              laser.sectorSpan || Math.PI / 3
            );
          } else {
            // Check line/curve distance
            const dist = target.position.distanceTo(laser.sourcePos);
            hit = dist <= target.radius + 15;
          }

          if (hit) {
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
                latex: `\\times(-1) \\text{ 반사! (-}${laser.damage})`,
                position: { x: target.position.x, y: target.position.y },
              });
            } else {
              target.takeDamage(laser.damage);
              this.eventBus.emit('DAMAGE_DEALT', {
                targetId: target.id,
                amount: laser.damage,
                color: '#FF7043',
                position: { x: target.position.x, y: target.position.y },
              });
            }
          }
        }

        if (laser.durationRemaining <= 0) {
          this.activeLasers.splice(i, 1);
        }
      }
    }
  }

  private updateOrbs(dt: number): void {
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

    // Check entity collection of orbs
    for (let o = this.orbs.length - 1; o >= 0; o--) {
      const orb = this.orbs[o];
      for (const entity of [this.leftEntity, this.rightEntity]) {
        if (entity.position.distanceTo(orb.position) <= entity.radius + orb.radius) {
          if (orb.type === 'AMPLITUDE_X2') {
            entity.amplitude = Math.min(16, entity.amplitude * 2);
            this.eventBus.emit('MATH_FORMULA', {
              latex: `a \\times 2 = ${entity.amplitude} \\text{ [진폭 강화!]}`,
              position: { x: entity.position.x, y: entity.position.y },
              color: '#FFD54F',
            });
          } else {
            entity.frequency = Math.min(16, entity.frequency * 2);
            entity.cooldownMax = Math.max(0.39, (2 * Math.PI) / entity.frequency);
            this.eventBus.emit('MATH_FORMULA', {
              latex: `b \\times 2 = ${entity.frequency} \\text{ [주기 강화!]}`,
              position: { x: entity.position.x, y: entity.position.y },
              color: '#FFD54F',
            });
          }
          this.eventBus.emit('ORB_COLLECTED', { entityId: entity.id, orbType: orb.type });
          this.orbs.splice(o, 1);
          break;
        }
      }
    }
  }

  private updateAI(dt: number): void {
    const ai = this.rightEntity;
    if (ai.isDead || !ai.isReady()) return;

    // AI skill trigger heuristic
    if (this.level.id === 1) {
      // Polynomial team triggers Graph Invocation
      this.triggerSkill('RIGHT');
    } else if (this.level.id === 2 || this.level.id === 4 || this.level.id === 5 || this.level.id === 6 || this.level.id === 8) {
      // Exponential blade or Pi sector
      const dist = ai.position.distanceTo(this.leftEntity.position);
      if (dist < 40) {
        this.triggerSkill('RIGHT');
      }
    } else if (this.level.id === 7) {
      // Cosine wave shot
      this.triggerSkill('RIGHT');
    } else {
      this.triggerSkill('RIGHT');
    }
  }

  /**
   * Player or AI manual trigger for special skills
   */
  triggerSkill(team: 'LEFT' | 'RIGHT'): boolean {
    const entity = team === 'LEFT' ? this.leftEntity : this.rightEntity;
    if (entity.isDead || !entity.isReady()) return false;

    entity.resetCooldown();
    this.laserIdCounter++;

    if (entity.symbol === 'x³' || entity.team === 'RIGHT' && this.level.id === 1) {
      // Invocación de Gráfico (0.8s telegrafiado, luego láser)
      this.eventBus.emit('SKILL_ACTIVATED', { entityId: entity.id, skillName: '그래프 소환!' });
      this.activeLasers.push({
        id: `laser_${this.laserIdCounter}`,
        ownerId: entity.id,
        sourcePos: entity.position.clone(),
        curveType: 'CUBIC',
        isTelegraph: true,
        telegraphTime: 0.8,
        durationRemaining: 1.2,
        damage: 23,
      });
      // Also invoke lasers from sub-entities
      for (const sub of this.subEntities) {
        this.activeLasers.push({
          id: `laser_${this.laserIdCounter}_${sub.id}`,
          ownerId: entity.id,
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

    if (entity.symbol === 'eˣ' || entity.symbol === 'eˣʸ') {
      // Cuchilla Exponencial
      this.eventBus.emit('SKILL_ACTIVATED', { entityId: entity.id, skillName: '지수 칼날!' });
      this.activeLasers.push({
        id: `laser_${this.laserIdCounter}`,
        ownerId: entity.id,
        sourcePos: entity.position.clone(),
        curveType: 'EXPONENTIAL',
        isTelegraph: false,
        telegraphTime: 0,
        durationRemaining: 0.6,
        damage: 13,
      });
      return true;
    }

    if (entity.symbol === 'π') {
      // Corte de Sector circular (부채꼴 베기!)
      this.eventBus.emit('SKILL_ACTIVATED', { entityId: entity.id, skillName: '부채꼴 베기!' });
      this.activeLasers.push({
        id: `laser_${this.laserIdCounter}`,
        ownerId: entity.id,
        sourcePos: entity.position.clone(),
        curveType: 'SECTOR',
        isTelegraph: false,
        telegraphTime: 0,
        durationRemaining: 0.8,
        damage: 15,
        sectorSpan: entity.sectorAngle,
      });
      // Expand sector angle up to 2pi
      entity.sectorAngle = entity.sectorAngle >= Math.PI * 2 ? Math.PI / 6 : entity.sectorAngle * 2;
      return true;
    }

    if (entity.symbol === 'sin x' || entity.symbol === 'cos x') {
      // Wave shot
      const skillName = entity.symbol === 'sin x' ? '사인파!' : '코사인파!';
      this.eventBus.emit('SKILL_ACTIVATED', { entityId: entity.id, skillName });
      this.activeLasers.push({
        id: `laser_${this.laserIdCounter}`,
        ownerId: entity.id,
        sourcePos: entity.position.clone(),
        curveType: entity.symbol === 'sin x' ? 'SINE' : 'COSINE',
        isTelegraph: false,
        telegraphTime: 0,
        durationRemaining: 0.7,
        damage: 25,
      });
      return true;
    }

    if (entity.symbol === '∫') {
      // Látigo integral
      this.eventBus.emit('SKILL_ACTIVATED', { entityId: entity.id, skillName: '∫ 채찍!' });
      this.activeLasers.push({
        id: `laser_${this.laserIdCounter}`,
        ownerId: entity.id,
        sourcePos: entity.position.clone(),
        curveType: 'LINEAR',
        isTelegraph: false,
        telegraphTime: 0,
        durationRemaining: 0.5,
        damage: 12,
      });
      // Spawn constant
      this.integralConstantCount++;
      this.spawnConstantSphere(this.integralConstantCount, entity.position);
      return true;
    }

    return false;
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
    if (this.leftEntity.isDead && !this.rightEntity.isDead) {
      this.status = 'DEFEAT';
      this.eventBus.emit('MATCH_OVER', {
        winner: 'RIGHT',
        remainingHp: this.rightEntity.hp,
        symbol: this.rightEntity.symbol,
      });
    } else if (this.rightEntity.isDead && !this.leftEntity.isDead) {
      this.status = 'VICTORY';
      this.eventBus.emit('MATCH_OVER', {
        winner: 'LEFT',
        remainingHp: this.leftEntity.hp,
        symbol: this.leftEntity.symbol,
      });
    }
  }
}
