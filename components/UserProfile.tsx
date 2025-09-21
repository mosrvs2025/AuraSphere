// Implemented UserProfile as a wrapper for the ProfileView component.
import React from 'react';
import { User, Room, DiscoverItem, ContributionRequest, ActiveView } from '../types';
import ProfileView from './ProfileView';

interface UserProfileProps {
  user: User;
  allRooms: Room[];
  onEditProfile: () => void;
  onBack: () => void;
  allPosts: DiscoverItem[];
  onViewMedia: (post: Extract<DiscoverItem, { type: 'image_post' | 'video_post' }>) => void;
  onViewPost: (post: Extract<DiscoverItem, { type: 'text_post' | 'voice_note_post' }>) => void;
  contributionRequests: ContributionRequest[];
  onUpdateContributionRequest: (requestId: string, status: 'approved' | 'declined') => void;
  onViewProfile: (user: User) => void;
  onNavigate: (view: ActiveView) => void;
}

const UserProfile: React.FC<UserProfileProps> = (props) => {
    const { user, allRooms, onEditProfile, onBack, allPosts, onViewMedia, onViewPost, contributionRequests, onUpdateContributionRequest, onViewProfile, onNavigate } = props;
    
    return (
        <ProfileView 
            user={user}
            allRooms={allRooms}
            onEditProfile={onEditProfile}
            onBack={onBack}
            allPosts={allPosts}
            onViewMedia={onViewMedia}
            onViewPost={onViewPost}
            contributionRequests={contributionRequests}
            onUpdateContributionRequest={onUpdateContributionRequest}
            onViewProfile={onViewProfile}
            onNavigate={onNavigate}
        />
    );
};

export default UserProfile;