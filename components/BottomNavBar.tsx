
import React from 'react';
import { HomeIcon, SearchIcon, MessagesIcon, BellIcon, UserIcon } from './Icons.tsx';

interface BottomNavBarProps {
    onNavigate: (view: 'home' | 'search' | 'messages' | 'notifications' | 'profile') => void;
    unreadNotifications: number;
}

const BottomNavBar: React.FC<BottomNavBarProps> = ({ onNavigate, unreadNotifications }) => {
    const navItems = [
        { view: 'home', icon: <HomeIcon /> },
        { view: 'search', icon: <SearchIcon /> },
        { view: 'messages', icon: <MessagesIcon /> },
        { view: 'notifications', icon: <BellIcon />, badge: unreadNotifications },
        { view: 'profile', icon: <UserIcon /> },
    ] as const;

    return (
        <div className="bg-gray-800/80 backdrop-blur-sm border-t border-gray-700/50">
            <nav className="flex justify-around items-center h-16">
                {navItems.map(item => (
                    <button
                        key={item.view}
                        onClick={() => onNavigate(item.view)}
                        className="flex-1 flex justify-center items-center text-gray-400 hover:text-indigo-400 transition-colors relative h-full"
                        aria-label={item.view}
                    >
                        <div className="w-7 h-7">{item.icon}</div>
                        {/* FIX: Add type guard to check for existence of 'badge' property before accessing it. */}
                        {'badge' in item && item.badge > 0 && (
                            <span className="absolute top-3 right-[28%] bg-red-600 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center text-[10px]">
                                {item.badge}
                            </span>
                        )}
                    </button>
                ))}
            </nav>
        </div>
    );
};

export default BottomNavBar;