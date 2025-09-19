import React, { useState, useContext } from 'react';
import { Room, User, ChatMessage, Poll as PollType } from '../types';
import ChatView from './ChatView';
import HostControls from './HostControls';
import ListenerControls from './ListenerControls';
import UserCardModal from './UserCardModal';
import ConfirmationModal from './ConfirmationModal';
import Poll from './Poll';
import { UserContext } from '../context/UserContext';
import FeaturedLink from './FeaturedLink';
import AiAssistantPanel from './AiAssistantPanel';
import { SparklesIcon } from './Icons';
import InviteUsersModal from './InviteUsersModal';
import CreatePollModal from './CreatePollModal';

interface RoomViewProps {
  room: Room;
  onLeave: () => void;
  onUpdateRoom: (updatedData: Partial<Room>) => void;
  onSendMessage: (message: Omit<ChatMessage, 'id' | 'createdAt' | 'user'>) => void;
  onToggleReaction: (messageId: string, emoji: string) => void;
  onViewProfile: (user: User) => void;
}

const ParticipantGrid: React.FC<{ users: User[], onUserClick: (user: User, ref: HTMLButtonElement) => void, title: string, gridClass?: string }> = ({ users, onUserClick, title, gridClass = 'grid-cols-4' }) => (
  <div>
    <h3 className="text-gray-400 font-bold text-sm mb-2">{title} ({users.length})</h3>
    <div className={`grid ${gridClass} gap-4`}>
      {users.map(user => (
        <button key={user.id} onClick={(e) => onUserClick(user, e.currentTarget)} className="flex flex-col items-center text-center space-y-1 group">
          <img src={user.avatarUrl} alt={user.name} className="w-16 h-16 rounded-2xl group-hover:opacity-80 transition-opacity" />
          <p className="text-xs font-semibold text-white truncate w-16">{user.name}</p>
        </button>
      ))}
    </div>
  </div>
);

const RoomView: React.FC<RoomViewProps> = ({ room, onLeave, onUpdateRoom, onSendMessage, onToggleReaction, onViewProfile }) => {
  const { currentUser } = useContext(UserContext);
  const [showConfirmLeave, setShowConfirmLeave] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{ user: User, position: { top: number, left: number, width: number, height: number } } | null>(null);
  const [nowPlayingAudioNoteId, setNowPlayingAudioNoteId] = useState<string | null>(null);
  const [animatedReaction, setAnimatedReaction] = useState<{ messageId: string, emoji: string } | null>(null);
  const [isChatCollapsed, setIsChatCollapsed] = useState(false);
  const [isAiPanelOpen, setAiPanelOpen] = useState(false);
  const [isInviteModalOpen, setInviteModalOpen] = useState(false);
  const [isCreatePollModalOpen, setCreatePollModalOpen] = useState(false);

  const isHost = room.hosts.some(h => h.id === currentUser.id);

  const handleUserClick = (user: User, ref: HTMLButtonElement) => {
    const rect = ref.getBoundingClientRect();
    setSelectedUser({ user, position: { top: rect.bottom, left: rect.left, width: rect.width, height: rect.height } });
  };

  const handleVote = (optionIndex: number) => {
    if (!room.poll || !currentUser) return;
    const newPoll = { ...room.poll };
    // Retract previous vote if any
    newPoll.options.forEach(opt => {
        const voteIndex = opt.votes.indexOf(currentUser.id);
        if (voteIndex > -1) {
            opt.votes.splice(voteIndex, 1);
        }
    });
    // Add new vote
    newPoll.options[optionIndex].votes.push(currentUser.id);
    onUpdateRoom({ poll: newPoll });
  };

  const handleEndPoll = () => {
    if (room.poll) {
        onUpdateRoom({ poll: { ...room.poll, isActive: false } });
    }
  };

  const handleCreatePoll = (question: string, options: string[]) => {
    const newPoll: PollType = {
        id: `poll-${Date.now()}`,
        question,
        options: options.map(opt => ({ text: opt, votes: [] })),
        isActive: true,
    };
    onUpdateRoom({ poll: newPoll });
    setCreatePollModalOpen(false);
  };
  
  const handleToggleReactionWithAnimation = (messageId: string, emoji: string) => {
      onToggleReaction(messageId, emoji);
      setAnimatedReaction({ messageId, emoji });
      setTimeout(() => setAnimatedReaction(null), 1000);
  }

  return (
    <div className="h-full bg-gray-900 text-white flex flex-col md:flex-row animate-fade-in">
      <div className="flex-1 flex flex-col p-4 md:p-6 overflow-y-auto">
        <header className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold">{room.title}</h1>
            <p className="text-gray-400 text-sm">{room.description}</p>
          </div>
          <button onClick={() => setShowConfirmLeave(true)} className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-full text-sm">
            Leave
          </button>
        </header>

        {room.featuredUrl && <FeaturedLink url={room.featuredUrl} onOpenLink={(url) => console.log('Open link:', url)} />}
        
        {room.poll && <Poll poll={room.poll} onVote={handleVote} isHost={isHost} onEndPoll={handleEndPoll} currentUser={currentUser} />}

        <div className="space-y-6">
          <ParticipantGrid users={room.hosts} onUserClick={handleUserClick} title="Hosts" />
          <ParticipantGrid users={room.speakers} onUserClick={handleUserClick} title="Speakers" />
          <ParticipantGrid users={room.listeners} onUserClick={handleUserClick} title="Listeners" gridClass="grid-cols-5" />
        </div>
      </div>

      <div className={`relative md:w-80 lg:w-96 flex-shrink-0 border-t md:border-t-0 md:border-l border-gray-700/50 flex flex-col ${isChatCollapsed ? 'h-16' : 'h-1/2 md:h-full'}`}>
        <ChatView
            messages={room.messages}
            currentUser={currentUser}
            onToggleReaction={handleToggleReactionWithAnimation}
            nowPlayingAudioNoteId={nowPlayingAudioNoteId}
            onPlayAudioNote={setNowPlayingAudioNoteId}
            isCollapsed={isChatCollapsed}
            onToggleCollapse={() => setIsChatCollapsed(!isChatCollapsed)}
            animatedReaction={animatedReaction}
        />
        {!isChatCollapsed && (
            <footer className="p-4 bg-gray-800/80 border-t border-gray-700/50">
              {isHost ? (
                <HostControls 
                    room={room} 
                    onUpdateRoom={onUpdateRoom}
                    onCreatePoll={() => setCreatePollModalOpen(true)}
                    onInviteClick={() => setInviteModalOpen(true)}
                />
              ) : (
                <ListenerControls />
              )}
            </footer>
        )}
      </div>

      {isHost && (
        <button onClick={() => setAiPanelOpen(!isAiPanelOpen)} className="absolute bottom-4 right-4 md:bottom-24 md:right-[21rem] lg:right-[25rem] z-30 bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-full shadow-lg transform transition-transform hover:scale-110">
            <SparklesIcon />
        </button>
      )}

      {isAiPanelOpen && <AiAssistantPanel room={room} messages={room.messages} onClose={() => setAiPanelOpen(false)} />}
      
      {showConfirmLeave && (
        <ConfirmationModal
          title="Leave Room"
          message="Are you sure you want to leave this room?"
          confirmText="Leave"
          onConfirm={onLeave}
          onCancel={() => setShowConfirmLeave(false)}
        />
      )}
      
      {selectedUser && (
        <UserCardModal
          user={selectedUser.user}
          position={selectedUser.position}
          onClose={() => setSelectedUser(null)}
          onViewProfile={(user) => {
            setSelectedUser(null);
            onViewProfile(user);
          }}
        />
      )}

      {isInviteModalOpen && (
          <InviteUsersModal 
            followers={currentUser.followers}
            onClose={() => setInviteModalOpen(false)}
            onInvite={(userIds) => onUpdateRoom({ invitedUserIds: [...(room.invitedUserIds || []), ...userIds]})}
            alreadyInvitedUserIds={room.invitedUserIds || []}
          />
      )}

      {isCreatePollModalOpen && (
          <CreatePollModal 
            onClose={() => setCreatePollModalOpen(false)}
            onCreate={handleCreatePoll}
          />
      )}
    </div>
  );
};

export default RoomView;
