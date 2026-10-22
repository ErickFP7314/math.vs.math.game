import React, { useState, useEffect, useRef } from 'react';
import { BaseEntity } from '../../core/entities/BaseEntity';
import { useLanguage } from '../../i18n/LanguageContext';
import { useTheme } from '../../theme/ThemeContext';
import { globalEventBus } from '../../core/engine/EventBus';

interface HPBarProps {
  leftEntity: BaseEntity;
  rightEntity: BaseEntity;
  polyHp?: { current: number; max: number };
  activeSpheresCount: number;
  levelId?: number;
  derivativeHitCount?: number;
}

export const HPBar: React.FC<HPBarProps> = ({
  leftEntity,
  rightEntity,
  polyHp,
  activeSpheresCount,
  levelId = 1,
  derivativeHitCount = 0,
}) => {
  const { t, language } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const isKo = language === 'ko';

  const [shakingLeft, setShakingLeft] = useState(false);
  const [shakingRight, setShakingRight] = useState(false);
  const leftShakeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const rightShakeTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const unsubDamage = globalEventBus.on('DAMAGE_DEALT', (payload) => {
      if (payload.targetId === leftEntity.id) {
        setShakingLeft(true);
        if (leftShakeTimerRef.current) clearTimeout(leftShakeTimerRef.current);
        leftShakeTimerRef.current = setTimeout(() => setShakingLeft(false), 450);
      } else {
        setShakingRight(true);
        if (rightShakeTimerRef.current) clearTimeout(rightShakeTimerRef.current);
        rightShakeTimerRef.current = setTimeout(() => setShakingRight(false), 450);
      }
    });

    return () => {
      unsubDamage();
      if (leftShakeTimerRef.current) clearTimeout(leftShakeTimerRef.current);
      if (rightShakeTimerRef.current) clearTimeout(rightShakeTimerRef.current);
    };
  }, [leftEntity.id, rightEntity.id]);

  const leftPercent = Math.max(0, Math.min(100, (leftEntity.hp / leftEntity.maxHp) * 100));
  const rightHp = polyHp ? polyHp.current : rightEntity.hp;
  const rightMaxHp = polyHp ? polyHp.max : rightEntity.maxHp;
  const rightPercent = Math.max(0, Math.min(100, (rightHp / rightMaxHp) * 100));

  // Determine dynamic badge for right entity
  const getRightBadge = () => {
    if (rightEntity.hasStatus('BURN')) return `[${t.onFire}]`;
    if (rightEntity.isImmuneToDerivative && levelId === 2) return `[${t.blade}]`;

    if (levelId === 1) {
      return isKo ? `[공 ${activeSpheresCount}개]` : `[${activeSpheresCount} ${t.spheresCount}]`;
    }
    if (levelId === 2 || levelId === 4 || levelId === 6 || levelId === 8) {
      return `[${t.blade}]`;
    }
    if (levelId === 5) {
      const ampStr = rightEntity.amplitude > 1 ? `${rightEntity.amplitude}` : '';
      const freqStr = rightEntity.frequency > 1 ? `${rightEntity.frequency}x` : 'x';
      const funcName = rightEntity.symbol.replace('x', freqStr);
      const periodStr = rightEntity.frequency > 1 ? `π = 3.14s` : `2π = 6.28s`;
      return `[y = ${ampStr}${funcName}] ${periodStr}`;
    }
    if (levelId === 7) {
      const ampStr = rightEntity.amplitude > 1 ? `${rightEntity.amplitude}` : '';
      const freqStr = rightEntity.frequency > 1 ? `${rightEntity.frequency}x` : 'x';
      const periodStr = rightEntity.frequency > 1 ? `π = 3.14s` : `2π = 6.28s`;
      return `[y = ${ampStr}cos ${freqStr}] ${periodStr}`;
    }
    if (levelId === 8 || levelId === 9) {
      return `[${t.nextSector} θ = ${(rightEntity.sectorAngle / Math.PI).toFixed(2)}π]`;
    }
    if (levelId === 3 || rightEntity.symbol === 'i' || rightEntity.symbol === '-1' || rightEntity.symbol === '-i' || rightEntity.symbol === '1') {
      const phases = [
        `[${t.phaseI}]`,
        `[${t.phaseMinus1}]`,
        `[${t.phaseMinusI}]`,
        `[${t.phase1}]`,
      ];
      return phases[rightEntity.currentPhaseIndex % 4];
    }
    return rightEntity.isReady() ? `[${t.ready}]` : `[${t.recharging} ${Math.ceil(rightEntity.cooldownRemaining)}s]`;
  };

  const getLeftBadge = () => {
    if (leftEntity.hasStatus('BURN')) return `[${t.onFire}]`;
    if (levelId === 1) {
      const count = Math.max(1, derivativeHitCount);
      return isKo ? `[미분 ${count}회]` : `[${t.derivationsCount} ${count}]`;
    }
    if (levelId === 2 || levelId === 5) {
      const count = Math.max(1, derivativeHitCount);
      return isKo ? `[미분 시도 ${count}회]` : `[${t.derivativeAttempt} ${count}]`;
    }
    if (levelId === 3) {
      return leftEntity.isReady()
        ? `[${t.expBlade}]`
        : `[${t.blade} ${leftEntity.cooldownRemaining.toFixed(1)}s]`;
    }
    if (levelId === 8) {
      return `[${t.blade}]`;
    }
    if (levelId === 4) {
      return `[${t.partialYReady}]`;
    }
    if (levelId === 6) {
      return `[${t.integralWhipReady}]`;
    }
    if (levelId === 7) {
      const ampStr = leftEntity.amplitude > 1 ? `${leftEntity.amplitude}` : '';
      const freqStr = leftEntity.frequency > 1 ? `${leftEntity.frequency}x` : 'x';
      const periodStr = leftEntity.frequency > 1 ? `π = 3.14s` : `2π = 6.28s`;
      return `[y = ${ampStr}sin ${freqStr}] ${periodStr}`;
    }
    if (levelId === 9 || leftEntity.symbol === 'i') {
      const phases = [
        `[${t.phaseI}]`,
        `[${t.phaseMinus1}]`,
        `[${t.phaseMinusI}]`,
        `[${t.phase1}]`,
      ];
      return phases[leftEntity.currentPhaseIndex % 4];
    }
    return leftEntity.isReady() ? `[${t.ready}]` : `[${t.recharging} ${Math.ceil(leftEntity.cooldownRemaining)}s]`;
  };

  return (
    <div
      className={`w-full max-w-[400px] mx-auto px-1 pt-2 pb-1 font-mono select-none transition-colors duration-200 ${
        isDark ? 'bg-slate-950' : 'bg-white'
      }`}
    >
      <div className="grid grid-cols-2 gap-3 items-center">
        {/* Left Health Bar (Cyan) */}
        <div className={`flex flex-col transition-transform ${shakingLeft ? 'animate-hp-shake' : ''}`}>
          <div
            className={`w-full h-6 rounded-[2px] overflow-hidden border relative flex items-center justify-center ${
              isDark ? 'bg-slate-800 border-cyan-800' : 'bg-slate-100 border-[#0090C8]'
            }`}
          >
            {/* Fill proportion */}
            <div
              className="absolute left-0 top-0 bottom-0 bg-[#00A8E8] transition-all duration-150 ease-out"
              style={{ width: `${leftPercent}%` }}
            />
            {/* Text centered inside the bar */}
            <span className="relative z-10 text-xs font-black text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
              {leftEntity.hp} / {leftEntity.maxHp}
            </span>
          </div>
          <div className="text-[11px] font-bold text-[#64748B] mt-1 pl-0.5 tracking-tight">
            {getLeftBadge()}
          </div>
        </div>

        {/* Right Health Bar (Orange) */}
        <div className={`flex flex-col text-right transition-transform ${shakingRight ? 'animate-hp-shake' : ''}`}>
          <div
            className={`w-full h-6 rounded-[2px] overflow-hidden border relative flex items-center justify-center ${
              isDark ? 'bg-slate-800 border-orange-800' : 'bg-slate-100 border-[#EA580C]'
            }`}
          >
            {/* Fill proportion */}
            <div
              className="absolute right-0 top-0 bottom-0 bg-[#F97316] transition-all duration-150 ease-out"
              style={{ width: `${rightPercent}%` }}
            />
            {/* Text centered inside the bar */}
            <span className="relative z-10 text-xs font-black text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
              {rightHp} / {rightMaxHp}
            </span>
          </div>
          <div className="text-[11px] font-bold text-[#64748B] mt-1 pr-0.5 tracking-tight">
            {getRightBadge()}
          </div>
        </div>
      </div>
    </div>
  );
};
