// Implemented RoomView, the main interface for participating in a live audio room.
import React, { useState } from 'react';
import { Room, User, ChatMessage, ModalPosition } from '../types';
import ChatView from './ChatView';
import { RoomActionsContext } from '../context/RoomActionsContext';
import { generateIcebreakers } from '../services/geminiService';
import { MicIcon } from './Icons';
import DynamicInput from './DynamicInput';


interface RoomViewProps {
  room: Room;
  currentUser: User;
  onLeave: () => void;
  onUserSelect: (user: User, position: ModalPosition) => void;
}

const UserAvatar: React.FC<{ user: User, size?: 'large' | 'small', onClick: (e: React.MouseEvent<HTMLButtonElement>) => void }> = ({ user, size = 'large', onClick }) => (
    <button onClick={onClick} className="flex flex-col items-center space-y-1 text-center focus:outline-none focus:ring-4 focus:ring-indigo-500/30 rounded-full transition-shadow duration-300 hover:shadow-lg hover:shadow-indigo-500/20">
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
    const [isChatCollapsed, setChatCollapsed] = useState(true);

    // State for controls, moved up from sub-components
    const [isMuted, setIsMuted] = useState(true);
    const [icebreakers, setIcebreakers] = useState<string[]>([]);
    const [isLoadingIcebreakers, setIsLoadingIcebreakers] = useState(false);
    const [videoInput, setVideoInput] = useState('');


    const isHost = currentRoom.hosts.some(h => h.id === currentUser.id);

    const handleUpdateRoom = (updatedData: Partial<Room>) => {
      setCurrentRoom(prev => ({...prev, ...updatedData}));
    };

    const handleToggleReaction = (messageId: string, emoji: string) => {
      console.log(`Toggled reaction ${emoji} for message ${messageId}`);
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
    
    // Host Control Handlers
    const handleSuggestIcebreakers = async () => {
        setIsLoadingIcebreakers(true);
        setIcebreakers([]);
        const suggestions = await generateIcebreakers(currentRoom.title);
        setIcebreakers(suggestions);
        setIsLoadingIcebreakers(false);
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
        <div className="flex-1 flex flex-col bg-gray-900 overflow-hidden">
          <header className="p-4 md:p-6 flex-shrink-0 flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold">{currentRoom.title}</h1>
              <p className="text-sm text-gray-400">{currentRoom.hosts.map(h => h.name).join(', ')}</p>
            </div>
            <button onClick={onLeave} className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-full text-sm transition">
              Leave
            </button>
          </header>

          {/* Screen Share / Video View */}
          <div className="px-4 md:px-6 flex-shrink-0">
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
          </div>
          

          {/* Child 1: Participants Area */}
          <div className="flex-1 overflow-y-auto space-y-6 pb-4 px-4 md:px-6">
              <div>
                  <h2 className="text-lg font-bold text-gray-400 mb-4">Hosts</h2>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                      {currentRoom.hosts.map(user => <UserAvatar key={user.id} user={user} onClick={(e) => handleAvatarClick(e, user)} />)}
                  </div>
              </div>
              <div>
                  <h2 className="text-lg font-bold text-gray-400 mb-4">Speakers</h2>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                      {currentRoom.speakers.map(user => <UserAvatar key={user.id} user={user} onClick={(e) => handleAvatarClick(e, user)} />)}
                  </div>
              </div>
               <div>
                  <h2 className="text-lg font-bold text-gray-400 mb-4">Listeners</h2>
                  <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 gap-4">
                      {currentRoom.listeners.map(user => <UserAvatar key={user.id} user={user} size="small" onClick={(e) => handleAvatarClick(e, user)} />)}
                  </div>
              </div>
          </div>
          
          {/* Child 2: The Room Chat Area (mobile only) */}
           <div className="md:hidden flex-shrink-0 border-t border-gray-800">
             <ChatView 
               messages={messages} 
               currentUser={currentUser}
               onToggleReaction={handleToggleReaction}
               nowPlayingAudioNoteId={nowPlayingAudioNoteId}
               onPlayAudioNote={setNowPlayingAudioNoteId}
               isCollapsed={isChatCollapsed}
               onToggleCollapse={() => setChatCollapsed(!isChatCollapsed)}
             />
           </div>

          {/* Child 3: The Bottom Control Bar */}
          <footer className="p-4 md:p-6 pt-4 border-t border-gray-800 flex-shrink-0">
             {isHost ? (
                // Host Controls
                <div className="relative space-y-4">
                    <div className="flex items-center justify-center space-x-2">
                        <button onClick={onToggleScreenShare} className={`flex items-center space-x-2 font-bold py-2 px-4 rounded-full text-sm transition ${isSharingScreen ? 'bg-red-600 hover:bg-red-500 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-200'}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                            <span>{isSharingScreen ? 'Stop' : 'Screen'}</span>
                        </button>
                        {currentRoom.videoUrl ? (
                            <button onClick={handleStopVideo} className="flex items-center space-x-2 font-bold py-2 px-4 rounded-full text-sm transition bg-red-600 hover:bg-red-500 text-white">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M5 5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2H5z" /></svg>
                                <span>Stop Video</span>
                            </button>
                        ) : (
                            <form onSubmit={handleShareVideo} className="flex items-center bg-gray-800 rounded-full">
                                <input type="text" value={videoInput} onChange={(e) => setVideoInput(e.target.value)} placeholder="YouTube URL..." className="bg-transparent pl-4 p-2 text-sm w-32 focus:outline-none" />
                                <button type="submit" className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-full text-sm transition">Share Video</button>
                            </form>
                        )}
                        <button onClick={handleSuggestIcebreakers} disabled={isLoadingIcebreakers} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-full disabled:bg-indigo-800 disabled:cursor-not-allowed text-sm transition">
                            {isLoadingIcebreakers ? '...' : '✨ Suggest'}
                        </button>
                    </div>
                     {icebreakers.length > 0 && (
                        <div className="p-4 bg-gray-800 border border-gray-700 rounded-lg">
                            <h5 className="font-bold text-indigo-400 mb-2">Icebreaker Ideas:</h5>
                            <ul className="list-disc list-inside text-sm space-y-1">
                                {icebreakers.map((q, i) => <li key={i}>{q}</li>)}
                            </ul>
                        </div>
                    )}
                </div>
            ) : (
                // Listener Controls
                <div className="flex items-center space-x-4">
                    <DynamicInput 
                        onSubmitMessage={handleSendTextMessage}
                        onStartAudioRecording={() => console.log('Start audio recording...')}
                        onStartVideoRecording={() => console.log('Start video recording...')}
                    />
                    <button className="bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded-full text-sm transition flex-shrink-0">
                        Raise Hand
                    </button>
                    <button onClick={() => setIsMuted(!isMuted)} className={`p-3 rounded-full transition flex-shrink-0 ${isMuted ? 'bg-gray-700 text-gray-300' : 'bg-green-500 text-white'}`}>
                        <MicIcon />
                    </button>
                </div>
            )}
          </footer>
        </div>

        {/* Chat Sidebar (Desktop only) */}
        <div className="hidden md:flex md:flex-col w-80 lg:w-96 border-l border-gray-800 flex-shrink-0 h-full">
          <ChatView 
            messages={messages} 
            currentUser={currentUser}
            onToggleReaction={handleToggleReaction}
            nowPlayingAudioNoteId={nowPlayingAudioNoteId}
            onPlayAudioNote={setNowPlayingAudioNoteId}
            isCollapsed={false}
            onToggleCollapse={() => {}}
          />
        </div>
      </div>
    </RoomActionsContext.Provider>
    );
};

export default RoomView;