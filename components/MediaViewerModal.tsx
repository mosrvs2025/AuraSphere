import React from 'react';
import { DiscoverItem } from '../types';

interface MediaViewerModalProps {
  post: Extract<DiscoverItem, { type: 'image_post' | 'video_post' }>;
  onClose: () => void;
}

const MediaViewerModal: React.FC<MediaViewerModalProps> = ({ post, onClose }) => {
  const mediaUrl = post.type === 'image_post' ? post.imageUrl : post.videoUrl;
  const mediaType = post.type === 'image_post' ? 'image' : 'video';

  return (
    <div 
      className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center animate-fade-in p-4"
      onClick={onClose}
    >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-white text-3xl font-bold hover:text-gray-300 z-20"
          aria-label="Close media viewer"
        >
          &times;
        </button>
        
        {/* Main media content */}
        <div className="relative w-full h-full flex items-center justify-center" onClick={e => e.stopPropagation()}>
            <div className="max-w-4xl max-h-[85vh] w-auto">
                {mediaType === 'image' ? (
                    <img src={mediaUrl} alt={post.caption || 'Media content'} className="object-contain h-full w-full rounded-lg" />
                ) : (
                    <video src={mediaUrl} controls autoPlay className="object-contain h-full w-full rounded-lg" />
                )}
            </div>
        </div>
        
        {/* Bottom Info Panel */}
        <div 
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white w-full max-w-4xl mx-auto"
            onClick={e => e.stopPropagation()}
        >
            <div className="flex items-center mb-3">
                <img src={post.author.avatarUrl} alt={post.author.name} className="w-10 h-10 rounded-full mr-3 border-2 border-white/50" />
                <div>
                    <p className="font-bold">{post.author.name}</p>
                </div>
            </div>
            {post.caption && <p className="text-sm text-gray-200 mb-4">{post.caption}</p>}
            
            <div className="flex items-center space-x-6 text-gray-300">
                <button className="flex items-center space-x-2 hover:text-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                    <span>{post.likes}</span>
                </button>
                <button className="flex items-center space-x-2 hover:text-white transition-colors">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                    {/* FIX: Changed post.comments to post.comments.length to display the count instead of trying to render an array of objects. */}
                    <span>{post.comments.length}</span>
                </button>
                <button className="flex items-center space-x-2 hover:text-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6.002l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.367a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" /></svg>
                    <span>Share</span>
                </button>
            </div>
        </div>
    </div>
  );
};

export default MediaViewerModal;