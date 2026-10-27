import React from 'react';
import { LevelRegistry } from '../../core/levels/LevelRegistry';
import { useLanguage } from '../../i18n/LanguageContext';
import { useTheme } from '../../theme/ThemeContext';
import { LanguageSelector } from './LanguageSelector';
import { Play, Sun, Moon, BookOpen, Zap } from 'lucide-react';

interface LevelSelectScreenProps {
  onSelectLevel: (levelId: number) => void;
  onViewMathGuide?: (levelId?: number) => void;
}

export const LevelSelectScreen: React.FC<LevelSelectScreenProps> = ({
  onSelectLevel,
  onViewMathGuide,
}) => {
  const levels = LevelRegistry.getLevels();
  const { t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="w-full max-w-3xl mx-auto p-4 sm:p-6 flex flex-col space-y-6">
      {/* Top Header with Brand, Theme Toggle & Language Selector */}
      <div
        className={`flex items-center justify-between pb-3 border-b transition-colors duration-200 ${
          isDark ? 'border-slate-800' : 'border-slate-300'
        }`}
      >
        <div className="flex items-center space-x-1.5">
          <Zap className="w-4 h-4 text-cyan-400 fill-cyan-400" />
          <span className="text-sm font-mono font-black tracking-wider text-cyan-400">
            MATH.VS.MATH
          </span>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3">
          {onViewMathGuide && (
            <button
              onClick={() => onViewMathGuide()}
              className={`px-3 py-2 rounded-xl transition-all border flex items-center space-x-1.5 text-xs font-mono font-bold ${
                isDark
                  ? 'bg-slate-900 border-slate-700 text-cyan-400 hover:bg-slate-800 hover:border-cyan-500/50'
                  : 'bg-white border-slate-300 text-cyan-600 hover:bg-slate-50 shadow-sm'
              }`}
              title={t.mathGuide}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.mathGuide}</span>
            </button>
          )}

          <button
            onClick={toggleTheme}
            className={`p-2 rounded-xl transition-all border ${
              isDark
                ? 'bg-slate-900 border-slate-700 text-yellow-400 hover:bg-slate-800'
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50 shadow-sm'
            }`}
            title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <LanguageSelector />
        </div>
      </div>

      {/* Main Title Section */}
      <div className="text-center space-y-2 py-1">
        <h1 className="text-3xl sm:text-5xl font-black font-mono tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-orange-400 to-pink-500">
          {t.gameTitle}
        </h1>
        <p
          className={`text-sm sm:text-base font-mono transition-colors duration-200 ${
            isDark ? 'text-slate-400' : 'text-slate-600'
          }`}
        >
          {t.gameSubtitle} • {t.selectLevel}
        </p>
      </div>

      {/* Levels Grid with custom stylized scrollbar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[68vh] overflow-y-auto pr-2 custom-scrollbar">
        {levels.map((lvl) => {
          const info = t.levels[lvl.id] || t.levels[1];
          return (
            <div
              key={lvl.id}
              onClick={() => onSelectLevel(lvl.id)}
              className={`group relative rounded-2xl p-5 transition-all duration-200 cursor-pointer flex flex-col justify-between border ${
                isDark
                  ? 'bg-slate-900/90 hover:bg-slate-800/90 border-slate-800 hover:border-cyan-500/50 shadow-lg hover:shadow-cyan-500/10'
                  : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-cyan-500/60 shadow-md hover:shadow-cyan-500/15'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-xs font-bold font-mono px-2.5 py-1 rounded-lg border ${
                      isDark
                        ? 'bg-slate-800 text-slate-200 border-slate-700'
                        : 'bg-slate-100 text-slate-800 border-slate-300'
                    }`}
                  >
                    {t.levelBadge} {lvl.id}
                  </span>
                  <span className="text-sm font-black font-mono text-cyan-400">
                    {info.subtitle}
                  </span>
                </div>
                <h3
                  className={`text-base sm:text-lg font-bold group-hover:text-cyan-400 transition-colors ${
                    isDark ? 'text-slate-100' : 'text-slate-900'
                  }`}
                >
                  {info.title}
                </h3>
                <p
                  className={`text-xs sm:text-sm line-clamp-2 mt-2 leading-relaxed transition-colors ${
                    isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}
                >
                  {info.description}
                </p>
              </div>

              <div
                className={`mt-4 flex items-center justify-between pt-3 border-t transition-colors ${
                  isDark ? 'border-slate-800/80' : 'border-slate-200'
                }`}
              >
                <div
                  className={`flex items-center space-x-2 text-xs font-mono font-semibold ${
                    isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                  <span>{lvl.leftEntityConfig.symbol}</span>
                  <span className="text-slate-500">{t.vs}</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-400" />
                  <span>{lvl.rightEntityConfig.symbol}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {onViewMathGuide && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewMathGuide(lvl.id);
                      }}
                      className="w-9 h-9 rounded-xl bg-slate-800/40 hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-400 border border-slate-700/50 flex items-center justify-center transition-all"
                      title={t.mathGuide}
                    >
                      <BookOpen className="w-4 h-4" />
                    </button>
                  )}
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/10 group-hover:bg-cyan-500 group-hover:text-white text-cyan-400 flex items-center justify-center transition-all shadow-sm">
                    <Play className="w-4 h-4 fill-current" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
