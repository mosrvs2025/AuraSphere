import React from 'react';
import { ActiveView } from '../types';
import { HomeIcon, SearchIcon, MessagesIcon, ProfileIcon } from './Icons';

interface BottomNavBarProps {
  activeView: ActiveView;
  onNavigate: (view: ActiveView) => void;
  onSearchClick: () => void;
}

const NavItem: React.FC<{
    label: string;
    icon: React.ReactNode;
    isActive: boolean;
    onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex flex-col items-center justify-center w-full pt-2 pb-1 transition-colors duration-200 ${isActive ? 'text-white' : 'text-gray-400 hover:text-white'}`}
        aria-label={label}
    >
        <div className="w-7 h-7">{icon}</div>
        <span className="text-xs mt-1">{label}</span>
    </button>
);

const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeView, onNavigate, onSearchClick }) => {
    const navItems: { id: ActiveView, label: string, icon: React.ReactNode, action?: () => void }[] = [
        { id: 'home', label: 'Home', icon: <HomeIcon /> },
        { id: 'search', label: 'Search', icon: <SearchIcon />, action: onSearchClick },
        { id: 'messages', label: 'Messages', icon: <MessagesIcon /> },
        { id: 'profile', label: 'Profile', icon: <ProfileIcon /> }
    ];

    return (
        <nav className="flex-shrink-0 bg-gray-900/80 backdrop-blur-sm border-t border-gray-800/50 flex justify-around">
            {navItems.map(item => (
                <NavItem 
                    key={item.id}
                    label={item.label}
                    icon={item.icon}
                    isActive={activeView === item.id}
                    onClick={item.action ? item.action : () => onNavigate(item.id)}
                />
            ))}
        </nav>
    );
};

export default BottomNavBar;
