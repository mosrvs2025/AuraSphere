import React from 'react';
import { HomeIcon, MessagesIcon, PlusIcon, ScheduledIcon, ProfileIcon } from './Icons';
import { ActiveView } from '../types';

interface BottomNavBarProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  onCreateContent: () => void;
  unreadNotificationCount: number; // For potential future use
}

const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeView, setActiveView, onCreateContent }) => {
  // FIX: Added 'as const' to ensure item.id has a literal type instead of string, fixing the type error.
  const navItems = [
    { id: 'home', label: 'Discover', icon: <HomeIcon /> },
    { id: 'messages', label: 'Messages', icon: <MessagesIcon /> },
    { id: 'create', label: 'Create', icon: <PlusIcon /> },
    { id: 'scheduled', label: 'Scheduled', icon: <ScheduledIcon /> },
    { id: 'profile', label: 'Profile', icon: <ProfileIcon /> },
  ] as const;

  const handleNavClick = (id: ActiveView | 'create') => {
    if (id === 'create') {
      onCreateContent();
    } else {
      setActiveView(id);
    }
  };

  return (
    <nav className="h-16 bg-gray-900/80 backdrop-blur-sm border-t border-gray-700/50 flex-shrink-0 md:hidden">
      <div className="flex justify-around items-center h-full max-w-lg mx-auto">
        {navItems.map(item => {
          const isActive = activeView === item.id;
          if (item.id === 'create') {
            return (
              <button 
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className="w-16 h-16 -mt-8 rounded-full bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30"
                aria-label="Create content"
              >
                <PlusIcon className="w-8 h-8"/>
              </button>
            );
          }
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`flex flex-col items-center justify-center space-y-1 transition-colors w-16 ${isActive ? 'text-indigo-400' : 'text-gray-400 hover:text-white'}`}
            >
              {item.icon}
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavBar;
