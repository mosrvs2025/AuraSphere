import React, { useState, useMemo, useEffect } from 'react';
import { DiscoverItem, Room, User } from '../types';
import { DiscoverCard } from './DiscoverCards';

interface TrendingViewProps {
  items: DiscoverItem[];
  currentUser: User;
  curationTab: 'forYou' | 'following';
  activeFilter: string;
  onEnterRoom: (room: Room) => void;
  onViewProfile: (user: User) => void;
  onViewMedia: (post: Extract<DiscoverItem, { type: 'image_post' | 'video_post' }>) => void;
  onViewPost: (post: Extract<DiscoverItem, { type: 'text_post' | 'voice_note_post' }>) => void;
}

const filterMap: Record<string, DiscoverItem['type'] | 'All'> = {
    'All': 'All',
    'Live': 'live_room',
    'People': 'user_profile',
    'Images': 'image_post',
    'Videos': 'video_post',
    'Audio': 'voice_note_post',
    'Posts': 'text_post',
};

const TrendingView: React.FC<TrendingViewProps> = (props) => {
  const { items, currentUser, curationTab, activeFilter, onEnterRoom, onViewProfile, onViewMedia, onViewPost } = props;
    
  const displayedItems = useMemo(() => {
    let sourceItems: DiscoverItem[] = [...items]; // Create a mutable copy

    // 1. Primary Curation Filter (For You / Following)
    if (curationTab === 'following') {
        const followingIds = new Set(currentUser.following?.map(u => u.id) || []);
        sourceItems = items.filter(item => {
            if (item.type === 'live_room') {
                return item.hosts.some(host => followingIds.has(host.id));
            }
            if ('author' in item) {
                return followingIds.has(item.author.id);
            }
            // User profiles are not shown in the 'Following' feed
            return false;
        });

        // Sort chronologically, newest first
        sourceItems.sort((a, b) => {
            const dateA = ('createdAt' in a && a.createdAt) ? new Date(a.createdAt).getTime() : 0;
            const dateB = ('createdAt' in b && b.createdAt) ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA;
        });
        
        // Inject live rooms to the top, as they are happening "now"
        const liveFromFollows = sourceItems.filter(item => item.type === 'live_room');
        const otherContent = sourceItems.filter(item => item.type !== 'live_room');
        sourceItems = [...liveFromFollows, ...otherContent];
    }
    
    // 2. Secondary Content-Type Filter
    if (activeFilter === 'All' || activeFilter === 'Trending') return sourceItems;
    const typeToFilter = filterMap[activeFilter];
    return sourceItems.filter(item => item.type === typeToFilter);

  }, [items, curationTab, activeFilter, currentUser.following]);

  // Simple column-based layout. A real implementation might use a masonry library.
  const columns = [[], [], []] as DiscoverItem[][];
  displayedItems.forEach((item, i) => {
    columns[i % 3].push(item);
  });

  return (
    <div className="p-4 md:p-6 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        {displayedItems.length > 0 ? (
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
            <h2 className="text-xl font-bold text-gray-300">
                {curationTab === 'following' ? 'It\'s quiet here...' : 'Nothing to see here'}
            </h2>
            <p className="text-gray-400 mt-2">
                {curationTab === 'following' ? 'Follow people to see their latest content.' : 'No items found for this filter. Try another one!'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrendingView;
