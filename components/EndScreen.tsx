
import React from 'react';
import { DifficultyLevel, DIFFICULTY_CONFIGS } from '../types';

interface EndScreenProps {
  score: number;
  totalQuestions: number;
  currentDifficulty: DifficultyLevel;
  nextDifficulty: DifficultyLevel;
  didLevelUp: boolean;
  didLevelDown: boolean;
  onPlayAgain: () => void;
  onSelectDifficulty?: (difficulty: DifficultyLevel) => void;
}

const EndScreen: React.FC<EndScreenProps> = ({
  score,
  totalQuestions,
  currentDifficulty,
  nextDifficulty,
  didLevelUp,
  didLevelDown,
  onPlayAgain,
  onSelectDifficulty,
}) => {
  const getFeedback = () => {
    const percentage = (score / totalQuestions) * 100;
    if (percentage === 100) return "A Modern Day Warrior! Perfect Score!";
    if (percentage >= 80) return "Closer to the Heart! Excellent job!";
    if (percentage >= 50) return "Working Man! A solid effort!";
    return "Time Stand Still... Better luck next time!";
  };

  const currentConfig = DIFFICULTY_CONFIGS[currentDifficulty];
  const nextConfig = DIFFICULTY_CONFIGS[nextDifficulty];
  const isMaxTierMaster = currentDifficulty === 'hard' && score >= 4;

  return (
    <div className="text-center bg-gray-900 bg-opacity-90 p-8 rounded-2xl shadow-2xl border border-gray-700 backdrop-blur-sm animate-fade-in max-w-xl mx-auto">
      <h2 className="text-3xl font-bold mb-4">Quiz Complete!</h2>

      {/* Progression Banner */}
      {didLevelUp && (
        <div className="mb-6 p-4 rounded-xl border border-amber-500/50 bg-gradient-to-r from-amber-950/60 to-red-950/60 shadow-lg animate-pulse">
          <div className="flex items-center justify-center gap-2 text-amber-400 font-bold text-xl mb-1">
            <span>🔥</span>
            <span>RANK UP!</span>
            <span>🔥</span>
          </div>
          <p className="text-sm text-gray-200">
            You conquered <span className="font-semibold text-amber-300">{currentConfig.rushTitle}</span>!
          </p>
          <p className="text-xs text-amber-200/90 mt-1">
            Next Quiz promoted to: <span className="font-bold underline">{nextConfig.rushTitle} ({nextConfig.label})</span>
          </p>
        </div>
      )}

      {isMaxTierMaster && (
        <div className="mb-6 p-4 rounded-xl border border-red-500/50 bg-gradient-to-r from-red-950/70 to-purple-950/70 shadow-lg">
          <div className="flex items-center justify-center gap-2 text-red-400 font-bold text-xl mb-1">
            <span>👑</span>
            <span>MASTER OF HEMISPHERES!</span>
            <span>👑</span>
          </div>
          <p className="text-sm text-gray-200">
            You crushed the hardest tier at <span className="font-bold text-red-300">{score}/{totalQuestions}</span>.
          </p>
        </div>
      )}

      {didLevelDown && (
        <div className="mb-6 p-3 rounded-xl border border-blue-500/40 bg-blue-950/40 text-xs text-blue-200">
          <span>Easing down to </span>
          <span className="font-semibold text-blue-300">{nextConfig.rushTitle} ({nextConfig.label})</span>
          <span> for the next round so you can build momentum!</span>
        </div>
      )}

      <p className="text-2xl text-gray-300 mb-2">
        You scored <span className="text-red-400 font-bold text-3xl">{score}</span> out of <span className="text-red-400 font-bold text-3xl">{totalQuestions}</span>
      </p>

      <div className="flex items-center justify-center gap-2 mb-4">
        <span className="text-xs text-gray-400">Played on:</span>
        <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${currentConfig.badgeColor}`}>
          {currentConfig.rushTitle} ({currentConfig.label})
        </span>
      </div>

      <p className="text-lg italic text-gray-300 mb-6">{getFeedback()}</p>

      {/* Manual Difficulty Selector */}
      {onSelectDifficulty && (
        <div className="mb-6 p-3 bg-gray-950/60 rounded-xl border border-gray-800">
          <p className="text-xs text-gray-400 mb-2 font-medium">Next Quiz Rank:</p>
          <div className="grid grid-cols-3 gap-2">
            {(['easy', 'medium', 'hard'] as DifficultyLevel[]).map((level) => {
              const config = DIFFICULTY_CONFIGS[level];
              const isSelected = nextDifficulty === level;
              return (
                <button
                  key={level}
                  type="button"
                  onClick={() => onSelectDifficulty(level)}
                  className={`px-2 py-2 rounded-lg text-xs font-semibold border transition-all duration-200 ${
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
        </div>
      )}

      <button
        onClick={onPlayAgain}
        className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 px-10 rounded-full text-xl transform hover:scale-105 transition-all duration-300 ease-in-out shadow-lg hover:shadow-red-500/50"
      >
        {didLevelUp ? `Play ${nextConfig.rushTitle} →` : 'Play Again'}
      </button>
    </div>
  );
};

export default EndScreen;

