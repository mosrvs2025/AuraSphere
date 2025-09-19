// Implemented the HomeView to display a list of active rooms.
import React from 'react';
import { Room } from '../types';
import RoomCard from './RoomCard';
import { SearchIcon } from './Icons';

interface HomeViewProps {
  rooms: Room[];
  onEnterRoom: (room: Room) => void;
}

const HomeView: React.FC<HomeViewProps> = ({ rooms, onEnterRoom }) => {
  return (
    <div className="p-4 md:p-6 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Live Rooms</h1>
           <div className="relative">
              <input type="text" placeholder="Search rooms..." className="bg-gray-800 border border-gray-700 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48" />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  <SearchIcon />
              </div>
           </div>
        </div>
        {rooms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.map(room => (
              <RoomCard key={room.id} room={room} onEnter={() => onEnterRoom(room)} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-800/50 rounded-lg border border-gray-700">
            <h2 className="text-xl font-bold text-gray-300">It's quiet in here...</h2>
            <p className="text-gray-400 mt-2">No live rooms right now. Why not start one?</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeView;
