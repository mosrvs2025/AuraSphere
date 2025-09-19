import React from 'react';
import { Room } from '../types';

interface ScheduledViewProps {
  rooms: Room[];
}

const ScheduledView: React.FC<ScheduledViewProps> = ({ rooms }) => {

  const sortedRooms = [...rooms].sort((a, b) => (a.scheduledTime?.getTime() || 0) - (b.scheduledTime?.getTime() || 0));

  return (
    <div className="p-4 md:p-6 animate-fade-in">
      <div className="max-w-2xl mx-auto space-y-4">
        {sortedRooms.length > 0 ? (
          sortedRooms.map(room => (
            <div key={room.id} className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
              <p className="font-bold text-indigo-400 text-sm">
                {room.scheduledTime?.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' })}
              </p>
              <h2 className="text-lg font-bold text-white mt-1">{room.title}</h2>
              <div className="flex items-center space-x-2 mt-2">
                <img src={room.hosts[0]?.avatarUrl} alt={room.hosts[0]?.name} className="w-6 h-6 rounded-full" />
                <span className="text-sm text-gray-400">Hosted by {room.hosts[0]?.name}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 bg-gray-800/50 rounded-lg">
            <p className="text-gray-400">There are no rooms scheduled.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduledView;