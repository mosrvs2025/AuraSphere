
// Implemented ScheduledRoomDetailView for displaying details of a future event.
import React from 'react';
// FIX: Corrected import path for types.
import { Room } from '../types.ts';

interface ScheduledRoomDetailViewProps {
  room: Room;
  onBack: () => void;
}

const ScheduledRoomDetailView: React.FC<ScheduledRoomDetailViewProps> = ({ room, onBack }) => {
  return (
    <div className="p-4 md:p-6 animate-fade-in max-w-2xl mx-auto">
      <button onClick={onBack} className="text-indigo-400 hover:text-indigo-300 font-semibold text-sm mb-6">&larr; Back to Scheduled</button>
      <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700/50">
        <p className="text-indigo-400 font-semibold mb-2">{room.scheduledTime?.toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}</p>
        <h1 className="text-3xl font-bold text-white">{room.title}</h1>
        <p className="text-gray-400 mt-4">{room.description}</p>
        
        <div className="mt-6">
            <h2 className="font-bold text-lg mb-3">Hosts</h2>
            <div className="flex items-center space-x-4">
                {room.hosts.map(host => (
                    <div key={host.id} className="flex flex-col items-center">
                        <img src={host.avatarUrl} alt={host.name} className="w-16 h-16 rounded-full" />
                        <span className="text-sm mt-2">{host.name}</span>
                    </div>
                ))}
            </div>
        </div>
        
        <button className="w-full mt-8 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-full transition">
          🔔 Notify Me When It Starts
        </button>
      </div>
    </div>
  );
};

export default ScheduledRoomDetailView;