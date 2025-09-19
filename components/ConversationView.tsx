import React, { useState, useEffect, useRef } from 'react';
import { Conversation, User, ChatMessage } from '../types';

interface ConversationViewProps {
  conversation: Conversation;
  currentUser: User;
  onBack: () => void;
}

const ConversationView: React.FC<ConversationViewProps> = ({ conversation, currentUser, onBack }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(conversation.messages);
  const [text, setText] = useState('');
  const otherParticipant = conversation.participants.find(p => p.id !== currentUser.id);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      user: currentUser,
      text: text.trim(),
      createdAt: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
    setText('');
    // In a real app, this would be sent to a backend service.
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
      <header className="flex items-center p-4 border-b border-gray-800 sticky top-0 bg-gray-900/80 backdrop-blur-sm z-10">
        <button onClick={onBack} className="text-indigo-400 hover:text-indigo-300 font-semibold text-sm">&larr; Back</button>
        <div className="flex items-center mx-auto">
            <img src={otherParticipant.avatarUrl} alt={otherParticipant.name} className="w-8 h-8 rounded-full mr-3" />
            <h1 className="text-lg font-bold text-center truncate">{otherParticipant.name}</h1>
        </div>
        <div className="w-16"></div>
      </header>

      <div className="flex-grow p-4 space-y-4 overflow-y-auto">
        {messages.map(msg => {
          const isCurrentUser = msg.user.id === currentUser.id;
          const alignment = isCurrentUser ? 'items-end' : 'items-start';
          const bubbleColor = isCurrentUser ? 'bg-indigo-600' : 'bg-gray-700';
          return (
            <div key={msg.id} className={`flex flex-col ${alignment} space-y-1`}>
              <div className={`max-w-xs md:max-w-md p-3 rounded-lg ${bubbleColor}`}>
                <p className="text-sm text-white break-words">{msg.text}</p>
              </div>
              <p className="text-xs text-gray-500 px-1">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      <footer className="p-4 bg-gray-900/70 backdrop-blur-sm">
        <form onSubmit={handleSendMessage} className="flex items-center bg-gray-800 rounded-full">
          <input
            type="text"
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Send a message..."
            className="bg-transparent w-full pl-4 p-3 text-sm focus:outline-none"
          />
          <button type="submit" className="p-3 text-indigo-400 hover:text-indigo-300" aria-label="Send message">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </form>
      </footer>
    </div>
  );
};

export default ConversationView;
