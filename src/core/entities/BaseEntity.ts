import { Vector2D } from '../physics/Vector2D';
import { PhysicalCircle } from '../physics/ElasticSolver';

export type EntityTeam = 'LEFT' | 'RIGHT' | 'SUB_ENTITY';

export interface StatusEffect {
  type: 'BURN' | 'INTANGIBLE' | 'REFLECT' | 'SHIELD';
  durationRemaining: number;
  tickTimer?: number;
  tickInterval?: number;
  tickDamage?: number;
}

export interface EntityConfig {
  id: string;
  name: string;
  symbol: string;
  team: EntityTeam;
  color: string;
  bgColor: string;
  hp: number;
  maxHp: number;
  radius: number;
  mass: number;
  position: Vector2D;
  velocity: Vector2D;
  cooldownMax?: number;
}

export class BaseEntity implements PhysicalCircle {
  id: string;
  name: string;
  symbol: string;
  team: EntityTeam;
  color: string;
  bgColor: string;

  hp: number;
  maxHp: number;
  radius: number;
  mass: number;

  position: Vector2D;
  velocity: Vector2D;

  cooldownRemaining = 0;
  cooldownMax = 3.5; // in seconds

  statusEffects: StatusEffect[] = [];
  isImmuneToDerivative = false;
  isDead = false;
  invulnerabilityTimer = 0; // seconds remaining of spawn invulnerability & blinking

  // Additional entity-specific dynamic properties
  tag = '';
  currentPhaseIndex = 0; // for 'i'
  trigPhase = 0;         // for trig (0: sin, 1: cos, 2: -sin, 3: -cos)
  amplitude = 1;         // for trig
  frequency = 1;         // for trig
  sectorAngle = Math.PI / 6; // for pi: θ (aperture)
  sectorStartAngle = 0;      // for pi: α (leading edge of the rotating sector, radians)
  tailPhase = 0;             // for pi: time driving the decimal tail oscillation
  activeDecimalIndex = 0;    // for pi
  polyDegree = 0;            // for polynomial degree of constant / sub-entities
  cIndex = 1;                // for constant index C_k

  constructor(config: EntityConfig) {
    this.id = config.id;
    this.name = config.name;
    this.symbol = config.symbol;
    this.team = config.team;
    this.color = config.color;
    this.bgColor = config.bgColor;

    this.hp = config.hp;
    this.maxHp = config.maxHp;
    this.radius = config.radius;
    this.mass = config.mass;

    this.position = config.position;
    this.velocity = config.velocity;

    if (config.cooldownMax !== undefined) {
      this.cooldownMax = config.cooldownMax;
    }
  }

  takeDamage(amount: number): number {
    if (this.isInvulnerable() || this.hasStatus('SHIELD') || (this.isImmuneToDerivative && amount <= 0)) {
      return 0;
    }

    const actualDamage = Math.min(this.hp, Math.max(0, amount));
    this.hp -= actualDamage;

    if (this.hp <= 0) {
      this.hp = 0;
      this.isDead = true;
    }

    return actualDamage;
  }

  heal(amount: number): void {
    this.hp = Math.min(this.maxHp, this.hp + amount);
  }

  addStatus(effect: StatusEffect): void {
    // Refresh or add
    const existing = this.statusEffects.find((e) => e.type === effect.type);
    if (existing) {
      existing.durationRemaining = Math.max(existing.durationRemaining, effect.durationRemaining);
    } else {
      this.statusEffects.push({ ...effect });
    }
  }

  hasStatus(type: StatusEffect['type']): boolean {
    return this.statusEffects.some((e) => e.type === type && e.durationRemaining > 0);
  }

  removeStatus(type: StatusEffect['type']): void {
    this.statusEffects = this.statusEffects.filter((e) => e.type !== type);
  }

  updateCooldown(dt: number): void {
    if (this.cooldownRemaining > 0) {
      this.cooldownRemaining = Math.max(0, this.cooldownRemaining - dt);
    }
    if (this.invulnerabilityTimer > 0) {
      this.invulnerabilityTimer = Math.max(0, this.invulnerabilityTimer - dt);
    }
  }

  isInvulnerable(): boolean {
    return this.invulnerabilityTimer > 0;
  }

  resetCooldown(): void {
    this.cooldownRemaining = this.cooldownMax;
  }

  isReady(): boolean {
    return this.cooldownRemaining <= 0;
  }

  clone(): BaseEntity {
    const copy = new BaseEntity({
      id: this.id,
      name: this.name,
      symbol: this.symbol,
      team: this.team,
      color: this.color,
      bgColor: this.bgColor,
      hp: this.hp,
      maxHp: this.maxHp,
      radius: this.radius,
      mass: this.mass,
      position: this.position.clone(),
      velocity: this.velocity.clone(),
      cooldownMax: this.cooldownMax,
    });
    copy.cooldownRemaining = this.cooldownRemaining;
    copy.invulnerabilityTimer = this.invulnerabilityTimer;
    copy.statusEffects = this.statusEffects.map((s) => ({ ...s }));
    copy.isImmuneToDerivative = this.isImmuneToDerivative;
    copy.isDead = this.isDead;
    copy.tag = this.tag;
    copy.currentPhaseIndex = this.currentPhaseIndex;
    copy.amplitude = this.amplitude;
    copy.frequency = this.frequency;
    copy.sectorAngle = this.sectorAngle;
    copy.sectorStartAngle = this.sectorStartAngle;
    copy.tailPhase = this.tailPhase;
    copy.activeDecimalIndex = this.activeDecimalIndex;
    copy.polyDegree = this.polyDegree;
    copy.cIndex = this.cIndex;
    return copy;
  }
}
