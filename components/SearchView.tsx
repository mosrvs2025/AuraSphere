// Implemented a basic SearchView component.
import React from 'react';
import { Room, User } from '../types';
import RoomCard from './RoomCard';

interface SearchViewProps {
  query: string;
  rooms: Room[];
  users: User[];
  onEnterRoom: (room: Room) => void;
  onViewProfile: (user: User) => void;
}

const UserSearchResult: React.FC<{user: User; onViewProfile: (user: User) => void}> = ({ user, onViewProfile }) => (
    <button onClick={() => onViewProfile(user)} className="w-full flex items-center p-3 rounded-lg bg-gray-800/50 hover:bg-gray-700/70 transition-colors text-left">
      <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full mr-4" />
      <div>
        <p className="font-bold text-white">{user.name}</p>
        <p className="text-sm text-gray-400 truncate max-w-xs">{user.bio}</p>
      </div>
    </button>
);

const SearchView: React.FC<SearchViewProps> = ({ query, rooms, users, onEnterRoom, onViewProfile }) => {
  return (
    <div className="p-4 md:p-6 animate-fade-in">
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">
                Search results for <span className="text-indigo-400">"{query}"</span>
            </h1>

            <section className="mb-8">
                <h2 className="text-xl font-bold text-gray-300 mb-4">Rooms</h2>
                {rooms.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {rooms.map(room => (
                            <RoomCard key={room.id} room={room} onEnter={() => onEnterRoom(room)} />
                        ))}
                    </div>
                ) : <p className="text-gray-500">No rooms found.</p>}
            </section>

            <section>
                <h2 className="text-xl font-bold text-gray-300 mb-4">People</h2>
                {users.length > 0 ? (
                    <div className="space-y-2">
                        {users.map(user => (
                           <UserSearchResult key={user.id} user={user} onViewProfile={onViewProfile} />
                        ))}
                    </div>
                ) : <p className="text-gray-500">No people found.</p>}
            </section>
        </div>
    </div>
  );
};

export default SearchView;
