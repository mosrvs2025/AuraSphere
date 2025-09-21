
import React from 'react';
// FIX: Corrected import path for types.
import { Room } from '../types.ts';

interface RoomCardProps {
  room: Room;
  onEnter: () => void;
}

const RoomCard: React.FC<RoomCardProps> = ({ room, onEnter }) => {
  return (
    <div
      onClick={onEnter}
      className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 cursor-pointer hover:bg-gray-700/70 transition-all duration-300 transform hover:-translate-y-1"
    >
      <div className="flex justify-between items-start">
        <h2 className="text-xl font-bold text-white mb-2">{room.title}</h2>
        <div className="flex items-center text-gray-400 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
            {room.listeners.length + room.speakers.length + room.hosts.length}
        </div>
      </div>
      <div className="flex items-center space-x-2 mt-4">
        <div className="flex -space-x-3">
          {room.hosts.slice(0, 2).map(host => (
            <img key={host.id} src={host.avatarUrl} alt={host.name} className="h-10 w-10 rounded-full border-2 border-gray-800" />
          ))}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-300">{room.hosts.map(h => h.name).join(', ')}</p>
          <p className="text-xs text-gray-500">Hosting</p>
        </div>
      </div>
    </div>
  );
};

export default RoomCard;