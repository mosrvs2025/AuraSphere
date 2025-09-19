// Fix: MediaStream is a global type from the DOM API and is not exported by React.
export enum UserRole {
  HOST = 'host',
  SPEAKER = 'speaker',
  LISTENER = 'listener'
}

export interface User {
  id: string;
  name: string;
  avatarUrl: string;
  role: UserRole;
  isGenerated?: boolean;
  bio?: string;
  following?: string[]; // Array of user IDs
  followers?: string[]; // Array of user IDs
}

export interface Room {
  id:string;
  title: string;
  tags: string[];
  hosts: User[];
  speakers: User[];
  listeners: User[];
  screenShareStream?: MediaStream;
  createdAt: Date;
  isPrivate?: boolean;
  moderationQueue?: ChatMessage[];
  videoUrl?: string;
  isScheduled?: boolean;
  scheduledTime?: Date;
}

export interface ChatMessage {
  id: string;
  user: User;
  text?: string;
  voiceMemo?: {
    duration: number; // in seconds
    blob?: Blob;
  };
  createdAt: Date;
}

export interface Conversation {
  id: string;
  participants: User[];
  lastMessage: ChatMessage;
}

export interface Notification {
    id: string;
    text: string;
    createdAt: Date;
    isRead: boolean;
}