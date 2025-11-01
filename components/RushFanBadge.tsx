import React from 'react';

interface RushFanBadgeProps {
  story: string;
}

const RushFanBadge: React.FC<RushFanBadgeProps> = ({ story }) => {
  if (!story) return null;
  return (
    <div
      className="flex items-center bg-red-700 text-white px-6 py-6 rounded-full shadow-lg font-bold w-full max-w-full sm:px-10 sm:py-10 sm:text-xl"
      style={{
        minHeight: '80px',
        borderRadius: '9999px',
        fontSize: '1.1rem',
        lineHeight: '1.5',
        boxShadow: '0 6px 32px 0 rgba(0,0,0,0.18)',
        whiteSpace: 'normal',
        overflow: 'hidden',
        letterSpacing: '0.01em',
        paddingRight: '1.5rem',
        wordBreak: 'break-word',
      }}
    >
      <span className="mr-3 text-xl sm:mr-4 sm:text-2xl">🎸</span>
      <span style={{display: 'block', overflow: 'hidden'}}>{`Rush Fan: ${story}`}</span>
    </div>
  );
};

export default RushFanBadge;
