
import React, { useState, useContext } from 'react';
import { Room, VoiceMemo, UserRole } from '../types';
import UserProfile from './UserProfile';
import HostControls from './HostControls';
import ListenerControls from './ListenerControls';
import { UserContext } from '../context/UserContext';

interface RoomViewProps {
  room: Room;
  onLeave: () => void;
}

const RoomView: React.FC<RoomViewProps> = ({ room, onLeave }) => {
  const currentUser = useContext(UserContext);
  const [memos, setMemos] = useState<VoiceMemo[]>([]);
  const [nowPlaying, setNowPlaying] = useState<VoiceMemo | null>(null);
  
  const addMemo = (memo: VoiceMemo) => {
    setMemos(prev => [...prev, memo]);
  };
  
  const playMemoForRoom = (memoId: string) => {
    const memoToPlay = memos.find(m => m.id === memoId);
    if (memoToPlay) {
      setNowPlaying(memoToPlay);
      setMemos(prev => prev.filter(m => m.id !== memoId));
      setTimeout(() => setNowPlaying(null), memoToPlay.duration * 1000);
    }
  };

  return (
    <div className="h-full flex flex-col animate-fade-in">
      <header className="flex items-center justify-between p-4 bg-gray-900/50 backdrop-blur-sm rounded-t-2xl">
        <button onClick={onLeave} className="text-indigo-400 hover:text-indigo-300 font-semibold text-sm">&larr; All Rooms</button>
        <h1 className="text-lg font-bold text-center truncate">{room.title}</h1>
        <div className="w-24"></div>
      </header>

      <div className="flex-grow p-4 bg-gray-800/30 rounded-b-2xl">
        {/* Now Playing Memo */}
        {nowPlaying && (
          <div className="bg-indigo-500/20 border border-indigo-500/50 rounded-lg p-4 mb-6 text-center animate-pulse-slow">
            <p className="text-sm text-indigo-300">Now Playing Voice Memo from</p>
            <p className="font-bold text-white">{nowPlaying.user.name}</p>
          </div>
        )}

        {/* User Sections */}
        <div className="space-y-6">
          <UserSection title="Hosts" users={room.hosts} />
          <UserSection title="Speakers" users={room.speakers} />
          <UserSection title="Listeners" users={room.listeners} />
        </div>
      </div>
      
      <footer className="sticky bottom-0 p-4 bg-gray-900/70 backdrop-blur-sm">
        {currentUser.role === UserRole.HOST ? (
          <HostControls memoQueue={memos} onPlayMemo={playMemoForRoom} />
        ) : (
          <ListenerControls onSubmitMemo={addMemo} />
        )}
      </footer>
    </div>
  );
};

interface UserSectionProps {
    title: string;
    users: Room['hosts']; // can be any user array
}

const UserSection: React.FC<UserSectionProps> = ({ title, users }) => {
    if (users.length === 0) return null;
    return (
        <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">{title}</h3>
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-4">
                {users.map(user => <UserProfile key={user.id} user={user} />)}
            </div>
        </div>
    );
}


export default RoomView;
