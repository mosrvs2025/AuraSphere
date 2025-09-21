import React from 'react';
import { StudioIcon, DocumentTextIcon, MicIcon } from './Icons';

interface CreateHubModalProps {
  onClose: () => void;
  onStartRoom: () => void;
  onNewPost: () => void;
  onNewNote: () => void;
}

const CreateHubModal: React.FC<CreateHubModalProps> = ({ onClose, onStartRoom, onNewPost, onNewNote }) => {
  const options = [
    { label: 'Start a Room', icon: <StudioIcon />, action: onStartRoom },
    { label: 'New Media Post', icon: <DocumentTextIcon />, action: onNewPost },
    { label: 'New Voice Note', icon: <MicIcon />, action: onNewNote },
  ];

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
          <h3 className="text-xl font-bold">Create</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
            {options.map(opt => (
                <button 
                    key={opt.label}
                    onClick={() => { opt.action(); onClose(); }}
                    className="flex flex-col items-center justify-center aspect-square bg-gray-700/50 hover:bg-gray-700 transition-colors rounded-lg p-4"
                >
                    <div className="w-10 h-10 mb-2">{opt.icon}</div>
                    <span className="font-semibold text-sm">{opt.label}</span>
                </button>
            ))}
        </div>
      </div>
    </div>
  );
};

export default CreateHubModal;
