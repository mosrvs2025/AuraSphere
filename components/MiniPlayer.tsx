import React from 'react';
import { Room } from '../types';

interface MiniPlayerProps {
  room: Room;
  onLeave: () => void;
  onMaximize: () => void;
}

const MiniPlayer: React.FC<MiniPlayerProps> = ({ room, onLeave, onMaximize }) => {
  const host = room.hosts[0];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 animate-slide-up">
      <div className="bg-gray-800/80 backdrop-blur-sm border-t border-gray-700/50 p-2 md:px-4 flex items-center justify-between">
        <button onClick={onMaximize} className="flex items-center space-x-3 flex-1 overflow-hidden text-left group">
          <img src={host.avatarUrl} alt={host.name} className="w-12 h-12 rounded-md object-cover flex-shrink-0" />
          <div className="overflow-hidden">
            <p className="font-bold text-white truncate group-hover:text-indigo-400 transition-colors">{room.title}</p>
            <p className="text-sm text-gray-400 truncate">with {host.name}</p>
          </div>
        </button>
        <div className="flex items-center space-x-2 pl-2">
          <button className="p-2 text-white bg-indigo-600 rounded-full hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500" aria-label="Pause audio">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
          </button>
          <button onClick={(e) => { e.stopPropagation(); onLeave(); }} className="p-2 text-gray-400 hover:text-white" aria-label="Leave room">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MiniPlayer;
