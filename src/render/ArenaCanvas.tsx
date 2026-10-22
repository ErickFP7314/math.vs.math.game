import React, { useEffect, useRef } from 'react';
import { SimulationEngine } from '../core/engine/SimulationEngine';
import { BaseEntity } from '../core/entities/BaseEntity';
import { Vector2D, vec2 } from '../core/physics/Vector2D';
import { soundManager } from '../audio/WebAudioSynth';
import { useTheme } from '../theme/ThemeContext';
import { globalEventBus } from '../core/engine/EventBus';

interface ArenaCanvasProps {
  engine: SimulationEngine;
  playerBadgeText?: string;
}

export const ArenaCanvas: React.FC<ArenaCanvasProps> = ({ engine, playerBadgeText = 'YOU' }) => {
  const { theme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dragStartRef = useRef<Vector2D | null>(null);
  const dragCurrentRef = useRef<Vector2D | null>(null);
  const cursorGamePosRef = useRef<Vector2D | null>(null);
  const shockwavesRef = useRef<{ x: number; y: number; radius: number; alpha: number }[]>([]);
  const screenShakeRef = useRef(0);

  // Convert game coordinates [-50..50, -50..50] to 1:1 square canvas pixels
  const toScreen = (gamePos: Vector2D, width: number, height: number): { x: number; y: number } => {
    const scaleX = width / 100;
    const scaleY = height / 100;
    return {
      x: (gamePos.x + 50) * scaleX,
      y: (50 - gamePos.y) * scaleY, // invert Y for standard Cartesian screen coordinates
    };
  };

  const toGame = (screenX: number, screenY: number, width: number, height: number): Vector2D => {
    const scaleX = 100 / width;
    const scaleY = 100 / height;
    return vec2(screenX * scaleX - 50, 50 - screenY * scaleY);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const unsubDamage = globalEventBus.on('DAMAGE_DEALT', (payload) => {
      if (payload.targetId === engine.leftEntity.id) {
        screenShakeRef.current = 7;
      }
    });

    let animId: number;

    const render = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;
      const isDark = theme === 'dark';

      ctx.save();
      if (screenShakeRef.current > 0.1) {
        const sx = (Math.random() - 0.5) * screenShakeRef.current;
        const sy = (Math.random() - 0.5) * screenShakeRef.current;
        ctx.translate(sx, sy);
        screenShakeRef.current *= 0.85;
      }

      // 1. Clear background (Clean White Cartesian canvas or dark slate)
      ctx.fillStyle = isDark ? '#060b16' : '#FFFFFF';
      ctx.fillRect(0, 0, width, height);

      // 2. Draw subtle Cartesian subgrid lines
      ctx.lineWidth = 1.0;
      ctx.strokeStyle = isDark ? 'rgba(30, 41, 59, 0.6)' : '#F1F5F9';

      const divisions = 20; // 5-unit subdivisions
      for (let i = 0; i <= divisions; i++) {
        const x = (i / divisions) * width;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let j = 0; j <= divisions; j++) {
        const y = (j / divisions) * height;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Main X and Y Axes with ticks crossing at center (0, 0)
      const origin = toScreen(vec2(0, 0), width, height);
      ctx.strokeStyle = isDark ? '#64748B' : '#94A3B8';
      ctx.lineWidth = 1.5;

      // X Axis
      ctx.beginPath();
      ctx.moveTo(0, origin.y);
      ctx.lineTo(width, origin.y);
      ctx.stroke();

      // Y Axis
      ctx.beginPath();
      ctx.moveTo(origin.x, 0);
      ctx.lineTo(origin.x, height);
      ctx.stroke();

      // Graduation ticks on Axes (every 10 units)
      ctx.strokeStyle = isDark ? '#94A3B8' : '#94A3B8';
      ctx.lineWidth = 1.5;
      const tickStep = 10;
      for (let g = -40; g <= 40; g += tickStep) {
        if (g === 0) continue;
        // X ticks
        const tx = toScreen(vec2(g, 0), width, height).x;
        ctx.beginPath();
        ctx.moveTo(tx, origin.y - 3.5);
        ctx.lineTo(tx, origin.y + 3.5);
        ctx.stroke();

        // Y ticks
        const ty = toScreen(vec2(0, g), width, height).y;
        ctx.beginPath();
        ctx.moveTo(origin.x - 3.5, ty);
        ctx.lineTo(origin.x + 3.5, ty);
        ctx.stroke();
      }

      // Arrow on positive Y Axis (pointing Up)
      ctx.fillStyle = isDark ? '#94A3B8' : '#94A3B8';
      ctx.beginPath();
      ctx.moveTo(origin.x, 3);
      ctx.lineTo(origin.x - 3.5, 11);
      ctx.lineTo(origin.x + 3.5, 11);
      ctx.closePath();
      ctx.fill();

      // Label 'y' near top of Y Axis
      ctx.font = 'italic 16px "KaTeX_Math", "Times New Roman", serif';
      ctx.fillStyle = isDark ? '#94A3B8' : '#94A3B8';
      ctx.fillText('y', origin.x - 13, 14);

      // Arrow on positive X Axis (pointing Right)
      ctx.beginPath();
      ctx.moveTo(width - 3, origin.y);
      ctx.lineTo(width - 11, origin.y - 3.5);
      ctx.lineTo(width - 11, origin.y + 3.5);
      ctx.closePath();
      ctx.fill();

      // Label 'x' near right of X Axis
      ctx.fillText('x', width - 12, origin.y + 16);

      // Origin text 'O'
      ctx.font = 'italic 14px "KaTeX_Math", "Times New Roman", serif';
      ctx.fillStyle = isDark ? '#64748B' : '#CBD5E1';
      ctx.fillText('O', origin.x - 12, origin.y + 13);

      // 3. Draw Shockwaves (from click/impulse)
      for (let s = shockwavesRef.current.length - 1; s >= 0; s--) {
        const sw = shockwavesRef.current[s];
        sw.radius += 2.5;
        sw.alpha -= 0.04;
        if (sw.alpha <= 0) {
          shockwavesRef.current.splice(s, 1);
          continue;
        }
        ctx.save();
        ctx.strokeStyle = `rgba(0, 172, 193, ${sw.alpha})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // 4. Draw Power Orbs (Level 7)
      for (const orb of engine.orbs) {
        const p = toScreen(orb.position, width, height);
        ctx.save();
        ctx.shadowColor = '#FFD54F';
        ctx.shadowBlur = 10;
        ctx.fillStyle = '#FFD54F';
        ctx.beginPath();
        ctx.arc(p.x, p.y, orb.radius * (width / 90), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.font = 'bold 10px monospace';
        ctx.fillStyle = '#E65100';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(orb.type === 'AMPLITUDE_X2' ? 'a×2' : 'b×2', p.x, p.y);
      }

      // 5. Draw Lasers & Mathematical Curves
      for (const laser of engine.activeLasers) {
        const p = toScreen(laser.sourcePos, width, height);
        ctx.save();

        if (laser.curveType === 'EXPONENTIAL') {
          // Asymptote line (dashed)
          ctx.setLineDash([4, 4]);
          ctx.strokeStyle = '#90CAF9';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(0, p.y);
          ctx.lineTo(width, p.y);
          ctx.stroke();
          ctx.setLineDash([]);

          // Exponential curve y - y0 = e^(x - x0)
          ctx.beginPath();
          ctx.strokeStyle = laser.isTelegraph ? 'rgba(211, 47, 47, 0.4)' : '#D32F2F';
          ctx.lineWidth = laser.isTelegraph ? 2 : 4;
          if (!laser.isTelegraph) {
            ctx.shadowColor = '#D32F2F';
            ctx.shadowBlur = 12;
          }

          for (let gx = -45; gx <= 45; gx += 2) {
            const gy = laser.sourcePos.y + Math.exp((gx - laser.sourcePos.x) * 0.15);
            const pt = toScreen(vec2(gx, gy), width, height);
            if (gx === -45) ctx.moveTo(pt.x, pt.y);
            else ctx.lineTo(pt.x, pt.y);
          }
          ctx.stroke();
        } else if (laser.curveType === 'SECTOR') {
          // Circular Sector of Pi
          const span = laser.sectorSpan || Math.PI / 3;
          ctx.fillStyle = laser.isTelegraph ? 'rgba(25, 118, 210, 0.2)' : 'rgba(25, 118, 210, 0.4)';
          ctx.strokeStyle = '#1976D2';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.arc(p.x, p.y, 35 * (width / 90), 0, span);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        } else if (laser.curveType === 'SINE' || laser.curveType === 'COSINE') {
          // Wave beam
          ctx.beginPath();
          ctx.strokeStyle = laser.curveType === 'SINE' ? '#3F51B5' : '#D500F9';
          ctx.lineWidth = 3;
          ctx.shadowColor = ctx.strokeStyle;
          ctx.shadowBlur = 8;
          for (let step = 0; step < 80; step += 2) {
            const waveY = p.y + (laser.curveType === 'COSINE' ? Math.cos(step * 0.2) * 12 : Math.sin(step * 0.2) * 12);
            const waveX = p.x + (laser.ownerId === engine.leftEntity.id ? step * 3 : -step * 3);
            if (step === 0) ctx.moveTo(waveX, waveY);
            else ctx.lineTo(waveX, waveY);
          }
          ctx.stroke();
        } else {
          // Polynomial curves (Cubic, Parabola, Linear)
          ctx.beginPath();
          ctx.strokeStyle = laser.isTelegraph ? 'rgba(244, 81, 30, 0.4)' : '#F4511E';
          ctx.lineWidth = laser.isTelegraph ? 2 : 4;
          if (!laser.isTelegraph) {
            ctx.shadowColor = '#F4511E';
            ctx.shadowBlur = 10;
          }

          if (laser.curveType === 'CUBIC') {
            for (let gx = -50; gx <= 50; gx += 2) {
              const dx = (gx - laser.sourcePos.x) * 0.1;
              const gy = laser.sourcePos.y + dx * dx * dx * 5;
              const pt = toScreen(vec2(gx, gy), width, height);
              if (gx === -50) ctx.moveTo(pt.x, pt.y);
              else ctx.lineTo(pt.x, pt.y);
            }
          } else if (laser.curveType === 'PARABOLA') {
            for (let gx = -50; gx <= 50; gx += 2) {
              const dx = (gx - laser.sourcePos.x) * 0.1;
              const gy = laser.sourcePos.y + dx * dx * 8;
              const pt = toScreen(vec2(gx, gy), width, height);
              if (gx === -50) ctx.moveTo(pt.x, pt.y);
              else ctx.lineTo(pt.x, pt.y);
            }
          } else if (laser.curveType === 'LINEAR') {
            // Diagonal line rotated 45 degrees (f(x) = x passing through sourcePos)
            for (let gx = -50; gx <= 50; gx += 5) {
              const gy = laser.sourcePos.y + (gx - laser.sourcePos.x);
              const pt = toScreen(vec2(gx, gy), width, height);
              if (gx === -50) ctx.moveTo(pt.x, pt.y);
              else ctx.lineTo(pt.x, pt.y);
            }
          } else if (laser.curveType === 'HORIZONTAL') {
            // Horizontal line (f(x) = 1 passing through sourcePos.y)
            const ptStart = toScreen(vec2(-50, laser.sourcePos.y), width, height);
            const ptEnd = toScreen(vec2(50, laser.sourcePos.y), width, height);
            ctx.moveTo(ptStart.x, ptStart.y);
            ctx.lineTo(ptEnd.x, ptEnd.y);
          } else {
            ctx.moveTo(0, p.y);
            ctx.lineTo(width, p.y);
          }
          ctx.stroke();
        }
        ctx.restore();
      }

      // 6. Draw Entities
      const entities = [engine.leftEntity, engine.rightEntity, ...engine.subEntities].filter(
        (e) => !e.isDead
      );

      for (const entity of entities) {
        drawEntity(ctx, entity, width, height);
      }

      // 7. Draw Player Aiming Guide Line (UX Enhancement for Touch & Click)
      const playerEntity = engine.leftEntity;
      if (!playerEntity.isDead && engine.status === 'COMBAT') {
        const playerScreen = toScreen(playerEntity.position, width, height);

        if (cursorGamePosRef.current) {
          const cursorScreen = toScreen(cursorGamePosRef.current, width, height);
          ctx.save();
          ctx.setLineDash([4, 4]);
          ctx.strokeStyle = 'rgba(0, 168, 232, 0.45)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(playerScreen.x, playerScreen.y);
          ctx.lineTo(cursorScreen.x, cursorScreen.y);
          ctx.stroke();

          // Target crosshair at cursor
          ctx.setLineDash([]);
          ctx.strokeStyle = '#00A8E8';
          ctx.beginPath();
          ctx.arc(cursorScreen.x, cursorScreen.y, 5, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }
      }

      // 8. Draw Player Drag Arrow (Slingshot Drag)
      const dragStart = dragStartRef.current;
      const dragCurrent = dragCurrentRef.current;
      if (dragStart && dragCurrent) {
        const start = toScreen(dragStart, width, height);
        const curr = toScreen(dragCurrent, width, height);

        ctx.save();
        ctx.strokeStyle = '#00A8E8';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#00A8E8';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(curr.x, curr.y);
        ctx.stroke();

        ctx.fillStyle = '#00A8E8';
        ctx.beginPath();
        ctx.arc(curr.x, curr.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Outer border of arena (#2B2D42, 2.5px width)
      ctx.strokeStyle = '#2B2D42';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(1, 1, width - 2, height - 2);
      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    const drawEntity = (
      ctx: CanvasRenderingContext2D,
      entity: BaseEntity,
      width: number,
      height: number
    ) => {
      const p = toScreen(entity.position, width, height);
      const r = entity.radius * (width / 100);
      const isLeft = entity.team === 'LEFT';
      const isDark = theme === 'dark';

      // 1. Motion Trail (straight vector line trailing behind the moving sphere)
      const velMag = Math.hypot(entity.velocity.x, entity.velocity.y);
      if (velMag > 1.5) {
        const normX = entity.velocity.x / velMag;
        const normY = entity.velocity.y / velMag;
        const screenVx = normX;
        const screenVy = -normY;
        const trailLen = Math.min(55, Math.max(25, velMag * 1.6));

        const trailGrad = ctx.createLinearGradient(
          p.x,
          p.y,
          p.x - screenVx * trailLen,
          p.y - screenVy * trailLen
        );
        const baseColor = isLeft ? '0, 168, 232' : '249, 115, 22';
        trailGrad.addColorStop(0, `rgba(${baseColor}, 0.55)`);
        trailGrad.addColorStop(1, `rgba(${baseColor}, 0)`);

        ctx.save();
        ctx.strokeStyle = trailGrad;
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - screenVx * trailLen, p.y - screenVy * trailLen);
        ctx.stroke();
        ctx.restore();
      }

      ctx.save();

      // Shield or Hexagon for e^x immunity
      if (entity.isImmuneToDerivative) {
        ctx.save();
        ctx.strokeStyle = '#E53935';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let a = 0; a < 6; a++) {
          const angle = (a * Math.PI) / 3 + Date.now() * 0.002;
          const hx = p.x + (r + 7) * Math.cos(angle);
          const hy = p.y + (r + 7) * Math.sin(angle);
          if (a === 0) ctx.moveTo(hx, hy);
          else ctx.lineTo(hx, hy);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
      }

      // Dotted ring for negative phases of 'i'
      if (entity.symbol === 'i' && (entity.currentPhaseIndex === 1 || entity.currentPhaseIndex === 2)) {
        ctx.save();
        ctx.setLineDash([3, 3]);
        ctx.strokeStyle = '#E91E63';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r + 6, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // Burn Ring for Burn effect
      if (entity.hasStatus('BURN')) {
        ctx.save();
        ctx.shadowColor = '#FF5722';
        ctx.shadowBlur = 12;
        ctx.strokeStyle = '#FF5722';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r + 4, 0, Math.PI * 2);
        ctx.stroke();

        // Fiery sparks / particles from burning body
        for (let sp = 0; sp < 4; sp++) {
          const spAngle = (Date.now() * 0.006 + sp * (Math.PI / 2)) % (Math.PI * 2);
          const spDist = r + 5 + ((sp * 3) % 6);
          const spX = p.x + Math.cos(spAngle) * spDist;
          const spY = p.y + Math.sin(spAngle) * spDist;
          ctx.fillStyle = sp % 2 === 0 ? '#FFD54F' : '#FF5722';
          ctx.beginPath();
          ctx.arc(spX, spY, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // Orbital decimal digit tail for Pi (π)
      if (entity.symbol === 'π') {
        const orbitRadius = r + 16;
        const currentDigit = engine.piDigits[entity.activeDecimalIndex % engine.piDigits.length];
        const orbitAngle = Date.now() * 0.003;
        const ox = p.x + orbitRadius * Math.cos(orbitAngle);
        const oy = p.y + orbitRadius * Math.sin(orbitAngle);

        ctx.fillStyle = '#1E88E5';
        ctx.beginPath();
        ctx.arc(ox, oy, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = 'bold 11px monospace';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(currentDigit.toString(), ox, oy);
      }

      // Apéndice / Cola ("Látigo ∫") for Integral (∫)
      if (entity.symbol === '∫') {
        const orbitAngle = Date.now() * 0.0035;
        const isReady = entity.isReady();
        const whipLen = r + 15;
        const tipX = p.x + whipLen * Math.cos(orbitAngle);
        const tipY = p.y + whipLen * Math.sin(orbitAngle);

        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = isReady ? '#FFA000' : 'rgba(251, 140, 0, 0.45)';
        ctx.lineWidth = isReady ? 3.5 : 2;
        if (isReady) {
          ctx.shadowColor = '#FFB300';
          ctx.shadowBlur = 8;
        }
        ctx.moveTo(p.x + r * Math.cos(orbitAngle), p.y + r * Math.sin(orbitAngle));
        ctx.lineTo(tipX, tipY);
        ctx.stroke();

        // Tip hook
        ctx.beginPath();
        ctx.arc(tipX, tipY, 4, orbitAngle - Math.PI / 2, orbitAngle + Math.PI / 2);
        ctx.stroke();

        ctx.font = 'bold 14px serif';
        ctx.fillStyle = isReady ? '#FFD54F' : '#FFA000';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('∫', tipX + 4 * Math.cos(orbitAngle), tipY + 4 * Math.sin(orbitAngle));
        ctx.restore();
      }

      // Visual blinking during invulnerability period (Requirement 2)
      const isInvulnerable = entity.invulnerabilityTimer > 0;
      const blinkAlpha = isInvulnerable ? (Math.floor(Date.now() / 85) % 2 === 0 ? 0.2 : 0.95) : 1.0;

      // 2. Soft Glowing Halo radiating around the sphere
      ctx.save();
      ctx.globalAlpha = blinkAlpha;
      const haloColor = isLeft ? '0, 168, 232' : '249, 115, 22';
      const halo = ctx.createRadialGradient(p.x, p.y, r * 0.6, p.x, p.y, r * 1.9);
      halo.addColorStop(0, `rgba(${haloColor}, 0.38)`);
      halo.addColorStop(1, `rgba(${haloColor}, 0)`);
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r * 1.9, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 3. Main Entity Body
      ctx.fillStyle = isLeft
        ? (isDark ? 'rgba(0, 168, 232, 0.2)' : '#F0FBFD')
        : (isDark ? 'rgba(249, 115, 22, 0.2)' : '#FFF8F3');
      ctx.strokeStyle = isLeft ? '#00A8E8' : '#F97316';
      ctx.lineWidth = 2.5;

      // Ghost transparency for phase i
      if (entity.symbol === 'i' && (entity.currentPhaseIndex === 0 || entity.currentPhaseIndex === 2)) {
        ctx.globalAlpha = 0.6 * blinkAlpha;
      } else {
        ctx.globalAlpha = blinkAlpha;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // 4. Mathematical LaTeX typography inside sphere
      ctx.globalAlpha = blinkAlpha;
      if (entity.symbol === 'd/dx') {
        const textColor = isDark ? '#38BDF8' : '#007A99';
        ctx.fillStyle = textColor;
        ctx.font = 'italic bold 12px "KaTeX_Math", "Times New Roman", serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('d', p.x, p.y - 7);

        ctx.strokeStyle = textColor;
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.moveTo(p.x - 8, p.y - 1);
        ctx.lineTo(p.x + 8, p.y - 1);
        ctx.stroke();

        ctx.font = 'italic bold 11px "KaTeX_Math", "Times New Roman", serif';
        ctx.fillText('dx', p.x, p.y + 7);
      } else if (entity.symbol === 'x³') {
        ctx.fillStyle = isDark ? '#FB923C' : '#C2410C';
        ctx.font = 'italic bold 16px "KaTeX_Math", "Times New Roman", serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('x', p.x - 3, p.y + 1);
        ctx.font = 'bold 11px monospace';
        ctx.fillText('3', p.x + 7, p.y - 5);
      } else if (entity.symbol === 'x²') {
        ctx.fillStyle = isDark ? '#FB923C' : '#C2410C';
        ctx.font = 'italic bold 16px "KaTeX_Math", "Times New Roman", serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('x', p.x - 3, p.y + 1);
        ctx.font = 'bold 11px monospace';
        ctx.fillText('2', p.x + 7, p.y - 5);
      } else if (entity.symbol === 'x') {
        ctx.fillStyle = isDark ? '#FB923C' : '#C2410C';
        ctx.font = 'italic bold 16px "KaTeX_Math", "Times New Roman", serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('x', p.x, p.y);
      } else {
        ctx.fillStyle = isLeft ? (isDark ? '#38BDF8' : '#007A99') : (isDark ? '#FB923C' : '#C2410C');
        ctx.font = 'italic bold 14px "KaTeX_Math", "Times New Roman", serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(entity.symbol, p.x, p.y);
      }

      ctx.restore();
    };

    animId = requestAnimationFrame(render);
    return () => {
      unsubDamage();
      cancelAnimationFrame(animId);
    };
  }, [engine, playerBadgeText, theme]);

  // Pointer Move (tracks cursor for aiming line)
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const gamePos = toGame(x, y, canvas.width, canvas.height);

    cursorGamePosRef.current = gamePos;

    if (dragStartRef.current) {
      dragCurrentRef.current = gamePos;
    }
  };

  const handlePointerLeave = () => {
    cursorGamePosRef.current = null;
    dragStartRef.current = null;
    dragCurrentRef.current = null;
  };

  // Pointer Down (begins drag or click)
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const gamePos = toGame(x, y, canvas.width, canvas.height);

    dragStartRef.current = gamePos;
    dragCurrentRef.current = gamePos;
  };

  // Pointer Up (resolves click dash or drag slingshot)
  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const targetGamePos = toGame(x, y, canvas.width, canvas.height);

    const dragStart = dragStartRef.current;
    const dragCurrent = dragCurrentRef.current;

    if (dragStart && dragCurrent && dragStart.distanceTo(dragCurrent) > 5) {
      // Slingshot drag release
      const impulse = dragCurrent.sub(dragStart);
      engine.applyImpulse('LEFT', impulse.scale(-1), 22);
      soundManager.playBounce();
    } else {
      // Direct click/tap impulse: dash towards target location!
      const playerPos = engine.leftEntity.position;
      const dir = targetGamePos.sub(playerPos);
      if (dir.magnitude() > 1) {
        engine.applyImpulse('LEFT', dir, 20);
        soundManager.playBounce();
      }
    }

    // Add shockwave effect at player ball position
    const screenP = toScreen(engine.leftEntity.position, canvas.width, canvas.height);
    shockwavesRef.current.push({ x: screenP.x, y: screenP.y, radius: 10, alpha: 1.0 });

    dragStartRef.current = null;
    dragCurrentRef.current = null;
  };

  return (
    <div
      className={`relative w-full max-w-[380px] sm:max-w-[400px] aspect-square mx-auto border-[2.5px] border-[#2B2D42] overflow-hidden select-none transition-colors duration-200 ${
        theme === 'dark' ? 'bg-[#060b16]' : 'bg-white'
      }`}
    >
      <canvas
        ref={canvasRef}
        width={400}
        height={400}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onPointerUp={handlePointerUp}
        className="w-full h-full cursor-crosshair touch-none block"
      />
    </div>
  );
};
