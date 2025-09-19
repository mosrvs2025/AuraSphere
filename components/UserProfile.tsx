// Implemented the UserProfile component for displaying participant avatars and names.
import React from 'react';
import { User } from '../types';

interface UserProfileProps {
  user: User;
  isListener?: boolean;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, isListener }) => {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative">
        <img
          src={user.avatarUrl}
          alt={user.name}
          className={`w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border-2 ${
            isListener ? 'border-gray-700' : 'border-indigo-500'
          }`}
        />
      </div>
      <p className="mt-2 text-sm font-semibold text-white truncate w-20">{user.name}</p>
    </div>
  );
};

export default UserProfile;
