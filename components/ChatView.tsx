
// Implemented the ChatView component for real-time messaging in rooms.
import React, { useRef, useEffect, useState } from 'react';
// FIX: Corrected import path for types.
import { ChatMessage, User } from '../types.ts';
// FIX: Corrected import path for Icons.
import { ChevronDownIcon } from './Icons.tsx';
import AudioPlayer from './AudioPlayer.tsx';

// --- Sub-component for Emoji Reactions ---

const EMOJI_REACTIONS = ['👍', '❤️', '😂', '🔥', '💡', '🎉'];

const LongPressWrapper: React.FC<{ onToggleReaction: (emoji: string) => void, children: React.ReactNode }> = ({ onToggleReaction, children }) => {
    const [isPickerOpen, setPickerOpen] = useState(false);
    const pressTimer = useRef<number | null>(null);

    const handlePressStart = () => {
        pressTimer.current = window.setTimeout(() => {
            setPickerOpen(true);
        }, 500); // 500ms for long press
    };

    const handlePressEnd = () => {
        if (pressTimer.current) {
            clearTimeout(pressTimer.current);
            pressTimer.current = null;
        }
    };

    const handleReactionSelect = (emoji: string) => {
        onToggleReaction(emoji);
        setPickerOpen(false);
    };

    return (
        <div 
            className="relative"
            onMouseDown={handlePressStart}
            onMouseUp={handlePressEnd}
            onTouchStart={handlePressStart}
            onTouchEnd={handlePressEnd}
            onMouseLeave={handlePressEnd}
        >
            {children}
            {isPickerOpen && (
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 flex items-center bg-gray-900 border border-gray-700 p-1 rounded-full shadow-lg z-20">
                    {EMOJI_REACTIONS.map(emoji => (
                        <button key={emoji} onClick={() => handleReactionSelect(emoji)} className="p-2 text-xl hover:scale-125 transition-transform">
                            {emoji}
                        </button>
                    ))}
                </div>
            )}
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


// --- Main Chat View Component ---

interface ChatViewProps {
  messages: ChatMessage[];
  currentUser: User;
  onToggleReaction: (messageId: string, emoji: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  animatedReaction: { messageId: string, emoji: string } | null;
}

const ChatView: React.FC<ChatViewProps> = ({ messages, currentUser, onToggleReaction, isCollapsed, onToggleCollapse, animatedReaction }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!isCollapsed) {
      scrollToBottom();
    }
  }, [messages, isCollapsed]);

  return (
    <div className="flex flex-col bg-gray-800/80 backdrop-blur-sm overflow-hidden">
      <header className="p-4 border-b border-gray-700/50 flex-shrink-0">
         <button onClick={onToggleCollapse} className="w-full flex justify-between items-center text-left text-white font-bold disabled:cursor-default" disabled={!onToggleCollapse}>
            <span>Room Chat</span>
            <ChevronDownIcon className={`h-5 w-5 transform transition-transform duration-300 ${!onToggleCollapse ? 'hidden' : ''} ${!isCollapsed ? 'rotate-180' : ''}`} />
        </button>
      </header>
      <div className={`overflow-y-auto transition-all duration-300 ease-in-out ${isCollapsed ? 'max-h-0 opacity-0' : 'max-h-[300px] opacity-100 p-4 space-y-4'}`}>
        {messages.map(msg => {
          const reactions: Record<string, string[]> = msg.reactions ?? {};
          const totalReactions = Object.values(reactions).reduce((sum, users) => sum + users.length, 0);
          return (
            <div key={msg.id} className="flex items-start space-x-3">
              <img src={msg.user.avatarUrl} alt={msg.user.name} className="w-8 h-8 rounded-full flex-shrink-0 mt-1" />
              <div className="flex-1">
                <p className="font-bold text-sm text-indigo-300">{msg.user.name}</p>
                <div className="relative inline-block">
                    {msg.text && (
                        <LongPressWrapper onToggleReaction={(emoji) => onToggleReaction(msg.id, emoji)}>
                            <p className="text-sm text-gray-200 bg-gray-700/50 px-3 py-2 rounded-lg inline-block">{msg.text}</p>
                        </LongPressWrapper>
                    )}
                    {msg.voiceMemo && (
                        <LongPressWrapper onToggleReaction={(emoji) => onToggleReaction(msg.id, emoji)}>
                            <div className="w-48">
                                <AudioPlayer src={msg.voiceMemo.url} />
                            </div>
                        </LongPressWrapper>
                    )}
                    {msg.videoNote && <VideoNoteBubble message={msg} />}
                    
                    {totalReactions > 0 && (
                        <div className="absolute -bottom-4 left-2 flex items-center space-x-1.5 bg-gray-900 px-1.5 py-0.5 rounded-full text-xs z-10">
                            {Object.entries(reactions).map(([emoji, users]) => 
                                users.length > 0 ? (
                                    <span 
                                        key={emoji}
                                        className={`${animatedReaction?.messageId === msg.id && animatedReaction?.emoji === emoji ? 'animate-reaction' : ''}`}
                                    >
                                        {emoji} <span className="text-gray-400">{users.length}</span>
                                    </span>
                                ) : null
                            )}
                        </div>
                    )}
                </div>
              </div>
            </div>
        )})}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ChatView;