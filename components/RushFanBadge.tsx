import React, { useState } from 'react';

interface RushFanBadgeProps {
  story: string;
  onClick?: () => void;
}

const RushFanBadge: React.FC<RushFanBadgeProps> = ({ story, onClick }) => {
  const [expanded, setExpanded] = useState(false);

  if (!story) return null;

  const truncated = story.length > 60 ? story.slice(0, 60) + '...' : story;

  return (
    <button
      onClick={onClick}
      title="Click to edit your Rush fan story"
      className="fixed bottom-4 right-4 z-40 flex items-center gap-2 bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded-full shadow-lg text-sm cursor-pointer transition-all duration-200 max-w-xs"
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      <span className="text-base flex-shrink-0">🎸</span>
      <span className="overflow-hidden text-ellipsis whitespace-nowrap">
        {expanded ? story : truncated}
      </span>
    </button>
  );
};

export default RushFanBadge;
