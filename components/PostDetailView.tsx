import React from 'react';
import { DiscoverItem, User } from '../types';
import { SendIcon } from './Icons';

interface PostDetailViewProps {
  post: Extract<DiscoverItem, { type: 'text_post' }>;
  onBack: () => void;
  onViewProfile: (user: User) => void;
}

const PostDetailView: React.FC<PostDetailViewProps> = ({ post, onBack, onViewProfile }) => {
  return (
    <div className="p-4 md:p-6 animate-fade-in max-w-2xl mx-auto flex flex-col h-full">
      <header className="flex-shrink-0 mb-6">
        <button onClick={onBack} className="text-indigo-400 hover:text-indigo-300 font-semibold text-sm">&larr; Back to Discover</button>
      </header>
      
      <main className="flex-1 overflow-y-auto">
        {/* Post Content */}
        <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700/50">
          <button onClick={() => onViewProfile(post.author)} className="flex items-center mb-4 group text-left">
            <img src={post.author.avatarUrl} alt={post.author.name} className="w-12 h-12 rounded-full mr-4" />
            <div>
              <p className="font-bold text-white text-lg group-hover:text-indigo-400 transition-colors">{post.author.name}</p>
              <p className="text-xs text-gray-500">{post.createdAt.toLocaleString()}</p>
            </div>
          </button>
          <p className="text-gray-200 text-base whitespace-pre-wrap leading-relaxed">{post.content}</p>
        </div>
        
        {/* Comments Section */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-white mb-4">Comments ({post.comments})</h2>
          <div className="space-y-4">
            {/* Example Comment */}
            <div className="flex items-start space-x-3">
                <img src="https://i.pravatar.cc/150?img=15" alt="Commenter" className="w-8 h-8 rounded-full flex-shrink-0 mt-1" />
                <div>
                    <p className="font-bold text-sm text-indigo-300">Jane Doe</p>
                    <p className="text-sm text-gray-200 bg-gray-700/50 px-3 py-2 rounded-lg inline-block">This is a great point, thanks for sharing!</p>
                </div>
            </div>
             <div className="flex items-start space-x-3">
                <img src="https://i.pravatar.cc/150?img=16" alt="Commenter" className="w-8 h-8 rounded-full flex-shrink-0 mt-1" />
                <div>
                    <p className="font-bold text-sm text-indigo-300">John Smith</p>
                    <p className="text-sm text-gray-200 bg-gray-700/50 px-3 py-2 rounded-lg inline-block">Totally agree. I was thinking the same thing.</p>
                </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="flex-shrink-0 p-4 mt-4 bg-gray-900/70 backdrop-blur-sm -mx-4 sticky bottom-0">
        <form className="flex items-center bg-gray-800 rounded-full">
          <input
            type="text"
            placeholder="Add a comment..."
            className="bg-transparent w-full pl-4 p-3 text-sm focus:outline-none"
          />
          <button type="submit" className="p-3 text-indigo-400 hover:text-indigo-300" aria-label="Send comment">
            <SendIcon />
          </button>
        </form>
      </footer>
    </div>
  );
};

export default PostDetailView;
