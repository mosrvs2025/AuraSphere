// Implemented the ChatView component for real-time messaging in rooms.
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';

interface ChatViewProps {
  messages: ChatMessage[];
  onSendMessage: (message: { text: string }) => void;
}

const ChatView: React.FC<ChatViewProps> = ({ messages, onSendMessage }) => {
  const [text, setText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSendMessage({ text: text.trim() });
      setText('');
    }
  };

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
      <div className="p-4 flex-shrink-0 bg-gray-800/50">
        <form onSubmit={handleSubmit} className="flex items-center bg-gray-900 rounded-full">
            <input
            type="text"
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Send a message..."
            className="bg-transparent w-full pl-4 p-3 text-sm focus:outline-none"
            />
            <button type="submit" className="p-3 text-indigo-400 hover:text-indigo-300" aria-label="Send message">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
            </button>
        </form>
      </div>
    </div>
  );
};

export default ChatView;
