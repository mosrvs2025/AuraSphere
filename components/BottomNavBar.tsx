import React from 'react';
import { HomeIcon, MessagesIcon, ProfileIcon, SearchIcon } from './Icons';
import { ActiveView } from '../types';

interface BottomNavBarProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
}

const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeView, setActiveView }) => {
  
  const navItems = [
    { id: 'home', label: 'Home', icon: <HomeIcon /> },
    { id: 'search', label: 'Search', icon: <SearchIcon /> },
    { id: 'messages', label: 'Messages', icon: <MessagesIcon /> },
    { id: 'profile', label: 'Profile', icon: <ProfileIcon /> },
  ] as const;

  return (
    <nav className="h-20 bg-black border-t border-gray-800 flex-shrink-0 z-40">
      <div className="flex h-full w-full max-w-lg mx-auto">
        {navItems.map(item => {
          const isActive = activeView === item.id;
          return (
            <div key={item.id} className="flex-1 w-0 flex justify-center items-center">
              <button
                onClick={() => setActiveView(item.id)}
                className={`w-full h-full flex flex-col items-center justify-center space-y-1 transition-colors ${isActive ? 'text-white' : 'text-gray-500 hover:text-white'}`}
                aria-label={item.label}
              >
                <div className="w-7 h-7">{item.icon}</div>
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            </div>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavBar;