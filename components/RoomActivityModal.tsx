import React, { useState, useEffect } from 'react';
import { Room } from '../types';
import { UsersIcon } from './Icons';

interface RoomActivityModalProps {
  room: Room;
  onClose: () => void;
}

const formatDuration = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const parts: string[] = [];
    if (hours > 0) parts.push(hours.toString().padStart(2, '0'));
    parts.push(minutes.toString().padStart(2, '0'));
    parts.push(seconds.toString().padStart(2, '0'));

    return parts.join(':');
}

const RoomActivityModal: React.FC<RoomActivityModalProps> = ({ room, onClose }) => {
    const [talkingTime, setTalkingTime] = useState('00:00');

    useEffect(() => {
        const calculateDuration = () => {
            if (room.createdAt) {
                const durationMs = new Date().getTime() - new Date(room.createdAt).getTime();
                setTalkingTime(formatDuration(durationMs));
            }
        };

        calculateDuration();
        const interval = setInterval(calculateDuration, 1000);

        return () => clearInterval(interval);
    }, [room.createdAt]);

    const currentListeners = room.listeners.length;
    const totalListeners = room.totalListeners?.length || currentListeners;

    return (
        <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
            onClick={onClose}
        >
            <div 
                className="bg-gray-800 border border-gray-700 rounded-2xl p-6 w-full max-w-md m-4 text-white shadow-2xl animate-slide-up flex flex-col max-h-[80vh]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <h3 className="text-2xl font-bold">Room Activity</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6 flex-shrink-0">
                    <div className="bg-gray-900/50 p-4 rounded-lg text-center">
                        <p className="text-sm text-gray-400">Current Listeners</p>
                        <p className="text-3xl font-bold">{currentListeners}</p>
                    </div>
                    <div className="bg-gray-900/50 p-4 rounded-lg text-center">
                        <p className="text-sm text-gray-400">Total Listeners</p>
                        <p className="text-3xl font-bold">{totalListeners}</p>
                    </div>
                     <div className="bg-gray-900/50 p-4 rounded-lg text-center col-span-2">
                        <p className="text-sm text-gray-400">Talking Time</p>
                        <p className="text-3xl font-bold font-mono">{talkingTime}</p>
                    </div>
                </div>

                <div className="flex items-center space-x-2 text-gray-400 mb-2 flex-shrink-0">
                    <UsersIcon className="h-5 w-5" />
                    <h4 className="font-semibold">Currently in the room</h4>
                </div>
                
                <div className="flex-1 overflow-y-auto space-y-2 pr-2 -mr-2 scrollbar-hide">
                    {room.listeners.map(user => (
                        <div key={user.id} className="w-full flex items-center p-3 rounded-lg bg-gray-900">
                            <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full mr-4" />
                            <p className="font-semibold">{user.name}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default RoomActivityModal;
