
import React, { useState, useMemo, useEffect } from 'react';
// FIX: Corrected import path for types.
import { DiscoverItem, Room, User, CurationTab } from '../types.ts';
import VerticalNav from './VerticalNav.tsx';
// FIX: Corrected import path for ExploreView component.
import ExploreView from './ExploreView.tsx';
import GlobalHeader from './GlobalHeader.tsx';
// FIX: Corrected import path for FabCreateMenu component.
import FabCreateMenu from './FabCreateMenu.tsx';
import CreateRoomModal from './CreateRoomModal.tsx';
import CreateNoteView from './CreateNoteView.tsx';

interface HomeViewProps {
  discoverItems: DiscoverItem[];
  onEnterRoom: (room: Room) => void;
  onViewProfile: (user: User) => void;
  onViewMedia: (post: Extract<DiscoverItem, { type: 'image_post' | 'video_post' }>) => void;
  onViewPost: (post: Extract<DiscoverItem, { type: 'text_post' | 'voice_note_post' }>) => void;
}

const HomeView: React.FC<HomeViewProps> = (props) => {
  const [isFilterPanelOpen, setFilterPanelOpen] = useState(false);
  const [isLiveFilterActive, setIsLiveFilterActive] = useState(false);
  const [liveVibeColor, setLiveVibeColor] = useState('bg-indigo-600');
  const [activeMediaType, setActiveMediaType] = useState<DiscoverItem['type'] | 'All'>('All');
  const [curationTab, setCurationTab] = useState<CurationTab>('forYou');
  const [activeTopicTag, setActiveTopicTag] = useState<string>('All');
  const [isCreateRoomOpen, setCreateRoomOpen] = useState(false);
  const [isCreateNoteOpen, setCreateNoteOpen] = useState(false);

  // Simulate the "vibe" color changing for the Live Activity button
  useEffect(() => {
    const colors = ['bg-indigo-600', 'bg-blue-600', 'bg-green-600', 'bg-orange-600', 'bg-red-600'];
    const interval = setInterval(() => {
      setLiveVibeColor(colors[Math.floor(Math.random() * colors.length)]);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const trendingTags = useMemo(() => {
    const tags = new Set<string>(['All']);
    props.discoverItems.forEach(item => {
      if ('tags' in item && item.tags) {
        item.tags.forEach(tag => tags.add(tag));
      }
    });
    return Array.from(tags).slice(0, 10);
  }, [props.discoverItems]);

  const handleToggleLiveFilter = () => {
    setIsLiveFilterActive(prev => !prev);
    // When activating live, ensure media type is compatible or 'All'
    if (!isLiveFilterActive) {
        setActiveMediaType('All'); 
    }
  };

  return (
    <>
      <div className="flex h-full flex-col">
        <GlobalHeader
          onFilterClick={() => setFilterPanelOpen(true)}
          curationTab={curationTab}
          onCurationTabChange={setCurationTab}
          trendingTags={trendingTags}
          activeTopicTag={activeTopicTag}
          onTopicTagChange={setActiveTopicTag}
        />
        <ExploreView
          items={props.discoverItems}
          curationTab={curationTab}
          activeMediaType={activeMediaType}
          activeTopicTag={activeTopicTag}
          isLiveFilterActive={isLiveFilterActive}
          onEnterRoom={props.onEnterRoom}
          onViewProfile={props.onViewProfile}
          onViewMedia={props.onViewMedia}
          onViewPost={props.onViewPost}
        />
      </div>
      <VerticalNav
        isOpen={isFilterPanelOpen}
        onClose={() => setFilterPanelOpen(false)}
        activeFilter={activeMediaType}
        onFilterChange={setActiveMediaType}
        isLiveFilterActive={isLiveFilterActive}
        onToggleLiveFilter={handleToggleLiveFilter}
        liveVibeColor={liveVibeColor}
      />
      <FabCreateMenu 
        onStartRoom={() => setCreateRoomOpen(true)} 
        onNewPost={() => setCreateNoteOpen(true)}
      />
      {/* Modals for creation would be rendered here in a real app, handled by App.tsx */}
    </>
  );
};

export default HomeView;