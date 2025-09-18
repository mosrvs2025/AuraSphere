import React, { useState, useContext } from 'react';
import { generateIcebreakers } from '../services/geminiService';
import { RoomActionsContext } from '../context/RoomActionsContext';

const HostControls: React.FC = () => {
  const [topic, setTopic] = useState("technology");
  const [icebreakers, setIcebreakers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { isSharingScreen, onToggleScreenShare } = useContext(RoomActionsContext);

  const handleSuggestIcebreakers = async () => {
    setIsLoading(true);
    setIcebreakers([]);
    const suggestions = await generateIcebreakers(topic);
    setIcebreakers(suggestions);
    setIsLoading(false);
  };

  return (
    <div className="relative">
      <div className="flex items-center justify-center space-x-2">
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
          <span>{isSharingScreen ? 'Stop Sharing' : 'Share Screen'}</span>
        </button>

        <div className="flex items-center bg-gray-800 rounded-full">
            <input 
              type="text" 
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Topic..."
              className="bg-transparent pl-4 p-2 text-sm w-32 focus:outline-none"
            />
            <button 
              onClick={handleSuggestIcebreakers} 
              disabled={isLoading}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-full disabled:bg-indigo-800 disabled:cursor-not-allowed text-sm transition"
            >
              {isLoading ? '...' : '✨ Suggest'}
            </button>
        </div>
      </div>

       {/* Icebreakers Display */}
      {icebreakers.length > 0 && (
          <div className="mt-4 p-4 bg-gray-800 border border-gray-700 rounded-lg">
              <h5 className="font-bold text-indigo-400 mb-2">Icebreaker Ideas:</h5>
              <ul className="list-disc list-inside text-sm space-y-1">
                  {icebreakers.map((q, i) => <li key={i}>{q}</li>)}
              </ul>
          </div>
      )}
    </div>
  );
};

export default HostControls;