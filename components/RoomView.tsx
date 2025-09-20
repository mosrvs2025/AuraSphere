import React, { useState, useContext, useEffect, useRef } from 'react';
import { Room, User, ChatMessage, Poll as PollType, RequestToSpeak } from '../types';
import ChatView from './ChatView';
import HostControls from './HostControls';
import UserCardModal from './UserCardModal';
import ConfirmationModal from './ConfirmationModal';
import Poll from './Poll';
import { UserContext } from '../context/UserContext';
import FeaturedLink from './FeaturedLink';
import AiAssistantPanel from './AiAssistantPanel';
import { SparklesIcon, MicIcon, UserPlusIcon, HeartIcon, ChevronDownIcon } from './Icons';
import InviteUsersModal from './InviteUsersModal';
import CreatePollModal from './CreatePollModal';
import DynamicInput from './DynamicInput';
import RequestToSpeakModal from './RequestToSpeakModal';
import RequestQueueView from './RequestQueueView';
import RoomActivityModal from './RoomActivityModal';
import BroadcastMediaView from './BroadcastMediaView';

interface RoomViewProps {
  room: Room;
  onLeave: () => void;
  onUpdateRoom: (updatedData: Partial<Room>) => void;
  onViewProfile: (user: User) => void;
  onMinimize: () => void;
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

const RoomView: React.FC<RoomViewProps> = ({ room, onLeave, onUpdateRoom, onViewProfile, onMinimize }) => {
  const { currentUser } = useContext(UserContext);
  const [showConfirmLeave, setShowConfirmLeave] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{ user: User, position: { top: number, left: number, width: number, height: number } } | null>(null);
  const [nowPlayingAudioNoteId, setNowPlayingAudioNoteId] = useState<string | null>(null);
  const [animatedReaction, setAnimatedReaction] = useState<{ messageId: string, emoji: string } | null>(null);
  const [isChatCollapsed, setIsChatCollapsed] = useState(true);
  const [isAiPanelOpen, setAiPanelOpen] = useState(false);
  const [isInviteModalOpen, setInviteModalOpen] = useState(false);
  const [isCreatePollModalOpen, setCreatePollModalOpen] = useState(false);
  const [isRequestModalOpen, setRequestModalOpen] = useState(false);
  const [sidePanelView, setSidePanelView] = useState<'chat' | 'requests'>('chat');
  const [isMuted, setIsMuted] = useState(true);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [reactions, setReactions] = useState<{id: number, emoji: string, x: number}[]>([]);
  const reactionCounter = useRef(0);
  
  const localStreamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isHost = room.hosts.some(h => h.id === currentUser.id);

  useEffect(() => {
    const startHostStream = async () => {
        if (isHost) {
            try {
                const constraints = { audio: true, video: room.isVideoEnabled ? { facingMode: "user" } : false };
                const stream = await navigator.mediaDevices.getUserMedia(constraints);
                localStreamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error("Failed to get media stream:", err);
            }
        }
    };

    startHostStream();

    return () => {
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
            localStreamRef.current = null;
        }
    };
  }, [isHost, room.isVideoEnabled]);


  const handleUserClick = (user: User, ref: HTMLButtonElement) => {
    const rect = ref.getBoundingClientRect();
    setSelectedUser({ user, position: { top: rect.bottom, left: rect.left, width: rect.width, height: rect.height } });
  };
  
  const handleSendMessage = (message: Omit<ChatMessage, 'id' | 'createdAt'>) => {
      const newMessage: ChatMessage = {
          id: `msg-${Date.now()}`,
          createdAt: new Date(),
          ...message
      };
      onUpdateRoom({ messages: [...room.messages, newMessage] });
  };

  const handleSendTextMessage = (text: string) => {
      handleSendMessage({ user: currentUser, text });
  };

  const handleSendAudioNote = (url: string, duration: number) => {
      handleSendMessage({ user: currentUser, voiceMemo: { url, duration } });
  };

  const handleSendVideoNote = (url: string, duration: number) => {
      handleSendMessage({ user: currentUser, videoNote: { url, thumbnailUrl: `https://picsum.photos/seed/${Date.now()}/200/300`, duration } });
  };
  
  const handleToggleReaction = (messageId: string, emoji: string) => {
    const newMessages = room.messages.map(msg => {
      if (msg.id === messageId) {
        const reactions = { ...(msg.reactions || {}) };
        const usersForEmoji = reactions[emoji] || [];
        if (usersForEmoji.includes(currentUser.id)) {
          reactions[emoji] = usersForEmoji.filter(id => id !== currentUser.id);
        } else {
          reactions[emoji] = [...usersForEmoji, currentUser.id];
        }
        return { ...msg, reactions };
      }
      return msg;
    });
    onUpdateRoom({ messages: newMessages });
  };


  const handleVote = (optionIndex: number) => {
    if (!room.poll || !currentUser) return;
    const newPoll = { ...room.poll };
    newPoll.options.forEach(opt => {
        const voteIndex = opt.votes.indexOf(currentUser.id);
        if (voteIndex > -1) {
            opt.votes.splice(voteIndex, 1);
        }
    });
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
      handleToggleReaction(messageId, emoji);
      setAnimatedReaction({ messageId, emoji });
      setTimeout(() => setAnimatedReaction(null), 1000);
  }

  const handleSendLiveReaction = () => {
    const newReaction = {
        id: reactionCounter.current++,
        emoji: '❤️',
        x: Math.random() * 50 + 25 // Random horizontal position 25% to 75%
    };
    setReactions(prev => [...prev, newReaction]);
    setTimeout(() => {
        setReactions(currentReactions => currentReactions.filter(r => r.id !== newReaction.id));
    }, 3000); // Remove after 3s (animation duration)
  };

  const handleSubmitRequest = (requestData: { text?: string; voiceMemo?: { url: string; duration: number }; videoNote?: { url: string; thumbnailUrl: string; duration: number } }) => {
    const newRequest: RequestToSpeak = {
        id: `req-${Date.now()}`,
        user: currentUser,
        createdAt: new Date(),
        likes: [],
        ...requestData,
    };
    onUpdateRoom({ requestsToSpeak: [...(room.requestsToSpeak || []), newRequest] });
    setRequestModalOpen(false);
  };

  const handleLikeRequest = (requestId: string) => {
      const newRequests = (room.requestsToSpeak || []).map(req => {
          if (req.id === requestId) {
              const likedByUser = req.likes.includes(currentUser.id);
              const newLikes = likedByUser 
                  ? req.likes.filter(id => id !== currentUser.id)
                  : [...req.likes, currentUser.id];
              return { ...req, likes: newLikes };
          }
          return req;
      });
      onUpdateRoom({ requestsToSpeak: newRequests });
  };

  const handleApproveRequest = (request: RequestToSpeak) => {
    const newListeners = room.listeners.filter(u => u.id !== request.user.id);
    const newSpeakers = [...room.speakers, request.user];
    const newRequests = (room.requestsToSpeak || []).filter(r => r.id !== request.id);

    onUpdateRoom({
        listeners: newListeners,
        speakers: newSpeakers,
        requestsToSpeak: newRequests
    });
  };

  const handleBroadcastRequest = (request: RequestToSpeak) => {
    let mediaToBroadcast: Room['broadcastingMedia'] = null;
    if (request.videoNote) {
        mediaToBroadcast = { type: 'video', url: request.videoNote.url, user: request.user };
    } else if (request.voiceMemo) {
        mediaToBroadcast = { type: 'voice', url: request.voiceMemo.url, user: request.user };
    }
    
    if (mediaToBroadcast) {
        onUpdateRoom({
            broadcastingMedia: mediaToBroadcast,
            // Remove request from queue after broadcasting
            requestsToSpeak: (room.requestsToSpeak || []).filter(r => r.id !== request.id),
        });
    }
  };


  const renderAudioLayout = () => (
    <div className="h-full bg-gray-900 text-white flex flex-col animate-fade-in">
      {/* TOP PART: The scrolling area */}
      <div className="flex-1 flex flex-col p-4 md:p-6 overflow-y-auto min-h-0">
        <header className="flex justify-between items-center mb-4">
            <button onClick={onMinimize} className="p-2 -ml-2 text-gray-400 hover:text-white" aria-label="Minimize Room">
                <ChevronDownIcon />
            </button>
            <div className="flex-1" /> {/* Spacer */}
            <button onClick={() => setShowConfirmLeave(true)} className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-full text-sm flex-shrink-0">
                Leave
            </button>
        </header>
        <div className="text-center mb-4">
            <h1 className="text-2xl font-bold">{room.title}</h1>
            {room.description && <p className="text-gray-400 text-sm mt-1">{room.description}</p>}
        </div>

        {room.featuredUrl && <FeaturedLink url={room.featuredUrl} onOpenLink={(url) => console.log('Open link:', url)} />}
        {room.poll && <Poll poll={room.poll} onVote={handleVote} isHost={isHost} onEndPoll={handleEndPoll} currentUser={currentUser} />}

        <div className="space-y-6">
          <ParticipantGrid users={room.hosts} onUserClick={handleUserClick} title="Hosts" />
          <ParticipantGrid users={room.speakers} onUserClick={handleUserClick} title="Speakers" />
          <ParticipantGrid users={room.listeners} onUserClick={handleUserClick} title="Listeners" gridClass="grid-cols-5" />
        </div>
      </div>

      {/* BOTTOM PART: The chat/controls panel */}
      <div className="flex-shrink-0 border-t border-gray-700/50 flex flex-col bg-gray-900">
        <div className="flex border-b border-gray-700/50 flex-shrink-0">
            <button
                onClick={() => setSidePanelView('chat')}
                className={`flex-1 py-2 text-sm font-bold transition-colors ${sidePanelView === 'chat' ? 'text-white bg-gray-700/50' : 'text-gray-400 hover:bg-gray-800'}`}
            >
                Chat
            </button>
            <button
                onClick={() => setSidePanelView('requests')}
                className={`flex-1 py-2 text-sm font-bold transition-colors relative ${sidePanelView === 'requests' ? 'text-white bg-gray-700/50' : 'text-gray-400 hover:bg-gray-800'}`}
            >
                Requests
                {(room.requestsToSpeak?.length || 0) > 0 && (
                    <span className="absolute top-1/2 -translate-y-1/2 right-3 ml-2 bg-indigo-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                        {room.requestsToSpeak.length}
                    </span>
                )}
            </button>
        </div>

        {sidePanelView === 'chat' ? (
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
        ) : (
             <div className="max-h-[300px] overflow-y-auto">
                <RequestQueueView
                    requests={room.requestsToSpeak || []}
                    onLikeRequest={handleLikeRequest}
                    onApproveRequest={handleApproveRequest}
                    onBroadcastRequest={handleBroadcastRequest}
                    isHost={isHost}
                    currentUser={currentUser}
                />
            </div>
        )}
        
        {sidePanelView === 'chat' && (
          <footer className="p-4 bg-gray-800/80 border-t border-gray-700/50">
            {isHost ? (
              <div className="space-y-4">
                <HostControls 
                  room={room} 
                  onUpdateRoom={onUpdateRoom}
                  onCreatePoll={() => setCreatePollModalOpen(true)}
                  onInviteClick={() => setInviteModalOpen(true)}
                  onViewActivity={() => setIsActivityModalOpen(true)}
                />
                <DynamicInput
                  onSubmitMessage={handleSendTextMessage}
                  onSubmitAudioNote={handleSendAudioNote}
                  onSubmitVideoNote={handleSendVideoNote}
                />
              </div>
            ) : (
               <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <DynamicInput
                        onSubmitMessage={handleSendTextMessage}
                        onSubmitAudioNote={handleSendAudioNote}
                        onSubmitVideoNote={handleSendVideoNote}
                    />
                  </div>
                  <button onClick={handleSendLiveReaction} className="p-2 text-gray-400 hover:text-red-400 transition-colors"><HeartIcon className="w-7 h-7" /></button>
                   <button onClick={() => setRequestModalOpen(true)} className="bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded-full text-sm transition flex items-center space-x-2">
                        <UserPlusIcon className="h-5 w-5" />
                        <span>Request</span>
                    </button>
                </div>
            )}
          </footer>
        )}
      </div>
    </div>
  );

  const renderVideoLayout = () => (
    <div className="h-full bg-black text-white flex flex-col animate-fade-in relative">
        <video ref={videoRef} autoPlay muted playsInline className="absolute inset-0 w-full h-full object-cover z-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-0"></div>

        <div className="relative z-10 flex flex-col h-full p-4">
            <header className="flex justify-between items-center">
                <button onClick={onMinimize} className="p-2 bg-black/30 rounded-full text-white hover:bg-black/50" aria-label="Minimize Room">
                    <ChevronDownIcon />
                </button>
                <div className="text-center">
                    <h1 className="text-xl font-bold drop-shadow-lg">{room.title}</h1>
                    {room.description && <p className="text-gray-300 text-xs drop-shadow-md">{room.description}</p>}
                </div>
                <button onClick={() => setShowConfirmLeave(true)} className="bg-red-600/80 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-full text-sm">
                    Leave
                </button>
            </header>
            
            <div className="flex-1">
                {/* Participant avatars can be overlayed here */}
            </div>

            <footer className="space-y-4">
                 {isHost && (
                    <HostControls 
                      room={room} 
                      onUpdateRoom={onUpdateRoom}
                      onCreatePoll={() => setCreatePollModalOpen(true)}
                      onInviteClick={() => setInviteModalOpen(true)}
                      onViewActivity={() => setIsActivityModalOpen(true)}
                    />
                 )}
                <div className="flex items-center space-x-4">
                   <div className="flex-1">
                     <DynamicInput
                         onSubmitMessage={handleSendTextMessage}
                         onSubmitAudioNote={handleSendAudioNote}
                         onSubmitVideoNote={handleSendVideoNote}
                     />
                   </div>
                   <button onClick={handleSendLiveReaction} className="p-3 bg-white/10 backdrop-blur-sm rounded-full text-white hover:text-red-400 transition-colors"><HeartIcon className="w-7 h-7" /></button>
                   {!isHost && (
                     <button onClick={() => setRequestModalOpen(true)} className="bg-yellow-600/80 hover:bg-yellow-500 text-white font-bold py-3 px-4 rounded-full text-sm transition flex items-center space-x-2">
                          <UserPlusIcon className="h-5 w-5" />
                      </button>
                   )}
                </div>
            </footer>
        </div>
    </div>
  );

  return (
    <>
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-20">
            {reactions.map(r => (
                <span key={r.id} className="animate-float-up" style={{ left: `${r.x}%` }}>
                    {r.emoji}
                </span>
            ))}
        </div>
        
        {room.isVideoEnabled ? renderVideoLayout() : renderAudioLayout()}

        {room.broadcastingMedia && (
            <BroadcastMediaView
                media={room.broadcastingMedia}
                isHost={isHost}
                onStop={() => onUpdateRoom({ broadcastingMedia: null })}
            />
        )}

        {isHost && (
          <button onClick={() => setAiPanelOpen(!isAiPanelOpen)} className="absolute bottom-4 right-4 z-30 bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-full shadow-lg transform transition-transform hover:scale-110">
              <SparklesIcon />
          </button>
        )}

        {isAiPanelOpen && <AiAssistantPanel room={room} messages={room.messages} onClose={() => setAiPanelOpen(false)} />}
        {showConfirmLeave && <ConfirmationModal title="Leave Room" message="Are you sure you want to leave this room?" confirmText="Leave" onConfirm={onLeave} onCancel={() => setShowConfirmLeave(false)} />}
        {selectedUser && <UserCardModal user={selectedUser.user} position={selectedUser.position} onClose={() => setSelectedUser(null)} onViewProfile={(user) => { setSelectedUser(null); onViewProfile(user); }} />}
        {isInviteModalOpen && <InviteUsersModal followers={currentUser.followers} onClose={() => setInviteModalOpen(false)} onInvite={(userIds) => onUpdateRoom({ invitedUserIds: [...(room.invitedUserIds || []), ...userIds]})} alreadyInvitedUserIds={room.invitedUserIds || []} />}
        {isCreatePollModalOpen && <CreatePollModal onClose={() => setCreatePollModalOpen(false)} onCreate={handleCreatePoll} />}
        {isRequestModalOpen && <RequestToSpeakModal onClose={() => setRequestModalOpen(false)} onSubmit={handleSubmitRequest} />}
        {isActivityModalOpen && isHost && <RoomActivityModal room={room} onClose={() => setIsActivityModalOpen(false)} />}
    </>
  );
};

export default RoomView;
