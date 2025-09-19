import React, { useState } from 'react';
import { Room, User } from '../types';
import SearchView from './SearchView';
import { SearchIcon } from './Icons';

interface SearchViewModalProps {
  onClose: () => void;
  allRooms: Room[];
  allUsers: User[];
  onEnterRoom: (room: Room) => void;
  onViewProfile: (user: User) => void;
}

const SearchViewModal: React.FC<SearchViewModalProps> = ({ onClose, allRooms, allUsers, onEnterRoom, onViewProfile }) => {
  const [query, setQuery] = useState('');

  const filteredRooms = query ? allRooms.filter(r => r.title.toLowerCase().includes(query.toLowerCase())) : [];
  const filteredUsers = query ? allUsers.filter(u => u.name.toLowerCase().includes(query.toLowerCase())) : [];

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 flex flex-col"
      onClick={onClose}
    >
      <div 
        className="bg-gray-900 w-full animate-slide-down"
        onClick={e => e.stopPropagation()}
      >
        <div className="max-w-4xl mx-auto p-4">
          <div className="relative">
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
          <div className="flex items-center justify-center h-full">
             <p className="text-gray-500">Start typing to search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchViewModal;
