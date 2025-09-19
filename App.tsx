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
import SearchViewModal from './components/SearchViewModal';
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
        { id: 'n2', text: `${users[4].name} followed you.`, createdAt: new Date(Date.now() - 3600000), isRead: true, type: 'follow', relatedUser: users[4] },
    ]);
    
    const [discoverItems, setDiscoverItems] = useState<DiscoverItem[]>([
        { type: 'live_room', ...rooms[0] },
        { type: 'user_profile', ...users[10] },
        { type: 'text_post', id: 'tp1', author: users[11], content: 'Just had a great discussion about Web3. The potential is massive! It feels like we are on the cusp of a new internet, but there are still so many challenges to overcome, from scalability to user experience. What are your thoughts?', likes: 12, comments: 4, createdAt: new Date(Date.now() - 3600000 * 2) },
        { type: 'image_post', id: 'ip1', author: users[12], imageUrl: 'https://picsum.photos/seed/123/600/400', caption: 'Working on a new side project. The view from the office is not bad!', likes: 45, comments: 8, createdAt: new Date(Date.now() - 3600000 * 5) },
        { type: 'video_post', id: 'vp1', author: users[13], videoUrl: '#', thumbnailUrl: 'https://picsum.photos/seed/124/600/400', caption: 'A quick tour of the new workspace setup.', likes: 30, comments: 6, createdAt: new Date(Date.now() - 3600000 * 8) }
    ]);

    const [activeView, setActiveView] = useState<ActiveView>('home');
    const [activeRoom, setActiveRoom] = useState<Room | null>(null);
    const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
    const [profileToShow, setProfileToShow] = useState<User | null>(null);
    const [postToShow, setPostToShow] = useState<Extract<DiscoverItem, { type: 'text_post' }> | null>(null);

    // Modal States
    const [isCreateRoomModalOpen, setCreateRoomModalOpen] = useState(false);
    const [isCreateHubModalOpen, setCreateHubModalOpen] = useState(false);
    const [isEditProfileModalOpen, setEditProfileModalOpen] = useState(false);
    const [isAvatarCustomizerOpen, setAvatarCustomizerOpen] = useState(false);
    const [isSearchModalOpen, setSearchModalOpen] = useState(false);
    const [userCard, setUserCard] = useState<{ user: User, position: ModalPosition } | null>(null);
    const [mediaToView, setMediaToView] = useState<Extract<DiscoverItem, { type: 'image_post' | 'video_post' }> | null>(null);
    const [inAppBrowserUrl, setInAppBrowserUrl] = useState<string | null>(null);

    // New Content Creation States
    const [activeCreationFlow, setActiveCreationFlow] = useState<{ type: 'image' | 'video' | 'note'; fileUrl?: string } | null>(null);
    const [pendingFileType, setPendingFileType] = useState<'image' | 'video' | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);


    // --- Context Providers ---
    const userContextValue = {
        currentUser,
        updateCurrentUser: (userData: Partial<User>) => {
            setCurrentUser(prev => ({...prev, ...userData}));
        },
        getUserById: (id: string) => [currentUser, ...users].find(u => u.id === id),
        followUser: (userId: string) => console.log('Follow user', userId),
        unfollowUser: (userId: string) => console.log('Unfollow user', userId),
    };

    // --- Handlers ---
    const handleEnterRoom = (room: Room) => {
        setActiveRoom(room);
        setActiveView('room');
    };

    const handleLeaveRoom = () => {
        setActiveRoom(null);
        setActiveView('home');
    };
    
    const handleCreateRoom = (title: string, description: string, isPrivate: boolean, featuredUrl: string) => {
        const newRoom: Room = {
            id: `room-${Date.now()}`,
            title,
            description,
            isPrivate,
            hosts: [currentUser],
            speakers: [],
            listeners: [],
            messages: [],
            featuredUrl: featuredUrl || undefined,
        };
        setRooms(prev => [newRoom, ...prev]);
        setCreateRoomModalOpen(false);
        setActiveRoom(newRoom);
        setActiveView('room');
    };

    const handleSaveProfile = (name: string, bio: string) => {
        userContextValue.updateCurrentUser({ name, bio });
        setEditProfileModalOpen(false);
    };
    
    const handleAvatarSelect = (url: string, isGenerated: boolean) => {
        userContextValue.updateCurrentUser({ avatarUrl: url });
        setAvatarCustomizerOpen(false);
    };
    
    const handleViewProfile = (user: User) => {
        setProfileToShow(user);
        setActiveView('profile');
        setUserCard(null); // Close card modal when opening full profile
        setSearchModalOpen(false); // Close search modal if open
    };
    
    const handleSearchClick = () => {
        if (activeView !== 'home') {
            setActiveView('home');
        }
        setSearchModalOpen(true);
    };

    const handleViewMedia = (post: Extract<DiscoverItem, { type: 'image_post' | 'video_post' }>) => {
        setMediaToView(post);
    };

    const handleViewPost = (post: Extract<DiscoverItem, { type: 'text_post' }>) => {
        setPostToShow(post);
        setActiveView('post_detail');
    };
    
    const handleSelectCreateOption = (option: 'live' | 'video' | 'image' | 'note') => {
        setCreateHubModalOpen(false);
        if (!fileInputRef.current) return;

        switch (option) {
            case 'live':
                setCreateRoomModalOpen(true);
                break;
            case 'image':
                setPendingFileType('image');
                fileInputRef.current.accept = 'image/*';
                fileInputRef.current.click();
                break;
            case 'video':
                setPendingFileType('video');
                fileInputRef.current.accept = 'video/*';
                fileInputRef.current.click();
                break;
            case 'note':
                setActiveCreationFlow({ type: 'note' });
                break;
        }
    };

    const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && pendingFileType) {
            const fileUrl = URL.createObjectURL(file);
            setActiveCreationFlow({
                type: pendingFileType,
                fileUrl: fileUrl,
            });
            setPendingFileType(null);
        }
        if (event.target) {
            event.target.value = ''; // Reset input to allow selecting the same file again
        }
    };

    const handleCancelCreation = () => {
        if (activeCreationFlow?.fileUrl) {
            URL.revokeObjectURL(activeCreationFlow.fileUrl);
        }
        setActiveCreationFlow(null);
        setPendingFileType(null);
    };

    const handlePublishPost = (data: { caption?: string; content?: string }) => {
        if (!activeCreationFlow) return;

        const newPost: DiscoverItem | null = (() => {
            const common = {
                id: `${activeCreationFlow.type}-${Date.now()}`,
                author: currentUser,
                likes: 0,
                comments: 0,
                createdAt: new Date(),
            };

            switch (activeCreationFlow.type) {
                case 'image':
                    return {
                        ...common,
                        type: 'image_post',
                        imageUrl: activeCreationFlow.fileUrl!,
                        caption: data.caption,
                    };
                case 'video':
                    return {
                        ...common,
                        type: 'video_post',
                        videoUrl: activeCreationFlow.fileUrl!,
                        thumbnailUrl: 'https://picsum.photos/seed/newvideo/600/400', // Placeholder
                        caption: data.caption,
                    };
                case 'note':
                    return {
                        ...common,
                        type: 'text_post',
                        content: data.content || '',
                    };
                default: return null;
            }
        })();
        
        if (newPost) {
            setDiscoverItems(prev => [newPost, ...prev]);
        }
        
        handleCancelCreation();
        setActiveView('home');
    };


    useEffect(() => {
        if (activeView !== 'profile') {
            setProfileToShow(null);
        }
        if (activeView !== 'conversation') {
            setActiveConversation(null);
        }
        if (activeView !== 'post_detail') {
            setPostToShow(null);
        }
    }, [activeView]);

    const renderActiveView = () => {
        const trendingViewProps = {
            title: "Discover",
            items: discoverItems,
            onEnterRoom: handleEnterRoom,
            onViewProfile: handleViewProfile,
            onViewMedia: handleViewMedia,
            onViewPost: handleViewPost,
            onSearchClick: () => setSearchModalOpen(true),
        };
        switch (activeView) {
            case 'room':
                return activeRoom ? <RoomView room={activeRoom} currentUser={currentUser} onLeave={handleLeaveRoom} onUserSelect={(user, position) => setUserCard({ user, position })} selectedUser={userCard?.user ?? null} onOpenLink={setInAppBrowserUrl} /> : <TrendingView {...trendingViewProps} />;
            case 'home':
                return <TrendingView {...trendingViewProps} />;
            case 'messages':
                return <MessagesView conversations={conversations} currentUser={currentUser} onConversationSelect={c => { setActiveConversation(c); setActiveView('conversation')}} />;
            case 'scheduled':
                return <ScheduledView rooms={rooms} />;
            case 'profile':
                return <UserProfile user={profileToShow || currentUser} allRooms={rooms} onEditProfile={() => setEditProfileModalOpen(true)} />;
            case 'notifications':
                return <NotificationsView notifications={notifications} onNotificationClick={(notif) => setNotifications(n => n.map(n => n.id === notif.id ? {...n, isRead: true} : n))} />;
            case 'my-studio':
                return <MyStudioView />;
            case 'conversation':
                return activeConversation ? <ConversationView conversation={activeConversation} currentUser={currentUser} onBack={() => setActiveView('messages')} onViewProfile={handleViewProfile} /> : <MessagesView conversations={conversations} currentUser={currentUser} onConversationSelect={c => { setActiveConversation(c); setActiveView('conversation')}} />;
            case 'post_detail':
                return postToShow ? <PostDetailView post={postToShow} onBack={() => setActiveView('home')} onViewProfile={handleViewProfile} /> : <TrendingView {...trendingViewProps} />;
            default:
                return <TrendingView {...trendingViewProps} />;
        }
    };
    
    const renderContent = () => {
        if (activeCreationFlow) {
            switch(activeCreationFlow.type) {
                case 'note':
                    return <CreateNoteView onPost={handlePublishPost} onClose={handleCancelCreation} />;
                case 'image':
                case 'video':
                    return activeCreationFlow.fileUrl ? (
                        <CreatePostView
                            file={{ url: activeCreationFlow.fileUrl, type: activeCreationFlow.type }}
                            onPost={handlePublishPost}
                            onClose={handleCancelCreation}
                        />
                    ) : null;
                default:
                    return renderActiveView();
            }
        }
        return renderActiveView();
    };
    
    return (
        <UserContext.Provider value={userContextValue}>
            <div className="bg-gray-900 text-gray-200 font-sans h-screen w-screen overflow-hidden flex">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelected}
                    className="hidden"
                    aria-hidden="true"
                />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <main className={`flex-1 overflow-y-auto pb-16 ${activeRoom && activeView !== 'room' && !activeCreationFlow ? 'pb-20' : ''}`}>
                        {renderContent()}
                    </main>
                </div>
                
                 <BottomNavBar
                    activeView={activeView}
                    setActiveView={setActiveView}
                    onCreateContent={() => setCreateHubModalOpen(true)}
                    unreadNotificationCount={notifications.filter(n => !n.isRead).length}
                />

                {/* --- Mini Player --- */}
                {activeRoom && activeView !== 'room' && !activeCreationFlow && (
                    <MiniPlayer
                        room={activeRoom}
                        onLeave={handleLeaveRoom}
                        onMaximize={() => setActiveView('room')}
                    />
                )}

                {/* --- Modals --- */}
                {isCreateHubModalOpen && <CreateHubModal onClose={() => setCreateHubModalOpen(false)} onSelectOption={handleSelectCreateOption} />}
                {isCreateRoomModalOpen && <CreateRoomModal onClose={() => setCreateRoomModalOpen(false)} onCreate={handleCreateRoom} />}
                {isEditProfileModalOpen && <EditProfileModal user={currentUser} onClose={() => setEditProfileModalOpen(false)} onSave={handleSaveProfile} />}
                {isAvatarCustomizerOpen && <AvatarCustomizer onClose={() => setAvatarCustomizerOpen(false)} onAvatarSelect={handleAvatarSelect} />}
                {isSearchModalOpen && <SearchViewModal 
                    onClose={() => setSearchModalOpen(false)} 
                    allRooms={rooms} 
                    allUsers={users}
                    discoverItems={discoverItems}
                    onEnterRoom={(room) => { handleEnterRoom(room); setSearchModalOpen(false); }}
                    onViewProfile={(user) => { handleViewProfile(user); setSearchModalOpen(false); }}
                    onViewMedia={(post) => { setMediaToView(post); setSearchModalOpen(false); }}
                    onViewPost={(post) => { handleViewPost(post); setSearchModalOpen(false); }}
                />}
                {userCard && <UserCardModal user={userCard.user} onClose={() => setUserCard(null)} onViewProfile={handleViewProfile} position={userCard.position} />}
                {mediaToView && <MediaViewerModal post={mediaToView} onClose={() => setMediaToView(null)} />}
                {inAppBrowserUrl && <InAppBrowser url={inAppBrowserUrl} onClose={() => setInAppBrowserUrl(null)} />}
            </div>
        </UserContext.Provider>
    );
};

export default App;