import React, { useState, useContext, useEffect, useRef } from 'react';
// FIX: Corrected import path for types.
import { Room, User, ChatMessage, Poll as PollType, RequestToSpeak } from '../types.ts';
import ChatView from './ChatView.tsx';
import UserCardModal from './UserCardModal.tsx';
import ConfirmationModal from './ConfirmationModal.tsx';
import Poll from './Poll.tsx';
import { UserContext } from '../context/UserContext.ts';
import FeaturedLink from './FeaturedLink.tsx';
import AiAssistantPanel from './AiAssistantPanel.tsx';
// FIX: Corrected import path for Icons.
import { SparklesIcon, MicIcon, UserPlusIcon, HeartIcon, ChevronDownIcon, ChartBarIcon, MessagesIcon, ScreenShareIcon, PollIcon, VideoCameraIcon, VideoCameraOffIcon, MicOffIcon, PhoneXMarkIcon, Cog6ToothIcon } from './Icons.tsx';
import InviteUsersModal from './InviteUsersModal.tsx';
import CreatePollModal from './CreatePollModal.tsx';
import DynamicInput from './DynamicInput.tsx';
import RequestToSpeakModal from './RequestToSpeakModal.tsx';
import RequestQueueView from './RequestQueueView.tsx';
import RoomActivityModal from './RoomActivityModal.tsx';
import BroadcastMediaView from './BroadcastMediaView.tsx';

interface RoomViewProps {
  room: Room;
  onMinimize: () => void;
  onLeave: () => void;
  onUpdateRoom: (updatedData: Partial<Room>) => void;
  onViewProfile: (user: User) => void;
  localStream: MediaStream | null;
  onViewVideoNote: (url: string) => void;
}

const ParticipantAvatar: React.FC<{ user: User; isHost: boolean; room: Room; localStream: MediaStream | null; currentUser: User; className?: string; }> = ({ user, isHost, room, localStream, currentUser, className }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const isCurrentUserHost = isHost && user.id === currentUser.id;
    const isVideoOn = isCurrentUserHost && room.isVideoEnabled && localStream;

    useEffect(() => {
        if (isVideoOn && videoRef.current) {
            videoRef.current.srcObject = localStream;
        }
    }, [isVideoOn, localStream]);

    return isVideoOn ? (
        <video ref={videoRef} autoPlay muted playsInline className={`${className} object-cover`} />
    ) : (
        <img src={user.avatarUrl} alt={user.name} className={`${className} object-cover`} />
    );
};


const ParticipantGrid: React.FC<{ users: User[], room: Room, localStream: MediaStream | null, currentUser: User, onUserClick: (user: User, ref: HTMLButtonElement) => void, title: string, gridClass?: string }> = ({ users, room, localStream, currentUser, onUserClick, title, gridClass = 'grid-cols-4' }) => (
  <div>
    <h3 className="text-gray-400 font-bold text-sm mb-2">{title} ({users.length})</h3>
    <div className={`grid ${gridClass} gap-4`}>
      {users.map(user => (
        <button key={user.id} onClick={(e) => onUserClick(user, e.currentTarget)} className="flex flex-col items-center text-center space-y-1 group">
          <ParticipantAvatar 
            user={user} 
            isHost={title === 'Hosts'} 
            room={room} 
            localStream={localStream} 
            currentUser={currentUser}
            className="w-16 h-16 rounded-full group-hover:opacity-80 transition-opacity"
          />
          <p className="text-xs font-semibold text-white truncate w-16">{user.name}</p>
        </button>
      ))}
    </div>
  </div>
);

const ToolsPanel: React.FC<{ room: Room; onUpdateRoom: (data: Partial<Room>) => void; onClose: () => void; onOpenModal: (modal: 'ai' | 'invite' | 'activity' | 'poll' | 'youtube') => void; }> = ({ room, onUpdateRoom, onClose, onOpenModal }) => {
    const hostMenuActions = [
        { label: 'AI Assistant', icon: <SparklesIcon className="h-6 w-6" />, action: () => onOpenModal('ai') },
        { label: 'Invite', icon: <UserPlusIcon className="h-6 w-6" />, action: () => onOpenModal('invite'), condition: room.isPrivate },
        { label: 'Activity', icon: <ChartBarIcon className="h-6 w-6" />, action: () => onOpenModal('activity') },
        { label: room.isChatEnabled ? 'Disable Chat' : 'Enable Chat', icon: <MessagesIcon className="h-6 w-6" />, action: () => onUpdateRoom({ isChatEnabled: !room.isChatEnabled }) },
        { label: room.isSharingScreen ? 'Stop Sharing' : 'Share Screen', icon: <ScreenShareIcon className="h-6 w-6" />, action: () => onUpdateRoom({ isSharingScreen: !room.isSharingScreen }) },
        { label: 'Share YouTube', icon: <VideoCameraIcon className="h-6 w-6" />, action: () => onOpenModal('youtube') },
        { label: 'Create Poll', icon: <PollIcon className="h-6 w-6" />, action: () => onOpenModal('poll') },
    ];

    return (
        <div className="fixed inset-0 bg-black/70 z-40" onClick={onClose}>
            <div className="absolute bottom-0 left-0 right-0 bg-gray-800 rounded-t-2xl p-4 animate-slide-up" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold text-center mb-4">Host Tools</h3>
                <div className="grid grid-cols-4 gap-4">
                    {hostMenuActions.map(item => (item.condition === undefined || item.condition) && (
                        <button key={item.label} onClick={() => { item.action(); onClose(); }} className="flex flex-col items-center justify-center space-y-2 text-white text-xs font-semibold p-2 rounded-lg hover:bg-gray-700 transition-colors">
                            <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center">
                                {item.icon}
                            </div>
                            <span className="text-center">{item.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};


const RoomView: React.FC<RoomViewProps> = ({ room, onMinimize, onLeave, onUpdateRoom, onViewProfile, localStream, onViewVideoNote }) => {
  const { currentUser } = useContext(UserContext);
  const [showConfirmLeave, setShowConfirmLeave] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{ user: User, position: { top: number, left: number, width: number, height: number } } | null>(null);
  const [animatedReaction, setAnimatedReaction] = useState<{ messageId: string, emoji: string } | null>(null);
  const [isChatCollapsed, setIsChatCollapsed] = useState(true);
  const [isAiPanelOpen, setAiPanelOpen] = useState(false);
  const [isInviteModalOpen, setInviteModalOpen] = useState(false);
  const [isCreatePollModalOpen, setCreatePollModalOpen] = useState(false);
  const [isRequestModalOpen, setRequestModalOpen] = useState(false);
  const [sidePanelView, setSidePanelView] = useState<'chat' | 'requests'>('chat');
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [reactions, setReactions] = useState<{id: number, emoji: string, x: number}[]>([]);
  const reactionCounter = useRef(0);
  
  const isHost = room.hosts.some(h => h.id === currentUser.id);

  const [isToolsPanelOpen, setToolsPanelOpen] = useState(false);
  const [showShareVideoInput, setShowShareVideoInput] = useState(false);
  const [videoInput, setVideoInput] = useState('');

  useEffect(() => {
    // If chat is disabled and the current user is not a host, switch to the requests tab
    if (!room.isChatEnabled && !isHost && sidePanelView === 'chat') {
        setSidePanelView('requests');
    }
  }, [room.isChatEnabled, isHost, sidePanelView]);


  const handleUserClick = (user: User, ref: HTMLButtonElement) => {
    // Tapping your own avatar in the grid can have special actions later
    // For now, it opens the standard user card modal for consistency
    const rect = ref.getBoundingClientRect();
    setSelectedUser({ user, position: { top: rect.bottom, left: rect.left, width: rect.width, height: rect.height } });
  };
  
  const handleSendMessage = (message: Omit<ChatMessage, 'id' | 'createdAt'>) => {
      const newMessage: ChatMessage = {
          id: `msg-${Date.now()}`,
          createdAt: new Date(),
          ...message
      };
      onUpdateRoom({ ...room, messages: [...room.messages, newMessage] });
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
    onUpdateRoom({ ...room, messages: newMessages });
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
    onUpdateRoom({ ...room, poll: newPoll });
  };

  const handleEndPoll = () => {
    if (room.poll) {
        onUpdateRoom({ ...room, poll: { ...room.poll, isActive: false } });
    }
  };

  const handleCreatePoll = (question: string, options: string[]) => {
    const newPoll: PollType = {
        id: `poll-${Date.now()}`,
        question,
        options: options.map(opt => ({ text: opt, votes: [] })),
        isActive: true,
    };
    onUpdateRoom({ ...room, poll: newPoll });
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
    onUpdateRoom({ ...room, requestsToSpeak: [...(room.requestsToSpeak || []), newRequest] });
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
      onUpdateRoom({ ...room, requestsToSpeak: newRequests });
  };

  const handleApproveRequest = (request: RequestToSpeak) => {
    const newListeners = room.listeners.filter(u => u.id !== request.user.id);
    const newSpeakers = [...room.speakers, request.user];
    const newRequests = (room.requestsToSpeak || []).filter(r => r.id !== request.id);

    onUpdateRoom({
        ...room,
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
            ...room,
            broadcastingMedia: mediaToBroadcast,
            // Remove request from queue after broadcasting
            requestsToSpeak: (room.requestsToSpeak || []).filter(r => r.id !== request.id),
        });
    }
  };
  
    const handleShareVideo = (e: React.FormEvent) => {
        e.preventDefault();
        if (videoInput.trim()) {
            onUpdateRoom({ videoUrl: videoInput.trim() });
            setVideoInput('');
            setShowShareVideoInput(false);
        }
    };

  const renderLayout = () => (
    <div className="h-full bg-gray-900 text-white flex flex-col animate-fade-in">
       {room.isRecorded && (
        <div className="bg-yellow-900/50 text-yellow-300 text-xs text-center p-2 flex items-center justify-center flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
            This room is being recorded for replays.
        </div>
      )}
      {/* TOP PART: The scrolling area */}
      <div className="flex-1 flex flex-col p-4 md:p-6 overflow-y-auto min-h-0">
        <header className="flex justify-between items-center mb-4">
            <button onClick={onMinimize} className="p-2 -ml-2 text-gray-400 hover:text-white" aria-label="Minimize Room">
                <ChevronDownIcon />
            </button>
            <div className="flex-1" /> {/* Spacer */}
            {isHost && (
                <button onClick={() => setToolsPanelOpen(true)} className="p-2 text-gray-400 hover:text-white" aria-label="Open host tools">
                    <Cog6ToothIcon />
                </button>
            )}
        </header>
        <div className="text-center mb-4">
            <h1 className="text-2xl font-bold">{room.title}</h1>
            {room.description && <p className="text-gray-400 text-sm mt-1">{room.description}</p>}
        </div>

        {room.featuredUrl && <FeaturedLink url={room.featuredUrl} onOpenLink={(url) => console.log('Open link:', url)} />}
        {room.poll && <Poll poll={room.poll} onVote={handleVote} isHost={isHost} onEndPoll={handleEndPoll} currentUser={currentUser} />}

        <div className="space-y-6">
          <ParticipantGrid users={room.hosts} room={room} localStream={localStream} currentUser={currentUser} onUserClick={handleUserClick} title="Hosts" />
          <ParticipantGrid users={room.speakers} room={room} localStream={localStream} currentUser={currentUser} onUserClick={handleUserClick} title="Speakers" />
          <ParticipantGrid users={room.listeners} room={room} localStream={localStream} currentUser={currentUser} onUserClick={handleUserClick} title="Listeners" gridClass="grid-cols-5" />
        </div>
      </div>

      {/* BOTTOM PART: The chat/controls panel */}
      <div className="flex-shrink-0 border-t border-gray-700/50 flex flex-col bg-gray-900">
        <div className="flex border-b border-gray-700/50 flex-shrink-0">
            {(room.isChatEnabled || isHost) && (
                <button
                    onClick={() => setSidePanelView('chat')}
                    className={`flex-1 py-2 text-sm font-bold transition-colors ${sidePanelView === 'chat' ? 'text-white bg-gray-700/50' : 'text-gray-400 hover:bg-gray-800'}`}
                >
                    Chat
                </button>
            )}
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
        
        {sidePanelView === 'chat' && (room.isChatEnabled || isHost) ? (
            room.isChatEnabled ? (
                <ChatView
                    messages={room.messages}
                    currentUser={currentUser}
                    onToggleReaction={handleToggleReactionWithAnimation}
                    isCollapsed={isChatCollapsed}
                    onToggleCollapse={() => setIsChatCollapsed(!isChatCollapsed)}
                    animatedReaction={animatedReaction}
                    onViewVideoNote={onViewVideoNote}
                />
            ) : (
                <div className="max-h-[300px] flex items-center justify-center p-4">
                    <p className="text-center text-sm text-gray-500">Chat is disabled for listeners.</p>
                </div>
            )
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
        
        <footer className="p-4 bg-gray-800/80 border-t border-gray-700/50">
          {isHost ? (
             <div className="space-y-2">
                {sidePanelView === 'chat' && room.isChatEnabled &&
                    <DynamicInput
                        onSubmitMessage={handleSendTextMessage}
                        onSubmitAudioNote={handleSendAudioNote}
                        onSubmitVideoNote={handleSendVideoNote}
                    />
                }
             </div>
          ) : (
             <div className="flex items-center space-x-4">
                <div className="flex-1">
                  {sidePanelView === 'chat' && room.isChatEnabled &&
                    <DynamicInput
                        onSubmitMessage={handleSendTextMessage}
                        onSubmitAudioNote={handleSendAudioNote}
                        onSubmitVideoNote={handleSendVideoNote}
                    />
                  }
                </div>
                <button onClick={handleSendLiveReaction} className="p-2 text-gray-400 hover:text-red-400 transition-transform active:scale-125"><HeartIcon className="w-7 h-7" /></button>
                 <button onClick={() => setRequestModalOpen(true)} className="bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded-full text-sm transition flex items-center space-x-2">
                      <UserPlusIcon className="h-5 w-5" />
                      <span>Request</span>
                  </button>
              </div>
          )}
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
        
        {renderLayout()}
        
         {isHost && (
            <div className="absolute bottom-20 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent z-20 pointer-events-none">
                <div className="flex items-center justify-center space-x-4 pointer-events-auto">
                    <button 
                        onClick={() => onUpdateRoom({ isMicMuted: !room.isMicMuted })}
                        className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${room.isMicMuted ? 'bg-red-600 text-white' : 'bg-gray-700/80 text-white'}`}
                        aria-label={room.isMicMuted ? 'Unmute' : 'Mute'}
                    >
                        {room.isMicMuted ? <MicOffIcon className="w-7 h-7" /> : <MicIcon className="w-7 h-7" />}
                    </button>
                     <button 
                        onClick={() => onUpdateRoom({ isVideoEnabled: !room.isVideoEnabled })}
                        className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${!room.isVideoEnabled ? 'bg-red-600 text-white' : 'bg-gray-700/80 text-white'}`}
                        aria-label={room.isVideoEnabled ? 'Turn camera off' : 'Turn camera on'}
                    >
                         {room.isVideoEnabled ? <VideoCameraIcon className="w-7 h-7" /> : <VideoCameraOffIcon className="w-7 h-7" />}
                    </button>
                     <button 
                        onClick={() => setShowConfirmLeave(true)}
                        className="w-14 h-14 rounded-full flex items-center justify-center bg-red-600 text-white"
                        aria-label="End room"
                    >
                        <PhoneXMarkIcon className="w-7 h-7" />
                    </button>
                </div>
            </div>
        )}

        {room.broadcastingMedia && (
            <BroadcastMediaView
                media={room.broadcastingMedia}
                isHost={isHost}
                onStop={() => onUpdateRoom({ ...room, broadcastingMedia: null })}
            />
        )}
        
        {isToolsPanelOpen && isHost && (
            <ToolsPanel
                room={room}
                onUpdateRoom={onUpdateRoom}
                onClose={() => setToolsPanelOpen(false)}
                onOpenModal={(modal) => {
                    if (modal === 'ai') setAiPanelOpen(true);
                    if (modal === 'invite') setInviteModalOpen(true);
                    if (modal === 'activity') setIsActivityModalOpen(true);
                    if (modal === 'poll') setCreatePollModalOpen(true);
                    if (modal === 'youtube') setShowShareVideoInput(true);
                }}
            />
        )}


        {showShareVideoInput && isHost && (
             <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowShareVideoInput(false)}>
                <form onSubmit={handleShareVideo} className="flex items-center bg-gray-800 rounded-full animate-slide-up" onClick={e => e.stopPropagation()}>
                    <input type="text" value={videoInput} onChange={(e) => setVideoInput(e.target.value)} placeholder="YouTube URL..." className="bg-transparent pl-4 p-2 text-sm w-64 focus:outline-none" autoFocus />
                    <button type="submit" className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-full text-sm transition">Share</button>
                </form>
             </div>
        )}

        {isAiPanelOpen && <AiAssistantPanel room={room} messages={room.messages} onClose={() => setAiPanelOpen(false)} />}
        {showConfirmLeave && <ConfirmationModal title="End Room" message="Are you sure you want to end this session for everyone?" confirmText="End Room" onConfirm={onLeave} onCancel={() => setShowConfirmLeave(false)} />}
        {selectedUser && <UserCardModal user={selectedUser.user} position={selectedUser.position} onClose={() => setSelectedUser(null)} onViewProfile={(user) => { setSelectedUser(null); onViewProfile(user); }} />}
        {isInviteModalOpen && <InviteUsersModal followers={currentUser.followers} onClose={() => setInviteModalOpen(false)} onInvite={(userIds) => onUpdateRoom({ ...room, invitedUserIds: [...(room.invitedUserIds || []), ...userIds]})} alreadyInvitedUserIds={room.invitedUserIds || []} />}
        {isCreatePollModalOpen && <CreatePollModal onClose={() => setCreatePollModalOpen(false)} onCreate={handleCreatePoll} />}
        {isRequestModalOpen && <RequestToSpeakModal onClose={() => setRequestModalOpen(false)} onSubmit={handleSubmitRequest} />}
        {isActivityModalOpen && isHost && <RoomActivityModal room={room} onClose={() => setIsActivityModalOpen(false)} />}
    </>
  );
};

export default RoomView;
