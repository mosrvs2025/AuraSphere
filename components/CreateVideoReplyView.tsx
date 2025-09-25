import React, { useState } from 'react';
import VideoRecorderModal from './VideoRecorderModal';
import { Comment, DiscoverItem } from '../types.ts';

interface CreateVideoReplyViewProps {
  replyInfo: {
    post: DiscoverItem;
    comment: Comment;
  };
  onPost: (data: { caption: string }, file: { url: string; type: 'video' }) => void;
  onClose: () => void;
}

const CommentSticker: React.FC<{ comment: Comment }> = ({ comment }) => (
    <div className="absolute top-4 left-4 right-4 bg-black/50 backdrop-blur-md p-3 rounded-lg text-white text-sm border border-white/20 shadow-lg pointer-events-none">
        <p className="font-bold">Replying to @{comment.user.name}</p>
        <p className="text-gray-200 mt-1">"{comment.text}"</p>
    </div>
);


const CreateVideoReplyView: React.FC<CreateVideoReplyViewProps> = ({ replyInfo, onPost, onClose }) => {
    const [recordedVideo, setRecordedVideo] = useState<{ url: string; duration: number } | null>(null);

    const handleVideoSend = (url: string, duration: number) => {
        const file = { url, type: 'video' as const };
        const data = { caption: `Replying to @${replyInfo.comment.user.name}` };
        onPost(data, file);
    };

    // This component primarily serves to launch the full-screen recorder with an overlay.
    // The VideoRecorderModal itself will handle the recording UI. We just need to render it.
    return (
        <VideoRecorderModal
            onClose={onClose}
            onSend={handleVideoSend}
        >
            <CommentSticker comment={replyInfo.comment} />
        </VideoRecorderModal>
    );
};

export default CreateVideoReplyView;