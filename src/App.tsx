import React, { useState } from 'react';
import { LevelSelectScreen } from './ui/components/LevelSelectScreen';
import { GameArenaScreen } from './ui/components/GameArenaScreen';

export const App: React.FC = () => {
  const [selectedLevelId, setSelectedLevelId] = useState<number | null>(1); // Default to level 1 for instant play

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-2 selection:bg-cyan-500 selection:text-slate-950 font-sans">
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

export default App;
