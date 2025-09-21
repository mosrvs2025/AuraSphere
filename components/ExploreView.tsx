

import React, { useMemo } from 'react';
import { DiscoverItem, Room, User, CurationTab } from '../types';
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

  // In a real app, the logic for the explore view might be different,
  // e.g., showing a wider variety of content not just based on tags.
  // For this mockup, we'll just filter out user profiles to differentiate it from the main feed.
  const displayedItems = useMemo(() => {
    return items.filter(item => item.type !== 'user_profile');
  }, [items]);

  // Masonry layout logic (2 columns for Explore)
  const columns = [[], []] as DiscoverItem[][];
  displayedItems.forEach((item, i) => {
    columns[i % 2].push(item);
  });

  return (
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
            No items found.
          </p>
        </div>
      )}
    </main>
  );
};

export default ExploreView;