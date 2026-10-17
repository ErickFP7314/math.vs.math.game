import { describe, it, expect } from 'vitest';
import { Vector2D, vec2 } from '../../src/core/physics/Vector2D';

describe('Vector2D', () => {
  it('creates vector with given coordinates', () => {
    const v = vec2(3, 4);
    expect(v.x).toBe(3);
    expect(v.y).toBe(4);
  });

  it('calculates vector magnitude correctly', () => {
    const v = vec2(3, 4);
    expect(v.magnitude()).toBe(5);
    expect(v.magnitudeSq()).toBe(25);
  });

  it('normalizes vector to unit length', () => {
    const v = vec2(3, 4);
    const unit = v.normalize();
    expect(unit.magnitude()).toBeCloseTo(1.0, 5);
    expect(unit.x).toBeCloseTo(0.6, 5);
    expect(unit.y).toBeCloseTo(0.8, 5);
  });

  it('handles zero vector normalization safely', () => {
    const zero = vec2(0, 0);
    const normalized = zero.normalize();
    expect(normalized.x).toBe(0);
    expect(normalized.y).toBe(0);
  });

  it('adds and subtracts vectors', () => {
    const a = vec2(1, 2);
    const b = vec2(3, 4);
    expect(a.add(b)).toEqual(vec2(4, 6));
    expect(a.sub(b)).toEqual(vec2(-2, -2));
  });

  it('multiplies by scalar', () => {
    const v = vec2(2, -3);
    expect(v.scale(2.5)).toEqual(vec2(5, -7.5));
  });

  it('calculates dot product and distance', () => {
    const a = vec2(1, 0);
    const b = vec2(0, 1);
    expect(a.dot(b)).toBe(0);

    const p1 = vec2(0, 0);
    const p2 = vec2(3, 4);
    expect(p1.distanceTo(p2)).toBe(5);
  });
});
