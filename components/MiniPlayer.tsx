
import React from 'react';
// FIX: Corrected import path for types.
import { Room } from '../types.ts';
// FIX: Corrected import path for Icons.
import { MicIcon, XIcon } from './Icons.tsx';

interface MiniPlayerProps {
  room: Room;
  onExpand: () => void;
  onLeave: () => void;
}

const MiniPlayer: React.FC<MiniPlayerProps> = ({ room, onExpand, onLeave }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-gray-800/80 backdrop-blur-sm border-t border-gray-700/50 z-30 flex items-center justify-between px-4 animate-slide-up md:bottom-auto md:top-4 md:right-4 md:left-auto md:w-96 md:rounded-lg md:border">
      <button onClick={onExpand} className="flex items-center space-x-3 overflow-hidden">
        <img src={room.hosts[0]?.avatarUrl} alt={room.hosts[0]?.name} className="w-10 h-10 rounded-md flex-shrink-0" />
        <div className="text-left">
          <p className="font-bold text-sm text-white truncate">{room.title}</p>
          <p className="text-xs text-gray-400 truncate">Tap to return to the room</p>
        </div>
      </button>

      <div className="flex items-center space-x-2">
        <button className="p-2 bg-gray-700 rounded-full text-gray-300">
          <MicIcon className="w-5 h-5" />
        </button>
        <button onClick={onLeave} className="p-2 bg-red-600/80 rounded-full text-white">
          <XIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default MiniPlayer;