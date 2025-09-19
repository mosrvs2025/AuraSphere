import React, { useState, useMemo } from 'react';
import { Room, User, UserRole } from './types';
import { MOCK_ROOMS, MOCK_USER_HOST, MOCK_USER_LISTENER, users as MOCK_USERS } from './constants';
import RoomView from './components/RoomView';
import { UserContext } from './context/UserContext';
import Sidebar from './components/Sidebar';
import HomeView from './components/HomeView';
import { TrendingView, MessagesView, ScheduledView, ProfileView, NotificationsView, MyStudioView } from './components/PlaceholderViews';
import { MenuIcon } from './components/Icons';

// Create a unified list of users for state management, ensuring no duplicates
const allMockUsers = [...new Map(MOCK_USERS.map(item => [item.id, item])).values()];

type ActiveView = 'home' | 'trending' | 'messages' | 'scheduled' | 'profile' | 'notifications' | 'my-studio';

const App: React.FC = () => {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [users, setUsers] = useState<User[]>(allMockUsers);
  const [rooms, setRooms] = useState<Room[]>(MOCK_ROOMS);
  const [activeView, setActiveView] = useState<ActiveView>('home');
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  // Set a single, consistent user for the app experience.
  // The user's role (host/listener) is now determined by their actions within a room.
  const currentUser = useMemo(() => {
    return users.find(u => u.id === MOCK_USER_HOST.id) || MOCK_USER_HOST;
  }, [users]);

  const updateUserAvatar = (newAvatarUrl: string, isGenerated: boolean = false) => {
    const userId = currentUser.id;
    
    setUsers(currentUsers => currentUsers.map(user => 
      user.id === userId ? { ...user, avatarUrl: newAvatarUrl, isGenerated } : user
    ));

    const updatedRooms = rooms.map(room => ({
      ...room,
      hosts: room.hosts.map(user => user.id === userId ? { ...user, avatarUrl: newAvatarUrl, isGenerated } : user),
      speakers: room.speakers.map(user => user.id === userId ? { ...user, avatarUrl: newAvatarUrl, isGenerated } : user),
      listeners: room.listeners.map(user => user.id === userId ? { ...user, avatarUrl: newAvatarUrl, isGenerated } : user),
    }));
    setRooms(updatedRooms);
    
    if (selectedRoom) {
      const updatedSelectedRoom = updatedRooms.find(r => r.id === selectedRoom.id) || null;
      setSelectedRoom(updatedSelectedRoom);
    }
  };

  const stopScreenShare = (roomId: string) => {
    setRooms(prevRooms => {
      const room = prevRooms.find(r => r.id === roomId);
      if (room?.screenShareStream) {
        room.screenShareStream.getTracks().forEach(track => track.stop());
      }
      return prevRooms.map(r => 
        r.id === roomId ? { ...r, screenShareStream: undefined } : r
      );
    });

    if (selectedRoom?.id === roomId) {
      setSelectedRoom(prev => prev ? { ...prev, screenShareStream: undefined } : null);
    }
  };
  
  const toggleScreenShare = async (roomId: string) => {
    const roomToUpdate = rooms.find(r => r.id === roomId);
    if (!roomToUpdate) return;

    if (roomToUpdate.screenShareStream) {
      stopScreenShare(roomId);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: "always" } as any,
        audio: false,
      });

      const track = stream.getVideoTracks()[0];
      track.onended = () => stopScreenShare(roomId);

      const updatedRooms = rooms.map(r => r.id === roomId ? { ...r, screenShareStream: stream } : r);
      setRooms(updatedRooms);
      
      if (selectedRoom?.id === roomId) {
        setSelectedRoom(prev => prev ? {...prev, screenShareStream: stream} : null);
      }
    } catch (err) {
      console.error("Screen share error:", err);
    }
  };

  const enterRoom = (room: Room) => {
    const roomFromState = rooms.find(r => r.id === room.id);
    setSelectedRoom(roomFromState || room);
  };

  const leaveRoom = () => {
    setSelectedRoom(null);
  };

  const renderActiveView = () => {
    switch (activeView) {
      case 'home':
        return <HomeView rooms={rooms} onEnterRoom={enterRoom} />;
      case 'trending':
        return <TrendingView />;
      case 'messages':
        return <MessagesView />;
      case 'scheduled':
        return <ScheduledView />;
      case 'profile':
        return <ProfileView />;
       case 'my-studio':
        return <MyStudioView />;
      case 'notifications':
        return <NotificationsView />;
      default:
        return <HomeView rooms={rooms} onEnterRoom={enterRoom} />;
    }
  };

  return (
    <UserContext.Provider value={{ currentUser, updateUserAvatar }}>
      <div className="h-full flex bg-gradient-to-br from-gray-900 via-slate-900 to-black antialiased font-sans">
        <Sidebar 
          activeView={activeView}
          setActiveView={(view) => {
            setActiveView(view);
            setSidebarOpen(false); // Close sidebar on selection (mobile)
          }}
          isSidebarOpen={isSidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        <main className="flex-1 flex flex-col overflow-y-auto">
           {/* Mobile Header */}
          <div className="md:hidden flex items-center justify-between p-4 border-b border-gray-800 sticky top-0 bg-gray-900/80 backdrop-blur-sm z-10">
            <button onClick={() => setSidebarOpen(true)} className="text-gray-300 hover:text-white">
              <MenuIcon />
            </button>
            <h1 className="text-xl font-bold text-white tracking-tight">AuraSphere</h1>
            <div className="w-6 h-6"> {/* Spacer */}
               <img src={currentUser.avatarUrl} alt="Current user" className="w-8 h-8 rounded-full"/>
            </div>
          </div>
          
          <div className="flex-1">
            {selectedRoom ? (
              <div className="max-w-lg mx-auto p-0 md:p-4 h-full">
                <RoomView 
                  room={selectedRoom} 
                  onLeave={leaveRoom} 
                  onToggleScreenShare={() => toggleScreenShare(selectedRoom.id)} 
                />
              </div>
            ) : (
              renderActiveView()
            )}
          </div>
        </main>
      </div>
    </UserContext.Provider>
  );
};

export default App;