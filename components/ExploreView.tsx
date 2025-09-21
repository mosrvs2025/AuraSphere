import React, { useMemo, useContext } from 'react';
import { DiscoverItem, CurationTab, User } from '../types';
import { DiscoverCard } from './DiscoverCards';
import { UserContext } from '../context/UserContext';

interface ExploreViewProps {
  items: DiscoverItem[];
  curationTab: CurationTab;
  activeMediaType: DiscoverItem['type'] | 'All';
  activeTopicTag: string;
  isLiveFilterActive: boolean;
  onEnterRoom: (room: any) => void;
  onViewProfile: (user: any) => void;
  onViewMedia: (post: any) => void;
  onViewPost: (post: any) => void;
}

const ExploreView: React.FC<ExploreViewProps> = (props) => {
  const { 
    items, 
    curationTab, 
    activeMediaType, 
    activeTopicTag, 
    isLiveFilterActive, 
    ...callbacks 
  } = props;
  const { currentUser } = useContext(UserContext);

  const filteredItems = useMemo(() => {
    let filtered = [...items];

    // 1. Filter by Live status
    if (isLiveFilterActive) {
      filtered = filtered.filter(item => item.type === 'live_room');
    }
    // 2. Filter by Media Type (only if live filter is not active)
    else if (activeMediaType !== 'All') {
      filtered = filtered.filter(item => item.type === activeMediaType);
    }
    
    // 3. Filter by Topic Tag
    if (activeTopicTag !== 'All') {
      filtered = filtered.filter(item => 
        'tags' in item && Array.isArray(item.tags) && item.tags.includes(activeTopicTag.replace('# ', ''))
      );
    }

    // 4. Filter by Curation Tab
    if (curationTab === 'following' && currentUser) {
      const followingIds = new Set(currentUser.following.map(f => f.id));
      filtered = filtered.filter(item => {
        if ('author' in item && item.author) {
          return followingIds.has(item.author.id);
        }
        if ('hosts' in item && item.hosts) {
          return item.hosts.some(host => followingIds.has(host.id));
        }
        if (item.type === 'user_profile') {
          return followingIds.has(item.id);
        }
        return false;
      });
    }

    return filtered;
  }, [items, isLiveFilterActive, activeMediaType, activeTopicTag, curationTab, currentUser]);

  // Masonry layout logic
  const columns: DiscoverItem[][] = [[], [], []];
  filteredItems.forEach((item, i) => {
    columns[i % 3].push(item);
  });

  return (
    <main className="flex-1 overflow-y-auto p-4">
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-6xl mx-auto">
          {columns.map((col, colIndex) => (
            <div key={colIndex} className="flex flex-col gap-4">
              {col.map((item) => (
                <DiscoverCard
                  key={`${item.type}-${item.id}`}
                  item={item}
                  {...callbacks}
                />
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
                <h2 className="text-xl font-bold">Nothing to see here</h2>
                <p className="mt-2">Try adjusting your filters or check back later!</p>
            </div>
        </div>
      )}
    </main>
  );
};

export default ExploreView;
