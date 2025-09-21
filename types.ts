// types.ts

export interface User {
  id: string;
  name: string;
  avatarUrl: string;
  bio?: string;
  followers: User[];
  following: User[];
  contributionSettings?: 'everyone' | 'following' | 'none';
  groups?: UserGroup[];
  privacySettings?: PrivacySettings;
}

export interface UserGroup {
    id: string;
    name:string;
    members: User[];
}

export type VisibilitySetting = 'public' | 'followers' | 'groups' | 'private';

export interface PrivacySettings {
    liveStreams: { visibility: VisibilitySetting, allowedGroups?: string[] }; // group ids
    pictures: { visibility: VisibilitySetting, allowedGroups?: string[] };
    posts: { visibility: VisibilitySetting, allowedGroups?: string[] };
    profileInfo: { visibility: VisibilitySetting, allowedGroups?: string[] };
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

export interface RequestToSpeak {
  id: string;
  user: User;
  text?: string;
  voiceMemo?: {
    url: string;
    duration: number;
  };
  videoNote?: {
    url: string;
    thumbnailUrl: string;
    duration: number;
  };
  likes: string[]; // user ids
  createdAt: Date;
}

export interface Room {
  id: string;
  type: 'live_room'; // Added to conform to DiscoverItem
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
  requestsToSpeak?: RequestToSpeak[];
  createdAt?: Date;
  totalListeners?: User[];
  isVideoEnabled?: boolean;
  geolocation?: { lat: number; lng: number; };
  broadcastingMedia?: { type: 'voice' | 'video'; url: string; user: User } | null;
  tags?: string[];
}

export interface Comment {
  id: string;
  user: User;
  text: string;
  createdAt: Date;
}

type PostBase = {
    id: string;
    author: User;
    createdAt: Date;
    likes: number;
    comments: Comment[];
    status: 'published' | 'scheduled';
    scheduledTime?: Date;
    geolocation?: { lat: number; lng: number; };
    replyingTo?: { commentId: string; user: User };
    tags?: string[];
    contributor?: User;
}


// For the discover/trending feed
export type DiscoverItem = Room |
  (User & { type: 'user_profile' }) |
  (PostBase & {
    type: 'text_post';
    content: string;
  }) |
  (PostBase & {
    type: 'image_post';
    imageUrl: string;
    caption?: string;
  }) |
  (PostBase & {
    type: 'video_post';
    videoUrl: string;
    thumbnailUrl: string;
    caption?: string;
  }) |
   (PostBase & {
    type: 'voice_note_post';
    voiceMemo: { url: string; duration: number };
    caption?: string;
  });


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

export interface ContributionRequest {
  id: string;
  contributor: User;
  recipient: User;
  post: Extract<DiscoverItem, { type: 'text_post' | 'image_post' | 'video_post' | 'voice_note_post' }>;
  status: 'pending' | 'approved' | 'declined';
  createdAt: Date;
}

// Updated to reflect the simplified 4-tab bottom navigation.
export type ActiveView = 'home' | 'search' | 'messages' | 'profile' | 'privacyDashboard';

export type CurationTab = 'forYou' | 'following' | 'world' | 'local';

export interface ModalPosition {
    top: number;
    left: number;
    width: number;
    height: number;
}
