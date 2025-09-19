import React, { useContext, useState } from 'react';
import { User } from '../types';
import { UserContext } from '../context/UserContext';
import AvatarCustomizer from './AvatarCustomizer';

interface UserProfileProps {
  user: User;
  isSpeaking?: boolean;
  showPromoteButton?: boolean;
  onPromote?: (userId: string) => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, isSpeaking, showPromoteButton, onPromote }) => {
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
      <div className="flex flex-col items-center text-center relative group">
        {isCurrentUser ? (
          <button onClick={() => setIsModalOpen(true)} className="rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500">
            <img src={user.avatarUrl} alt={user.name} className={avatarClasses} />
          </button>
        ) : (
          <img src={user.avatarUrl} alt={user.name} className={avatarClasses} />
        )}
        <p className="text-xs font-medium text-gray-300 truncate w-full">{user.name}</p>
        
        {showPromoteButton && onPromote && (
            <button onClick={() => onPromote(user.id)} className="absolute top-0 -right-1 bg-indigo-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity" title="Promote to speaker">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
            </button>
        )}
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