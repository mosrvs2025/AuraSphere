// Implemented RoomView, the main interface for participating in a live audio room.
import React, { useState, useEffect } from 'react';
import { Room, User, ChatMessage, ModalPosition } from '../types';
import ChatView from './ChatView';
import { RoomActionsContext } from '../context/RoomActionsContext';
import { generateIcebreakers } from '../services/geminiService';
import { MicIcon, SparklesIcon } from './Icons';
import DynamicInput from './DynamicInput';
import AiAssistantPanel from './AiAssistantPanel';


interface RoomViewProps {
  room: Room;
  currentUser: User;
  onLeave: () => void;
  onUserSelect: (user: User, position: ModalPosition) => void;
  selectedUser: User | null;
}

const UserAvatar: React.FC<{ user: User, size?: 'large' | 'small', onClick: (e: React.MouseEvent<HTMLButtonElement>) => void, isSelected: boolean }> = ({ user, size = 'large', onClick, isSelected }) => (
    <button onClick={onClick} className="flex flex-col items-center space-y-1 text-center focus:outline-none rounded-full transition-shadow duration-300 hover:shadow-lg hover:shadow-indigo-500/20">
        <img 
            src={user.avatarUrl} 
            alt={user.name} 
            className={`${size === 'large' ? 'w-20 h-20' : 'w-12 h-12'} rounded-full border-2 shadow-md transition-all duration-300 ${isSelected ? 'border-indigo-400 shadow-[0_0_15px_rgba(129,140,248,0.5)] animate-pulse' : 'border-gray-600'}`}
        />
        <p className={`font-semibold truncate w-24 ${size === 'large' ? 'text-sm' : 'text-xs'}`}>{user.name}</p>
    </button>
);

const ParticipantsList: React.FC<{ room: Room; selectedUser: User | null; onAvatarClick: (event: React.MouseEvent<HTMLButtonElement>, user: User) => void; }> = ({ room, selectedUser, onAvatarClick }) => (
    <div className="space-y-6">
        <div>
            <h2 className="text-lg font-bold text-gray-400 mb-4">Hosts</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                {room.hosts.map(user => <UserAvatar key={user.id} user={user} isSelected={selectedUser?.id === user.id} onClick={(e) => onAvatarClick(e, user)} />)}
            </div>
        </div>
        <div>
            <h2 className="text-lg font-bold text-gray-400 mb-4">Speakers</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                {room.speakers.map(user => <UserAvatar key={user.id} user={user} isSelected={selectedUser?.id === user.id} onClick={(e) => onAvatarClick(e, user)} />)}
            </div>
        </div>
        <div>
            <h2 className="text-lg font-bold text-gray-400 mb-4">Listeners</h2>
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 gap-4">
                {room.listeners.map(user => <UserAvatar key={user.id} user={user} size="small" isSelected={selectedUser?.id === user.id} onClick={(e) => onAvatarClick(e, user)} />)}
            </div>
        </div>
    </div>
);


const RoomView: React.FC<RoomViewProps> = ({ room, currentUser, onLeave, onUserSelect, selectedUser }) => {
    const [messages, setMessages] = useState<ChatMessage[]>(room.messages);
    const [isSharingScreen, setIsSharingScreen] = useState(false);
    const [nowPlayingAudioNoteId, setNowPlayingAudioNoteId] = useState<string | null>(null);
    const [currentRoom, setCurrentRoom] = useState<Room>(room);
    const [isChatCollapsed, setChatCollapsed] = useState(true);
    const [animatedReaction, setAnimatedReaction] = useState<{ messageId: string, emoji: string } | null>(null);

    const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);
    const [videoInput, setVideoInput] = useState('');

    useEffect(() => {
        if (animatedReaction) {
            const timer = setTimeout(() => setAnimatedReaction(null), 500); // Animation duration
            return () => clearTimeout(timer);
        }
    }, [animatedReaction]);

    const isHost = currentRoom.hosts.some(h => h.id === currentUser.id);
    const hasMedia = isSharingScreen || !!currentRoom.videoUrl;

    const handleUpdateRoom = (updatedData: Partial<Room>) => {
      setCurrentRoom(prev => ({...prev, ...updatedData}));
    };
    
    const handlePlayAudioToggle = (messageId: string) => {
        setNowPlayingAudioNoteId(prevId => prevId === messageId ? null : messageId);
    };

    const handleToggleReaction = (messageId: string, emoji: string) => {
        setMessages(prevMessages => 
            prevMessages.map(msg => {
                if (msg.id === messageId) {
                    const reactions = { ...(msg.reactions || {}) };
                    const usersForEmoji = reactions[emoji] || [];
                    const userIndex = usersForEmoji.indexOf(currentUser.id);

                    if (userIndex > -1) {
                        usersForEmoji.splice(userIndex, 1);
                        if(usersForEmoji.length === 0) delete reactions[emoji];
                    } else {
                        usersForEmoji.push(currentUser.id);
                    }
                    reactions[emoji] = usersForEmoji;
                    return { ...msg, reactions };
                }
                return msg;
            })
        );
        setAnimatedReaction({ messageId, emoji });
    };
    
    const handleSendTextMessage = (text: string) => {
        if (!text.trim()) return;
        const newMessage: ChatMessage = {
            id: `m-${Date.now()}`,
            user: currentUser,
            text: text,
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
    
    const handleSendVideoNote = () => {
         const newMessage: ChatMessage = {
            id: `m-${Date.now()}`,
            user: currentUser,
            createdAt: new Date(),
            videoNote: { url: '#', thumbnailUrl: `https://picsum.photos/seed/${Date.now()}/200/300`, duration: 30 }
        };
        setMessages(prev => [...prev, newMessage]);
    };
    
    const handleShareVideo = (e: React.FormEvent) => {
        e.preventDefault();
        if (videoInput.trim()) {
            handleUpdateRoom({ videoUrl: videoInput.trim() });
            setVideoInput('');
        }
    };

    const handleStopVideo = () => {
        handleUpdateRoom({ videoUrl: undefined });
    };

    const onToggleScreenShare = async () => {
      setIsSharingScreen(!isSharingScreen);
    };

    const handleAvatarClick = (event: React.MouseEvent<HTMLButtonElement>, user: User) => {
        const rect = event.currentTarget.getBoundingClientRect();
        onUserSelect(user, {
            top: rect.bottom,
            left: rect.left,
            width: rect.width
        });
    };

    return (
    <RoomActionsContext.Provider value={{ isSharingScreen, onToggleScreenShare }}>
      <div className="h-full flex flex-col md:flex-row animate-fade-in overflow-hidden">
        {/* Main Panel (Left side on desktop, full screen on mobile) */}
        <div className="flex-1 flex flex-col bg-gray-900 overflow-hidden relative">
          <header className="p-4 md:p-6 flex-shrink-0 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">{currentRoom.title}</h1>
              <p className="text-sm text-gray-400">{currentRoom.hosts.map(h => h.name).join(', ')}</p>
            </div>
            <button onClick={onLeave} className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-full text-sm transition">
              Leave
            </button>
          </header>
          
          {/* Main Content Area */}
          <div className={`flex-1 flex ${hasMedia ? 'flex-col md:flex-row' : 'flex-col'} overflow-hidden`}>
            
            {/* Primary View (Media Player OR Full Participants List) */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
                {hasMedia ? (
                    <div className="w-full h-full bg-black rounded-lg flex items-center justify-center text-gray-400 min-h-[200px]">
                        {isSharingScreen ? "Screen share is active" :