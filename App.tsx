
import React, { useState, useEffect, useRef } from 'react';
import RoomView from './components/RoomView';
import { MyStudioView } from './components/PlaceholderViews';
import TrendingView from './components/TrendingView';
import MessagesView from './components/MessagesView';
import ScheduledView from './components/ScheduledView';
import UserProfile from './components/UserProfile';
import NotificationsView from './components/NotificationsView';
import ConversationView from './components/ConversationView';
import CreateRoomModal from './components/CreateRoomModal';
import EditProfileModal from './components/EditProfileModal';
import AvatarCustomizer from './components/AvatarCustomizer';
import UserCardModal from './components/UserCardModal';
import MiniPlayer from './components/MiniPlayer';
import MediaViewerModal from './components/MediaViewerModal';
import PostDetailView from './components/PostDetailView';
import { UserContext } from './context/UserContext';
import { ActiveView, Room, User, ChatMessage, Notification, Conversation, DiscoverItem, ModalPosition } from './types';
import CreateHubModal from './components/CreateHubModal';
import CreatePostView from './components/CreatePostView';
import CreateNoteView from './components/CreateNoteView';
import BottomNavBar from './components/BottomNavBar';
import InAppBrowser from './components/InAppBrowser';
import GlobalHeader from './components/GlobalHeader';
import GlobalSearchView from './components/GlobalSearchView';


// --- MOCK DATA ---
const createMockUsers = (count: number): User[] => {
  const users: User[] = [];
  for (let i = 1; i <= count; i++) {
    users.push({
      id: `user-${i}`,
      name: `User ${i}`,
      avatarUrl: `https://i.pravatar.cc/150?img=${i}`,
      bio: `This is the bio for user ${i}. I am passionate about technology and live audio.`,
      followers: [],
      following: [],
    });
  }
  return users;
};

const mockUsers = createMockUsers(20);

const App: React.FC = () => {
    
    const [users, setUsers] = useState<User[]>(mockUsers);
    const [currentUser, setCurrentUser] = useState<User>({
        id: 'user-0',
        name: 'You',
        avatarUrl: 'https://i.pravatar.cc/150?img=0',
        bio: 'This is your bio. Edit it to tell others about yourself!',
        followers: [users[1], users[2]],
        following: [users[3], users[4], users[5]],
    });

    const [rooms, setRooms] = useState<Room[]>([
        {
            id: 'room-1',
            title: 'Tech Talk Weekly',
            description: 'Discussing the latest in tech news and gadgets.',
            hosts: [users[1], users[2]],
            speakers: [users[3], users[4]],
            listeners: [users[5], users[6], users[7]],
            messages: [],
            isPrivate: false,
            featuredUrl: 'https://techcrunch.com',
        },
        {
            id: 'room-2',
            title: 'The Future of AI',
            description: 'A deep dive into generative AI and its impact.',
            hosts: [users[8]],
            speakers: [users[9]],
            listeners: users.slice(10, 15),
            messages: [],
            isPrivate: false,
        },
        {
            id: 'room-3',
            title: 'Chill Lo-fi Beats',
            description: '24/7 study and relaxation session.',
            hosts: [users[15]],
            speakers: [],
            listeners: users.slice(16, 20),
            messages: [],
            isPrivate: true,
        },
        {
            id: 'room-4',
            title: 'Upcoming: The Startup Grind',
            description: 'Interviews with successful startup founders.',
            hosts: [currentUser],
            speakers: [],
            listeners: [],
            messages: [],
            isPrivate: false,
            isScheduled: true,
            scheduledTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        }
    ]);
    
    const [conversations, setConversations] = useState<Conversation[]>([
      {
        id: 'convo-1',
        participants: [currentUser, users[3]],
        messages: [
          { id: 'c1m1', user: users[3], text: 'Hey, saw you in the tech talk room, great points!', createdAt: new Date(Date.now() - 60000 * 5) },
          { id: 'c1m2', user: currentUser, text: 'Thanks! Appreciate it.', createdAt: new Date(Date.now() - 60000 * 4) }
        ]
      }
    ]);

    const [notifications, setNotifications] = useState<Notification[]>([
        { id: 'n1', text: `${users[1].name} started a new room: "Tech Talk Weekly"`, createdAt: new Date(), isRead: false, type: 'room_start', relatedRoomId: 'room-1' },
        { id: 'n2', text: `${users[4].name} followed you.`, createdAt: new Date(Date.now() - 3600