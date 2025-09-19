import React from 'react';
import AnimatedHamburgerIcon from './AnimatedHamburgerIcon';
import { SearchIcon } from './Icons';

interface HeaderProps {
  isSidebarExpanded: boolean;
  onToggleSidebar: () => void;
  onSearchClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ isSidebarExpanded, onToggleSidebar, onSearchClick }) => {
  return (
    <header className="sticky top-0 bg-gray-900/70 backdrop-blur-sm z-20 md:hidden">
      <div className="flex items-center justify-between p-2 border-b border-gray-800">
        <AnimatedHamburgerIcon isOpen={isSidebarExpanded} onClick={onToggleSidebar} />
        <h1 className="text-xl font-bold text-white">AuraSphere</h1>
        <button 
          onClick={onSearchClick}
          className="p-3 text-gray-300 hover:text-white"
          aria-label="Search"
        >
          <SearchIcon />
        </button>
      </div>
    </header>
  );
};

export default Header;
