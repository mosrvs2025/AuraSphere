// Implemented the ChatView component for real-time messaging in rooms.
import React, { useRef, useEffect, useState } from 'react';
import { ChatMessage, User } from '../types';

// --- Sub-component for Audio Notes ---

const EMOJI_REACTIONS = ['👍', '❤️', '😂', '🔥'];

interface AudioNoteBubbleProps {
    message: ChatMessage;
    currentUser: User;
    isPlaying: boolean;
    onPlay: () => void;
    onToggleReaction: (emoji: string) => void;
}

const AudioNoteBubble: React.FC<AudioNoteBubbleProps> = ({ message, currentUser, isPlaying, onPlay, onToggleReaction }) => {
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
    
    const totalReactions = Object.values(message.reactions || {}).reduce((sum, users) => sum + users.length, 0);

    return (
        <div 
            className="relative"
            onMouseDown={handlePressStart}
            onMouseUp={handlePressEnd}
            onTouchStart={handlePressStart}
            onTouchEnd={handlePressEnd}
            onMouseLeave={handlePressEnd}
        >
            <div className="flex items-center space-x-2 bg-gray-700 p-2 rounded-lg w-48">
                <button onClick={onPlay} className="p-2 bg-indigo-500 rounded-full text-white">
                    {/* Play/Pause Icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                       {isPlaying ? <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 00-1 1v2a1 1 0 102 0V9a1 1 0 00-1-1zm6 0a1 1 0 00-1 1v2a1 1 0 102 0V9a1 1 0 00-1-1z" clipRule="evenodd" /> : <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />}
                    </svg>
                </button>
                {/* Simplified Waveform */}
                <div className="flex-1 h-6 flex items-center space-x-0.5">
                    {[0.6, 0.9, 0.7, 0.8, 0.5, 0.9, 0.4].map((h, i) => (
                        <div key={i} style={{ height: `${h * 100}%` }} className="w-1 bg-gray-500 rounded-full"></div>
                    ))}
                </div>
                <span className="text-xs text-gray-400 font-mono">0:{message.voiceMemo?.duration.toString().padStart(2, '0')}</span>
            </div>

            {/* Reactions Display */}
            {totalReactions > 0 && (
                 <div className="absolute -bottom-3 right-2 flex items-center space-x-1 bg-gray-800 border border-gray-900 px-1.5 py-0.5 rounded-full text-xs">
                     {Object.entries(message.reactions || {}).map(([emoji, users]) => 
                        users.length > 0 ? <span key={emoji}>{emoji} {users.length}</span> : null
                     )}
                 </div>
            )}


            {/* Reaction Picker */}
            {isPickerOpen && (
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 flex items-center bg-gray-900 border border-gray-700 p-1 rounded-full shadow-lg z-10">
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


// --- Main Chat View Component ---

interface ChatViewProps {
  messages: ChatMessage[];
  currentUser: User;
  onToggleReaction: (messageId: string, emoji: string) => void;
  nowPlayingAudioNoteId: string | null;
  onPlayAudioNote: (messageId: string) => void;
}

const ChatView: React.FC<ChatViewProps> = ({ messages, currentUser, onToggleReaction, nowPlayingAudioNoteId, onPlayAudioNote }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  return (
    <div className="h-full flex flex-col bg-gray-800/50">
      <header className="p-4 border-b border-gray-700/50 flex-shrink-0">
        <h3 className="font-bold text-center">Room Chat</h3>
      </header>
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {messages.map(msg => (
          <div key={msg.id} className="flex items-start space-x-3">
            <img src={msg.user.avatarUrl} alt={msg.user.name} className="w-8 h-8 rounded-full flex-shrink-0" />
            <div>
              <p className="font-bold text-sm text-indigo-300">{msg.user.name}</p>
              {msg.text && <p className="text-sm text-gray-200">{msg.text}</p>}
              {msg.voiceMemo && (
                <AudioNoteBubble 
                    message={msg}
                    currentUser={currentUser}
                    isPlaying={nowPlayingAudioNoteId === msg.id}
                    onPlay={() => onPlayAudioNote(msg.id)}
                    onToggleReaction={(emoji) => onToggleReaction(msg.id, emoji)}
                />
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ChatView;