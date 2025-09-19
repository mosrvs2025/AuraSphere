import React, { useState, useMemo } from 'react';
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

  return (
    <div className="fixed inset-0 bg-gray-900 z-50 animate-fade-in flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-4 flex items-center space-x-4 border-b border-gray-800">
        <div className="relative flex-1">
             <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for rooms or people..."
                className="bg-gray-800 border border-gray-700 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
                autoFocus
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                <SearchIcon />
            </div>
        </div>
        <button onClick={onClose} className="text-gray-300 hover:text-white font-semibold flex-shrink-0">Cancel</button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        {query.trim() ? (
          <SearchView
            query={query}
            rooms={filteredRooms}
            users={filteredUsers}
            onEnterRoom={onEnterRoom}
            onViewProfile={onViewProfile}
          />
        ) : (
          <div className="text-center p-8 text-gray-500 mt-10">
            <p>Start typing to find live rooms and interesting people.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchViewModal;