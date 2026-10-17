import React, { useEffect, useState } from 'react';
import katex from 'katex';
import { globalEventBus } from '../../core/engine/EventBus';
import { soundManager } from '../../audio/WebAudioSynth';

interface FormulaToast {
  id: string;
  html: string;
  color: string;
  createdAt: number;
}

export const FloatingMathText: React.FC = () => {
  const [toasts, setToasts] = useState<FormulaToast[]>([]);

  useEffect(() => {
    const unsubscribe = globalEventBus.on('MATH_FORMULA', (payload) => {
      soundManager.playChime();
      let renderedHtml = payload.latex;
      try {
        renderedHtml = katex.renderToString(payload.latex, {
          displayMode: false,
          throwOnError: false,
        });
      } catch (err) {
        // Fallback to raw text if render fails
        renderedHtml = payload.latex;
      }

      const newToast: FormulaToast = {
        id: `toast_${Date.now()}_${Math.random()}`,
        html: renderedHtml,
        color: payload.color || '#00ACC1',
        createdAt: Date.now(),
      };

      setToasts((prev) => [...prev.slice(-3), newToast]); // keep last 4 toasts
    });

    // Auto cleanup toasts older than 1.8 seconds
    const interval = setInterval(() => {
      const now = Date.now();
      setToasts((prev) => prev.filter((t) => now - t.createdAt < 1800));
    }, 200);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="absolute top-14 left-0 right-0 pointer-events-none flex flex-col items-center space-y-2 z-20">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="px-4 py-1.5 rounded-full shadow-2xl backdrop-blur-md bg-slate-900/90 border border-slate-700 animate-bounce text-sm font-semibold tracking-wide"
          style={{ borderColor: toast.color, color: toast.color }}
          dangerouslySetInnerHTML={{ __html: toast.html }}
        />
      ))}
    </div>
  );
};
