import React from 'react';
import { LevelRegistry } from '../../core/levels/LevelRegistry';
import { useLanguage } from '../../i18n/LanguageContext';
import { LanguageSelector } from './LanguageSelector';
import { Play } from 'lucide-react';

interface LevelSelectScreenProps {
  onSelectLevel: (levelId: number) => void;
}

export const LevelSelectScreen: React.FC<LevelSelectScreenProps> = ({ onSelectLevel }) => {
  const levels = LevelRegistry.getLevels();
  const { t } = useLanguage();

  return (
    <div className="w-full max-w-xl mx-auto p-4 flex flex-col space-y-4">
      {/* Top Header with Language Selector */}
      <div className="flex items-center justify-between pb-1 border-b border-slate-800">
        <span className="text-xs font-mono font-bold text-slate-400">MATH.VS.MATH</span>
        <LanguageSelector />
      </div>

      <div className="text-center space-y-1">
        <h1 className="text-2xl font-black font-mono tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-orange-400 to-pink-500">
          {t.gameTitle}
        </h1>
        <p className="text-xs text-slate-400 font-mono">
          {t.gameSubtitle} • {t.selectLevel}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[72vh] overflow-y-auto pr-1">
        {levels.map((lvl) => {
          const info = t.levels[lvl.id] || t.levels[1];
          return (
            <div
              key={lvl.id}
              onClick={() => onSelectLevel(lvl.id)}
              className="group relative bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-cyan-500/50 rounded-xl p-3.5 transition-all duration-200 cursor-pointer shadow-lg hover:shadow-cyan-500/10 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {t.levelBadge} {lvl.id}
                  </span>
                  <span className="text-xs font-black font-mono text-cyan-400">
                    {info.subtitle}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                  {info.title}
                </h3>
                <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                  {info.description}
                </p>
              </div>

              <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-800/60">
                <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 font-mono">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span>{lvl.leftEntityConfig.symbol}</span>
                  <span className="text-slate-600">{t.vs}</span>
                  <span className="w-2 h-2 rounded-full bg-orange-400" />
                  <span>{lvl.rightEntityConfig.symbol}</span>
                </div>
                <div className="w-7 h-7 rounded-lg bg-cyan-500/10 group-hover:bg-cyan-500 group-hover:text-white text-cyan-400 flex items-center justify-center transition-all">
                  <Play className="w-3.5 h-3.5 fill-current" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
