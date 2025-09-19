// Implemented the ScheduledView to display upcoming rooms.
import React from 'react';
import { Room } from '../types';
import { ScheduledIcon } from './Icons';

const ScheduledRoomCard: React.FC<{ room: Room }> = ({ room }) => (
    <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50 flex items-start space-x-4">
        <div className="text-center flex-shrink-0 w-16">
            <p className="text-xs text-indigo-400">{room.scheduledTime?.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}</p>
            <p className="text-2xl font-bold">{room.scheduledTime?.getDate()}</p>
            <p className="text-sm text-gray-400">{room.scheduledTime?.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</p>
        </div>
        <div className="flex-1">
            <h3 className="font-bold text-white">{room.title}</h3>
            <p className="text-sm text-gray-400 mt-1">Hosted by {room.hosts.map(h => h.name).join(', ')}</p>
        </div>
        <button className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-1 px-3 rounded-full text-xs">
            Notify Me
        </button>
    </div>
);

interface ScheduledViewProps {
  rooms: Room[];
}

const ScheduledView: React.FC<ScheduledViewProps> = ({ rooms }) => {
  const scheduledRooms = rooms.filter(r => r.isScheduled).sort((a, b) => (a.scheduledTime?.getTime() ?? 0) - (b.scheduledTime?.getTime() ?? 0));

  return (
    <div className="p-4 md:p-6 animate-fade-in">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Scheduled Rooms</h1>
        {scheduledRooms.length > 0 ? (
          <div className="space-y-4">
            {scheduledRooms.map(room => (
              <ScheduledRoomCard key={room.id} room={room} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-800/50 rounded-lg border border-gray-700">
            <div className="inline-block p-4 bg-gray-800 rounded-full mb-4 text-gray-500">
                <ScheduledIcon />
            </div>
            <h2 className="text-xl font-bold text-gray-300">Nothing on the calendar</h2>
            <p className="text-gray-400 mt-2">There are no rooms scheduled for later.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduledView;
