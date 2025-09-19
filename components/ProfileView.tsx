import React from 'react';
import { User, Room, DiscoverItem } from '../types';
import RoomCard from './RoomCard';
import { DocumentTextIcon, VideoCameraIcon } from './Icons';

interface ProfileViewProps {
  user: User;
  allRooms: Room[];
  onEditProfile: () => void;
  currentUser: User;
  onBack: () => void;
  allPosts: DiscoverItem[];
  onViewMedia: (post: Extract<DiscoverItem, { type: 'image_post' | 'video_post' }>) => void;
  onViewPost: (post: Extract<DiscoverItem, { type: 'text_post' }>) => void;
}

const ContentGridItem: React.FC<{ 
    post: Extract<DiscoverItem, { type: 'image_post' | 'video_post' | 'text_post' }>;
    onViewMedia: (post: Extract<DiscoverItem, { type: 'image_post' | 'video_post' }>) => void;
    onViewPost: (post: Extract<DiscoverItem, { type: 'text_post' }>) => void;
}> = ({ post, onViewMedia, onViewPost }) => {
    switch(post.type) {
        case 'image_post':
            return (
                <button onClick={() => onViewMedia(post)} className="aspect-square bg-gray-800 rounded-md overflow-hidden relative group focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900">
                    <img src={post.imageUrl} alt={post.caption || 'User post'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </button>
            );
        case 'video_post':
            return (
                <button onClick={() => onViewMedia(post)} className="aspect-square bg-gray-800 rounded-md overflow-hidden relative group focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900">
                    <img src={post.thumbnailUrl} alt={post.caption || 'User post'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute top-2 right-2 text-white bg-black/30 rounded-full">
                        <VideoCameraIcon className="w-5 h-5 p-1" />
                    </div>
                </button>
            );
        case 'text_post':
            return (
                <button onClick={() => onViewPost(post)} className="aspect-square bg-gray-800 rounded-md p-3 flex flex-col justify-between hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900">
                    <p className="text-left text-sm text-gray-300 line-clamp-5">{post.content}</p>
                    <DocumentTextIcon className="w-6 h-6 text-gray-500 self-end" />
                </button>
            );
        default:
            return null;
    }
};

const ProfileView: React.FC<ProfileViewProps> = ({ user, allRooms, onEditProfile, currentUser, onBack, allPosts, onViewMedia, onViewPost }) => {
  const userHostedRooms = allRooms.filter(room => room.hosts.some(host => host.id === user.id) && !room.isScheduled);
  const isOwnProfile = user.id === currentUser.id;

  const userPosts = (allPosts.filter(
      p => ('author' in p) && p.author.id === user.id && (p.type === 'image_post' || p.type === 'video_post' || p.type === 'text_post')
  ) as Extract<DiscoverItem, { type: 'image_post' | 'video_post' | 'text_post' }>[]).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());


  return (
    <div className="p-4 md:p-6 animate-fade-in max-w-4xl mx-auto">
        <header className="mb-6">
            <button onClick={onBack} className="text-indigo-400 hover:text-indigo-300 font-semibold text-sm flex items-center space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Back</span>
            </button>
        </header>
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
            {isOwnProfile && (
                <button 
                  onClick={onEditProfile}
                  className="mt-6 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-5 rounded-full text-sm transition"
                >
                  Edit Profile
                </button>
            )}
          </div>
        </div>

        {/* Creator Content Grid */}
        <div className="mt-12">
            <h2 className="text-2xl font-bold text-white mb-4">Content</h2>
            {userPosts.length > 0 ? (
                <div className="grid grid-cols-3 gap-1">
                    {userPosts.map(post => (
                        <ContentGridItem 
                            key={post.id} 
                            post={post}
                            onViewMedia={onViewMedia}
                            onViewPost={onViewPost}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-gray-800/50 rounded-lg border border-gray-700">
                    <p className="text-gray-400">{user.name} hasn't posted anything yet.</p>
                </div>
            )}
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
  );
};

export default ProfileView;