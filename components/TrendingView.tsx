import React, { useState } from 'react';
import { DiscoverItem, Room, User } from '../types';
import { DiscoverCard } from './DiscoverCards';

interface TrendingViewProps {
  items: DiscoverItem[];
  onEnterRoom: (room: Room) => void;
  onViewProfile: (user: User) => void;
  onViewMedia: (post: Extract<DiscoverItem, { type: 'image_post' | 'video_post' }>) => void;
  onViewPost: (post: Extract<DiscoverItem, { type: 'text_post' }>) => void;
}

const filters = ['All', 'Trending', 'Live', 'People', 'Images', 'Videos', 'Posts'];
const filterMap: Record<string, DiscoverItem['type'] | 'All'> = {
    'All': 'All',
    'Live': 'live_room',
    'People': 'user_profile',
    'Images': 'image_post',
    'Videos': 'video_post',
    'Posts': 'text_post',
};


const TrendingView: React.FC<TrendingViewProps> = ({ items, onEnterRoom, onViewProfile, onViewMedia, onViewPost }) => {
  const [activeFilter, setActiveFilter] = useState('All');
    
  const filteredItems = items.filter(item => {
      if (activeFilter === 'All' || activeFilter === 'Trending') return true;
      const typeToFilter = filterMap[activeFilter];
      return item.type === typeToFilter;
  });

  // Simple column-based layout. A real implementation might use a masonry library.
  const columns = [[], [], []] as DiscoverItem[][];
  filteredItems.forEach((item, i) => {
    columns[i % 3].push(item);
  });

  return (
    <div className="p-4 md:p-6 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
            <div className="flex items-center space-x-2 overflow-x-auto pb-2 -mx-4 px-4">
                {filters.map(filter => (
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
        
        {filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {columns.map((col, colIndex) => (
                <div key={colIndex} className="flex flex-col gap-4">
                {col.map((item) => (
                    <DiscoverCard 
                      key={`${item.type}-${item.id}`} 
                      item={item}
                      onEnterRoom={onEnterRoom}
                      onViewProfile={onViewProfile}
                      onViewMedia={onViewMedia}
                      onViewPost={onViewPost}
                    />
                ))}
                </div>
            ))}
            </div>
        ) : (
          <div className="text-center py-20 bg-gray-800/50 rounded-lg border border-gray-700">
            <h2 className="text-xl font-bold text-gray-300">Nothing to see here</h2>
            <p className="text-gray-400 mt-2">No items found for this filter. Try another one!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrendingView;