
// Implemented ListenerControls component for non-host user interactions.
import React, { useState } from 'react';
// FIX: Corrected import path for Icons.
import { MicIcon, SendIcon } from './Icons.tsx';

const ListenerControls: React.FC = () => {
  const [isMuted, setIsMuted] = useState(true);
  const [text, setText] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    // In a real app, this would call a function to send the message
    console.log("Sending message:", text);
    setText('');
  };

  return (
    <div className="flex items-center justify-between space-x-4">
      {/* Mute/Unmute Button */}
      <button 
        onClick={() => setIsMuted(!isMuted)}
        className={`p-3 rounded-full transition ${isMuted ? 'bg-gray-700 text-gray-300' : 'bg-green-500 text-white'}`}
      >
        <MicIcon />
      </button>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="flex-1 flex items-center bg-gray-800 rounded-full">
        <input 
          type="text" 
          value={text} 
          onChange={(e) => setText(e.target.value)}
          placeholder="Send a message..."
          className="bg-transparent w-full pl-4 p-3 text-sm focus:outline-none"
        />
        <button type="submit" className="p-3 text-indigo-400 hover:text-indigo-300 disabled:text-gray-600" disabled={!text.trim()} aria-label="Send message">
          <SendIcon />
        </button>
      </form>

      {/* Hand Raise Button */}
      <button className="bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded-full text-sm transition">
        Raise Hand
      </button>
    </div>
  );
};

export default ListenerControls;