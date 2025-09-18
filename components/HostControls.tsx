
import React, { useState } from 'react';
import { VoiceMemo } from '../types';
import { generateIcebreakers } from '../services/geminiService';

interface HostControlsProps {
  memoQueue: VoiceMemo[];
  onPlayMemo: (memoId: string) => void;
}

const HostControls: React.FC<HostControlsProps> = ({ memoQueue, onPlayMemo }) => {
  const [isQueueVisible, setIsQueueVisible] = useState(false);
  const [topic, setTopic] = useState("technology");
  const [icebreakers, setIcebreakers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSuggestIcebreakers = async () => {
    setIsLoading(true);
    setIcebreakers([]);
    const suggestions = await generateIcebreakers(topic);
    setIcebreakers(suggestions);
    setIsLoading(false);
  };

  return (
    <div className="relative">
      {/* Voice Memo Queue */}
      {isQueueVisible && (
        <div className="absolute bottom-full mb-4 w-full bg-gray-800 border border-gray-700 rounded-lg shadow-xl p-4 animate-slide-up">
          <h4 className="font-bold mb-2">Voice Memo Queue</h4>
          {memoQueue.length > 0 ? (
            <ul className="space-y-2 max-h-48 overflow-y-auto">
              {memoQueue.map(memo => (
                <li key={memo.id} className="flex items-center justify-between bg-gray-700/50 p-2 rounded">
                  <div className="flex items-center">
                    <img src={memo.user.avatarUrl} alt={memo.user.name} className="h-8 w-8 rounded-full mr-2" />
                    <span className="text-sm font-semibold">{memo.user.name}</span>
                  </div>
                  <button onClick={() => onPlayMemo(memo.id)} className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-1 px-3 rounded-full transition">
                    Play
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 text-sm">No new voice memos.</p>
          )}
        </div>
      )}

      {/* Main Controls */}
      <div className="flex items-center justify-between space-x-2">
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
        
        <button onClick={() => setIsQueueVisible(!isQueueVisible)} className="relative p-3 bg-gray-700 rounded-full hover:bg-gray-600 transition">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
          </svg>
          {memoQueue.length > 0 && (
            <span className="absolute top-0 right-0 block h-3 w-3 rounded-full bg-red-500 border-2 border-gray-700"></span>
          )}
        </button>
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
