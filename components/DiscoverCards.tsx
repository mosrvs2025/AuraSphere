import React, { useContext } from 'react';
import { User, Room, DiscoverItem } from '../types';
import { UserContext } from '../context/UserContext';
import RoomCard from './RoomCard';

// Generic card wrapper
const CardWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/10">
        {children}
    </div>
);

// Card for Text Posts ("Notes")
export const TextPostCard: React.FC<{ post: Extract<DiscoverItem, { type: 'text_post' }>; onViewProfile: (user: User) => void }> = ({ post, onViewProfile }) => (
    <CardWrapper>
        <div className="p-4">
            <div className="flex items-center mb-3">
                <button onClick={() => onViewProfile(post.author)} className="flex items-center group">
                    <img src={post.author.avatarUrl} alt={post.author.name} className="w-8 h-8 rounded-full mr-3" />
                    <span className="font-semibold text-sm text-gray-300 group-hover:text-white">{post.author.name}</span>
                </button>
            </div>
            <p className="text-gray-200 text-sm">{post.content}</p>
        </div>
    </CardWrapper>
);

// Card for Image Posts
export const ImagePostCard: React.FC<{ post: Extract<DiscoverItem, { type: 'image_post' }>; onViewProfile: (user: User) => void }> = ({ post, onViewProfile }) => (
    <CardWrapper>
        <img src={post.imageUrl} alt={post.caption || 'Image post'} className="w-full h-auto object-cover" />
        <div className="p-3">
             <button onClick={() => onViewProfile(post.author)} className="flex items-center group">
                <img src={post.author.avatarUrl} alt={post.author.name} className="w-6 h-6 rounded-full mr-2" />
                <span className="font-semibold text-xs text-gray-300 group-hover:text-white">{post.author.name}</span>
            </button>
            {post.caption && <p className="text-xs text-gray-400 mt-2">{post.caption}</p>}
        </div>
    </CardWrapper>
);

// Card for Video Posts
export const VideoPostCard: React.FC<{ post: Extract<DiscoverItem, { type: 'video_post' }>; onViewProfile: (user: User) => void }> = ({ post, onViewProfile }) => (
     <CardWrapper>
        <div className="relative group cursor-pointer">
            <img src={post.thumbnailUrl} alt={post.caption || 'Video post'} className="w-full h-auto object-cover" />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                 <div className="p-3 bg-white/30 backdrop-blur-sm rounded-full text-white scale-100 group-hover:scale-110 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                </div>
            </div>
        </div>
        <div className="p-3">
             <button onClick={() => onViewProfile(post.author)} className="flex items-center group">
                <img src={post.author.avatarUrl} alt={post.author.name} className="w-6 h-6 rounded-full mr-2" />
                <span className="font-semibold text-xs text-gray-300 group-hover:text-white">{post.author.name}</span>
            </button>
        </div>
    </CardWrapper>
);


// Card for suggesting User Profiles
export const DiscoverUserCard: React.FC<{ user: User; onViewProfile: (user: User) => void }> = ({ user, onViewProfile }) => {
    const { currentUser, followUser, unfollowUser } = useContext(UserContext);
    const isFollowing = currentUser.following?.some(u => u.id === user.id);
    const isOwnProfile = currentUser.id === user.id;

    const handleFollowToggle = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card click
        if (isFollowing) {
            unfollowUser(user.id);
        } else {
            followUser(user.id);
        }
    };

    return (
        <CardWrapper>
            <div onClick={() => onViewProfile(user)} className="p-4 flex flex-col items-center text-center cursor-pointer">
                <img src={user.avatarUrl} alt={user.name} className="w-16 h-16 rounded-full mb-3" />
                <p className="font-bold text-white truncate w-full">{user.name}</p>
                <p className="text-xs text-gray-400 h-8 overflow-hidden w-full mb-1">{user.bio}</p>
                {!isOwnProfile && (
                    <button onClick={handleFollowToggle} className={`mt-3 w-full font-bold py-1.5 px-4 rounded-full text-sm transition ${isFollowing ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-white hover:bg-gray-200 text-black'}`}>
                        {isFollowing ? 'Following' : 'Follow'}
                    </button>
                )}
            </div>
        </CardWrapper>
    )
};


// Main Renderer Component
interface DiscoverItemRendererProps {
  item: DiscoverItem;
  onEnterRoom: (room: Room) => void;
  onViewProfile: (user: User) => void;
}
export const DiscoverItemRenderer: React.FC<DiscoverItemRendererProps> = ({ item, onEnterRoom, onViewProfile }) => {
    switch (item.type) {
        case 'live_room':
            return <RoomCard room={item} onEnter={() => onEnterRoom(item)} />;
        case 'user_profile':
            return <DiscoverUserCard user={item} onViewProfile={onViewProfile} />;
        case 'text_post':
            return <TextPostCard post={item} onViewProfile={onViewProfile} />;
        case 'image_post':
            return <ImagePostCard post={item} onViewProfile={onViewProfile} />;
        case 'video_post':
            return <VideoPostCard post={item} onViewProfile={onViewProfile} />;
        default:
            return null;
    }
};
