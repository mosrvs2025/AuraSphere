import React, { useState, useMemo, useCallback } from 'react';
import { Room, User, ChatMessage, Notification, Conversation } from './types';
import { MOCK_ROOMS, MOCK_USER_HOST, users as MOCK_USERS, MOCK_CONVERSATIONS, MOCK_NOTIFICATIONS } from './constants';
import RoomView from './components/RoomView';
import { UserContext } from './context/UserContext';
import Sidebar from './components/Sidebar';
import HomeView from './components/HomeView';
import { TrendingView, MyStudioView } from './components/PlaceholderViews';
import { MenuIcon } from './components/Icons';
import CreateRoomModal from './components/CreateRoomModal';
import ProfileView from './components/ProfileView';
import MessagesView from './components/MessagesView';
import EditProfileModal from './components/EditProfileModal';
import NotificationsView from './components/NotificationsView';
import ScheduledView from './components/ScheduledView';
import ConversationView from './components/ConversationView';

const allMockUsers = [...new Map(MOCK_USERS.map(item => [item.id, item])).values()];

type ActiveView = 'home' | 'trending' | 'messages' | 'scheduled' | 'profile' | 'notifications' | 'my-studio';

const App: React.FC = () => {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [users, setUsers] = useState<User[]>(allMockUsers);
  const [rooms, setRooms] = useState<Room[]>(MOCK_ROOMS);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [activeView, setActiveView] = useState<ActiveView>('home');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isCreateRoomModalOpen, setCreateRoomModalOpen] = useState(false);
  const [isEditProfileModalOpen, setEditProfileModalOpen] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

  const currentUser = useMemo(() => {
    return users.find(u => u.id === MOCK_USER_HOST.id) || MOCK_USER_HOST;
  }, [users]);
  
  const unreadNotificationCount = useMemo(() => notifications.filter(n => !n.isRead).length, [notifications]);

  const updateUser = useCallback((updatedUser: User) => {
    setUsers(currentUsers => currentUsers.map(user => user.id === updatedUser.id ? updatedUser : user));
  }, []);

  const updateUserAvatar = (newAvatarUrl: string, isGenerated: boolean = false) => {
    updateUser({ ...currentUser, avatarUrl: newAvatarUrl, isGenerated });
  };

  const handleUpdateProfile = (name: string, bio: string) => {
     updateUser({ ...currentUser, name, bio });
     setEditProfileModalOpen(false);
  }

  const updateRoomState = useCallback((roomId: string, updatedRoomData: Partial<Room>) => {
    const updatedRooms = rooms.map(r => r.id === roomId ? { ...r, ...updatedRoomData } : r);
    setRooms(updatedRooms);
    if (selectedRoom?.id === roomId) {
        setSelectedRoom(prev => prev ? { ...prev, ...updatedRoomData } : null);
    }
  }, [rooms, selectedRoom]);

  const stopScreenShare = (roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    if (room?.screenShareStream) {
        room.screenShareStream.getTracks().forEach(track => track.stop());
    }
    updateRoomState(roomId, { screenShareStream: undefined });
  };
  
  const toggleScreenShare = async (roomId: string) => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        alert("Screen sharing is not supported by your browser or you are not in a secure (HTTPS) context.");
        console.error("Screen share error: getDisplayMedia not available.");
        return;
    }
    
    const roomToUpdate = rooms.find(r => r.id === roomId);
    if (!roomToUpdate) return;

    if (roomToUpdate.screenShareStream) {
      stopScreenShare(roomId);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: { cursor: "always" } as any, audio: false });
      const track = stream.getVideoTracks()[0];
      track.onended = () => stopScreenShare(roomId);
      updateRoomState(roomId, { screenShareStream: stream });
    } catch (err) {
      console.error("Screen share error:", err);
    }
  };
  
  const handleCreateRoom = (title: string, description: string, isPrivate: boolean) => {
    const newRoom: Room = {
      id: `room-${Date.now()}`,
      title,
      tags: description.split(' ').filter(tag => tag.startsWith('#')).map(tag => tag.substring(1)),
      hosts: [currentUser],
      speakers: [currentUser],
      listeners: [],
      createdAt: new Date(),
      isPrivate,
    };
    
    setRooms(prevRooms => [newRoom, ...prevRooms]);
    setCreateRoomModalOpen(false);
    setSelectedRoom(newRoom);
  };

  const enterRoom = (room: Room) => {
    const isParticipant = [...room.hosts, ...room.speakers, ...room.listeners].some(u => u.id === currentUser.id);
    if (!isParticipant) {
      const updatedRoom = { ...room, listeners: [...room.listeners, currentUser] };
      updateRoomState(room.id, { listeners: updatedRoom.listeners });
      setSelectedRoom(updatedRoom);
    } else {
      setSelectedRoom(room);
    }
  };

  const leaveRoom = () => {
    if (selectedRoom) {
      const updatedListeners = selectedRoom.listeners.filter(u => u.id !== currentUser.id);
      const updatedSpeakers = selectedRoom.speakers.filter(u => u.id !== currentUser.id);
      updateRoomState(selectedRoom.id, { listeners: updatedListeners, speakers: updatedSpeakers });
    }
    setSelectedRoom(null);
  };
  
  const handleNewMessage = (roomId: string, message: ChatMessage) => {
     const room = rooms.find(r => r.id === roomId);
     if(!room) return;

     const isHost = room.hosts.some(h => h.id === message.user.id);

     if(message.voiceMemo && !isHost) {
        const queue = room.moderationQueue || [];
        updateRoomState(roomId, { moderationQueue: [...queue, message] });
     }
  };
  
  const handleNotificationClick = (notification: Notification) => {
      setNotifications(prev => prev.map(n => n.id === notification.id ? {...n, isRead: true} : n));
      const { type, relatedEntity } = notification;
      if (relatedEntity.type === 'user') {
          setSelectedProfileId(relatedEntity.id);
          setActiveView('profile');
      } else if (relatedEntity.type === 'room') {
          const room = rooms.find(r => r.id === relatedEntity.id);
          if (room) {
              if (room.isScheduled) {
                  setActiveView('scheduled');
              } else {
                  enterRoom(room);
              }
          }
      }
  };
  
  const clearSelectedProfile = () => setSelectedProfileId(null);
  
  const handleViewChange = (view: ActiveView) => {
    clearSelectedProfile();
    setSelectedRoom(null);
    setSelectedConversation(null);
    setActiveView(view);
    setSidebarOpen(false);
  }

  const renderActiveView = () => {
    if (selectedProfileId) {
        const userToShow = users.find(u => u.id === selectedProfileId) || currentUser;
        return <ProfileView user={userToShow} allRooms={rooms} onEditProfile={() => setEditProfileModalOpen(true)} currentUser={currentUser}/>;
    }
    
    switch (activeView) {
      case 'home':
        return <HomeView rooms={rooms.filter(r => !r.isScheduled)} onEnterRoom={enterRoom} currentUser={currentUser} />;
      case 'trending':
        return <TrendingView />;
      case 'messages':
        return <MessagesView conversations={MOCK_CONVERSATIONS} currentUser={currentUser} onConversationSelect={setSelectedConversation} />;
      case 'scheduled':
        return <ScheduledView rooms={rooms.filter(r => r.isScheduled)} />;
      case 'profile':
        return <ProfileView user={currentUser} allRooms={rooms} onEditProfile={() => setEditProfileModalOpen(true)} currentUser={currentUser}/>;
       case 'my-studio':
        return <MyStudioView />;
      case 'notifications':
        return <NotificationsView notifications={notifications} onNotificationClick={handleNotificationClick} />;
      default:
        return <HomeView rooms={rooms.filter(r => !r.isScheduled)} onEnterRoom={enterRoom} currentUser={currentUser} />;
    }
  };
  
  const mainContent = () => {
      if (selectedRoom) {
          return (
              <div className="max-w-lg mx-auto p-0 md:p-4 h-full">
                  <RoomView 
                      room={selectedRoom} 
                      onLeave={leaveRoom} 
                      onToggleScreenShare={() => toggleScreenShare(selectedRoom.id)}
                      onNewMessage={(message) => handleNewMessage(selectedRoom.id, message)}
                      onUpdateRoom={(data) => updateRoomState(selectedRoom.id, data)}
                  />
              </div>
          );
      }
      if (selectedConversation) {
          return <ConversationView conversation={selectedConversation} currentUser={currentUser} onBack={() => setSelectedConversation(null)} />;
      }
      return renderActiveView();
  };

  return (
    <UserContext.Provider value={{ currentUser, updateUserAvatar }}>
      <div className="h-full flex bg-gradient-to-br from-gray-900 via-slate-900 to-black antialiased font-sans">
        <Sidebar 
          activeView={activeView}
          setActiveView={handleViewChange}
          isSidebarOpen={isSidebarOpen}
          setSidebarOpen={setSidebarOpen}
          onCreateRoom={() => setCreateRoomModalOpen(true)}
          unreadNotificationCount={unreadNotificationCount}
        />
        <main className="flex-1 flex flex-col overflow-y-auto">
          <div className="md:hidden flex items-center justify-between p-4 border-b border-gray-800 sticky top-0 bg-gray-900/80 backdrop-blur-sm z-10">
            <button onClick={() => setSidebarOpen(true)} className="text-gray-300 hover:text-white">
              <MenuIcon />
            </button>
            <h1 className="text-xl font-bold text-white tracking-tight">AuraSphere</h1>
            <div className="w-6 h-6">
               <img src={currentUser.avatarUrl} alt="Current user" className="w-8 h-8 rounded-full"/>
            </div>
          </div>
          
          <div className="flex-1">
            {mainContent()}
          </div>
        </main>

        {isCreateRoomModalOpen && <CreateRoomModal onClose={() => setCreateRoomModalOpen(false)} onCreate={handleCreateRoom} />}
        {isEditProfileModalOpen && <EditProfileModal user={currentUser} onClose={() => setEditProfileModalOpen(false)} onSave={handleUpdateProfile} />}
      </div>
    </UserContext.Provider>
  );
};

export default App;