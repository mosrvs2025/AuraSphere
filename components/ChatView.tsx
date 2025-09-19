// Implemented the ChatView component for real-time messaging in rooms.
import React, { useRef, useEffect } from 'react';
import { ChatMessage } from '../types';

interface ChatViewProps {
  messages: ChatMessage[];
}

const ChatView: React.FC<ChatViewProps> = ({ messages }) => {
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
              <p className="text-sm text-gray-200">{msg.text}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ChatView;