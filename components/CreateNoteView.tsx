import React, { useState } from 'react';

interface CreateNoteViewProps {
  onPost: (data: { content: string }) => void;
  onClose: () => void;
}

const CreateNoteView: React.FC<CreateNoteViewProps> = ({ onPost, onClose }) => {
  const [content, setContent] = useState('');

  const handlePost = () => {
    if (content.trim()) {
      onPost({ content });
    }
  };

  const canPost = content.trim().length > 0;

  return (
    <div className="h-full flex flex-col max-w-2xl mx-auto animate-fade-in">
      <header className="flex items-center justify-between p-4 border-b border-gray-800 flex-shrink-0">
        <button onClick={onClose} className="text-gray-400 hover:text-white font-semibold text-sm">
          Cancel
        </button>
        <h1 className="text-lg font-bold">Write a Note</h1>
        <div className="w-16"></div>
      </header>

      <main className="flex-1 p-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full h-full bg-transparent resize-none focus:outline-none text-lg leading-relaxed"
          autoFocus
        />
      </main>
      <footer className="p-4 flex-shrink-0">
        <button
          onClick={handlePost}
          disabled={!canPost}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-6 rounded-full text-lg transition disabled:bg-indigo-800/50 disabled:cursor-not-allowed"
        >
          Post
        </button>
      </footer>
    </div>
  );
};

export default CreateNoteView;