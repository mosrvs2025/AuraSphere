import React, { useState } from 'react';

interface CreatePostViewProps {
  file: {
    url: string;
    type: 'image' | 'video';
  };
  onPost: (data: { caption: string }) => void;
  onClose: () => void;
}

const CreatePostView: React.FC<CreatePostViewProps> = ({ file, onPost, onClose }) => {
  const [caption, setCaption] = useState('');

  const handlePost = () => {
    onPost({ caption });
  };

  return (
    <div className="h-full flex flex-col max-w-2xl mx-auto animate-fade-in">
      <header className="flex items-center justify-between p-4 border-b border-gray-800 flex-shrink-0">
        <button onClick={onClose} className="text-indigo-400 hover:text-indigo-300 font-semibold text-sm">
          Back
        </button>
        <h1 className="text-lg font-bold">Finalize Post</h1>
        <div className="w-16"></div>
      </header>

      <main className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto min-h-0">
        <div className="flex-grow flex items-center justify-center bg-black rounded-lg">
          {file.type === 'image' ? (
            <img src={file.url} alt="Selected preview" className="max-h-full max-w-full object-contain rounded-lg" />
          ) : (
            <video src={file.url} controls autoPlay muted loop className="max-h-full max-w-full object-contain rounded-lg" />
          )}
        </div>
        <div className="flex-shrink-0">
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Add a caption... (optional)"
            rows={4}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-base"
          />
        </div>
      </main>
      <footer className="p-4 flex-shrink-0">
        <button
          onClick={handlePost}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-6 rounded-full text-lg transition"
        >
          Post
        </button>
      </footer>
    </div>
  );
};

export default CreatePostView;