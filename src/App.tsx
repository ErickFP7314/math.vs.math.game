import React from 'react';
import { HashRouter, Routes, Route, useNavigate, useParams, Navigate } from 'react-router-dom';
import { LevelSelectScreen } from './ui/components/LevelSelectScreen';
import { GameArenaScreen } from './ui/components/GameArenaScreen';
import { MathInfoScreen } from './ui/components/MathInfoScreen';
import { LanguageProvider } from './i18n/LanguageContext';
import { ThemeProvider, useTheme } from './theme/ThemeContext';

const LevelSelectRoute: React.FC = () => {
  const navigate = useNavigate();
  return (
    <LevelSelectScreen
      onSelectLevel={(lvlId) => navigate(`/level/${lvlId}`)}
      onViewMathGuide={(lvlId) => navigate(lvlId ? `/info/${lvlId}` : '/info')}
    />
  );
};

const GameArenaRoute: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const levelId = id ? parseInt(id, 10) : 1;

  return (
    <GameArenaScreen
      levelId={isNaN(levelId) ? 1 : levelId}
      onBackToMenu={() => navigate('/levels')}
      onSelectNextLevel={(nextLvlId) => navigate(`/level/${nextLvlId}`)}
      onViewMathInfo={(lvlId) => navigate(`/info/${lvlId}`)}
    />
  );
};

const MathInfoRoute: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const levelId = id ? parseInt(id, 10) : 1;

  return (
    <MathInfoScreen
      initialLevelId={isNaN(levelId) ? 1 : levelId}
      onBack={() => navigate('/levels')}
      onPlayLevel={(lvlId) => navigate(`/level/${lvlId}`)}
    />
  );
};

export const AppContent: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div
      className={`h-[100dvh] w-full flex flex-col selection:bg-cyan-500 selection:text-white font-sans transition-colors duration-200 overflow-hidden ${
        theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'
      }`}
    >
      <Routes>
        <Route path="/" element={<div className="flex-1 w-full h-full flex flex-col justify-center items-center p-2 overflow-y-auto custom-scrollbar"><LevelSelectRoute /></div>} />
        <Route path="/levels" element={<div className="flex-1 w-full h-full flex flex-col justify-center items-center p-2 overflow-y-auto custom-scrollbar"><LevelSelectRoute /></div>} />
        <Route path="/level/:id" element={<div className="flex-1 w-full h-full flex flex-col justify-center items-center p-1 sm:p-2 overflow-hidden"><GameArenaRoute /></div>} />
        <Route path="/info" element={<div className="w-full h-full overflow-y-auto custom-scrollbar"><MathInfoRoute /></div>} />
        <Route path="/info/:id" element={<div className="w-full h-full overflow-y-auto custom-scrollbar"><MathInfoRoute /></div>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <HashRouter>
          <AppContent />
        </HashRouter>
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;
