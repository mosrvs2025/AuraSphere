import React, { useEffect, useRef } from 'react';
import { Room, User } from '../types';
import { XIcon } from './Icons';

interface BroadcastMediaViewProps {
  media: { type: 'voice' | 'video'; url: string; user: User };
  isHost: boolean;
  onStop: () => void;
}

const BroadcastMediaView: React.FC<BroadcastMediaViewProps> = ({ media, isHost, onStop }) => {
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement>(null);

  useEffect(() => {
    const element = mediaRef.current;
    if (!element) return;
    
    element.addEventListener('ended', onStop);
    return () => {
      element.removeEventListener('ended', onStop);
    };
  }, [onStop]);

  return (
    <div className="absolute inset-0 bg-black/80 z-40 flex flex-col items-center justify-center p-4 animate-fade-in">
      <div className="relative bg-gray-800 rounded-lg shadow-2xl p-4 w-full max-w-lg">
        <header className="flex items-center mb-4">
          <img src={media.user.avatarUrl} alt={media.user.name} className="w-10 h-10 rounded-full mr-3" />
          <div>
            <p className="font-bold text-white">{media.user.name}</p>
            <p className="text-sm text-indigo-400">Broadcasting a {media.type === 'voice' ? 'voice note' : 'video clip'}</p>
          </div>
        </header>

        {media.type === 'video' ? (
          <video ref={mediaRef as React.RefObject<HTMLVideoElement>} src={media.url} controls autoPlay className="w-full rounded" />
        ) : (
          <audio ref={mediaRef as React.RefObject<HTMLAudioElement>} src={media.url} controls autoPlay className="w-full" />
        )}

        {isHost && (
          <button onClick={onStop} className="absolute top-2 right-2 bg-red-600 hover:bg-red-500 text-white p-2 rounded-full">
            <XIcon className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default BroadcastMediaView;
