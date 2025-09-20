import React, { useEffect } from 'react';
import { DocumentTextIcon, GlobeIcon } from './Icons';

interface PostCreationAnimationProps {
  type: 'image' | 'video' | 'note';
  imageUrl?: string;
  onAnimationComplete: () => void;
}

const PostCreationAnimation: React.FC<PostCreationAnimationProps> = ({ type, imageUrl, onAnimationComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onAnimationComplete();
    }, 2300); // Duration of the animation sequence

    return () => clearTimeout(timer);
  }, [onAnimationComplete]);

  const renderPreview = () => {
    if ((type === 'image' || type === 'video') && imageUrl) {
      return <img src={imageUrl} alt="Post preview" className="w-full h-full object-cover" />;
    }
    if (type === 'note') {
      return <div className="w-full h-full bg-gray-700 flex items-center justify-center"><DocumentTextIcon className="w-16 h-16 text-gray-400" /></div>;
    }
    return null;
  };

  return (
    <div className="fixed inset-0 bg-gray-900/90 backdrop-blur-md z-[9999] flex flex-col items-center justify-center overflow-hidden animate-glow-fade-in">
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Content Preview */}
        <div className="w-48 h-64 bg-gray-800 rounded-lg shadow-2xl shadow-black/50 overflow-hidden animate-content-appear">
          {renderPreview()}
        </div>
        
        {/* Aura Particle */}
        <div className="absolute animate-aura-travel">
          <div className="w-8 h-8 bg-indigo-400 rounded-full blur-xl"></div>
        </div>

        {/* Destination Globe */}
        <div className="absolute bottom-1/4 animate-globe-appear">
            <GlobeIcon className="w-24 h-24 text-indigo-500/50" />
        </div>
      </div>
      
      <p className="absolute bottom-[35%] text-gray-300 text-lg font-semibold animate-text-appear">
        Sharing to the AuraSphere...
      </p>
    </div>
  );
};

export default PostCreationAnimation;
