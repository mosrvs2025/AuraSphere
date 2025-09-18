
import React, { useState, useMemo } from 'react';
import { Room, User } from './types';
import { MOCK_ROOMS, MOCK_USER_HOST, MOCK_USER_LISTENER, users as MOCK_USERS } from './constants';
import RoomCard from './components/RoomCard';
import RoomView from './components/RoomView';
import { UserContext } from './context/UserContext';

// Create a unified list of users for state management, ensuring no duplicates
const allMockUsers = [...new Map(MOCK_USERS.map(item => [item.id, item])).values()];

const App: React.FC = () => {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isHostView, setIsHostView] = useState(true); 
  const [users, setUsers] = useState<User[]>(allMockUsers);
  const [rooms, setRooms] = useState<Room[]>(MOCK_ROOMS);

  const currentUser = useMemo(() => {
    const currentUserId = isHostView ? MOCK_USER_HOST.id : MOCK_USER_LISTENER.id;
    return users.find(u => u.id === currentUserId) || (isHostView ? MOCK_USER_HOST : MOCK_USER_LISTENER);
  }, [isHostView, users]);

  const updateUserAvatar = (newAvatarUrl: string, isGenerated: boolean = false) => {
    const userId = currentUser.id;
    
    // Update the main users list
    setUsers(currentUsers => currentUsers.map(user => 
      user.id === userId ? { ...user, avatarUrl: newAvatarUrl, isGenerated } : user
    ));

    // Update the user within any rooms
    const updatedRooms = rooms.map(room => ({
      ...room,
      hosts: room.hosts.map(user => user.id === userId ? { ...user, avatarUrl: newAvatarUrl, isGenerated } : user),
      speakers: room.speakers.map(user => user.id === userId ? { ...user, avatarUrl: newAvatarUrl, isGenerated } : user),
      listeners: room.listeners.map(user => user.id === userId ? { ...user, avatarUrl: newAvatarUrl, isGenerated } : user),
    }));
    setRooms(updatedRooms);
    
    // Also update the selectedRoom if it's open
    if (selectedRoom) {
      const updatedSelectedRoom = updatedRooms.find(r => r.id === selectedRoom.id) || null;
      setSelectedRoom(updatedSelectedRoom);
    }
  };

  const stopScreenShare = (roomId: string) => {
    // This helper ensures state is cleaned up correctly, especially when called from a stream event.
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

    // If currently sharing, stop it
    if (roomToUpdate.screenShareStream) {
      stopScreenShare(roomId);
      return;
    }

    // If not sharing, request to start
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        // Fix: The 'cursor' property is valid for `getDisplayMedia` but might not exist in default TypeScript DOM typings. Casting to `any` resolves the type error.
        video: { cursor: "always" } as any,
        audio: false,
      });

      // Listen for when the user stops sharing via the native browser UI
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

  return (
    <UserContext.Provider value={{ currentUser, updateUserAvatar }}>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black antialiased">
        <div className="container mx-auto max-w-lg p-4 font-sans">
          {selectedRoom ? (
            <RoomView 
              room={selectedRoom} 
              onLeave={leaveRoom} 
              onToggleScreenShare={() => toggleScreenShare(selectedRoom.id)} 
            />
          ) : (
            <div>
              <header className="flex justify-between items-center py-4">
                <h1 className="text-3xl font-bold text-white tracking-tight">AuraSphere</h1>
                <div className="flex items-center space-x-2 text-sm">
                  <span>Listener</span>
                   <label htmlFor="user-toggle" className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={isHostView} onChange={() => setIsHostView(!isHostView)} id="user-toggle" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                  <span>Host</span>
                </div>
              </header>
              <p className="text-gray-400 mb-6">Swipe through live audio rooms. You are currently a <span className="font-bold text-indigo-400">{currentUser.role}</span>.</p>
              <div className="space-y-4">
                {rooms.map(room => (
                  <RoomCard key={room.id} room={room} onEnter={() => enterRoom(room)} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </UserContext.Provider>
  );
};

export default App;