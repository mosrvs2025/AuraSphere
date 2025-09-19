import React, { useState, useEffect, useRef } from 'react';
import { Conversation, User, ChatMessage } from '../types';
import DynamicInput from './DynamicInput';

// --- Sub-component for Audio Notes ---
interface AudioNoteBubbleProps {
    message: ChatMessage;
    isPlaying: boolean;
    onPlay: () => void;
}
const AudioNoteBubble: React.FC<AudioNoteBubbleProps> = ({ message, isPlaying, onPlay }) => {
    return (
        <div className="flex items-center space-x-2 bg-gray-700 p-2 rounded-lg w-48">
            <button onClick={onPlay} className="p-2 bg-indigo-500 rounded-full text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                   {isPlaying ? <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 00-1 1v2a1 1 0 102 0V9a1 1 0 00-1-1zm6 0a1 1 0 00-1 1v2a1 1 0 102 0V9a1 1 0 00-1-1z" clipRule="evenodd" /> : <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />}
                </svg>
            </button>
            <div className="flex-1 h-6 flex items-center space-x-0.5">
                {[0.6, 0.9, 0.7, 0.8, 0.5, 0.9, 0.4].map((h, i) => (
                    <div key={i} style={{ height: `${h * 100}%` }} className="w-1 bg-gray-500 rounded-full"></div>
                ))}
            </div>
            <span className="text-xs text-gray-400 font-mono">0:{message.voiceMemo?.duration.toString().padStart(2, '0')}</span>
        </div>
    );
};

// --- Sub-component for Video Notes ---
interface VideoNoteBubbleProps {
    message: ChatMessage;
}
const VideoNoteBubble: React.FC<VideoNoteBubbleProps> = ({ message }) => {
    return (
        <div className="relative w-40 h-56 rounded-lg overflow-hidden cursor-pointer group">
            <img src={message.videoNote?.thumbnailUrl} alt="Video note thumbnail" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                 <button className="p-3 bg-white/30 backdrop-blur-sm rounded-full text-white scale-100 group-hover:scale-110 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>
            <span className="absolute bottom-1 right-2 text-xs text-white bg-black/50 px-1.5 py-0.5 rounded font-mono">
                0:{message.videoNote?.duration.toString().padStart(2, '0')}
            </span>
        </div>
    );
};


interface ConversationViewProps {
  conversation: Conversation;
  currentUser: User;
  onBack: () => void;
  onViewProfile: (user: User) => void;
}

const ConversationView: React.FC<ConversationViewProps> = ({ conversation, currentUser, onBack, onViewProfile }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(conversation.messages);
  const otherParticipant = conversation.participants.find(p => p.id !== currentUser.id);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [nowPlayingAudioNoteId, setNowPlayingAudioNoteId] = useState<string | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendTextMessage = (text: string) => {
    if (!text.trim()) return;

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      user: currentUser,
      text: text.trim(),
      createdAt: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSendAudioNote = (url: string, duration: number) => {
    const newMessage: ChatMessage = {
        id: `m-${Date.now()}`,
        user: currentUser,
        createdAt: new Date(),
        voiceMemo: { url, duration: Math.round(duration) }
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSendVideoNote = (url: string, duration: number) => {
    const newMessage: ChatMessage = {
       id: `m-${Date.now()}`,
       user: currentUser,
       createdAt: new Date(),
       videoNote: { url: url, thumbnailUrl: `https://picsum.photos/seed/${Date.now()}/200/300`, duration: Math.round(duration) }
   };
   setMessages(prev => [...prev, newMessage]);
  };

  const handlePlayAudioToggle = (messageId: string) => {
    if (!audioPlayerRef.current) return;
    
    if (nowPlayingAudioNoteId === messageId) {
        audioPlayerRef.current.pause();
    } else {
        const messageToPlay = messages.find(m => m.id === messageId);
        if (messageToPlay?.voiceMemo?.url) {
            audioPlayerRef.current.src = messageToPlay.voiceMemo.url;
            audioPlayerRef.current.play().catch(console.error);
            setNowPlayingAudioNoteId(messageId);
        }
    }
  };

  const handleAudioEnded = () => {
    setNowPlayingAudioNoteId(null);
  };


  if (!otherParticipant) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <p className="text-gray-400">Participant not found.</p>
        <button onClick={onBack} className="mt-4 text-indigo-400 font-semibold">&larr; Back to Messages</button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col max-w-2xl mx-auto animate-fade-in">
      <audio ref={audioPlayerRef} onEnded={handleAudioEnded} onPause={handleAudioEnded}></audio>
      <header className="flex items-center p-4 border-b border-gray-800 sticky top-0 bg-gray-900/80 backdrop-blur-sm z-10">
        <button onClick={onBack} className="text-indigo-400 hover:text-indigo-300 font-semibold text-sm">&larr; Back</button>
        <button onClick={() => onViewProfile(otherParticipant)} className="flex items-center mx-auto group cursor-pointer" aria-label={`View profile of ${otherParticipant.name}`}>
            <img src={otherParticipant.avatarUrl} alt={otherParticipant.name} className="w-8 h-8 rounded-full mr-3" />
            <h1 className="text-lg font-bold text-center truncate group-hover:text-indigo-400 transition-colors">{otherParticipant.name}</h1>
        </button>
        <div className="w-16"></div>
      </header>

      <div className="flex-grow p-4 space-y-4 overflow-y-auto">
        {messages.map(msg => {
          const isCurrentUser = msg.user.id === currentUser.id;
          const alignment = isCurrentUser ? 'items-end' : 'items-start';
          const bubbleColor = isCurrentUser ? 'bg-indigo-600' : 'bg-gray-700';
          return (
            <div key={msg.id} className={`flex flex-col ${alignment} space-y-1`}>
              <div className={`max-w-xs md:max-w-md rounded-lg ${msg.text ? `${bubbleColor} p-3` : ''}`}>
                {msg.text && <p className="text-sm text-white break-words">{msg.text}</p>}
                {msg.voiceMemo && (
                    <AudioNoteBubble 
                        message={msg}
                        isPlaying={nowPlayingAudioNoteId === msg.id}
                        onPlay={() => handlePlayAudioToggle(msg.id)}
                    />
                )}
                {msg.videoNote && <VideoNoteBubble message={msg} />}
              </div>
              <p className="text-xs text-gray-500 px-1">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      <footer className="p-4 bg-gray-900/70 backdrop-blur-sm">
        <DynamicInput
            onSubmitMessage={handleSendTextMessage}
            onSubmitAudioNote={handleSendAudioNote}
            onSubmitVideoNote={handleSendVideoNote}
        />
      </footer>
    </div>
  );
};

export default ConversationView;