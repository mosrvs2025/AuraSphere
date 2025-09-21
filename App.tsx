
import React, { useState, useMemo, useEffect } from 'react';
// FIX: Added Comment to be used in type casting for new posts.
import { User, Room, ActiveView, DiscoverItem, Notification, Conversation, ChatMessage, Comment } from './types';
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
import AuraSphereView from './components/AuraSphereView';
import PostCreationAnimation from './components/PostCreationAnimation';
import CreateVoiceNoteView from './components/CreateVoiceNoteView';
import CreateVideoReplyView from './components/CreateVideoReplyView';

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
    { id: 'room-1', title: 'Tech Talk Weekly', description: 'Discussing the latest in AI and hardware.', hosts: [users[1], users[2]], speakers: [users[3]], listeners: [users[4], users[5], users[6]], messages: [], isPrivate: false, requestsToSpeak: [
        { id: 'req-1', user: users[4], text: 'I have a question about the new framework!', createdAt: new Date(Date.now() - 60000), likes: [users[5].id, users[6].id] },
        { id: 'req-2', user: users[5], voiceMemo: { url: 'https://archive.org/download/test-mp3-file/test.mp3', duration: 5 }, createdAt: new Date(), likes: [users[4].id] },
    ], createdAt: new Date(Date.now() - 15 * 60000), totalListeners: [users[4], users[5], users[6], users[10], users[11]], geolocation: { lat: 48.8566, lng: 2.3522 } },
    { id: 'room-2', title: 'Design Critics', description: 'A friendly place to share and critique design work.', hosts: [users[7]], speakers: [users[8], users[9]], listeners: [...users.slice(10, 15)], messages: [], isPrivate: false, isVideoEnabled: true, createdAt: new Date(Date.now() - 5 * 60000), totalListeners: [...users.slice(10, 18)], geolocation: { lat: 35.6895, lng: 139.6917 }},
    { id: 'room-3', title: 'Scheduled Event', description: 'This room is scheduled for a future date.', hosts: [users[0]], speakers: [], listeners: [], messages: [], isPrivate: false, isScheduled: true, scheduledTime: new Date(Date.now() + 24 * 60 * 60 * 1000) },
]);

const mockComments = (users: User[]): Comment[] => [
    { id: 'c-1', user: users[3], text: 'This is a great point, thanks for sharing!', createdAt: new Date(Date.now() - 120000) },
    { id: 'c-2', user: users[4], text: 'Totally agree. I was thinking the same thing.', createdAt: new Date(Date.now() - 60000) },
];


const generatePosts = (users: User[]): Extract<DiscoverItem, { type: 'text_post' | 'image_post' | 'video_post' | 'voice_note_post' }>[] => [
    { type: 'text_post', id: 'tp-1', author: users[2], content: 'Just had a great discussion in the Tech Talk room! The future of AI is looking incredibly bright.', createdAt: new Date(), likes: 12, comments: mockComments(users), status: 'published', geolocation: { lat: 34.0522, lng: -118.2437 } },
    { type: 'image_post', id: 'ip-1', author: users[8], imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4', caption: 'My current workspace setup. Keeping it minimal.', createdAt: new Date(), likes: 45, comments: [], status: 'published', geolocation: { lat: 40.7128, lng: -74.0060 } },
    { type: 'video_post', id: 'vp-1', author: users[4], videoUrl: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4', thumbnailUrl: 'https://images.unsplash.com/photo-1517292987719-0369a794ec0f', caption: 'Quick demo of a new feature I\'m working on.', createdAt: new Date(), likes: 23, comments: [], status: 'published', geolocation: { lat: 51.5074, lng: -0.1278 } },
    { type: 'voice_note_post', id: 'vnp-1', author: users[6], voiceMemo: { url: 'https://archive.org/download/test-mp3-file/test.mp3', duration: 5 }, caption: 'Some thoughts on the latest design trends. What do you all think?', createdAt: new Date(Date.now() - 3600000), likes: 18, comments: [], status: 'published' }
];


const generateDiscoverItems = (
    users: User[], 
    rooms: Room[], 
    posts: Extract<DiscoverItem, { type: 'text_post' | 'image_post' | 'video_post' | 'voice_note_post' }>[]
): DiscoverItem[] => [
    ...rooms.filter(r => !r.isScheduled).map(r => ({ ...r, type: 'live_room' as const })),
    ...users.slice(1, 6).map(u => ({ ...u, type: 'user_profile' as const })),
    ...posts
];


const generateConversations = (users: User[], currentUser: User): Conversation[] => {
  const conversations: Conversation[] = [];
  const otherUsers = users.filter(u => u.id !== currentUser.id).slice(0, 5); // Create conversations with 5 other users

  otherUsers.forEach((otherUser, index) => {
    const messages: ChatMessage[] = [
      {
        id: `msg-${index}-1`,
        user: otherUser,
        text: `Hey! Just wanted to check in. How are things?`,
        createdAt: new Date(Date.now() - (index + 1) * 60000 * 5), // 5, 10, 15... mins ago
      },
      {
        id: `msg-${index}-2`,
        user: currentUser,
        text: `Hey ${otherUser.name}! I'm doing great, thanks for asking. Just working on some cool new features for AuraSphere.`,
        createdAt: new Date(Date.now() - (index + 1) * 60000 * 2), // 2, 4, 6... mins ago
      },
       {
        id: `msg-${index}-3`,
        user: otherUser,
        text: `That sounds awesome! Can't wait to see them.`,
        createdAt: new Date(Date.now() - (index + 1) * 60000 * 1), // 1, 2, 3... mins ago
      },
    ];
    if(index === 1) { // Add some media messages to the second convo
        messages.push({
            id: `msg-${index}-4`,
            user: currentUser,
            createdAt: new Date(),
            voiceMemo: { url: 'https://archive.org/download/test-mp3-file/test.mp3', duration: 5 }
        });
    }

    conversations.push({
      id: `convo-${index}`,
      participants: [currentUser, otherUser],
      messages,
    });
  });

  return conversations;
};

const allConversations = generateConversations(allUsers, currentUserData);

const getCurrentLocation = (): Promise<{ lat: number; lng: number } | null> => {
    return new Promise((resolve) => {
        if (!navigator.geolocation) {
            console.log("Geolocation is not supported by this browser.");
            resolve(null);
        }
        navigator.geolocation.getCurrentPosition(
            (position) => resolve({
                lat: position.coords.latitude,
                lng: position.coords.longitude,
            }),
            (error) => {
                console.error("Error getting geolocation:", error.message);
                resolve(null);
            }
        );
    });
};

const App: React.FC = () => {
    const [activeView, setActiveView] = useState<ActiveView>('home');
    const [currentUser, setCurrentUser] = useState<User>(currentUserData);
    const [rooms, setRooms] = useState(() => generateRooms(allUsers));
    const [posts, setPosts] = useState(() => generatePosts(allUsers));
    const [conversations, setConversations] = useState<Conversation[]>(allConversations);
    const [activeRoom, setActiveRoom] = useState<Room | null>(null);
    const [viewingProfile, setViewingProfile] = useState<User | null>(null);
    const [isCreateRoomModalOpen, setCreateRoomModalOpen] = useState(false);
    const [isEditProfileModalOpen, setEditProfileModalOpen] = useState(false);
    const [isAvatarCustomizerOpen, setAvatarCustomizerOpen] = useState(false);
    const [isSidebarExpanded, setSidebarExpanded] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
    const [viewingPost, setViewingPost] = useState<Extract<DiscoverItem, { type: 'text_post' | 'voice_note_post' }> | null>(null);
    const [viewingMedia, setViewingMedia] = useState<Extract<DiscoverItem, { type: 'image_post' | 'video_post' }> | null>(null);
    const [curationTab, setCurationTab] = useState<'forYou' | 'following'>('forYou');
    const [activeFilter, setActiveFilter] = useState('All');
    const [isCreateHubOpen, setCreateHubOpen] = useState(false);
    const [createPostFile, setCreatePostFile] = useState<{ url: string; type: 'image' | 'video' } | null>(null);
    const [createNote, setCreateNote] = useState(false);
    const [createVoiceNote, setCreateVoiceNote] = useState(false);
    const [videoReplyInfo, setVideoReplyInfo] = useState<{ post: DiscoverItem; comment: Comment } | null>(null);
    const [browserUrl, setBrowserUrl] = useState<string | null>(null);
    const [mainScrollTop, setMainScrollTop] = useState(0);
    const [postCreationAnimationData, setPostCreationAnimationData] = useState<{
        type: 'image' | 'video' | 'note' | 'voice_note';
        imageUrl?: string;
        onComplete: () => void;
    } | null>(null);

    const discoverItems = useMemo(() => generateDiscoverItems(allUsers, rooms, posts), [rooms, posts]);

    const userContextValue: IUserContext = {
        currentUser,
        updateCurrentUser: (userData) => setCurrentUser(prev => ({ ...prev, ...userData })),
        getUserById: (id: string) => allUsers.find(u => u.id === id),
        followUser: (userId: string) => {
            setCurrentUser(prevUser => {
                const userToFollow = allUsers.find(u => u.id === userId);
                // Prevent following if already following or user not found
                if (!userToFollow || prevUser.following.some(f => f.id === userId)) {
                    return prevUser;
                }
                return { ...prevUser, following: [...prevUser.following, userToFollow] };
            });
        },
        unfollowUser: (userId: string) => {
            setCurrentUser(prevUser => {
                return { ...prevUser, following: prevUser.following.filter(f => f.id !== userId) };
            });
        },
    };

    const handleEnterRoom = (room: Room) => {
        setActiveRoom(room);
        setActiveView('room');
    };

    const handleLeaveRoom = () => {
        setActiveRoom(null);
        setActiveView('home');
    };
    
    const handleMinimizeRoom = () => {
        setActiveView('home');
    };

    const handleViewProfile = (user: User) => {
        setViewingProfile(user);
    };
    
    const handleBackFromProfile = () => {
        setViewingProfile(null);
        // If a room is active, go back to the room view, otherwise go to home
        if (activeRoom) {
            setActiveView('room');
        } else {
            setActiveView('home');
        }
    };

    const handleCreateRoom = async (title: string, description: string, isPrivate: boolean, featuredUrl: string, isVideoEnabled: boolean) => {
        const location = await getCurrentLocation();
        const newRoom: Room = { 
            id: `room-${Date.now()}`, 
            title, 
            description, 
            isPrivate, 
            featuredUrl, 
            isVideoEnabled,
            hosts: [currentUser], 
            speakers: [], 
            listeners: [], 
            messages: [],
            createdAt: new Date(),
            totalListeners: [],
            geolocation: location || undefined,
        };
        setRooms(prev => [...prev, newRoom]);
        handleEnterRoom(newRoom);
        setCreateRoomModalOpen(false);
    };

    const handleCreatePost = async (
        postData: { content: string } | { caption: string } | { caption: string; voiceMemo: { url: string; duration: number } },
        file: { url: string; type: 'image' | 'video' } | null,
        scheduleDate?: Date,
        replyInfo?: { commentId: string; user: User }
    ) => {
        const location = await getCurrentLocation();
        // FIX: The `as const` assertion made `comments: []` a `readonly` type, causing an error.
        // By separating the object and explicitly adding a mutable `comments` array, the type error is resolved.
        const commonDataBase = {
            id: `post-${Date.now()}`,
            author: currentUser,
            createdAt: scheduleDate || new Date(),
            likes: 0,
            status: (scheduleDate ? 'scheduled' : 'published') as 'published' | 'scheduled',
            scheduledTime: scheduleDate,
            geolocation: location || undefined,
            replyingTo: replyInfo,
        };
        
        const commonData = {
            ...commonDataBase,
            comments: [] as Comment[],
        };

        let newPost: Extract<DiscoverItem, { type: 'text_post' | 'image_post' | 'video_post' | 'voice_note_post' }> | null = null;

        if (file) { // Image or video post
            if (file.type === 'image') {
                newPost = {
                    ...commonData,
                    type: 'image_post',
                    imageUrl: file.url,
                    caption: (postData as { caption: string }).caption,
                };
            } else {
                 newPost = {
                    ...commonData,
                    type: 'video_post',
                    videoUrl: file.url,
                    thumbnailUrl: 'https://images.unsplash.com/photo-1517292987719-0369a794ec0f', // Mock thumbnail
                    caption: (postData as { caption: string }).caption,
                };
            }
        } else if ('voiceMemo' in postData) { // Voice note post
            newPost = {
                ...commonData,
                type: 'voice_note_post',
                voiceMemo: postData.voiceMemo,
                caption: postData.caption,
            };
        }
        else { // Text note
            newPost = {
                ...commonData,
                type: 'text_post',
                content: (postData as { content: string }).content,
            };
        }
        
        // Close creation views first
        setCreatePostFile(null);
        setCreateNote(false);
        setCreateVoiceNote(false);
        setVideoReplyInfo(null);


        if (newPost) {
            setPosts(prev => [newPost!, ...prev]);

            // If it's a scheduled post, just navigate home. Otherwise, trigger animation.
            if (newPost.status === 'scheduled') {
                handleNavigate('home');
                return;
            }

            let destinationFilter: string;
            let previewImageUrl: string | undefined;

            switch(newPost.type) {
                case 'image_post':
                    destinationFilter = 'Images';
                    previewImageUrl = newPost.imageUrl;
                    break;
                case 'video_post':
                    destinationFilter = 'Videos';
                    previewImageUrl = newPost.thumbnailUrl;
                    break;
                case 'voice_note_post':
                     destinationFilter = 'Audio';
                     break;
                case 'text_post':
                default:
                    destinationFilter = 'Posts';
                    break;
            }

            const onAnimationComplete = () => {
                handleNavigate('home');
                setActiveFilter(destinationFilter);
                setPostCreationAnimationData(null); // Cleanup
            };

            setPostCreationAnimationData({
                type: newPost.type.split('_')[0] as any,
                imageUrl: previewImageUrl,
                onComplete: onAnimationComplete,
            });

        } else {
            // Fallback navigation if post creation failed for some reason
            handleNavigate('home');
        }
    };

    const handleUpdateRoom = (updatedData: Partial<Room>) => {
        if (!activeRoom) return;

        const updatedRoom = { ...activeRoom, ...updatedData };
        setActiveRoom(updatedRoom);

        setRooms(prevRooms =>
            prevRooms.map(r => r.id === activeRoom.id ? updatedRoom : r)
        );
    };

    const handleSaveProfile = (name: string, bio: string) => {
        setCurrentUser(prev => ({...prev, name, bio}));
        setEditProfileModalOpen(false);
    };
    
    const handleNavigate = (view: ActiveView) => {
        // Reset all transient sub-views to prevent getting "stuck"
        setViewingProfile(null);
        setActiveConversation(null);
        setViewingPost(null);
        setCreatePostFile(null);
        setCreateNote(false);
        setCreateVoiceNote(false);
        setVideoReplyInfo(null);
        setBrowserUrl(null);
        setViewingMedia(null);

        if (view !== 'search') {
            setSearchQuery('');
        }

        // Also reset scroll position for main views
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.scrollTop = 0;
        }
        setMainScrollTop(0);
        
        setActiveView(view);
    };
    
    const handleScroll = (event: React.UIEvent<HTMLElement>) => {
        setMainScrollTop(event.currentTarget.scrollTop);
    };

    const renderActiveView = () => {
      // Prioritize modal-like views
      if (viewingProfile) return <UserProfile user={viewingProfile} allRooms={rooms} onEditProfile={() => setEditProfileModalOpen(true)} onBack={() => setViewingProfile(null)} allPosts={discoverItems} onViewMedia={setViewingMedia} onViewPost={setViewingPost} />;
      if (activeConversation) return <ConversationView conversation={activeConversation} currentUser={currentUser} onBack={() => setActiveConversation(null)} onViewProfile={handleViewProfile}/>;
      if (viewingPost) return <PostDetailView post={viewingPost} onBack={() => setViewingPost(null)} onViewProfile={handleViewProfile} onStartVideoReply={setVideoReplyInfo} />;
      if (createPostFile) return <CreatePostView file={createPostFile} onClose={() => setCreatePostFile(null)} onPost={(data, scheduleDate) => handleCreatePost(data, createPostFile, scheduleDate)} />;
      if (createNote) return <CreateNoteView onClose={() => setCreateNote(false)} onPost={(data, scheduleDate) => handleCreatePost(data, null, scheduleDate)} />;
      if (createVoiceNote) return <CreateVoiceNoteView onClose={() => setCreateVoiceNote(false)} onPost={(data, scheduleDate) => handleCreatePost(data, null, scheduleDate)} />;
      if (videoReplyInfo) return <CreateVideoReplyView replyInfo={videoReplyInfo} onClose={() => setVideoReplyInfo(null)} onPost={(data, file) => handleCreatePost(data, file, undefined, { commentId: videoReplyInfo.comment.id, user: videoReplyInfo.comment.user })} />;

      // Render main page views
      switch (activeView) {
        case 'home': return <TrendingView items={discoverItems} currentUser={currentUser} curationTab={curationTab} activeFilter={activeFilter} onEnterRoom={handleEnterRoom} onViewProfile={handleViewProfile} onViewMedia={setViewingMedia} onViewPost={setViewingPost}/>;
        case 'aurasphere': return <AuraSphereView onSearchClick={() => handleNavigate('search')} />;
        case 'messages': return <MessagesView conversations={conversations} currentUser={currentUser} onConversationSelect={setActiveConversation} />;
        case 'scheduled': return <ScheduledView rooms={rooms} discoverItems={discoverItems} />;
        case 'profile': return <UserProfile user={currentUser} allRooms={rooms} onEditProfile={() => setEditProfileModalOpen(true)} onBack={() => handleNavigate('home')} allPosts={discoverItems} onViewMedia={setViewingMedia} onViewPost={setViewingPost} />;
        case 'notifications': return <NotificationsView notifications={[]} onNotificationClick={() => {}} onBack={() => handleNavigate('home')} />;
        case 'my-studio': return <MyStudioView />;
        case 'room': return activeRoom ? <RoomView room={activeRoom} onLeave={handleLeaveRoom} onMinimize={handleMinimizeRoom} onUpdateRoom={handleUpdateRoom} onViewProfile={handleViewProfile} /> : <HomeView rooms={rooms.filter(r => !r.isScheduled)} onEnterRoom={handleEnterRoom} />;
        case 'search': return <GlobalSearchView 
            query={searchQuery}
            onSearch={setSearchQuery}
            discoverItems={discoverItems}
            currentUser={currentUser}
            onEnterRoom={handleEnterRoom}
            onViewProfile={handleViewProfile}
            onViewMedia={setViewingMedia}
            onViewPost={setViewingPost}
            onClose={() => handleNavigate('home')}
        />;
        default: return <HomeView rooms={rooms.filter(r => !r.isScheduled)} onEnterRoom={handleEnterRoom} />;
      }
    };
    
    const handleCreateContent = (option: 'live' | 'video' | 'image' | 'note' | 'voice_note') => {
        setCreateHubOpen(false);
        if (option === 'live') {
            setCreateRoomModalOpen(true);
        } else if (option === 'image' || option === 'video') {
            // Mock file selection
            const mockFileUrl = option === 'image' 
                ? 'https://images.unsplash.com/photo-1542314831-068cd1dbb563' 
                : 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4';
            setCreatePostFile({ url: mockFileUrl, type: option });
        } else if (option === 'note') {
            setCreateNote(true);
        } else if (option === 'voice_note') {
            setCreateVoiceNote(true);
        }
    };
    
    // Determine if a secondary view is active, which should hide the main nav elements.
    const isSubViewActive = !!(viewingProfile || activeConversation || viewingPost || createPostFile || createNote || createVoiceNote || videoReplyInfo || viewingMedia || browserUrl || activeRoom);
    
    // Define main views that show the global header.
    const mainViews: ActiveView[] = ['home'];
    const showGlobalHeader = mainViews.includes(activeView) && !isSubViewActive;
    
    return (
        <UserContext.Provider value={userContextValue}>
            <div className="h-full flex flex-col lg:flex-row bg-gray-900">
                <Sidebar 
                    activeView={activeView} 
                    setActiveView={handleNavigate}
                    isExpanded={isSidebarExpanded} 
                    setExpanded={setSidebarExpanded} 
                    onCreateContent={() => setCreateHubOpen(true)}
                    unreadNotificationCount={12}
                />
                
                <div className="flex-1 flex flex-col min-w-0 h-full"> {/* min-w-0 is important for flex truncation */}
                    <main id="main-content" onScroll={handleScroll} className="flex-1 overflow-y-auto scrollbar-hide">
                         {showGlobalHeader && (
                            <GlobalHeader 
                                activeView={activeView}
                                curationTab={curationTab}
                                setCurationTab={setCurationTab}
                                activeFilter={activeFilter}
                                setActiveFilter={setActiveFilter}
                                unreadNotificationCount={12}
                                onNavigateToNotifications={() => handleNavigate('notifications')}
                                onSearchClick={() => handleNavigate('search')}
                                liveRooms={rooms.filter(r => !r.isScheduled)}
                                onEnterRoom={handleEnterRoom}
                                scrollTop={mainScrollTop}
                            />
                        )}
                        {renderActiveView()}
                    </main>
                    
                    {!isSubViewActive && (
                      <BottomNavBar 
                          activeView={activeView} 
                          setActiveView={handleNavigate}
                          onCreateContent={() => setCreateHubOpen(true)} 
                          unreadNotificationCount={12}
                      />
                    )}
                </div>

                {isCreateRoomModalOpen && <CreateRoomModal onClose={() => setCreateRoomModalOpen(false)} onCreate={handleCreateRoom} />}
                {isEditProfileModalOpen && (currentUser || viewingProfile) && <EditProfileModal user={viewingProfile ?? currentUser} onClose={() => setEditProfileModalOpen(false)} onSave={handleSaveProfile} />}
                {isAvatarCustomizerOpen && <AvatarCustomizer onClose={() => setAvatarCustomizerOpen(false)} onAvatarSelect={(url) => setCurrentUser(p => ({...p, avatarUrl: url}))} />}
                {viewingMedia && <MediaViewerModal post={viewingMedia} onClose={() => setViewingMedia(null)} />}
                {isCreateHubOpen && <CreateHubModal onClose={() => setCreateHubOpen(false)} onSelectOption={handleCreateContent} />}
                {browserUrl && <InAppBrowser url={browserUrl} onClose={() => setBrowserUrl(null)} />}
                {postCreationAnimationData && (
                    <PostCreationAnimation
                        type={postCreationAnimationData.type}
                        imageUrl={postCreationAnimationData.imageUrl}
                        onAnimationComplete={postCreationAnimationData.onComplete}
                    />
                )}
            </div>
            {activeRoom && !viewingProfile && !activeConversation && activeView !== 'room' && (
                <MiniPlayer 
                    room={activeRoom}
                    onExpand={() => setActiveView('room')}
                    onLeave={handleLeaveRoom}
                />
            )}
        </UserContext.Provider>
    );
};

export default App;
