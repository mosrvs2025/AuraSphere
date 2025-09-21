import React, { useState, useMemo, useEffect, useContext } from 'react';
import { User, Room, DiscoverItem, ContributionRequest, ActiveView } from '../types';
import RoomCard from './RoomCard';
import { DocumentTextIcon, VideoCameraIcon, EyeIcon, UsersIcon, MicIcon, KebabVerticalIcon, ShareIcon, StarIcon, BlockIcon, FlagIcon, ShieldCheckIcon, SettingsIcon, PlusIcon } from './Icons';
import AudioPlayer from './AudioPlayer';
import ContributeModal from './ContributeModal';
import { UserContext } from '../context/UserContext';

interface ProfileViewProps {
  user: User;
  allRooms: Room[];
  onEditProfile: () => void;
  onBack: () => void;
  allPosts: DiscoverItem[];
  onViewMedia: (post: Extract<DiscoverItem, { type: 'image_post' | 'video_post' }>) => void;
  onViewPost: (post: Extract<DiscoverItem, { type: 'text_post' | 'voice_note_post' }>) => void;
  contributionRequests: ContributionRequest[];
  onUpdateContributionRequest: (requestId: string, status: 'approved' | 'declined') => void;
  onViewProfile: (user: User) => void;
  onNavigate: (view: ActiveView) => void;
}

const ContentGridItem: React.FC<{ 
    post: Extract<DiscoverItem, { type: 'image_post' | 'video_post' | 'text_post' | 'voice_note_post' }>;
    onViewMedia: (post: Extract<DiscoverItem, { type: 'image_post' | 'video_post' }>) => void;
    onViewPost: (post: Extract<DiscoverItem, { type: 'text_post' | 'voice_note_post' }>) => void;
    onViewProfile: (user: User) => void;
}> = ({ post, onViewMedia, onViewPost, onViewProfile }) => {
    const renderContent = () => {
        switch(post.type) {
            case 'image_post':
                return <img src={post.imageUrl} alt={post.caption || 'User post'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />;
            case 'video_post':
                return (
                    <>
                        <img src={post.thumbnailUrl} alt={post.caption || 'User post'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        <div className="absolute top-2 right-2 text-white bg-black/30 rounded-full"><VideoCameraIcon className="w-5 h-5 p-1" /></div>
                    </>
                );
            case 'text_post':
                return (
                    <div className="p-3 flex flex-col justify-between h-full">
                        <p className="text-left text-sm text-gray-300 line-clamp-5">{post.content}</p>
                        <DocumentTextIcon className="w-6 h-6 text-gray-500 self-end" />
                    </div>
                );
            case 'voice_note_post':
                return (
                    <div className="p-3 flex flex-col justify-between h-full">
                        <p className="text-left text-sm text-gray-300 line-clamp-3">{post.caption}</p>
                        <div className="w-full mt-2"><AudioPlayer src={post.voiceMemo.url} /></div>
                    </div>
                );
            default: return null;
        }
    };
    
    const handleClick = () => {
        if (post.type === 'image_post' || post.type === 'video_post') {
            onViewMedia(post);
        } else if (post.type === 'text_post' || post.type === 'voice_note_post') {
            if (post.type === 'text_post') onViewPost(post);
            // Voice notes are played directly in the grid, no detail view
        }
    };
    
    return (
        <div className="aspect-square bg-gray-800 rounded-md overflow-hidden relative group hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900">
            <button onClick={handleClick} className="w-full h-full">
                {renderContent()}
            </button>
            {post.contributor && (
                <button 
                    onClick={() => onViewProfile(post.contributor!)} 
                    className="absolute bottom-1 left-1 bg-black/60 backdrop-blur-sm p-1 rounded-md text-white text-xs flex items-center space-x-1 hover:bg-black/80 transition-colors"
                >
                    <img src={post.contributor.avatarUrl} className="w-4 h-4 rounded-full" />
                    <span>Shared by @{post.contributor.name}</span>
                </button>
            )}
        </div>
    );
};


const ProfileView: React.FC<ProfileViewProps> = (props) => {
  const { user, allRooms, onEditProfile, onBack, allPosts, onViewMedia, onViewPost, contributionRequests, onUpdateContributionRequest, onNavigate } = props;
  const { currentUser, followUser, unfollowUser } = useContext(UserContext);
  const isFollowing = currentUser.following?.some(u => u.id === user.id);
  const isOwnProfile = user.id === currentUser.id;
  const [activeTab, setActiveTab] = useState<string | { id: string; count: number; }>(isOwnProfile ? 'Posts' : 'All');
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);
  const [isHeaderActionsOpen, setIsHeaderActionsOpen] = useState(false);


  useEffect(() => {
    setActiveTab(isOwnProfile ? 'Posts' : 'All');
    setIsSettingsMenuOpen(false); // Close menus when profile changes
    setIsHeaderActionsOpen(false);
  }, [isOwnProfile, user.id]);

  const pendingRequests = useMemo(() => contributionRequests.filter(r => r.recipient.id === user.id && r.status === 'pending'), [contributionRequests, user.id]);

  const ownerTabs = ['Posts', { id: 'Contributions', count: pendingRequests.length }, 'Liked', 'Saved'];
  const visitorTabs = ['All', 'Live', 'Images', 'Videos', 'Audio', 'Posts'];
  const tabs = isOwnProfile ? ownerTabs : visitorTabs;
  
  const userHostedRooms = useMemo(() => allRooms.filter(room => room.hosts.some(host => host.id === user.id) && !room.isScheduled), [allRooms, user.id]);
  
  const userPosts = useMemo(() => (allPosts.filter(
      p => ('author' in p) && p.author.id === user.id && (p.type === 'image_post' || p.type === 'video_post' || p.type === 'text_post' || p.type === 'voice_note_post')
  ) as Extract<DiscoverItem, { type: 'image_post' | 'video_post' | 'text_post' | 'voice_note_post' }>[]).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), [allPosts, user.id]);
  
  const handleFollowToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFollowing) {
      unfollowUser(user.id);
    } else {
      followUser(user.id);
    }
  };

  const Placeholder: React.FC<{ text: string }> = ({ text }) => (
    <div className="text-center py-12 bg-gray-800/50 rounded-lg border border-gray-700">
        <p className="text-gray-400">{text}</p>
    </div>
  );
  
  const renderContent = () => {
    // FIX: Using 'const' here instead of 'let' helps TypeScript correctly narrow the type of 'activeTabId' through the complex control flow below.
    const activeTabId = typeof activeTab === 'object' && activeTab !== null ? activeTab.id : activeTab;

    if (activeTabId === 'Contributions') {
        if (pendingRequests.length === 0) return <Placeholder text="You have no pending contribution requests." />;
        return (
            <div className="space-y-4">
                {pendingRequests.map(req => (
                    <div key={req.id} className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                        <p className="text-sm text-gray-300 mb-3">
                            <span className="font-bold text-white">{req.contributor.name}</span> wants to add this post to your profile:
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                           <div className="max-w-xs mx-auto">
                             <ContentGridItem post={req.post} onViewMedia={onViewMedia} onViewPost={onViewPost} onViewProfile={() => {}} />
                           </div>
                           <div className="flex flex-col items-center justify-center space-y-3">
                                <button onClick={() => onUpdateContributionRequest(req.id, 'approved')} className="w-full max-w-xs bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-full transition">Approve</button>
                                <button onClick={() => onUpdateContributionRequest(req.id, 'declined')} className="w-full max-w-xs bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-full transition">Decline</button>
                           </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }
    
    let items: any[] = [];
    if (isOwnProfile) {
        switch (activeTabId) {
            case 'Posts': items = userPosts; break;
            case 'Liked': return <Placeholder text="Your liked posts will appear here." />;
            case 'Saved': return <Placeholder text="Your saved content will appear here." />;
            default: items = userPosts;
        }
    } else {
        switch (activeTabId) {
            case 'All': items = userPosts; break;
            case 'Live': return userHostedRooms.length > 0 ? <div className="space-y-4">{userHostedRooms.map(room => <RoomCard key={room.id} room={room} onEnter={() => {}} />)}</div> : <Placeholder text={`${user.name} isn't hosting any live rooms.`} />;
            case 'Images': items = userPosts.filter(p => p.type === 'image_post'); break;
            case 'Videos': items = userPosts.filter(p => p.type === 'video_post'); break;
            case 'Audio': items = userPosts.filter(p => p.type === 'voice_note_post'); break;
            case 'Posts': items = userPosts.filter(p => p.type === 'text_post'); break;
            default: items = userPosts;
        }
    }

    if (items.length === 0) return <Placeholder text={`${user.name} hasn't shared any ${activeTabId.toLowerCase() === 'all' ? 'content' : activeTabId.toLowerCase()} yet.`} />;
    
    return (
        <div className="grid grid-cols-3 gap-1">
            {items.map(post => <ContentGridItem key={post.id} post={post} onViewMedia={onViewMedia} onViewPost={onViewPost} onViewProfile={props.onViewProfile} />)}
        </div>
    );
  };
  
    const visitorMenuItems = [
        { label: 'Share Profile', icon: <ShareIcon />, action: () => console.log('Share') },
        { label: 'Add to Group', icon: <PlusIcon />, action: () => console.log('Add to Group') },
        { label: 'Mute', icon: <MicIcon />, action: () => console.log('Mute') },
        { label: 'Block', icon: <BlockIcon />, action: () => console.log('Block') },
        { label: 'Report', icon: <FlagIcon />, action: () => console.log('Report') },
    ];

    const ownerMenuItems = [
        { label: 'Edit Profile', icon: <SettingsIcon />, action: onEditProfile },
        { label: 'Account Settings', icon: <UsersIcon />, action: () => console.log('Account Settings') },
        { label: 'Privacy Dashboard', icon: <ShieldCheckIcon />, action: () => onNavigate('privacyDashboard') },
    ];

    const menuItems = isOwnProfile ? ownerMenuItems : visitorMenuItems;

  return (
    <>
    <div className="p-4 md:p-6 animate-fade-in max-w-4xl mx-auto">
        <header className="mb-6 flex justify-between items-center relative">
            <button onClick={onBack} className="text-indigo-400 hover:text-indigo-300 font-semibold text-sm flex items-center space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                <span>Back</span>
            </button>
            <button onClick={() => setIsSettingsMenuOpen(prev => !prev)} className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-700/50">
                <KebabVerticalIcon />
            </button>
            {isSettingsMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-20 animate-fade-in">
                    {menuItems.map(item => (
                        <button key={item.label} onClick={() => { item.action(); setIsSettingsMenuOpen(false); }} className="w-full flex items-center space-x-3 px-4 py-3 text-left text-sm text-gray-200 hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg">
                           <div className="w-5 h-5">{item.icon}</div>
                           <span>{item.label}</span>
                        </button>
                    ))}
                </div>
            )}
        </header>
        <div onClick={() => !isOwnProfile && setIsHeaderActionsOpen(true)} className={`rounded-lg ${!isOwnProfile ? 'cursor-pointer hover:bg-gray-800/50 p-4 -m-4' : ''}`}>
            <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-6 md:gap-8">
              <img src={user.avatarUrl} alt={user.name} className="w-32 h-32 rounded-full border-4 border-gray-700 shadow-lg" />
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-white tracking-tight">{user.name}</h1>
                <div className="flex items-center justify-center md:justify-start space-x-6 mt-3 text-gray-400">
                  <div><span className="font-bold text-white">{user.followers?.length ?? 0}</span> Followers</div>
                  <div><span className="font-bold text-white">{user.following?.length ?? 0}</span> Following</div>
                </div>
                <p className="text-gray-300 mt-4 max-w-lg">{user.bio || 'No bio provided.'}</p>
                 <div className="mt-6 flex items-center justify-center md:justify-start space-x-2">
                    {isOwnProfile ? (
                        <button onClick={onEditProfile} className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-5 rounded-full text-sm transition">Edit Profile</button>
                    ) : (
                       <button onClick={handleFollowToggle} className={`font-bold py-2 px-8 rounded-full transition text-sm ${isFollowing ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-white hover:bg-gray-200 text-black'}`}>
                          {isFollowing ? 'Unfollow' : 'Follow'}
                       </button>
                    )}
                </div>
              </div>
            </div>
        </div>
        
        {isOwnProfile && (
            <div className="mt-8 flex items-center justify-center space-x-4">
                <button className="flex items-center space-x-2 text-sm font-semibold text-gray-300 bg-gray-800/50 hover:bg-gray-700/70 py-2 px-4 rounded-full transition"><EyeIcon className="h-5 w-5" /><span>Profile Views</span></button>
                <button className="flex items-center space-x-2 text-sm font-semibold text-gray-300 bg-gray-800/50 hover:bg-gray-700/70 py-2 px-4 rounded-full transition"><UsersIcon className="h-5 w-5" /><span>Find Friends</span></button>
            </div>
        )}
        <div className="mt-12">
            <div className="border-b border-gray-700">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    {tabs.map(tab => {
                        const tabId = typeof tab === 'object' ? tab.id : tab;
                        const tabLabel = typeof tab === 'object' ? tab.id : tab;
                        const tabCount = typeof tab === 'object' ? tab.count : 0;
                        const isActive = (typeof activeTab === 'object' && activeTab !== null ? activeTab.id : activeTab) === tabId;
                        return (
                            <button key={tabId} onClick={() => setActiveTab(tab)} className={`relative whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${isActive ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'}`}>
                                {tabLabel}
                                {tabCount > 0 && <span className="absolute top-3 -right-3 ml-2 bg-indigo-600 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">{tabCount}</span>}
                            </button>
                        );
                    })}
                </nav>
            </div>
            <div className="mt-6">{renderContent()}</div>
        </div>
    </div>
    {isHeaderActionsOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={() => setIsHeaderActionsOpen(false)}>
            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 w-full max-w-sm m-4 text-white shadow-2xl animate-slide-up" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-center mb-4">{user.name}</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                    <button className="flex flex-col items-center space-y-2 p-2 rounded-lg hover:bg-gray-700"><ShareIcon/><span>Share</span></button>
                    <button className="flex flex-col items-center space-y-2 p-2 rounded-lg hover:bg-gray-700"><MicIcon/><span>Start Room</span></button>
                    <button className="flex flex-col items-center space-y-2 p-2 rounded-lg hover:bg-gray-700"><StarIcon/><span>Favorite</span></button>
                </div>
            </div>
        </div>
    )}
    </>
  );
};

export default ProfileView;
