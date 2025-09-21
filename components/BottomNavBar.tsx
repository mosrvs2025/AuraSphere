import React from 'react';
import { HomeIcon, MessagesIcon, PlusIcon, ProfileIcon, SearchIcon } from './Icons';
import { ActiveView } from '../types';

interface BottomNavBarProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  onCreateContent: () => void;
}

const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeView, setActiveView, onCreateContent }) => {
  
  const navItems = [
    { id: 'discover', label: 'Discover', icon: <HomeIcon /> },
    { id: 'explore', label: 'Explore', icon: <SearchIcon /> },
    { id: 'create', label: 'Create', icon: <PlusIcon className="w-8 h-8" /> },
    { id: 'messages', label: 'Messages', icon: <MessagesIcon /> },
    { id: 'profile', label: 'Profile', icon: <ProfileIcon /> },
  ] as const;

  const handleNavClick = (id: typeof navItems[number]['id']) => {
    if (id === 'create') {
      onCreateContent();
    } else {
      setActiveView(id);
    }
  };

  return (
    <nav className="h-20 bg-black border-t border-gray-800 flex-shrink-0 z-40">
      <div className="flex h-full w-full max-w-lg mx-auto">
        {navItems.map(item => {
          const isCreate = item.id === 'create';
          const isActive = activeView === item.id;

          if (isCreate) {
            return (
              <div key={item.id} className="flex-1 w-0 relative flex items-center justify-center">
                <button
                  onClick={() => handleNavClick(item.id)}
                  className="w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-300 ease-in-out bg-indigo-600 shadow-indigo-500/30"
                  aria-label={item.label}
                >
                  {item.icon}
                </button>
              </div>
            );
          }

          return (
            <div key={item.id} className="flex-1 w-0 flex justify-center items-center">
              <button
                onClick={() => handleNavClick(item.id)}
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