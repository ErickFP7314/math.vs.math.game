import { describe, it, expect } from 'vitest';
import { vec2 } from '../../src/core/physics/Vector2D';
import { Curves } from '../../src/core/math/Curves';

describe('Curves Math & Collision', () => {
  it('evaluates polynomial curves correctly', () => {
    const origin = vec2(0, 0);
    // Cubic: a * (x - x0)^3
    expect(Curves.evalPolynomial(2, origin, 3, 1)).toBe(8);
    // Parabola: a * (x - x0)^2
    expect(Curves.evalPolynomial(3, origin, 2, 2)).toBe(18);
    // Line: x
    expect(Curves.evalPolynomial(5, origin, 1, 1)).toBe(5);
  });

  it('evaluates exponential curve correctly', () => {
    const origin = vec2(0, 0);
    // y = e^(x)
    expect(Curves.evalExponential(0, origin)).toBeCloseTo(1.0, 4);
    expect(Curves.evalExponential(1, origin)).toBeCloseTo(2.71828, 4);
  });

  it('evaluates sine wave correctly', () => {
    const origin = vec2(0, 0);
    // y = a * sin(b * x)
    expect(Curves.evalSine(Math.PI / 2, origin, 2, 1)).toBeCloseTo(2.0, 4);
    expect(Curves.evalSine(Math.PI, origin, 2, 1)).toBeCloseTo(0.0, 4);
  });

  it('detects circle intersection with curve', () => {
    const origin = vec2(0, 0);
    // Circle at (1, 2.7) with radius 0.5 touches y = e^x at (1, 2.718)
    const circlePos = vec2(1, 2.7);
    const radius = 0.5;

    const hit = Curves.intersectsExponential(circlePos, radius, origin, -5, 5);
    expect(hit).toBe(true);

    // Circle far away at (1, 10) with radius 0.5 doesn't touch
    const farCircle = vec2(1, 10);
    expect(Curves.intersectsExponential(farCircle, radius, origin, -5, 5)).toBe(false);
  });

  it('detects point/circle inside sector of circle', () => {
    const center = vec2(0, 0);
    const radius = 20;
    const startAngle = 0; // pointing along +X axis
    const spanAngle = Math.PI / 2; // first quadrant (0 to 90 deg)

    // Point in first quadrant at distance 10
    const pIn = vec2(7, 7); // angle ~45 deg, dist ~9.9
    expect(Curves.isInsideSector(pIn, center, radius, startAngle, spanAngle)).toBe(true);

    // Point in second quadrant (-7, 7) should be outside
    const pOut = vec2(-7, 7);
    expect(Curves.isInsideSector(pOut, center, radius, startAngle, spanAngle)).toBe(false);
  });

  it('detects circle intersection with horizontal line', () => {
    // Line at y = 10
    expect(Curves.intersectsHorizontalLine(vec2(0, 12), 4, 10)).toBe(true);
    expect(Curves.intersectsHorizontalLine(vec2(0, 20), 4, 10)).toBe(false);
  });

  it('detects circle intersection with 45 degree diagonal line (f(x) = x)', () => {
    const origin = vec2(0, 0); // Line y = x
    // Circle at (5, 5) with radius 2 sits directly on the line
    expect(Curves.intersectsDiagonalLine(vec2(5, 5), 2, origin)).toBe(true);
    // Circle at (5, 6) with radius 2: distance to line y=x is 1/sqrt(2) ~ 0.707 <= 2 -> touches
    expect(Curves.intersectsDiagonalLine(vec2(5, 6), 2, origin)).toBe(true);
    // Circle at (0, 10) with radius 2: distance is 10/sqrt(2) ~ 7.07 > 2 -> does not touch
    expect(Curves.intersectsDiagonalLine(vec2(0, 10), 2, origin)).toBe(false);
  });

  it('detects circle intersection with parabola and cubic curves', () => {
    const origin = vec2(0, 0);
    // Parabola y = 8 * (0.1 * x)^2 -> at x = 0, y = 0
    expect(Curves.intersectsParabola(vec2(0, 1), 3, origin)).toBe(true);
    expect(Curves.intersectsParabola(vec2(0, 20), 3, origin)).toBe(false);

    // Cubic y = 5 * (0.1 * x)^3 -> at x = 0, y = 0
    expect(Curves.intersectsCubic(vec2(0, 1), 3, origin)).toBe(true);
    expect(Curves.intersectsCubic(vec2(0, 20), 3, origin)).toBe(false);
  });
});
