
import React from 'react';
import { DiscoverItem } from '../types';
import { HomeIcon, ImageIcon, VideoCameraIcon, MicIcon, DocumentTextIcon, LiveIcon } from './Icons';

interface VerticalNavProps {
  isOpen: boolean;
  onClose: () => void;
  activeFilter: DiscoverItem['type'] | 'All';
  onFilterChange: (filter: DiscoverItem['type'] | 'All') => void;
  isLiveFilterActive: boolean;
  onToggleLiveFilter: () => void;
}

const filterOptions: { id: DiscoverItem['type'] | 'All', label: string, icon: React.ReactNode }[] = [
    { id: 'All', label: 'All Media', icon: <HomeIcon /> },
    { id: 'image_post', label: 'Images', icon: <ImageIcon /> },
    { id: 'video_post', label: 'Video', icon: <VideoCameraIcon /> },
    { id: 'voice_note_post', label: 'Audio', icon: <MicIcon /> },
    { id: 'text_post', label: 'Text', icon: <DocumentTextIcon /> },
];

const VerticalNav: React.FC<VerticalNavProps> = ({ isOpen, onClose, activeFilter, onFilterChange, isLiveFilterActive, onToggleLiveFilter }) => {

    const handleFilterClick = (filter: DiscoverItem['type'] | 'All') => {
        onFilterChange(filter);
        onClose();
    };
    
    const handleLiveClick = () => {
        onToggleLiveFilter();
        onClose();
    }

    return (
        <>
            {/* Backdrop */}
            <div 
                className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            ></div>
            {/* Panel */}
            <nav className={`fixed top-0 left-0 bottom-0 w-64 flex-shrink-0 bg-gray-900/80 backdrop-blur-md border-r border-gray-800/50 p-4 flex flex-col z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="font-bold text-2xl text-white mb-8">Filter Content</div>
                <div className="space-y-2">
                    <button
                        onClick={handleLiveClick}
                        className={`flex items-center w-full p-3 rounded-lg transition-all duration-200 ${
                            isLiveFilterActive 
                                ? `bg-indigo-600 text-white shadow-lg` 
                                : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                        }`}
                        aria-label="Toggle Live Mode"
                    >
                        <div className={`w-7 h-7 mr-4 relative flex items-center justify-center`}>
                           <LiveIcon className={isLiveFilterActive ? 'animate-pulse-live-indicator' : ''} />
                        </div>
                        <span className="font-semibold">Live Activity</span>
                    </button>
                    <hr className="my-2 border-gray-700/50" />
                    {filterOptions.map(item => (
                       <button
                            key={item.id}
                            onClick={() => handleFilterClick(item.id)}
                            disabled={isLiveFilterActive} // Disable other filters when live mode is on
                            className={`flex items-center w-full p-3 rounded-lg transition-colors duration-200 ${
                                activeFilter === item.id && !isLiveFilterActive
                                    ? 'bg-indigo-600 text-white' 
                                    : 'text-gray-300 hover:text-white hover:bg-gray-700/50 disabled:text-gray-600 disabled:hover:bg-transparent'
                            }`}
                            aria-label={item.label}
                        >
                            <div className="w-7 h-7 mr-4">{item.icon}</div>
                            <span className="font-semibold">{item.label}</span>
                        </button>
                    ))}
                </div>
            </nav>
        </>
    );
};

export default VerticalNav;
