import React, { useState } from 'react';
import { PREDEFINED_AVATARS } from '../constants';
import { generateAvatarImage } from '../services/geminiService';

interface AvatarCustomizerProps {
  onClose: () => void;
  onAvatarSelect: (url: string, isGenerated: boolean) => void;
}

const AvatarCustomizer: React.FC<AvatarCustomizerProps> = ({ onClose, onAvatarSelect }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateClick = async () => {
    setIsLoading(true);
    setError(null);
    const generatedUrl = await generateAvatarImage();
    setIsLoading(false);

    if (generatedUrl) {
      onAvatarSelect(generatedUrl, true);
    } else {
      setError('Failed to generate avatar. Please try again.');
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-gray-800 border border-gray-700 rounded-2xl p-6 w-full max-w-sm m-4 text-white shadow-2xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Customize Avatar</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
        </div>
        
        <p className="text-sm text-gray-400 mb-4">Choose a preset or generate a unique one with AI.</p>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {PREDEFINED_AVATARS.map(url => (
            <button key={url} onClick={() => onAvatarSelect(url, false)} className="rounded-full overflow-hidden border-2 border-transparent hover:border-indigo-500 focus:border-indigo-500 outline-none transition">
              <img src={url} alt="Predefined Avatar" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>

        <button 
          onClick={handleGenerateClick}
          disabled={isLoading}
          className="w-full flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-full disabled:bg-indigo-800 disabled:cursor-not-allowed transition"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </>
          ) : (
             '✨ Generate with AI'
          )}
        </button>
        {error && <p className="text-red-400 text-xs mt-2 text-center">{error}</p>}
      </div>
    </div>
  );
};

export default AvatarCustomizer;