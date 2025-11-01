import React, { useState } from 'react';

interface UpdateFanStoryModalProps {
  isOpen: boolean;
  newStory: string;
  currentStory: string;
  onConfirm: (story: string) => void;
  onCancel: () => void;
}

const UpdateFanStoryModal: React.FC<UpdateFanStoryModalProps> = ({ isOpen, newStory, currentStory, onConfirm, onCancel }) => {
  const [story, setStory] = useState(newStory);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-gray-900 p-8 rounded-2xl shadow-2xl border border-gray-700 max-w-lg w-full relative">
        <button
          aria-label="Close"
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl font-bold focus:outline-none"
          onClick={onCancel}
        >
          ×
        </button>
        <h2 className="text-2xl font-bold mb-4 text-white">Update your Rush fan story?</h2>
        <p className="text-gray-300 mb-2">We noticed new details about your Rush fan story. Would you like to update it?</p>
        <textarea
          className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-600 mb-4 min-h-[100px]"
          value={story}
          onChange={e => setStory(e.target.value)}
        />
        <div className="flex justify-end space-x-2">
          <button
            className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-full text-lg"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-full text-lg"
            onClick={() => onConfirm(story.trim())}
            disabled={!story.trim()}
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateFanStoryModal;
