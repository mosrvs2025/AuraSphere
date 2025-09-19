import React from 'react';
import { MenuIcon, SearchIcon } from './Icons';

interface HeaderProps {
  title: string;
  onMenuClick: () => void;
  showSearch?: boolean;
}

const Header: React.FC<HeaderProps> = ({ title, onMenuClick, showSearch }) => {
  return (
    <header className="flex-shrink-0 bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 h-16 flex items-center justify-between px-4 md:px-6 sticky top-0 z-10">
      <div className="flex items-center space-x-4">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 -ml-2 text-gray-400 hover:text-white"
          aria-label="Open sidebar"
        >
          <MenuIcon />
        </button>
        <h1 className="text-xl font-bold text-white tracking-tight">{title}</h1>
      </div>
      
      {showSearch && (
        <button className="p-2 text-gray-400 hover:text-white" aria-label="Search">
            <SearchIcon />
        </button>
      )}
    </header>
  );
};

export default Header;