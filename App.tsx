import React, { useState, useEffect } from 'react';
import { User, Room, ActiveView, DiscoverItem, Notification, Conversation, ChatMessage } from './types';
import Sidebar from './components/Sidebar';
import HomeView from './components/HomeView';
import RoomView from './components/RoomView';
import UserProfile from './components/UserProfile';
import { UserContext, IUserContext } from './context/UserContext';
import CreateRoomModal from './components/CreateRoomModal';
import EditProfileModal from './components/EditProfileModal';
import AvatarCustomizer from './components/AvatarCustomizer';
import MiniPlayer from './components/MiniPlayer';
import MessagesView from './components/MessagesView';
import { MyStudioView } from './components/PlaceholderViews';
import ScheduledView from './components/ScheduledView';
import NotificationsView from './components/NotificationsView';
import ConversationView from './components/ConversationView';
import BottomNavBar from './components/BottomNavBar';
import PostDetailView from './components/PostDetailView';
import MediaViewerModal from './components/MediaViewerModal';
import { PREDEFINED_AVATARS } from './constants';
import GlobalHeader from './components/GlobalHeader';
import TrendingView from './components/TrendingView';
import GlobalSearchView from './components/GlobalSearchView';
import CreateHubModal from './components/CreateHubModal';
import CreatePostView from './components/CreatePostView';
import CreateNoteView from './components/CreateNoteView';
import InAppBrowser from './components/InAppBrowser';
// Mock Data Generation
const generateUsers = (count: number): User[] => {
  const users: User[] = [];
  for (let i = 0; i < count; i++) {
    users.push({
      id: `user-${i}`,
      name: `User ${i}`,
      avatarUrl: PREDEFINED_AVATARS[i % PREDEFINED_AVATARS.length],
      bio: `This is the bio for User ${i}. I am interested in technology, design, and audio experiences.`,
      followers: [],
      following: [],
    });
  }
  // Create some follower/following relationships
  users.forEach((user, i) => {
    for (let j = 1; j <= 5; j++) {
      const targetUser = users[(i + j) % count];
      if (targetUser && user.id !== targetUser.id) {
        user.following.push(targetUser);
        targetUser.followers.push(user);
      }
    }
  });
  return users;
};

const allUsers = generateUsers(20);
const currentUserData = allUsers[0];

const generateRooms = (users: User[]): Room[] => ([
    { id: 'room-1', title: 'Tech Talk Weekly', description: 'Discussing the latest in AI and hardware.', hosts: [users[1], users[2]], speakers: [users[3]], listeners: [users[4], users[5], users[6]], messages: [], isPrivate: false },
    { id: 'room-2', title: 'Design Critics', description: 'A friendly place to share and critique design work.', hosts: [users[7]], speakers: [users[8], users[9]], listeners: [...users.slice(10, 15)], messages: [], isPrivate: false },
    { id: 'room-3', title: 'Scheduled Event', description: 'This room is scheduled for a future date.', hosts: [users[0]], speakers: [], listeners: [], messages: [], isPrivate: false, isScheduled: true, scheduledTime: new Date(Date.now() + 24 * 60 * 60 * 1000) },
]);

const allRooms = generateRooms(allUsers);

const generateDiscoverItems = (users: User[], rooms: Room[]): DiscoverItem[] => [
    ...rooms.filter(r => !r.isScheduled).map(r => ({ ...r, type: 'live_room' as const })),
    ...users.slice(1, 6).map(u => ({ ...u, type: 'user_profile' as const })),
    { type: 'text_post', id: 'tp-1', author: users[2], content: 'Just had a great discussion in the Tech Talk room! The future of AI is looking incredibly bright.', createdAt: new Date(), likes: 12, comments: 3, status: 'published' },
    { type: 'image_post', id: 'ip-1', author: users[8], imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4', caption: 'My current workspace setup. Keeping it minimal.', createdAt: new Date(), likes: 45, comments: 12, status: 'published' },
    { type: 'video_post', id: 'vp-1', author: users[4], videoUrl: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4', thumbnailUrl: 'https://images.unsplash.com/photo-1517292987719-0369a794ec0f', caption: 'Quick demo of a new feature I\'m working on.', createdAt: new Date(), likes: 23, comments: 8, status: 'published' }
];

let allDiscoverItems = generateDiscoverItems(allUsers, allRooms);

const App: React.FC = () => {
    const [activeView, setActiveView] = useState<ActiveView>('home');
    const [currentUser, setCurrentUser] = useState<User>(currentUserData);
    const [activeRoom, setActiveRoom] = useState<Room | null>(null);
    const [viewingProfile, setViewingProfile] = useState<User | null>(null);
    const [isCreateRoomModalOpen, setCreateRoomModalOpen] = useState(false);
    const [isEditProfileModalOpen, setEditProfileModalOpen] = useState(false);
    const [isAvatarCustomizerOpen, setAvatarCustomizerOpen] = useState(false);
    const [isSidebarExpanded, setSidebarExpanded] = useState(true);
    const [isSearchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
    const [viewingPost, setViewingPost] = useState<Extract<DiscoverItem, { type: 'text_post' }> | null>(null);
    const [viewingMedia, setViewingMedia] = useState<Extract<DiscoverItem, { type: 'image_post' | 'video_post' }> | null>(null);
    const [curationTab, setCurationTab] = useState<'forYou' | 'following'>('forYou');
    const [activeFilter, setActiveFilter] = useState('All');
    const [isScrolled, setIsScrolled] = useState(false);
    const [isCreateHubOpen, setCreateHubOpen] = useState(false);
    const [createPostFile, setCreatePostFile] = useState<{ url: string; type: 'image' | 'video' } | null>(null);
    const [createNote, setCreateNote] = useState(false);
    const [browserUrl, setBrowserUrl] = useState<string | null>(null);

    const mainContentRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleScroll = () => {
            if (mainContentRef.current) {
                setIsScrolled(mainContentRef.current.scrollTop > 20);
            }
        };
        const mainEl = mainContentRef.current;
        mainEl?.addEventListener('scroll', handleScroll);
        return () => mainEl?.removeEventListener('scroll', handleScroll);
    }, []);

    const userContextValue: IUserContext = {
        currentUser,
        updateCurrentUser: (userData) => setCurrentUser(prev => ({ ...prev, ...userData })),
        getUserById: (id: string) => allUsers.find(u => u.id === id),
        followUser: (userId: string) => { /* logic to update followers */ },
        unfollowUser: (userId: string) => { /* logic to update followers */ },
    };

    const handleEnterRoom = (room: Room) => {
        setActiveRoom(room);
        setActiveView('home'); // or a dedicated 'room' view
    };

    const handleLeaveRoom = () => setActiveRoom(null);
    
    const handleViewProfile = (user: User) => {
        setViewingProfile(user);
        setActiveRoom(null);
    };

    const handleCreateRoom = (title: string, description: string, isPrivate: boolean, featuredUrl: string) => {
        const newRoom: Room = { id: `room-${Date.now()}`, title, description, isPrivate, featuredUrl, hosts: [currentUser], speakers: [], listeners: [], messages: [] };
        // In a real app, this would update a shared state
        handleEnterRoom(newRoom);
        setCreateRoomModalOpen(false);
    };

    const handleSaveProfile = (name: string, bio: string) => {
        setCurrentUser(prev => ({...prev, name, bio}));
        setEditProfileModalOpen(false);
    };

    const renderActiveView = () => {
      if (viewingProfile) return <UserProfile user={viewingProfile} allRooms={allRooms} onEditProfile={() => setEditProfileModalOpen(true)} onBack={() => setViewingProfile(null)} allPosts={allDiscoverItems} onViewMedia={setViewingMedia} onViewPost={setViewingPost} />;
      if (activeConversation) return <ConversationView conversation={activeConversation} currentUser={currentUser} onBack={() => setActiveConversation(null)} onViewProfile={handleViewProfile}/>;
      if (viewingPost) return <PostDetailView post={viewingPost} onBack={() => setViewingPost(null)} onViewProfile={handleViewProfile} />;
      if (createPostFile) return <CreatePostView file={createPostFile} onClose={() => setCreatePostFile(null)} onPost={() => {}} />;
      if (createNote) return <CreateNoteView onClose={() => setCreateNote(false)} onPost={() => {}} />;

      if (isSearchOpen && searchQuery) {
        return <GlobalSearchView query={searchQuery} activeView={activeView} discoverItems={allDiscoverItems} conversations={[]} currentUser={currentUser} onEnterRoom={handleEnterRoom} onViewProfile={handleViewProfile} onViewMedia={setViewingMedia} onViewPost={setViewingPost} onConversationSelect={setActiveConversation} />
      }

      switch (activeView) {
        case 'home': return <TrendingView items={allDiscoverItems} currentUser={currentUser} curationTab={curationTab} activeFilter={activeFilter} onEnterRoom={handleEnterRoom} onViewProfile={handleViewProfile} onViewMedia={setViewingMedia} onViewPost={setViewingPost}/>;
        case 'messages': return <MessagesView conversations={[]} currentUser={currentUser} onConversationSelect={setActiveConversation} />;
        case 'scheduled': return <ScheduledView rooms={allRooms} discoverItems={allDiscoverItems} />;
        case 'profile': return <UserProfile user={currentUser} allRooms={allRooms} onEditProfile={() => setEditProfileModalOpen(true)} onBack={() => setActiveView('home')} allPosts={allDiscoverItems} onViewMedia={setViewingMedia} onViewPost={setViewingPost} />;
        case 'notifications': return <NotificationsView notifications={[]} onNotificationClick={() => {}} onBack={() => setActiveView('home')} />;
        case 'my-studio': return <MyStudioView />;
        default: return <HomeView rooms={allRooms} onEnterRoom={handleEnterRoom} />;
      }
    };
    
    const handleCreateContent = (option: 'live' | 'video' | 'image' | 'note') => {
        setCreateHubOpen(false);
        switch(option) {
            case 'live':
                setCreateRoomModalOpen(true);
                break;
            case 'video':
                // In a real app, this would open a file picker
                setCreatePostFile({ url: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4', type: 'video' });
                break;
            case 'image':
                setCreatePostFile({ url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4', type: 'image' });
                break;
            case 'note':
                setCreateNote(true);
                break;
        }
    }


    return (
        <UserContext.Provider value={userContextValue}>
            <div className="h-screen w-screen bg-gray-900 text-white flex overflow-hidden">
                <Sidebar 
                    activeView={activeView} 
                    setActiveView={setActiveView}
                    isExpanded={isSidebarExpanded}
                    setExpanded={setSidebarExpanded}
                    onCreateContent={() => setCreateHubOpen(true)}
                    unreadNotificationCount={3}
                />
                
                <div className="flex flex-col flex-1 h-full">
                    {/* Universal Global Header */}
                    <GlobalHeader
                        activeView={activeView}
                        curationTab={curationTab}
                        setCurationTab={setCurationTab}
                        activeFilter={activeFilter}
                        setActiveFilter={setActiveFilter}
                        unreadNotificationCount={3}
                        onNavigateToNotifications={() => setActiveView('notifications')}
                        onNavigateToLive={() => {}}
                        hasActiveLiveRooms={true}
                        onSearchClick={() => setSearchOpen(true)}
                        liveRooms={allRooms.filter(r => !r.isScheduled)}
                        onEnterRoom={handleEnterRoom}
                        isScrolled={isScrolled}
                    />
                    
                    <main ref={mainContentRef} className="flex-1 overflow-y-auto overflow-x-hidden">
                      {activeRoom && !viewingProfile ? (
                        <RoomView room={activeRoom} onLeave={handleLeaveRoom} onUpdateRoom={() => {}} onSendMessage={() => {}} onToggleReaction={() => {}} onViewProfile={handleViewProfile}/>
                      ) : (
                        renderActiveView()
                      )}
                    </main>

                    {/* Mobile Bottom Nav */}
                    <BottomNavBar activeView={activeView} setActiveView={setActiveView} onCreateContent={() => setCreateHubOpen(true)} unreadNotificationCount={3} />
                </div>

                {/* Modals and Overlays */}
                {isCreateRoomModalOpen && <CreateRoomModal onClose={() => setCreateRoomModalOpen(false)} onCreate={handleCreateRoom} />}
                {isEditProfileModalOpen && <EditProfileModal user={currentUser} onClose={() => setEditProfileModalOpen(false)} onSave={handleSaveProfile} />}
                {isAvatarCustomizerOpen && <AvatarCustomizer onClose={() => setAvatarCustomizerOpen(false)} onAvatarSelect={(url) => userContextValue.updateCurrentUser({avatarUrl: url})} />}
                {activeRoom && viewingProfile && <MiniPlayer room={activeRoom} onExpand={() => setViewingProfile(null)} onLeave={handleLeaveRoom} />}
                {viewingMedia && <MediaViewerModal post={viewingMedia} onClose={() => setViewingMedia(null)} />}
                {isCreateHubOpen && <CreateHubModal onClose={() => setCreateHubOpen(false)} onSelectOption={handleCreateContent} />}
                {browserUrl && <InAppBrowser url={browserUrl} onClose={() => setBrowserUrl(null)} />}
            </div>
        </UserContext.Provider>
    );
};

export default App;