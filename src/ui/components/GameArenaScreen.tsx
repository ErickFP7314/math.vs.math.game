import React, { useEffect, useState, useRef, useMemo } from 'react';
import { SimulationEngine } from '../../core/engine/SimulationEngine';
import { LevelRegistry } from '../../core/levels/LevelRegistry';
import { GameLoop } from '../../core/engine/GameLoop';
import { globalEventBus } from '../../core/engine/EventBus';
import { soundManager } from '../../audio/WebAudioSynth';
import { useLanguage } from '../../i18n/LanguageContext';
import { useTheme } from '../../theme/ThemeContext';
import { HeaderHUD } from './HeaderHUD';
import { HPBar } from './HPBar';
import { ArenaCanvas } from '../../render/ArenaCanvas';
import { FloatingMathText } from './FloatingMathText';
import { VictoryModal } from './VictoryModal';
import { Volume2, VolumeX, RotateCcw, ArrowLeft, Sun, Moon, BookOpen } from 'lucide-react';

interface GameArenaScreenProps {
  levelId: number;
  onBackToMenu: () => void;
  onSelectNextLevel: (nextLevelId: number) => void;
  onViewMathInfo?: (levelId: number) => void;
}

export const GameArenaScreen: React.FC<GameArenaScreenProps> = ({
  levelId,
  onBackToMenu,
  onSelectNextLevel,
  onViewMathInfo,
}) => {
  const { t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const level = useMemo(
    () => LevelRegistry.getLevel(levelId) || LevelRegistry.getLevels()[0],
    [levelId]
  );
  const levelInfo = t.levels[levelId] || t.levels[1];

  const [restartKey, setRestartKey] = useState(0);
  const [engine, setEngine] = useState(() => new SimulationEngine(level));
  const [, setRenderTrigger] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [countdown, setCountdown] = useState<number | string | null>(3);
  const [matchWinner, setMatchWinner] = useState<{
    winner: 'LEFT' | 'RIGHT';
    remainingHp: number;
    symbol: string;
  } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const modalTimerRef = useRef<NodeJS.Timeout | null>(null);
  const fightTimerRef = useRef<NodeJS.Timeout | null>(null);

  const loopRef = useRef<GameLoop | null>(null);

  useEffect(() => {
    soundManager.preloadAudio();
    if (modalTimerRef.current) {
      clearTimeout(modalTimerRef.current);
      modalTimerRef.current = null;
    }
    if (fightTimerRef.current) {
      clearTimeout(fightTimerRef.current);
      fightTimerRef.current = null;
    }
    setShowModal(false);
    const newEngine = new SimulationEngine(level);
    setEngine(newEngine);
    setMatchWinner(null);
    setCountdown(3);

    // Initial countdown sound
    soundManager.playCountdown(3);

    // Subscribe to events
    const unsubCountdown = globalEventBus.on('MATCH_COUNTDOWN', (payload) => {
      setCountdown(payload.count);
      soundManager.playCountdown(payload.count);
    });

    const unsubStart = globalEventBus.on('MATCH_START', () => {
      setCountdown(t.fight);
      soundManager.playStart();
      if (fightTimerRef.current) clearTimeout(fightTimerRef.current);
      fightTimerRef.current = setTimeout(() => {
        setCountdown(null);
      }, 900);
    });

    const unsubOver = globalEventBus.on('MATCH_OVER', (payload) => {
      setMatchWinner({
        winner: payload.winner,
        remainingHp: payload.remainingHp,
        symbol: payload.symbol,
      });
      setShowModal(false);
      if (modalTimerRef.current) clearTimeout(modalTimerRef.current);
      modalTimerRef.current = setTimeout(() => {
        newEngine.status = 'PAUSED';
        loopRef.current?.stop();
        setShowModal(true);
      }, 3000);
    });

    const unsubLaser = globalEventBus.on('LASER_FIRED', () => {
      soundManager.playLaser();
    });

    // Start fixed 60Hz game loop
    let frameCounter = 0;
    const loop = new GameLoop(
      (dt) => {
        newEngine.update(dt);
      },
      () => {
        frameCounter++;
        if (frameCounter % 3 === 0) {
          setRenderTrigger((r) => r + 1);
        }
      }
    );

    loopRef.current = loop;
    loop.start();

    return () => {
      if (fightTimerRef.current) {
        clearTimeout(fightTimerRef.current);
        fightTimerRef.current = null;
      }
      if (modalTimerRef.current) {
        clearTimeout(modalTimerRef.current);
        modalTimerRef.current = null;
      }
      loop.stop();
      unsubCountdown();
      unsubStart();
      unsubOver();
      unsubLaser();
    };
  }, [levelId, restartKey, level]);

  const handleRestart = () => {
    if (fightTimerRef.current) {
      clearTimeout(fightTimerRef.current);
      fightTimerRef.current = null;
    }
    if (modalTimerRef.current) {
      clearTimeout(modalTimerRef.current);
      modalTimerRef.current = null;
    }
    setShowModal(false);
    setRestartKey((k) => k + 1);
  };

  const handleNext = () => {
    onSelectNextLevel(levelId + 1);
  };

  const toggleSound = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div className="w-full h-full max-h-[96vh] flex flex-col items-center justify-between p-1 sm:p-2 relative max-w-md mx-auto">
      {/* Top Controls Toolbar */}
      <div
        className={`w-full max-w-[400px] flex items-center justify-between px-2 py-1 mb-1 transition-colors duration-200 ${
          isDark ? 'text-slate-400' : 'text-slate-600'
        }`}
      >
        <button
          onClick={onBackToMenu}
          className="flex items-center space-x-1 text-xs font-mono hover:text-cyan-400 transition-colors p-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.levelsList}</span>
        </button>

        <div
          className={`text-[11px] font-mono font-bold ${
            isDark ? 'text-slate-200' : 'text-slate-800'
          }`}
        >
          {t.levelBadge} {level.id}: {levelInfo.subtitle}
        </div>

        <div className="flex items-center space-x-2">
          {/* Math didactic guide button */}
          {onViewMathInfo && (
            <button
              onClick={() => onViewMathInfo(levelId)}
              className="p-1 hover:text-cyan-400 transition-colors"
              title={t.mathGuide}
            >
              <BookOpen className="w-4 h-4 text-cyan-400" />
            </button>
          )}

          {/* Theme toggle button */}
          <button
            onClick={toggleTheme}
            className={`p-1 rounded transition-colors ${
              isDark ? 'hover:text-yellow-400' : 'hover:text-slate-900'
            }`}
            title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          >
            {isDark ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* Sound toggle */}
          <button
            onClick={toggleSound}
            className="p-1 hover:text-cyan-400 transition-colors"
            title="Mute / Unmute Sound"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>

          {/* Restart */}
          <button
            onClick={handleRestart}
            className="p-1 hover:text-cyan-400 transition-colors"
            title={t.retry}
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Game Stage Container */}
      <div
        className={`relative w-full max-w-[400px] rounded-2xl overflow-hidden shadow-2xl border transition-colors duration-200 flex flex-col justify-between ${
          isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-300'
        }`}
      >
        {/* Header HUD */}
        <HeaderHUD
          leftEntity={engine.leftEntity}
          rightEntity={engine.rightEntity}
          levelId={levelId}
        />

        {/* Floating Comic Math Onomatopoeia Popups */}
        <FloatingMathText />

        {/* Countdown Overlay (3, 2, 1, FIGHT!) */}
        {countdown !== null && (
          <div className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center">
            <div
              key={String(countdown)}
              className={`font-black font-mono select-none drop-shadow-[0_2px_12px_rgba(255,255,255,0.9)] ${
                typeof countdown === 'string'
                  ? 'text-6xl sm:text-7xl text-amber-500 animate-bounce tracking-wider'
                  : 'text-8xl text-black animate-pulse'
              }`}
              style={{
                WebkitTextStroke:
                  typeof countdown === 'string'
                    ? '2px rgba(0,0,0,0.85)'
                    : '1px rgba(255,255,255,0.7)',
              }}
            >
              {countdown}
            </div>
          </div>
        )}

        {/* Canvas Arena with Player Targeting Reticle and Click-to-Dash */}
        <ArenaCanvas engine={engine} playerBadgeText={t.playerBadge} />

        {/* HUD Lower Bars */}
        <HPBar
          leftEntity={engine.leftEntity}
          rightEntity={engine.rightEntity}
          polyHp={engine.polyGlobalHp}
          activeSpheresCount={engine.subEntities.length + (engine.rightEntity.isDead ? 0 : 1)}
          levelId={levelId}
          derivativeHitCount={engine.derivativeHitCount}
          engineStatus={engine.status}
          isTelegraphing={engine.activeLasers.some((l) => l.isTelegraph && l.ownerId === engine.rightEntity.id)}
        />

        {/* Floating Post-Match Winner Announcement (3s delay before modal, pure text, no window background) */}
        {matchWinner && !showModal && (
          <div className="absolute inset-0 z-30 pointer-events-none flex flex-col items-center justify-center px-4 select-none animate-fade-in">
            <div
              className={`text-5xl sm:text-6xl font-black font-mono tracking-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.85)] ${
                matchWinner.winner === 'LEFT' ? 'text-cyan-400' : 'text-rose-500'
              }`}
            >
              {matchWinner.winner === 'LEFT' ? t.victory : t.defeat}
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] mt-2 text-center">
              {matchWinner.winner === 'LEFT' ? levelInfo.leftName : levelInfo.rightName} ({matchWinner.symbol})
            </div>
            <div className="text-lg sm:text-xl font-black font-mono text-amber-400 drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] mt-1">
              {t.remainingHp}: {Math.max(0, Math.round(matchWinner.remainingHp))}
            </div>
          </div>
        )}

        {/* Victory / Defeat Modal (appears after 3 seconds) */}
        {matchWinner && showModal && (
          <VictoryModal
            winner={matchWinner.winner}
            winnerSymbol={matchWinner.symbol}
            winnerName={matchWinner.winner === 'LEFT' ? levelInfo.leftName : levelInfo.rightName}
            remainingHp={matchWinner.remainingHp}
            onRestart={handleRestart}
            onNextLevel={handleNext}
            onSelectLevel={onBackToMenu}
            onViewMathInfo={onViewMathInfo ? () => onViewMathInfo(levelId) : undefined}
            hasNextLevel={levelId < 10}
          />
        )}
      </div>
    </div>
  );
};

export default GameArenaScreen;
