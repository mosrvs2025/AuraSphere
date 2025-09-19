// Implemented UserProfile as a wrapper for the ProfileView component.
import React, { useContext } from 'react';
import { User, Room } from '../types';
import ProfileView from './ProfileView';
import { UserContext } from '../context/UserContext';

interface UserProfileProps {
  user: User;
  allRooms: Room[];
  onEditProfile: () => void;
  onBack: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, allRooms, onEditProfile, onBack }) => {
    const { currentUser } = useContext(UserContext);
    
    return (
        <ProfileView 
            user={user}
            allRooms={allRooms}
            onEditProfile={onEditProfile}
            currentUser={currentUser}
            onBack={onBack}
        />
    );
};

export default UserProfile;