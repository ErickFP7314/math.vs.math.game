import { describe, it, expect } from 'vitest';
import {
  PI_SECTOR_PHASES,
  nextSectorAngle,
  sectorPhaseIndex,
  waveLatex,
} from '../../src/core/math/SpecModel';

describe('Spec model (reglas2 levels 7-9)', () => {
  it('cycles the sector angle π/6 → π/3 → π/2 → π → 2π → π/6', () => {
    let theta = PI_SECTOR_PHASES[0].theta;
    const sequence: number[] = [theta];
    for (let step = 0; step < PI_SECTOR_PHASES.length; step++) {
      theta = nextSectorAngle(theta);
      sequence.push(theta);
    }
    expect(sequence.map((value) => Math.round((value / Math.PI) * 6))).toEqual([1, 2, 3, 6, 12, 1]);
  });

  it('maps each sector angle to the area S = ½r²θ = 2θ with r = 2', () => {
    for (const phase of PI_SECTOR_PHASES) {
      expect(phase.theta * 2).toBeCloseTo(
        { '\\frac{\\pi}{3}': Math.PI / 3, '\\frac{2\\pi}{3}': (2 * Math.PI) / 3, '\\pi': Math.PI, '2\\pi': 2 * Math.PI, '4\\pi': 4 * Math.PI }[phase.areaLatex] ?? NaN,
        9
      );
    }
    expect(sectorPhaseIndex(Math.PI)).toBe(3);
  });

  it('formats wave equations in LaTeX, omitting the amplitude when a = 1', () => {
    expect(waveLatex(1, 1, 'sin')).toBe('\\sin x');
    expect(waveLatex(2, 1, 'sin')).toBe('2\\sin x');
    expect(waveLatex(1, 2, 'cos')).toBe('\\cos 2x');
    expect(waveLatex(16, 16, 'cos')).toBe('16\\cos 16x');
  });
});
