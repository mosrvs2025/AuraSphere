
import React from 'react';
import { HomeIcon, GlobeIcon, LiveIcon, MessagesIcon, UserIcon } from './Icons.tsx';
import { ActiveView } from '../types.ts';

interface BottomNavBarProps {
    onNavigate: (view: 'home' | 'explore' | 'rooms' | 'messages' | 'profile') => void;
    activeView: ActiveView['view'];
}

const BottomNavBar: React.FC<BottomNavBarProps> = ({ onNavigate, activeView }) => {
    const navItems = [
        { view: 'home', icon: <HomeIcon /> },
        { view: 'explore', icon: <GlobeIcon /> },
        { view: 'rooms', icon: <LiveIcon /> },
        { view: 'messages', icon: <MessagesIcon /> },
        { view: 'profile', icon: <UserIcon /> },
    ] as const;

    const mainTabs = navItems.map(item => item.view);
    const activeTab = mainTabs.includes(activeView as any) ? activeView : null;

    return (
        <div className="bg-gray-800/80 backdrop-blur-sm border-t border-gray-700/50">
            <nav className="flex justify-around items-center h-16">
                {navItems.map(item => (
                    <button
                        key={item.view}
                        onClick={() => onNavigate(item.view)}
                        className={`flex-1 flex justify-center items-center h-full transition-colors relative ${
                            activeTab === item.view ? 'text-indigo-400' : 'text-gray-400 hover:text-white'
                        }`}
                        aria-label={item.view}
                    >
                        <div className="w-7 h-7">{item.icon}</div>
                    </button>
                ))}
            </nav>
        </div>
    );
};

export default BottomNavBar;
