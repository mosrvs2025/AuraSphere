// Implemented RoomView, the main interface for participating in a live audio room.
import React, { useState } from 'react';
import { Room, User, ChatMessage } from '../types';
import ChatView from './ChatView';
import HostControls from './HostControls';
import ListenerControls from './ListenerControls';
import { RoomActionsContext } from '../context/RoomActionsContext';

interface RoomViewProps {
  room: Room;
  currentUser: User;
  onLeave: () => void;
  onUserSelect: (user: User) => void;
}

const UserAvatar: React.FC<{ user: User, size?: 'large' | 'small', onClick: () => void }> = ({ user, size = 'large', onClick }) => (
    <button onClick={onClick} className="flex flex-col items-center space-y-1 text-center focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-full">
        <img 
            src={user.avatarUrl} 
            alt={user.name} 
            className={`${size === 'large' ? 'w-20 h-20' : 'w-12 h-12'} rounded-full border-2 border-gray-600 shadow-md`}
        />
        <p className={`font-semibold truncate w-24 ${size === 'large' ? 'text-sm' : 'text-xs'}`}>{user.name}</p>
    </button>
);


const RoomView: React.FC<RoomViewProps> = ({ room, currentUser, onLeave, onUserSelect }) => {
    const [messages, setMessages] = useState<ChatMessage[]>(room.messages);
    const [isSharingScreen, setIsSharingScreen] = useState(false);
    const [nowPlayingAudioNoteId, setNowPlayingAudioNoteId] = useState<string | null>(null);
    const [currentRoom, setCurrentRoom] = useState<Room>(room);

    const isHost = currentRoom.hosts.some(h => h.id === currentUser.id);

    const handleUpdateRoom = (updatedData: Partial<Room>) => {
      setCurrentRoom(prev => ({...prev, ...updatedData}));
    };

    const handleToggleReaction = (messageId: string, emoji: string) => {
      // In a real app, this would be a backend call.
      // This is a placeholder function to satisfy prop requirements.
      console.log(`Toggled reaction ${emoji} for message ${messageId}`);
    };

    const onToggleScreenShare = async () => {
      setIsSharingScreen(!isSharingScreen);
    };

    return (
    <RoomActionsContext.Provider value={{ isSharingScreen, onToggleScreenShare }}>
      <div className="h-full flex flex-col md:flex-row animate-fade-in overflow-hidden">
        {/* Main Room Content */}
        <div className="flex-1 flex flex-col bg-gray-900 p-4 md:p-6">
          <header className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold">{currentRoom.title}</h1>
              <p className="text-sm text-gray-400">{currentRoom.hosts.map(h => h.name).join(', ')}</p>
            </div>
            <button onClick={onLeave} className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-full text-sm transition">
              Leave
            </button>
          </header>

          {/* Screen Share / Video View */}
          { isSharingScreen || currentRoom.videoUrl ? (
             <div className="w-full bg-black rounded-lg aspect-video mb-6 flex items-center justify-center text-gray-400">
               {isSharingScreen ? "Screen share is active" : (
                 <iframe 
                   src={currentRoom.videoUrl?.replace('watch?v=', 'embed/')} 
                   title="YouTube video player" 
                   frameBorder="0" 
                   allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                   allowFullScreen
                   className="w-full h-full rounded-lg"
                 ></iframe>
               )}
             </div>
          ) : null}

          {/* Participants */}
          <div className="flex-1 overflow-y-auto space-y-6">
              <div>
                  <h2 className="text-lg font-bold text-gray-400 mb-4">Hosts</h2>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                      {currentRoom.hosts.map(user => <UserAvatar key={user.id} user={user} onClick={() => onUserSelect(user)} />)}
                  </div>
              </div>
              <div>
                  <h2 className="text-lg font-bold text-gray-400 mb-4">Speakers</h2>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                      {currentRoom.speakers.map(user => <UserAvatar key={user.id} user={user} onClick={() => onUserSelect(user)} />)}
                  </div>
              </div>
               <div>
                  <h2 className="text-lg font-bold text-gray-400 mb-4">Listeners</h2>
                  <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 gap-4">
                      {currentRoom.listeners.map(user => <UserAvatar key={user.id} user={user} size="small" onClick={() => onUserSelect(user)} />)}
                  </div>
              </div>
          </div>
          
          {/* Controls */}
          <footer className="mt-auto pt-4">
              {isHost ? <HostControls videoUrl={currentRoom.videoUrl} onUpdateRoom={handleUpdateRoom} /> : <ListenerControls />}
          </footer>
        </div>

        {/* Chat Sidebar */}
        <div className="w-full md:w-80 lg:w-96 border-l border-gray-800 flex-shrink-0 h-1/2 md:h-full">
          <ChatView 
            messages={messages} 
            currentUser={currentUser}
            onToggleReaction={handleToggleReaction}
            nowPlayingAudioNoteId={nowPlayingAudioNoteId}
            onPlayAudioNote={setNowPlayingAudioNoteId}
          />
        </div>
      </div>
    </RoomActionsContext.Provider>
    );
};

export default RoomView;