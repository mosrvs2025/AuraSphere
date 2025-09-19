import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import HomeView from './components/HomeView';
import RoomView from './components/RoomView';
import ProfileView from './components/ProfileView';
import MessagesView from './components/MessagesView';
import ConversationView from './components/ConversationView';
import NotificationsView from './components/NotificationsView';
import ScheduledView from './components/ScheduledView';
import { TrendingView, MyStudioView } from './components/PlaceholderViews';
import CreateRoomModal from './components/CreateRoomModal';
import EditProfileModal from './components/EditProfileModal';
import AvatarCustomizer from './components/AvatarCustomizer';
import Header from './components/Header';
import { UserContext } from './context/UserContext';
import { ActiveView, User, Room, ChatMessage, Conversation, Notification } from './types';

// --- MOCK DATA ---
const ALL_USERS: User[] = [
    { id: 'u1', name: 'Alex', avatarUrl: 'https://i.pravatar.cc/150?img=11', bio: 'Host of The Future of Tech. Web3 enthusiast.', followers: [], following: [] },
    { id: 'u2', name: 'Maria', avatarUrl: 'https://i.pravatar.cc/150?img=12', bio: 'UX Designer & creative mind. Love talking about design systems.', followers: [], following: [] },
    { id: 'u3', name: 'David', avatarUrl: 'https://i.pravatar.cc/150?img=13', bio: 'Building in public. Founder @ Cool Startup.', followers: [], following: [] },
    { id: 'u4', name: 'Sophia', avatarUrl: 'https://i.pravatar.cc/150?img=14', bio: 'AI researcher and podcast host.', followers: [], following: [] },
    { id: 'u5', name: 'Leo', avatarUrl: 'https://i.pravatar.cc/150?img=15', followers: [], following: [] },
    { id: 'u6', name: 'Isabella', avatarUrl: 'https://i.pravatar.cc/150?img=16', followers: [], following: [] },
    { id: 'u7', name: 'Ethan', avatarUrl: 'https://i.pravatar.cc/150?img=17', followers: [], following: [] },
];

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User>({ ...ALL_USERS[0], followers: [ALL_USERS[1], ALL_USERS[3]], following: [ALL_USERS[2]] });
  const [activeView, setActiveView] = useState<ActiveView>('home');
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [profileUser, setProfileUser] = useState<User>(currentUser);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  
  const [isCreateRoomModalOpen, setCreateRoomModalOpen] = useState(false);
  const [isEditProfileModalOpen, setEditProfileModalOpen] = useState(false);
  const [isAvatarCustomizerOpen, setAvatarCustomizerOpen] = useState(false);

  const [rooms, setRooms] = useState<Room[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // This would be a fetch call in a real app
    setRooms([
        { id: 'r1', title: 'The Future of Tech 🚀', hosts: [ALL_USERS[0]], speakers: [ALL_USERS[1]], listeners: [ALL_USERS[2], ALL_USERS[3], ALL_USERS[4]], messages: [], isPrivate: false },
        { id: 'r2', title: 'Design Systems & You', hosts: [ALL_USERS[1]], speakers: [ALL_USERS[0]], listeners: [ALL_USERS[3], ALL_USERS[5], ALL_USERS[6]], messages: [], isPrivate: false },
        { id: 'r3', title: 'Startup Grind: Building in Public', hosts: [ALL_USERS[2]], speakers: [], listeners: [ALL_USERS[0], ALL_USERS[1], ALL_USERS[4]], messages: [], isPrivate: false },
        { id: 'r4', title: 'Scheduled: AI Ethics Discussion', hosts: [ALL_USERS[3]], speakers: [], listeners: [], messages: [], isPrivate: false, isScheduled: true, scheduledTime: new Date(Date.now() + 24 * 60 * 60 * 1000) },
    ]);
    setConversations([
        { id: 'c1', participants: [currentUser, ALL_USERS[1]], messages: [{ id: 'm1', user: ALL_USERS[1], text: 'Hey, great talk yesterday!', createdAt: new Date(Date.now() - 60000) }] },
        { id: 'c2', participants: [currentUser, ALL_USERS[2]], messages: [{ id: 'm2', user: ALL_USERS[2], text: 'Can you send me that link?', createdAt: new Date(Date.now() - 120000) }] },
    ]);
    setNotifications([
        { id: 'n1', text: 'Maria started following you.', relatedUser: ALL_USERS[1], type: 'follow', createdAt: new Date(), isRead: false },
        { id: 'n2', text: 'The room "AI Ethics Discussion" is starting soon.', relatedRoomId: 'r4', type: 'room_start', createdAt: new Date(), isRead: true },
    ]);
  }, [currentUser]);

  const updateCurrentUser = (userData: Partial<User>) => {
    setCurrentUser(prev => ({ ...prev, ...userData }));
  };

  const getUserById = useCallback((id: string): User | undefined => {
    return ALL_USERS.find(u => u.id === id) || (id === currentUser.id ? currentUser : undefined);
  }, [currentUser]);

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
    setActiveView('home'); // To ensure view logic shows the room
  };
  
  const handleEditProfile = (name: string, bio: string) => {
      updateCurrentUser({ name, bio });
      setEditProfileModalOpen(false);
  };
  
  const handleAvatarSelect = (url: string) => {
      updateCurrentUser({ avatarUrl: url });
      setAvatarCustomizerOpen(false);
  };
  
  const handleViewProfile = (user: User) => {
    setProfileUser(user);
    setActiveView('profile');
    setActiveRoom(null);
  };

  const changeView = (view: ActiveView) => {
    setActiveView(view);
    setActiveRoom(null);
    setActiveConversation(null);
    if(view === 'profile') setProfileUser(currentUser);
    setSidebarOpen(false);
  }

  const renderView = () => {
    if (activeRoom) {
      return <RoomView room={activeRoom} currentUser={currentUser} onLeave={() => setActiveRoom(null)} />;
    }
    if (activeConversation) {
        return <ConversationView conversation={activeConversation} currentUser={currentUser} onBack={() => setActiveConversation(null)} />;
    }
    
    switch (activeView) {
      case 'home': return <HomeView rooms={rooms.filter(r => !r.isScheduled)} onEnterRoom={setActiveRoom} />;
      case 'trending': return <TrendingView />;
      case 'messages': return <MessagesView conversations={conversations} currentUser={currentUser} onConversationSelect={setActiveConversation} />;
      case 'scheduled': return <ScheduledView rooms={rooms} />;
      case 'profile': return <ProfileView user={profileUser} allRooms={rooms} onEditProfile={() => setEditProfileModalOpen(true)} currentUser={currentUser}/>;
      case 'notifications': return <NotificationsView notifications={notifications} onNotificationClick={(n) => setNotifications(notifs => notifs.map(x => x.id === n.id ? {...x, isRead: true} : x))} />;
      case 'my-studio': return <MyStudioView />;
      default: return <HomeView rooms={rooms.filter(r => !r.isScheduled)} onEnterRoom={setActiveRoom} />;
    }
  };

  return (
    <UserContext.Provider value={{ currentUser, updateCurrentUser, getUserById }}>
      <div className="flex h-screen bg-gray-900 text-gray-100 font-sans">
        <Sidebar 
            activeView={activeView}
            setActiveView={changeView}
            isSidebarOpen={isSidebarOpen}
            setSidebarOpen={setSidebarOpen}
            onCreateRoom={() => setCreateRoomModalOpen(true)}
            unreadNotificationCount={notifications.filter(n => !n.isRead).length}
        />
        <main className="flex-1 flex flex-col overflow-hidden">
          <Header onToggleSidebar={() => setSidebarOpen(!isSidebarOpen)} />
          <div className="flex-1 overflow-y-auto">
            {renderView()}
          </div>
        </main>
        {isCreateRoomModalOpen && <CreateRoomModal onClose={() => setCreateRoomModalOpen(false)} onCreate={handleCreateRoom} />}
        {isEditProfileModalOpen && <EditProfileModal user={currentUser} onClose={() => setEditProfileModalOpen(false)} onSave={handleEditProfile} />}
        {isAvatarCustomizerOpen && <AvatarCustomizer onClose={() => setAvatarCustomizerOpen(false)} onAvatarSelect={handleAvatarSelect} />}
      </div>
    </UserContext.Provider>
  );
};

export default App;
