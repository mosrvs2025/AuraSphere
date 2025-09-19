import React from 'react';
import { DiscoverItem, Room, User } from '../types';
import { DiscoverItemRenderer } from './DiscoverCards';

interface TrendingViewProps {
  feed: DiscoverItem[];
  onEnterRoom: (room: Room) => void;
  onViewProfile: (user: User) => void;
}

const TrendingView: React.FC<TrendingViewProps> = ({ feed, onEnterRoom, onViewProfile }) => {
  return (
    <div className="p-4 md:p-6 animate-fade-in">
      <h1 className="text-3xl font-bold mb-6">Trending on AuraSphere</h1>
      <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4">
        {feed.map((item) => (
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
  );
};

export default TrendingView;
