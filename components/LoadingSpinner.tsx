
import React from 'react';
import { StarmanIcon } from './IconComponents';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <StarmanIcon className="w-24 h-24 text-red-500 animate-spin-slow" />
      <p className="mt-4 text-xl font-semibold text-gray-300">Summoning the Spirit of Radio...</p>
      <p className="text-gray-400">Crafting new questions.</p>
    </div>
  );
};

export default LoadingSpinner;
