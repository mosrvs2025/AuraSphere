import React, { useContext, useState } from 'react';
import { User } from '../types';
import { UserContext } from '../context/UserContext';
import AvatarCustomizer from './AvatarCustomizer';

interface UserProfileProps {
  user: User;
  isSpeaking?: boolean;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, isSpeaking }) => {
  const { currentUser, updateUserAvatar } = useContext(UserContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const isCurrentUser = user.id === currentUser.id;

  const handleAvatarSelect = (url: string, isGenerated: boolean) => {
    updateUserAvatar(url, isGenerated);
    setIsModalOpen(false);
  };

  const speakingClasses = isSpeaking ? 'ring-4 ring-offset-2 ring-offset-gray-800 ring-green-400 animate-pulse' : '';
  const avatarClasses = `h-16 w-16 rounded-full border-2 shadow-lg mb-1 object-cover ${isCurrentUser ? 'border-indigo-500 cursor-pointer hover:opacity-80 transition-opacity' : 'border-gray-600'} ${speakingClasses}`;

  return (
    <>
      <div className="flex flex-col items-center text-center">
        {isCurrentUser ? (
          <button onClick={() => setIsModalOpen(true)} className="rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500">
            <img src={user.avatarUrl} alt={user.name} className={avatarClasses} />
          </button>
        ) : (
          <img src={user.avatarUrl} alt={user.name} className={avatarClasses} />
        )}
        <p className="text-xs font-medium text-gray-300 truncate w-full">{user.name}</p>
      </div>

      {isModalOpen && (
        <AvatarCustomizer 
          onClose={() => setIsModalOpen(false)}
          onAvatarSelect={handleAvatarSelect}
        />
      )}
    </>
  );
};

export default UserProfile;