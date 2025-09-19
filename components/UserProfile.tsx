// Implemented UserProfile as a wrapper for the ProfileView component.
import React, { useContext } from 'react';
import { User, Room, DiscoverItem } from '../types';
import ProfileView from './ProfileView';
import { UserContext } from '../context/UserContext';

interface UserProfileProps {
  user: User;
  allRooms: Room[];
  onEditProfile: () => void;
  onBack: () => void;
  allPosts: DiscoverItem[];
  onViewMedia: (post: Extract<DiscoverItem, { type: 'image_post' | 'video_post' }>) => void;
  onViewPost: (post: Extract<DiscoverItem, { type: 'text_post' }>) => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, allRooms, onEditProfile, onBack, allPosts, onViewMedia, onViewPost }) => {
    const { currentUser, followUser, unfollowUser } = useContext(UserContext);
    const isFollowing = currentUser.following?.some(u => u.id === user.id);
    
    return (
        <ProfileView 
            user={user}
            allRooms={allRooms}
            onEditProfile={onEditProfile}
            currentUser={currentUser}
            onBack={onBack}
            allPosts={allPosts}
            onViewMedia={onViewMedia}
            onViewPost={onViewPost}
            isFollowing={isFollowing}
            followUser={() => followUser(user.id)}
            unfollowUser={() => unfollowUser(user.id)}
        />
    );
};

export default UserProfile;