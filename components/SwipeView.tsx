import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Room, User } from '../types.ts';
import RoomView from './RoomView';
import { ChevronLeftIcon, ChevronRightIcon } from './Icons.tsx';

interface SwipeViewProps {
  rooms: Room[];
  initialRoomId: string;
  onMinimize: () => void;
  onLeave: () => void;
  onUpdateRoom: (updatedData: Partial<Room>) => void;
  onViewProfile: (user: User) => void;
  localStream: MediaStream | null;
  onViewVideoNote: (url: string) => void;
}

const SwipeView: React.FC<SwipeViewProps> = (props) => {
  const { rooms, initialRoomId, onMinimize, onLeave, onUpdateRoom, onViewProfile, localStream, onViewVideoNote } = props;
  
  const initialIndex = useMemo(() => {
    const idx = rooms.findIndex(r => r.id === initialRoomId);
    return idx > -1 ? idx : 0;
  }, [rooms, initialRoomId]);

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const containerRef = useRef<HTMLDivElement>(null);

  // State for touch gesture
  const [touchState, setTouchState] = useState({
    startX: 0,
    currentX: 0,
    isDragging: false,
  });

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchState({
      startX: e.touches[0].clientX,
      currentX: e.touches[0].clientX,
      isDragging: true,
    });
    if (containerRef.current) {
        containerRef.current.style.transition = 'none'; // Disable transition while dragging
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchState.isDragging) return;
    setTouchState(prev => ({ ...prev, currentX: e.touches[0].clientX }));
  };

  const handleTouchEnd = () => {
    if (!touchState.isDragging) return;
    
    if (containerRef.current) {
        containerRef.current.style.transition = 'transform 0.3s ease-out';
    }

    const deltaX = touchState.currentX - touchState.startX;
    const threshold = window.innerWidth / 4; // Must swipe at least a quarter of the screen

    if (deltaX < -threshold && currentIndex < rooms.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else if (deltaX > threshold && currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
    
    setTouchState({ startX: 0, currentX: 0, isDragging: false });
  };


  const activeRoom = rooms[currentIndex];
  if (!activeRoom) {
    return (
        <div className="fixed inset-0 bg-gray-900 z-50 flex items-center justify-center text-white" onClick={onMinimize}>
            <p>No more live rooms.</p>
        </div>
    );
  }

  const dragOffset = touchState.isDragging ? touchState.currentX - touchState.startX : 0;

  return (
    <div 
        className="fixed inset-0 bg-gray-900 z-50 animate-fade-in overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
    >
        <div 
            ref={containerRef}
            className="h-full w-full flex"
            style={{ 
                transform: `translateX(calc(-${currentIndex * 100}% + ${dragOffset}px))`,
                transition: touchState.isDragging ? 'none' : 'transform 0.3s ease-out'
            }}
        >
            {rooms.map((room) => (
                <div key={room.id} className="w-full h-full flex-shrink-0">
                    <RoomView
                        room={room}
                        onMinimize={onMinimize}
                        onLeave={onLeave}
                        onUpdateRoom={onUpdateRoom}
                        onViewProfile={onViewProfile}
                        localStream={localStream}
                        onViewVideoNote={onViewVideoNote}
                    />
                </div>
            ))}
        </div>

      {/* Swipe Cues */}
      {currentIndex > 0 && (
        <div className="absolute left-2 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none z-[99]">
            <ChevronLeftIcon className="w-8 h-8" />
        </div>
      )}
      {currentIndex < rooms.length - 1 && (
         <div className="absolute right-2 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none z-[99]">
            <ChevronRightIcon className="w-8 h-8" />
        </div>
      )}
    </div>
  );
};

export default SwipeView;