import React, { useContext } from 'react';
import { UserContext } from '../context/UserContext';
import { HomeIcon, TrendingIcon, MessagesIcon, ScheduledIcon, ProfileIcon, BellIcon, PlusIcon, StudioIcon } from './Icons';

type ActiveView = 'home' | 'trending' | 'messages' | 'scheduled' | 'profile' | 'notifications' | 'my-studio';

interface SidebarProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  isSidebarOpen: boolean;
  setSidebarOpen: (isOpen: boolean) => void;
  onCreateRoom: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, isSidebarOpen, setSidebarOpen, onCreateRoom }) => {
  const { currentUser } = useContext(UserContext);

  const navItems = [
    { id: 'home', label: 'Home', icon: <HomeIcon /> },
    { id: 'trending', label: 'Trending', icon: <TrendingIcon /> },
    { id: 'messages', label: 'Messages', icon: <MessagesIcon /> },
    { id: 'scheduled', label: 'Scheduled', icon: <ScheduledIcon /> },
    { id: 'profile', label: 'Profile', icon: <ProfileIcon /> },
    { id: 'my-studio', label: 'My Studio', icon: <StudioIcon /> },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      <div 
        className={`fixed inset-0 bg-black/60 z-30 md:hidden ${isSidebarOpen ? 'block' : 'hidden'}`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      ></div>

      <aside className={`fixed top-0 left-0 h-full w-64 bg-gray-900 border-r border-gray-800 flex-col flex transition-transform duration-300 ease-in-out z-40 md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 border-b border-gray-800">
           <h1 className="text-2xl font-bold text-white tracking-tight">AuraSphere</h1>
        </div>

        <div className="p-4">
            <button 
              onClick={onCreateRoom}
              className="w-full flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-lg transition"
            >
                <PlusIcon />
                <span>Create Room</span>
            </button>
        </div>

        <nav className="flex-grow px-4">
            <ul className="space-y-2">
                {navItems.map(item => (
                    <li key={item.id}>
                        <button 
                            onClick={() => setActiveView(item.id as ActiveView)}
                            className={`w-full flex items-center space-x-3 p-3 rounded-lg transition ${activeView === item.id ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                        >
                            {item.icon}
                            <span className="font-semibold">{item.label}</span>
                        </button>
                    </li>
                ))}
            </ul>
        </nav>

        <div className="p-4 border-t border-gray-800 space-y-4">
            <button
                onClick={() => setActiveView('notifications')}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg transition ${activeView === 'notifications' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
            >
                <BellIcon />
                <span className="font-semibold">Notifications</span>
                 {/* Notification dot */}
                <span className="ml-auto w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button 
              onClick={() => setActiveView('profile')}
              className="w-full flex items-center space-x-3 cursor-pointer group p-2 rounded-lg hover:bg-gray-800 text-left"
            >
                <img src={currentUser.avatarUrl} alt={currentUser.name} className="h-10 w-10 rounded-full"/>
                <div>
                    <p className="font-semibold text-sm text-white group-hover:text-indigo-400 transition">{currentUser.name}</p>
                    <p className="text-xs text-gray-500">View settings</p>
                </div>
            </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;