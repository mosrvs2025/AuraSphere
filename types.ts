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
  id: string;
  title: string;
  tags: string[];
  hosts: User[];
  speakers: User[];
  listeners: User[];
}

export interface VoiceMemo {
  id: string;
  user: User;
  duration: number; // in seconds
  createdAt: Date;
}