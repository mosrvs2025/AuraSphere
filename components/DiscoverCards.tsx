import React, { useContext } from 'react';
import { DiscoverItem, User, Room } from '../types';
import { UserContext } from '../context/UserContext';
import AudioPlayer from './AudioPlayer';

const UserProfileCard: React.FC<{ user: User; onViewProfile: (user: User) => void }> = ({ user, onViewProfile }) => {
  const { currentUser, followUser, unfollowUser } = useContext(UserContext);
  const isFollowing = currentUser.following?.some(u => u.id === user.id);
  const isOwnProfile = currentUser.id === user.id;

  const handleFollowClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click from firing
    if (isFollowing) {
      unfollowUser(user.id);
    } else {
      followUser(user.id);
    }
  };
  
  return (
    <div onClick={() => onViewProfile(user)} className="bg-gray-800/50 p-4 rounded-lg flex flex-col items-center text-center cursor-pointer hover:bg-gray-700/70 transition-colors">
      <img src={user.avatarUrl} alt={user.name} className="w-16 h-16 rounded-full mb-2" />
      <p className="font-bold text-white text-sm">{user.name}</p>
      <p className="text-xs text-gray-400 line-clamp-2 mt-1">{user.bio}</p>
      {!isOwnProfile && (
        <button 
          onClick={handleFollowClick}
          className={`mt-3 font-semibold py-1 px-4 rounded-full text-xs transition-colors w-24 ${
            isFollowing 
              ? 'bg-transparent border border-gray-500 text-gray-300' 
              : 'bg-white text-black hover:bg-gray-200'
          }`}
        >
          {isFollowing ? 'Following' : 'Follow'}
        </button>
      )}
    </div>
  );
};


const LiveRoomCard: React.FC<{ room: Room; onEnterRoom: (room: Room) => void }> = ({ room, onEnterRoom }) => (
    <div onClick={() => onEnterRoom(room)} className="bg-gray-800/50 p-4 rounded-lg cursor-pointer hover:bg-gray-700/70 transition-colors">
        <div className="flex justify-between items-start">
            <h3 className="font-bold text-white text-base leading-tight pr-2">{room.title}</h3>
            <span className="text-xs font-bold uppercase text-red-400 bg-red-900/50 px-2 py-1 rounded-md">LIVE</span>
        </div>
        <div className="flex items-center space-x-2 mt-2">
            <div className="flex -space-x-2">
                {room.hosts.slice(0, 2).map(host => (
                    <img key={host.id} src={host.avatarUrl} alt={host.name} className="h-6 w-6 rounded-full border-2 border-gray-900" />
                ))}
            </div>
            <p className="text-xs text-gray-300 truncate">{room.hosts.map(h => h.name).join(', ')}</p>
        </div>
        <div className="flex items-center text-gray-400 text-xs mt-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
            {room.listeners.length + room.speakers.length + room.hosts.length} listeners
        </div>
    </div>
);

const TextPostCard: React.FC<{ post: Extract<DiscoverItem, { type: 'text_post' }>; onClick: () => void }> = ({ post, onClick }) => (
  <div onClick={onClick} className="bg-gray-800/50 p-4 rounded-lg cursor-pointer hover:bg-gray-700/70 transition-colors">
    <div className="flex items-center mb-2">
      <img src={post.author.avatarUrl} alt={post.author.name} className="w-8 h-8 rounded-full mr-2" />
      <div>
        <p className="font-bold text-white text-sm">{post.author.name}</p>
        <p className="text-xs text-gray-500">{post.createdAt.toLocaleString()}</p>
      </div>
    </div>
    <p className="text-gray-300 text-sm line-clamp-5">{post.content}</p>
  </div>
);

const VoiceNotePostCard: React.FC<{ post: Extract<DiscoverItem, { type: 'voice_note_post' }>; onViewProfile: (user: User) => void }> = ({ post, onViewProfile }) => (
  <div className="bg-gray-800/50 p-4 rounded-lg">
    <div className="flex items-center mb-2 cursor-pointer" onClick={() => onViewProfile(post.author)}>
      <img src={post.author.avatarUrl} alt={post.author.name} className="w-8 h-8 rounded-full mr-2" />
      <div>
        <p className="font-bold text-white text-sm">{post.author.name}</p>
        <p className="text-xs text-gray-500">{post.createdAt.toLocaleString()}</p>
      </div>
    </div>
    {post.caption && <p className="text-gray-300 mb-2 text-sm">{post.caption}</p>}
    <AudioPlayer src={post.voiceMemo.url} />
  </div>
);


const ImagePostCard: React.FC<{
  post: Extract<DiscoverItem, { type: 'image_post' }>;
  onViewMedia: () => void;
  onViewProfile: (user: User) => void;
}> = ({ post, onViewMedia, onViewProfile }) => {
  const handleProfileClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onViewProfile(post.author);
  };

  return (
    <div className="bg-gray-800/50 rounded-lg overflow-hidden group hover:shadow-lg hover:shadow-indigo-500/10 transition-shadow">
      <div onClick={onViewMedia} className="cursor-pointer">
        <img src={post.imageUrl} alt={post.caption || 'Image post'} className="w-full h-auto object-cover group-hover:opacity-90 transition-opacity duration-300" />
      </div>
      {(post.caption || post.author) && (
        <div className="p-3">
          {post.caption && <p className="text-sm text-gray-300 line-clamp-2 mb-2">{post.caption}</p>}
          <div onClick={handleProfileClick} className="flex items-center cursor-pointer">
            <img src={post.author.avatarUrl} alt={post.author.name} className="w-6 h-6 rounded-full mr-2" />
            <p className="font-semibold text-xs text-white truncate">{post.author.name}</p>
          </div>
        </div>
      )}
    </div>
  );
};

const VideoPostCard: React.FC<{
  post: Extract<DiscoverItem, { type: 'video_post' }>;
  onViewMedia: () => void;
  onViewProfile: (user: User) => void;
}> = ({ post, onViewMedia, onViewProfile }) => {
  const handleProfileClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onViewProfile(post.author);
  };

  return (
    <div className="bg-gray-800/50 rounded-lg overflow-hidden group hover:shadow-lg hover:shadow-indigo-500/10 transition-shadow">
      <div onClick={onViewMedia} className="relative cursor-pointer">
        <img src={post.thumbnailUrl} alt={post.caption || 'Video post'} className="w-full h-auto object-cover group-hover:opacity-90 transition-opacity duration-300" />
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="p-3 bg-white/30 backdrop-blur-sm rounded-full text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
          </div>
        </div>
      </div>
       {(post.caption || post.author) && (
        <div className="p-3">
          {post.caption && <p className="text-sm text-gray-300 line-clamp-2 mb-2">{post.caption}</p>}
          <div onClick={handleProfileClick} className="flex items-center cursor-pointer">
            <img src={post.author.avatarUrl} alt={post.author.name} className="w-6 h-6 rounded-full mr-2" />
            <p className="font-semibold text-xs text-white truncate">{post.author.name}</p>
          </div>
        </div>
      )}
    </div>
  );
};


interface DiscoverCardProps {
    item: DiscoverItem;
    onEnterRoom: (room: Room) => void;
    onViewProfile: (user: User) => void;
    onViewMedia: (post: Extract<DiscoverItem, { type: 'image_post' | 'video_post' }>) => void;
    onViewPost: (post: Extract<DiscoverItem, { type: 'text_post' | 'voice_note_post' }>) => void;
}

export const DiscoverCard: React.FC<DiscoverCardProps> = ({ item, onEnterRoom, onViewProfile, onViewMedia, onViewPost }) => {
  switch (item.type) {
    case 'live_room':
      return <LiveRoomCard room={item} onEnterRoom={onEnterRoom} />;
    case 'user_profile':
      return <UserProfileCard user={item} onViewProfile={onViewProfile} />;
    case 'text_post':
      return <TextPostCard post={item} onClick={() => onViewPost(item)} />;
    case 'image_post':
      return <ImagePostCard post={item} onViewMedia={() => onViewMedia(item)} onViewProfile={onViewProfile} />;
    case 'video_post':
      return <VideoPostCard post={item} onViewMedia={() => onViewMedia(item)} onViewProfile={onViewProfile} />;
    case 'voice_note_post':
        return <VoiceNotePostCard post={item} onViewProfile={onViewProfile} />;
    default:
      return null;
  }
};