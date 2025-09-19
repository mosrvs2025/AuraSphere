import React from 'react';
import { Conversation, User, ChatMessage } from '../types';

interface MessagesViewProps {
  conversations: Conversation[];
  currentUser: User;
  onConversationSelect: (conversation: Conversation) => void;
}

const MessagesView: React.FC<MessagesViewProps> = ({ conversations, currentUser, onConversationSelect }) => {

  const formatTimeAgo = (date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "m";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m";
    return Math.floor(seconds) + "s";
  };

  const getLastMessage = (convo: Conversation): ChatMessage | undefined => {
      return convo.messages[convo.messages.length - 1];
  }

  return (
    <div className="p-4 md:p-6 animate-fade-in">
      <div className="max-w-2xl mx-auto space-y-2">
        {conversations.map(convo => {
          const otherParticipant = convo.participants.find(p => p.id !== currentUser.id);
          const lastMessage = getLastMessage(convo);
          if (!otherParticipant || !lastMessage) return null;

          const lastMessageText = lastMessage.voiceMemo 
            ? '🎤 Voice Memo' 
            : lastMessage.videoNote
            ? '📹 Video Note'
            : (lastMessage.text || '');

          return (
            <button
              key={convo.id}
              onClick={() => onConversationSelect(convo)}
              className="w-full flex items-center p-4 rounded-lg bg-gray-800/50 hover:bg-gray-700/70 transition-colors cursor-pointer text-left"
            >
              <img src={otherParticipant.avatarUrl} alt={otherParticipant.name} className="w-12 h-12 rounded-full mr-4" />
              <div className="flex-1 overflow-hidden">
                <div className="flex justify-between items-baseline">
                  <p className="font-bold text-white truncate">{otherParticipant.name}</p>
                  <p className="text-xs text-gray-400 flex-shrink-0">{formatTimeAgo(lastMessage.createdAt)}</p>
                </div>
                <p className="text-sm text-gray-300 truncate">{lastMessageText}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MessagesView;