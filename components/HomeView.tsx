// Implemented the HomeView component to display a list of available rooms.
import React from 'react';
import { Room } from '../types';
import RoomCard from './RoomCard';

interface HomeViewProps {
  rooms: Room[];
  onEnterRoom: (room: Room) => void;
}

const HomeView: React.FC<HomeViewProps> = ({ rooms, onEnterRoom }) => {
  return (
    <div className="p-4 md:p-8 animate-fade-in">
      <h1 className="text-3xl font-bold text-white tracking-tight mb-6">Live Now</h1>
      {rooms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map(room => (
            <RoomCard key={room.id} room={room} onEnter={() => onEnterRoom(room)} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-800/50 rounded-lg">
          <p className="text-gray-400">No live rooms right now. Why not start one?</p>
        </div>
      )}
    </div>
  );
};

export default HomeView;
