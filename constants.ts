import { User, Room, UserRole, Conversation, ChatMessage, Notification } from './types';

export const PREDEFINED_AVATARS: string[] = [
  'https://picsum.photos/seed/avatar1/100/100',
  'https://picsum.photos/seed/avatar2/100/100',
  'https://picsum.photos/seed/avatar3/100/100',
  'https://picsum.photos/seed/avatar4/100/100',
  'https://picsum.photos/seed/avatar5/100/100',
  'https://picsum.photos/seed/avatar6/100/100',
];

export const MOCK_USER_HOST: User = {
  id: 'user-host-1',
  name: 'Alex',
  avatarUrl: 'https://picsum.photos/seed/alex/100/100',
  role: UserRole.HOST,
  bio: 'Host of Startup Pitch Practice. Angel investor. Tech enthusiast.',
  following: ['user-2', 'user-3', 'user-4'],
  followers: ['user-2', 'user-3', 'user-5', 'user-7', 'user-9'],
};

export const MOCK_USER_LISTENER: User = {
  id: 'user-listener-1',
  name: 'Sam',
  avatarUrl: 'https://picsum.photos/seed/sam/100/100',
  role: UserRole.LISTENER,
  bio: 'Just here to listen and learn.',
  following: ['user-host-1'],
  followers: [],
};

export const users: User[] = [
  MOCK_USER_HOST,
  { id: 'user-2', name: 'Brenda', avatarUrl: 'https://picsum.photos/seed/brenda/100/100', role: UserRole.HOST, bio: 'Co-hosting with Alex.', following: ['user-host-1'], followers: ['user-host-1'] },
  { id: 'user-3', name: 'Charlie', avatarUrl: 'https://picsum.photos/seed/charlie/100/100', role: UserRole.SPEAKER, bio: 'AI researcher and designer.', following: ['user-host-1'], followers: ['user-host-1'] },
  { id: 'user-4', name: 'Dana', avatarUrl: 'https://picsum.photos/seed/dana/100/100', role: UserRole.SPEAKER, bio: 'Musician and sound engineer.', following: ['user-host-1'], followers: [] },
  { id: 'user-5', name: 'Evan', avatarUrl: 'https://picsum.photos/seed/evan/100/100', role: UserRole.LISTENER, bio: 'Aspiring entrepreneur.', following: [], followers: ['user-host-1'] },
  MOCK_USER_LISTENER,
  { id: 'user-7', name: 'Fiona', avatarUrl: 'https://picsum.photos/seed/fiona/100/100', role: UserRole.LISTENER, bio: 'Loves chill music.', following: [], followers: ['user-host-1'] },
  { id: 'user-8', name: 'George', avatarUrl: 'https://picsum.photos/seed/george/100/100', role: UserRole.LISTENER, bio: '', following: [], followers: [] },
  { id: 'user-9', name: 'Hannah', avatarUrl: 'https://picsum.photos/seed/hannah/100/100', role: UserRole.LISTENER, bio: '', following: [], followers: ['user-host-1'] },
  { id: 'user-10', name: 'Ian', avatarUrl: 'https://picsum.photos/seed/ian/100/100', role: UserRole.LISTENER, bio: '', following: [], followers: [] },
];

export const MOCK_ROOMS: Room[] = [
  {
    id: 'room-1',
    title: 'Startup Pitch Practice & Feedback',
    tags: ['Tech', 'Business', 'Startups'],
    hosts: [users[0], users[1]],
    speakers: [users[2], users[3]],
    listeners: users.slice(4),
    createdAt: new Date(Date.now() - 1000 * 60 * 10), // 10 minutes ago
    moderationQueue: [],
  },
  {
    id: 'room-2',
    title: 'The Future of AI in Creative Fields',
    tags: ['AI', 'Art', 'Design'],
    hosts: [users[2]],
    speakers: [users[0], users[4]],
    listeners: users.filter(u => ![users[0], users[2], users[4]].includes(u)),
    createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
  },
  {
    id: 'room-3',
    title: 'Late Night Chill: Lo-fi Beats & Convos',
    tags: ['Music', 'Chill', 'Community'],
    hosts: [users[4]],
    speakers: [users[6]],
    listeners: users.filter(u => ![users[4], users[6]].includes(u)),
    createdAt: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
  },
  {
    id: 'room-4',
    title: 'Weekly Standup & Team Sync',
    tags: ['Work', 'Productivity'],
    hosts: [users[0]],
    speakers: [],
    listeners: [],
    createdAt: new Date(),
    isScheduled: true,
    scheduledTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2), // 2 days from now
  }
];

const createMockMessage = (user: User, text: string, minutesAgo: number): ChatMessage => ({
  id: `msg-${Math.random()}`,
  user,
  text,
  createdAt: new Date(Date.now() - 1000 * 60 * minutesAgo),
});

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    participants: [MOCK_USER_HOST, users[1]], // Alex and Brenda
    messages: [
        createMockMessage(MOCK_USER_HOST, "Hey, getting ready for the pitch practice later?", 10),
        createMockMessage(users[1], "Yep! Just reviewing my notes. A bit nervous.", 8),
        createMockMessage(MOCK_USER_HOST, "You'll do great. We've got a good panel.", 7),
        createMockMessage(users[1], "Great session today! We should do another one next week.", 5),
    ],
  },
  {
    id: 'conv-2',
    participants: [MOCK_USER_HOST, users[3]], // Alex and Dana
    messages: [
        createMockMessage(users[3], "The lo-fi room was so chill last night.", 45),
        createMockMessage(MOCK_USER_HOST, "Thanks for the feedback on the audio setup.", 30),
    ],
  },
  {
    id: 'conv-3',
    participants: [MOCK_USER_HOST, MOCK_USER_LISTENER], // Alex and Sam
    messages: [
        createMockMessage(MOCK_USER_LISTENER, "Hey, loved the talk! Had a quick question.", 120),
    ],
  }
];

export const MOCK_NOTIFICATIONS: Notification[] = [
    { id: 'notif-1', type: 'follow', text: 'Brenda started following you.', relatedEntity: { type: 'user', id: 'user-2'}, createdAt: new Date(Date.now() - 1000 * 60 * 5), isRead: false },
    { id: 'notif-2', type: 'invite', text: 'You were invited to "Weekly Standup & Team Sync".', relatedEntity: { type: 'room', id: 'room-4'}, createdAt: new Date(Date.now() - 1000 * 60 * 60), isRead: false },
    { id: 'notif-3', type: 'trending', text: 'Your room "Startup Pitch Practice & Feedback" is trending!', relatedEntity: { type: 'room', id: 'room-1'}, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3), isRead: true },
    { id: 'notif-4', type: 'mention', text: 'Charlie mentioned you in a chat.', relatedEntity: { type: 'user', id: 'user-3'}, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), isRead: true },
];