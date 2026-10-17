import React from 'react';
import { BaseEntity } from '../../core/entities/BaseEntity';

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
  const leftPercent = Math.max(0, Math.min(100, (leftEntity.hp / leftEntity.maxHp) * 100));
  const rightHp = polyHp ? polyHp.current : rightEntity.hp;
  const rightMaxHp = polyHp ? polyHp.max : rightEntity.maxHp;
  const rightPercent = Math.max(0, Math.min(100, (rightHp / rightMaxHp) * 100));

  // Determine dynamic badge for right entity
  const getRightBadge = () => {
    if (rightEntity.hasStatus('BURN')) return '[화상 중!] (En llamas)';
    if (rightEntity.isImmuneToDerivative) return '[미분 면역!] (Inmune)';
    if (rightEntity.symbol === 'x³') {
      return rightEntity.isReady() ? '[그래프 소환!] (Listo)' : `[공 ${activeSpheresCount}개]`;
    }
    if (rightEntity.symbol === 'eˣ' || rightEntity.symbol === 'eˣʸ') {
      return rightEntity.isReady()
        ? '[지수 칼날!] (Listo)'
        : `[쿨타임 ${Math.ceil(rightEntity.cooldownRemaining)}s]`;
    }
    if (rightEntity.symbol === 'i') {
      const phases = ['[i 관통]', '[-1 반사]', '[-i 관통+반사]', '[1 일반]'];
      return phases[rightEntity.currentPhaseIndex % 4];
    }
    if (rightEntity.symbol === 'π') {
      return `[부채꼴 θ = ${(rightEntity.sectorAngle / Math.PI).toFixed(2)}π]`;
    }
    if (rightEntity.symbol === 'cos x' || rightEntity.symbol === 'sin x') {
      return rightEntity.isReady()
        ? '[코사인파!] (Listo)'
        : `[T = ${rightEntity.cooldownRemaining.toFixed(1)}s]`;
    }
    return rightEntity.isReady() ? '[READY]' : `[${Math.ceil(rightEntity.cooldownRemaining)}s]`;
  };

  const getLeftBadge = () => {
    if (leftEntity.hasStatus('BURN')) return '[화상 중!]';
    if (leftEntity.symbol === 'd/dx') return '[미분 준비] (Listo)';
    if (leftEntity.symbol === '∂/∂y') return '[y 편미분 준비] (One-shot)';
    if (leftEntity.symbol === '∫') return leftEntity.isReady() ? '[∫ 채찍 준비]' : '[충전 중]';
    if (leftEntity.symbol === 'sin x') return leftEntity.isReady() ? '[사인파!]' : `[T = ${leftEntity.cooldownRemaining.toFixed(1)}s]`;
    return leftEntity.isReady() ? '[READY]' : `[${Math.ceil(leftEntity.cooldownRemaining)}s]`;
  };

  return (
    <div className="w-full max-w-[420px] mx-auto px-3 py-2 bg-slate-950/90 border-t border-slate-800 rounded-b-lg font-mono select-none">
      <div className="grid grid-cols-2 gap-3 items-center">
        {/* Left Health Bar */}
        <div className="flex flex-col space-y-1">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-cyan-400">{leftEntity.symbol}</span>
            <span className="text-[11px] font-semibold text-slate-300">
              {leftEntity.hp} / {leftEntity.maxHp}
            </span>
          </div>
          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700 relative">
            <div
              className="h-full bg-cyan-500 transition-all duration-150 ease-out shadow-sm"
              style={{ width: `${leftPercent}%` }}
            />
          </div>
          <div className="text-[10px] text-cyan-300 font-bold truncate">
            {getLeftBadge()}
          </div>
        </div>

        {/* Right Health Bar */}
        <div className="flex flex-col space-y-1 text-right">
          <div className="flex justify-between items-center text-xs flex-row-reverse">
            <span className="font-bold text-orange-400">{rightEntity.symbol}</span>
            <span className="text-[11px] font-semibold text-slate-300">
              {rightHp} / {rightMaxHp}
            </span>
          </div>
          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700 relative">
            <div
              className="h-full bg-orange-500 transition-all duration-150 ease-out shadow-sm ml-auto"
              style={{ width: `${rightPercent}%` }}
            />
          </div>
          <div className="text-[10px] text-orange-300 font-bold truncate">
            {getRightBadge()}
          </div>
        </div>
      </div>
    </div>
  );
};
