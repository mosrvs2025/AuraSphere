import React, { useState, useEffect } from 'react';
import { Room, User, DiscoverItem } from '../types';
import SearchView from './SearchView';
import { SearchIcon, XIcon } from './Icons';
import ConfirmationModal from './ConfirmationModal';

// Helper functions for localStorage
const getSearchHistory = (): string[] => JSON.parse(localStorage.getItem('aura_search_history') || '[]');
const saveSearchHistory = (history: string[]) => localStorage.setItem('aura_search_history', JSON.stringify(history));


interface GlobalSearchViewProps {
  query: string;
  onSearch: (query: string) => void;
  discoverItems: DiscoverItem[];
  currentUser: User;
  onEnterRoom: (room: Room) => void;
  onViewProfile: (user: User) => void;
  onViewMedia: (post: Extract<DiscoverItem, { type: 'image_post' | 'video_post' }>) => void;
  onViewPost: (post: Extract<DiscoverItem, { type: 'text_post' }>) => void;
}

const RecentSearches: React.FC<{
    history: string[];
    onSearch: (term: string) => void;
    onClear: () => void;
    onRemove: (term: string) => void;
}> = ({ history, onSearch, onClear, onRemove }) => {
    if (history.length === 0) {
        return (
            <div className="text-center text-gray-500 py-20">
                <p>Your recent searches will appear here.</p>
            </div>
        );
    }
    return (
        <div className="max-w-4xl mx-auto p-4 md:p-6 animate-fade-in">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-white">Recent</h2>
                <button onClick={onClear} className="text-sm font-semibold text-indigo-400 hover:text-indigo-300">
                    Clear all
                </button>
            </div>
            <div className="flex flex-col">
                {history.map(term => (
                    <div key={term} className="flex justify-between items-center group border-b border-gray-800">
                        <button onClick={() => onSearch(term)} className="flex-1 text-left text-gray-300 hover:text-white py-3">
                            {term}
                        </button>
                        <button onClick={() => onRemove(term)} className="p-2 text-gray-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                             <XIcon className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

const GlobalSearchView: React.FC<GlobalSearchViewProps> = ({ query: submittedQuery, onSearch, discoverItems, ...rest }) => {
  const [localQuery, setLocalQuery] = useState(submittedQuery);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    setSearchHistory(getSearchHistory());
  }, []);

  const handleSearchSubmit = (searchTerm: string) => {
    const term = searchTerm.trim();
    if (!term) return;

    const newHistory = [term, ...searchHistory.filter(h => h.toLowerCase() !== term.toLowerCase())].slice(0, 8); // Limit history size
    setSearchHistory(newHistory);
    saveSearchHistory(newHistory);
    
    setLocalQuery(term);
    onSearch(term);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearchSubmit(localQuery);
  };
  
  const handleClearHistory = () => {
    setSearchHistory([]);
    saveSearchHistory([]);
    setShowClearConfirm(false);
  };
  
  const handleRemoveHistoryItem = (termToRemove: string) => {
    const newHistory = searchHistory.filter(term => term !== termToRemove);
    setSearchHistory(newHistory);
    saveSearchHistory(newHistory);
  };

  return (
    <div className="flex flex-col h-full animate-fade-in">
      {/* Search Bar */}
      <div className="bg-gray-900 w-full p-4 border-b border-gray-800">
        <form onSubmit={handleFormSubmit} className="flex items-center space-x-2 max-w-4xl mx-auto">
          <div className="relative flex-1">
            <input
              type="text"
              value={localQuery}
              onChange={e => {
                setLocalQuery(e.target.value);
                if (e.target.value.trim() === '') {
                  onSearch(''); // Clear results when input is empty
                }
              }}
              placeholder="Search AuraSphere..."
              className="w-full bg-gray-800 border border-gray-700 rounded-full py-3 pl-12 pr-4 text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              autoFocus
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
              <SearchIcon className="w-6 h-6" />
            </div>
          </div>
        </form>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {submittedQuery ? (
          <SearchView
            query={submittedQuery}
            discoverItems={discoverItems}
            {...rest}
          />
        ) : (
          <RecentSearches 
            history={searchHistory}
            onSearch={handleSearchSubmit}
            onClear={() => setShowClearConfirm(true)}
            onRemove={handleRemoveHistoryItem}
          />
        )}
      </div>

      {showClearConfirm && (
        <ConfirmationModal
          title="Clear Search History"
          message="Are you sure you want to clear all recent searches? This cannot be undone."
          confirmText="Clear All"
          onConfirm={handleClearHistory}
          onCancel={() => setShowClearConfirm(false)}
          confirmButtonClass="bg-red-600 hover:bg-red-500"
        />
      )}
    </div>
  );
};

export default GlobalSearchView;