import React, { useState, useEffect, useRef } from 'react';


interface RushFanModalProps {
  isOpen: boolean;
  onSubmit: (story: string) => void;
}


const RushFanModal: React.FC<RushFanModalProps> = ({ isOpen, onSubmit }) => {
  const [story, setStory] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle Esc key to skip
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onSubmit(''); // Skip
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onSubmit]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div ref={modalRef} className="relative bg-gray-900 p-8 rounded-2xl shadow-2xl border border-gray-700 max-w-lg w-full">
        {/* Close (X) button */}
        <button
          aria-label="Close"
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl font-bold focus:outline-none"
          onClick={() => onSubmit('')}
        >
          ×
        </button>
        <h2 className="text-2xl font-bold mb-4 text-white">First, how did you become a Rush fan?</h2>
        <textarea
          className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-600 mb-4 min-h-[100px]"
          placeholder="Share your Rush origin story... (optional)"
          value={story}
          onChange={e => setStory(e.target.value)}
        />
        <button
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-full text-lg float-right"
          onClick={() => {
            onSubmit(story.trim());
          }}
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default RushFanModal;
