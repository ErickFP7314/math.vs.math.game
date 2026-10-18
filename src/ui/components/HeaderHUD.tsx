import React from 'react';
import { BaseEntity } from '../../core/entities/BaseEntity';
import { useLanguage } from '../../i18n/LanguageContext';
import { useTheme } from '../../theme/ThemeContext';

interface HeaderHUDProps {
  leftEntity: BaseEntity;
  rightEntity: BaseEntity;
  levelId: number;
}

export const HeaderHUD: React.FC<HeaderHUDProps> = ({ leftEntity, rightEntity, levelId }) => {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const levelInfo = t.levels[levelId] || t.levels[1];

  const renderFormulaContent = (symbol: string, color: string) => {
    if (symbol === 'd/dx') {
      return (
        <div className="flex flex-col items-center justify-center leading-none font-serif font-bold select-none" style={{ color }}>
          <span className="text-[13px] italic">d</span>
          <span className="w-5 h-[1.5px] my-[1px]" style={{ backgroundColor: color }} />
          <span className="text-[12px] italic">dx</span>
        </div>
      );
    }
    if (symbol === 'x³') {
      return (
        <div className="flex items-center justify-center font-serif font-bold select-none text-xl" style={{ color }}>
          <span className="italic">x</span>
          <span className="text-xs relative -top-2 font-mono">3</span>
        </div>
      );
    }
    if (symbol === 'x²') {
      return (
        <div className="flex items-center justify-center font-serif font-bold select-none text-xl" style={{ color }}>
          <span className="italic">x</span>
          <span className="text-xs relative -top-2 font-mono">2</span>
        </div>
      );
    }
    return (
      <span className="font-serif italic font-bold text-base" style={{ color }}>
        {symbol}
      </span>
    );
  };

  return (
    <div
      className={`w-full max-w-[400px] mx-auto flex items-center justify-between px-6 pt-3 pb-2 select-none transition-colors duration-200 ${
        isDark ? 'bg-slate-950 text-white' : 'bg-white text-slate-900'
      }`}
    >
      {/* Left Avatar & Label (Player) */}
      <div className="flex flex-col items-center">
        <div
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center border-[2.5px] relative"
          style={{
            borderColor: '#00A8E8',
            backgroundColor: isDark ? 'rgba(0, 168, 232, 0.15)' : '#F0FBFD',
            boxShadow: '0 0 25px 6px rgba(0, 168, 232, 0.45)',
          }}
        >
          {renderFormulaContent(leftEntity.symbol, isDark ? '#38BDF8' : '#007A99')}
        </div>
        <span
          className="mt-1 text-sm font-bold tracking-wide"
          style={{ color: '#00A8E8' }}
        >
          {levelInfo.leftLabel || leftEntity.name}
        </span>
      </div>

      {/* Center VS Title */}
      <div className="flex items-center justify-center px-4">
        <span
          className={`text-3xl sm:text-4xl font-black font-sans tracking-wide ${
            isDark ? 'text-slate-100' : 'text-[#1E293B]'
          }`}
        >
          VS
        </span>
      </div>

      {/* Right Avatar & Label (Opponent) */}
      <div className="flex flex-col items-center">
        <div
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center border-[2.5px] relative"
          style={{
            borderColor: '#F97316',
            backgroundColor: isDark ? 'rgba(249, 115, 22, 0.15)' : '#FFF8F3',
            boxShadow: '0 0 25px 6px rgba(249, 115, 22, 0.45)',
          }}
        >
          {renderFormulaContent(rightEntity.symbol, isDark ? '#FB923C' : '#C2410C')}
        </div>
        <span
          className="mt-1 text-sm font-bold tracking-wide font-serif italic"
          style={{ color: '#F97316' }}
        >
          {levelInfo.rightLabel || rightEntity.symbol}
        </span>
      </div>
    </div>
  );
};
