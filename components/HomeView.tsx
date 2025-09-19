import React, { useState } from 'react';
import { Room } from '../types';
import RoomCard from './RoomCard';

interface HomeViewProps {
  rooms: Room[];
  onEnterRoom: (room: Room) => void;
}

const HomeView: React.FC<HomeViewProps> = ({ rooms, onEnterRoom }) => {
  const [activeTab, setActiveTab] = useState('For You');
  const tabs = ['For You', 'Trending', 'Newest', 'Following'];

  return (
    <div className="animate-fade-in">
      <header className="p-4 md:p-6">
        <h1 className="text-3xl font-bold text-white tracking-tight hidden md:block">Home</h1>
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
        {rooms.map(room => (
          <RoomCard key={room.id} room={room} onEnter={() => onEnterRoom(room)} />
        ))}
      </div>
    </div>
  );
};

export default HomeView;
