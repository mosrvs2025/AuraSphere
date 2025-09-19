// Implemented the RoomView component to provide the main audio room UI.
import React, { useContext, useState } from 'react';
import { Room, User } from '../types';
import HostControls from './HostControls';
import UserProfile from './UserProfile';
import ChatView from './ChatView';
import { RoomActionsContext } from '../context/RoomActionsContext';
import { MicIcon, SendIcon } from './Icons';

interface RoomViewProps {
  room: Room;
  currentUser: User;
  onLeave: () => void;
  onUpdateRoom: (updatedData: Partial<Room>) => void;
  onSendMessage: (message: { text: string }) => void;
}

const RoomView: React.FC<RoomViewProps> = ({ room, currentUser, onLeave, onUpdateRoom, onSendMessage }) => {
  const isHost = room.hosts.some(h => h.id === currentUser.id);
  const { isSharingScreen } = useContext(RoomActionsContext);
  const [text, setText] = useState('');

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSendMessage({ text: text.trim() });
      setText('');
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-900 animate-fade-in">
      <header className="flex-shrink-0 p-4 border-b border-gray-800 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">{room.title}</h1>
          <p className="text-sm text-gray-400">{room.hosts.map(h => h.name).join(', ')}</p>
        </div>
        <button onClick={onLeave} className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-full text-sm transition">
          Leave
        </button>
      </header>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Main Content: Video/Screen share or Participants */}
        <main className="flex-1 flex flex-col p-4 md:p-6 overflow-y-auto">
          {room.videoUrl ? (
            <div className="aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center">
                <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${room.videoUrl.split('v=')[1]}`}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                ></iframe>
            </div>
           ) : isSharingScreen ? (
             <div className="aspect-video bg-black rounded-lg flex items-center justify-center text-gray-400">
                <p>Screen sharing is active...</p>
             </div>
           ) : (
             <>
                <div className="mb-6">
                    <h2 className="text-lg font-bold text-indigo-400 mb-3">Hosts</h2>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                        {room.hosts.map(user => <UserProfile key={user.id} user={user} />)}
                    </div>
                </div>

                {room.speakers.length > 0 && (
                    <div className="mb-6">
                        <h2 className="text-lg font-bold text-gray-300 mb-3">Speakers</h2>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                            {room.speakers.map(user => <UserProfile key={user.id} user={user} />)}
                        </div>
                    </div>
                )}

                <div>
                    <h2 className="text-lg font-bold text-gray-500 mb-3">Listeners ({room.listeners.length})</h2>
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4">
                        {room.listeners.map(user => <UserProfile key={user.id} user={user} isListener />)}
                    </div>
                </div>
             </>
           )}
        </main>

        {/* Chat Sidebar */}
        <aside className="w-full md:w-80 lg:w-96 border-t md:border-t-0 md:border-l border-gray-800 flex flex-col flex-shrink-0">
          <ChatView messages={room.messages} />
        </aside>
      </div>

      <footer className="flex-shrink-0 p-4 border-t border-gray-800 bg-gray-800/30 space-y-4">
        {isHost && <HostControls videoUrl={room.videoUrl} onUpdateRoom={onUpdateRoom} />}
        {/* Unified Input Bar */}
        <div className="flex items-center space-x-2">
            <button className="p-3 bg-gray-700 hover:bg-gray-600 rounded-full transition" title="Send Audio Note">
                <MicIcon />
            </button>
            <form onSubmit={handleTextSubmit} className="flex-1 flex items-center bg-gray-900 rounded-full">
                <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Send a message..."
                    className="bg-transparent w-full pl-4 p-3 text-sm focus:outline-none"
                />
                <button type="submit" className="p-3 text-indigo-400 hover:text-indigo-300" aria-label="Send message">
                   <SendIcon />
                </button>
            </form>
        </div>
      </footer>
    </div>
  );
};

export default RoomView;