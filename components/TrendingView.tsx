
import React, { useState, useMemo } from 'react';
import { DiscoverItem, Room, User } from '../types';
import { DiscoverCard } from './DiscoverCards';

// A map to connect filter labels to the data types
const filterMap: Record<string, DiscoverItem['type'] | 'All'> = {
    'All': 'All',
    'Live': 'live_room',
    'People': 'user_profile',
    'Images': 'image_post',
    'Videos': 'video_post',
    'Posts': 'text_post',
};
const contentFilters = Object.keys(filterMap);


interface TrendingViewProps {
  discoverItems: DiscoverItem[];
  trendingTags: string[];
  // Callbacks for DiscoverCard
  onEnterRoom: (room: Room) => void;
  onViewProfile: (user: User) => void;
  onViewMedia: (post: Extract<DiscoverItem, { type: 'image_post' | 'video_post' }>) => void;
  onViewPost: (post: Extract<DiscoverItem, { type: 'text_post' }>) => void;
}

const TrendingView: React.FC<TrendingViewProps> = ({ discoverItems, trendingTags, ...rest }) => {
  const [activeFilter, setActiveFilter] = useState('All');

  const filteredItems = useMemo(() => {
    if (activeFilter === 'All') {
      return discoverItems;
    }
    const typeToFilter = filterMap[activeFilter];
    return discoverItems.filter(item => item.type === typeToFilter);
  }, [discoverItems, activeFilter]);

  // Masonry layout logic
  const columns = [[], [], []] as DiscoverItem[][];
  filteredItems.forEach((item, i) => {
    columns[i % 3].push(item);
  });

  return (
    <div className="p-4 md:p-6 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Trending</h1>
        {/* Trending Tags Pills */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 overflow-x-auto -mx-4 px-4 scrollbar-hide pb-2">
            {trendingTags.map(tag => (
              <button key={tag} className="px-4 py-2 bg-gray-800 text-gray-300 rounded-full font-semibold text-sm whitespace-nowrap hover:bg-gray-700 transition">
                # {tag}
              </button>
            ))}
          </div>
        </div>

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

        {/* Content Masonry Grid */}
        {filteredItems.length > 0 ? (
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
            <h2 className="text-xl font-bold text-gray-300">Nothing to see here</h2>
            <p className="text-gray-400 mt-2">No items match your filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrendingView;
