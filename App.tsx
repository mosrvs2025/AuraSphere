
// FIX: Add React and hooks imports
import React, { useState, useRef, useEffect } from 'react';
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
import CreateMenu from './components/FabCreateMenu.tsx';

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
    const [isRoomExpanded, setIsRoomExpanded] = useState(false);
    const [isCreateRoomModalOpen, setCreateRoomModalOpen] = useState(false);
    const [isCreateMenuOpen, setCreateMenuOpen] = useState(false);
    const [viewingChatMediaUrl, setViewingChatMediaUrl] = useState<string | null>(null);
    const [showPostCreationAnimation, setShowPostCreationAnimation] = useState<{ type: 'image' | 'video' | 'note' | 'voice_note', imageUrl?: string } | null>(null);
    const [activeFilter, setActiveFilter] = useState<DiscoverItem['type'] | 'All'>('All');
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [isRoomAudioMuted, setIsRoomAudioMuted] = useState(false);
    
    const imageInputRef = useRef<HTMLInputElement>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);
    const mockAudioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        const isHost = activeRoom?.hosts.some(h => h.id === currentUser.id);

        const manageStream = async () => {
             if (isHost && activeRoom?.isVideoEnabled) {
                if (!localStream) { // Only get stream if we don't have one
                    try {
                        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
                        setLocalStream(stream);
                    } catch (err) {
                        console.error("Stream error:", err);
                        // Disable video if permission is denied
                        handleUpdateRoom({ isVideoEnabled: false });
                    }
                }
            } else {
                if (localStream) { // Stop stream if we have one but shouldn't
                    localStream.getTracks().forEach(track => track.stop());
                    setLocalStream(null);
                }
            }
        }

        manageStream();

        // Cleanup function for when activeRoom changes to null or component unmounts
        return () => {
            if (localStream && !activeRoom) {
                localStream.getTracks().forEach(track => track.stop());
                setLocalStream(null);
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeRoom?.id, activeRoom?.isVideoEnabled]);

    useEffect(() => {
        if (localStream) {
            localStream.getAudioTracks().forEach(track => {
                track.enabled = !activeRoom?.isMicMuted;
            });
        }
    }, [localStream, activeRoom?.isMicMuted]);
    
    // Effect for handling mock room audio for listeners
    useEffect(() => {
        if (mockAudioRef.current) {
            const isHost = activeRoom?.hosts.some(h => h.id === currentUser.id);
            const isListener = activeRoom && !isHost;

            if (isListener && !isRoomAudioMuted) {
                mockAudioRef.current.play().catch(e => console.error("Mock audio play failed:", e));
            } else {
                mockAudioRef.current.pause();
            }
        }
    }, [activeRoom, isRoomAudioMuted, currentUser.id]);


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
        setIsRoomExpanded(true);
    };

    const handleMinimizeRoom = () => {
        setIsRoomExpanded(false);
    };

    const handleLeaveRoom = () => {
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
            setLocalStream(null);
        }
        setActiveRoom(null);
        setIsRoomExpanded(false);
    };

    const handleUpdateRoom = (updatedData: Partial<Room>) => {
        if (activeRoom) {
            const updatedRoom = { ...activeRoom, ...updatedData };
            setActiveRoom(updatedRoom);
            setRooms(rooms.map(r => r.id === updatedRoom.id ? updatedRoom : r));
        }
    };
    
    const handleToggleMute = () => {
        if (activeRoom) {
            handleUpdateRoom({ isMicMuted: !activeRoom.isMicMuted });
        }
    };
    
    const handleToggleRoomAudio = () => {
        setIsRoomAudioMuted(prev => !prev);
    };

    const handleCreateRoom = (title: string, description: string, isPrivate: boolean, featuredUrl: string, isVideoEnabled: boolean) => {
        const newRoom: Room = {
            id: `room-${Date.now()}`,
            title,
            description,
            isPrivate,
            featuredUrl,
            isVideoEnabled,
            isMicMuted: false,
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

    const handleNavigate = (view: 'home' | 'explore' | 'messages' | 'profile' | 'notifications') => {
        if (activeRoom) {
            setIsRoomExpanded(false);
        }
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
    
    const isLiveAndMinimized = activeRoom && !isRoomExpanded;
    
    const onViewVideoNote = (url: string) => {
        setViewingChatMediaUrl(url);
    };

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
            case 'in_app_browser':
                return <InAppBrowser url={activeView.url} onClose={() => setActiveView({ view: 'explore' })} />;
            case 'messages':
                return <MessagesView 
                            conversations={conversations} 
                            currentUser={currentUser} 
                            onConversationSelect={(convo) => setActiveView({ view: 'conversation', conversationId: convo.id })}
                            liveRooms={rooms.filter(r => !r.isScheduled)}
                            onEnterRoom={handleEnterRoom}
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
                            onEnterRoom={handleEnterRoom}
                            onViewProfile={(user) => setActiveView({ view: 'profile', userId: user.id })}
                            onViewMedia={(post) => setActiveView({ view: 'media', post })}
                            onViewPost={(post) => setActiveView({ view: 'post', post })}
                            activeFilter={activeFilter}
                            onFilterChange={setActiveFilter}
                        />;
            case 'rooms':
                return <RoomsView
                            rooms={rooms}
                            onEnterRoom={handleEnterRoom}
                        />;
            case 'privacy_dashboard':
                return <PrivacyDashboard user={currentUser} onUpdateUser={userContextValue.updateCurrentUser} onBack={() => setActiveView({ view: 'profile', userId: currentUser.id })} />;
            case 'create_video_reply':
                return <CreateVideoReplyView replyInfo={activeView.replyInfo} onClose={() => setActiveView({ view: 'post', post: activeView.replyInfo.post as any })} onPost={() => {console.log('Video reply posted'); setActiveView({ view: 'post', post: activeView.replyInfo.post as any })}} />
            case 'home':
            default:
                return <HomeView 
                            discoverItems={discoverItems}
                            onEnterRoom={handleEnterRoom}
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
                
                {/* Mock Audio Player */}
                <audio ref={mockAudioRef} src="https://storage.googleapis.com/voice-memes/Eminem_My_Name_Is.mp3" loop className="hidden" />


                {/* Main content */}
                <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
                    {renderActiveView()}
                </main>

                {/* Modals and Overlays */}
                {activeRoom && !activeRoom.isScheduled && isRoomExpanded && (
                     <div className="fixed inset-0 bg-gray-900 z-40 md:hidden">
                        <SwipeView rooms={rooms.filter(r => !r.isScheduled)} initialRoomId={activeRoom.id} onMinimize={handleMinimizeRoom} onLeave={handleLeaveRoom} onUpdateRoom={handleUpdateRoom} onViewProfile={(user) => setActiveView({ view: 'profile', userId: user.id })} localStream={localStream} onViewVideoNote={onViewVideoNote} />
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
                
                {viewingChatMediaUrl && (
                    <div 
                        className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 animate-fade-in"
                        onClick={() => setViewingChatMediaUrl(null)}
                    >
                        <video src={viewingChatMediaUrl} controls autoPlay className="max-w-full max-h-full rounded-lg" onClick={e => e.stopPropagation()} />
                    </div>
                )}

                <CreateMenu
                    isOpen={isCreateMenuOpen}
                    onClose={() => setCreateMenuOpen(false)}
                    onStartRoom={() => { setCreateMenuOpen(false); setCreateRoomModalOpen(true); }}
                    onNewImagePost={() => { setCreateMenuOpen(false); imageInputRef.current?.click(); }}
                    onNewVideoPost={() => { setCreateMenuOpen(false); videoInputRef.current?.click(); }}
                    onNewVoiceNote={() => { setCreateMenuOpen(false); setActiveView({ view: 'create_voice_note' }); }}
                    onNewTextPost={() => { setCreateMenuOpen(false); setActiveView({ view: 'create_note' }); }}
                />

                {/* Persistent UI for Mobile */}
                <div className="flex-shrink-0 md:hidden">
                    {isLiveAndMinimized && (
                        <MiniPlayer 
                            room={activeRoom} 
                            currentUser={currentUser}
                            onExpand={() => setIsRoomExpanded(true)} 
                            onLeave={handleLeaveRoom}
                            localStream={localStream}
                            onToggleMute={handleToggleMute}
                            isRoomAudioMuted={isRoomAudioMuted}
                            onToggleRoomAudio={handleToggleRoomAudio}
                        />
                    )}
                    <BottomNavBar 
                        onNavigate={handleNavigate as any}
                        onCreate={() => setCreateMenuOpen(true)}
                        activeView={activeView.view}
                    />
                </div>
            </div>
        </UserContext.Provider>
    );
};

export default App;
