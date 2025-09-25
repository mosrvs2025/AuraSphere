import React from 'react';
import { HomeIcon, GlobeIcon, PlusIcon, MessagesIcon, UserIcon } from './Icons.tsx';
import { ActiveView } from '../types.ts';

interface BottomNavBarProps {
    onNavigate: (view: 'home' | 'explore' | 'messages' | 'profile') => void;
    onCreate: () => void;
    activeView: ActiveView['view'];
}

const BottomNavBar: React.FC<BottomNavBarProps> = ({ onNavigate, onCreate, activeView }) => {
    const navItems = [
        { view: 'home', icon: <HomeIcon />, label: 'Home' },
        { view: 'explore', icon: <GlobeIcon />, label: 'Explore' },
        // Placeholder for the create button
        { view: 'create', icon: null, label: 'Create' }, 
        { view: 'messages', icon: <MessagesIcon />, label: 'Messages' },
        { view: 'profile', icon: <UserIcon />, label: 'Profile' },
    ] as const;

    const mainTabs = ['home', 'explore', 'messages', 'profile'];
    const activeTab = mainTabs.includes(activeView as any) ? activeView : null;

    return (
        <div className="bg-gray-800/80 backdrop-blur-sm border-t border-gray-700/50">
            <nav className="flex justify-around items-center h-16">
                {navItems.map((item) => {
                    if (item.view === 'create') {
                        return (
                            <div key="create-button-container" className="flex-1 flex justify-center items-center">
                                <button
                                    onClick={onCreate}
                                    className="w-16 h-16 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full flex items-center justify-center shadow-lg transform -translate-y-4 transition-transform duration-300 ease-in-out hover:scale-110"
                                    aria-label="Create new content"
                                >
                                    <PlusIcon className="w-8 h-8" />
                                </button>
                            </div>
                        );
                    }
                    
                    return (
                        <button
                            key={item.view}
                            onClick={() => onNavigate(item.view)}
                            className={`flex-1 flex justify-center items-center h-full transition-colors relative ${
                                activeTab === item.view ? 'text-indigo-400' : 'text-gray-400 hover:text-white'
                            }`}
                            aria-label={item.label}
                        >
                            <div className="w-7 h-7">{item.icon}</div>
                        </button>
                    )
                })}
            </nav>
        </div>
    );
};

export default BottomNavBar;
