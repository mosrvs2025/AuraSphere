import React, { useState, useMemo, useEffect } from 'react';
import { DiscoverItem, Room, User } from '../types';
import { DiscoverCard } from './DiscoverCards';

interface TrendingViewProps {
  items: DiscoverItem[];
  currentUser: User;
  liveRooms: Room[];
  initialFilter?: string | null;
  onEnterRoom: (room: Room) => void;
  onViewProfile: (user: User) => void;
  onViewMedia: (post: Extract<DiscoverItem, { type: 'image_post' | 'video_post' }>) => void;
  onViewPost: (post: Extract<DiscoverItem, { type: 'text_post' }>) => void;
}

const contentFilters = ['All', 'Live', 'People', 'Images', 'Videos', 'Posts'];
const filterMap: Record<string, DiscoverItem['type'] | 'All'> = {
    'All': 'All',
    'Live': 'live_room',
    'People': 'user_profile',
    'Images': 'image_post',
    'Videos': 'video_post',
    'Posts': 'text_post',
};

const LiveActivityRail: React.FC<{ liveRooms: Room[]; onEnterRoom: (room: Room) => void; }> = ({ liveRooms, onEnterRoom }) => {
    if (liveRooms.length === 0) {
        return null;
    }

    const uniqueHostsInRooms = new Map<string, Room>();
    liveRooms.forEach(room => {
        room.hosts.forEach(host => {
            if (!uniqueHostsInRooms.has(host.id)) {
                uniqueHostsInRooms.set(host.id, room);
            }
        });
    });

    return (
        <div className="mb-8">
            <div className="flex items-center space-x-4 overflow-x-auto pb-3 -mx-4 px-4 scrollbar-hide">
                {Array.from(uniqueHostsInRooms.entries()).map(([hostId, room]) => {
                    const host = room.hosts.find(h => h.id === hostId);
                    if (!host) return null;
                    return (
                        <button key={host.id} onClick={() => onEnterRoom(room)} className="flex flex-col items-center space-y-2 flex-shrink-0 w-20 text-center focus:outline-none group">
                            <div className="relative">
                                <img 
                                    src={host.avatarUrl} 
                                    alt={host.name} 
                                    className="w-16 h-16 rounded-full border-2 border-gray-700 group-hover:border-indigo-500 transition-colors" 
                                />
                                <div className="absolute -bottom-1 -right-1 bg-red-500 text-white text-xs font-bold uppercase px-1.5 py-0.5 rounded-md border-2 border-gray-900">
                                    Live
                                </div>
                                <div className="absolute inset-0 rounded-full ring-2 ring-offset-2 ring-offset-gray-900 ring-red-500 animate-pulse"></div>
                            </div>
                            <p className="text-xs text-white font-semibold truncate w-full">{host.name}</p>
                        </button>
                    )
                })}
            </div>
        </div>
    );
};


const TrendingView: React.FC<TrendingViewProps> = ({ items, currentUser, liveRooms, initialFilter, onEnterRoom, onViewProfile, onViewMedia, onViewPost }) => {
  const [curationTab, setCurationTab] = useState<'forYou' | 'following'>('forYou');
  const [activeFilter, setActiveFilter] = useState(initialFilter || 'All');

  useEffect(() => {
    if (initialFilter) {
      setActiveFilter(initialFilter);
    }
  }, [initialFilter]);
    
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
        <LiveActivityRail liveRooms={liveRooms} onEnterRoom={onEnterRoom} />

        {/* Primary Curation Tabs */}
        <div className="flex justify-center mb-4 border-b border-gray-800">
            <button
                onClick={() => setCurationTab('forYou')}
                className={`px-6 py-3 font-bold text-lg transition-colors ${curationTab === 'forYou' ? 'text-white border-b-2 border-white' : 'text-gray-500'}`}
            >
                For You
            </button>
            <button
                onClick={() => setCurationTab('following')}
                className={`px-6 py-3 font-bold text-lg transition-colors ${curationTab === 'following' ? 'text-white border-b-2 border-white' : 'text-gray-500'}`}
            >
                Following
            </button>
        </div>

        {/* Secondary Content-Type Filters */}
        <div className="mb-6">
            <div className="flex items-center space-x-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
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