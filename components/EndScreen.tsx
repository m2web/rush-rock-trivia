
import React from 'react';
import { StarmanIcon } from './IconComponents';

interface EndScreenProps {
  score: number;
  totalQuestions: number;
  onPlayAgain: () => void;
}

const EndScreen: React.FC<EndScreenProps> = ({ score, totalQuestions, onPlayAgain }) => {
  const getFeedback = () => {
    const percentage = (score / totalQuestions) * 100;
    if (percentage === 100) return "A Modern Day Warrior! Perfect Score!";
    if (percentage >= 80) return "Closer to the Heart! Excellent job!";
    if (percentage >= 50) return "Working Man! A solid effort!";
    return "Time Stand Still... Better luck next time!";
  };

  return (
    <div className="text-center bg-gray-900 bg-opacity-90 p-8 rounded-2xl shadow-2xl border border-gray-700 backdrop-blur-sm animate-fade-in">
      <h2 className="text-3xl font-bold mb-6">Quiz Complete!</h2>
      <p className="text-2xl text-gray-300 mb-4">
        You scored <span className="text-red-400 font-bold text-3xl">{score}</span> out of <span className="text-red-400 font-bold text-3xl">{totalQuestions}</span>
      </p>
      <p className="text-xl italic text-gray-300 mb-8">{getFeedback()}</p>
      <button
        onClick={onPlayAgain}
        className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-10 rounded-full text-xl transform hover:scale-105 transition-all duration-300 ease-in-out shadow-lg hover:shadow-red-500/50"
      >
        Play Again
      </button>
    </div>
  );
};

export default EndScreen;
