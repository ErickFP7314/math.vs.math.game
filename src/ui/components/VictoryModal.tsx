import React, { useEffect } from 'react';
import { soundManager } from '../../audio/WebAudioSynth';
import { Trophy, RotateCcw, ArrowRight, Grid } from 'lucide-react';

interface VictoryModalProps {
  winner: 'LEFT' | 'RIGHT' | null;
  winnerSymbol: string;
  winnerName: string;
  remainingHp: number;
  onRestart: () => void;
  onNextLevel: () => void;
  onSelectLevel: () => void;
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
  hasNextLevel,
}) => {
  useEffect(() => {
    soundManager.playVictory();
  }, []);

  const isLeftWinner = winner === 'LEFT';

  return (
    <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm z-30 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-slate-900 border-2 border-slate-700 rounded-2xl p-6 shadow-2xl text-center flex flex-col items-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-full bg-amber-500/10 border-2 border-amber-500 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/20">
          <Trophy className="w-8 h-8" />
        </div>

        <div>
          <h2
            className="text-2xl font-black font-mono tracking-tight"
            style={{ color: isLeftWinner ? '#00ACC1' : '#F4511E' }}
          >
            {winnerSymbol} 승리!
          </h2>
          <p className="text-sm text-slate-300 font-semibold mt-0.5">
            ¡Victoria de {winnerName}!
          </p>
        </div>

        <div className="bg-slate-800/80 px-4 py-2 rounded-lg border border-slate-700 font-mono text-sm text-slate-200">
          남은 HP: <span className="font-bold text-amber-400">{remainingHp}</span>
        </div>

        <div className="w-full flex flex-col space-y-2 pt-2">
          {hasNextLevel && (
            <button
              onClick={onNextLevel}
              className="w-full py-2.5 px-4 rounded-xl font-bold font-mono text-sm bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25 flex items-center justify-center space-x-2 transition-all active:scale-95"
            >
              <span>Siguiente Nivel</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={onRestart}
            className="w-full py-2.5 px-4 rounded-xl font-bold font-mono text-sm bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center space-x-2 transition-all active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reintentar Partida</span>
          </button>

          <button
            onClick={onSelectLevel}
            className="w-full py-2 px-4 rounded-xl font-mono text-xs text-slate-400 hover:text-slate-200 flex items-center justify-center space-x-1.5 transition-colors"
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Selector de Niveles</span>
          </button>
        </div>
      </div>
    </div>
  );
};
