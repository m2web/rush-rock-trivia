
import React from 'react';
import { StarmanIcon } from './IconComponents';

interface StartScreenProps {
  onStart: () => void;
  error?: string | null;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart, error }) => {
  return (
    <div className="text-center bg-gray-900 bg-opacity-90 p-8 rounded-2xl shadow-2xl border border-gray-700 backdrop-blur-sm">
      <h2 className="text-3xl font-bold mb-4">Are you a true Rush fan?</h2>
      <p className="text-lg text-gray-300 mb-8 max-w-md mx-auto">
        Test your knowledge of the holy triumvirate. Questions span decades of lyrical poetry and musical mastery.
      </p>
      {error && <p className="text-red-400 mb-4 bg-red-900/50 p-3 rounded-lg">{error}</p>}
      <button
        onClick={onStart}
        className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-10 rounded-full text-xl transform hover:scale-105 transition-all duration-300 ease-in-out shadow-lg hover:shadow-red-500/50"
      >
        Begin the Test
      </button>
    </div>
  );
};

export default StartScreen;
