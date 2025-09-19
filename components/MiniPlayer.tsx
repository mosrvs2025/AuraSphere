import React, { useState, useRef, useEffect } from 'react';
import { Room } from '../types';
import { PlayIcon, PauseIcon, XIcon } from './Icons';

interface MiniPlayerProps {
  room: Room;
  onLeave: () => void;
  onMaximize: () => void;
}

const MiniPlayer: React.FC<MiniPlayerProps> = ({ room, onLeave, onMaximize }) => {
  const host = room.hosts[0];
  const [isPlaying, setIsPlaying] = useState(true);

  const isPiP = room.isSharingScreen || !!room.videoUrl;

  // --- Dragging Logic for PiP Mode ---
  const [position, setPosition] = useState({ x: 16, y: window.innerHeight - 144 - 16 - 64 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const dragOffset = useRef({ x: 0, y: 0 });
  const playerRef = useRef<HTMLDivElement>(null);

  const handleDragStart = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    if (playerRef.current) {
        const rect = playerRef.current.getBoundingClientRect();
        dragOffset.current = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
    }
    e.preventDefault();
  };

  useEffect(() => {
    const handleDragMove = (e: MouseEvent) => {
      if (!isDragging) return;
      setPosition({
        x: e.clientX - dragOffset.current.x,
        y: e.clientY - dragOffset.current.y,
      });
    };

    const handleDragEnd = (e: MouseEvent) => {
      if (!isDragging) return;
      setIsDragging(false);
      // Check if it was a click (small movement) or a drag
      const distance = Math.sqrt(
        Math.pow(e.clientX - dragStartPos.current.x, 2) +
        Math.pow(e.clientY - dragStartPos.current.y, 2)
      );
      if (distance < 5) {
        onMaximize();
      }
    };
    
    window.addEventListener('mousemove', handleDragMove);
    window.addEventListener('mouseup', handleDragEnd);

    return () => {
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
    };
  }, [isDragging, onMaximize]);


  // --- Event Handlers for Controls ---
  const togglePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying(!isPlaying);
  };

  const handleLeave = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLeave();
  };

  return (
    <div
      ref={playerRef}
      className={`fixed z-30 transition-all duration-300 ease-out animate-fade-in ${
        isPiP
          ? 'w-64 aspect-video rounded-lg shadow-2xl cursor-pointer'
          : 'bottom-16 left-0 right-0 md:bottom-auto md:top-4 md:right-4 md:left-auto md:w-80'
      }`}
      style={isPiP ? { transform: `translate(${position.x}px, ${position.y}px)` } : {}}
      onMouseDown={isPiP ? handleDragStart : undefined}
    >
      {isPiP ? (
        // --- Picture-in-Picture (PiP) View ---
        <div className="w-full h-full flex flex-col bg-gray-800 rounded-lg overflow-hidden border border-gray-700/50">
          <div className="flex-1 bg-black flex items-center justify-center text-center text-gray-400 p-2">
            <p className="text-sm font-semibold">{room.isSharingScreen ? "Screen Share Active" : "Video Playback"}</p>
          </div>
          <div className="p-2">
            <p className="font-bold text-white text-sm truncate">{room.title}</p>
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-gray-400 truncate flex-1">with {host.name}</p>
              <div className="flex items-center space-x-1 flex-shrink-0">
                <button onClick={togglePlayPause} className="p-1 text-white bg-indigo-600 rounded-full hover:bg-indigo-500" aria-label={isPlaying ? "Pause" : "Play"}>
                  {isPlaying ? <PauseIcon className="h-4 w-4"/> : <PlayIcon className="h-4 w-4"/> }
                </button>
                <button onClick={handleLeave} className="p-1 text-gray-400 hover:text-white" aria-label="Leave room">
                  <XIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // --- Standard Audio Bar View ---
         <button 
            onClick={onMaximize} 
            className="w-full bg-gray-800/80 backdrop-blur-sm border-t border-gray-700/50 p-2 md:rounded-lg md:border md:shadow-2xl md:px-4 flex items-center justify-between text-left group"
            aria-label={`Maximize room: ${room.title}`}
          >
            <div className="flex items-center space-x-3 flex-1 overflow-hidden">
              <img src={host.avatarUrl} alt={host.name} className="w-12 h-12 rounded-md object-cover flex-shrink-0" />
              <div className="overflow-hidden">
                <p className="font-bold text-white truncate group-hover:text-indigo-400 transition-colors">{room.title}</p>
                <p className="text-sm text-gray-400 truncate">with {host.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-1 pl-2">
              <button onClick={togglePlayPause} className="p-2 text-white bg-indigo-600 rounded-full hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500" aria-label={isPlaying ? "Pause audio" : "Play audio"}>
                {isPlaying ? <PauseIcon className="h-6 w-6"/> : <PlayIcon className="h-6 w-6"/> }
              </button>
              <button onClick={handleLeave} className="p-2 text-gray-400 hover:text-white" aria-label="Leave room">
                <XIcon className="h-6 w-6" />
              </button>
            </div>
        </button>
      )}
    </div>
  );
};

export default MiniPlayer;