import React, { useEffect, useRef } from 'react';
import { SimulationEngine } from '../core/engine/SimulationEngine';
import { BaseEntity } from '../core/entities/BaseEntity';
import { Vector2D, vec2 } from '../core/physics/Vector2D';
import { soundManager } from '../audio/WebAudioSynth';

interface ArenaCanvasProps {
  engine: SimulationEngine;
  playerBadgeText?: string;
}

export const ArenaCanvas: React.FC<ArenaCanvasProps> = ({ engine, playerBadgeText = 'YOU' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dragStartRef = useRef<Vector2D | null>(null);
  const dragCurrentRef = useRef<Vector2D | null>(null);
  const cursorGamePosRef = useRef<Vector2D | null>(null);
  const shockwavesRef = useRef<{ x: number; y: number; radius: number; alpha: number }[]>([]);

  // Convert game coordinates [-45..45, -75..75] to canvas pixels
  const toScreen = (gamePos: Vector2D, width: number, height: number): { x: number; y: number } => {
    const scaleX = width / 90;
    const scaleY = height / 150;
    return {
      x: (gamePos.x + 45) * scaleX,
      y: (75 - gamePos.y) * scaleY, // invert Y for standard screen coordinates
    };
  };

  const toGame = (screenX: number, screenY: number, width: number, height: number): Vector2D => {
    const scaleX = 90 / width;
    const scaleY = 150 / height;
    return vec2(screenX * scaleX - 45, 75 - screenY * scaleY);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let animId: number;

    const render = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;

      // 1. Clear background (White clean Cartesian paper #FFFFFF)
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);

      // 2. Draw Cartesian Grid (#EEEEEE) and Axes (#333333)
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#EEEEEE';

      const divisionsX = 10;
      const divisionsY = 16;
      for (let i = 0; i <= divisionsX; i++) {
        const x = (i / divisionsX) * width;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let j = 0; j <= divisionsY; j++) {
        const y = (j / divisionsY) * height;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Main X and Y Axes with ticks
      const origin = toScreen(vec2(0, 0), width, height);
      ctx.strokeStyle = '#777777';
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

      // Origin text 'O'
      ctx.font = 'bold 12px monospace';
      ctx.fillStyle = '#999999';
      ctx.fillText('O', origin.x + 4, origin.y + 14);

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
            const waveY = p.y + Math.sin(step * 0.2) * 12;
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
            for (let gx = -45; gx <= 45; gx += 2) {
              const dx = (gx - laser.sourcePos.x) * 0.1;
              const gy = laser.sourcePos.y + dx * dx * dx * 5;
              const pt = toScreen(vec2(gx, gy), width, height);
              if (gx === -45) ctx.moveTo(pt.x, pt.y);
              else ctx.lineTo(pt.x, pt.y);
            }
          } else if (laser.curveType === 'PARABOLA') {
            for (let gx = -45; gx <= 45; gx += 2) {
              const dx = (gx - laser.sourcePos.x) * 0.1;
              const gy = laser.sourcePos.y + dx * dx * 8;
              const pt = toScreen(vec2(gx, gy), width, height);
              if (gx === -45) ctx.moveTo(pt.x, pt.y);
              else ctx.lineTo(pt.x, pt.y);
            }
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

      // 7. Draw Player Crosshair & Aiming Guide Line (UX Enhancement)
      const playerEntity = engine.leftEntity;
      if (!playerEntity.isDead && engine.status === 'COMBAT') {
        const playerScreen = toScreen(playerEntity.position, width, height);

        // A. Draw aiming laser towards cursor if within bounds
        if (cursorGamePosRef.current) {
          const cursorScreen = toScreen(cursorGamePosRef.current, width, height);
          ctx.save();
          ctx.setLineDash([4, 4]);
          ctx.strokeStyle = 'rgba(0, 172, 193, 0.5)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(playerScreen.x, playerScreen.y);
          ctx.lineTo(cursorScreen.x, cursorScreen.y);
          ctx.stroke();

          // Target crosshair at cursor
          ctx.setLineDash([]);
          ctx.strokeStyle = '#00ACC1';
          ctx.beginPath();
          ctx.arc(cursorScreen.x, cursorScreen.y, 6, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }

        // B. Distinct Player Indicator / Target Reticle around Player Sphere
        const r = playerEntity.radius * (width / 90);
        ctx.save();
        const spin = Date.now() * 0.002;
        ctx.strokeStyle = '#00ACC1';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#00ACC1';
        ctx.shadowBlur = 8;

        // Rotating targeting brackets
        ctx.beginPath();
        ctx.arc(playerScreen.x, playerScreen.y, r + 7, spin, spin + Math.PI * 0.6);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(playerScreen.x, playerScreen.y, r + 7, spin + Math.PI, spin + Math.PI * 1.6);
        ctx.stroke();

        // Player badge tag above player ball
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#00838F';
        ctx.fillRect(playerScreen.x - 18, playerScreen.y - r - 17, 36, 12);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(playerBadgeText, playerScreen.x, playerScreen.y - r - 11);
        ctx.restore();
      }

      // 8. Draw Player Drag Arrow (Slingshot Drag)
      const dragStart = dragStartRef.current;
      const dragCurrent = dragCurrentRef.current;
      if (dragStart && dragCurrent) {
        const start = toScreen(dragStart, width, height);
        const curr = toScreen(dragCurrent, width, height);

        ctx.save();
        ctx.strokeStyle = '#00ACC1';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#00ACC1';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(curr.x, curr.y);
        ctx.stroke();

        ctx.fillStyle = '#00ACC1';
        ctx.beginPath();
        ctx.arc(curr.x, curr.y, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Border of arena (#333333)
      ctx.strokeStyle = '#333333';
      ctx.lineWidth = 3;
      ctx.strokeRect(1, 1, width - 2, height - 2);

      animId = requestAnimationFrame(render);
    };

    const drawEntity = (
      ctx: CanvasRenderingContext2D,
      entity: BaseEntity,
      width: number,
      height: number
    ) => {
      const p = toScreen(entity.position, width, height);
      const r = entity.radius * (width / 90);

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

      // Orbital Curl for Integral (∫)
      if (entity.symbol === '∫') {
        const orbitAngle = Date.now() * 0.0025;
        const ox = p.x + (r + 14) * Math.cos(orbitAngle);
        const oy = p.y + (r + 14) * Math.sin(orbitAngle);

        ctx.font = 'bold 16px serif';
        ctx.fillStyle = '#FB8C00';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('∫', ox, oy);
      }

      // Main Entity Glow & Body
      ctx.shadowColor = entity.color;
      ctx.shadowBlur = entity.symbol === 'i' && entity.currentPhaseIndex === 0 ? 4 : 12;
      ctx.fillStyle = entity.bgColor;
      ctx.strokeStyle = entity.color;
      ctx.lineWidth = 2.5;

      // Ghost transparency for phase i
      if (entity.symbol === 'i' && (entity.currentPhaseIndex === 0 || entity.currentPhaseIndex === 2)) {
        ctx.globalAlpha = 0.6;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Entity Symbol Inside Sphere
      ctx.globalAlpha = 1.0;
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#111111';
      ctx.font = `bold ${Math.max(10, Math.round(r * 0.9))}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(entity.symbol, p.x, p.y);

      ctx.restore();
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [engine, playerBadgeText]);

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
      // Direct click impulse: dash towards target location!
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
    <div className="relative w-full max-w-[420px] aspect-[9/16] mx-auto shadow-2xl rounded-lg overflow-hidden border border-slate-700 bg-white">
      <canvas
        ref={canvasRef}
        width={360}
        height={600}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onPointerUp={handlePointerUp}
        className="w-full h-full cursor-crosshair touch-none"
      />
    </div>
  );
};
