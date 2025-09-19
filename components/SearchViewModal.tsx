import React, { useState } from 'react';
import { Room, User, DiscoverItem } from '../types';
import SearchView from './SearchView';
import { SearchIcon } from './Icons';
import TrendingView from './TrendingView';

interface SearchViewModalProps {
  onClose: () => void;
  allRooms: Room[];
  allUsers: User[];
  discoverItems: DiscoverItem[];
  onEnterRoom: (room: Room) => void;
  onViewProfile: (user: User) => void;
  onViewMedia: (post: Extract<DiscoverItem, { type: 'image_post' | 'video_post' }>) => void;
  onViewPost: (post: Extract<DiscoverItem, { type: 'text_post' }>) => void;
}

const SearchViewModal: React.FC<SearchViewModalProps> = ({ onClose, allRooms, allUsers, discoverItems, onEnterRoom, onViewProfile, onViewMedia, onViewPost }) => {
  const [query, setQuery] = useState('');

  const filteredRooms = query ? allRooms.filter(r => r.title.toLowerCase().includes(query.toLowerCase())) : [];
  const filteredUsers = query ? allUsers.filter(u => u.name.toLowerCase().includes(query.toLowerCase())) : [];

  return (
    <div 
      className="fixed inset-0 bg-gray-900 z-40 flex flex-col"
    >
      <div 
        className="bg-gray-900 w-full animate-slide-down"
        onClick={e => e.stopPropagation()}
      >
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <input 
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search rooms and people..."
                className="w-full bg-gray-800 border border-gray-700 rounded-full py-3 pl-12 pr-4 text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                autoFocus
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                <SearchIcon className="w-6 h-6" />
              </div>
            </div>
            <button onClick={onClose} className="text-gray-300 hover:text-white font-semibold pr-2">Cancel</button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto" onClick={e => e.stopPropagation()}>
        {query ? (
          <SearchView 
            query={query}
            rooms={filteredRooms}
            users={filteredUsers}
            onEnterRoom={onEnterRoom}
            onViewProfile={onViewProfile}
          />
        ) : (
          // FIX: Removed the unsupported 'title' prop from TrendingView.
          <TrendingView
            items={discoverItems}
            onEnterRoom={onEnterRoom}
            onViewProfile={onViewProfile}
            onViewMedia={onViewMedia}
            onViewPost={onViewPost}
          />
        )}
      </div>
    </div>
  );
};

export default SearchViewModal;
