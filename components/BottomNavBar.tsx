
import React, { useState, useEffect } from 'react';
import { HomeIcon, MessagesIcon, PlusIcon, ProfileIcon, SearchIcon } from './Icons';
import { ActiveView, User } from '../types';

interface BottomNavBarProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  onCreateContent: () => void;
  unreadNotificationCount: number; // For potential future use
  currentUser: User;
  viewingProfile: User | null;
  scrollDirection: 'up' | 'down';
}

const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeView, setActiveView, onCreateContent, currentUser, viewingProfile, scrollDirection }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [animateIcon, setAnimateIcon] = useState(false);

  const isContributeMode = viewingProfile && viewingProfile.id !== currentUser.id;
  const canContribute = isContributeMode && (viewingProfile.contributionSettings === 'everyone' || (viewingProfile.contributionSettings === 'following' && currentUser.following.some(f => f.id === viewingProfile.id)));
  
  useEffect(() => {
    if (canContribute) {
        setShowTooltip(true);
        setAnimateIcon(true);
        const tooltipTimer = setTimeout(() => setShowTooltip(false), 3000);
        const animationTimer = setTimeout(() => setAnimateIcon(false), 500); // Animation duration
        return () => {
            clearTimeout(tooltipTimer);
            clearTimeout(animationTimer);
        };
    } else {
        setShowTooltip(false);
    }
  }, [canContribute, viewingProfile?.id]);


  const navItems = [
    { id: 'home', label: 'Discover', icon: <HomeIcon /> },
    { id: 'explore', label: 'Explore', icon: <SearchIcon /> },
    { id: 'create', label: 'Create', icon: <PlusIcon className={`w-8 h-8 transition-transform ${animateIcon ? 'animate-icon-pop' : ''}`} /> },
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
                 {canContribute && showTooltip && (
                    <div className="absolute right-[4.5rem] top-1/2 -translate-y-1/2 bg-gray-700 text-white text-sm font-semibold px-3 py-1.5 rounded-full shadow-lg whitespace-nowrap animate-fade-in">
                      Contribute to @{viewingProfile.name}
                    </div>
                  )}
                <button
                  onClick={() => handleNavClick(item.id)}
                  className={`absolute left-1/2 -translate-x-1/2 top-[-2rem] w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-300 ease-in-out
                    ${canContribute ? 'bg-teal-500 shadow-teal-500/30' : 'bg-indigo-600 shadow-indigo-500/30'}
                    ${scrollDirection === 'down' ? 'scale-75 translate-y-8' : 'scale-100 translate-y-0'}
                  `}
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