import React from 'react';
import { BaseEntity } from '../../core/entities/BaseEntity';
import { useLanguage } from '../../i18n/LanguageContext';
import { useTheme } from '../../theme/ThemeContext';

interface HPBarProps {
  leftEntity: BaseEntity;
  rightEntity: BaseEntity;
  polyHp?: { current: number; max: number };
  activeSpheresCount: number;
}

export const HPBar: React.FC<HPBarProps> = ({
  leftEntity,
  rightEntity,
  polyHp,
  activeSpheresCount,
}) => {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const leftPercent = Math.max(0, Math.min(100, (leftEntity.hp / leftEntity.maxHp) * 100));
  const rightHp = polyHp ? polyHp.current : rightEntity.hp;
  const rightMaxHp = polyHp ? polyHp.max : rightEntity.maxHp;
  const rightPercent = Math.max(0, Math.min(100, (rightHp / rightMaxHp) * 100));

  // Determine dynamic badge for right entity
  const getRightBadge = () => {
    if (rightEntity.hasStatus('BURN')) return `[${t.onFire}]`;
    if (rightEntity.isImmuneToDerivative) return `[${t.immune}]`;
    if (rightEntity.symbol === 'x³') {
      return rightEntity.isReady()
        ? `[${t.graphInvoke}]`
        : `[${activeSpheresCount} ${t.spheresCount}]`;
    }
    if (rightEntity.symbol === 'eˣ' || rightEntity.symbol === 'eˣʸ') {
      return rightEntity.isReady()
        ? `[${t.expBlade}]`
        : `[${t.recharging} ${Math.ceil(rightEntity.cooldownRemaining)}s]`;
    }
    if (rightEntity.symbol === 'i') {
      const phases = [
        `[${t.phaseI}]`,
        `[${t.phaseMinus1}]`,
        `[${t.phaseMinusI}]`,
        `[${t.phase1}]`,
      ];
      return phases[rightEntity.currentPhaseIndex % 4];
    }
    if (rightEntity.symbol === 'π') {
      return `[${t.sectorSlash} θ = ${(rightEntity.sectorAngle / Math.PI).toFixed(2)}π]`;
    }
    if (rightEntity.symbol === 'cos x' || rightEntity.symbol === 'sin x') {
      return rightEntity.isReady()
        ? `[${t.cosineWave}]`
        : `[T = ${rightEntity.cooldownRemaining.toFixed(1)}s]`;
    }
    return rightEntity.isReady() ? `[${t.ready}]` : `[${t.recharging} ${Math.ceil(rightEntity.cooldownRemaining)}s]`;
  };

  const getLeftBadge = () => {
    if (leftEntity.hasStatus('BURN')) return `[${t.onFire}]`;
    if (leftEntity.symbol === 'd/dx') return `[${t.ready}]`;
    if (leftEntity.symbol === '∂/∂y') return `[${t.partialYReady}]`;
    if (leftEntity.symbol === '∫') return leftEntity.isReady() ? `[${t.integralWhip}]` : `[${t.recharging}]`;
    if (leftEntity.symbol === 'sin x') return leftEntity.isReady() ? `[${t.sineWave}]` : `[T = ${leftEntity.cooldownRemaining.toFixed(1)}s]`;
    return leftEntity.isReady() ? `[${t.ready}]` : `[${t.recharging} ${Math.ceil(leftEntity.cooldownRemaining)}s]`;
  };

  return (
    <div
      className={`w-full max-w-[420px] mx-auto px-3 py-2 border-t font-mono select-none transition-colors duration-200 ${
        isDark ? 'bg-slate-950/90 border-slate-800' : 'bg-slate-50 border-slate-200'
      }`}
    >
      <div className="grid grid-cols-2 gap-3 items-center">
        {/* Left Health Bar */}
        <div className="flex flex-col space-y-1">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-cyan-400">{leftEntity.symbol}</span>
            <span className={`text-[11px] font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              {leftEntity.hp} / {leftEntity.maxHp}
            </span>
          </div>
          <div
            className={`w-full h-3 rounded-full overflow-hidden border relative ${
              isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-200 border-slate-300'
            }`}
          >
            <div
              className="h-full bg-cyan-500 transition-all duration-150 ease-out shadow-sm"
              style={{ width: `${leftPercent}%` }}
            />
          </div>
          <div className="text-[10px] text-cyan-400 font-bold truncate">
            {getLeftBadge()}
          </div>
        </div>

        {/* Right Health Bar */}
        <div className="flex flex-col space-y-1 text-right">
          <div className="flex justify-between items-center text-xs flex-row-reverse">
            <span className="font-bold text-orange-400">{rightEntity.symbol}</span>
            <span className={`text-[11px] font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              {rightHp} / {rightMaxHp}
            </span>
          </div>
          <div
            className={`w-full h-3 rounded-full overflow-hidden border relative ${
              isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-200 border-slate-300'
            }`}
          >
            <div
              className="h-full bg-orange-500 transition-all duration-150 ease-out shadow-sm ml-auto"
              style={{ width: `${rightPercent}%` }}
            />
          </div>
          <div className="text-[10px] text-orange-400 font-bold truncate">
            {getRightBadge()}
          </div>
        </div>
      </div>
    </div>
  );
};
