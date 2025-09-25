import React, { useRef, useEffect, useState } from 'react';
import { Room } from '../types.ts';
import { MicIcon, XIcon, ScreenShareIcon, MicOffIcon } from './Icons.tsx';
import ConfirmationModal from './ConfirmationModal.tsx';

interface MiniPlayerProps {
  room: Room;
  onExpand: () => void;
  onLeave: () => void;
  localStream: MediaStream | null;
  onToggleMute: () => void;
}

const MiniPlayer: React.FC<MiniPlayerProps> = ({ room, onExpand, onLeave, localStream, onToggleMute }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showConfirmLeave, setShowConfirmLeave] = useState(false);

  useEffect(() => {
    if (videoRef.current && localStream) {
      videoRef.current.srcObject = localStream;
    }
  }, [localStream]);
  
  const isVideoActive = room.isVideoEnabled && localStream;

  const renderPreview = () => {
    if (room.isSharingScreen) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-gray-700">
                <ScreenShareIcon className="w-6 h-6 text-indigo-400" />
            </div>
        )
    }
    if (isVideoActive) {
      return (
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          autoPlay
          muted
          playsInline
        />
      );
    }
    return (
      <img
        src={room.hosts[0]?.avatarUrl}
        alt={room.hosts[0]?.name}
        className="w-full h-full object-cover"
      />
    );
  };

  return (
    <>
        <div className="h-20 bg-gray-800/80 backdrop-blur-sm border-t border-gray-700/50 z-30 flex items-center justify-between px-4 animate-slide-up flex-shrink-0">
        <button onClick={onExpand} className="flex items-center space-x-3 overflow-hidden flex-1">
            <div className="w-28 h-16 rounded-md bg-black overflow-hidden flex-shrink-0">
            {renderPreview()}
            </div>
            <div className="text-left flex-1 overflow-hidden">
            <p className="font-bold text-sm text-white truncate">{room.title}</p>
            <p className="text-xs text-gray-400 truncate">Tap to return to the room</p>
            </div>
        </button>

        <div className="flex items-center space-x-2 pl-2">
            <button 
                onClick={onToggleMute} 
                className={`p-2 rounded-full transition-colors ${room.isMicMuted ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                aria-label={room.isMicMuted ? "Unmute microphone" : "Mute microphone"}
            >
                {room.isMicMuted ? <MicOffIcon className="w-5 h-5" /> : <MicIcon className="w-5 h-5" />}
            </button>
            <button onClick={(e) => { e.stopPropagation(); setShowConfirmLeave(true); }} className="p-2 bg-red-600/80 rounded-full text-white">
            <XIcon className="w-5 h-5" />
            </button>
        </div>
        </div>
        {showConfirmLeave && (
            <ConfirmationModal
                title="End This Room?"
                message="Are you sure you want to end this live session for everyone?"
                confirmText="End Room"
                onConfirm={onLeave}
                onCancel={() => setShowConfirmLeave(false)}
            />
        )}
    </>
  );
};

export default MiniPlayer;
