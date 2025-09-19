import React from 'react';
import { ActiveView } from '../types';
import { SearchIcon, XIcon, BellIcon } from './Icons';

interface GlobalHeaderProps {
  activeView: ActiveView;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  unreadNotificationCount: number;
  onNavigateToNotifications: () => void;
  onNavigateToLive: () => void;
  hasActiveLiveRooms: boolean;
}

const GlobalHeader: React.FC<GlobalHeaderProps> = ({ activeView, searchQuery, setSearchQuery, unreadNotificationCount, onNavigateToNotifications, onNavigateToLive, hasActiveLiveRooms }) => {
  let title = '';
  let placeholder = '';

  switch (activeView) {
    case 'home':
      title = 'Discover';
      placeholder = 'Search rooms, people, posts...';
      break;
    case 'messages':
      title = 'Messages';
      placeholder = 'Search your messages...';
      break;
    case 'scheduled':
      title = 'Content Planner';
      break;
    case 'notifications':
      title = 'Notifications';
      break;
    case 'my-studio':
      title = 'My Studio';
      break;
  }

  const showSearch = activeView === 'home' || activeView === 'messages';

  return (
    <header className="p-4 md:p-6 flex-shrink-0 border-b border-gray-800 bg-gray-900 z-10">
        <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={onNavigateToLive} 
                        className={`text-lg font-extrabold tracking-wider text-red-500 border border-red-500/50 rounded-lg px-3 py-1 transition-colors hover:bg-red-500/20 ${hasActiveLiveRooms ? 'animate-pulse-live' : ''}`}
                    >
                        LIVE
                    </button>
                    <h1 className="text-3xl font-bold">{title}</h1>
                </div>
                <button
                  onClick={onNavigateToNotifications}
                  className="relative p-2 text-gray-400 hover:text-white transition-colors"
                  aria-label="View notifications"
                >
                    <BellIcon className="h-7 w-7" />
                    {unreadNotificationCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 block h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-gray-900"></span>
                    )}
                </button>
            </div>
            {showSearch && (
                <div className="relative mt-4">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                        <SearchIcon className="h-5 w-5" />
                    </div>
                    <input 
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={placeholder}
                        className="w-full bg-gray-800 border border-gray-700 rounded-full py-2 pl-11 pr-10 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    />
                    {searchQuery && (
                        <button 
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                            aria-label="Clear search"
                        >
                            <XIcon className="h-5 w-5" />
                        </button>
                    )}
                </div>
            )}
        </div>
    </header>
  );
};

export default GlobalHeader;