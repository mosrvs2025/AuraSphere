import React from 'react';
import { User, Room } from '../types';
import RoomCard from './RoomCard';

interface ProfileViewProps {
  user: User;
  allRooms: Room[];
}

const ProfileView: React.FC<ProfileViewProps> = ({ user, allRooms }) => {
  const userHostedRooms = allRooms.filter(room => room.hosts.some(host => host.id === user.id));

  return (
    <div className="p-4 md:p-8 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-6 md:gap-8">
          <img 
            src={user.avatarUrl} 
            alt={user.name}
            className="w-32 h-32 rounded-full border-4 border-gray-700 shadow-lg"
          />
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-white tracking-tight">{user.name}</h1>
            <div className="flex items-center justify-center md:justify-start space-x-6 mt-3 text-gray-400">
              <div><span className="font-bold text-white">{user.followers?.length ?? 0}</span> Followers</div>
              <div><span className="font-bold text-white">{user.following?.length ?? 0}</span> Following</div>
            </div>
            <p className="text-gray-300 mt-4 max-w-lg">{user.bio || 'No bio provided.'}</p>
            <button className="mt-6 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-5 rounded-full text-sm transition">
              Edit Profile
            </button>
          </div>
        </div>

        {/* Past Rooms */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-white mb-4">Past Rooms</h2>
          {userHostedRooms.length > 0 ? (
            <div className="space-y-4">
              {userHostedRooms.map(room => (
                <RoomCard key={room.id} room={room} onEnter={() => { /* In-profile navigation not implemented */}} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-800/50 rounded-lg border border-gray-700">
              <p className="text-gray-400">{user.name} hasn't hosted any rooms yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileView;