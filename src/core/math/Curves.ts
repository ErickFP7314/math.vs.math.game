import { Vector2D } from '../physics/Vector2D';

export class Curves {
  /**
   * Polynomial curve: y - y0 = a * (x - x0)^degree
   */
  static evalPolynomial(x: number, origin: Vector2D, degree: number, a = 1): number {
    const dx = x - origin.x;
    return origin.y + a * Math.pow(dx, degree);
  }

  /**
   * Exponential curve: y - y0 = e^(x - x0)
   */
  static evalExponential(x: number, origin: Vector2D, scale = 1): number {
    const dx = x - origin.x;
    return origin.y + Math.exp(dx * scale);
  }

  /**
   * Sine wave: y - y0 = a * sin(b * (x - x0))
   */
  static evalSine(x: number, origin: Vector2D, a = 1, b = 1): number {
    const dx = x - origin.x;
    return origin.y + a * Math.sin(b * dx);
  }

  /**
   * Check if a circle intersects an exponential curve
   */
  static intersectsExponential(
    circleCenter: Vector2D,
    radius: number,
    origin: Vector2D,
    minX: number,
    maxX: number,
    samples = 32
  ): boolean {
    const xStart = Math.max(minX, circleCenter.x - radius);
    const xEnd = Math.min(maxX, circleCenter.x + radius);

    if (xStart > xEnd) return false;

    const step = (xEnd - xStart) / samples;
    const rSq = radius * radius;

    for (let i = 0; i <= samples; i++) {
      const x = xStart + i * step;
      const y = this.evalExponential(x, origin);
      const dx = x - circleCenter.x;
      const dy = y - circleCenter.y;
      if (dx * dx + dy * dy <= rSq) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if point is inside a circular sector
   * @param point Target point
   * @param center Sector circle center
   * @param radius Sector radius
   * @param startAngle Starting angle in radians [0, 2pi]
   * @param spanAngle Angular width in radians [0, 2pi]
   */
  static isInsideSector(
    point: Vector2D,
    center: Vector2D,
    radius: number,
    startAngle: number,
    spanAngle: number
  ): boolean {
    const distSq = point.distanceSqTo(center);
    if (distSq > radius * radius) {
      return false;
    }

    if (spanAngle >= Math.PI * 2) {
      return true; // Full circle
    }

    const angle = Math.atan2(point.y - center.y, point.x - center.x);
    // Normalize angles to [0, 2pi)
    const normAngle = (angle + 2 * Math.PI) % (2 * Math.PI);
    const normStart = (startAngle + 2 * Math.PI) % (2 * Math.PI);

    let diff = (normAngle - normStart + 2 * Math.PI) % (2 * Math.PI);
    return diff <= spanAngle;
  }
}
