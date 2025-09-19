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
}

const RoomView: React.FC<RoomViewProps> = ({ room, onLeave, onToggleScreenShare }) => {
  const { currentUser } = useContext(UserContext);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [nowPlaying, setNowPlaying] = useState<ChatMessage | null>(null);
  const [speakingUserId, setSpeakingUserId] = useState<string | null>(null);

  // Simulate speaking activity
  useEffect(() => {
    const speakersAndHosts = [...room.hosts, ...room.speakers];
    if (speakersAndHosts.length === 0) return;

    const intervalId = setInterval(() => {
      // End previous speaker
      setSpeakingUserId(null);

      // Start new speaker after a short pause
      setTimeout(() => {
        const randomSpeaker = speakersAndHosts[Math.floor(Math.random() * speakersAndHosts.length)];
        setSpeakingUserId(randomSpeaker.id);
      }, 500); // 0.5s pause before next speaker

    }, 4000 + Math.random() * 3000); // New speaker every 4-7 seconds

    return () => clearInterval(intervalId);
  }, [room.hosts, room.speakers]);

  const handleSendMessage = (messageData: { text?: string; voiceMemo?: { duration: number } }) => {
    if (!currentUser) return;
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      user: currentUser,
      ...messageData,
      createdAt: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
  };
  
  const playVoiceMemo = (message: ChatMessage) => {
    if (message.voiceMemo) {
      setNowPlaying(message);
      // Clear the "Now Playing" banner after the memo duration
      setTimeout(() => setNowPlaying(null), message.voiceMemo.duration * 1000);
    }
  };

  const handleRemoveMessage = (messageId: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
  };

  const isHost = currentUser?.role === UserRole.HOST;
  const isSharingScreen = !!room.screenShareStream;

  return (
    <RoomActionsContext.Provider value={{ isSharingScreen, onToggleScreenShare }}>
      <div className="h-full flex flex-col animate-fade-in">
        <header className="flex items-center justify-between p-4 bg-gray-900/50 backdrop-blur-sm rounded-t-2xl">
          <button onClick={onLeave} className="text-indigo-400 hover:text-indigo-300 font-semibold text-sm">&larr; Back</button>
          <h1 className="text-lg font-bold text-center truncate">{room.title}</h1>
          <div className="w-24"></div>
        </header>

        <div className="flex-grow p-4 bg-gray-800/30 rounded-b-2xl overflow-y-auto">
          {/* Screen Share View */}
          {isSharingScreen && room.screenShareStream && (
            <div className="mb-6">
              <ScreenShareView stream={room.screenShareStream} />
            </div>
          )}
          
          {/* Now Playing Memo */}
          {nowPlaying && nowPlaying.voiceMemo && (
            <div className="bg-indigo-500/20 border border-indigo-500/50 rounded-lg p-4 mb-6 text-center animate-pulse-slow">
              <p className="text-sm text-indigo-300">Playing Voice Memo from</p>
              <p className="font-bold text-white">{nowPlaying.user.name}</p>
            </div>
          )}

          {/* User Sections */}
          <div className="space-y-6">
            <UserSection title="Hosts" users={room.hosts} speakingUserId={speakingUserId} />
            <UserSection title="Speakers" users={room.speakers} speakingUserId={speakingUserId} />
            <ChatView 
              messages={messages}
              currentUser={currentUser}
              isHost={isHost}
              onPlayVoiceMemo={playVoiceMemo}
              onRemoveMessage={handleRemoveMessage}
              nowPlayingMessageId={nowPlaying?.id || null}
            />
            <UserSection title="Listeners" users={room.listeners} speakingUserId={null} />
          </div>
        </div>
        
        <footer className="sticky bottom-0 p-4 bg-gray-900/70 backdrop-blur-sm">
          {isHost ? (
            <HostControls />
          ) : (
            <ListenerControls onSendMessage={handleSendMessage} />
          )}
        </footer>
      </div>
    </RoomActionsContext.Provider>
  );
};

interface UserSectionProps {
    title: string;
    users: User[];
    speakingUserId: string | null;
}

const UserSection: React.FC<UserSectionProps> = ({ title, users, speakingUserId }) => {
    if (users.length === 0) return null;
    return (
        <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">{title}</h3>
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-4">
                {users.map(user => <UserProfile key={user.id} user={user} isSpeaking={user.id === speakingUserId} />)}
            </div>
        </div>
    );
}

interface ScreenShareViewProps {
  stream: MediaStream;
}

const ScreenShareView: React.FC<ScreenShareViewProps> = ({ stream }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="bg-black rounded-lg overflow-hidden border border-gray-700 shadow-lg">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full aspect-video object-contain"
      />
    </div>
  );
};


export default RoomView;
