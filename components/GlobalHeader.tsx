import React from 'react';
import { ActiveView, Room } from '../types';
import { SearchIcon, BellIcon } from './Icons';

interface GlobalHeaderProps {
  activeView: ActiveView;
  curationTab: 'forYou' | 'following';
  setCurationTab: (tab: 'forYou' | 'following') => void;
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
  unreadNotificationCount: number;
  onNavigateToNotifications: () => void;
  onNavigateToLive: () => void;
  hasActiveLiveRooms: boolean;
  onSearchClick: () => void;
  liveRooms: Room[];
  onEnterRoom: (room: Room) => void;
  isScrolled: boolean;
}

const contentFilters = ['All', 'Live', 'People', 'Images', 'Videos', 'Posts'];

const LiveActivityRail: React.FC<{ liveRooms: Room[]; onEnterRoom: (room: Room) => void; }> = ({ liveRooms, onEnterRoom }) => {
    if (liveRooms.length === 0) {
        return null;
    }

    const uniqueHostsInRooms = new Map<string, Room>();
    liveRooms.forEach(room => {
        room.hosts.forEach(host => {
            if (!uniqueHostsInRooms.has(host.id)) {
                uniqueHostsInRooms.set(host.id, room);
            }
        });
    });

    return (
        <div className="flex items-center space-x-4 overflow-x-auto pb-3 -mx-4 px-4 scrollbar-hide">
            {Array.from(uniqueHostsInRooms.entries()).map(([hostId, room]) => {
                const host = room.hosts.find(h => h.id === hostId);
                if (!host) return null;
                return (
                    <button key={host.id} onClick={() => onEnterRoom(room)} className="flex flex-col items-center space-y-2 flex-shrink-0 w-20 text-center focus:outline-none group">
                        <div className="relative">
                            <img 
                                src={host.avatarUrl} 
                                alt={host.name} 
                                className="w-16 h-16 rounded-full border-2 border-gray-700 group-hover:border-indigo-500 transition-colors" 
                            />
                            <div className="absolute -bottom-1 -right-1 bg-red-500 text-white text-xs font-bold uppercase px-1.5 py-0.5 rounded-md border-2 border-gray-900">
                                Live
                            </div>
                            <div className="absolute inset-0 rounded-full animate-pulse-live pointer-events-none"></div>
                        </div>
                        <p className="text-xs text-white font-semibold truncate w-full">{host.name}</p>
                    </button>
                )
            })}
        </div>
    );
};


const GlobalHeader: React.FC<GlobalHeaderProps> = ({ 
    activeView, 
    curationTab, 
    setCurationTab,
    activeFilter, 
    setActiveFilter,
    unreadNotificationCount, 
    onNavigateToNotifications, 
    onNavigateToLive, 
    hasActiveLiveRooms, 
    onSearchClick, 
    liveRooms, 
    onEnterRoom, 
    isScrolled 
}) => {
  const isHome = activeView === 'home';
  let title = '';

  if (isHome) {
    if (activeFilter === 'All') {
      title = curationTab === 'following' ? 'Following' : 'Discover';
    } else if (activeFilter === 'Live') {
      title = 'Live Now';
    } else {
      title = activeFilter; // People, Images, Videos, Posts
    }
  } else {
    switch (activeView) {
      case 'messages':
        title = 'Messages';
        break;
      case 'scheduled':
        title = 'Content Planner';
        break;
      case 'profile':
        title = 'Profile';
        break;
      case 'notifications':
        title = 'Notifications';
        break;
      case 'my-studio':
        title = 'My Studio';
        break;
    }
  }

  const uniqueHostsInRooms = new Map<string, Room>();
    liveRooms.forEach(room => {
        room.hosts.forEach(host => {
            if (!uniqueHostsInRooms.has(host.id)) {
                uniqueHostsInRooms.set(host.id, room);
            }
        });
    });
  const collapsedHosts = Array.from(uniqueHostsInRooms.entries()).slice(0, 4);

  return (
    <header className={`sticky top-0 flex-shrink-0 border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm z-10 transition-all duration-300 ease-in-out`}>
        <div className={`px-4 md:px-6 transition-all duration-300 ease-in-out ${isScrolled && isHome ? 'py-3' : 'py-4 md:pt-6'}`}>
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center">
                    <div className="flex-1 flex justify-start">
                        {/* The redundant LIVE button was here. It has been removed, but the container remains to ensure the title stays centered. */}
                    </div>

                    <div className="flex items-center gap-4 transition-all duration-300 ease-in-out min-w-0">
                        <h1 className={`font-bold text-center truncate transition-all duration-300 ease-in-out ${isScrolled && isHome ? 'text-2xl' : 'text-3xl'}`}>{title}</h1>
                        
                        {/* Collapsed Avatars */}
                        <div className={`flex items-center transition-all duration-300 ease-in-out ${isScrolled && isHome && collapsedHosts.length > 0 ? 'visible opacity-100 w-auto -space-x-2' : 'invisible opacity-0 w-0'}`}>
                        {collapsedHosts.map(([hostId, room]) => {
                            const host = room.hosts.find(h => h.id === hostId);
                            if (!host) return null;
                            return (
                                <button key={host.id} onClick={() => onEnterRoom(room)} className="focus:outline-none flex-shrink-0">
                                    <img src={host.avatarUrl} alt={host.name} className="w-8 h-8 rounded-full border-2 border-gray-900 hover:z-10 hover:scale-110 transition-transform"/>
                                </button>
                            );
                        })}
                        </div>
                    </div>
                    
                    <div className="flex-1 flex justify-end items-center space-x-2">
                        <button 
                            onClick={onSearchClick}
                            className="p-2 text-gray-400 hover:text-white transition-colors"
                            aria-label="Search"
                        >
                            <SearchIcon className="h-6 w-6" />
                        </button>
                        <button
                        onClick={onNavigateToNotifications}
                        className="relative p-2 text-gray-400 hover:text-white transition-colors"
                        aria-label="View notifications"
                        >
                            <BellIcon className="h-7 w-7" />
                            {unreadNotificationCount > 0 && (
                                <span className="absolute top-1.5 right-1.5 block h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-gray-900"></span>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>

        {isHome && (
            <>
                <div className={`max-w-6xl mx-auto px-4 md:px-6 transition-all duration-300 ease-in-out ${isScrolled ? 'max-h-0 opacity-0 mt-0 overflow-hidden invisible' : 'max-h-48 opacity-100 mt-4 visible'}`}>
                    <LiveActivityRail liveRooms={liveRooms} onEnterRoom={onEnterRoom} />
                </div>
                {/* Sticky Navigation Bar */}
                <div className="max-w-6xl mx-auto px-4 md:px-6">
                    {/* Primary Curation Tabs */}
                    <div className="flex justify-center border-b border-gray-800">
                        <button
                            onClick={() => setCurationTab('forYou')}
                            className={`px-6 py-3 font-bold text-lg transition-colors ${curationTab === 'forYou' ? 'text-white border-b-2 border-white' : 'text-gray-500'}`}
                        >
                            For You
                        </button>
                        <button
                            onClick={() => setCurationTab('following')}
                            className={`px-6 py-3 font-bold text-lg transition-colors ${curationTab === 'following' ? 'text-white border-b-2 border-white' : 'text-gray-500'}`}
                        >
                            Following
                        </button>
                    </div>
                    {/* Secondary Content-Type Filters */}
                    <div className="mt-4 pb-2">
                        <div className="flex items-center space-x-2 overflow-x-auto -mx-4 px-4 scrollbar-hide">
                            {contentFilters.map(filter => (
                                <button
                                    key={filter}
                                    onClick={() => setActiveFilter(filter)}
                                    className={`px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition ${
                                        activeFilter === filter
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                    }`}
                                >
                                    {filter}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </>
        )}
    </header>
  );
};

export default GlobalHeader;
