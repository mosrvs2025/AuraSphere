// Implemented the main App component to manage application state, views, and modals.
// This resolves module and component definition errors.
import React, { useState, useCallback } from 'react';
import { UserContext } from './context/UserContext';
import { RoomActionsContext } from './context/RoomActionsContext';
// FIX: Imported ActiveView from types.ts to resolve type conflict.
import { User, Room, Notification, Conversation, ActiveView } from './types';
import { MOCK_ROOMS, MOCK_USER_LISTENER, MOCK_NOTIFICATIONS, MOCK_CONVERSATIONS } from './constants';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import HomeView from './components/HomeView';
import RoomView from './components/RoomView';
import ProfileView from './components/ProfileView';
import MessagesView from './components/MessagesView';
import ConversationView from './components/ConversationView';
import { TrendingView, MyStudioView } from './components/PlaceholderViews';
import ScheduledView from './components/ScheduledView';
import NotificationsView from './components/NotificationsView';
import CreateRoomModal from './components/CreateRoomModal';
import EditProfileModal from './components/EditProfileModal';
import AvatarCustomizer from './components/AvatarCustomizer';


const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User>(MOCK_USER_LISTENER);
  const [rooms, setRooms] = useState<Room[]>(MOCK_ROOMS);
  const [activeView, setActiveView] = useState<ActiveView>('home');
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [viewingProfile, setViewingProfile] = useState<User | null>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isCustomizingAvatar, setIsCustomizingAvatar] = useState(false);
  
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [conversations, setConversations] = useState<Conversation[]>(MOCK_CONVERSATIONS);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);

  const [isSharingScreen, setIsSharingScreen] = useState(false);

  const updateUserAvatar = (newAvatarUrl: string) => {
    setCurrentUser(prev => ({ ...prev, avatarUrl: newAvatarUrl }));
    setIsCustomizingAvatar(false);
  };
  
  const handleCreateRoom = (title: string, description: string, isPrivate: boolean) => {
    const newRoom: Room = {
      id: `room-${Date.now()}`,
      title,
      description,
      isPrivate,
      hosts: [currentUser],
      speakers: [],
      listeners: [],
      messages: [],
    };
    setRooms(prev => [newRoom, ...prev]);
    setCurrentRoom(newRoom);
    setIsCreatingRoom(false);
    setSidebarOpen(false); // UX Polish: Close sidebar on Go Live
  };

  const handleUpdateRoom = (updatedData: Partial<Room>) => {
    if (currentRoom) {
      const updatedRoom = { ...currentRoom, ...updatedData };
      setCurrentRoom(updatedRoom);
      setRooms(prev => prev.map(r => r.id === updatedRoom.id ? updatedRoom : r));
    }
  };

  const handleSendMessage = (room: Room, message: { text: string }) => {
    const newMessage = { id: `msg-${Date.now()}`, user: currentUser, text: message.text, createdAt: new Date() };
    const updatedRoom = { ...room, messages: [...room.messages, newMessage] };
    setCurrentRoom(updatedRoom);
    setRooms(prev => prev.map(r => r.id === room.id ? updatedRoom : r));
  };

  const handleSelectConversation = (conversation: Conversation) => {
    setActiveConversation(conversation);
    setActiveView('conversation');
  };
  
  const handleNotificationClick = (notification: Notification) => {
    setNotifications(prev => prev.map(n => n.id === notification.id ? {...n, isRead: true} : n));
    
    if (notification.type === 'follow' && notification.relatedUser) {
        handleSetActiveView('profile');
        setViewingProfile(notification.relatedUser);
    } else if ((notification.type === 'room_start' || notification.type === 'room_invite') && notification.relatedRoomId) {
        const room = rooms.find(r => r.id === notification.relatedRoomId);
        if (room) {
            if (room.isScheduled) {
                handleSetActiveView('scheduled');
            } else {
                setCurrentRoom(room);
            }
        }
    }
  };

  const handleToggleScreenShare = async () => {
    // This would contain real screen sharing logic (e.g., WebRTC)
    setIsSharingScreen(prev => !prev);
  };

  const renderActiveView = () => {
    if (currentRoom) {
      return (
        <RoomView
          room={currentRoom}
          currentUser={currentUser}
          onLeave={() => setCurrentRoom(null)}
          onUpdateRoom={handleUpdateRoom}
          onSendMessage={(message) => handleSendMessage(currentRoom, message)}
        />
      );
    }

    if (viewingProfile) {
        return (
            <ProfileView 
                user={viewingProfile} 
                allRooms={rooms} 
                onEditProfile={() => {
                    if (viewingProfile.id === currentUser.id) {
                        setIsEditingProfile(true);
                    }
                }}
                currentUser={currentUser}
            />
        );
    }
    
    const viewMap: Record<ActiveView, React.ReactNode> = {
      home: <HomeView rooms={rooms.filter(r => !r.isScheduled)} onEnterRoom={setCurrentRoom} />,
      trending: <TrendingView />,
      messages: <MessagesView conversations={conversations} currentUser={currentUser} onConversationSelect={handleSelectConversation} />,
      conversation: activeConversation ? <ConversationView conversation={activeConversation} currentUser={currentUser} onBack={() => { setActiveConversation(null); setActiveView('messages'); }} /> : <MessagesView conversations={conversations} currentUser={currentUser} onConversationSelect={handleSelectConversation} />,
      scheduled: <ScheduledView rooms={rooms.filter(r => r.isScheduled)} />,
      profile: <ProfileView user={currentUser} allRooms={rooms} onEditProfile={() => setIsEditingProfile(true)} currentUser={currentUser} />,
      'my-studio': <MyStudioView />,
      notifications: <NotificationsView notifications={notifications} onNotificationClick={handleNotificationClick} />,
    };

    return viewMap[activeView];
  };
  
  const handleSetActiveView = useCallback((view: ActiveView) => {
    setActiveView(view);
    setCurrentRoom(null); // Leave room when navigating away
    if (view !== 'profile') {
        setViewingProfile(null);
    }
    if (view === 'profile' && !viewingProfile) {
        setViewingProfile(currentUser);
    }
    setSidebarOpen(false);
  }, [currentUser, viewingProfile]);
  
  const viewTitles: Record<ActiveView, string> = {
    home: 'Live Now',
    trending: 'Trending',
    messages: 'Messages',
    conversation: '', // Handled in ConversationView
    scheduled: 'Scheduled Rooms',
    profile: 'Profile',
    'my-studio': 'My Studio',
    notifications: 'Notifications',
  };

  return (
    <UserContext.Provider value={{ currentUser, updateUserAvatar }}>
      <RoomActionsContext.Provider value={{ isSharingScreen, onToggleScreenShare: handleToggleScreenShare }}>
        <div className="bg-gray-900 text-white min-h-screen flex">
          <Sidebar
            activeView={activeView}
            setActiveView={handleSetActiveView}
            isSidebarOpen={isSidebarOpen}
            setSidebarOpen={setSidebarOpen}
            onCreateRoom={() => setIsCreatingRoom(true)}
            unreadNotificationCount={notifications.filter(n => !n.isRead).length}
          />

          <main className="flex-1 flex flex-col relative">
            {!currentRoom && activeView !== 'conversation' && (
              <Header
                title={viewingProfile ? viewingProfile.name : viewTitles[activeView]}
                onMenuClick={() => setSidebarOpen(true)}
                showSearch={activeView === 'home'}
              />
            )}
            <div className="flex-1 overflow-y-auto">
              {renderActiveView()}
            </div>
          </main>
          
          {isCreatingRoom && (
            <CreateRoomModal
              onClose={() => setIsCreatingRoom(false)}
              onCreate={handleCreateRoom}
            />
          )}

          {isEditingProfile && (
            <EditProfileModal 
              user={currentUser}
              onClose={() => setIsEditingProfile(false)}
              onSave={(name, bio) => {
                setCurrentUser(prev => ({ ...prev, name, bio }));
                setViewingProfile(prev => prev ? { ...prev, name, bio } : null);
                setIsEditingProfile(false);
              }}
            />
          )}

          {isCustomizingAvatar && (
            <AvatarCustomizer 
              onClose={() => setIsCustomizingAvatar(false)}
              onAvatarSelect={updateUserAvatar}
            />
          )}
        </div>
      </RoomActionsContext.Provider>
    </UserContext.Provider>
  );
};

export default App;