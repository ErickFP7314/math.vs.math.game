/**
 * Constantes y fórmulas compartidas por los niveles 7, 8 y 9 (reglas2/nivel7-9.md).
 *
 * Escala: una unidad de la especificación equivale a SPEC_UNIT unidades de la arena.
 * La especificación usa un plano de ±5 y la arena del juego va de ±50.
 */

export const SPEC_UNIT = 10;

/** Velocidad del nodo guía de una onda (unidades de arena por segundo). */
export const WAVE_SPEED = 40;
export const WAVE_DAMAGE = 25;

/** Radio del sector circular de π: r = 2 unidades de especificación. */
export const PI_SECTOR_RADIUS = 2 * SPEC_UNIT;
export const PI_SECTOR_DAMAGE = 15;
/** Enfriamiento interno del sector tras cada corte (segundos). */
export const PI_SECTOR_COOLDOWN = 1.5;
/** Velocidad angular de giro en sentido horario (rad/s). */
export const PI_SECTOR_SPIN = Math.PI / 2;

/** Cola de dígitos: nodo activo a PI_TAIL_GAP del borde de π, nodos siguientes separados PI_TAIL_SPACING. */
export const PI_TAIL_GAP = 6;
export const PI_TAIL_SPACING = 8;
export const PI_TAIL_NODE_RADIUS = 3;
/** Oscilación de la cola alrededor de 180° (ángulo máximo en rad y frecuencia en rad/s). */
export const PI_TAIL_SWING = Math.PI / 9;
export const PI_TAIL_OMEGA = 1.5;

export interface SectorPhase {
  theta: number;
  thetaLatex: string;
  areaLatex: string;
}

/** Progresión de θ del sector y su área S = ½r²θ = 2θ (con r = 2). */
export const PI_SECTOR_PHASES: SectorPhase[] = [
  { theta: Math.PI / 6, thetaLatex: '\\frac{\\pi}{6}', areaLatex: '\\frac{\\pi}{3}' },
  { theta: Math.PI / 3, thetaLatex: '\\frac{\\pi}{3}', areaLatex: '\\frac{2\\pi}{3}' },
  { theta: Math.PI / 2, thetaLatex: '\\frac{\\pi}{2}', areaLatex: '\\pi' },
  { theta: Math.PI, thetaLatex: '\\pi', areaLatex: '2\\pi' },
  { theta: 2 * Math.PI, thetaLatex: '2\\pi', areaLatex: '4\\pi' },
];

export function sectorPhaseIndex(theta: number): number {
  const index = PI_SECTOR_PHASES.findIndex((phase) => Math.abs(phase.theta - theta) < 1e-6);
  return index === -1 ? 0 : index;
}

/** Siguiente valor de θ; tras 2π se reinicia a π/6. */
export function nextSectorAngle(theta: number): number {
  const next = (sectorPhaseIndex(theta) + 1) % PI_SECTOR_PHASES.length;
  return PI_SECTOR_PHASES[next].theta;
}

/** Fórmula LaTeX de y = a·f(bx), omitiendo a = 1. */
export function waveLatex(amplitude: number, frequency: number, fn: 'sin' | 'cos'): string {
  const coefficient = amplitude === 1 ? '' : `${amplitude}`;
  const argument = frequency === 1 ? 'x' : `${frequency}x`;
  return `${coefficient}\\${fn} ${argument}`;
}
