
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { User, Room, DiscoverItem, ActiveView, Conversation, ChatMessage, Notification, ContributionRequest } from './types.ts';
import { UserContext, IUserContext } from './context/UserContext.ts';
import { MOCK_USERS, MOCK_ROOMS, MOCK_DISCOVER_ITEMS, MOCK_CONVERSATIONS, MOCK_NOTIFICATIONS, MOCK_CONTRIBUTION_REQUESTS } from './data.ts';
import HomeView from './components/HomeView.tsx';
import ExploreView from './components/ExploreView.tsx';
import RoomsView from './components/RoomsView.tsx';
import RoomView from './components/RoomView.tsx';
import UserProfile from './components/UserProfile.tsx';
import BottomNavBar from './components/BottomNavBar.tsx';
import MiniPlayer from './components/MiniPlayer.tsx';
import CreateRoomModal from './components/CreateRoomModal.tsx';
import EditProfileModal from './components/EditProfileModal.tsx';
import MediaViewerModal from './components/MediaViewerModal.tsx';
import PostDetailView from './components/PostDetailView.tsx';
import CreateNoteView from './components/CreateNoteView.tsx';
import CreatePostView from './components/CreatePostView.tsx';
import CreateVoiceNoteView from './components/CreateVoiceNoteView.tsx';
import PostCreationAnimation from './components/PostCreationAnimation.tsx';
import SwipeView from './components/SwipeView.tsx';
import InAppBrowser from './components/InAppBrowser.tsx';
import MessagesView from './components/MessagesView.tsx';
import ConversationView from './components/ConversationView.tsx';
import NotificationsView from './components/NotificationsView.tsx';
import ScheduledView from './components/ScheduledView.tsx';
import PrivacyDashboard from './components/PrivacyDashboard.tsx';
import CreateVideoReplyView from './components/CreateVideoReplyView.tsx';
import FabCreateMenu from './components/FabCreateMenu.tsx';

const App: React.FC = () => {
    const [users, setUsers] = useState<User[]>(MOCK_USERS);
    const [currentUser, setCurrentUser] = useState<User>(MOCK_USERS[0]);
    const [rooms, setRooms] = useState<Room[]>(MOCK_ROOMS);
    const [discoverItems, setDiscoverItems] = useState<DiscoverItem[]>(MOCK_DISCOVER_ITEMS);
    const [conversations, setConversations] = useState<Conversation[]>(MOCK_CONVERSATIONS);
    const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
    const [contributionRequests, setContributionRequests] = useState<ContributionRequest[]>(MOCK_CONTRIBUTION_REQUESTS);

    const [activeView, setActiveView] = useState<ActiveView>({ view: 'home' });
    const [activeRoom, setActiveRoom] = useState<Room | null>(null);
    const [isCreateRoomModalOpen, setCreateRoomModalOpen] = useState(false);
    const [showPostCreationAnimation, setShowPostCreationAnimation] = useState<{ type: 'image' | 'video' | 'note' | 'voice_note', imageUrl?: string } | null>(null);
    const [activeFilter, setActiveFilter] = useState<DiscoverItem['type'] | 'All'>('All');
    
    const imageInputRef = useRef<HTMLInputElement>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);

    const userContextValue: IUserContext = {
        currentUser,
        updateCurrentUser: (userData) => {
            const updatedUser = { ...currentUser, ...userData };
            setCurrentUser(updatedUser);
            setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
        },
        getUserById: (id) => users.find(u => u.id === id),
        followUser: (userId) => {
             const userToFollow = users.find(u => u.id === userId);
             if (!userToFollow || currentUser.following.some(f => f.id === userId)) return;
             
             const updatedCurrentUser = { ...currentUser, following: [...currentUser.following, userToFollow] };
             const updatedUserToFollow = { ...userToFollow, followers: [...userToFollow.followers, currentUser] };
             
             setCurrentUser(updatedCurrentUser);
             setUsers(users.map(u => {
                 if (u.id === currentUser.id) return updatedCurrentUser;
                 if (u.id === userId) return updatedUserToFollow;
                 return u;
             }));
        },
        unfollowUser: (userId) => {
            const userToUnfollow = users.find(u => u.id === userId);
            if (!userToUnfollow) return;

            const updatedCurrentUser = { ...currentUser, following: currentUser.following.filter(f => f.id !== userId) };
            const updatedUserToUnfollow = { ...userToUnfollow, followers: userToUnfollow.followers.filter(f => f.id !== currentUser.id) };

            setCurrentUser(updatedCurrentUser);
            setUsers(users.map(u => {
                if (u.id === currentUser.id) return updatedCurrentUser;
                if (u.id === userId) return updatedUserToUnfollow;
                return u;
            }));
        },
    };

    const handleEnterRoom = (room: Room) => {
        setActiveRoom(room);
        setActiveView({ view: 'home' }); // Keep home view in background
    };

    const handleLeaveRoom = () => {
        setActiveRoom(null);
    };

    const handleUpdateRoom = (updatedData: Partial<Room>) => {
        if (activeRoom) {
            const updatedRoom = { ...activeRoom, ...updatedData };
            setActiveRoom(updatedRoom);
            setRooms(rooms.map(r => r.id === updatedRoom.id ? updatedRoom : r));
        }
    };

    const handleCreateRoom = (title: string, description: string, isPrivate: boolean, featuredUrl: string, isVideoEnabled: boolean) => {
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
        setRooms([newRoom, ...rooms]);
        setCreateRoomModalOpen(false);
        handleEnterRoom(newRoom);
    };
    
    const handlePost = (data: any, scheduleDate?: Date) => {
         // This is where you would call an API to create the post
        console.log("Posting:", data, "Scheduled for:", scheduleDate);
        if (activeView.view === 'create_post') {
            setShowPostCreationAnimation({ type: activeView.file.type, imageUrl: activeView.file.url });
        } else if (activeView.view === 'create_voice_note') {
            setShowPostCreationAnimation({ type: 'voice_note' });
        } else {
            setShowPostCreationAnimation({ type: 'note' });
        }
    };
    
    const handlePostCreationAnimationComplete = () => {
        setShowPostCreationAnimation(null);
        setActiveView({ view: 'home' });
    };

    const handleNavigate = (view: 'home' | 'explore' | 'rooms' | 'messages' | 'profile' | 'notifications') => {
        setActiveView({ view: view });
    }

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
        const file = event.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setActiveView({ view: 'create_post', file: { url, type } });
        }
        event.target.value = ''; // Reset input
    };
    
    const mainTabs: ActiveView['view'][] = ['home', 'explore', 'rooms', 'messages', 'profile'];
    const showMainUI = mainTabs.includes(activeView.view);

    const renderActiveView = () => {
        switch (activeView.view) {
            case 'profile':
                const user = users.find(u => u.id === (activeView as any).userId) || currentUser;
                return <UserProfile 
                            user={user}
                            allRooms={rooms}
                            onEditProfile={() => setActiveView({ view: 'edit_profile' })}
                            onBack={() => setActiveView({ view: 'home' })}
                            allPosts={discoverItems.filter(item => item.type !== 'live_room' && item.type !== 'user_profile') as any}
                            onViewMedia={(post) => setActiveView({ view: 'media', post })}
                            onViewPost={(post) => setActiveView({ view: 'post', post })}
                            contributionRequests={contributionRequests.filter(r => r.toUser.id === user.id)}
                            onUpdateContributionRequest={(reqId, status) => setContributionRequests(contributionRequests.map(r => r.id === reqId ? {...r, status} : r))}
                            onViewProfile={(user) => setActiveView({ view: 'profile', userId: user.id })}
                            onNavigate={(view) => setActiveView(view)}
                        />
            case 'edit_profile':
                return <EditProfileModal 
                            user={currentUser}
                            onClose={() => setActiveView({ view: 'profile', userId: currentUser.id })}
                            onSave={(name, bio, contributionSettings) => {
                                userContextValue.updateCurrentUser({ name, bio, contributionSettings });
                                setActiveView({ view: 'profile', userId: currentUser.id });
                            }}
                        />
            case 'media':
                return <MediaViewerModal post={activeView.post} onClose={() => setActiveView({ view: activeView.post.author.id === currentUser.id ? 'profile' : 'explore' })} />;
            case 'post':
                return <PostDetailView 
                            post={activeView.post} 
                            onBack={() => setActiveView({ view: activeView.post.author.id === currentUser.id ? 'profile' : 'explore' })} 
                            onViewProfile={(user) => setActiveView({ view: 'profile', userId: user.id })}
                            onStartVideoReply={(replyInfo) => setActiveView({ view: 'create_video_reply', replyInfo })}
                        />;
            case 'create_note':
                return <CreateNoteView onClose={() => setActiveView({ view: 'explore' })} onPost={handlePost} />
            case 'create_voice_note':
                return <CreateVoiceNoteView onClose={() => setActiveView({ view: 'explore' })} onPost={handlePost} />
            case 'create_post':
                 return <CreatePostView file={activeView.file} onClose={() => setActiveView({ view: 'explore' })} onPost={handlePost} />;
            case 'swipe':
                return <SwipeView rooms={rooms.filter(r => !r.isScheduled)} initialRoomId={activeView.initialRoomId} onClose={handleLeaveRoom} onUpdateRoom={handleUpdateRoom} onViewProfile={(user) => setActiveView({ view: 'profile', userId: user.id })} />;
            case 'in_app_browser':
                return <InAppBrowser url={activeView.url} onClose={() => setActiveView({ view: 'explore' })} />;
            case 'messages':
                return <MessagesView 
                            conversations={conversations} 
                            currentUser={currentUser} 
                            onConversationSelect={(convo) => setActiveView({ view: 'conversation', conversationId: convo.id })}
                            liveRooms={rooms.filter(r => !r.isScheduled)}
                            onEnterRoom={(room) => setActiveView({ view: 'swipe', initialRoomId: room.id })}
                            onCreateRoom={() => setCreateRoomModalOpen(true)}
                        />
            case 'conversation':
                 const convo = conversations.find(c => c.id === activeView.conversationId);
                 if (!convo) return <div>Conversation not found</div>;
                 return <ConversationView conversation={convo} currentUser={currentUser} onBack={() => setActiveView({ view: 'messages' })} onViewProfile={(user) => setActiveView({ view: 'profile', userId: user.id })} />;
            case 'notifications':
                 return <NotificationsView notifications={notifications} onNotificationClick={(notif) => setNotifications(notifications.map(n => n.id === notif.id ? {...n, isRead: true} : n))} onBack={() => setActiveView({ view: 'home' })} />;
            case 'scheduled':
                 return <ScheduledView rooms={rooms} discoverItems={discoverItems} />;
            case 'explore':
                 return <ExploreView
                            discoverItems={discoverItems}
                            onEnterRoom={(room) => setActiveView({ view: 'swipe', initialRoomId: room.id })}
                            onViewProfile={(user) => setActiveView({ view: 'profile', userId: user.id })}
                            onViewMedia={(post) => setActiveView({ view: 'media', post })}
                            onViewPost={(post) => setActiveView({ view: 'post', post })}
                            activeFilter={activeFilter}
                            onFilterChange={setActiveFilter}
                        />;
            case 'rooms':
                return <RoomsView
                            rooms={rooms}
                            onEnterRoom={(room) => setActiveView({ view: 'swipe', initialRoomId: room.id })}
                        />;
            case 'privacy_dashboard':
                return <PrivacyDashboard user={currentUser} onUpdateUser={userContextValue.updateCurrentUser} onBack={() => setActiveView({ view: 'profile', userId: currentUser.id })} />;
            case 'create_video_reply':
                return <CreateVideoReplyView replyInfo={activeView.replyInfo} onClose={() => setActiveView({ view: 'post', post: activeView.replyInfo.post as any })} onPost={() => {console.log('Video reply posted'); setActiveView({ view: 'post', post: activeView.replyInfo.post as any })}} />
            case 'home':
            default:
                return <HomeView 
                            discoverItems={discoverItems}
                            onEnterRoom={(room) => setActiveView({ view: 'swipe', initialRoomId: room.id })}
                            onViewProfile={(user) => setActiveView({ view: 'profile', userId: user.id })}
                            onViewMedia={(post) => setActiveView({ view: 'media', post })}
                            onViewPost={(post) => setActiveView({ view: 'post', post })}
                        />
        }
    };
    
    return (
        <UserContext.Provider value={userContextValue}>
            <div className="bg-gray-900 text-white h-screen w-screen flex flex-col md:flex-row overflow-hidden">
                {/* File inputs for FAB */}
                <input type="file" accept="image/*" ref={imageInputRef} onChange={(e) => handleFileChange(e, 'image')} className="hidden" />
                <input type="file" accept="video/*" ref={videoInputRef} onChange={(e) => handleFileChange(e, 'video')} className="hidden" />

                {/* Main content */}
                <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
                    {renderActiveView()}
                </main>

                {/* Modals and Overlays */}
                {activeRoom && !activeRoom.isScheduled && (
                     <div className="md:hidden">
                        <SwipeView rooms={rooms.filter(r => !r.isScheduled)} initialRoomId={activeRoom.id} onClose={handleLeaveRoom} onUpdateRoom={handleUpdateRoom} onViewProfile={(user) => setActiveView({ view: 'profile', userId: user.id })} />
                     </div>
                )}
                
                {activeRoom && (
                    <div className="hidden md:block">
                        <MiniPlayer room={activeRoom} onExpand={() => console.log('expand')} onLeave={handleLeaveRoom} />
                    </div>
                )}
                
                {isCreateRoomModalOpen && (
                    <CreateRoomModal 
                        onClose={() => setCreateRoomModalOpen(false)}
                        onCreate={handleCreateRoom}
                    />
                )}
                 {showPostCreationAnimation && (
                    <PostCreationAnimation 
                        type={showPostCreationAnimation.type}
                        imageUrl={showPostCreationAnimation.imageUrl}
                        onAnimationComplete={handlePostCreationAnimationComplete} 
                    />
                )}

                {/* Persistent UI */}
                {showMainUI && (
                    <FabCreateMenu 
                        onStartRoom={() => setCreateRoomModalOpen(true)}
                        onNewImagePost={() => imageInputRef.current?.click()}
                        onNewVideoPost={() => videoInputRef.current?.click()}
                        onNewVoiceNote={() => setActiveView({ view: 'create_voice_note' })}
                        onNewTextPost={() => setActiveView({ view: 'create_note' })}
                        activeFilter={activeFilter}
                    />
                )}
                <div className="flex-shrink-0 md:hidden">
                    <BottomNavBar 
                        onNavigate={handleNavigate} 
                        activeView={activeView.view}
                    />
                </div>
            </div>
        </UserContext.Provider>
    );
};

export default App;
