import React, { useEffect, useState } from 'react';
import katex from 'katex';
import { globalEventBus } from '../../core/engine/EventBus';
import { soundManager } from '../../audio/WebAudioSynth';

interface Onomatopoeia {
  id: string;
  html: string;
  color: string;
  xPercent: number;
  yPercent: number;
  createdAt: number;
  isDamage?: boolean;
}

export const FloatingMathText: React.FC = () => {
  const [items, setItems] = useState<Onomatopoeia[]>([]);

  useEffect(() => {
    const unsubFormula = globalEventBus.on('MATH_FORMULA', (payload) => {
      soundManager.playChime();
      let renderedHtml = payload.latex;
      try {
        renderedHtml = katex.renderToString(payload.latex, {
          displayMode: false,
          throwOnError: false,
        });
      } catch {
        renderedHtml = payload.latex;
      }

      // Convert game coordinates [-50..50, -50..50] to arena percentage
      const rawX = payload.position ? payload.position.x : 0;
      const rawY = payload.position ? payload.position.y : 0;
      const xPercent = Math.max(10, Math.min(90, ((rawX + 50) / 100) * 100));
      const yPercent = Math.max(10, Math.min(90, ((50 - rawY) / 100) * 100));

      const newItem: Onomatopoeia = {
        id: `ono_${Date.now()}_${Math.random()}`,
        html: renderedHtml,
        color: payload.color || '#00ACC1',
        xPercent,
        yPercent,
        createdAt: Date.now(),
      };

      setItems((prev) => [...prev.slice(-6), newItem]); // keep last active
    });

    const unsubDamage = globalEventBus.on('DAMAGE_DEALT', (payload) => {
      soundManager.playDamage();

      const rawX = payload.position ? payload.position.x : 0;
      const rawY = payload.position ? payload.position.y : 0;
      const xPercent = Math.max(10, Math.min(90, ((rawX + 50) / 100) * 100));
      const yPercent = Math.max(10, Math.min(90, ((50 - rawY) / 100) * 100));

      const newItem: Onomatopoeia = {
        id: `dmg_${Date.now()}_${Math.random()}`,
        html: `-${payload.amount}`,
        color: payload.color || '#EF4444',
        xPercent,
        yPercent,
        createdAt: Date.now(),
        isDamage: true,
      };

      setItems((prev) => [...prev.slice(-6), newItem]);
    });

    // Cleanup items older than 1.4 seconds
    const interval = setInterval(() => {
      const now = Date.now();
      setItems((prev) => prev.filter((item) => now - item.createdAt < 1400));
    }, 150);

    return () => {
      unsubFormula();
      unsubDamage();
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-30">
      {items.map((item) => (
        <div
          key={item.id}
          className={`absolute select-none font-black italic tracking-wide text-center whitespace-nowrap ${
            item.isDamage
              ? 'text-4xl sm:text-5xl font-mono text-red-500 animate-damage-float'
              : 'text-2xl sm:text-3xl animate-onomatopoeia'
          }`}
          style={{
            left: `${item.xPercent}%`,
            top: `${item.yPercent}%`,
            color: item.color,
            textShadow: item.isDamage
              ? `0 0 16px ${item.color}, 0 2px 8px rgba(0,0,0,0.95)`
              : `0 0 16px ${item.color}, 0 0 32px ${item.color}, 0 2px 4px rgba(0,0,0,0.85)`,
            filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.9))',
          }}
          dangerouslySetInnerHTML={{ __html: item.html }}
        />
      ))}
    </div>
  );
};
