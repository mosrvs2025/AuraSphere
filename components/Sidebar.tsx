import React, { useContext } from 'react';
import { UserContext } from '../context/UserContext';
import { HomeIcon, TrendingIcon, MessagesIcon, ScheduledIcon, ProfileIcon, BellIcon, PlusIcon, StudioIcon } from './Icons';
// FIX: Imported ActiveView from types.ts to resolve type conflict.
import { ActiveView } from '../types';

interface SidebarProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  isExpanded: boolean;
  setExpanded: (isOpen: boolean) => void;
  onCreateContent: () => void;
  unreadNotificationCount: number;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, isExpanded, setExpanded, onCreateContent, unreadNotificationCount }) => {
  const { currentUser } = useContext(UserContext);

  const navItems = [
    { id: 'home', label: 'Discover', icon: <HomeIcon /> },
    { id: 'messages', label: 'Messages', icon: <MessagesIcon /> },
    { id: 'scheduled', label: 'Scheduled', icon: <ScheduledIcon /> },
    { id: 'profile', label: 'Profile', icon: <ProfileIcon /> },
    { id: 'my-studio', label: 'My Studio', icon: <StudioIcon /> },
  ];

  return (
    <aside className={`hidden h-full bg-gray-900 border-r border-gray-800 md:flex flex-col transition-all duration-300 ease-in-out z-40 
      ${isExpanded ? 'w-64' : 'w-20'}`}>
      
      <div className={`p-4 border-b border-gray-800 flex items-center ${isExpanded ? 'justify-start' : 'justify-center'}`}>
         <h1 className={`text-2xl font-bold text-white tracking-tight whitespace-nowrap overflow-hidden ${isExpanded ? '' : 'hidden'}`}>AuraSphere</h1>
         <button onClick={() => setExpanded(!isExpanded)} className={`text-2xl font-bold text-white tracking-tight whitespace-nowrap overflow-hidden ${!isExpanded ? 'block' : 'hidden'}`}>A</button>
      </div>

      <div className={`p-4 ${!isExpanded ? 'px-2' : ''}`}>
          <button 
            onClick={onCreateContent}
            className={`w-full flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-lg transition`}
          >
              <PlusIcon />
              <span className={`${isExpanded ? '' : 'hidden'}`}>Create</span>
          </button>
      </div>

      <nav className={`flex-grow px-4 ${!isExpanded ? 'px-2' : ''}`}>
          <ul className="space-y-2">
              {navItems.map(item => (
                  <li key={item.id}>
                      <button 
                          onClick={() => setActiveView(item.id as ActiveView)}
                          className={`w-full flex items-center space-x-3 p-3 rounded-lg transition ${activeView === item.id ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'} ${!isExpanded ? 'justify-center' : ''}`}
                      >
                          {item.icon}
                          <span className={`font-semibold ${isExpanded ? '' : 'hidden'}`}>{item.label}</span>
                      </button>
                  </li>
              ))}
          </ul>
      </nav>

      <div className="p-4 border-t border-gray-800 space-y-4">
          <button
              onClick={() => setActiveView('notifications')}
              className={`w-full flex items-center space-x-3 p-3 rounded-lg transition relative ${activeView === 'notifications' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'} ${!isExpanded ? 'justify-center' : ''}`}
          >
              <BellIcon />
              <span className={`font-semibold ${isExpanded ? '' : 'hidden'}`}>Notifications</span>
               {unreadNotificationCount > 0 && <span className={`absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-gray-900 ${!isExpanded ? 'top-2 right-auto' : ''}`}></span>}
          </button>
          <button 
            onClick={() => setActiveView('profile')}
            className={`w-full flex items-center space-x-3 cursor-pointer group p-2 rounded-lg hover:bg-gray-800 text-left ${!isExpanded ? 'justify-center' : ''}`}
          >
              <img src={currentUser.avatarUrl} alt={currentUser.name} className="h-10 w-10 rounded-full flex-shrink-0"/>
              <div className={`${isExpanded ? '' : 'hidden'}`}>
                  <p className="font-semibold text-sm text-white group-hover:text-indigo-400 transition">{currentUser.name}</p>
                  <p className="text-xs text-gray-500">View settings</p>
              </div>
          </button>
      </div>
    </aside>
  );
};

export default Sidebar;