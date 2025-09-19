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
}

export interface Room {
  id:string;
  title: string;
  tags: string[];
  hosts: User[];
  speakers: User[];
  listeners: User[];
  screenShareStream?: MediaStream;
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