import React, { useRef, useEffect, useState } from 'react';
import { Room, User } from '../types.ts';
import { MicIcon, XIcon, ScreenShareIcon, MicOffIcon, SpeakerWaveIcon, SpeakerXMarkIcon } from './Icons.tsx';
import ConfirmationModal from './ConfirmationModal.tsx';

interface MiniPlayerProps {
  room: Room;
  currentUser: User;
  onExpand: () => void;
  onLeave: () => void;
  localStream: MediaStream | null;
  onToggleMute: () => void;
  isRoomAudioMuted: boolean;
  onToggleRoomAudio: () => void;
}

const MiniPlayer: React.FC<MiniPlayerProps> = ({ room, currentUser, onExpand, onLeave, localStream, onToggleMute, isRoomAudioMuted, onToggleRoomAudio }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showConfirmLeave, setShowConfirmLeave] = useState(false);
  const isHost = room.hosts.some(h => h.id === currentUser.id);

  useEffect(() => {
    if (videoRef.current && localStream) {
      videoRef.current.srcObject = localStream;
    }
  }, [localStream]);
  
  const isVideoActive = isHost && room.isVideoEnabled && localStream;

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
  
  const renderMuteButton = () => {
    if (isHost) {
        return (
            <button 
                onClick={onToggleMute} 
                className={`p-2 rounded-full transition-colors ${room.isMicMuted ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                aria-label={room.isMicMuted ? "Unmute microphone" : "Mute microphone"}
            >
                {room.isMicMuted ? <MicOffIcon className="w-5 h-5" /> : <MicIcon className="w-5 h-5" />}
            </button>
        )
    }
    return (
        <button
            onClick={onToggleRoomAudio}
            className={`p-2 rounded-full transition-colors ${isRoomAudioMuted ? 'bg-gray-700 text-gray-300' : 'bg-indigo-600 text-white'}`}
            aria-label={isRoomAudioMuted ? "Unmute room audio" : "Mute room audio"}
        >
            {isRoomAudioMuted ? <SpeakerXMarkIcon className="w-5 h-5" /> : <SpeakerWaveIcon className="w-5 h-5" />}
        </button>
    )
  }

  return (
    <>
        <div className="h-20 bg-gray-800/80 backdrop-blur-sm border-t border-gray-700/50 z-30 flex items-center justify-between px-4 animate-slide-up flex-shrink-0">
        <button onClick={onExpand} className="flex items-center space-x-3 overflow-hidden flex-1">
            <div className="w-14 h-14 rounded-full bg-black overflow-hidden flex-shrink-0">
               {renderPreview()}
            </div>
            <div className="text-left flex-1 overflow-hidden">
                <p className="font-bold text-sm text-white truncate">{room.title}</p>
                <p className="text-xs text-gray-400 truncate">Tap to return to the room</p>
            </div>
        </button>

        <div className="flex items-center space-x-2 pl-2">
            {renderMuteButton()}
            <button onClick={(e) => { e.stopPropagation(); setShowConfirmLeave(true); }} className="p-2 bg-red-600/80 rounded-full text-white">
            <XIcon className="w-5 h-5" />
            </button>
        </div>
        </div>
        {showConfirmLeave && (
            <ConfirmationModal
                title="Leave Room?"
                message="Are you sure you want to leave this room?"
                confirmText="Leave Room"
                onConfirm={onLeave}
                onCancel={() => setShowConfirmLeave(false)}
            />
        )}
    </>
  );
};

export default MiniPlayer;
