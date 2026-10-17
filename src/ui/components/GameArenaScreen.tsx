import React, { useEffect, useState, useRef } from 'react';
import { SimulationEngine } from '../../core/engine/SimulationEngine';
import { LevelRegistry } from '../../core/levels/LevelRegistry';
import { GameLoop } from '../../core/engine/GameLoop';
import { globalEventBus } from '../../core/engine/EventBus';
import { soundManager } from '../../audio/WebAudioSynth';
import { HeaderHUD } from './HeaderHUD';
import { HPBar } from './HPBar';
import { ArenaCanvas } from '../../render/ArenaCanvas';
import { FloatingMathText } from './FloatingMathText';
import { VictoryModal } from './VictoryModal';
import { Volume2, VolumeX, RotateCcw, ArrowLeft, Zap } from 'lucide-react';

interface GameArenaScreenProps {
  levelId: number;
  onBackToMenu: () => void;
  onSelectNextLevel: (nextLevelId: number) => void;
}

export const GameArenaScreen: React.FC<GameArenaScreenProps> = ({
  levelId,
  onBackToMenu,
  onSelectNextLevel,
}) => {
  const level = LevelRegistry.getLevel(levelId) || LevelRegistry.getLevels()[0];
  const [engine, setEngine] = useState(() => new SimulationEngine(level));
  const [, setRenderTrigger] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(3);
  const [matchWinner, setMatchWinner] = useState<{
    winner: 'LEFT' | 'RIGHT';
    remainingHp: number;
    symbol: string;
  } | null>(null);

  const loopRef = useRef<GameLoop | null>(null);

  useEffect(() => {
    const newEngine = new SimulationEngine(level);
    setEngine(newEngine);
    setMatchWinner(null);
    setCountdown(3);

    // Subscribe to events
    const unsubCountdown = globalEventBus.on('MATCH_COUNTDOWN', (payload) => {
      setCountdown(payload.count);
      soundManager.playCountdown(payload.count);
    });

    const unsubStart = globalEventBus.on('MATCH_START', () => {
      setCountdown(null);
      soundManager.playCountdown(0);
    });

    const unsubOver = globalEventBus.on('MATCH_OVER', (payload) => {
      setMatchWinner({
        winner: payload.winner,
        remainingHp: payload.remainingHp,
        symbol: payload.symbol,
      });
    });

    // Start game loop
    const loop = new GameLoop(
      (dt) => {
        newEngine.update(dt);
      },
      () => {
        // Force state sync for HUD
        setRenderTrigger((r) => r + 1);
      }
    );

    loopRef.current = loop;
    loop.start();

    // Spacebar listener for active skill
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        newEngine.triggerSkill('LEFT');
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      loop.stop();
      window.removeEventListener('keydown', handleKeyDown);
      unsubCountdown();
      unsubStart();
      unsubOver();
    };
  }, [levelId, level]);

  const handleRestart = () => {
    const newEngine = new SimulationEngine(level);
    setEngine(newEngine);
    setMatchWinner(null);
    setCountdown(3);
  };

  const handleNext = () => {
    onSelectNextLevel(levelId + 1);
  };

  const toggleSound = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  const triggerPlayerSkill = () => {
    engine.triggerSkill('LEFT');
  };

  const canUseSkill = engine.leftEntity.isReady() && engine.status === 'COMBAT';

  return (
    <div className="w-full flex flex-col items-center justify-center p-2 relative max-w-md mx-auto">
      {/* Top Controls Toolbar */}
      <div className="w-full max-w-[420px] flex items-center justify-between px-2 py-1 mb-1 text-slate-400">
        <button
          onClick={onBackToMenu}
          className="flex items-center space-x-1 text-xs font-mono hover:text-cyan-400 transition-colors p-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Niveles</span>
        </button>

        <div className="text-[11px] font-mono font-bold text-slate-300">
          NIVEL {level.id}: {level.subtitle}
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={toggleSound}
            className="p-1 hover:text-slate-200 transition-colors"
            title="Silenciar / Activar Sonido"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>
          <button
            onClick={handleRestart}
            className="p-1 hover:text-slate-200 transition-colors"
            title="Reiniciar Nivel"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Game Stage Container */}
      <div className="relative w-full max-w-[420px] rounded-xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-950 flex flex-col">
        {/* Header HUD */}
        <HeaderHUD leftEntity={engine.leftEntity} rightEntity={engine.rightEntity} />

        {/* Floating KaTeX Formulas */}
        <FloatingMathText />

        {/* Countdown Overlay (3, 2, 1) */}
        {countdown !== null && engine.status === 'COUNTDOWN' && (
          <div className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center bg-black/30 backdrop-blur-[2px]">
            <div className="text-7xl font-black font-mono text-cyan-400 drop-shadow-[0_0_20px_rgba(0,172,193,0.8)] animate-ping duration-700">
              {countdown}
            </div>
          </div>
        )}

        {/* Canvas Arena */}
        <ArenaCanvas engine={engine} />

        {/* HUD Lower Bars */}
        <HPBar
          leftEntity={engine.leftEntity}
          rightEntity={engine.rightEntity}
          polyHp={engine.polyGlobalHp}
          activeSpheresCount={engine.subEntities.length + (engine.rightEntity.isDead ? 0 : 1)}
        />

        {/* Skill Action Button & Drag Tip */}
        <div className="p-2.5 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
          <div className="text-[10px] text-slate-400 font-mono leading-tight">
            💡 <span className="text-cyan-400">Arrastra</span> para desviar • <span className="text-cyan-400">Espacio</span> para habilidad
          </div>

          <button
            onClick={triggerPlayerSkill}
            disabled={!canUseSkill}
            className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold flex items-center space-x-1.5 shadow-md transition-all active:scale-95 ${
              canUseSkill
                ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/20'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>
              {canUseSkill
                ? '¡HABILIDAD!'
                : `Recarga (${Math.ceil(engine.leftEntity.cooldownRemaining)}s)`}
            </span>
          </button>
        </div>

        {/* Victory / Defeat Modal */}
        {matchWinner && (
          <VictoryModal
            winner={matchWinner.winner}
            winnerSymbol={matchWinner.symbol}
            winnerName={matchWinner.winner === 'LEFT' ? engine.leftEntity.name : engine.rightEntity.name}
            remainingHp={matchWinner.remainingHp}
            onRestart={handleRestart}
            onNextLevel={handleNext}
            onSelectLevel={onBackToMenu}
            hasNextLevel={levelId < 10}
          />
        )}
      </div>
    </div>
  );
};
