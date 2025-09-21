import React, { useState, useEffect, useMemo, useContext } from 'react';
import { Room, User } from '../types';
import RoomView from './RoomView';
import { ChevronUpIcon } from './Icons';
import { UserContext } from '../context/UserContext';

interface SwipeViewProps {
  rooms: Room[];
  initialRoomId: string;
  onClose: () => void;
  onUpdateRoom: (updatedData: Partial<Room>) => void;
  onViewProfile: (user: User) => void;
}

const SwipeView: React.FC<SwipeViewProps> = ({ rooms, initialRoomId, onClose, onUpdateRoom, onViewProfile }) => {
  const initialIndex = useMemo(() => {
    const idx = rooms.findIndex(r => r.id === initialRoomId);
    return idx > -1 ? idx : 0;
  }, [rooms, initialRoomId]);

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY > 50) { // Swipe down (for next room)
        setCurrentIndex(prev => Math.min(prev + 1, rooms.length - 1));
      } else if (e.deltaY < -50) { // Swipe up (for previous room)
        setCurrentIndex(prev => Math.max(prev - 1, 0));
      }
    };
    window.addEventListener('wheel', handleWheel);
    return () => window.removeEventListener('wheel', handleWheel);
  }, [rooms.length]);

  const activeRoom = rooms[currentIndex];

  if (!activeRoom) {
    return (
        <div className="fixed inset-0 bg-gray-900 z-50 flex items-center justify-center text-white" onClick={onClose}>
            <p>No more live rooms.</p>
        </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-900 z-50 animate-fade-in">
      <div className="h-full w-full relative">
        {rooms.map((room, index) => (
          <div
            key={room.id}
            className="absolute inset-0 transition-transform duration-500 ease-in-out"
            style={{
              transform: `translateY(${(index - currentIndex) * 100}%)`,
              zIndex: rooms.length - Math.abs(index - currentIndex),
            }}
          >
            {Math.abs(index - currentIndex) <= 1 && ( // Only render current, next, and prev rooms
              <RoomView
                room={room}
                onLeave={onClose}
                onUpdateRoom={onUpdateRoom}
                onViewProfile={onViewProfile}
              />
            )}
          </div>
        ))}
      </div>

      {/* Swipe Up Cue */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 text-white pointer-events-none z-[99]">
          <div className="animate-bounce">
            <ChevronUpIcon className="w-8 h-8 opacity-60" />
          </div>
      </div>
    </div>
  );
};

export default SwipeView;