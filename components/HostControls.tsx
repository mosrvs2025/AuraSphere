import React, { useState } from 'react';
import { generateIcebreakers } from '../services/geminiService';
import { Room } from '../types';
import { UserPlusIcon, ChartBarIcon } from './Icons';

interface HostControlsProps {
  room: Room;
  onUpdateRoom: (updatedData: Partial<Room>) => void;
  onCreatePoll: () => void;
  onInviteClick: () => void;
  onViewActivity: () => void;
}

const HostControls: React.FC<HostControlsProps> = ({ room, onUpdateRoom, onCreatePoll, onInviteClick, onViewActivity }) => {
  const [topic, setTopic] = useState("technology");
  const [icebreakers, setIcebreakers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [videoInput, setVideoInput] = useState('');

  const isSharingScreen = room.isSharingScreen;
  const videoUrl = room.videoUrl;

  const onToggleScreenShare = () => {
    onUpdateRoom({ isSharingScreen: !isSharingScreen });
  };

  const handleSuggestIcebreakers = async () => {
    setIsLoading(true);
    setIcebreakers([]);
    const suggestions = await generateIcebreakers(topic);
    setIcebreakers(suggestions);
    setIsLoading(false);
  };
  
  const handleShareVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (videoInput.trim()) {
      onUpdateRoom({ videoUrl: videoInput.trim() });
      setVideoInput('');
    }
  };

  const handleStopVideo = () => {
    onUpdateRoom({ videoUrl: undefined });
  };

  return (
    <div className="relative space-y-4">
      <div className="flex items-center justify-center space-x-2 flex-wrap gap-2">
         {room.isPrivate && (
            <button onClick={onInviteClick} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-full text-sm transition flex items-center space-x-2">
                <UserPlusIcon className="h-5 w-5" />
                <span>Invite</span>
            </button>
         )}
        <button onClick={onViewActivity} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-full text-sm transition flex items-center space-x-2">
            <ChartBarIcon className="h-5 w-5" />
            <span>Activity</span>
        </button>
         <button
          onClick={onToggleScreenShare}
          className={`flex items-center space-x-2 font-bold py-2 px-4 rounded-full text-sm transition ${
            isSharingScreen 
              ? 'bg-red-600 hover:bg-red-500 text-white' 
              : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <span>{isSharingScreen ? 'Stop' : 'Screen'}</span>
        </button>
        
        {videoUrl ? (
          <button 
            onClick={handleStopVideo} 
            className="flex items-center space-x-2 font-bold py-2 px-4 rounded-full text-sm transition bg-red-600 hover:bg-red-500 text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M5 5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2H5z" />
            </svg>
            <span>Stop Video</span>
          </button>
        ) : (
          <form onSubmit={handleShareVideo} className="flex items-center bg-gray-800 rounded-full">
              <input type="text" value={videoInput} onChange={(e) => setVideoInput(e.target.value)} placeholder="YouTube URL..." className="bg-transparent pl-4 p-2 text-sm w-32 focus:outline-none" />
              <button type="submit" className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-full text-sm transition">Share Video</button>
          </form>
        )}

         <button onClick={onCreatePoll} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-full text-sm transition flex items-center space-x-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>Poll</span>
        </button>
      </div>
    </div>
  );
};

export default HostControls;