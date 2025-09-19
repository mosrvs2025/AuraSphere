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
  voiceMemo?: string; // URL to voice memo
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
  videoUrl?: string;
  isScheduled?: boolean;
  scheduledTime?: Date;
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
}
