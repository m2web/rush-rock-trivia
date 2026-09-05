
import React from 'react';
import { StarmanIcon } from './IconComponents';

interface StartScreenProps {
  onStart: () => void;
  onStartChat: () => void;
  onViewMeetups?: () => void;
  hasFanStory: boolean;
  error?: string | null;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart, onStartChat, onViewMeetups, hasFanStory, error }) => {
  return (
    <div className="text-center bg-gray-900 bg-opacity-90 p-8 rounded-2xl shadow-2xl border border-gray-700 backdrop-blur-sm">
      <h2 className="text-3xl font-bold mb-4">Are you a true Rush fan?</h2>
      <p className="text-lg text-gray-300 mb-8 max-w-md mx-auto">
        Test your knowledge of the holy triumvirate. Questions span decades of lyrical poetry and musical mastery.
      </p>
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

      {/* Secondary Actions: Cities & Tours + Fan Chat */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        {onViewMeetups && (
          <button
            onClick={onViewMeetups}
            className="w-full sm:w-auto bg-amber-600/20 hover:bg-amber-600/40 text-amber-400 border border-amber-500/50 font-bold py-2.5 px-6 rounded-full text-sm transform hover:scale-105 transition-all duration-200 shadow-md cursor-pointer"
          >
            📍 Cities & Tours
          </button>
        )}
        <button
          onClick={onStartChat}
          className="w-full sm:w-auto bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/50 font-bold py-2.5 px-6 rounded-full text-sm transform hover:scale-105 transition-all duration-200 shadow-md cursor-pointer"
          title="Chat with Synthetic Rush Fan"
        >
          💬 Chat with Synthetic Fan
        </button>
      </div>
    </div>
  );
};

export default StartScreen;
