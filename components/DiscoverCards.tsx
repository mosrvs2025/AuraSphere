import React from 'react';
import { DiscoverItem, User, Room } from '../types';

const UserProfileCard: React.FC<{ user: User }> = ({ user }) => (
  <div className="bg-gray-800/50 p-4 rounded-lg flex flex-col items-center text-center">
    <img src={user.avatarUrl} alt={user.name} className="w-20 h-20 rounded-full mb-3" />
    <p className="font-bold text-white">{user.name}</p>
    <p className="text-sm text-gray-400 line-clamp-2">{user.bio}</p>
    <button className="mt-4 bg-white text-black font-semibold py-1 px-4 rounded-full text-sm">Follow</button>
  </div>
);

const LiveRoomCard: React.FC<{ room: Room }> = ({ room }) => (
    <div className="bg-gray-800/50 p-4 rounded-lg">
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
        <button className="mt-4 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-lg text-sm">Join Room</button>
    </div>
);

const TextPostCard: React.FC<{ post: Extract<DiscoverItem, { type: 'text_post' }> }> = ({ post }) => (
  <div className="bg-gray-800/50 p-4 rounded-lg">
    <div className="flex items-center mb-3">
      <img src={post.author.avatarUrl} alt={post.author.name} className="w-10 h-10 rounded-full mr-3" />
      <div>
        <p className="font-bold text-white">{post.author.name}</p>
        <p className="text-xs text-gray-500">{post.createdAt.toLocaleDateString()}</p>
      </div>
    </div>
    <p className="text-gray-300">{post.content}</p>
  </div>
);

const ImagePostCard: React.FC<{ post: Extract<DiscoverItem, { type: 'image_post' }> }> = ({ post }) => (
  <div className="bg-gray-800/50 rounded-lg overflow-hidden">
    <img src={post.imageUrl} alt={post.caption || 'Image post'} className="w-full h-48 object-cover" />
    <div className="p-4">
      <p className="text-sm text-gray-300">{post.caption}</p>
    </div>
  </div>
);

const VideoPostCard: React.FC<{ post: Extract<DiscoverItem, { type: 'video_post' }> }> = ({ post }) => (
  <div className="bg-gray-800/50 rounded-lg overflow-hidden">
    <div className="relative">
      <img src={post.thumbnailUrl} alt={post.caption || 'Video post'} className="w-full h-48 object-cover" />
      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
        <button className="p-3 bg-white/30 backdrop-blur-sm rounded-full text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
        </button>
      </div>
    </div>
    <div className="p-4">
      <p className="text-sm text-gray-300">{post.caption}</p>
    </div>
  </div>
);


export const DiscoverCard: React.FC<{ item: DiscoverItem }> = ({ item }) => {
  switch (item.type) {
    case 'live_room':
      return <LiveRoomCard room={item} />;
    case 'user_profile':
      return <UserProfileCard user={item} />;
    case 'text_post':
      return <TextPostCard post={item} />;
    case 'image_post':
      return <ImagePostCard post={item} />;
    case 'video_post':
      return <VideoPostCard post={item} />;
    default:
      return null;
  }
};
