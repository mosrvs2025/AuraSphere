import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Room, User, DiscoverItem } from '../types';
import SearchView from './SearchView';
import { SearchIcon } from './Icons';
import { DiscoverItemRenderer } from './DiscoverCards';

interface DiscoverViewProps {
  allRooms: Room[];
  allUsers: User[];
  discoverFeed: DiscoverItem[];
  onEnterRoom: (room: Room) => void;
  onViewProfile: (user: User) => void;
  autoFocusSearch: boolean;
}

const FILTER_CATEGORIES = ['All', 'Live', 'Reels', 'Images', 'Notes'];
type FilterType = 'All' | 'Live' | 'Reels' | 'Images' | 'Notes';

const DiscoverView: React.FC<DiscoverViewProps> = ({ allRooms, allUsers, discoverFeed, onEnterRoom, onViewProfile, autoFocusSearch }) => {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocusSearch) {
      searchInputRef.current?.focus();
    }
  }, [autoFocusSearch]);

  const filteredRooms = useMemo(() => {
    if (!query.trim()) return [];
    const lowerCaseQuery = query.toLowerCase();
    return allRooms.filter(room => 
        room.title.toLowerCase().includes(lowerCaseQuery) || 
        room.hosts.some(h => h.name.toLowerCase().includes(lowerCaseQuery))
    );
  }, [query, allRooms]);

  const filteredUsers = useMemo(() => {
    if (!query.trim()) return [];
    const lowerCaseQuery = query.toLowerCase();
    return allUsers.filter(user => user.name.toLowerCase().includes(lowerCaseQuery));
  }, [query, allUsers]);

  const filteredDiscoverFeed = useMemo(() => {
    if (activeFilter === 'All') return discoverFeed;
    const filterMap: Record<FilterType, DiscoverItem['type'] | null> = {
        'All': null,
        'Live': 'live_room',
        'Reels': 'video_post',
        'Images': 'image_post',
        'Notes': 'text_post'
    };
    const type = filterMap[activeFilter];
    return discoverFeed.filter(item => item.type === type);
  }, [discoverFeed, activeFilter]);


  return (
    <div className="animate-fade-in flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 p-4 space-y-4">
        <div className="relative flex-1">
             <input
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for rooms, people, or posts..."
                className="bg-gray-800 border border-gray-700 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                <SearchIcon />
            </div>
        </div>
        {!query.trim() && (
            <div className="flex items-center space-x-2 overflow-x-auto pb-2 -mb-2">
                {FILTER_CATEGORIES.map(category => (
                    <button 
                        key={category}
                        onClick={() => setActiveFilter(category as FilterType)}
                        className={`px-4 py-1.5 text-sm font-semibold rounded-full flex-shrink-0 transition ${activeFilter === category ? 'bg-indigo-600 text-white' : 'bg-gray-700/60 text-gray-300 hover:bg-gray-700'}`}
                    >
                        {category}
                    </button>
                ))}
            </div>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-4">
        {query.trim() ? (
          <SearchView
            query={query}
            rooms={filteredRooms}
            users={filteredUsers}
            onEnterRoom={onEnterRoom}
            onViewProfile={onViewProfile}
          />
        ) : (
           <div className="animate-fade-in">
                <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4">
                    {filteredDiscoverFeed.map((item) => (
                        <div key={`${item.type}-${item.id}`} className="break-inside-avoid">
                            <DiscoverItemRenderer
                                item={item}
                                onEnterRoom={onEnterRoom}
                                onViewProfile={onViewProfile}
                            />
                        </div>
                    ))}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default DiscoverView;
