import { Vector2D, vec2 } from './Vector2D';

export interface PhysicalCircle {
  position: Vector2D;
  velocity: Vector2D;
  radius: number;
  mass: number;
}

export class ElasticSolver {
  /**
   * Check if two circles overlap
   */
  static checkCollision(a: PhysicalCircle, b: PhysicalCircle): boolean {
    const minDistance = a.radius + b.radius;
    return a.position.distanceSqTo(b.position) <= minDistance * minDistance;
  }

  /**
   * Resolves 2D elastic collision between two circles.
   * Modifies velocity and position of objects to conserve linear momentum and separate them.
   */
  static resolveCollision(a: PhysicalCircle, b: PhysicalCircle, restitution = 1.0): boolean {
    const delta = b.position.sub(a.position);
    const dist = delta.magnitude();
    const minDist = a.radius + b.radius;

    if (dist > minDist || dist === 0) {
      return false;
    }

    const normal = delta.scale(1 / dist);
    const relVelocity = b.velocity.sub(a.velocity);
    const velAlongNormal = relVelocity.dot(normal);

    // If objects are already moving away from each other, don't bounce again
    if (velAlongNormal > 0) {
      return false;
    }

    // Impulse scalar calculation: J = -(1 + e) * (v_rel · n) / (1/m1 + 1/m2)
    const invMassA = 1 / a.mass;
    const invMassB = 1 / b.mass;
    const impulseScalar = (-(1 + restitution) * velAlongNormal) / (invMassA + invMassB);

    const impulseVector = normal.scale(impulseScalar);
    a.velocity = a.velocity.sub(impulseVector.scale(invMassA));
    b.velocity = b.velocity.add(impulseVector.scale(invMassB));

    // Positional correction to resolve penetration
    const percent = 1.0; // Penetration percentage to resolve (full separation)
    const slop = 0.001;  // Penetration allowance
    const penetration = minDist - dist;
    if (penetration > slop) {
      const correction = normal.scale((penetration / (invMassA + invMassB)) * percent);
      a.position = a.position.sub(correction.scale(invMassA));
      b.position = b.position.add(correction.scale(invMassB));
    }

    return true;
  }

  /**
   * Resolves collision with Cartesian Arena bounds [minX, maxX, minY, maxY]
   */
  static resolveBoundary(
    circle: PhysicalCircle,
    bounds: { minX: number; maxX: number; minY: number; maxY: number }
  ): boolean {
    let bounced = false;

    // Left wall
    if (circle.position.x - circle.radius < bounds.minX) {
      circle.position = vec2(bounds.minX + circle.radius, circle.position.y);
      circle.velocity = vec2(Math.abs(circle.velocity.x), circle.velocity.y);
      bounced = true;
    }
    // Right wall
    else if (circle.position.x + circle.radius > bounds.maxX) {
      circle.position = vec2(bounds.maxX - circle.radius, circle.position.y);
      circle.velocity = vec2(-Math.abs(circle.velocity.x), circle.velocity.y);
      bounced = true;
    }

    // Bottom wall
    if (circle.position.y - circle.radius < bounds.minY) {
      circle.position = vec2(circle.position.x, bounds.minY + circle.radius);
      circle.velocity = vec2(circle.velocity.x, Math.abs(circle.velocity.y));
      bounced = true;
    }
    // Top wall
    else if (circle.position.y + circle.radius > bounds.maxY) {
      circle.position = vec2(circle.position.x, bounds.maxY - circle.radius);
      circle.velocity = vec2(circle.velocity.x, -Math.abs(circle.velocity.y));
      bounced = true;
    }

    return bounced;
  }
}
