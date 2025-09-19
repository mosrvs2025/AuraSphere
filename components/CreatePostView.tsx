import React, { useState } from 'react';

interface CreatePostViewProps {
  file: {
    url: string;
    type: 'image' | 'video';
  };
  onPost: (data: { caption: string }, scheduleDate?: Date) => void;
  onClose: () => void;
}

const CreatePostView: React.FC<CreatePostViewProps> = ({ file, onPost, onClose }) => {
  const [caption, setCaption] = useState('');
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');

  const handlePost = () => {
    onPost({ caption }, isScheduling && scheduleDate ? new Date(scheduleDate) : undefined);
  };
  
  const getMinScheduleDate = () => {
      const now = new Date();
      now.setMinutes(now.getMinutes() + 1); // Cannot schedule in the past
      return now.toISOString().slice(0, 16);
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
      <footer className="p-4 flex-shrink-0 space-y-4">
        <div className="bg-gray-800/50 p-3 rounded-lg">
            <div className="flex items-center justify-between">
                <label htmlFor="schedule-toggle" className="font-medium text-gray-300 cursor-pointer">Schedule for Later</label>
                <div className="relative inline-flex items-center cursor-pointer">
                <input 
                    type="checkbox" 
                    checked={isScheduling}
                    onChange={(e) => {
                        setIsScheduling(e.target.checked);
                        if(e.target.checked && !scheduleDate) {
                            setScheduleDate(getMinScheduleDate());
                        }
                    }}
                    id="schedule-toggle" 
                    className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-4 peer-focus:ring-indigo-500/50 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </div>
            </div>
            {isScheduling && (
                 <div className="mt-4 animate-fade-in">
                    <input 
                        type="datetime-local"
                        value={scheduleDate}
                        onChange={(e) => setScheduleDate(e.target.value)}
                        min={getMinScheduleDate()}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    />
                </div>
            )}
        </div>
        <button
          onClick={handlePost}
          disabled={isScheduling && !scheduleDate}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-6 rounded-full text-lg transition disabled:bg-indigo-800/50 disabled:cursor-not-allowed"
        >
          {isScheduling ? 'Schedule Post' : 'Post Now'}
        </button>
      </footer>
    </div>
  );
};

export default CreatePostView;