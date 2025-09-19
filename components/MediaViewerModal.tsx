import React from 'react';

interface MediaViewerModalProps {
  mediaUrl: string;
  mediaType: 'image' | 'video';
  onClose: () => void;
}

const MediaViewerModal: React.FC<MediaViewerModalProps> = ({ mediaUrl, mediaType, onClose }) => {
  return (
    <div 
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center animate-fade-in p-4"
      onClick={onClose}
    >
      <div className="relative max-w-4xl max-h-[90vh] w-full" onClick={e => e.stopPropagation()}>
        <button 
          onClick={onClose}
          className="absolute -top-10 right-0 text-white text-3xl font-bold hover:text-gray-300"
          aria-label="Close media viewer"
        >
          &times;
        </button>
        {mediaType === 'image' ? (
          <img src={mediaUrl} alt="Media content" className="w-full h-full object-contain" />
        ) : (
          <video src={mediaUrl} controls autoPlay className="w-full h-full object-contain" />
        )}
      </div>
    </div>
  );
};

export default MediaViewerModal;
