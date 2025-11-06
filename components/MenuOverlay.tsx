import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaDrum } from 'react-icons/fa';
import { FaHome } from 'react-icons/fa';
import './MenuOverlay.css';

const menuItems = [
    {
      label: 'Home',
      path: '/',
      icon: <span style={{ marginRight: '0.5rem', display: 'inline-flex', alignItems: 'center' }}><FaHome /></span>,
    },
  {
    label: 'Passing the Sticks',
    path: '/passingthesticks',
    icon: <span style={{ marginRight: '0.5rem', display: 'inline-flex', alignItems: 'center' }}><FaDrum /></span>,
  },
  // Future menu items can be added here
];

const MenuOverlay: React.FC = () => {
  const [open, setOpen] = useState(false);
  return (
    <nav className="menu-overlay fixed top-0 left-0 w-full z-50 flex flex-col items-center px-4 py-2 bg-black bg-opacity-80 shadow-lg rounded-b-2xl">
      <div className="flex flex-col md:flex-row items-center justify-center w-full">
        {/* <span className="text-xl font-bold tracking-wide text-red-500 drop-shadow mb-2 md:mb-0 md:mr-4">From the Computer Halls</span> */}
        <div className="flex items-center space-x-2">
          {menuItems.map(item => (
            <Link
              key={item.label}
              to={item.path}
              className="menu-item flex items-center px-4 py-2 rounded-full text-white font-semibold hover:bg-red-700 transition-all duration-200"
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </div>
      </div>
      {/* Hamburger for mobile (optional, can be improved for true mobile UX) */}
    </nav>
  );
};

export default MenuOverlay;
