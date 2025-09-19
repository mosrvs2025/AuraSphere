import React, { useState } from 'react';

interface CreateNoteViewProps {
  onPost: (data: { content: string }, scheduleDate?: Date) => void;
  onClose: () => void;
}

const CreateNoteView: React.FC<CreateNoteViewProps> = ({ onPost, onClose }) => {
  const [content, setContent] = useState('');
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');

  const handlePost = () => {
    if (content.trim()) {
      onPost({ content }, isScheduling && scheduleDate ? new Date(scheduleDate) : undefined);
    }
  };

  const canPost = content.trim().length > 0 && (!isScheduling || (isScheduling && scheduleDate));
  
  const getMinScheduleDate = () => {
      const now = new Date();
      now.setMinutes(now.getMinutes() + 1); // Cannot schedule in the past
      return now.toISOString().slice(0, 16);
  };

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
          disabled={!canPost}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-6 rounded-full text-lg transition disabled:bg-indigo-800/50 disabled:cursor-not-allowed"
        >
          {isScheduling ? 'Schedule Note' : 'Post Now'}
        </button>
      </footer>
    </div>
  );
};

export default CreateNoteView;