import React, { useState, useRef } from 'react';
import { RequestToSpeak, User } from '../types';
import { PlayIcon, PauseIcon, MicIcon, VideoCameraIcon } from './Icons';

interface RequestQueueViewProps {
  requests: RequestToSpeak[];
  onLikeRequest: (requestId: string) => void;
  onApproveRequest: (request: RequestToSpeak) => void;
  onBroadcastRequest: (request: RequestToSpeak) => void;
  isHost: boolean;
  currentUser: User;
}

const AudioNotePlayer: React.FC<{ voiceMemo: { url: string; duration: number } }> = ({ voiceMemo }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
        }
    };
    
    return (
        <div className="flex items-center space-x-2 bg-gray-700/50 p-2 rounded-lg mt-2">
            <audio 
                ref={audioRef} 
                src={voiceMemo.url} 
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
                preload="metadata"
            />
            <button onClick={togglePlay} className="p-2 bg-indigo-500 rounded-full text-white flex-shrink-0">
                {isPlaying ? <PauseIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4" />}
            </button>
            <div className="flex-1 h-1 bg-gray-500 rounded-full"></div>
            <span className="text-xs text-gray-400 font-mono">0:{voiceMemo.duration.toString().padStart(2, '0')}</span>
        </div>
    );
};


const RequestCard: React.FC<{
  request: RequestToSpeak;
  onLike: () => void;
  onApprove: () => void;
  onBroadcast: () => void;
  isHost: boolean;
  currentUser: User;
}> = ({ request, onLike, onApprove, onBroadcast, isHost, currentUser }) => {
  const isLiked = request.likes.includes(currentUser.id);
  const hasMedia = !!request.voiceMemo || !!request.videoNote;

  return (
    <div className="bg-gray-800/50 p-3 rounded-lg">
      <div className="flex items-start space-x-3">
        <img src={request.user.avatarUrl} alt={request.user.name} className="w-10 h-10 rounded-full flex-shrink-0" />
        <div className="flex-1">
          <p className="font-bold text-sm text-white">{request.user.name}</p>
          {request.text && <p className="text-sm text-gray-300 mt-1">{request.text}</p>}
          {request.voiceMemo && <AudioNotePlayer voiceMemo={request.voiceMemo} />}
          {request.videoNote && (
            <div className="relative w-32 h-48 rounded-lg overflow-hidden cursor-pointer group mt-2">
                <img src={request.videoNote.thumbnailUrl} alt="Video note thumbnail" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                    <PlayIcon className="h-8 w-8 text-white" />
                </div>
            </div>
          )}
          <div className="flex items-center space-x-4 mt-3">
            <button
              onClick={onLike}
              className={`flex items-center space-x-1 text-xs font-semibold transition-colors ${isLiked ? 'text-indigo-400' : 'text-gray-400 hover:text-white'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333V17a1 1 0 001 1h8a1 1 0 001-1v-6.667a2.25 2.25 0 00-.9-1.79l-4.5-3.375a1.5 1.5 0 00-1.7 0l-4.5 3.375a2.25 2.25 0 00-.9 1.79z" />
              </svg>
              <span>{request.likes.length > 0 ? request.likes.length : 'Like'}</span>
            </button>
            {isHost && (
              <>
                <button onClick={onApprove} className="text-xs font-semibold text-green-400 hover:text-green-300">
                    Invite to Speak
                </button>
                {hasMedia && (
                     <button onClick={onBroadcast} className="text-xs font-semibold text-purple-400 hover:text-purple-300">
                        Broadcast
                    </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const RequestQueueView: React.FC<RequestQueueViewProps> = ({ requests, onLikeRequest, onApproveRequest, onBroadcastRequest, isHost, currentUser }) => {

  const sortedRequests = [...requests].sort((a, b) => {
    // Sort by likes descending, then by creation date ascending (oldest first)
    if (b.likes.length !== a.likes.length) {
        return b.likes.length - a.likes.length;
    }
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
      {sortedRequests.length > 0 ? (
        sortedRequests.map(req => (
          <RequestCard
            key={req.id}
            request={req}
            onLike={() => onLikeRequest(req.id)}
            onApprove={() => onApproveRequest(req)}
            onBroadcast={() => onBroadcastRequest(req)}
            isHost={isHost}
            currentUser={currentUser}
          />
        ))
      ) : (
        <div className="text-center text-gray-500 pt-10">
          <p className="font-semibold">No requests yet</p>
          <p className="text-sm">Listeners can request to speak here.</p>
        </div>
      )}
    </div>
  );
};

export default RequestQueueView;
