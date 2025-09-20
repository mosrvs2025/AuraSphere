import React from 'react';
import { StudioIcon, VideoCameraIcon, ImageIcon, DocumentTextIcon, MicIcon } from './Icons';

type CreateOption = 'live' | 'video' | 'image' | 'note' | 'voice_note';

interface CreateHubModalProps {
  onClose: () => void;
  onSelectOption: (option: CreateOption) => void;
}

const creationOptions = [
  { id: 'live', label: 'Go Live', icon: <StudioIcon className="h-10 w-10" />, color: 'bg-red-500' },
  { id: 'video', label: 'Post a Video', icon: <VideoCameraIcon className="h-10 w-10" />, color: 'bg-purple-500' },
  { id: 'image', label: 'Post an Image', icon: <ImageIcon className="h-10 w-10" />, color: 'bg-blue-500' },
  { id: 'note', label: 'Write a Note', icon: <DocumentTextIcon className="h-10 w-10" />, color: 'bg-green-500' },
  { id: 'voice_note', label: 'Voice Note', icon: <MicIcon className="h-10 w-10" />, color: 'bg-yellow-500' },
] as const;


const CreateHubModal: React.FC<CreateHubModalProps> = ({ onClose, onSelectOption }) => {
  return (
    <div
      className="fixed inset-0 bg-gray-900/80 backdrop-blur-md flex flex-col items-center justify-center z-50 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="flex flex-col items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center mb-12 animate-slide-up">
            <h2 className="text-4xl font-bold text-white">What would you like to create?</h2>
        </div>

        <div className="grid grid-cols-2 gap-6 md:grid-cols-5 md:gap-8">
            {creationOptions.map((option, index) => (
            <button
                key={option.id}
                onClick={() => onSelectOption(option.id)}
                className="flex flex-col items-center justify-center space-y-4 p-6 rounded-3xl w-40 h-40 transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-gray-900 hub-option-button"
                style={{ animationDelay: `${index * 100}ms` }}
            >
                <div className={`w-24 h-24 rounded-full flex items-center justify-center text-white ${option.color}`}>
                {option.icon}
                </div>
                <span className="font-semibold text-white text-lg">{option.label}</span>
            </button>
            ))}
        </div>
      </div>
       <button 
          onClick={onClose}
          className="absolute bottom-10 text-gray-400 bg-gray-800 rounded-full py-3 px-6 hover:bg-gray-700 hover:text-white transition"
        >
          Cancel
        </button>
    </div>
  );
};

export default CreateHubModal;
