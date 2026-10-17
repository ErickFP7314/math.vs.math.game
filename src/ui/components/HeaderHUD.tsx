import React from 'react';
import { BaseEntity } from '../../core/entities/BaseEntity';
import { useLanguage } from '../../i18n/LanguageContext';

interface HeaderHUDProps {
  leftEntity: BaseEntity;
  rightEntity: BaseEntity;
  levelId: number;
}

export const HeaderHUD: React.FC<HeaderHUDProps> = ({ leftEntity, rightEntity, levelId }) => {
  const { t } = useLanguage();
  const levelInfo = t.levels[levelId] || t.levels[1];

  return (
    <div className="w-full max-w-[420px] mx-auto flex items-center justify-between px-3 py-2 bg-slate-950/80 backdrop-blur border-b border-slate-800 rounded-t-lg select-none">
      {/* Left Avatar (Player) */}
      <div className="flex items-center space-x-2">
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center font-bold font-mono text-sm shadow-lg border-2 relative"
          style={{
            borderColor: leftEntity.color,
            backgroundColor: leftEntity.bgColor,
            color: '#111827',
            boxShadow: `0 0 12px ${leftEntity.color}88`,
          }}
        >
          {leftEntity.symbol}
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold font-mono text-slate-100">{levelInfo.leftName}</span>
          <span className="text-[10px] font-mono text-cyan-400 font-semibold">
            {levelInfo.leftLabel}
          </span>
        </div>
      </div>

      {/* VS Badge */}
      <div className="flex flex-col items-center px-2">
        <span className="text-sm font-black tracking-widest text-white px-2 py-0.5 rounded bg-slate-800 border border-slate-700 shadow-inner">
          {t.vs}
        </span>
      </div>

      {/* Right Avatar (Opponent) */}
      <div className="flex items-center space-x-2 flex-row-reverse text-right">
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center font-bold font-mono text-sm shadow-lg border-2 ml-2"
          style={{
            borderColor: rightEntity.color,
            backgroundColor: rightEntity.bgColor,
            color: '#111827',
            boxShadow: `0 0 12px ${rightEntity.color}88`,
          }}
        >
          {rightEntity.symbol}
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold font-mono text-slate-100">{levelInfo.rightName}</span>
          <span className="text-[10px] font-mono text-orange-400 font-semibold">
            {levelInfo.rightLabel}
          </span>
        </div>
      </div>
    </div>
  );
};
