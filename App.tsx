
import React, { useState, useEffect, useMemo } from 'react';
import { ActiveView, Room, User, DiscoverItem, ChatMessage, CurationTab, ContributionRequest, PrivacySettings, VisibilitySetting, Comment, Poll } from './types';
import { UserContext, IUserContext } from './context/UserContext';
import HomeView from './components/HomeView';
import RoomView from './components/RoomView';
import MiniPlayer from './components/MiniPlayer';
import BottomNavBar from './components/BottomNavBar';
import CreateRoomModal from './components/CreateRoomModal';
import UserProfile from './components/UserProfile';
import EditProfileModal from './components/EditProfileModal';
import AvatarCustomizer from './components/AvatarCustomizer';
import MessagesView from './components/MessagesView';
import ConversationView from './components/ConversationView';
import { generateAvatarImage } from './services/geminiService';
import FabCreateMenu from './components/FabCreateMenu';
import CreatePostView from './components/CreatePostView';
import CreateNoteView from './components/CreateNoteView';
import PostCreationAnimation from './components/PostCreationAnimation';
import MediaViewerModal from './components/MediaViewerModal';
import PostDetailView from './components/PostDetailView';
import GlobalHeader from './components/GlobalHeader';
import TrendingView from './components/TrendingView';
import VerticalNav from './components/VerticalNav';
import GlobalSearchView from './components/GlobalSearchView';
import PrivacyDashboard from './components/PrivacyDashboard';
import CreateVoiceNoteView from './components/CreateVoiceNoteView';


// --- MOCK DATA ---
const createMockUsers = (count: number): User[] => {
  const users: User[] = [];
  for (let i = 0; i < count; i++) {
    const defaultPrivacy: PrivacySettings = {
      liveStreams: { visibility: 'public' },
      pictures: { visibility: 'public' },
      posts: { visibility: 'public' },
      profileInfo: { visibility: 'public' },
    };
    users.push({
      id: `user-${i}`,
      name: ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Heidi', 'Ivan', 'Judy'][i % 10],
      avatarUrl: `https://i.pravatar.cc/150?img=${i + 1}`,
      bio: `This is the bio for user ${i}. I'm interested in technology, design, and audio experiences.`,
      followers: [],
      following: [],
      contributionSettings: 'following',
      privacySettings: defaultPrivacy,
    });
  }
  // Create follower/following relationships
  users.forEach((user, i) => {
    const followingCount = Math.floor(Math.random() * 5);
    for (let j = 0; j < followingCount; j++) {
      const targetIndex = (i + j + 1) % count;
      if (i !== targetIndex) {
        user.following.push(users[targetIndex]);
        users[targetIndex].followers.push(user);
      }
    }
  });
  return users;
};

const createMockRooms = (users: User[]): Room[] => {
  return [
    {
      id: 'room-1',
      title: 'Tech Talk Weekly',
      description: 'Discussing the latest in AI, hardware, and software engineering. #tech #ai',
      hosts: [users[1], users[2]],
      speakers: [users[3], users[4]],
      listeners: [users[5], users[6], users[7]],
      messages: [],
      isPrivate: false,
      tags: ['tech', 'ai', 'software'],
      createdAt: new Date(),
    },
    {
      id: 'room-2',
      title: 'Design Corner 🎨',
      description: 'A chill space to talk about UI/UX, graphic design, and creative processes.',
      hosts: [users[3]],
      speakers: [users[8]],
      listeners: [users[0], users[1], users[9]],
      messages: [],
      isPrivate: false,
      featuredUrl: 'https://www.figma.com',
      tags: ['design', 'ui/ux', 'creative'],
      createdAt: new Date(Date.now() - 1000 * 60 * 5),
    },
  ];
};

const createMockDiscoverItems = (users: User[], rooms: Room[]): DiscoverItem[] => {
  const comments: Comment[] = [
      { id: 'c1', user: users[3], text: 'Great point!', createdAt: new Date() },
      { id: 'c2', user: users[4], text: 'Love this perspective.', createdAt: new Date() },
  ];
  return [
    { ...rooms[0], type: 'live_room' },
    { ...users[5], type: 'user_profile' },
    {
      id: 'post-1', type: 'image_post', author: users[1], createdAt: new Date(Date.now() - 3600000 * 2),
      likes: 102, comments: comments, status: 'published', imageUrl: 'https://picsum.photos/seed/post1/600/800', caption: 'Exploring the mountains today! What a view. #nature #hiking',
      tags: ['nature', 'hiking']
    },
    { ...rooms[1], type: 'live_room' },
    {
      id: 'post-2', type: 'text_post', author: users[2], createdAt: new Date(Date.now() - 3600000 * 5),
      likes: 45, comments: [], status: 'published', content: 'Just had a thought: What if social media platforms were designed to encourage listening more than speaking? The architecture of conversation dictates so much of our online discourse.',
      tags: ['philosophy', 'tech']
    },
    { ...users[8], type: 'user_profile' },
    {
      id: 'post-3', type: 'video_post', author: users[4], createdAt: new Date(Date.now() - 3600000 * 8),
      likes: 233, comments: [], status: 'published', videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      thumbnailUrl: 'https://picsum.photos/seed/post3/600/800', caption: 'Short film I made last weekend.', tags: ['film', 'creative']
    },
  ];
};


const App: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [discoverItems, setDiscoverItems] = useState<DiscoverItem[]>([]);
  
  // View state
  const [activeView, setActiveView] = useState<ActiveView>('home');
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);
  const [viewingProfile, setViewingProfile] = useState<User | null>(null);
  const [activeConversation, setActiveConversation] = useState<any | null>(null);
  const [viewingMedia, setViewingMedia] = useState<Extract<DiscoverItem, { type: 'image_post' | 'video_post' }> | null>(null);
  const [viewingPost, setViewingPost] = useState<Extract<DiscoverItem, { type: 'text_post' | 'voice_note_post' }> | null>(null);

  // Modal state
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showAvatarCustomizer, setShowAvatarCustomizer] = useState(false);
  
  // Creation flow state
  const [createPostFile, setCreatePostFile] = useState<{ url: string; type: 'image' | 'video' } | null>(null);
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [isCreatingVoiceNote, setIsCreatingVoiceNote] = useState(false);
  const [postCreationAnimation, setPostCreationAnimation] = useState<'image' | 'video' | 'note' | 'voice_note' | null>(null);

  // Discover feed state
  const [curationTab, setCurationTab] = useState<CurationTab>('forYou');
  const [activeMediaType, setActiveMediaType] = useState('All');
  const [activeTopicTag, setActiveTopicTag] = useState<string | null>(null);
  const [isFilterNavOpen, setIsFilterNavOpen] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');

  useEffect(() => {
    const mockUsers = createMockUsers(10);
    const mockRooms = createMockRooms(mockUsers);
    const mockDiscoverItems = createMockDiscoverItems(mockUsers, mockRooms);

    setUsers(mockUsers);
    setCurrentUser(mockUsers[0]);
    setRooms(mockRooms);
    setDiscoverItems(mockDiscoverItems);
  }, []);

  const handleUpdateUser = (userData: Partial<User>) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, ...userData };
    setCurrentUser(updatedUser);
    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
    if (viewingProfile?.id === updatedUser.id) {
      setViewingProfile(updatedUser);
    }
  };

  const userContextValue: IUserContext = useMemo(() => ({
    currentUser: currentUser!,
    updateCurrentUser: handleUpdateUser,
    getUserById: (id: string) => users.find(u => u.id === id),
    followUser: (userId: string) => {
      if (!currentUser || currentUser.id === userId) return;
      const targetUser = users.find(u => u.id === userId);
      if (!targetUser || currentUser.following.some(f => f.id === userId)) return;
      
      const updatedCurrentUser = { ...currentUser, following: [...currentUser.following, targetUser] };
      const updatedTargetUser = { ...targetUser, followers: [...targetUser.followers, currentUser] };
      
      setCurrentUser(updatedCurrentUser);
      setUsers(users.map(u => {
        if (u.id === currentUser.id) return updatedCurrentUser;
        if (u.id === userId) return updatedTargetUser;
        return u;
      }));
    },
    unfollowUser: (userId: string) => {
       if (!currentUser) return;
        const targetUser = users.find(u => u.id === userId);
        if (!targetUser) return;
        
        const updatedCurrentUser = { ...currentUser, following: currentUser.following.filter(f => f.id !== userId) };
        const updatedTargetUser = { ...targetUser, followers: targetUser.followers.filter(f => f.id !== currentUser!.id) };
        
        setCurrentUser(updatedCurrentUser);
        setUsers(users.map(u => {
            if (u.id === currentUser.id) return updatedCurrentUser;
            if (u.id === userId) return updatedTargetUser;
            return u;
        }));
    },
  }), [currentUser, users]);

  const handleCreateRoom = (title: string, description: string, isPrivate: boolean, featuredUrl: string, isVideoEnabled: boolean) => {
    if (!currentUser) return;
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
    };
    setRooms(prev => [newRoom, ...prev]);
    setActiveRoom(newRoom);
    setShowCreateRoom(false);
  };

  const handleUpdateRoom = (updatedData: Partial<Room>) => {
    if (!activeRoom) return;
    const updatedRoom = { ...activeRoom, ...updatedData };
    setActiveRoom(updatedRoom);
    setRooms(rooms.map(r => r.id === activeRoom.id ? updatedRoom : r));
  };
  
  const handlePostCreation = (
      data: { caption?: string; content?: string; voiceMemo?: { url: string; duration: number }},
      scheduleDate?: Date,
      file?: { url: string; type: 'image' | 'video' }
  ) => {
    if (!currentUser) return;
    
    let newItem: DiscoverItem | null = null;
    const base = {
        id: `post-${Date.now()}`,
        author: currentUser,
        createdAt: new Date(),
        likes: 0,
        comments: [],
        status: scheduleDate ? 'scheduled' : 'published',
        scheduledTime: scheduleDate,
    };

    if (file?.type === 'image') {
        newItem = { ...base, type: 'image_post', imageUrl: file.url, caption: data.caption };
        setPostCreationAnimation('image');
    } else if (file?.type === 'video') {
        newItem = { ...base, type: 'video_post', videoUrl: file.url, thumbnailUrl: 'https://picsum.photos/seed/newvideo/600/800', caption: data.caption };
        setPostCreationAnimation('video');
    } else if (data.content) {
        newItem = { ...base, type: 'text_post', content: data.content };
        setPostCreationAnimation('note');
    } else if (data.voiceMemo) {
        newItem = { ...base, type: 'voice_note_post', voiceMemo: data.voiceMemo, caption: data.caption };
        setPostCreationAnimation('voice_note');
    }

    if (newItem) {
        setDiscoverItems(prev => [newItem!, ...prev]);
    }
    
    // Reset creation state
    setCreatePostFile(null);
    setIsCreatingNote(false);
    setIsCreatingVoiceNote(false);
  };
  
  const handleNavigate = (view: ActiveView) => {
      // Close any open full-screen views before changing tabs
      if (viewingProfile || activeConversation || createPostFile || isCreatingNote || isCreatingVoiceNote) {
        setViewingProfile(null);
        setActiveConversation(null);
        setCreatePostFile(null);
        setIsCreatingNote(false);
        setIsCreatingVoiceNote(false);
      }
      setActiveView(view);
      setGlobalSearchQuery('');
  };
  
  const handleViewProfile = (user: User) => {
    setViewingProfile(user);
    setActiveRoom(null); // Close room if viewing profile
  };
  
  const renderActiveView = () => {
    if (activeRoom) return null; // RoomView will be rendered on top
    if (viewingProfile) {
      return <UserProfile 
        user={viewingProfile} 
        onBack={() => setViewingProfile(null)}
        onEditProfile={() => setShowEditProfile(true)}
        allRooms={rooms}
        allPosts={discoverItems}
        onViewMedia={setViewingMedia}
        onViewPost={setViewingPost}
        contributionRequests={[]}
        onUpdateContributionRequest={() => {}}
        onViewProfile={handleViewProfile}
        onNavigate={setActiveView}
      />
    }
    if (activeConversation) {
        return <ConversationView conversation={activeConversation} currentUser={currentUser!} onBack={() => setActiveConversation(null)} onViewProfile={handleViewProfile} />
    }
     if (createPostFile) {
        return <CreatePostView file={createPostFile} onClose={() => setCreatePostFile(null)} onPost={(data, scheduleDate) => handlePostCreation(data, scheduleDate, createPostFile)} />
    }
    if (isCreatingNote) {
        return <CreateNoteView onClose={() => setIsCreatingNote(false)} onPost={handlePostCreation} />
    }
    if (isCreatingVoiceNote) {
        return <CreateVoiceNoteView onClose={() => setIsCreatingVoiceNote(false)} onPost={handlePostCreation} />
    }
    if (viewingPost) {
        return <PostDetailView post={viewingPost} onBack={() => setViewingPost(null)} onViewProfile={handleViewProfile} onStartVideoReply={() => {}}/>
    }
    if (activeView === 'privacyDashboard') {
        return <PrivacyDashboard user={currentUser!} onUpdateUser={handleUpdateUser} onBack={() => setActiveView('profile')} />
    }

    switch (activeView) {
      case 'home':
        return globalSearchQuery ? 
            <GlobalSearchView query={globalSearchQuery} onSearch={setGlobalSearchQuery} discoverItems={discoverItems} currentUser={currentUser!} onEnterRoom={setActiveRoom} onViewProfile={handleViewProfile} onViewMedia={setViewingMedia} onViewPost={setViewingPost} onClose={() => setGlobalSearchQuery('')}/>
            : <TrendingView items={discoverItems} currentUser={currentUser!} curationTab={curationTab} activeMediaType={activeMediaType} activeTopicTag={activeTopicTag} onEnterRoom={setActiveRoom} onViewProfile={handleViewProfile} onViewMedia={setViewingMedia} onViewPost={setViewingPost}/>;
      case 'search':
         return <GlobalSearchView query={globalSearchQuery} onSearch={setGlobalSearchQuery} discoverItems={discoverItems} currentUser={currentUser!} onEnterRoom={setActiveRoom} onViewProfile={handleViewProfile} onViewMedia={setViewingMedia} onViewPost={setViewingPost} onClose={() => { setGlobalSearchQuery(''); handleNavigate('home') }}/>
      case 'messages':
        return <MessagesView conversations={[]} currentUser={currentUser!} onConversationSelect={setActiveConversation} liveRooms={rooms} onEnterRoom={setActiveRoom} onCreateRoom={() => setShowCreateRoom(true)} />
      case 'profile':
        return <UserProfile 
          user={currentUser!}
          onBack={() => handleNavigate('home')}
          onEditProfile={() => setShowEditProfile(true)}
          allRooms={rooms}
          allPosts={discoverItems}
          onViewMedia={setViewingMedia}
          onViewPost={setViewingPost}
          contributionRequests={[]}
          onUpdateContributionRequest={() => {}}
          onViewProfile={handleViewProfile}
          onNavigate={setActiveView}
        />
      default:
        return <HomeView rooms={rooms} onEnterRoom={setActiveRoom} />;
    }
  };

  if (!currentUser) {
    return <div className="bg-gray-900 h-screen w-screen flex items-center justify-center text-white">Loading...</div>;
  }
  
  const isFullScreenView = !!(activeRoom || viewingProfile || activeConversation || createPostFile || isCreatingNote || isCreatingVoiceNote || viewingPost || activeView === 'privacyDashboard' || (activeView === 'search' && globalSearchQuery));
  
  return (
    <UserContext.Provider value={userContextValue}>
      <div className="bg-gray-900 text-white h-screen w-screen flex flex-col font-sans overflow-hidden">
        {!isFullScreenView && activeView === 'home' && (
          <GlobalHeader 
            activeView={activeView}
            curationTab={curationTab}
            setCurationTab={setCurationTab}
            trendingTags={['tech', 'design', 'nature', 'film', 'philosophy']}
            activeTopicTag={activeTopicTag}
            setActiveTopicTag={setActiveTopicTag}
            scrollTop={0}
            onFilterClick={() => setIsFilterNavOpen(true)}
          />
        )}
        <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
          {renderActiveView()}
        </main>
        
        {!isFullScreenView && (
            <BottomNavBar activeView={activeView} onNavigate={handleNavigate} onSearchClick={() => { handleNavigate('search'); setGlobalSearchQuery(''); }} />
        )}
        
        {activeRoom && !viewingProfile && (
          <div className="absolute inset-0 z-40">
            <RoomView 
              room={activeRoom} 
              onLeave={() => setActiveRoom(null)} 
              onUpdateRoom={handleUpdateRoom}
              onViewProfile={handleViewProfile}
            />
          </div>
        )}

        {showCreateRoom && <CreateRoomModal onClose={() => setShowCreateRoom(false)} onCreate={handleCreateRoom} />}
        {showEditProfile && <EditProfileModal user={currentUser} onClose={() => setShowEditProfile(false)} onSave={(name, bio, contributionSettings) => { handleUpdateUser({ name, bio, contributionSettings }); setShowEditProfile(false); }} />}
        {showAvatarCustomizer && <AvatarCustomizer onClose={() => setShowAvatarCustomizer(false)} onAvatarSelect={(url) => { handleUpdateUser({ avatarUrl: url }); setShowAvatarCustomizer(false); }} />}
        {viewingMedia && <MediaViewerModal post={viewingMedia} onClose={() => setViewingMedia(null)} />}
        {postCreationAnimation && <PostCreationAnimation type={postCreationAnimation} imageUrl={createPostFile?.url} onAnimationComplete={() => setPostCreationAnimation(null)} />}
        <VerticalNav isOpen={isFilterNavOpen} onClose={() => setIsFilterNavOpen(false)} activeMediaType={activeMediaType} setActiveMediaType={setActiveMediaType} />

        {!isFullScreenView && (
            <FabCreateMenu
              onStartRoom={() => setShowCreateRoom(true)}
              onNewPost={() => {
                  // Simulate file picker
                  const isVideo = Math.random() > 0.5;
                  setCreatePostFile({ 
                      url: isVideo ? 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4' : `https://picsum.photos/seed/${Date.now()}/800/1200`,
                      type: isVideo ? 'video' : 'image'
                  });
              }}
              onNewNote={() => setIsCreatingNote(true)}
              onNewVoiceNote={() => setIsCreatingVoiceNote(true)}
            />
        )}
      </div>
    </UserContext.Provider>
  );
};

export default App;
