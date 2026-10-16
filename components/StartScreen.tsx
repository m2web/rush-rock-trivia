import React from 'react';
import {
  DifficultyLevel,
  DIFFICULTY_CONFIGS,
  SubdivisionsEra,
  SUBDIVISIONS_ERA_ORDER,
  ERA_CONFIGS,
} from '../types';

interface StartScreenProps {
  onStart: () => void;
  onStartChat: () => void;
  error?: string | null;
  difficulty?: DifficultyLevel;
  onSelectDifficulty?: (difficulty: DifficultyLevel) => void;
  selectedEra?: SubdivisionsEra;
  onSelectEra?: (era: SubdivisionsEra) => void;
}

const StartScreen: React.FC<StartScreenProps> = ({
  onStart,
  onStartChat,
  error,
  difficulty = 'easy',
  onSelectDifficulty,
  selectedEra = 'all',
  onSelectEra,
}) => {
  const currentDiffConfig = DIFFICULTY_CONFIGS[difficulty];
  const currentEraConfig = ERA_CONFIGS[selectedEra];

  return (
    <div className="text-center bg-gray-900 bg-opacity-90 p-8 rounded-2xl shadow-2xl border border-gray-700 backdrop-blur-sm">
      <h2 className="text-3xl font-bold mb-4">Are you a true Rush fan?</h2>
      <p className="text-lg text-gray-300 mb-6 max-w-md mx-auto">
        Test your knowledge of Rush. Questions span decades of lyrical poetry and musical mastery.
      </p>

      {/* Quiz Rank Selector */}
      <div className="mb-6 max-w-lg mx-auto">
        <div className="mb-3 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-gray-700 bg-black/50 text-xs shadow-inner">
          <span className="text-gray-400">Current Rank:</span>
          <span className={`px-2 py-0.5 rounded-full border font-medium ${currentDiffConfig.badgeColor}`}>
            {currentDiffConfig.rushTitle} • {currentDiffConfig.label}
          </span>
        </div>

        {onSelectDifficulty && (
          <div className="grid grid-cols-3 gap-2 p-2 bg-gray-950/60 rounded-xl border border-gray-800">
            {(['easy', 'medium', 'hard'] as DifficultyLevel[]).map((level) => {
              const config = DIFFICULTY_CONFIGS[level];
              const isSelected = difficulty === level;
              return (
                <button
                  key={level}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => onSelectDifficulty(level)}
                  className={`px-2 py-2 rounded-lg text-xs font-semibold border transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'border-red-500 bg-red-600/30 text-white shadow-sm'
                      : 'border-gray-700 bg-gray-800/40 text-gray-400 hover:text-gray-200 hover:border-gray-600'
                  }`}
                >
                  <div>{config.rushTitle}</div>
                  <div className="text-[10px] opacity-75">{config.label}</div>
                </button>
              );
            })}
          </div>
        )}

        <p className="text-xs text-gray-400 mt-2 italic">
          {currentDiffConfig.description}
        </p>
      </div>

      {/* Subdivisions Era Selector — shown ONLY when Subdivisions (medium) is active */}
      {difficulty === 'medium' && onSelectEra && (
        <div className="mb-6 p-4 bg-amber-950/20 rounded-xl border border-amber-500/40 max-w-lg mx-auto text-left animate-fade-in">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              🎹 Subdivisions Era Selector
            </span>
            <span className="text-[11px] text-amber-300/80 font-medium">
              {currentEraConfig.years}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
            {SUBDIVISIONS_ERA_ORDER.map((eraKey) => {
              const era = ERA_CONFIGS[eraKey];
              const isSelected = selectedEra === eraKey;
              return (
                <button
                  key={eraKey}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => onSelectEra(eraKey)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold border text-left transition-all duration-200 cursor-pointer ${
                    eraKey === 'all' ? 'sm:col-span-2 text-center' : ''
                  } ${
                    isSelected
                      ? 'border-amber-400 bg-amber-500/25 text-amber-200 shadow-sm'
                      : 'border-gray-700 bg-gray-800/50 text-gray-300 hover:text-white hover:border-amber-500/50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span>{era.label}</span>
                    <span className="text-[10px] opacity-75 font-normal">({era.years})</span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="text-xs text-gray-300 bg-black/40 p-2.5 rounded-lg border border-gray-800">
            <p className="font-semibold text-amber-300 mb-0.5">
              Albums: <span className="font-normal text-gray-200">{currentEraConfig.albums}</span>
            </p>
            <p className="text-[11px] text-gray-400">{currentEraConfig.description}</p>
          </div>
        </div>
      )}

      {error && <p className="text-red-400 mb-4 bg-red-900/50 p-3 rounded-lg">{error}</p>}
      
      {/* Primary Action: Begin the Test */}
      <div className="mb-4">
        <button
          onClick={onStart}
          className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-extrabold py-4 px-12 rounded-full text-xl transform hover:scale-105 transition-all duration-300 ease-in-out shadow-lg hover:shadow-red-500/50 cursor-pointer"
        >
          ⚡ Begin the Test
        </button>
      </div>

      {/* Secondary Action: Fan Chat */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <button
          onClick={onStartChat}
          className="w-full sm:w-auto bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/50 font-bold py-2.5 px-6 rounded-full text-sm transform hover:scale-105 transition-all duration-200 shadow-md cursor-pointer"
          title="Chat with Synthetic Fan"
        >
          💬 Synthetic Fan Chat
        </button>
      </div>
    </div>
  );
};

export default StartScreen;

