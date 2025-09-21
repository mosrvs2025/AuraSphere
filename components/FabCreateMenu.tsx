
import React, { useState, useRef } from 'react';
import { PlusIcon, StudioIcon, VideoCameraIcon, ImageIcon, MicIcon, DocumentTextIcon } from './Icons.tsx';
import { DiscoverItem } from '../types';

interface FabCreateMenuProps {
  onStartRoom: () => void;
  onNewImagePost: () => void;
  onNewVideoPost: () => void;
  onNewVoiceNote: () => void;
  onNewTextPost: () => void;
  activeFilter: DiscoverItem['type'] | 'All';
}

const FabCreateMenu: React.FC<FabCreateMenuProps> = (props) => {
    const { onStartRoom, onNewImagePost, onNewVideoPost, onNewVoiceNote, onNewTextPost, activeFilter } = props;
    const [isOpen, setIsOpen] = useState(false);
    
    const menuItems = [
        { label: 'Text Post', icon: <DocumentTextIcon className="w-6 h-6" />, action: onNewTextPost, filterMatch: 'text_post' },
        { label: 'Voice Note', icon: <MicIcon className="w-6 h-6" />, action: onNewVoiceNote, filterMatch: 'voice_note_post' },
        { label: 'Post Image', icon: <ImageIcon className="w-6 h-6" />, action: onNewImagePost, filterMatch: 'image_post' },
        { label: 'Post Video', icon: <VideoCameraIcon className="w-6 h-6" />, action: onNewVideoPost, filterMatch: 'video_post' },
        { label: 'Go Live', icon: <StudioIcon className="w-6 h-6" />, action: onStartRoom, filterMatch: 'live_room' },
    ];

    const handleAction = (action: () => void) => {
        action();
        setIsOpen(false);
    };

    const isFilterPriority = (filterMatch: string) => {
        return activeFilter === filterMatch;
    }

    return (
        <div className="fixed bottom-24 right-4 z-30 md:hidden">
            <div className="relative flex flex-col items-center">
                 {/* Menu items */}
                <div 
                    className={`absolute bottom-0 right-0 transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                    style={{ transitionProperty: 'opacity, transform', transform: isOpen ? 'translateY(-80px)' : 'translateY(0)' }}
                >
                    <div className="relative w-48 h-48 -bottom-24 -right-24">
                        {menuItems.map((item, index) => {
                            const angle = 180 + (index * (90 / (menuItems.length - 1)));
                            const isPriority = isFilterPriority(item.filterMatch);
                            return (
                                <div
                                    key={item.label}
                                    className="absolute top-1/2 left-1/2 w-12 h-12 -m-6 transform origin-center transition-transform duration-300 ease-in-out"
                                    style={{
                                        transform: isOpen ? `rotate(${angle}deg) translate(80px) rotate(${-angle}deg)` : 'scale(0.5)',
                                        transitionDelay: isOpen ? `${index * 30}ms` : '0ms'
                                    }}
                                >
                                    <button
                                        onClick={() => handleAction(item.action)}
                                        className={`w-12 h-12 text-white rounded-full flex items-center justify-center shadow-md transition-all duration-200 ${
                                            isPriority ? 'bg-indigo-500 scale-110' : 'bg-gray-700 hover:bg-gray-600'
                                        }`}
                                        aria-label={item.label}
                                    >
                                        {item.icon}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Main FAB button */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-16 h-16 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full flex items-center justify-center shadow-lg transform transition-all duration-300 ease-in-out hover:scale-110 z-10"
                    aria-label="Create new content"
                    aria-expanded={isOpen}
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
