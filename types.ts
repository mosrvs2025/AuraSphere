// types.ts

export interface User {
  id: string;
  name: string;
  avatarUrl: string;
  bio?: string;
  followers: User[];
  following: User[];
}

export interface ChatMessage {
  id: string;
  user: User;
  text?: string;
  createdAt: Date;
  reactions?: { [emoji: string]: string[] }; // user ids for each emoji
  voiceMemo?: {
    url: string;
    duration: number;
  };
  videoNote?: {
    url: string;
    thumbnailUrl: string;
    duration: number;
  };
}

export interface PollOption {
  text: string;
  votes: string[]; // user ids
}

export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  isActive: boolean;
}

export interface Room {
  id: string;
  title: string;
  description?: string;
  hosts: User[];
  speakers: User[];
  listeners: User[];
  messages: ChatMessage[];
  isPrivate: boolean;
  poll?: Poll;
  isSharingScreen?: boolean;
  videoUrl?: string;
  featuredUrl?: string;
  isScheduled?: boolean;
  scheduledTime?: Date;
  invitedUserIds?: string[];
}

// For the discover/trending feed
export type DiscoverItem = (Room & { type: 'live_room' }) |
  (User & { type: 'user_profile' }) |
  {
    type: 'text_post';
    id: string;
    author: User;
    content: string;
    createdAt: Date;
    likes: number;
    comments: number;
    status: 'published' | 'scheduled';
    scheduledTime?: Date;
  } |
  {
    type: 'image_post';
    id: string;
    author: User;
    imageUrl: string;
    caption?: string;
    createdAt: Date;
    likes: number;
    comments: number;
    status: 'published' | 'scheduled';
    scheduledTime?: Date;
  } |
  {
    type: 'video_post';
    id: string;
    author: User;
    videoUrl: string;
    thumbnailUrl: string;
    caption?: string;
    createdAt: Date;
    likes: number;
    comments: number;
    status: 'published' | 'scheduled';
    scheduledTime?: Date;
  };


export interface Conversation {
  id: string;
  participants: User[];
  messages: ChatMessage[];
}

export interface Notification {
  id: string;
  text: string;
  createdAt: Date;
  isRead: boolean;
  link?: string; // e.g., to a room, profile, or post
}

export type ActiveView = 'home' | 'messages' | 'scheduled' | 'profile' | 'notifications' | 'my-studio';

export type CurationTab = 'forYou' | 'following';

export interface ModalPosition {
    top: number;
    left: number;
    width: number;
    height: number;
}
