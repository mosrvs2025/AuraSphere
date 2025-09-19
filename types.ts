// Defined core application types to resolve type errors across the project.
export interface User {
  id: string;
  name: string;
  avatarUrl: string;
  bio?: string;
  followers?: User[];
  following?: User[];
}

export interface ChatMessage {
  id: string;
  user: User;
  text?: string;
  createdAt: Date;
  voiceMemo?: {
    url: string;
    duration: number; // in seconds
  };
  videoNote?: {
    url:string;
    thumbnailUrl: string;
    duration: number; // in seconds
  };
  reactions?: Record<string, string[]>; // emoji -> User IDs
}

export interface PollOption {
  text: string;
  votes: string[]; // Array of user IDs
}

export interface Poll {
  question: string;
  options: PollOption[];
  isActive: boolean;
}

export interface Room {
  id:string;
  title: string;
  description?: string;
  hosts: User[];
  speakers: User[];
  listeners: User[];
  messages: ChatMessage[];
  isPrivate: boolean;
  videoUrl?: string;
  isSharingScreen?: boolean;
  isScheduled?: boolean;
  scheduledTime?: Date;
  featuredUrl?: string;
  poll?: Poll;
  createdAt?: Date;
  invitedUserIds?: string[];
}

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
    type: 'follow' | 'room_invite' | 'room_start';
    relatedUser?: User;
    relatedRoomId?: string;
}

export interface ModalPosition {
    top: number;
    left: number;
    width: number;
}

// FIX: Centralized the ActiveView type to be used across the application, resolving type inconsistencies.
export type ActiveView = 'home' | 'room' | 'messages' | 'scheduled' | 'profile' | 'notifications' | 'my-studio' | 'conversation' | 'post_detail';


// New type for the Discover feed
export type DiscoverItem =
  | ({ type: 'live_room' } & Room)
  | ({ type: 'user_profile' } & User)
  | ({
      type: 'text_post';
      id: string;
      author: User;
      content: string;
      likes: number;
      comments: number;
      createdAt: Date;
      status?: 'published' | 'scheduled';
      scheduledTime?: Date;
    })
  | ({
      type: 'image_post';
      id: string;
      author: User;
      imageUrl: string;
      caption?: string;
      likes: number;
      comments: number;
      createdAt: Date;
      status?: 'published' | 'scheduled';
      scheduledTime?: Date;
    })
  | ({
      type: 'video_post';
      id:string;
      author: User;
      videoUrl: string;
      thumbnailUrl: string;
      caption?: string;
      likes: number;
      comments: number;
      createdAt: Date;
      status?: 'published' | 'scheduled';
      scheduledTime?: Date;
    });