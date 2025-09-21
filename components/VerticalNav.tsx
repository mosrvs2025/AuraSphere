import React from 'react';
import { HomeIcon, ImageIcon, VideoCameraIcon, MicIcon, DocumentTextIcon } from './Icons';
import { ActiveView, User } from '../types';

interface VerticalNavProps {
  activeMediaType: string;
  setActiveMediaType: (mediaType: string) => void;
}

const mediaTypes = [
  { id: 'All', label: 'Discover', icon: <HomeIcon /> },
  { id: 'Images', label: 'Images', icon: <ImageIcon /> },
  { id: 'Video', label: 'Video', icon: <VideoCameraIcon /> },
  { id: 'Audio', label: 'Audio', icon: <MicIcon /> },
  { id: 'Text', label: 'Text', icon: <DocumentTextIcon /> },
];

const VerticalNav: React.FC<VerticalNavProps> = ({ activeMediaType, setActiveMediaType }) => {

  return (
    <aside className="h-full bg-black border-r border-gray-800 flex flex-col items-center py-4 w-20 z-30 flex-shrink-0">
      <div className="text-2xl font-bold text-white mb-8">A</div>
      
      <nav className="flex-grow">
        <ul className="space-y-2">
          {mediaTypes.map(item => (
            <li key={item.id}>
              <button
                onClick={() => setActiveMediaType(item.id)}
                className={`w-16 h-16 flex flex-col items-center justify-center rounded-2xl transition-colors group ${
                  activeMediaType === item.id ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
                aria-label={item.label}
              >
                <div className="w-6 h-6">{item.icon}</div>
                <span className="text-xs mt-1 font-semibold">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default VerticalNav;