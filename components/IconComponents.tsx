
import React from 'react';

export const RushLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#FFFFFF', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#D1D5DB', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    <text x="10" y="45" fontFamily="Arial, sans-serif" fontSize="50" fontWeight="bold" fill="url(#grad1)" stroke="#EF4444" strokeWidth="1.5">RUSH</text>
    <circle cx="100" cy="30" r="28" fill="none" stroke="#EF4444" strokeWidth="3" />
    <path d="M 85,30 a 15,15 0 0,1 30,0" fill="none" stroke="#FFFFFF" strokeWidth="2" />
    <path d="M 100,15 v 30" fill="none" stroke="#FFFFFF" strokeWidth="2" />
    <polygon points="96,18 104,18 100,12" fill="#FFFFFF" />
  </svg>
);

export const StarmanIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm0 2.5a.75.75 0 01.75.75v.518a8.25 8.25 0 016.92 4.132.75.75 0 01-.814 1.22c-1.3-1.01-2.922-1.58-4.606-1.58s-3.306.57-4.606 1.58a.75.75 0 11-.814-1.22A8.25 8.25 0 0111.25 5.018v-.518a.75.75 0 01.75-.75zm-3.375 7.625a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25zM12 11.25a.75.75 0 01.75.75v3a.75.75 0 01-1.5 0v-3a.75.75 0 01.75-.75zm4.875 1.125a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25z" clipRule="evenodd" />
  </svg>
);
