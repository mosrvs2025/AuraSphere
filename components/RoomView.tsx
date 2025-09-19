// Implemented RoomView, the main interface for participating in a live audio room.
import React, { useState, useEffect, useRef } from 'react';
import { Room, User, ChatMessage, ModalPosition, Poll as PollType } from '../types';
import ChatView from './ChatView';
import { RoomActionsContext } from '../context/RoomActionsContext';
import { SparklesIcon } from './Icons';
import DynamicInput from './DynamicInput';
import AiAssistantPanel from './AiAssistantPanel';
import HostControls from './HostControls';
import FeaturedLink from './FeaturedLink';
import Poll from './Poll';
import CreatePollModal from './CreatePollModal';


interface RoomViewProps {
  room: Room;
  currentUser: User;
  onLeave: () => void;
  onUserSelect: (user: User, position: ModalPosition) => void;
  selectedUser: User | null;
  onOpenLink: (url: string) => void;
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


const RoomView: React.FC<RoomViewProps> = ({ room, currentUser, onLeave, onUserSelect, selectedUser, onOpenLink }) => {
    const [messages, setMessages] = useState<ChatMessage[]>(room.messages);
    const [isSharingScreen, setIsSharingScreen] = useState(false);
    const [nowPlayingAudioNoteId, setNowPlayingAudioNoteId] = useState<string | null>(null);
    const [currentRoom, setCurrentRoom] = useState<Room>(room);
    const [isChatCollapsed, setChatCollapsed] = useState(true);
    const [animatedReaction, setAnimatedReaction] = useState<{ messageId: string, emoji: string } | null>(null);

    const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);
    const [isCreatePollModalOpen, setCreatePollModalOpen] = useState(false);
    const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        // This keeps the local room state in sync if the parent prop changes.
        setCurrentRoom(room);
    }, [room]);

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
    
    const handleSendVideoNote = (url: string, duration: number) => {
         const newMessage: ChatMessage = {
            id: `m-${Date.now()}`,
            user: currentUser,
            createdAt: new Date(),
            videoNote: { url: url, thumbnailUrl: `https://picsum.photos/seed/${Date.now()}/200/300`, duration: Math.round(duration) }
        };
        setMessages(prev => [...prev, newMessage]);
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
    
    const handleCreatePoll = (question: string, options: string[]) => {
        const newPoll: PollType = {
            question,
            options: options.map(opt => ({ text: opt, votes: [] })),
            isActive: true,
        };
        setCurrentRoom(prev => ({...prev, poll: newPoll}));
        setCreatePollModalOpen(false);
    };

    const handleVote = (optionIndex: number) => {
        if (!currentRoom.poll) return;
        const newPoll = JSON.parse(JSON.stringify(currentRoom.poll)); // Deep copy

        // Prevent double voting by retracting previous vote
        newPoll.options.forEach((opt: any) => {
            const existingVoteIndex = opt.votes.indexOf(currentUser.id);
            if (existingVoteIndex > -1) {
                opt.votes.splice(existingVoteIndex, 1);
            }
        });
        newPoll.options[optionIndex].votes.push(currentUser.id);
        setCurrentRoom(prev => ({ ...prev, poll: newPoll }));
    };

    const handleEndPoll = () => {
        if (!currentRoom.poll) return;
        const endedPoll = { ...currentRoom.poll, isActive: false };
        setCurrentRoom(prev => ({ ...prev, poll: endedPoll }));
    };

    return (
    <RoomActionsContext.Provider value={{ isSharingScreen, onToggleScreenShare }}>
      <audio ref={audioPlayerRef} onEnded={handleAudioEnded} onPause={handleAudioEnded}></audio>
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
                 {currentRoom.featuredUrl && <FeaturedLink url={currentRoom.featuredUrl} onOpenLink={onOpenLink} />}
                 {currentRoom.poll && <Poll poll={currentRoom.poll} onVote={handleVote} isHost={isHost} onEndPoll={handleEndPoll} currentUser={currentUser} />}
                {hasMedia ? (
                    <div className="w-full h-full bg-black rounded-lg flex items-center justify-center text-gray-400 min-h-[200px]">
                        {isSharingScreen ? "Screen share is active" : (currentRoom.videoUrl && <video src={currentRoom.videoUrl} controls autoPlay className="w-full h-full rounded-lg"></video>)}
                    </div>
                ) : (
                    <ParticipantsList room={currentRoom} selectedUser={selectedUser} onAvatarClick={handleAvatarClick} />
                )}
            </div>

            {/* Side Participants List when Media is showing */}
            {hasMedia && (
                <div className="flex-shrink-0 md:w-1/3 md:max-w-xs overflow-y-auto p-4 md:p-6 md:border-l md:border-gray-800">
                     <ParticipantsList room={currentRoom} selectedUser={selectedUser} onAvatarClick={handleAvatarClick} />
                </div>
            )}
          </div>
          
          {/* Footer Controls */}
          <footer className="flex-shrink-0">
             {isHost && (
                <div className="p-4 border-t border-gray-800">
                    <HostControls videoUrl={currentRoom.videoUrl} onUpdateRoom={handleUpdateRoom} onCreatePoll={() => setCreatePollModalOpen(true)} />
                </div>
             )}
             <div className="p-4 md:p-6 border-t border-gray-800 flex items-center space-x-4">
                <DynamicInput 
                    onSubmitMessage={handleSendTextMessage}
                    onSubmitAudioNote={handleSendAudioNote}
                    onSubmitVideoNote={handleSendVideoNote}
                />
                
                <button onClick={() => setIsAiPanelOpen(!isAiPanelOpen)} className={`p-3 rounded-full transition-colors duration-300 ${isAiPanelOpen ? 'bg-indigo-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>
                    <SparklesIcon className="h-6 w-6" />
                </button>
            </div>
          </footer>
          {isAiPanelOpen && <AiAssistantPanel room={currentRoom} messages={messages} onClose={() => setIsAiPanelOpen(false)} />}
        </div>
        
        {/* Chat Panel */}
        <div className={`flex-shrink-0 md:w-1/3 md:max-w-sm lg:max-w-md xl:max-w-lg transition-all duration-300 ease-in-out ${isChatCollapsed ? 'md:w-0' : ''}`}>
          <ChatView 
            messages={messages} 
            currentUser={currentUser}
            onToggleReaction={handleToggleReaction}
            nowPlayingAudioNoteId={nowPlayingAudioNoteId}
            onPlayAudioNote={handlePlayAudioToggle}
            isCollapsed={isChatCollapsed}
            onToggleCollapse={() => setChatCollapsed(!isChatCollapsed)}
            animatedReaction={animatedReaction}
          />
        </div>
      </div>
      {isHost && isCreatePollModalOpen && <CreatePollModal onClose={() => setCreatePollModalOpen(false)} onCreate={handleCreatePoll} />}
    </RoomActionsContext.Provider>
    );
};

export default RoomView;