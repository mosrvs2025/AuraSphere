
import React, { useState, useContext } from 'react';
import { User, Room, DiscoverItem, ContributionRequest, ActiveView } from '../types.ts';
import { UserContext } from '../context/UserContext.ts';
import { DiscoverCard } from './DiscoverCards.tsx';
import { ShieldCheckIcon, UserPlusIcon } from './Icons.tsx';
import ContributeModal from './ContributeModal.tsx';

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

type ProfileTab = 'posts' | 'contributions';

const ProfileView: React.FC<ProfileViewProps> = (props) => {
    const { user, allPosts, onBack, onEditProfile, onViewMedia, onViewPost, contributionRequests, onUpdateContributionRequest, onNavigate } = props;
    const { currentUser, followUser, unfollowUser } = useContext(UserContext);
    const isOwnProfile = user.id === currentUser.id;
    const isFollowing = currentUser.following.some(f => f.id === user.id);
    const [activeTab, setActiveTab] = useState<ProfileTab>('posts');
    const [isContributeModalOpen, setContributeModalOpen] = useState(false);

    const userPosts = allPosts.filter(p => 'author' in p && p.author.id === user.id);
    
    // Masonry layout for posts
    const columns = [[], [], []] as DiscoverItem[][];
    userPosts.forEach((item, i) => {
        columns[i % 3].push(item);
    });
    
    const handleFollowToggle = () => {
        if (isFollowing) {
            unfollowUser(user.id);
        } else {
            followUser(user.id);
        }
    };

    const canContribute = () => {
        if (user.contributionSettings === 'none') return false;
        if (user.contributionSettings === 'following' && !user.followers.some(f => f.id === currentUser.id)) return false;
        return true;
    };
    
    return (
        <>
            <div className="p-4 md:p-6 animate-fade-in">
                <header className="mb-6 flex items-center">
                    <button onClick={onBack} className="text-indigo-400 hover:text-indigo-300 font-semibold text-sm flex items-center space-x-2 mr-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                        <span>Back</span>
                    </button>
                </header>

                <div className="max-w-4xl mx-auto">
                    <div className="flex flex-col sm:flex-row items-center text-center sm:text-left">
                        <img src={user.avatarUrl} alt={user.name} className="w-24 h-24 rounded-full mb-4 sm:mb-0 sm:mr-6" />
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold">{user.name}</h1>
                            <div className="flex items-center justify-center sm:justify-start space-x-6 my-2 text-gray-400">
                                <div><span className="font-bold text-white">{user.followers.length}</span> Followers</div>
                                <div><span className="font-bold text-white">{user.following.length}</span> Following</div>
                            </div>
                            <p className="text-sm text-gray-300 mt-2">{user.bio || 'No bio available.'}</p>
                        </div>
                    </div>
                    <div className="mt-6 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                        {isOwnProfile ? (
                            <>
                                <button onClick={onEditProfile} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-full transition">Edit Profile</button>
                                <button onClick={() => onNavigate({ view: 'privacy_dashboard'})} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-full transition flex items-center justify-center space-x-2">
                                    <ShieldCheckIcon className="w-5 h-5" />
                                    <span>Privacy</span>
                                </button>
                            </>
                        ) : (
                            <>
                                <button onClick={handleFollowToggle} className={`flex-1 font-bold py-2 px-4 rounded-full transition ${isFollowing ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-white hover:bg-gray-200 text-black'}`}>{isFollowing ? 'Unfollow' : 'Follow'}</button>
                                {canContribute() && (
                                     <button onClick={() => setContributeModalOpen(true)} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-full transition flex items-center justify-center space-x-2">
                                        <UserPlusIcon className="w-5 h-5" />
                                        <span>Contribute</span>
                                    </button>
                                )}
                            </>
                        )}
                    </div>

                    <div className="border-b border-gray-700 mt-8">
                        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                            <button onClick={() => setActiveTab('posts')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'posts' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'}`}>
                                Posts
                            </button>
                            <button onClick={() => setActiveTab('contributions')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'contributions' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'}`}>
                                Contributions {contributionRequests.length > 0 && <span className="ml-2 bg-indigo-600 text-white text-xs font-bold rounded-full px-2 py-0.5">{contributionRequests.filter(r => r.status === 'pending').length}</span>}
                            </button>
                        </nav>
                    </div>

                    <div className="mt-6">
                        {activeTab === 'posts' && (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {columns.map((col, colIndex) => (
                                <div key={colIndex} className="flex flex-col gap-2">
                                    {col.map((item) => (
                                    <DiscoverCard
                                        key={`${item.type}-${item.id}`}
                                        item={item}
                                        onEnterRoom={() => {}}
                                        onViewProfile={props.onViewProfile}
                                        onViewMedia={onViewMedia}
                                        onViewPost={onViewPost}
                                    />
                                    ))}
                                </div>
                                ))}
                            </div>
                        )}
                         {activeTab === 'contributions' && (
                           <div className="space-y-4">
                                {contributionRequests.map(req => (
                                    <div key={req.id} className="bg-gray-800/50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-400">
                                            <span className="font-bold text-indigo-400">{req.fromUser.name}</span> wants to contribute a post.
                                        </p>
                                        <div className="my-4">
                                             <DiscoverCard
                                                item={req.post}
                                                onEnterRoom={() => {}}
                                                onViewProfile={props.onViewProfile}
                                                onViewMedia={onViewMedia}
                                                onViewPost={onViewPost}
                                            />
                                        </div>
                                        {req.status === 'pending' && isOwnProfile && (
                                            <div className="flex justify-end space-x-2">
                                                <button onClick={() => onUpdateContributionRequest(req.id, 'declined')} className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-1 px-4 rounded-full text-sm">Decline</button>
                                                <button onClick={() => onUpdateContributionRequest(req.id, 'approved')} className="bg-green-600 hover:bg-green-500 text-white font-semibold py-1 px-4 rounded-full text-sm">Approve</button>
                                            </div>
                                        )}
                                        {req.status !== 'pending' && <p className="text-right text-sm font-bold uppercase text-gray-500">{req.status}</p>}
                                    </div>
                                ))}
                           </div>
                        )}
                    </div>
                </div>
            </div>
            {isContributeModalOpen && (
                <ContributeModal 
                    recipient={user}
                    currentUserPosts={allPosts.filter(p => 'author' in p && p.author.id === currentUser.id) as any}
                    onClose={() => setContributeModalOpen(false)}
                    onSendRequest={(post) => {
                        console.log('Sending request for post', post.id);
                        setContributeModalOpen(false);
                    }}
                />
            )}
        </>
    );
};

export default ProfileView;
