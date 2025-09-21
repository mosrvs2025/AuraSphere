
import React, { useState, useMemo } from 'react';
import { DiscoverItem, Room, User } from '../types';
import { DiscoverCard } from './DiscoverCards';

interface ExploreViewProps {
  items: DiscoverItem[];
  trendingTags: string[];
  onEnterRoom: (room: Room) => void;
  onViewProfile: (user: User) => void;
  onViewMedia: (post: Extract<DiscoverItem, { type: 'image_post' | 'video_post' }>) => void;
  onViewPost: (post: Extract<DiscoverItem, { type: 'text_post' | 'voice_note_post' }>) => void;
}

const ExploreView: React.FC<ExploreViewProps> = (props) => {
  const { items, trendingTags, onEnterRoom, onViewProfile, onViewMedia, onViewPost } = props;
  const [activeFilter, setActiveFilter] = useState('All');

  const displayedItems = useMemo(() => {
    if (activeFilter === 'All') return items.filter(item => item.type !== 'user_profile');
    
    return items.filter(item => {
        if ('tags' in item && Array.isArray(item.tags)) {
            return item.tags.includes(activeFilter);
        }
        return false;
    });
  }, [items, activeFilter]);

  // Masonry layout logic
  const columns = [[], []] as DiscoverItem[][];
  displayedItems.forEach((item, i) => {
    columns[i % 2].push(item);
  });
  
  const filters = ['All', ...trendingTags];

  return (
    <div className="flex flex-col h-full">
      <header className="p-4 sticky top-0 bg-gray-900/80 backdrop-blur-sm z-10">
        <h1 className="text-3xl font-bold text-center mb-4">Explore</h1>
        <div className="flex items-center space-x-2 overflow-x-auto -mx-4 px-4 scrollbar-hide pb-2">
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
      </header>
      <main className="p-2 flex-1 overflow-y-auto">
        {displayedItems.length > 0 ? (
          <div className="grid grid-cols-2 gap-2">
            {columns.map((col, colIndex) => (
              <div key={colIndex} className="flex flex-col gap-2">
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
            <h2 className="text-xl font-bold text-gray-300">
              Nothing to see here
            </h2>
            <p className="text-gray-400 mt-2">
              No items found for this filter. Try another one!
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default ExploreView;
