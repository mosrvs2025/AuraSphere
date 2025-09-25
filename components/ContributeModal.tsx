import React, { useState } from 'react';
import { User, DiscoverItem } from '../types.ts';
import { DocumentTextIcon, VideoCameraIcon } from './Icons';
import AudioPlayer from './AudioPlayer';

type PostType = Extract<DiscoverItem, { type: 'text_post' | 'image_post' | 'video_post' | 'voice_note_post' }>;

interface ContributeModalProps {
  recipient: User;
  currentUserPosts: PostType[];
  onClose: () => void;
  onSendRequest: (post: PostType) => void;
}

const PostGridItem: React.FC<{ post: PostType; isSelected: boolean; onSelect: () => void; }> = ({ post, isSelected, onSelect }) => {
    return (
        <button 
            onClick={onSelect} 
            className={`aspect-square bg-gray-800 rounded-md overflow-hidden relative group focus:outline-none transition-all duration-200 ${isSelected ? 'ring-4 ring-indigo-500' : 'focus:ring-2 focus:ring-indigo-500'}`}
        >
            {post.type === 'image_post' && <img src={post.imageUrl} className="w-full h-full object-cover" />}
            {post.type === 'video_post' && (
                <>
                    <img src={post.thumbnailUrl} className="w-full h-full object-cover" />
                    <div className="absolute top-1 right-1 text-white bg-black/30 rounded-full"><VideoCameraIcon className="w-4 h-4 p-0.5" /></div>
                </>
            )}
            {post.type === 'text_post' && (
                <div className="p-2 flex flex-col justify-between h-full">
                    <p className="text-left text-xs text-gray-300 line-clamp-4">{post.content}</p>
                    <DocumentTextIcon className="w-5 h-5 text-gray-500 self-end" />
                </div>
            )}
             {post.type === 'voice_note_post' && (
                <div className="p-2 flex flex-col justify-center items-center h-full">
                   <p className="text-left text-xs text-gray-300 line-clamp-2 mb-1">{post.caption}</p>
                   <AudioPlayer src={post.voiceMemo.url} />
                </div>
            )}
            <div className={`absolute inset-0 transition-colors ${isSelected ? 'bg-black/40' : 'bg-black/0 group-hover:bg-black/20'}`}></div>
        </button>
    );
};


const ContributeModal: React.FC<ContributeModalProps> = ({ recipient, currentUserPosts, onClose, onSendRequest }) => {
    const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

    const handleSend = () => {
        const selectedPost = currentUserPosts.find(p => p.id === selectedPostId);
        if (selectedPost) {
            onSendRequest(selectedPost);
        }
    };
  
    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-gray-800 border border-gray-700 rounded-2xl w-full max-w-2xl m-4 text-white shadow-2xl animate-slide-up flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b border-gray-700 flex-shrink-0">
                    <h3 className="text-xl font-bold text-center">Contribute to @{recipient.name}'s Profile</h3>
                    <p className="text-sm text-gray-400 text-center mt-1">Select one of your posts to send for their review.</p>
                </header>

                <main className="flex-1 p-4 overflow-y-auto">
                    {currentUserPosts.length > 0 ? (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                            {currentUserPosts.map(post => (
                                <PostGridItem 
                                    key={post.id}
                                    post={post}
                                    isSelected={selectedPostId === post.id}
                                    onSelect={() => setSelectedPostId(post.id)}
                                />
                            ))}
                        </div>
                    ) : (
                         <div className="text-center py-20 text-gray-500">
                            <p>You don't have any posts to contribute yet.</p>
                        </div>
                    )}
                </main>

                <footer className="p-4 border-t border-gray-700 flex-shrink-0 flex justify-end space-x-3">
                    <button onClick={onClose} className="bg-gray-700 hover:bg-gray-600 font-semibold py-2 px-5 rounded-full text-sm">Cancel</button>
                    <button onClick={handleSend} disabled={!selectedPostId} className="bg-indigo-600 hover:bg-indigo-500 font-semibold py-2 px-5 rounded-full text-sm disabled:bg-indigo-800/50 disabled:cursor-not-allowed">Send for Review</button>
                </footer>
            </div>
        </div>
    );
};

export default ContributeModal;