import React, { useState } from 'react';
import { PlusIcon, XIcon, StudioIcon, DocumentTextIcon, MicIcon } from './Icons';

interface FabCreateMenuProps {
  onStartRoom: () => void;
  onNewPost: () => void;
  onNewNote: () => void;
  onNewVoiceNote: () => void;
}

const FabCreateMenu: React.FC<FabCreateMenuProps> = ({ onStartRoom, onNewPost, onNewNote, onNewVoiceNote }) => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { label: 'Voice Note', icon: <MicIcon />, action: onNewVoiceNote },
    { label: 'Text Note', icon: <DocumentTextIcon />, action: onNewNote },
    { label: 'Media Post', icon: <StudioIcon />, action: onNewPost },
    { label: 'Start Room', icon: <StudioIcon />, action: onStartRoom },
  ];

  const toggleMenu = () => setIsOpen(!isOpen);
  
  const handleAction = (action: () => void) => {
    action();
    setIsOpen(false);
  }

  return (
    <div className="fixed bottom-20 right-4 z-30">
        {/* Menu Items */}
        {isOpen && (
             <div className="flex flex-col items-end space-y-3 mb-4">
                {menuItems.map((item, index) => (
                    <div key={item.label} className="flex items-center space-x-3 animate-fade-in" style={{ animationDelay: `${(menuItems.length - index - 1) * 50}ms`}}>
                        <span className="bg-gray-800/90 text-white text-sm font-semibold px-3 py-1.5 rounded-md shadow-lg">{item.label}</span>
                        <button onClick={() => handleAction(item.action)} className="bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-full shadow-lg">
                            {item.icon}
                        </button>
                    </div>
                ))}
             </div>
        )}

        {/* Main FAB */}
        <button
            onClick={toggleMenu}
            className="w-16 h-16 bg-indigo-600 hover:bg-indigo-500 rounded-full flex items-center justify-center text-white shadow-2xl transform transition-transform hover:scale-110"
            aria-expanded={isOpen}
            aria-label="Create new content"
        >
           <div className={`transform transition-transform duration-300 ease-in-out ${isOpen ? 'rotate-45' : 'rotate-0'}`}>
             <PlusIcon className="w-8 h-8"/>
           </div>
        </button>
    </div>
  );
};

export default FabCreateMenu;
