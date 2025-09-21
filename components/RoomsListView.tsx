import React from 'react';
import { Room } from '../types';
import RoomCard from './RoomCard';

interface RoomsListViewProps {
  rooms: Room[];
  onEnterRoom: (room: Room) => void;
}

const RoomsListView: React.FC<RoomsListViewProps> = ({ rooms, onEnterRoom }) => {
  if (rooms.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">No live rooms right now.</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {rooms.map(room => (
        <RoomCard key={room.id} room={room} onEnter={() => onEnterRoom(room)} />
      ))}
    </div>
  );
};

export default RoomsListView;
