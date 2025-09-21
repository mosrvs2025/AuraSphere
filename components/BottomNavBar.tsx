
import React from 'react';
import { HomeIcon, MessagesIcon, PlusIcon, ProfileIcon, SearchIcon } from './Icons';
import { ActiveView } from '../types';

interface BottomNavBarProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  onCreateContent: () => void;
  unreadNotificationCount: number; // For potential future use
}

const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeView, setActiveView, onCreateContent }) => {
  const navItems = [
    { id: 'home', label: 'Discover', icon: <HomeIcon /> },
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
    <nav className="h-16 bg-gray-900/80 backdrop-blur-sm border-t border-gray-700/50 flex-shrink-0 lg:hidden">
      <div className="flex h-full w-full">
        {navItems.map(item => {
          const isCreate = item.id === 'create';
          const isActive = activeView === item.id;

          if (isCreate) {
            return (
              <div key={item.id} className="flex-1 w-0 relative">
                <button
                  onClick={() => handleNavClick(item.id)}
                  className="absolute left-1/2 -translate-x-1/2 top-[-2rem] w-16 h-16 rounded-full bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30"
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
                className={`w-full h-full flex flex-col items-center justify-center space-y-1 transition-colors ${isActive ? 'text-indigo-400' : 'text-gray-400 hover:text-white'}`}
                aria-label={item.label}
              >
                {item.icon}
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
