import { describe, it, expect } from 'vitest';
import { vec2 } from '../../src/core/physics/Vector2D';
import { ElasticSolver, PhysicalCircle } from '../../src/core/physics/ElasticSolver';

describe('ElasticSolver', () => {
  it('detects overlap between two circles', () => {
    const c1: PhysicalCircle = {
      position: vec2(0, 0),
      velocity: vec2(10, 0),
      radius: 10,
      mass: 1,
    };
    const c2: PhysicalCircle = {
      position: vec2(15, 0),
      velocity: vec2(-10, 0),
      radius: 10,
      mass: 1,
    };

    expect(ElasticSolver.checkCollision(c1, c2)).toBe(true);
  });

  it('resolves 1D head-on collision conserving momentum', () => {
    const c1: PhysicalCircle = {
      position: vec2(0, 0),
      velocity: vec2(10, 0),
      radius: 5,
      mass: 1,
    };
    const c2: PhysicalCircle = {
      position: vec2(9, 0),
      velocity: vec2(-10, 0),
      radius: 5,
      mass: 1,
    };

    const hasCollided = ElasticSolver.resolveCollision(c1, c2);
    expect(hasCollided).toBe(true);

    // With equal mass and restitution = 1.0, velocities swap
    expect(c1.velocity.x).toBeCloseTo(-10, 3);
    expect(c2.velocity.x).toBeCloseTo(10, 3);
    // Circles are separated so distance >= r1 + r2
    expect(c1.position.distanceTo(c2.position)).toBeGreaterThanOrEqual(10);
  });

  it('handles separation when velocities are already moving apart', () => {
    const c1: PhysicalCircle = {
      position: vec2(0, 0),
      velocity: vec2(-5, 0),
      radius: 5,
      mass: 1,
    };
    const c2: PhysicalCircle = {
      position: vec2(8, 0),
      velocity: vec2(5, 0),
      radius: 5,
      mass: 1,
    };

    // Even if overlapping, if moving apart, do not invert velocities again
    const resolved = ElasticSolver.resolveCollision(c1, c2);
    expect(resolved).toBe(false);
    expect(c1.velocity.x).toBe(-5);
    expect(c2.velocity.x).toBe(5);
  });
});
