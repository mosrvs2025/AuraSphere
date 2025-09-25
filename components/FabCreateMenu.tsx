import React from 'react';
import { StudioIcon, VideoCameraIcon, ImageIcon, MicIcon, DocumentTextIcon } from './Icons.tsx';

interface CreateMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onStartRoom: () => void;
  onNewImagePost: () => void;
  onNewVideoPost: () => void;
  onNewVoiceNote: () => void;
  onNewTextPost: () => void;
}

const CreateMenu: React.FC<CreateMenuProps> = (props) => {
    const { isOpen, onClose, onStartRoom, onNewImagePost, onNewVideoPost, onNewVoiceNote, onNewTextPost } = props;
    
    const menuItems = [
        { label: 'Go Live', icon: <StudioIcon className="w-6 h-6" />, action: onStartRoom },
        { label: 'Post Video', icon: <VideoCameraIcon className="w-6 h-6" />, action: onNewVideoPost },
        { label: 'Post Image', icon: <ImageIcon className="w-6 h-6" />, action: onNewImagePost },
        { label: 'Voice Note', icon: <MicIcon className="w-6 h-6" />, action: onNewVoiceNote },
        { label: 'Text Post', icon: <DocumentTextIcon className="w-6 h-6" />, action: onNewTextPost },
    ];

    const handleAction = (action: () => void) => {
        action();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 flex flex-col justify-end"
          onClick={onClose}
        >
            <div 
                className="bg-gray-800 p-4 rounded-t-2xl animate-slide-up"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="grid grid-cols-3 gap-4 pt-4">
                    {menuItems.map((item) => (
                         <button
                            key={item.label}
                            onClick={() => handleAction(item.action)}
                            className="flex flex-col items-center justify-center space-y-2 text-white text-xs font-semibold p-2 rounded-lg hover:bg-gray-700 transition-colors"
                            aria-label={item.label}
                        >
                            <div className="w-14 h-14 bg-gray-900 rounded-2xl flex items-center justify-center">
                                {item.icon}
                            </div>
                            <span className="text-center">{item.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CreateMenu;
