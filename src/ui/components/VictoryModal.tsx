import React, { useEffect } from 'react';
import { soundManager } from '../../audio/WebAudioSynth';
import { useLanguage } from '../../i18n/LanguageContext';
import { RotateCcw, ArrowRight, Grid, BookOpen } from 'lucide-react';

interface VictoryModalProps {
  winner: 'LEFT' | 'RIGHT' | null;
  winnerSymbol: string;
  winnerName: string;
  remainingHp: number;
  onRestart: () => void;
  onNextLevel: () => void;
  onSelectLevel: () => void;
  onViewMathInfo?: () => void;
  hasNextLevel: boolean;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  winner,
  winnerSymbol,
  winnerName,
  remainingHp,
  onRestart,
  onNextLevel,
  onSelectLevel,
  onViewMathInfo,
  hasNextLevel,
}) => {
  const { t } = useLanguage();

  useEffect(() => {
    soundManager.playVictory();
  }, []);

  const isLeftWinner = winner === 'LEFT';

  return (
    <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md z-30 flex items-center justify-center p-4 animate-modal-backdrop">
      <div className="w-full max-w-sm bg-slate-900 border-2 border-slate-700 rounded-2xl p-6 shadow-2xl text-center flex flex-col items-center space-y-4 animate-modal-pop">
        <div>
          <h2
            className="text-2xl font-black font-mono tracking-tight"
            style={{ color: isLeftWinner ? '#00ACC1' : '#F4511E' }}
          >
            {winnerSymbol} {t.victory}
          </h2>
          <p className="text-sm text-slate-300 font-semibold mt-0.5">
            {winnerName}
          </p>
        </div>

        <div className="bg-slate-800/80 px-4 py-2 rounded-lg border border-slate-700 font-mono text-sm text-slate-200">
          {t.remainingHp}: <span className="font-bold text-amber-400">{remainingHp}</span>
        </div>

        <div className="w-full flex flex-col space-y-2 pt-2">
          {hasNextLevel && (
            <button
              onClick={onNextLevel}
              className="w-full py-2.5 px-4 rounded-xl font-bold font-mono text-sm bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25 flex items-center justify-center space-x-2 transition-all active:scale-95"
            >
              <span>{t.nextLevel}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={onRestart}
            className="w-full py-2.5 px-4 rounded-xl font-bold font-mono text-sm bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center space-x-2 transition-all active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{t.retry}</span>
          </button>

          {onViewMathInfo && (
            <button
              onClick={onViewMathInfo}
              className="w-full py-2.5 px-4 rounded-xl font-bold font-mono text-sm bg-slate-800/70 hover:bg-slate-700 text-cyan-400 border border-cyan-800/50 flex items-center justify-center space-x-2 transition-all active:scale-95"
            >
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>{t.mathGuide}</span>
            </button>
          )}

          <button
            onClick={onSelectLevel}
            className="w-full py-2 px-4 rounded-xl font-mono text-xs text-slate-400 hover:text-slate-200 flex items-center justify-center space-x-1.5 transition-colors"
          >
            <Grid className="w-3.5 h-3.5" />
            <span>{t.backToLevels}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
