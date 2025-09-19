import React, { useState, useContext, useEffect, useRef } from 'react';
import { Room, UserRole, ChatMessage, User } from '../types';
import UserProfile from './UserProfile';
import HostControls from './HostControls';
import ListenerControls from './ListenerControls';
import { UserContext } from '../context/UserContext';
import ChatView from './ChatView';
import { RoomActionsContext } from '../context/RoomActionsContext';

interface RoomViewProps {
  room: Room;
  onLeave: () => void;
  onToggleScreenShare: () => Promise<void>;
  onNewMessage: (message: ChatMessage) => void;
  onUpdateRoom: (updatedData: Partial<Room>) => void;
}

const RoomView: React.FC<RoomViewProps> = ({ room, onLeave, onToggleScreenShare, onNewMessage, onUpdateRoom }) => {
  const { currentUser } = useContext(UserContext);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [nowPlaying, setNowPlaying] = useState<ChatMessage | null>(null);
  const [speakingUserId, setSpeakingUserId] = useState<string | null>(null);
  const isHost = room.hosts.some(h => h.id === currentUser.id);

  useEffect(() => {
    const speakersAndHosts = [...room.hosts, ...room.speakers];
    if (speakersAndHosts.length === 0) return;
    const intervalId = setInterval(() => {
      setSpeakingUserId(null);
      setTimeout(() => {
        const randomSpeaker = speakersAndHosts[Math.floor(Math.random() * speakersAndHosts.length)];
        setSpeakingUserId(randomSpeaker.id);
      }, 500);
    }, 4000 + Math.random() * 3000);
    return () => clearInterval(intervalId);
  }, [room.hosts, room.speakers]);

  const handleSendMessage = (messageData: { text?: string; voiceMemo?: { duration: number, blob?: Blob } }) => {
    if (!currentUser) return;
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`, user: currentUser, ...messageData, createdAt: new Date(),
    };
    onNewMessage(newMessage); // Send to App state for routing (e.g. to moderation)
    
    // In our simulation, if it's not a memo from a listener, add it directly to local chat
    if(!(messageData.voiceMemo && !isHost)){
        setMessages(prev => [...prev, newMessage]);
    }
  };
  
  const playVoiceMemo = (message: ChatMessage) => {
    if (message.voiceMemo) {
      setNowPlaying(message);
      setTimeout(() => setNowPlaying(null), message.voiceMemo.duration * 1000);
    }
  };

  const handleRemoveMessage = (messageId: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
  };
  
  const promoteToSpeaker = (userId: string) => {
    const userToPromote = room.listeners.find(u => u.id === userId);
    if(userToPromote){
        const updatedListeners = room.listeners.filter(u => u.id !== userId);
        const updatedSpeakers = [...room.speakers, { ...userToPromote, role: UserRole.SPEAKER }];
        onUpdateRoom({ listeners: updatedListeners, speakers: updatedSpeakers });
    }
  };

  const approveMemo = (memo: ChatMessage) => {
    setMessages(prev => [...prev, memo]);
    const updatedQueue = room.moderationQueue?.filter(m => m.id !== memo.id);
    onUpdateRoom({ moderationQueue: updatedQueue });
  };
  
  const rejectMemo = (memoId: string) => {
    const updatedQueue = room.moderationQueue?.filter(m => m.id !== memoId);
    onUpdateRoom({ moderationQueue: updatedQueue });
  };

  const isSharingScreen = !!room.screenShareStream;
  const isSharingVideo = !!room.videoUrl;

  return (
    <RoomActionsContext.Provider value={{ isSharingScreen, onToggleScreenShare }}>
      <div className="h-full flex flex-col animate-fade-in">
        <header className="flex items-center justify-between p-4 bg-gray-900/50 backdrop-blur-sm rounded-t-2xl">
          <button onClick={onLeave} className="text-indigo-400 hover:text-indigo-300 font-semibold text-sm">&larr; Back</button>
          <h1 className="text-lg font-bold text-center truncate">{room.title}</h1>
          <div className="w-24"></div>
        </header>

        <div className="flex-grow p-4 bg-gray-800/30 rounded-b-2xl overflow-y-auto">
          {isSharingScreen && room.screenShareStream && <div className="mb-6"><ScreenShareView stream={room.screenShareStream} /></div>}
          {isSharingVideo && room.videoUrl && <div className="mb-6"><VideoShareView url={room.videoUrl} /></div>}
          
          {nowPlaying?.voiceMemo && (
            <div className="bg-indigo-500/20 border border-indigo-500/50 rounded-lg p-4 mb-6 text-center animate-pulse-slow">
              <p className="text-sm text-indigo-300">Playing Voice Memo from</p>
              <p className="font-bold text-white">{nowPlaying.user.name}</p>
            </div>
          )}

          <div className="space-y-6">
            <UserSection title="Hosts" users={room.hosts} speakingUserId={speakingUserId} />
            <UserSection title="Speakers" users={room.speakers} speakingUserId={speakingUserId} />
            {isHost && <ModerationQueue queue={room.moderationQueue || []} onApprove={approveMemo} onReject={rejectMemo} />}
            <ChatView messages={messages} currentUser={currentUser} isHost={isHost} onPlayVoiceMemo={playVoiceMemo} onRemoveMessage={handleRemoveMessage} nowPlayingMessageId={nowPlaying?.id || null} />
            <UserSection title="Listeners" users={room.listeners} speakingUserId={null} isHostView={isHost} onPromote={promoteToSpeaker} />
          </div>
        </div>
        
        <footer className="sticky bottom-0 p-4 bg-gray-900/70 backdrop-blur-sm">
          {isHost ? <HostControls onUpdateRoom={onUpdateRoom} /> : <ListenerControls onSendMessage={handleSendMessage} />}
        </footer>
      </div>
    </RoomActionsContext.Provider>
  );
};

const UserSection: React.FC<{ title: string; users: User[]; speakingUserId: string | null; isHostView?: boolean; onPromote?: (userId: string) => void;}> = ({ title, users, speakingUserId, isHostView, onPromote }) => {
    if (users.length === 0) return null;
    return (
        <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">{title}</h3>
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-4">
                {users.map(user => <UserProfile key={user.id} user={user} isSpeaking={user.id === speakingUserId} showPromoteButton={isHostView && title === 'Listeners'} onPromote={onPromote} />)}
            </div>
        </div>
    );
}

const ScreenShareView: React.FC<{ stream: MediaStream }> = ({ stream }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => { if (videoRef.current && stream) videoRef.current.srcObject = stream; }, [stream]);
  return <div className="bg-black rounded-lg overflow-hidden border border-gray-700 shadow-lg"><video ref={videoRef} autoPlay playsInline className="w-full aspect-video object-contain"/></div>;
};

const VideoShareView: React.FC<{ url: string }> = ({ url }) => {
  const embedUrl = url.replace("watch?v=", "embed/");
  return <div className="bg-black rounded-lg overflow-hidden border border-gray-700 shadow-lg aspect-video"><iframe src={embedUrl} title="Shared Video" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="w-full h-full"></iframe></div>
};

const ModerationQueue: React.FC<{queue: ChatMessage[], onApprove: (memo: ChatMessage) => void, onReject: (memoId: string) => void}> = ({queue, onApprove, onReject}) => {
    if(queue.length === 0) return null;
    return (
        <div>
            <h3 className="text-sm font-semibold text-yellow-400 uppercase tracking-wider mb-3">Suggestion Queue</h3>
            <div className="space-y-2 bg-gray-900/50 rounded-lg p-3">
                {queue.map(memo => (
                    <div key={memo.id} className="flex items-center justify-between bg-gray-800 p-2 rounded">
                        <div className="flex items-center space-x-2">
                           <img src={memo.user.avatarUrl} alt={memo.user.name} className="w-8 h-8 rounded-full" />
                           <div>
                            <p className="text-sm font-bold">{memo.user.name}</p>
                            <p className="text-xs text-gray-400">{memo.voiceMemo?.duration}s Voice Memo</p>
                           </div>
                        </div>
                        <div className="flex space-x-2">
                            <button onClick={() => onApprove(memo)} className="p-2 bg-green-600/20 text-green-400 rounded-full hover:bg-green-600/40 transition"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></button>
                            <button onClick={() => onReject(memo.id)} className="p-2 bg-red-600/20 text-red-400 rounded-full hover:bg-red-600/40 transition"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default RoomView;