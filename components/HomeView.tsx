import React, { useState, useMemo } from 'react';
import { Room, User } from '../types';
import RoomCard from './RoomCard';

interface HomeViewProps {
  rooms: Room[];
  onEnterRoom: (room: Room) => void;
  currentUser: User;
}

const HomeView: React.FC<HomeViewProps> = ({ rooms, onEnterRoom, currentUser }) => {
  const [activeTab, setActiveTab] = useState('For You');
  const tabs = ['For You', 'Trending', 'Newest', 'Following'];

  const getParticipantCount = (room: Room) => {
    return room.listeners.length + room.speakers.length + room.hosts.length;
  };

  const filteredRooms = useMemo(() => {
    // Ensure we only show non-private, non-scheduled rooms
    const availableRooms = rooms.filter(room => !room.isPrivate && !room.isScheduled);
    
    switch (activeTab) {
      case 'Newest':
        return [...availableRooms].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      case 'Trending':
        return [...availableRooms].sort((a, b) => getParticipantCount(b) - getParticipantCount(a));
        
      case 'Following':
        const followingIds = currentUser.following || [];
        return availableRooms.filter(room => 
          room.hosts.some(host => followingIds.includes(host.id))
        );

      case 'For You':
      default:
        return [...availableRooms].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
  }, [rooms, activeTab, currentUser]);

  return (
    <div className="animate-fade-in">
      <header className="p-4 md:p-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white tracking-tight hidden md:block">Home</h1>
        <div className="flex-grow md:hidden"></div> {/* Spacer for mobile */}
        <button className="text-gray-400 hover:text-white transition">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </header>
      <div className="border-b border-gray-800 px-4 md:px-6">
        <nav className="flex space-x-1 md:space-x-4">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 px-2 md:px-4 text-sm font-semibold transition relative ${
                activeTab === tab 
                ? 'text-white' 
                : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-500 rounded-full"></span>
              )}
            </button>
          ))}
        </nav>
      </div>
      <div className="p-4 md:p-6 space-y-4">
        {filteredRooms.length > 0 ? (
          filteredRooms.map(room => (
            <RoomCard key={room.id} room={room} onEnter={() => onEnterRoom(room)} />
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400">No rooms found for this category.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeView;