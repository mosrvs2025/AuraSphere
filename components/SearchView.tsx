import React, { useState, useMemo } from 'react';
import { DiscoverItem, Room, User } from '../types';
import { DiscoverCard } from './DiscoverCards';

// This is the same filter map from TrendingView
const filterMap: Record<string, DiscoverItem['type'] | 'All'> = {
    'All': 'All',
    'Live': 'live_room',
    'People': 'user_profile',
    'Images': 'image_post',
    'Videos': 'video_post',
    'Posts': 'text_post',
};
const contentFilters = Object.keys(filterMap);

interface SearchViewProps {
  query: string;
  discoverItems: DiscoverItem[];
  // Callbacks for DiscoverCard
  onEnterRoom: (room: Room) => void;
  onViewProfile: (user: User) => void;
  onViewMedia: (post: Extract<DiscoverItem, { type: 'image_post' | 'video_post' }>) => void;
  onViewPost: (post: Extract<DiscoverItem, { type: 'text_post' }>) => void;
}

const SearchView: React.FC<SearchViewProps> = ({ query, discoverItems, ...rest }) => {
  const [activeFilter, setActiveFilter] = useState('All');

  const searchResults = useMemo(() => {
    const lcQuery = query.toLowerCase();
    
    // First, filter by the search query
    let results = discoverItems.filter(item => {
      switch (item.type) {
        case 'live_room':
          return item.title.toLowerCase().includes(lcQuery) || item.description?.toLowerCase().includes(lcQuery);
        case 'user_profile':
          return item.name.toLowerCase().includes(lcQuery) || item.bio?.toLowerCase().includes(lcQuery);
        case 'text_post':
          return item.content.toLowerCase().includes(lcQuery) || item.author.name.toLowerCase().includes(lcQuery);
        case 'image_post':
        case 'video_post':
          return item.caption?.toLowerCase().includes(lcQuery) || item.author.name.toLowerCase().includes(lcQuery);
        default:
          return false;
      }
    });

    // Then, filter by the active content type filter
    if (activeFilter !== 'All') {
      const typeToFilter = filterMap[activeFilter];
      results = results.filter(item => item.type === typeToFilter);
    }
    
    return results;
  }, [query, discoverItems, activeFilter]);

  // Masonry layout logic
  const columns = [[], [], []] as DiscoverItem[][];
  searchResults.forEach((item, i) => {
    columns[i % 3].push(item);
  });

  return (
    <div className="p-4 md:p-6 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        {/* Filter Pills */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 overflow-x-auto -mx-4 px-4 scrollbar-hide pb-2">
            {contentFilters.map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition ${
                  activeFilter === filter
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {searchResults.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {columns.map((col, colIndex) => (
              <div key={colIndex} className="flex flex-col gap-4">
                {col.map((item) => (
                  <DiscoverCard
                    key={`${item.type}-${item.id}`}
                    item={item}
                    {...rest}
                  />
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-800/50 rounded-lg border border-gray-700">
            <h2 className="text-xl font-bold text-gray-300">No results for "{query}"</h2>
            <p className="text-gray-400 mt-2">Try searching for something else.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchView;
