/**
 * Vector2D - Immutable 2D Vector representation for deterministic physics
 */
export class Vector2D {
  readonly x: number;
  readonly y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  add(other: Vector2D): Vector2D {
    return new Vector2D(this.x + other.x, this.y + other.y);
  }

  sub(other: Vector2D): Vector2D {
    return new Vector2D(this.x - other.x, this.y - other.y);
  }

  scale(factor: number): Vector2D {
    return new Vector2D(this.x * factor, this.y * factor);
  }

  dot(other: Vector2D): number {
    return this.x * other.x + this.y * other.y;
  }

  magnitudeSq(): number {
    return this.x * this.x + this.y * this.y;
  }

  magnitude(): number {
    return Math.sqrt(this.magnitudeSq());
  }

  normalize(): Vector2D {
    const mag = this.magnitude();
    if (mag === 0) return new Vector2D(0, 0);
    return new Vector2D(this.x / mag, this.y / mag);
  }

  distanceTo(other: Vector2D): number {
    return this.sub(other).magnitude();
  }

  distanceSqTo(other: Vector2D): number {
    return this.sub(other).magnitudeSq();
  }

  clone(): Vector2D {
    return new Vector2D(this.x, this.y);
  }
}

export function vec2(x: number, y: number): Vector2D {
  return new Vector2D(x, y);
}
