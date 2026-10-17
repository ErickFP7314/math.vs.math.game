import React, { useState } from 'react';
import { LevelSelectScreen } from './ui/components/LevelSelectScreen';
import { GameArenaScreen } from './ui/components/GameArenaScreen';
import { LanguageProvider } from './i18n/LanguageContext';
import { ThemeProvider, useTheme } from './theme/ThemeContext';

export const AppContent: React.FC = () => {
  const [selectedLevelId, setSelectedLevelId] = useState<number | null>(1); // Default to level 1 for instant play
  const { theme } = useTheme();

  return (
    <div
      className={`min-h-screen flex flex-col justify-center items-center p-2 selection:bg-cyan-500 selection:text-white font-sans transition-colors duration-200 ${
        theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'
      }`}
    >
      {selectedLevelId === null ? (
        <LevelSelectScreen onSelectLevel={(lvlId) => setSelectedLevelId(lvlId)} />
      ) : (
        <GameArenaScreen
          levelId={selectedLevelId}
          onBackToMenu={() => setSelectedLevelId(null)}
          onSelectNextLevel={(nextLvlId) => setSelectedLevelId(nextLvlId)}
        />
      )}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;
