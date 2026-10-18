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
  enemyShootTimer = 3.0;
  isFrozen = false;

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
        this.randomizeEntityDirections();
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
    const allEntities = [this.leftEntity, this.rightEntity, ...this.subEntities].filter(
      (e) => !e.isDead
    );

    // 1. Update cooldowns, status effects, and kinematics
    for (const entity of allEntities) {
      entity.updateCooldown(dt);
      this.updateEntityStatusEffects(entity, dt);

      // Enemy spheres freeze during laser beam, but player sphere (LEFT) keeps moving freely!
      const isEntityFrozen = this.isFrozen && entity.team !== 'LEFT';
      if (!isEntityFrozen) {
        // Move entity: p = p + v * dt
        entity.position = entity.position.add(entity.velocity.scale(dt));

        // Boundary bounce
        ElasticSolver.resolveBoundary(entity, this.level.arenaBounds);
      }
    }

    // 2. Resolve entity-entity elastic collisions & math rules
    for (let i = 0; i < allEntities.length; i++) {
      for (let j = i + 1; j < allEntities.length; j++) {
        const a = allEntities[i];
        const b = allEntities[j];

        // Skip collisions between two frozen enemy spheres
        if (this.isFrozen && a.team !== 'LEFT' && b.team !== 'LEFT') {
          continue;
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

    // Interrupt enemy laser if hit by player (Requirement 0.3)
    const hadEnemyLaser = this.activeLasers.some((l) => l.ownerId !== player.id);
    if (hadEnemyLaser) {
      this.activeLasers = this.activeLasers.filter((l) => l.ownerId === player.id);
      this.isFrozen = this.activeLasers.length > 0;
      this.enemyShootTimer = 3.0; // Reset shoot timer after interruption
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
    if (this.level.id === 1 || player.id === 'ddx' || player.symbol === 'd/dx') {
      const polySymbols = ['x³', 'x²', 'x', '1'];
      if (polySymbols.includes(enemy.symbol)) {
        this.applyDerivativeToPoly(enemy, collisionPos);
        // Player takes a light contact bump
        player.takeDamage(1);
        this.eventBus.emit('DAMAGE_DEALT', {
          targetId: player.id,
          amount: 1,
          color: '#F4511E',
          position: { x: player.position.x, y: player.position.y },
        });
        return;
      }
    }

    // Level 2: d/dx vs e^x (Eigenfunction Immunity + Reflected Burn)
    if (this.level.id === 2 || (player.symbol === 'd/dx' && enemy.symbol === 'eˣ')) {
      if (enemy.isImmuneToDerivative || enemy.symbol === 'eˣ') {
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
      enemy.takeDamage(80);
      this.eventBus.emit('MATH_FORMULA', {
        latex: '\\frac{\\partial}{\\partial y}(e^x) = 0 \\text{ [CRITICAL!]}',
        position: { x: collisionPos.x, y: collisionPos.y },
        color: '#00C853',
      });
      this.eventBus.emit('DAMAGE_DEALT', {
        targetId: enemy.id,
        amount: 80,
        isCrit: true,
        color: '#00C853',
        position: { x: enemy.position.x, y: enemy.position.y },
      });
      return;
    }

    // Level 6: Integral ∫ vs e^x -> spawns constants Cn and deals damage
    if (this.level.id === 6 || (player.symbol === '∫' && enemy.symbol === 'eˣ')) {
      this.integralConstantCount++;
      const cIndex = this.integralConstantCount;
      enemy.takeDamage(10);
      this.eventBus.emit('DAMAGE_DEALT', {
        targetId: enemy.id,
        amount: 10,
        color: '#F57C00',
        position: { x: enemy.position.x, y: enemy.position.y },
      });
      this.eventBus.emit('MATH_FORMULA', {
        latex: `\\int e^x dx = e^x + C_{${cIndex}}`,
        position: { x: collisionPos.x, y: collisionPos.y },
        color: '#F57C00',
      });
      this.spawnConstantSphere(cIndex, collisionPos);
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

    if (sphere.symbol === 'x³') {
      sphere.isDead = true;
      this.eventBus.emit('MATH_FORMULA', {
        latex: '\\frac{d}{dx}(x^3) = 3x^2',
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
        this.subEntities.push(sub);
      }
    } else if (sphere.symbol === 'x²') {
      sphere.isDead = true;
      this.eventBus.emit('MATH_FORMULA', {
        latex: '\\frac{d}{dx}(x^2) = 2x',
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
        this.subEntities.push(sub);
      }
    } else if (sphere.symbol === 'x') {
      sphere.symbol = '1';
      sphere.name = '1';
      sphere.radius = 3.6;
      sphere.color = '#FFD54F';
      // Push the transformed sphere 1 away from player
      sphere.velocity = blastDir.scale(blastSpeed);
      this.eventBus.emit('MATH_FORMULA', {
        latex: '\\frac{d}{dx}(x) = 1',
        position: { x: pos.x, y: pos.y },
        color: '#00ACC1',
      });
    } else if (sphere.symbol === '1') {
      sphere.isDead = true;
      this.eventBus.emit('MATH_FORMULA', {
        latex: '\\frac{d}{dx}(1) = 0',
        position: { x: pos.x, y: pos.y },
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
          this.eventBus.emit('LASER_FIRED', {
            laserId: laser.id,
            ownerId: laser.ownerId,
            curveType: laser.curveType,
          });
        }
      } else {
        laser.durationRemaining -= dt;

        // Damage detection against opposing entities
        const isPlayerLaser = laser.ownerId === this.leftEntity.id;
        const targets = isPlayerLaser
          ? [this.rightEntity, ...this.subEntities].filter((e) => !e.isDead)
          : (!this.leftEntity.isDead ? [this.leftEntity] : []);

        for (const target of targets) {
          if (!laser.hitEntityIds) {
            laser.hitEntityIds = [];
          }
          if (laser.hitEntityIds.includes(target.id)) {
            continue; // Already hit this target in this blast
          }

          let hit = false;
          if (laser.curveType === 'EXPONENTIAL') {
            hit = Curves.intersectsExponential(target.position, target.radius, laser.sourcePos, -50, 50);
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
            hit = Curves.intersectsSine(target.position, target.radius, laser.sourcePos, -50, 50);
          }

          if (hit) {
            laser.hitEntityIds.push(target.id);
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

    // Freeze spheres in place while any laser curve/beam is active
    this.isFrozen = this.activeLasers.length > 0;
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
              latex: `a \\times 2 = ${entity.amplitude} \\text{ [Amp x2]}`,
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
          this.eventBus.emit('ORB_COLLECTED', { entityId: entity.id, orbType: orb.type });
          this.orbs.splice(o, 1);
          break;
        }
      }
    }
  }

  private addLaser(laser: ActiveLaser): void {
    this.activeLasers.push(laser);
    this.isFrozen = true;
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
      this.eventBus.emit('SKILL_ACTIVATED', { entityId: entity.id, skillName: '∫ Riemann Wave!' });
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
      this.integralConstantCount++;
      this.spawnConstantSphere(this.integralConstantCount, entity.position);
      this.eventBus.emit('MATH_FORMULA', {
        latex: '\\int f(x)dx \\text{ Area Wave}',
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
    if (entity.symbol === 'sin x' || entity.symbol === 'cos x') {
      const skillName = entity.symbol === 'sin x' ? 'Sine Wave!' : 'Cosine Wave!';
      this.eventBus.emit('SKILL_ACTIVATED', { entityId: entity.id, skillName });
      this.addLaser({
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

    // Check living sub-entities on the right side
    const livingRightSubEntities = this.subEntities.filter((e) => !e.isDead && e.team === 'SUB_ENTITY');

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
}
