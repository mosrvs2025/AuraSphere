import React from 'react';
import { DiscoverItem, Room, User } from '../types';
import { VideoCameraIcon } from './Icons';
import AudioPlayer from './AudioPlayer';

interface DiscoverCardProps {
  item: DiscoverItem;
  onEnterRoom: (room: Room) => void;
  onViewProfile: (user: User) => void;
  onViewMedia: (post: Extract<DiscoverItem, { type: 'image_post' | 'video_post' }>) => void;
  onViewPost: (post: Extract<DiscoverItem, { type: 'text_post' | 'voice_note_post' }>) => void;
}

const LiveRoomCard: React.FC<{ room: Room & { type: 'live_room' }, onEnter: () => void }> = ({ room, onEnter }) => (
  <div onClick={onEnter} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4 cursor-pointer hover:bg-gray-700/70 transition-colors">
    <p className="text-xs font-bold uppercase tracking-wider text-red-400 mb-2">LIVE</p>
    <h3 className="font-bold text-white mb-2">{room.title}</h3>
    <div className="flex items-center space-x-2 mt-3">
      <div className="flex -space-x-2">
        {room.hosts.slice(0, 3).map(host => (
          <img key={host.id} src={host.avatarUrl} alt={host.name} className="h-8 w-8 rounded-full border-2 border-gray-800" />
        ))}
      </div>
      <p className="text-xs text-gray-400">{room.listeners.length + room.speakers.length + room.hosts.length} listening</p>
    </div>
  </div>
);

const UserProfileCard: React.FC<{ user: User & { type: 'user_profile' }, onView: () => void }> = ({ user, onView }) => (
  <div onClick={onView} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4 cursor-pointer hover:bg-gray-700/70 transition-colors text-center">
    <img src={user.avatarUrl} alt={user.name} className="w-20 h-20 rounded-full mx-auto mb-3" />
    <h3 className="font-bold text-white">{user.name}</h3>
    <p className="text-sm text-gray-400 mt-1 line-clamp-2">{user.bio}</p>
    <div className="text-xs text-gray-500 mt-2">{user.followers.length} followers</div>
  </div>
);

const PostCard: React.FC<{ post: Exclude<DiscoverItem, { type: 'live_room' | 'user_profile' }>, onView: () => void }> = ({ post, onView }) => (
  <div onClick={onView} className="bg-gray-800 rounded-lg overflow-hidden cursor-pointer group relative border border-gray-800 hover:border-gray-700 transition-colors">
    {post.type === 'image_post' && <img src={post.imageUrl} alt={post.caption} className="w-full h-auto object-cover" />}
    {post.type === 'video_post' && (
      <div className="relative">
        <img src={post.thumbnailUrl} alt={post.caption} className="w-full h-auto object-cover" />
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
          <div className="p-3 bg-white/20 backdrop-blur-sm rounded-full text-white">
            <VideoCameraIcon />
          </div>
        </div>
      </div>
    )}
    {post.type === 'text_post' && (
      <div className="p-4">
        <p className="text-gray-300 text-sm line-clamp-8">{post.content}</p>
      </div>
    )}
    {post.type === 'voice_note_post' && (
      <div className="p-3">
        {post.caption && <p className="text-gray-300 text-sm mb-2 line-clamp-2">{post.caption}</p>}
        <AudioPlayer src={post.voiceMemo.url} />
      </div>
    )}

    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
      <div className="flex items-center">
        <img src={post.author.avatarUrl} alt={post.author.name} className="w-6 h-6 rounded-full mr-2" />
        <p className="text-white text-xs font-bold truncate">{post.author.name}</p>
      </div>
    </div>
  </div>
);


export const DiscoverCard: React.FC<DiscoverCardProps> = ({ item, ...callbacks }) => {
  switch (item.type) {
    case 'live_room':
      return <LiveRoomCard room={item} onEnter={() => callbacks.onEnterRoom(item)} />;
    case 'user_profile':
      return <UserProfileCard user={item} onView={() => callbacks.onViewProfile(item)} />;
    case 'image_post':
    case 'video_post':
      return <PostCard post={item} onView={() => callbacks.onViewMedia(item)} />;
    case 'text_post':
    case 'voice_note_post':
       return <PostCard post={item} onView={() => {
           if(item.type === 'text_post') callbacks.onViewPost(item);
           // Voice notes are played directly from card, no detail view
        }} />;
    default:
      return null;
  }
};
