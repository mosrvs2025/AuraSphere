import React, { useEffect, useRef } from 'react';
import { ChatMessage, User } from '../types';

interface ChatMessageItemProps {
  message: ChatMessage;
  isCurrentUser: boolean;
  isHost: boolean;
  onPlay: () => void;
  onRemove: () => void;
  isPlaying: boolean;
}

const ChatMessageItem: React.FC<ChatMessageItemProps> = ({ message, isCurrentUser, isHost, onPlay, onRemove, isPlaying }) => {
  const alignment = isCurrentUser ? 'items-end' : 'items-start';
  const bubbleColor = isCurrentUser ? 'bg-indigo-600' : 'bg-gray-700';
  const nameOrder = isCurrentUser ? 'flex-row-reverse' : 'flex-row';
  const bubbleClasses = `max-w-xs md:max-w-md p-3 rounded-lg ${bubbleColor} transition-all duration-300 ${isPlaying ? 'ring-2 ring-offset-2 ring-offset-gray-900 ring-green-400 animate-pulse' : ''}`;


  return (
    <div className={`flex flex-col ${alignment} space-y-1`}>
      <div className={`flex items-center space-x-2 ${nameOrder}`}>
        <img src={message.user.avatarUrl} alt={message.user.name} className="h-6 w-6 rounded-full" />
        <span className="text-xs text-gray-400 font-semibold">{message.user.name}</span>
      </div>
      <div className={bubbleClasses}>
        {message.text && <p className="text-sm text-white break-words">{message.text}</p>}
        {message.voiceMemo && (
          <div className="flex items-center space-x-2">
            <button 
              onClick={onPlay} 
              disabled={!isHost}
              className="p-2 bg-indigo-500/50 rounded-full hover:bg-indigo-400/50 disabled:bg-gray-600/50 disabled:cursor-not-allowed transition focus:outline-none focus:ring-2 focus:ring-indigo-400"
              aria-label="Play voice memo"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            </button>
            <div className="text-sm flex-grow">
                <p className="font-bold">Voice Memo</p>
                <p className="text-xs text-gray-300">{message.voiceMemo.duration} seconds</p>
            </div>
             {isHost && (
              <button 
                onClick={onRemove} 
                className="p-2 text-gray-500 rounded-full hover:bg-red-500/20 hover:text-red-400 transition" 
                aria-label="Remove voice memo"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

interface ChatViewProps {
  messages: ChatMessage[];
  currentUser: User;
  isHost: boolean;
  onPlayVoiceMemo: (message: ChatMessage) => void;
  onRemoveMessage: (messageId: string) => void;
  nowPlayingMessageId: string | null;
}

const ChatView: React.FC<ChatViewProps> = ({ messages, currentUser, isHost, onPlayVoiceMemo, onRemoveMessage, nowPlayingMessageId }) => {
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <section aria-labelledby="live-chat-heading">
      <h3 id="live-chat-heading" className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Live Chat</h3>
      <div className="h-64 bg-gray-900/50 rounded-lg p-4 flex flex-col space-y-4 overflow-y-auto">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
             <p className="text-gray-500">Chat is quiet... for now.</p>
          </div>
        )}
        {messages.map(msg => (
          <ChatMessageItem 
            key={msg.id} 
            message={msg}
            isCurrentUser={msg.user.id === currentUser.id}
            isHost={isHost}
            onPlay={() => onPlayVoiceMemo(msg)}
            onRemove={() => onRemoveMessage(msg.id)}
            isPlaying={msg.id === nowPlayingMessageId}
          />
        ))}
        <div ref={chatEndRef} />
      </div>
    </section>
  );
};

export default ChatView;