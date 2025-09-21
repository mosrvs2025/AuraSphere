
import React, { useMemo } from 'react';
// FIX: Corrected import path for types.
import { Conversation, User, ChatMessage, Room } from '../types.ts';
// FIX: Corrected import path for Icons.
import { MessagesIcon, StudioIcon } from './Icons.tsx';

interface MessagesViewProps {
  conversations: Conversation[];
  currentUser: User;
  onConversationSelect: (conversation: Conversation) => void;
  liveRooms: Room[];
  onEnterRoom: (room: Room) => void;
  onCreateRoom: () => void;
}

const LiveRail: React.FC<{ liveRooms: Room[]; currentUser: User; onEnterRoom: (room: Room) => void; }> = ({ liveRooms, currentUser, onEnterRoom }) => {
    const followingIds = useMemo(() => new Set(currentUser.following.map(f => f.id)), [currentUser.following]);
    
    const liveFriends = useMemo(() => {
        const friendsInRooms = new Map<string, { user: User, room: Room }>();
        liveRooms.forEach(room => {
            room.hosts.forEach(host => {
                if (followingIds.has(host.id) && !friendsInRooms.has(host.id)) {
                    friendsInRooms.set(host.id, { user: host, room });
                }
            });
        });
        return Array.from(friendsInRooms.values());
    }, [liveRooms, followingIds]);

    if (liveFriends.length === 0) {
        return null;
    }

    return (
        <div className="mb-6">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 px-4 md:px-0">Friends Live Now</h2>
            <div className="flex items-center space-x-4 overflow-x-auto pb-3 -mx-4 px-4 scrollbar-hide">
                {liveFriends.map(({ user, room }) => (
                    <button key={user.id} onClick={() => onEnterRoom(room)} className="flex flex-col items-center space-y-2 flex-shrink-0 w-20 text-center focus:outline-none group">
                        <div className="relative">
                            <img 
                                src={user.avatarUrl} 
                                alt={user.name} 
                                className="w-16 h-16 rounded-full border-2 border-gray-700 group-hover:border-indigo-500 transition-colors" 
                            />
                             <div className="absolute inset-0 rounded-full animate-pulse-live pointer-events-none"></div>
                        </div>
                        <p className="text-xs text-white font-semibold truncate w-full">{user.name}</p>
                    </button>
                ))}
            </div>
        </div>
    );
};

const ActionBar: React.FC<{ onCreateRoom: () => void }> = ({ onCreateRoom }) => {
    return (
        <div className="grid grid-cols-2 gap-4 mb-8 px-4 md:px-0">
            <button onClick={onCreateRoom} className="flex items-center justify-center space-x-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-lg transition-colors">
                <StudioIcon className="h-6 w-6" />
                <span>Start a Room</span>
            </button>
             <button className="flex items-center justify-center space-x-3 bg-gray-700 hover:bg-gray-600 text-white font-bold py-4 rounded-lg transition-colors">
                <MessagesIcon className="h-6 w-6" />
                <span>New Message</span>
            </button>
        </div>
    );
};

const MessagesView: React.FC<MessagesViewProps> = ({ conversations, currentUser, onConversationSelect, liveRooms, onEnterRoom, onCreateRoom }) => {

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
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center md:text-left">Messages</h1>
        
        <LiveRail liveRooms={liveRooms} currentUser={currentUser} onEnterRoom={onEnterRoom} />
        
        <ActionBar onCreateRoom={onCreateRoom} />

        <div className="space-y-2 px-4 md:px-0">
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
                className="w-full flex items-center p-3 rounded-lg bg-gray-800/50 hover:bg-gray-700/70 transition-colors cursor-pointer text-left"
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
    </div>
  );
};

export default MessagesView;