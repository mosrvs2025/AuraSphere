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
      <img src={user.avatarUrl} alt={user.name} className="w-20 h-20 rounded-full mb-3" />
      <p className="font-bold text-white">{user.name}</p>
      <p className="text-sm text-gray-400 line-clamp-2">{user.bio}</p>
      {!isOwnProfile && (
        <button 
          onClick={handleFollowClick}
          className={`mt-4 font-semibold py-1 px-4 rounded-full text-sm transition-colors w-24 ${
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
        <h3 className="font-bold text-white text-lg">{room.title}</h3>
        <div className="flex items-center space-x-2 mt-2">
            <div className="flex -space-x-2">
                {room.hosts.slice(0, 2).map(host => (
                    <img key={host.id} src={host.avatarUrl} alt={host.name} className="h-8 w-8 rounded-full border-2 border-gray-900" />
                ))}
            </div>
            <p className="text-sm text-gray-300">{room.hosts.map(h => h.name).join(', ')}</p>
        </div>
        <div className="flex items-center text-gray-400 text-sm mt-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
            {room.listeners.length + room.speakers.length + room.hosts.length} listeners
        </div>
        <div className="mt-4 w-full bg-indigo-600 group-hover:bg-indigo-500 text-white font-bold py-2 rounded-lg text-sm text-center transition-colors">Join Room</div>
    </div>
);

const TextPostCard: React.FC<{ post: Extract<DiscoverItem, { type: 'text_post' }>; onClick: () => void }> = ({ post, onClick }) => (
  <div onClick={onClick} className="bg-gray-800/50 p-4 rounded-lg cursor-pointer hover:bg-gray-700/70 transition-colors">
    <div className="flex items-center mb-3">
      <img src={post.author.avatarUrl} alt={post.author.name} className="w-10 h-10 rounded-full mr-3" />
      <div>
        <p className="font-bold text-white">{post.author.name}</p>
        <p className="text-xs text-gray-500">{post.createdAt.toLocaleDateString()}</p>
      </div>
    </div>
    <p className="text-gray-300 line-clamp-4">{post.content}</p>
  </div>
);

const VoiceNotePostCard: React.FC<{ post: Extract<DiscoverItem, { type: 'voice_note_post' }>; onViewProfile: (user: User) => void }> = ({ post, onViewProfile }) => (
  <div className="bg-gray-800/50 p-4 rounded-lg">
    <div className="flex items-center mb-3 cursor-pointer" onClick={() => onViewProfile(post.author)}>
      <img src={post.author.avatarUrl} alt={post.author.name} className="w-10 h-10 rounded-full mr-3" />
      <div>
        <p className="font-bold text-white">{post.author.name}</p>
        <p className="text-xs text-gray-500">{post.createdAt.toLocaleDateString()}</p>
      </div>
    </div>
    {post.caption && <p className="text-gray-300 mb-3 text-sm">{post.caption}</p>}
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
      <div onClick={handleProfileClick} className="p-3 flex items-center cursor-pointer">
        <img src={post.author.avatarUrl} alt={post.author.name} className="w-8 h-8 rounded-full mr-3" />
        <p className="font-semibold text-sm text-white truncate">{post.author.name}</p>
      </div>
      <div onClick={onViewMedia} className="cursor-pointer">
        <img src={post.imageUrl} alt={post.caption || 'Image post'} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
      </div>
      {post.caption && (
        <div onClick={onViewMedia} className="p-4 cursor-pointer">
          <p className="text-sm text-gray-300 line-clamp-2">{post.caption}</p>
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
      <div onClick={handleProfileClick} className="p-3 flex items-center cursor-pointer">
        <img src={post.author.avatarUrl} alt={post.author.name} className="w-8 h-8 rounded-full mr-3" />
        <p className="font-semibold text-sm text-white truncate">{post.author.name}</p>
      </div>
       {post.replyingTo && (
        <div className="px-3 pb-2 text-xs text-gray-400">
            Replying to <span className="font-semibold text-indigo-400">@{post.replyingTo.user.name}</span>
        </div>
      )}
      <div onClick={onViewMedia} className="relative cursor-pointer">
        <img src={post.thumbnailUrl} alt={post.caption || 'Video post'} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
          <div className="p-3 bg-white/30 backdrop-blur-sm rounded-full text-white scale-100 group-hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
          </div>
        </div>
      </div>
      {post.caption && (
        <div onClick={onViewMedia} className="p-4 cursor-pointer">
          <p className="text-sm text-gray-300 line-clamp-2">{post.caption}</p>
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
