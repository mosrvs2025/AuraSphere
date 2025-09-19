// Implemented the main Header component with navigation controls.
import React from 'react';
import { MenuIcon, SearchIcon } from './Icons';

interface HeaderProps {
  onToggleSidebar: () => void;
  onSearchClick: () => void;
  title?: string;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar, onSearchClick, title }) => {
  return (
    <header className="flex-shrink-0 bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 flex items-center justify-between p-4 h-16">
      <div className="flex items-center space-x-4">
        <button onClick={onToggleSidebar} className="text-gray-400 hover:text-white">
          <MenuIcon />
        </button>
        {title && <h1 className="text-xl font-bold">{title}</h1>}
      </div>
      <div className="flex items-center space-x-4">
        <button onClick={onSearchClick} className="text-gray-400 hover:text-white">
            <SearchIcon />
        </button>
      </div>
    </header>
  );
};

export default Header;