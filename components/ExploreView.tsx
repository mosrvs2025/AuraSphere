import React, { useMemo } from 'react';
import { DiscoverItem, Room, User, CurationTab } from '../types';
import { DiscoverCard } from './DiscoverCards';

interface ExploreViewProps {
  items: DiscoverItem[];
  curationTab: CurationTab;
  activeMediaType: DiscoverItem['type'] | 'All';
  activeTopicTag: string;
  isLiveFilterActive: boolean;
  onEnterRoom: (room: Room) => void;
  onViewProfile: (user: User) => void;
  onViewMedia: (post: Extract<DiscoverItem, { type: 'image_post' | 'video_post' }>) => void;
  onViewPost: (post: Extract<DiscoverItem, { type: 'text_post' | 'voice_note_post' }>) => void;
}

const ExploreView: React.FC<ExploreViewProps> = (props) => {
  const { items, curationTab, activeMediaType, activeTopicTag, isLiveFilterActive, onEnterRoom, onViewProfile, onViewMedia, onViewPost } = props;

  const displayedItems = useMemo(() => {
    let filtered = [...items];

    // 1. Apply Global Live Filter
    if (isLiveFilterActive) {
      filtered = filtered.filter(item => item.type === 'live_room');
    }

    // 2. Apply Media Type Filter
    if (activeMediaType !== 'All') {
      filtered = filtered.filter(item => item.type === activeMediaType);
    }
    
    // 3. Apply Curation Tab Filter (For You, Following, etc.)
    // This is a placeholder for more complex logic
    if (curationTab === 'following') {
        // A real implementation would check against current user's following list
        filtered = filtered.filter(item => 'author' in item || 'hosts' in item);
    }

    // 4. Apply Topic Tag Filter
    if (activeTopicTag !== 'All') {
      filtered = filtered.filter(item => 'tags' in item && item.tags && item.tags.includes(activeTopicTag));
    }
    
    return filtered;
  }, [items, curationTab, activeMediaType, activeTopicTag, isLiveFilterActive]);

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
        <div className="text-center py-20 bg-gray-800/50 rounded-lg border border-gray-700 m-2">
          <h2 className="text-xl font-bold text-gray-300">
            Nothing to see here
          </h2>
          <p className="text-gray-400 mt-2">
            No items match your selected filters.
          </p>
        </div>
      )}
    </main>
  );
};

export default ExploreView;
