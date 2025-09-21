
import React, { useState, useCallback, useMemo } from 'react';
import { User, Room, DiscoverItem, ActiveView, Conversation, ChatMessage, ContributionRequest, PrivacySettings, VisibilitySetting } from './types';
import { UserContext, IUserContext } from './context/UserContext';
import HomeView from './components/HomeView';
import RoomView from './components/RoomView';
import UserProfile from './components/UserProfile';
import CreateRoomModal from './components/CreateRoomModal';
import BottomNavBar from './components/BottomNavBar';
import EditProfileModal from './components/EditProfileModal';
import MessagesView from './components/MessagesView';
import ConversationView from './components/ConversationView';
import SearchViewModal from './components/SearchViewModal';
import MediaViewerModal from './components/MediaViewerModal';
import PostDetailView from './components/PostDetailView';
import PrivacyDashboard from './components/PrivacyDashboard';
import CreatePostView from './components/CreatePostView';
import CreateNoteView from './components/CreateNoteView';
import PostCreationAnimation from './components/PostCreationAnimation';
import CreateVoiceNoteView from './components/CreateVoiceNoteView';
import ExploreView from './components/ExploreView';
import FabCreateMenu from './components/FabCreateMenu';
import VerticalNav from './components/VerticalNav';
import GlobalHeader from './components/GlobalHeader';
import SwipeView from './components/SwipeView';


// --- MOCK DATA GENERATION ---
const createMockUser = (id: number, name: string): User => ({
  id: `user-${id}`,
  name,
  avatarUrl: `https://i.pravatar.cc/150?img=${id}`,
  bio: `This is the bio for ${name}. I love discussing technology, design, and the future of audio.`,
  followers: [],
  following: [],
  contributionSettings: 'following',
  groups: id === 0 ? [{ id: 'group-1', name: 'Close Friends', members: []}] : [],
  privacySettings: {
    liveStreams: { visibility: 'public' },
    pictures: { visibility: 'public' },
    posts: { visibility: 'public' },
    profileInfo: { visibility: 'public' },
  }
});

const App: React.FC = () => {
    const [users, setUsers] = useState<User[]>(() => {
        const userList = [
            createMockUser(0, "Alex"), createMockUser(1, "Maria"), createMockUser(2, "David"), createMockUser(3, "Sophia"),
            createMockUser(4, "John"), createMockUser(5, "Isabella"), createMockUser(6, "Daniel"), createMockUser(7, "Mia")
        ];
        userList[0].following = [userList[1], userList[2]];
        userList[1].followers = [userList[0]];
        userList[2].followers = [userList[0]];
        return userList;
    });

    const [currentUser, setCurrentUser] = useState<User>(users[0]);
    
    const [rooms, setRooms] = useState<Room[]>([
        { type: 'live_room', id: 'room-1', title: 'Tech Talk Weekly', hosts: [users[1]], speakers: [], listeners: [users[2], users[3]], messages: [], isPrivate: false, createdAt: new Date(), tags: ['#tech', '#design'] },
        { type: 'live_room', id: 'room-2', title: 'Morning Coffee & Chill', hosts: [users[4]], speakers: [users[5]], listeners: [], messages: [], isPrivate: false, createdAt: new Date(), tags: ['#nature'] },
    ]);

    const [discoverItems, setDiscoverItems] = useState<DiscoverItem[]>([
        ...rooms,
        // FIX: Added missing 'status' property to conform to PostBase type.
        { type: 'image_post', id: 'post-1', author: users[1], imageUrl: 'https://picsum.photos/seed/post1/600/800', caption: 'Beautiful sunset!', createdAt: new Date(), likes: 10, comments: [], tags: ['#nature'], status: 'published' },
        // FIX: Added missing 'status' property to conform to PostBase type.
        { type: 'text_post', id: 'post-2', author: users[2], content: 'Just released a new article on design systems. Check it out!', createdAt: new Date(), likes: 25, comments: [], tags: ['#design'], status: 'published' },
        // FIX: Added missing 'status' property to conform to PostBase type.
        { type: 'video_post', id: 'post-3', author: users[3], videoUrl: 'placeholder.mp4', thumbnailUrl: 'https://picsum.photos/seed/post3/600/800', caption: 'Future tech demo', createdAt: new Date(), likes: 50, comments: [], tags: ['#tech', '#FutureTech'], status: 'published' },
        { type: 'user_profile', ...users[5] },
        // FIX: Added missing 'status' property to conform to PostBase type.
        { type: 'voice_note_post', id: 'post-4', author: users[4], voiceMemo: { url: '', duration: 28 }, caption: 'Quick thoughts on AI ethics.', createdAt: new Date(), likes: 15, comments: [], tags: ['#AI', '#TechTalk'], status: 'published' },
    ]);

    const [conversations, setConversations] = useState<Conversation[]>([
      { id: 'convo-1', participants: [currentUser, users[1]], messages: [{id: 'm1', user: users[1], text: 'Hey!', createdAt: new Date()}] }
    ]);
    
    const [activeView, setActiveView] = useState<ActiveView>('home');
    const [activeRoom, setActiveRoom] = useState<Room | null>(null);
    const [viewingProfile, setViewingProfile] = useState<User | null>(null);
    const [isCreateRoomModalOpen, setCreateRoomModalOpen] = useState(false);
    const [isEditProfileModalOpen, setEditProfileModalOpen] = useState(false);
    const [isSearchModalOpen, setSearchModalOpen] = useState(false);
    const [viewingConversation, setViewingConversation] = useState<Conversation | null>(null);
    const [viewingMedia, setViewingMedia] = useState<Extract<DiscoverItem, { type: 'image_post' | 'video_post' }> | null>(null);
    const [viewingPost, setViewingPost] = useState<Extract<DiscoverItem, { type: 'text_post' | 'voice_note_post' }> | null>(null);
    const [swipeViewData, setSwipeViewData] = useState<{ rooms: Room[], initialRoomId: string } | null>(null);

    const onNavigate = (view: ActiveView) => {
        setViewingProfile(null);
        setViewingConversation(null);
        setViewingPost(null);
        setActiveView(view);
    };

    const handleEnterRoom = (room: Room) => {
      const liveRooms = discoverItems.filter(item => item.type === 'live_room') as Room[];
      if (liveRooms.length > 1) {
          setSwipeViewData({ rooms: liveRooms, initialRoomId: room.id });
      } else {
          setActiveRoom(room);
      }
    };
    const handleLeaveRoom = () => setActiveRoom(null);
    
    const handleViewProfile = (user: User) => {
        setActiveView('profile');
        setViewingProfile(user);
    };

    const handleViewPost = (post: Extract<DiscoverItem, { type: 'text_post' | 'voice_note_post' }>) => {
        setViewingPost(post);
    };
    
    const userContextValue: IUserContext = useMemo(() => ({
      currentUser,
      updateCurrentUser: (userData) => setCurrentUser(prev => ({ ...prev, ...userData })),
      getUserById: (id) => users.find(u => u.id === id),
      followUser: (userId) => {
          const userToFollow = users.find(u => u.id === userId);
          if (!userToFollow) return;
          setCurrentUser(prev => ({ ...prev, following: [...prev.following, userToFollow] }));
      },
      unfollowUser: (userId) => {
          setCurrentUser(prev => ({...prev, following: prev.following.filter(u => u.id !== userId)}));
      }
    }), [currentUser, users]);

    const renderActiveView = () => {
        if (viewingConversation) {
            return <ConversationView conversation={viewingConversation} currentUser={currentUser} onBack={() => setViewingConversation(null)} onViewProfile={handleViewProfile} />;
        }
        if (viewingPost) {
            return <PostDetailView post={viewingPost} onBack={() => setViewingPost(null)} onViewProfile={handleViewProfile} onStartVideoReply={() => {}} />;
        }
        switch(activeView) {
            case 'home':
                return <HomeView
                            discoverItems={discoverItems}
                            onEnterRoom={handleEnterRoom}
                            onViewProfile={handleViewProfile}
                            onViewMedia={setViewingMedia}
                            onViewPost={handleViewPost}
                       />;
            case 'messages':
                return <MessagesView conversations={conversations} currentUser={currentUser} onConversationSelect={setViewingConversation} liveRooms={rooms} onEnterRoom={handleEnterRoom} onCreateRoom={() => setCreateRoomModalOpen(true)} />;
            case 'profile':
                return <UserProfile user={viewingProfile || currentUser} allRooms={rooms} allPosts={discoverItems} onBack={() => onNavigate('home')} onEditProfile={() => setEditProfileModalOpen(true)} onNavigate={onNavigate} onViewProfile={handleViewProfile} contributionRequests={[]} onUpdateContributionRequest={() => {}} onViewMedia={setViewingMedia} onViewPost={handleViewPost} />;
            case 'privacyDashboard':
                return <PrivacyDashboard user={currentUser} onUpdateUser={(data) => setCurrentUser(prev => ({...prev, ...data}))} onBack={() => onNavigate('profile')} />;
            default:
                return <HomeView discoverItems={discoverItems} onEnterRoom={handleEnterRoom} onViewProfile={handleViewProfile} onViewMedia={setViewingMedia} onViewPost={handleViewPost} />;
        }
    };

    return (
        <UserContext.Provider value={userContextValue}>
            <div className="h-screen w-screen bg-gray-900 text-white flex flex-col font-sans antialiased overflow-hidden">
                <main className="flex-1 overflow-y-auto">
                    {activeRoom ? (
                        <RoomView room={activeRoom} onLeave={handleLeaveRoom} onUpdateRoom={() => {}} onViewProfile={handleViewProfile} />
                    ) : (
                       renderActiveView()
                    )}
                </main>

                {!activeRoom && !viewingPost && <BottomNavBar activeView={activeView} onNavigate={onNavigate} onSearchClick={() => setSearchModalOpen(true)} />}
                
                {swipeViewData && (
                    <SwipeView
                        rooms={swipeViewData.rooms}
                        initialRoomId={swipeViewData.initialRoomId}
                        onClose={() => setSwipeViewData(null)}
                        onUpdateRoom={() => {}}
                        onViewProfile={handleViewProfile}
                    />
                )}
                {isCreateRoomModalOpen && (
                    <CreateRoomModal 
                        onClose={() => setCreateRoomModalOpen(false)} 
                        onCreate={(title, description, isPrivate, featuredUrl, isVideoEnabled) => {
                            const newRoom: Room = {
                                type: 'live_room',
                                id: `room-${Date.now()}`,
                                title, description, featuredUrl, isVideoEnabled,
                                hosts: [currentUser],
                                speakers: [], listeners: [], messages: [], isPrivate,
                                createdAt: new Date()
                            };
                            setRooms(prev => [newRoom, ...prev]);
                            setActiveRoom(newRoom);
                            setCreateRoomModalOpen(false);
                        }} 
                    />
                )}

                 {isSearchModalOpen && (
                    <SearchViewModal
                        onClose={() => setSearchModalOpen(false)}
                        allRooms={rooms}
                        allUsers={users}
                        discoverItems={discoverItems}
                        currentUser={currentUser}
                        onEnterRoom={(room) => { setSearchModalOpen(false); handleEnterRoom(room); }}
                        onViewProfile={(user) => { setSearchModalOpen(false); handleViewProfile(user); }}
                        onViewMedia={(post) => { setSearchModalOpen(false); setViewingMedia(post); }}
                        onViewPost={(post) => { setSearchModalOpen(false); handleViewPost(post); }}
                    />
                 )}
                 {viewingMedia && <MediaViewerModal post={viewingMedia} onClose={() => setViewingMedia(null)} />}
                {isEditProfileModalOpen && (
                    <EditProfileModal
                        user={currentUser}
                        onClose={() => setEditProfileModalOpen(false)}
                        onSave={(name, bio, contributionSettings) => {
                            setCurrentUser(prev => ({...prev, name, bio, contributionSettings}));
                            setEditProfileModalOpen(false);
                        }}
                    />
                )}
            </div>
        </UserContext.Provider>
    );
};

export default App;
