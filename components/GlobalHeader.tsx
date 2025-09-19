import React from 'react';
import { ActiveView } from '../types';
import { SearchIcon, XIcon } from './Icons';

interface GlobalHeaderProps {
  activeView: ActiveView;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const GlobalHeader: React.FC<GlobalHeaderProps> = ({ activeView, searchQuery, setSearchQuery }) => {
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
  }

  const showSearch = activeView === 'home' || activeView === 'messages';

  return (
    <header className="p-4 md:p-6 flex-shrink-0 border-b border-gray-800 bg-gray-900 z-10">
        <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold">{title}</h1>
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
