
import React, { useState, useEffect } from 'react';
import { StarmanIcon } from './IconComponents';

const LoadingSpinner: React.FC = () => {
  const loadingMessages = [
    "Begin the day with a friendly voice...",
    "We only stop for the best!",
    "...takes time for Gemini to research and form the Rush trivia questions...",
    "Living in the Limelight...",
    "Time Stand Still while we prepare...",
    "Working through the Subdivisions...",
    "...we are getting there...",
    "The Great Computer Hall are loading your questions...",
    "The Trees are still kept equal...",
    "Today's Tom Sawyer..."
  ];

  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prevIndex) => 
        (prevIndex + 1) % loadingMessages.length
      );
    }, 5000); // Change message every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="w-12 h-12 border-4 border-gray-600 border-t-red-500 rounded-full animate-spin mb-4"></div>
      <p className="text-xl font-semibold text-gray-300 transition-opacity duration-500">
        {loadingMessages[currentMessageIndex]}
      </p>
      <p className="text-gray-400">Crafting new questions.</p>
    </div>
  );
};

export default LoadingSpinner;
