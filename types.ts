
export interface User {
  id: string;
  name: string;
  avatarUrl: string;
  bio?: string;
  followers: User[];
  following: User[];
  contributionSettings?: 'everyone' | 'following' | 'none';
  privacySettings?: PrivacySettings;
  groups?: Group[];
}

export interface Group {
    id: string;
    name: string;
    members: User[];
}

export interface PrivacySettings {
    liveStreams: { visibility: VisibilitySetting };
    pictures: { visibility: VisibilitySetting };
    posts: { visibility: VisibilitySetting };
    profileInfo: { visibility: VisibilitySetting };
}

export type VisibilitySetting = 'public' | 'followers' | 'groups' | 'private';


export interface ChatMessage {
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
  createdAt: Date;
  reactions?: { [emoji: string]: string[] }; // emoji -> array of user IDs
}

export interface Poll {
    id: string;
    question: string;
    options: { text: string; votes: string[] }[];
    isActive: boolean;
}

export interface RequestToSpeak {
    id: string;
    user: User;
    createdAt: Date;
    likes: string[];
    text?: string;
    voiceMemo?: { url: string; duration: number };
    videoNote?: { url: string; thumbnailUrl: string; duration: number };
}

export interface Room {
  id: string;
  title: string;
  description?: string;
  hosts: User[];
  speakers: User[];
  listeners: User[];
  isPrivate: boolean;
  featuredUrl?: string;
  isSharingScreen?: boolean;
  videoUrl?: string;
  messages: ChatMessage[];
  poll?: Poll | null;
  requestsToSpeak?: RequestToSpeak[];
  isScheduled?: boolean;
  scheduledTime?: Date;
  createdAt?: Date;
  totalListeners?: User[];
  invitedUserIds?: string[];
  isVideoEnabled?: boolean;
  broadcastingMedia?: { type: 'voice' | 'video'; url: string; user: User } | null;
}

export interface Comment {
    id: string;
    user: User;
    text: string;
    createdAt: Date;
}

// Union type for items in the discover feed
export type DiscoverItem =
  | (Room & { type: 'live_room' })
  | (User & { type: 'user_profile' })
  | {
      id: string;
      type: 'image_post';
      author: User;
      imageUrl: string;
      caption?: string;
      likes: number;
      comments: Comment[];
      createdAt: Date;
      tags?: string[];
      status?: 'published' | 'scheduled';
      scheduledTime?: Date;
    }
  | {
      id: string;
      type: 'video_post';
      author: User;
      videoUrl: string;
      thumbnailUrl: string;
      caption?: string;
      likes: number;
      comments: Comment[];
      createdAt: Date;
      tags?: string[];
      status?: 'published' | 'scheduled';
      scheduledTime?: Date;
    }
  | {
      id: string;
      type: 'text_post';
      author: User;
      content: string;
      likes: number;
      comments: Comment[];
      createdAt: Date;
      tags?: string[];
      status?: 'published' | 'scheduled';
      scheduledTime?: Date;
    }
 | {
      id: string;
      type: 'voice_note_post';
      author: User;
      caption?: string;
      voiceMemo: { url: string; duration: number; };
      likes: number;
      comments: Comment[];
      createdAt: Date;
      tags?: string[];
  };

export interface ContributionRequest {
    id: string;
    fromUser: User;
    toUser: User;
    post: DiscoverItem; // The post being contributed
    status: 'pending' | 'approved' | 'declined';
    createdAt: Date;
}

export type ActiveView = 
    | { view: 'home' }
    | { view: 'room'; roomId: string }
    | { view: 'profile'; userId: string }
    | { view: 'edit_profile' }
    | { view: 'media'; post: Extract<DiscoverItem, { type: 'image_post' | 'video_post' }> }
    | { view: 'post'; post: Extract<DiscoverItem, { type: 'text_post' | 'voice_note_post' }> }
    | { view: 'create_note' }
    | { view: 'create_post', file: { url: string; type: 'image' | 'video' } }
    | { view: 'swipe'; initialRoomId: string }
    | { view: 'in_app_browser'; url: string }
    | { view: 'messages' }
    | { view: 'conversation'; conversationId: string }
    | { view: 'notifications' }
    | { view: 'scheduled' }
    | { view: 'search' }
    | { view: 'trending' }
    | { view: 'my_studio' }
    | { view: 'privacy_dashboard' }
    | { view: 'create_video_reply', replyInfo: { post: DiscoverItem; comment: Comment } };


export type CurationTab = 'forYou' | 'following' | 'world' | 'local';

export interface Conversation {
    id: string;
    participants: User[];
    messages: ChatMessage[];
}

export interface Notification {
    id: string;
    text: string;
    isRead: boolean;
    createdAt: Date;
}

export interface ModalPosition {
  top: number;
  left: number;
  width: number;
  height: number;
}
