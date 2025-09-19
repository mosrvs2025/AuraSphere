// Implemented the UserCardModal for displaying a brief user profile.
import React, { useContext } from 'react';
import { User, ModalPosition } from '../types';
import { UserContext } from '../context/UserContext';

interface UserCardModalProps {
  user: User;
  onClose: () => void;
  onViewProfile: (user: User) => void;
  position: ModalPosition | null;
}

const UserCardModal: React.FC<UserCardModalProps> = ({ user, onClose, onViewProfile, position }) => {
  const { currentUser, followUser, unfollowUser } = useContext(UserContext);
  const isFollowing = currentUser.following?.some(u => u.id === user.id);
  const isOwnProfile = currentUser.id === user.id;

  const handleFollowToggle = () => {
    if (isFollowing) {
      unfollowUser(user.id);
    } else {
      followUser(user.id);
    }
  };

  const getModalStyle = (): React.CSSProperties => {
      if (!position) {
          // Fallback to centered for safety
          return {
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
          };
      }
      
      const modalWidth = 320; // Corresponds to max-w-xs
      let left = position.left + (position.width / 2) - (modalWidth / 2);

      // Boundary checks to keep it on screen
      const margin = 16; // 1rem
      if (left < margin) {
          left = margin;
      }
      if (left + modalWidth > window.innerWidth - margin) {
          left = window.innerWidth - modalWidth - margin;
      }

      return {
          position: 'fixed',
          top: `${position.top + 8}px`, // 8px margin below avatar
          left: `${left}px`,
      };
  };

  return (
    <div 
      className="fixed inset-0 bg-black/20 z-50"
      onClick={onClose}
    >
      <div 
        style={getModalStyle()}
        className="absolute bg-gray-800/90 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-4 w-full max-w-xs text-white shadow-2xl animate-fade-in text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img src={user.avatarUrl} alt={user.name} className="w-20 h-20 rounded-full mx-auto border-4 border-gray-700" />
        <h3 className="text-xl font-bold mt-3">{user.name}</h3>
        <div className="flex items-center justify-center space-x-4 my-2 text-gray-400 text-sm">
          <div><span className="font-bold text-white">{user.followers?.length ?? 0}</span> Followers</div>
          <div><span className="font-bold text-white">{user.following?.length ?? 0}</span> Following</div>
        </div>
        <p className="text-sm text-gray-300 my-4 line-clamp-3">{user.bio || 'No bio provided.'}</p>
        <div className="flex flex-col space-y-2">
          <button onClick={() => onViewProfile(user)} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-full transition">
            View Profile
          </button>
           {!isOwnProfile && (
             <button onClick={handleFollowToggle} className={`w-full font-bold py-2 px-4 rounded-full transition ${isFollowing ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-white hover:bg-gray-200 text-black'}`}>
                {isFollowing ? 'Unfollow' : 'Follow'}
             </button>
           )}
        </div>
      </div>
    </div>
  );
};

export default UserCardModal;