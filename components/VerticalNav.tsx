import React from 'react';
import { HomeIcon, ImageIcon, VideoCameraIcon, MicIcon, DocumentTextIcon } from './Icons';

interface VerticalNavProps {
  isOpen: boolean;
  onClose: () => void;
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

const VerticalNav: React.FC<VerticalNavProps> = ({ isOpen, onClose, activeMediaType, setActiveMediaType }) => {
  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 z-30 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      
      {/* Panel */}
      <aside
        className={`fixed top-0 left-0 h-full bg-gray-900 border-r border-gray-800 flex flex-col items-center py-4 z-40 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 flex-shrink-0">
          <div className="text-2xl font-bold text-white">A</div>
        </div>
        
        <nav className="flex-grow w-56 p-4">
          <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">Media Type</p>
          <ul className="space-y-1">
            {mediaTypes.map(item => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveMediaType(item.id)}
                  className={`w-full flex items-center space-x-4 p-3 rounded-lg transition-colors group text-left ${
                    activeMediaType === item.id ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                  aria-label={item.label}
                >
                  <div className="w-6 h-6">{item.icon}</div>
                  <span className="text-base font-semibold">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default VerticalNav;