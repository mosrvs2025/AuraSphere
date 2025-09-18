import { User, Room, UserRole } from './types';

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
};

export const MOCK_USER_LISTENER: User = {
  id: 'user-listener-1',
  name: 'Sam',
  avatarUrl: 'https://picsum.photos/seed/sam/100/100',
  role: UserRole.LISTENER,
};

export const users: User[] = [
  MOCK_USER_HOST,
  { id: 'user-2', name: 'Brenda', avatarUrl: 'https://picsum.photos/seed/brenda/100/100', role: UserRole.HOST },
  { id: 'user-3', name: 'Charlie', avatarUrl: 'https://picsum.photos/seed/charlie/100/100', role: UserRole.SPEAKER },
  { id: 'user-4', name: 'Dana', avatarUrl: 'https://picsum.photos/seed/dana/100/100', role: UserRole.SPEAKER },
  { id: 'user-5', name: 'Evan', avatarUrl: 'https://picsum.photos/seed/evan/100/100', role: UserRole.LISTENER },
  MOCK_USER_LISTENER,
  { id: 'user-7', name: 'Fiona', avatarUrl: 'https://picsum.photos/seed/fiona/100/100', role: UserRole.LISTENER },
  { id: 'user-8', name: 'George', avatarUrl: 'https://picsum.photos/seed/george/100/100', role: UserRole.LISTENER },
  { id: 'user-9', name: 'Hannah', avatarUrl: 'https://picsum.photos/seed/hannah/100/100', role: UserRole.LISTENER },
  { id: 'user-10', name: 'Ian', avatarUrl: 'https://picsum.photos/seed/ian/100/100', role: UserRole.LISTENER },
];

export const MOCK_ROOMS: Room[] = [
  {
    id: 'room-1',
    title: 'Startup Pitch Practice & Feedback',
    tags: ['Tech', 'Business', 'Startups'],
    hosts: [users[0], users[1]],
    speakers: [users[2], users[3]],
    listeners: users.slice(4),
  },
  {
    id: 'room-2',
    title: 'The Future of AI in Creative Fields',
    tags: ['AI', 'Art', 'Design'],
    hosts: [users[2]],
    speakers: [users[0], users[4]],
    listeners: users.filter(u => ![users[0], users[2], users[4]].includes(u)),
  },
  {
    id: 'room-3',
    title: 'Late Night Chill: Lo-fi Beats & Convos',
    tags: ['Music', 'Chill', 'Community'],
    hosts: [users[4]],
    speakers: [users[6]],
    listeners: users.filter(u => ![users[4], users[6]].includes(u)),
  },
];