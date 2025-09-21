import React, { useState } from 'react';
import { PlusIcon, StudioIcon, DocumentTextIcon } from './Icons';

interface FabCreateMenuProps {
  onStartRoom: () => void;
  onNewPost: () => void;
}

const FabCreateMenu: React.FC<FabCreateMenuProps> = ({ onStartRoom, onNewPost }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    const menuItems = [
        { label: 'New Post', icon: <DocumentTextIcon className="w-6 h-6" />, action: onNewPost },
        { label: 'Start Room', icon: <StudioIcon className="w-6 h-6" />, action: onStartRoom },
    ];

    const handleAction = (action: () => void) => {
        action();
        setIsOpen(false);
    };

    return (
        <div className="fixed bottom-20 right-4 z-30 md:hidden">
            <div className="relative flex flex-col items-center gap-3">
                {isOpen && (
                    <div className="flex flex-col items-center gap-3 animate-fade-in">
                        {menuItems.map((item, index) => (
                            <div key={item.label} className="flex items-center gap-3">
                                <span className="bg-gray-800/80 text-white text-sm px-3 py-1 rounded-md shadow-lg">{item.label}</span>
                                <button
                                    onClick={() => handleAction(item.action)}
                                    className="w-12 h-12 bg-gray-700 hover:bg-gray-600 text-white rounded-full flex items-center justify-center shadow-md"
                                    style={{ transitionDelay: `${index * 30}ms`}}
                                >
                                    {item.icon}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-16 h-16 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full flex items-center justify-center shadow-lg transform transition-transform hover:scale-110"
                    aria-label="Create new content"
                >
                    <div className={`transform transition-transform duration-300 ${isOpen ? 'rotate-45' : 'rotate-0'}`}>
                        <PlusIcon className="w-8 h-8" />
                    </div>
                </button>
            </div>
        </div>
    );
};

export default FabCreateMenu;
