
import React, { useState } from 'react';
import { PlusIcon, XIcon, StudioIcon, DocumentTextIcon } from './Icons';

interface FabCreateMenuProps {
  onStartRoom: () => void;
  onNewPost: () => void;
}

const FabCreateMenu: React.FC<FabCreateMenuProps> = ({ onStartRoom, onNewPost }) => {
  const [isOpen, setIsOpen] = useState(false);

  const menuOptions = [
    { label: 'New Post', icon: <DocumentTextIcon />, action: onNewPost },
    { label: 'Start Room', icon: <StudioIcon />, action: onStartRoom },
  ];

  const handleOptionClick = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-24 right-6 z-40">
      {isOpen && (
        <div className="flex flex-col items-center mb-4 space-y-3">
          {menuOptions.map(option => (
            <div key={option.label} className="flex items-center justify-end w-48 animate-fade-in">
              <span className="bg-gray-700 text-white text-sm font-semibold px-3 py-1 rounded-md mr-3">{option.label}</span>
              <button
                onClick={() => handleOptionClick(option.action)}
                className="w-12 h-12 bg-gray-600 hover:bg-gray-500 rounded-full flex items-center justify-center text-white shadow-lg"
              >
                {option.icon}
              </button>
            </div>
          ))}
        </div>
      )}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-indigo-600 hover:bg-indigo-500 rounded-full flex items-center justify-center text-white shadow-lg transform transition-transform hover:scale-110"
        aria-expanded={isOpen}
        aria-label={isOpen ? "Close create menu" : "Open create menu"}
      >
        <div className={`transform transition-transform duration-300 ${isOpen ? 'rotate-45' : 'rotate-0'}`}>
            <PlusIcon className="w-8 h-8"/>
        </div>
      </button>
    </div>
  );
};

export default FabCreateMenu;
