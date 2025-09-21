
import React from 'react';
import { Room } from '../types.ts';
import RoomsListView from './RoomsListView.tsx';

interface RoomsViewProps {
  rooms: Room[];
  onEnterRoom: (room: Room) => void;
}

const RoomsView: React.FC<RoomsViewProps> = ({ rooms, onEnterRoom }) => {
  const liveRooms = rooms.filter(r => !r.isScheduled);

  return (
    <div className="flex h-full flex-col">
        <header className="flex-shrink-0 bg-gray-900/80 backdrop-blur-sm border-b border-gray-800/50 sticky top-0 z-10 p-4">
            <h1 className="text-xl font-bold text-center">Live Rooms</h1>
        </header>
        <main className="flex-1 overflow-y-auto">
             <RoomsListView rooms={liveRooms} onEnterRoom={onEnterRoom} />
        </main>
    </div>
  );
};

export default RoomsView;
