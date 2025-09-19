
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
    onSearchClick, 
    liveRooms, 
    onEnterRoom, 
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
  
  return (
    <>
      {/* Section 1: This part scrolls out of view */}
      <div className="bg-gray-900 z-10">
        <div className="px-4 md:px-6 py-4 md:pt-6">
          <div className="max-w-6xl mx-auto">
              <div className="flex justify-between items-center">
                  <div className="flex-1 flex justify-start">
                      {/* Placeholder for balance */}
                  </div>

                  <div className="flex items-center gap-4 min-w-0">
                      <h1 className="font-bold text-center truncate text-3xl">{title}</h1>
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
          <div className="max-w-6xl mx-auto px-4 md:px-6 mt-4">
            <LiveActivityRail liveRooms={liveRooms} onEnterRoom={onEnterRoom} />
          </div>
        )}
      </div>
      
      {/* Section 2: This part sticks to the top on scroll (Home view only) */}
      {isHome && (
        <div className="sticky top-0 z-20 bg-gray-900/80 backdrop-blur-sm border-b border-gray-800/50">
          <div className="max-w-6xl mx-auto px-4 md:px-6">
            {/* Primary Curation Tabs */}
            <div className="flex justify-center border-b border-gray-800">
              <button
                  onClick={() => setCurationTab('forYou')}
                  className={`px-6 py-3 font-bold text-lg transition-colors ${curationTab === 'forYou' ? 'text-white border-b-2 border-white' : 'text-gray-500 hover:text-gray-300'}`}
              >
                  For You
              </button>
              <button
                  onClick={() => setCurationTab('following')}
                  className={`px-6 py-3 font-bold text-lg transition-colors ${curationTab === 'following' ? 'text-white border-b-2 border-white' : 'text-gray-500 hover:text-gray-300'}`}
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
        </div>
      )}
    </>
  );
};

export default GlobalHeader;
