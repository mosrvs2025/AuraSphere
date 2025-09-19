// Fix: Implemented the main App component, including state management, view routing, and mock data to create a functional application structure and resolve compilation errors.
import React, { useState, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import RoomView from './components/RoomView';
import Header from './components/Header';
import CreateRoomModal from './components/CreateRoomModal';
import EditProfileModal from './components/EditProfileModal';
import UserProfile from './components/UserProfile';
import MessagesView from './components/MessagesView';
import ConversationView from './components/ConversationView';
import ScheduledView from './components/ScheduledView';
import NotificationsView from './components/NotificationsView';
import AvatarCustomizer from './components/AvatarCustomizer';
import UserCardModal from './components/UserCardModal';
import DiscoverView from './components/SearchViewModal';
import TrendingView from './components/TrendingView';
import { MyStudioView } from './components/PlaceholderViews';
import { User, Room, ChatMessage, Conversation, Notification, ActiveView, ModalPosition, DiscoverItem } from './types';
import { UserContext } from './context/UserContext';

// --- MOCK DATA ---
const allUsersData: User[] = [
  { id: 'u1', name: 'Alex Reid', avatarUrl: 'https://i.pravatar.cc/150?img=11', bio: 'Building the future of audio.', followers: [], following: [] },
  { id: 'u2', name: 'Bella Chen', avatarUrl: 'https://i.pravatar.cc/150?img=12', bio: 'Designer & Dreamer.', followers: [], following: [] },
  { id: 'u3', name: 'Chris Evans', avatarUrl: 'https://i.pravatar.cc/150?img=13', bio: 'Exploring the web3 space.', followers: [], following: [] },
  { id: 'u4', name: 'Diana Prince', avatarUrl: 'https://i.pravatar.cc/150?img=14', bio: 'Musician and coffee enthusiast.', followers: [], following: [] },
  { id: 'u5', name: 'Ethan Hunt', avatarUrl: 'https://i.pravatar.cc/150?img=15', bio: 'Just here for the conversations.', followers: [], following: [] },
];

const initialCurrentUser: User = {
  id: 'u0',
  name: 'Jordan Lee',
  avatarUrl: 'https://i.pravatar.cc/150?img=10',
  bio: 'Host of the "Future Tech" room & avid learner.',
  followers: [allUsersData[0], allUsersData[2], allUsersData[3]],
  following: [allUsersData[1], allUsersData[4]],
};

// Establish reciprocal relationships for mock data
allUsersData[0].followers = [initialCurrentUser];
allUsersData[1].followers = [initialCurrentUser];
allUsersData[2].followers = [initialCurrentUser];
allUsersData[3].followers = [initialCurrentUser];
allUsersData[4].followers = [initialCurrentUser];


allUsersData.push(initialCurrentUser);

const initialRooms: Room[] = [
  {
    id: 'r1',
    title: '🚀 Future of Web Development in 2025',
    hosts: [allUsersData.find(u => u.id === 'u1')!],
    speakers: [allUsersData.find(u => u.id === 'u2')!],
    listeners: [allUsersData.find(u => u.id === 'u3')!, allUsersData.find(u => u.id === 'u4')!, initialCurrentUser],
    messages: [
        { id: 'm1', user: allUsersData[1], text: 'Great point about WASM!', createdAt: new Date(Date.now() - 60000 * 5) },
        { id: 'm2', user: allUsersData[3], text: 'What about AI code assistants?', createdAt: new Date(Date.now() - 60000 * 3) },
        { id: 'm3', user: initialCurrentUser, text: 'I think they are the future!', createdAt: new Date(Date.now() - 60000 * 1) },
    ],
    isPrivate: false,
  },
  {
    id: 'r2',
    title: '🎨 The Art of UI/UX Design',
    hosts: [allUsersData.find(u => u.id === 'u2')!],
    speakers: [],
    listeners: [allUsersData.find(u => u.id === 'u1')!, allUsersData.find(u => u.id === 'u5')!],
    messages: [],
    isPrivate: false,
  },
   {
    id: 'r3',
    title: '🗓️ Weekly Standup & Chill',
    hosts: [initialCurrentUser],
    speakers: [],
    listeners: [],
    messages: [],
    isPrivate: true,
    isScheduled: true,
    scheduledTime: new Date(Date.now() + 86400000 * 2), // 2 days from now
  },
];

const initialConversations: Conversation[] = [
    {
        id: 'c1',
        participants: [initialCurrentUser, allUsersData.find(u=> u.id === 'u2')!],
        messages: [
            { id: 'c1m1', user: allUsersData.find(u=> u.id === 'u2')!, text: 'Hey, loved your room yesterday!', createdAt: new Date(Date.now() - 3600000) },
            { id: 'c1m2', user: initialCurrentUser, text: 'Thanks Bella! Glad you could make it.', createdAt: new Date(Date.now() - 3540000) },
        ]
    }
];

const initialNotifications: Notification[] = [
    { id: 'n1', text: 'Alex Reid started a new room: "Future of Web..."', createdAt: new Date(Date.now() - 1000 * 60 * 10), isRead: false, type: 'room_start', relatedUser: allUsersData.find(u=> u.id === 'u1'), relatedRoomId: 'r1' },
    { id: 'n2', text: 'Bella Chen followed you.', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), isRead: true, type: 'follow', relatedUser: allUsersData.find(u=> u.id === 'u2') },
];

// --- MOCK DATA FOR DISCOVER PAGE ---
const discoverFeedData: DiscoverItem[] = [
    { type: 'image_post', id: 'dp1', author: allUsersData[3], imageUrl: 'https://images.unsplash.com/photo-1517423568342-be669f65d36a?q=80&w=800', caption: 'Morning coffee vibes ☕️', likes: 120, comments: 15, createdAt: new Date(Date.now() - 3600000 * 2) },
    { type: 'live_room', ...initialRooms[0] },
    { type: 'text_post', id: 'dp2', author: allUsersData[2], content: 'Just had a breakthrough on a new Web3 concept. The decentralization possibilities are endless!', likes: 54, comments: 12, createdAt: new Date(Date.now() - 3600000 * 3) },
    { type: 'user_profile', ...allUsersData[4] },
    { type: 'video_post', id: 'dp3', author: allUsersData[0], thumbnailUrl: 'https://images.unsplash.com/photo-1529686342540-1b42b7c4a525?q=80&w=800', videoUrl: '#', caption: 'Unboxing the new dev kit!', likes: 302, comments: 45, createdAt: new Date(Date.now() - 3600000 * 5) },
    { type: 'live_room', ...initialRooms[1] },
    { type: 'image_post', id: 'dp4', author: allUsersData[1], imageUrl: 'https://images.unsplash.com/photo-1555099962-4199c345e546?q=80&w=800', caption: 'Finally finished this component design.', likes: 250, comments: 30, createdAt: new Date(Date.now() - 3600000 * 8) },
    { type: 'text_post', id: 'dp5', author: initialCurrentUser, content: 'Excited to host my weekly standup room later. Hope to see you all there!', likes: 99, comments: 8, createdAt: new Date(Date.now() - 3600000 * 1) },
    { type: 'user_profile', ...allUsersData[3] },
];

const trendingFeedData: DiscoverItem[] = [
    { type: 'video_post', id: 'dp3', author: allUsersData[0], thumbnailUrl: 'https://images.unsplash.com/photo-1529686342540-1b42b7c4a525?q=80&w=800', videoUrl: '#', caption: 'Unboxing the new dev kit!', likes: 302, comments: 45, createdAt: new Date(Date.now() - 3600000 * 5) },
    { type: 'image_post', id: 'dp4', author: allUsersData[1], imageUrl: 'https://images.unsplash.com/photo-1555099962-4199c345e546?q=80&w=800', caption: 'Finally finished this component design.', likes: 250, comments: 30, createdAt: new Date(Date.now() - 3600000 * 8) },
    { type: 'live_room', ...initialRooms[0] },
    { type: 'image_post', id: 'dp1', author: allUsersData[3], imageUrl: 'https://images.unsplash.com/photo-1517423568342-be669f65d36a?q=80&w=800', caption: 'Morning coffee vibes ☕️', likes: 120, comments: 15, createdAt: new Date(Date.now() - 3600000 * 2) },
];


const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User>(initialCurrentUser);
  const [allUsers, setAllUsers] = useState<User[]>(allUsersData);
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  
  const [activeView, setActiveView] = useState<ActiveView>('home');
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [userCardModalUser, setUserCardModalUser] = useState<User | null>(null);
  const [userCardModalPosition, setUserCardModalPosition] = useState<ModalPosition | null>(null);

  const [isSidebarExpanded, setSidebarExpanded] = useState(true);
  const [isCreateRoomModalOpen, setCreateRoomModalOpen] = useState(false);
  const [isEditProfileModalOpen, setEditProfileModalOpen] = useState(false);
  const [isAvatarCustomizerOpen, setAvatarCustomizerOpen] = useState(false);
  const [focusSearchOnDiscover, setFocusSearchOnDiscover] = useState(false);

  const handleSetActiveView = (view: ActiveView) => {
    setActiveView(view);
    setActiveRoom(null);
    setActiveConversation(null);
    setFocusSearchOnDiscover(false); // Reset focus trigger on any navigation
    if (view !== 'profile') {
        setProfileUser(null);
    }
    // Close sidebar on mobile after navigation
    if (window.innerWidth < 768) {
        setSidebarExpanded(false);
    }
  };
  
  const handleSearchIconClick = () => {
    handleSetActiveView('home');
    setFocusSearchOnDiscover(true);
  };

  const handleEnterRoom = (room: Room) => {
    setActiveRoom(room);
  };

  const handleLeaveRoom = () => {
    setActiveRoom(null);
  };

  const handleCreateRoom = (title: string, description: string, isPrivate: boolean) => {
    const newRoom: Room = {
      id: `r${Date.now()}`,
      title,
      description,
      isPrivate,
      hosts: [currentUser],
      speakers: [],
      listeners: [],
      messages: [],
    };
    setRooms(prev => [newRoom, ...prev]);
    setCreateRoomModalOpen(false);
    setActiveRoom(newRoom);
  };

  const handleViewProfile = (user: User) => {
    setProfileUser(user);
    setActiveView('profile');
    setActiveRoom(null); // Leave room to view profile
    setUserCardModalUser(null); // Close card modal when viewing full profile
  };

  const handleEditProfile = (name: string, bio: string) => {
    setCurrentUser(prev => ({ ...prev, name, bio }));
    setEditProfileModalOpen(false);
  };
  
  const handleAvatarSelect = (url: string) => {
    setCurrentUser(prev => ({...prev, avatarUrl: url}));
    setAvatarCustomizerOpen(false);
  }
  
  const handleConversationSelect = (conversation: Conversation) => {
    setActiveConversation(conversation);
    setActiveView('conversation');
  };

  const handleNotificationClick = (notification: Notification) => {
      setNotifications(prev => prev.map(n => n.id === notification.id ? {...n, isRead: true} : n));
      // Potentially navigate based on notification type
      if (notification.relatedRoomId) {
          const room = rooms.find(r => r.id === notification.relatedRoomId);
          if (room) handleEnterRoom(room);
      } else if (notification.type === 'follow' && notification.relatedUser) {
          handleViewProfile(notification.relatedUser);
      }
  };

  const handleUserSelect = (user: User, position?: ModalPosition) => {
    if (user.id !== currentUser.id) {
        setUserCardModalUser(user);
        setUserCardModalPosition(position || null);
    }
  };

  const handleFollowUser = (userIdToFollow: string) => {
    const userToFollow = allUsers.find(u => u.id === userIdToFollow);
    if (!userToFollow || currentUser.following?.some(u => u.id === userIdToFollow)) return;

    setCurrentUser(prev => ({...prev, following: [...(prev.following || []), userToFollow]}));
    setAllUsers(prev => prev.map(u => u.id === userIdToFollow ? {...u, followers: [...(u.followers || []), currentUser]} : u));
  };
  
  const handleUnfollowUser = (userIdToUnfollow: string) => {
    setCurrentUser(prev => ({...prev, following: (prev.following || []).filter(u => u.id !== userIdToUnfollow)}));
    setAllUsers(prev => prev.map(u => u.id === userIdToUnfollow ? {...u, followers: (u.followers || []).filter(follower => follower.id !== currentUser.id)} : u));
  };

  const userContextValue = useMemo(() => ({
    currentUser,
    updateCurrentUser: (userData: Partial<User>) => setCurrentUser(prev => ({ ...prev, ...userData })),
    getUserById: (id: string) => allUsers.find(u => u.id === id),
    followUser: handleFollowUser,
    unfollowUser: handleUnfollowUser,
  }), [currentUser, allUsers]);

  const renderActiveView = () => {
    if (activeRoom) {
      return <RoomView room={activeRoom} currentUser={currentUser} onLeave={handleLeaveRoom} onUserSelect={handleUserSelect} selectedUser={userCardModalUser} />;
    }

    switch (activeView) {
      case 'home':
        return <DiscoverView
                allRooms={rooms}
                allUsers={allUsers}
                discoverFeed={discoverFeedData}
                onEnterRoom={handleEnterRoom}
                onViewProfile={handleViewProfile}
                autoFocusSearch={focusSearchOnDiscover}
            />;
      case 'profile':
         // When 'profile' nav is clicked, show current user's profile.
        const userToShow = profileUser || currentUser;
        return <UserProfile user={userToShow} allRooms={rooms} onEditProfile={() => setEditProfileModalOpen(true)} />;
      case 'messages':
        return <MessagesView conversations={conversations} currentUser={currentUser} onConversationSelect={handleConversationSelect} />;
      case 'conversation':
        return activeConversation ? <ConversationView conversation={activeConversation} currentUser={currentUser} onBack={() => handleSetActiveView('messages')} /> : <div/>;
      case 'scheduled':
        return <ScheduledView rooms={rooms} />;
      case 'notifications':
        return <NotificationsView notifications={notifications} onNotificationClick={handleNotificationClick} />;
      case 'trending':
        return <TrendingView 
                 feed={trendingFeedData}
                 onEnterRoom={handleEnterRoom}
                 onViewProfile={handleViewProfile}
               />;
      case 'my-studio':
        return <MyStudioView />;
      default:
        return <DiscoverView
                allRooms={rooms}
                allUsers={allUsers}
                discoverFeed={discoverFeedData}
                onEnterRoom={handleEnterRoom}
                onViewProfile={handleViewProfile}
                autoFocusSearch={focusSearchOnDiscover}
            />;
    }
  };

  return (
    <UserContext.Provider value={userContextValue}>
      <div className="bg-gray-900 text-white h-screen flex overflow-hidden font-sans">
        <Sidebar 
            activeView={activeView}
            setActiveView={handleSetActiveView}
            isExpanded={isSidebarExpanded}
            setExpanded={setSidebarExpanded}
            onCreateRoom={() => setCreateRoomModalOpen(true)}
            unreadNotificationCount={notifications.filter(n => !n.isRead).length}
        />
        <main className="flex-1 flex flex-col overflow-hidden">
            <Header onToggleSidebar={() => setSidebarExpanded(!isSidebarExpanded)} onSearchClick={handleSearchIconClick} />
            <div className="flex-1 overflow-y-auto">
                {renderActiveView()}
            </div>
        </main>
        
        {isCreateRoomModalOpen && (
          <CreateRoomModal onClose={() => setCreateRoomModalOpen(false)} onCreate={handleCreateRoom} />
        )}
        
        {isEditProfileModalOpen && (
          <EditProfileModal user={currentUser} onClose={() => setEditProfileModalOpen(false)} onSave={handleEditProfile} />
        )}

        {isAvatarCustomizerOpen && (
            <AvatarCustomizer onClose={() => setAvatarCustomizerOpen(false)} onAvatarSelect={handleAvatarSelect} />
        )}

        {userCardModalUser && (
            <UserCardModal
                user={userCardModalUser}
                position={userCardModalPosition}
                onClose={() => {
                    setUserCardModalUser(null);
                    setUserCardModalPosition(null);
                }}
                onViewProfile={handleViewProfile}
            />
        )}
      </div>
    </UserContext.Provider>
  );
};

export default App;