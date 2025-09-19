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
import GlobalHeader from './components/GlobalHeader';
import SearchViewModal from './components/SearchViewModal';


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

// --- Additional Mock Content for Profiles ---
const createMockPosts = (authors: User[]): DiscoverItem[] => {
  const posts: DiscoverItem[] = [];
  authors.forEach((author, i) => {
    posts.push({ type: 'image_post', id: `dp-user-${i}-1`, author, imageUrl: `https://picsum.photos/seed/user${i}a/600/800`, caption: `A beautiful day!`, likes: 12, comments: 2, createdAt: new Date(Date.now() - 3600000 * (i+1)), status: 'published' });
    posts.push({ type: 'video_post', id: `dp-user-${i}-2`, author, videoUrl: '#', thumbnailUrl: `https://picsum.photos/seed/user${i}b/800/600`, caption: 'Some cool moments.', likes: 30, comments: 5, createdAt: new Date(Date.now() - 3600000 * (i+2)), status: 'published' });
    posts.push({ type: 'text_post', id: `dp-user-${i}-3`, author, content: `Here's a thought for the day: embrace the journey.`, likes: 5, comments: 1, createdAt: new Date(Date.now() - 3600000 * (i+3)), status: 'published' });
  });
  return posts;
};

const mockUserPosts = createMockPosts(mockUsers.slice(0,10));


const App: React.FC = () => {
    
    const [users, setUsers] = useState<User[]>(mockUsers);
    const [currentUser, setCurrentUser] = useState<User>({
        id: 'user-0',
        name: 'You',
        avatarUrl: 'https://i.pravatar.cc/150?img=0',
        bio: 'This is your bio. Edit it to tell others about yourself!',
        followers: [users[1], users[2]],
        following: [users[3], users[4], users[5], users[6], users[7], users[8]],
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
            createdAt: new Date(Date.now() - 3600000 * 1),
            invitedUserIds: [],
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
            createdAt: new Date(Date.now() - 3600000 * 3),
            invitedUserIds: [],
        },
        {
            id: 'room-3',
            title: 'Chill Lo-fi Beats (Private)',
            description: '24/7 study and relaxation session.',
            hosts: [users[15]],
            speakers: [],
            listeners: [],
            messages: [],
            isPrivate: true,
            createdAt: new Date(Date.now() - 3600000 * 6),
            invitedUserIds: [],
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
            invitedUserIds: [],
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
        { id: 'n2', text: `${users[4].name} followed you.`, createdAt: new Date(Date.now() - 3600000), isRead: false, type: 'follow', relatedUser: users[4] },
    ]);

    const [discoverItems, setDiscoverItems] = useState<DiscoverItem[]>([
      { type: 'live_room', ...rooms[0] },
      { type: 'image_post', id: 'dp-1', author: users[5], imageUrl: 'https://picsum.photos/seed/discover1/600/800', caption: 'Exploring the city vibes today!', likes: 128, comments: 12, createdAt: new Date(Date.now() - 3600000 * 2), status: 'published' },
      { type: 'user_profile', ...users[8] },
      { type: 'live_room', ...rooms[1] },
      { type: 'text_post', id: 'dp-2', author: users[9], content: "Just had a breakthrough on a project I've been working on for weeks. The feeling is incredible! Never underestimate the power of persistence. #developer #coding #success", likes: 42, comments: 5, createdAt: new Date(Date.now() - 3600000 * 5), status: 'published' },
      { type: 'video_post', id: 'dp-3', author: users[10], videoUrl: '#', thumbnailUrl: 'https://picsum.photos/seed/discover3/800/600', caption: 'Quick jam session from this afternoon.', likes: 250, comments: 23, createdAt: new Date(Date.now() - 3600000 * 8), status: 'published' },
      ...mockUserPosts,
    ]);

    // --- App State ---
    const [activeView, setActiveView] = useState<ActiveView>('home');
    const [previousView, setPreviousView] = useState<ActiveView | null>(null);
    const [activeRoom, setActiveRoom] = useState<Room | null>(null);
    const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
    const [activeProfile, setActiveProfile] = useState<User | null>(null);
    const [activePost, setActivePost] = useState<Extract<DiscoverItem, { type: 'text_post' }> | null>(null);
    const [activeMediaPost, setActiveMediaPost] = useState<Extract<DiscoverItem, { type: 'image_post' | 'video_post' }> | null>(null);
    const [isScrolled, setIsScrolled] = useState(false);
    
    // --- Modal State ---
    const [isCreateRoomModalOpen, setCreateRoomModalOpen] = useState(false);
    const [isEditProfileModalOpen, setEditProfileModalOpen] = useState(false);
    const [isAvatarCustomizerOpen, setAvatarCustomizerOpen] = useState(false);
    const [isUserCardOpen, setUserCardOpen] = useState(false);
    const [isCreateHubOpen, setCreateHubOpen] = useState(false);
    const [isSearchModalOpen, setSearchModalOpen] = useState(false);
    const [selectedUserForCard, setSelectedUserForCard] = useState<User | null>(null);
    const [userCardPosition, setUserCardPosition] = useState<ModalPosition | null>(null);

    // --- Create Flow State ---
    const [activeCreateView, setActiveCreateView] = useState<'image' | 'video' | 'note' | null>(null);
    const [selectedFile, setSelectedFile] = useState<{ url: string; type: 'image' | 'video' } | null>(null);

    // --- In-App Browser State ---
    const [browserUrl, setBrowserUrl] = useState<string | null>(null);

    // --- Content Filter State (lifted from TrendingView) ---
    const [curationTab, setCurationTab] = useState<'forYou' | 'following'>('forYou');
    const [activeFilter, setActiveFilter] = useState('All');


    const fileInputRef = useRef<HTMLInputElement>(null);
    const mainContentRef = useRef<HTMLDivElement>(null);

    // --- Automatic Content Publishing ---
    useEffect(() => {
        const publishingInterval = setInterval(() => {
            const now = new Date();
            let itemsChanged = false;

            const updatedItems = discoverItems.map(item => {
                if (
                    (item.type === 'text_post' || item.type === 'image_post' || item.type === 'video_post') &&
                    item.status === 'scheduled' &&
                    item.scheduledTime &&
                    new Date(item.scheduledTime) <= now
                ) {
                    itemsChanged = true;
                    // Fulfills the scheduling by publishing the post
                    return { ...item, status: 'published' as 'published' };
                }
                return item;
            });

            if (itemsChanged) {
                setDiscoverItems(updatedItems);
            }
        }, 10000); // Check for posts to publish every 10 seconds

        return () => clearInterval(publishingInterval);
    }, [discoverItems]);


    // --- Context Providers ---
    const getUserById = (id: string): User | undefined => {
        if (id === currentUser.id) return currentUser;
        return users.find(u => u.id === id);
    };

    const followUser = (userId: string) => {
        const userToFollow = getUserById(userId);
        if (userToFollow && !currentUser.following?.some(u => u.id === userId)) {
            setCurrentUser(prev => ({
                ...prev,
                following: [...(prev.following || []), userToFollow]
            }));
            // In a real app, you'd also update the followed user's followers list
        }
    };
    
    const unfollowUser = (userId: string) => {
        setCurrentUser(prev => ({
            ...prev,
            following: (prev.following || []).filter(u => u.id !== userId)
        }));
    };

    const updateCurrentUser = (userData: Partial<User>) => {
        setCurrentUser(prev => ({ ...prev, ...userData }));
    };

    const userContextValue = { currentUser, updateCurrentUser, getUserById, followUser, unfollowUser };

    // --- Navigation Handlers ---
    const changeView = (view: ActiveView) => {
        setPreviousView(activeView);
        setActiveView(view);
        
        // Reset filters when changing main views
        setActiveFilter('All');
        setCurationTab('forYou');

        // Special handling for the main profile tab navigation
        if (view === 'profile') {
            setActiveProfile(currentUser);
        } else {
            // Reset specific detail views when navigating away
            setActiveProfile(null);
        }
        
        setActiveConversation(null);
        setActivePost(null);
    };

    // FIX: Refactored back navigation logic to prevent the "double tap" bug. This ensures a single click correctly returns to the previous view and resets state atomically.
    const handleBackNavigation = () => {
        // If we're in a detail view (one with a `previousView` stored), go back.
        if (previousView) {
            setActiveView(previousView);
            
            // Reset state for the detail view we are leaving
            setActiveProfile(null);
            setActiveConversation(null);
            setActivePost(null);
    
            // Clear previousView as we've now used it. The new previousView will be set
            // if the user navigates forward again. This prevents multi-level back issues.
            setPreviousView(null);
        } else {
            // Default back action from a main view is to go home
            setActiveView('home');
        }
    };
    

    const handleEnterRoom = (room: Room) => {
        if (room.isPrivate) {
            const isHost = room.hosts.some(h => h.id === currentUser.id);
            const isInvited = room.invitedUserIds?.includes(currentUser.id);
    
            if (!isHost && !isInvited) {
                alert("Sorry, this is a private room and you don't have an invitation.");
                return;
            }
        }
        setActiveRoom(room);
        setPreviousView(activeView);
        setActiveView('room');
    };

    const handleLeaveRoom = () => {
        setActiveRoom(null);
        setActiveView('home');
    };

    const handleSelectConversation = (conversation: Conversation) => {
        setPreviousView(activeView);
        setActiveConversation(conversation);
        setActiveView('conversation');
    };
    
    const handleViewProfile = (user: User) => {
        setPreviousView(activeView);
        setActiveProfile(user);
        setActiveView('profile');
    };

    const handleViewMedia = (post: Extract<DiscoverItem, { type: 'image_post' | 'video_post' }>) => {
        setActiveMediaPost(post);
    };

    const handleViewPost = (post: Extract<DiscoverItem, { type: 'text_post' }>) => {
        setPreviousView(activeView);
        setActivePost(post);
        setActiveView('post_detail');
    };

    const handleNavigateToLive = () => {
        changeView('home');
        setActiveFilter('Live');
    };

    const handleScroll = () => {
        if (mainContentRef.current) {
            setIsScrolled(mainContentRef.current.scrollTop > 10);
        }
    };


    // --- Modal Handlers ---
    const handleCreateRoom = (title: string, description: string, isPrivate: boolean, featuredUrl: string) => {
        const newRoom: Room = {
            id: `room-${Date.now()}`,
            title,
            description,
            hosts: [currentUser],
            speakers: [],
            listeners: [],
            messages: [],
            isPrivate,
            featuredUrl: featuredUrl || undefined,
            createdAt: new Date(),
            invitedUserIds: [],
        };
        setRooms(prev => [newRoom, ...prev]);
        setDiscoverItems(prev => [{ type: 'live_room', ...newRoom }, ...prev]);
        setCreateRoomModalOpen(false);
        handleEnterRoom(newRoom);
    };

    const handleEditProfileSave = (name: string, bio: string) => {
        updateCurrentUser({ name, bio });
        setEditProfileModalOpen(false);
    };

    const handleAvatarSelect = (url: string) => {
        updateCurrentUser({ avatarUrl: url });
        setAvatarCustomizerOpen(false);
    };
    
    const handleUserSelectForCard = (user: User, position: ModalPosition) => {
        if (selectedUserForCard?.id === user.id) {
            setUserCardOpen(false);
            setSelectedUserForCard(null);
        } else {
            setSelectedUserForCard(user);
            setUserCardPosition(position);
            setUserCardOpen(true);
        }
    };

    const handleCloseUserCard = () => {
        setUserCardOpen(false);
        // Delay clearing user to allow for fade-out animation
        setTimeout(() => setSelectedUserForCard(null), 300);
    };
    
    const handleInviteUsers = (roomId: string, userIdsToInvite: string[]) => {
        const room = rooms.find(r => r.id === roomId);
        if (!room) return;
    
        // 1. Update room state with invited users
        setRooms(prevRooms => prevRooms.map(r => {
            if (r.id === roomId) {
                const newUserIds = userIdsToInvite.filter(id => !r.invitedUserIds?.includes(id));
                return {
                    ...r,
                    invitedUserIds: [...(r.invitedUserIds || []), ...newUserIds]
                };
            }
            return r;
        }));
    
        // 2. Create notifications for each invited user
        const newNotifications: Notification[] = userIdsToInvite.map(userId => ({
            id: `notif-${Date.now()}-${userId}`,
            text: `${currentUser.name} invited you to their private room: "${room.title}"`,
            createdAt: new Date(),
            isRead: false,
            type: 'room_invite',
            relatedRoomId: roomId,
        }));
    
        setNotifications(prev => [...newNotifications, ...prev]);
    };

    // --- Notification Handler ---
    const handleNotificationClick = (notification: Notification) => {
        // Mark as read
        setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n));
        
        // Navigate
        if ((notification.type === 'room_start' || notification.type === 'room_invite') && notification.relatedRoomId) {
            const room = rooms.find(r => r.id === notification.relatedRoomId);
            if (room) handleEnterRoom(room);
        }
        if (notification.type === 'follow' && notification.relatedUser) {
            handleViewProfile(notification.relatedUser);
        }
    };

    // --- Create Content Handlers ---
    const handleCreateContentSelect = (option: 'live' | 'video' | 'image' | 'note') => {
        setCreateHubOpen(false);
        switch (option) {
            case 'live':
                setCreateRoomModalOpen(true);
                break;
            case 'image':
                setSelectedFile({ url: 'https://picsum.photos/seed/newpost/1080/1350', type: 'image' });
                setActiveCreateView('image');
                break;
             case 'video':
                setSelectedFile({ url: '#', type: 'video' });
                setActiveCreateView('video');
                break;
            case 'note':
                setActiveCreateView('note');
                break;
        }
    };
    
    // FIX: Refactored function to use a common base object, resolving type errors and making caption optional to support different post types.
    const handlePublishPost = (
        postData: { caption?: string; content?: string; fileUrl?: string; fileType?: 'image' | 'video' },
        scheduleDate?: Date
    ) => {
        let newPostWithSpecifics: DiscoverItem;

        const basePostData = {
            author: currentUser,
            likes: 0,
            comments: 0,
            // FIX: The status was being inferred as `string` because `as const` only applied to one branch of the ternary. Explicitly casting the result to the correct union type resolves the assignment errors.
            status: (scheduleDate ? 'scheduled' : 'published') as 'published' | 'scheduled',
            scheduledTime: scheduleDate,
            id: `post-${Date.now()}`,
            createdAt: new Date(),
        };

        if (activeCreateView === 'note' && postData.content) {
            newPostWithSpecifics = {
                ...basePostData,
                type: 'text_post',
                content: postData.content,
            };
        } else if (selectedFile) {
            if (selectedFile.type === 'image') {
                newPostWithSpecifics = {
                    ...basePostData,
                    type: 'image_post',
                    imageUrl: selectedFile.url,
                    caption: postData.caption,
                };
            } else { // video
                newPostWithSpecifics = {
                    ...basePostData,
                    type: 'video_post',
                    videoUrl: selectedFile.url,
                    thumbnailUrl: `https://picsum.photos/seed/${Date.now()}/800/600`,
                    caption: postData.caption,
                };
            }
        } else {
             console.error("No content or file to post.");
             return;
        }
        
        setDiscoverItems(prev => [newPostWithSpecifics, ...prev]);

        // Close creation views
        setActiveCreateView(null);
        setSelectedFile(null);
    };

    const handleCloseCreateView = () => {
        setActiveCreateView(null);
        setSelectedFile(null);
    };

    // --- Render Logic ---
    const renderActiveView = () => {
        const publishedDiscoverItems = discoverItems.filter(item => {
            // FIX: The filter logic for discover items was incorrect, causing scheduled posts to appear in the main feed.
            // This now correctly filters to only show published posts, or items that don't have a status (like rooms and users).
            if ('status' in item) {
                return item.status === 'published';
            }
            return true;
        });

        switch (activeView) {
            case 'home':
                return <TrendingView 
                            items={publishedDiscoverItems} 
                            currentUser={currentUser}
                            curationTab={curationTab}
                            activeFilter={activeFilter}
                            onEnterRoom={handleEnterRoom} 
                            onViewProfile={handleViewProfile} 
                            onViewMedia={handleViewMedia} 
                            onViewPost={handleViewPost} 
                        />;
            case 'room':
                if (activeRoom) return <RoomView 
                                            room={activeRoom} 
                                            currentUser={currentUser} 
                                            onLeave={handleLeaveRoom}
                                            onUserSelect={handleUserSelectForCard}
                                            selectedUser={selectedUserForCard}
                                            onOpenLink={(url) => setBrowserUrl(url)}
                                            handleInviteUsers={handleInviteUsers}
                                        />;
                return <p>Room not found</p>; // Or redirect to home
            case 'messages':
                return <MessagesView conversations={conversations} currentUser={currentUser} onConversationSelect={handleSelectConversation} />;
            case 'scheduled':
                return <ScheduledView rooms={rooms} discoverItems={discoverItems} />;
            case 'profile':
                // FIX: If a specific profile is active (from clicking a user), show it.
                // Otherwise, show the current user's profile (from clicking the nav tab). This
                // resolves the "Profile not found" bug.
                const profileUser = activeProfile || currentUser;
                return <UserProfile 
                            user={profileUser} 
                            allRooms={rooms} 
                            onEditProfile={() => setEditProfileModalOpen(true)}
                            onBack={handleBackNavigation}
                            allPosts={publishedDiscoverItems}
                            onViewMedia={handleViewMedia}
                            onViewPost={handleViewPost}
                        />;
            case 'notifications':
                return <NotificationsView notifications={notifications} onNotificationClick={handleNotificationClick} onBack={handleBackNavigation} />;
            case 'my-studio':
                return <MyStudioView />;
            case 'conversation':
                 if (activeConversation) return <ConversationView 
                                                    conversation={activeConversation} 
                                                    currentUser={currentUser} 
                                                    onBack={handleBackNavigation} 
                                                    onViewProfile={handleViewProfile}
                                                />;
                 return <p>Conversation not found</p>;
            case 'post_detail':
                 if (activePost) return <PostDetailView 
                                            post={activePost} 
                                            onBack={handleBackNavigation} 
                                            onViewProfile={handleViewProfile} 
                                        />;
                 return <p>Post not found</p>;
            default:
                return <p>Unknown view</p>;
        }
    };
    
    // Determine if we should render a creation view on top of everything
    const renderCreationView = () => {
        if (!activeCreateView) return null;
        
        if ((activeCreateView === 'image' || activeCreateView === 'video') && selectedFile) {
            return <CreatePostView file={selectedFile} onPost={handlePublishPost} onClose={handleCloseCreateView} />;
        }
        if (activeCreateView === 'note') {
            return <CreateNoteView onPost={handlePublishPost} onClose={handleCloseCreateView} />;
        }
        return null;
    }

    const unreadNotifications = notifications.filter(n => !n.isRead);
    const liveRooms = rooms.filter(r => !r.isScheduled);
    const publishedDiscoverItems = discoverItems.filter(item => 'status' in item ? item.status === 'published' : true);


    if (renderCreationView()) {
        return (
            <UserContext.Provider value={userContextValue}>
                <div className="h-full bg-gray-900 text-white">
                    {renderCreationView()}
                </div>
            </UserContext.Provider>
        );
    }

    return (
        <UserContext.Provider value={userContextValue}>
            <div className="h-full flex flex-col md:flex-row bg-gray-900 text-white font-sans">
                {/* Main Content Area */}
                <main className="flex-1 flex flex-col overflow-hidden">
                     <GlobalHeader
                        activeView={activeView}
                        curationTab={curationTab}
                        setCurationTab={setCurationTab}
                        activeFilter={activeFilter}
                        setActiveFilter={setActiveFilter}
                        unreadNotificationCount={unreadNotifications.length}
                        onNavigateToNotifications={() => changeView('notifications')}
                        onNavigateToLive={handleNavigateToLive}
                        hasActiveLiveRooms={liveRooms.length > 0}
                        onSearchClick={() => setSearchModalOpen(true)}
                        liveRooms={liveRooms}
                        onEnterRoom={handleEnterRoom}
                        isScrolled={isScrolled}
                    />
                    <div ref={mainContentRef} onScroll={handleScroll} className="flex-1 overflow-y-auto">
                        {renderActiveView()}
                    </div>
                </main>
            </div>
            {/* --- Modals --- */}
            {isSearchModalOpen && <SearchViewModal 
                onClose={() => setSearchModalOpen(false)}
                allRooms={rooms.filter(r => !r.isScheduled)}
                allUsers={users}
                discoverItems={publishedDiscoverItems}
                currentUser={currentUser}
                onEnterRoom={(room) => { handleEnterRoom(room); setSearchModalOpen(false); }}
                onViewProfile={(user) => { handleViewProfile(user); setSearchModalOpen(false); }}
                onViewMedia={(post) => { handleViewMedia(post); setSearchModalOpen(false); }}
                onViewPost={(post) => { handleViewPost(post); setSearchModalOpen(false); }}
            />}
            {isCreateRoomModalOpen && <CreateRoomModal onClose={() => setCreateRoomModalOpen(false)} onCreate={handleCreateRoom} />}
            {isEditProfileModalOpen && <EditProfileModal user={currentUser} onClose={() => setEditProfileModalOpen(false)} onSave={handleEditProfileSave} />}
            {isAvatarCustomizerOpen && <AvatarCustomizer onClose={() => setAvatarCustomizerOpen(false)} onAvatarSelect={(url) => handleAvatarSelect(url)} />}
            {isUserCardOpen && selectedUserForCard && <UserCardModal user={selectedUserForCard} onClose={handleCloseUserCard} onViewProfile={handleViewProfile} position={userCardPosition} />}
            {activeMediaPost && <MediaViewerModal post={activeMediaPost} onClose={() => setActiveMediaPost(null)} />}
            {isCreateHubOpen && <CreateHubModal onClose={() => setCreateHubOpen(false)} onSelectOption={handleCreateContentSelect} />}
            {browserUrl && <InAppBrowser url={browserUrl} onClose={() => setBrowserUrl(null)} />}
            
            {/* --- Global Components --- */}
            {activeRoom && activeView !== 'room' && <MiniPlayer room={activeRoom} onLeave={handleLeaveRoom} onMaximize={() => changeView('room')} />}
            <BottomNavBar activeView={activeView} setActiveView={changeView} onCreateContent={() => setCreateHubOpen(true)} unreadNotificationCount={unreadNotifications.length} />
        </UserContext.Provider>
    );
};

export default App;
