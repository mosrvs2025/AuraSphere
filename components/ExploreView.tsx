import React, { useState, useMemo } from 'react';
import { DiscoverItem, Room, User, CurationTab } from '../types.ts';
import VerticalNav from './VerticalNav.tsx';
import GlobalHeader from './GlobalHeader.tsx';
import { DiscoverCard } from './DiscoverCards.tsx';
import { SearchIcon } from './Icons.tsx';

const LiveRail: React.FC<{ liveRooms: Room[]; onEnterRoom: (room: Room) => void; }> = ({ liveRooms, onEnterRoom }) => {
    if (liveRooms.length === 0) {
        return null;
    }

    return (
        <div className="py-4 border-b border-gray-800">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 px-4">Live Now</h2>
            <div className="flex items-center space-x-4 overflow-x-auto pb-3 -mx-4 px-4 scrollbar-hide">
                {liveRooms.map((room) => (
                    <button key={room.id} onClick={() => onEnterRoom(room)} className="flex flex-col items-center space-y-2 flex-shrink-0 w-20 text-center focus:outline-none group">
                        <div className="relative">
                            <img 
                                src={room.hosts[0]?.avatarUrl} 
                                alt={room.hosts[0]?.name} 
                                className="w-16 h-16 rounded-full border-2 border-gray-700 group-hover:border-indigo-500 transition-colors" 
                            />
                             <div className="absolute inset-0 rounded-full animate-pulse-live pointer-events-none"></div>
                        </div>
                        <p className="text-xs text-white font-semibold truncate w-full">{room.title}</p>
                    </button>
                ))}
            </div>
        </div>
    );
};


interface ExploreViewProps {
  discoverItems: DiscoverItem[];
  onEnterRoom: (room: Room) => void;
  onViewProfile: (user: User) => void;
  onViewMedia: (post: Extract<DiscoverItem, { type: 'image_post' | 'video_post' }>) => void;
  onViewPost: (post: Extract<DiscoverItem, { type: 'text_post' | 'voice_note_post' }>) => void;
  activeFilter: DiscoverItem['type'] | 'All';
  onFilterChange: (filter: DiscoverItem['type'] | 'All') => void;
}

const ExploreView: React.FC<ExploreViewProps> = (props) => {
  const { discoverItems, activeFilter, onFilterChange, ...callbacks } = props;
  const [isFilterPanelOpen, setFilterPanelOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [curationTab, setCurationTab] = useState<CurationTab>('forYou');
  const [activeTopicTag, setActiveTopicTag] = useState<string>('All');

  const trendingTags = useMemo(() => {
    const tags = new Set<string>(['All']);
    props.discoverItems.forEach(item => {
      if ('tags' in item && item.tags) {
        item.tags.forEach(tag => tags.add(tag));
      }
    });
    return Array.from(tags).slice(0, 10);
  }, [props.discoverItems]);
  
  const isLiveFilterActive = activeFilter === 'live_room';

  const filteredItems = useMemo(() => {
    let results = [...discoverItems];
    const lcQuery = searchQuery.toLowerCase();

    // 1. Filter by search query
    if (lcQuery) {
        results = results.filter(item => {
             switch (item.type) {
                case 'live_room':
                return item.title.toLowerCase().includes(lcQuery) || item.description?.toLowerCase().includes(lcQuery);
                case 'user_profile':
                return item.name.toLowerCase().includes(lcQuery) || item.bio?.toLowerCase().includes(lcQuery);
                case 'text_post':
                return item.content.toLowerCase().includes(lcQuery) || item.author.name.toLowerCase().includes(lcQuery);
                case 'image_post':
                case 'video_post':
                case 'voice_note_post':
                return item.caption?.toLowerCase().includes(lcQuery) || item.author.name.toLowerCase().includes(lcQuery);
                default:
                return false;
            }
        });
    }

    // 2. Filter by Media Type
    if (activeFilter !== 'All') {
      results = results.filter(item => item.type === activeFilter);
    }
    
    // 3. Filter by Topic Tag
    if (activeTopicTag !== 'All') {
      results = results.filter(item => 
        'tags' in item && Array.isArray(item.tags) && item.tags.includes(activeTopicTag.replace('# ', ''))
      );
    }

    return results;
  }, [discoverItems, activeFilter, activeTopicTag, curationTab, searchQuery]);

  const liveRooms = useMemo(() => discoverItems.filter(item => item.type === 'live_room') as Room[], [discoverItems]);

  // Masonry layout logic
  const columns: DiscoverItem[][] = [[], [], []];
  filteredItems.forEach((item, i) => {
    columns[i % 3].push(item);
  });

  return (
    <>
      <div className="flex h-full flex-col">
        <header className="flex-shrink-0 bg-gray-900 sticky top-0 z-10 p-4 border-b border-gray-800">
             <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search AuraSphere..."
                className="w-full bg-gray-800 border border-gray-700 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                <SearchIcon className="w-5 h-5" />
              </div>
            </div>
        </header>
        <GlobalHeader
          onFilterClick={() => setFilterPanelOpen(true)}
          curationTab={curationTab}
          onCurationTabChange={setCurationTab}
          trendingTags={trendingTags}
          activeTopicTag={activeTopicTag}
          onTopicTagChange={setActiveTopicTag}
        />
        <main className="flex-1 overflow-y-auto p-4">
            <LiveRail liveRooms={liveRooms} onEnterRoom={callbacks.onEnterRoom} />
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
                        <h2 className="text-xl font-bold">No Results Found</h2>
                        <p className="mt-2">Try adjusting your search or filters.</p>
                    </div>
                </div>
            )}
        </main>
      </div>
      {/* FIX: Removed unsupported 'liveVibeColor' prop. */}
      <VerticalNav
        isOpen={isFilterPanelOpen}
        onClose={() => setFilterPanelOpen(false)}
        activeFilter={activeFilter}
        onFilterChange={onFilterChange}
        isLiveFilterActive={isLiveFilterActive}
        onToggleLiveFilter={() => onFilterChange(isLiveFilterActive ? 'All' : 'live_room')}
      />
    </>
  );
};

export default ExploreView;