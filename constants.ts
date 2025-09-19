// Created mock data to populate the application and resolve constant import errors.
import { User, Room, Conversation, Notification } from './types';

export const PREDEFINED_AVATARS: string[] = [
  'https://i.pravatar.cc/150?img=1',
  'https://i.pravatar.cc/150?img=2',
  'https://i.pravatar.cc/150?img=3',
  'https://i.pravatar.cc/150?img=4',
  'https://i.pravatar.cc/150?img=5',
  'https://i.pravatar.cc/150?img=6',
];

export const MOCK_USER_LISTENER: User = {
  id: 'user-1',
  name: 'Alex',
  avatarUrl: 'https://i.pravatar.cc/150?u=user-1',
  bio: 'Frontend developer and UI/UX enthusiast. Exploring the future of audio experiences.',
};

const MOCK_USER_HOST: User = {
    id: 'user-2',
    name: 'Bella',
    avatarUrl: 'https://i.pravatar.cc/150?u=user-2',
    bio: 'Product manager, musician, and podcast host. Always curious.',
};

const MOCK_USER_SPEAKER: User = {
    id: 'user-3',
    name: 'Charlie',
    avatarUrl: 'https://i.pravatar.cc/150?u=user-3',
    bio: 'Indie game developer. Currently working on a new pixel art RPG.',
};

const MOCK_USER_4: User = { id: 'user-4', name: 'Dana', avatarUrl: 'https://i.pravatar.cc/150?u=user-4' };
const MOCK_USER_5: User = { id: 'user-5', name: 'Eli', avatarUrl: 'https://i.pravatar.cc/150?u=user-5' };
const MOCK_USER_6: User = { id: 'user-6', name: 'Fiona', avatarUrl: 'https://i.pravatar.cc/150?u=user-6' };

export const MOCK_USERS: User[] = [MOCK_USER_LISTENER, MOCK_USER_HOST, MOCK_USER_SPEAKER, MOCK_USER_4, MOCK_USER_5, MOCK_USER_6];

export const MOCK_ROOMS: Room[] = [
  {
    id: 'room-1',
    title: '🚀 The Future of Frontend Frameworks',
    description: 'A lively discussion on React, Vue, Svelte, and what\'s next. #webdev #javascript',
    hosts: [MOCK_USER_HOST],
    speakers: [MOCK_USER_SPEAKER],
    listeners: [MOCK_USER_LISTENER, MOCK_USER_4, MOCK_USER_5],
    messages: [
        { id: 'm1', user: MOCK_USER_HOST, text: 'Welcome everyone!', createdAt: new Date(Date.now() - 60000 * 5) },
        { id: 'm2', user: MOCK_USER_SPEAKER, text: 'Excited to be here!', createdAt: new Date(Date.now() - 60000 * 4) },
    ],
    isPrivate: false,
  },
  {
    id: 'room-2',
    title: '🎮 Indie Game Dev Hangout',
    hosts: [MOCK_USER_SPEAKER, MOCK_USER_4],
    speakers: [],
    listeners: [MOCK_USER_LISTENER, MOCK_USER_HOST, MOCK_USER_5, MOCK_USER_6],
    messages: [],
    isPrivate: false,
  },
  {
    id: 'room-3',
    title: '🎧 Chill Lofi Beats & Study Session',
    hosts: [MOCK_USER_5],
    speakers: [],
    listeners: [MOCK_USER_LISTENER, MOCK_USER_HOST, MOCK_USER_SPEAKER, MOCK_USER_4, MOCK_USER_6],
    messages: [],
    isPrivate: true,
  },
  {
    id: 'room-4',
    title: '📅 Planning for the Week Ahead',
    hosts: [MOCK_USER_6],
    speakers: [],
    listeners: [MOCK_USER_LISTENER, MOCK_USER_HOST],
    messages: [],
    isPrivate: false,
    isScheduled: true,
    scheduledTime: new Date(Date.now() + 86400000 * 2), // 2 days from now
  }
];

export const MOCK_CONVERSATIONS: Conversation[] = [
    {
        id: 'convo-1',
        participants: [MOCK_USER_LISTENER, MOCK_USER_HOST],
        messages: [
            { id: 'c1-m1', user: MOCK_USER_HOST, text: 'Hey! Great talk in the room earlier.', createdAt: new Date(Date.now() - 3600000) },
            { id: 'c1-m2', user: MOCK_USER_LISTENER, text: 'Thanks! I really enjoyed the discussion.', createdAt: new Date(Date.now() - 3500000) },
        ]
    },
    {
        id: 'convo-2',
        participants: [MOCK_USER_LISTENER, MOCK_USER_SPEAKER],
        messages: [
            { id: 'c2-m1', user: MOCK_USER_SPEAKER, text: 'Your point about state management was spot on.', createdAt: new Date(Date.now() - 86400000) },
        ]
    }
];

export const MOCK_NOTIFICATIONS: Notification[] = [
    { id: 'notif-1', text: 'Bella started a new room: "🚀 The Future of Frontend Frameworks"', createdAt: new Date(Date.now() - 60000 * 10), isRead: false, type: 'room_start', relatedRoomId: 'room-1' },
    { id: 'notif-2', text: 'Charlie followed you.', createdAt: new Date(Date.now() - 60000 * 60 * 3), isRead: false, type: 'follow', relatedUser: MOCK_USER_SPEAKER },
    { id: 'notif-3', text: 'Your scheduled room "Planning for the Week Ahead" starts in 2 days.', createdAt: new Date(Date.now() - 60000 * 60 * 24), isRead: true, type: 'room_invite', relatedRoomId: 'room-4' },
];