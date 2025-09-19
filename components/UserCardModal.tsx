// Implemented the UserCardModal for displaying a brief user profile.
import React from 'react';
import { User } from '../types';

interface UserCardModalProps {
  user: User;
  onClose: () => void;
  onViewProfile: (user: User) => void;
}

const UserCardModal: React.FC<UserCardModalProps> = ({ user, onClose, onViewProfile }) => {
  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-gray-800 border border-gray-700 rounded-2xl p-6 w-full max-w-xs m-4 text-white shadow-2xl animate-slide-up text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img src={user.avatarUrl} alt={user.name} className="w-24 h-24 rounded-full mx-auto border-4 border-gray-700" />
        <h3 className="text-xl font-bold mt-4">{user.name}</h3>
        <div className="flex items-center justify-center space-x-6 my-3 text-gray-400">
          <div><span className="font-bold text-white">{user.followers?.length ?? 0}</span> Followers</div>
          <div><span className="font-bold text-white">{user.following?.length ?? 0}</span> Following</div>
        </div>
        <p className="text-sm text-gray-300 mb-6">{user.bio || 'No bio provided.'}</p>
        <div className="flex flex-col space-y-3">
          <button onClick={() => onViewProfile(user)} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-full transition">
            View Profile
          </button>
           <button className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-full transition">
            Follow
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserCardModal;
