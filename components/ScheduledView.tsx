// Implemented the ScheduledView to display upcoming rooms.
import React, { useState } from 'react';
import { Room, DiscoverItem } from '../types';
import { DocumentTextIcon, ImageIcon, ScheduledIcon, VideoCameraIcon } from './Icons';
import ScheduledRoomDetailView from './ScheduledRoomDetailView';

interface ScheduledViewProps {
  rooms: Room[];
  discoverItems: DiscoverItem[];
}

const ScheduledView: React.FC<ScheduledViewProps> = ({ rooms, discoverItems }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  if (selectedRoom) {
    return <ScheduledRoomDetailView room={selectedRoom} onBack={() => setSelectedRoom(null)} />;
  }

  const scheduledRooms = rooms.filter(r => r.isScheduled);
  const scheduledPosts = discoverItems.filter(item =>
      (item.type === 'image_post' || item.type === 'video_post' || item.type === 'text_post') &&
      item.status === 'scheduled' &&
      item.scheduledTime
  );

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const days = [];
    
    // Add days from previous month to fill the first week
    const startDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday
    for (let i = 0; i < startDayOfWeek; i++) {
        const date = new Date(year, month, i - startDayOfWeek + 1);
        days.push({ date, isCurrentMonth: false });
    }
    
    // Add days of the current month
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
        const date = new Date(year, month, i);
        days.push({ date, isCurrentMonth: true });
    }
    
    // Add days from next month to fill the grid
    const remaining = 42 - days.length; // Ensure 6 rows
    for (let i = 1; i <= remaining; i++) {
        const date = new Date(year, month + 1, i);
        days.push({ date, isCurrentMonth: false });
    }
    
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const getPostTitle = (post: typeof scheduledPosts[0]) => {
        if (post.type === 'text_post') return post.content;
        return post.caption || `Scheduled ${post.type.split('_')[0]}`;
    };

    const getPostIcon = (post: typeof scheduledPosts[0]) => {
        switch (post.type) {
            case 'image_post': return <ImageIcon className="h-4 w-4 mr-1 flex-shrink-0" />;
            case 'video_post': return <VideoCameraIcon className="h-4 w-4 mr-1 flex-shrink-0" />;
            case 'text_post': return <DocumentTextIcon className="h-4 w-4 mr-1 flex-shrink-0" />;
            default: return null;
        }
    };

    return (
      <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
        <div className="flex justify-between items-center mb-4">
          <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-gray-700 transition" aria-label="Previous month">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
          </button>
          <h2 className="text-xl font-bold">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
          <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-gray-700 transition" aria-label="Next month">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
          </button>
        </div>
        <div className="grid grid-cols-7 gap-px bg-gray-700/50">
          {weekdays.map(day => <div key={day} className="text-center text-xs text-gray-400 font-bold py-2 bg-gray-900/30">{day}</div>)}
          {days.map(({ date, isCurrentMonth }, index) => {
            const dayRooms = scheduledRooms.filter(room => room.scheduledTime && new Date(room.scheduledTime).toDateString() === date.toDateString());
            const dayPosts = scheduledPosts.filter(post => post.scheduledTime && new Date(post.scheduledTime).toDateString() === date.toDateString());
            const isToday = new Date().toDateString() === date.toDateString();

            return (
              <div key={index} className={`h-28 p-1 overflow-y-auto ${isCurrentMonth ? 'bg-gray-800/80' : 'bg-gray-800/30'}`}>
                <div className={`text-xs flex items-center justify-center ${isCurrentMonth ? 'text-white' : 'text-gray-500'} ${isToday ? 'bg-indigo-600 rounded-full w-5 h-5 font-bold' : 'w-5 h-5'}`}>
                  {date.getDate()}
                </div>
                <div className="mt-1 space-y-1">
                    {dayRooms.map(room => (
                        <button key={room.id} onClick={() => setSelectedRoom(room)} className="w-full text-left text-xs bg-indigo-800 hover:bg-indigo-700 p-1 rounded-md truncate text-white" title={room.title}>
                            {room.title}
                        </button>
                    ))}
                    {dayPosts.map(post => (
                        <div key={post.id} className="w-full text-left text-xs bg-gray-600 p-1 rounded-md text-gray-200 flex items-start" title={getPostTitle(post)}>
                           {getPostIcon(post)}
                           <span className="truncate flex-1">{getPostTitle(post)}</span>
                        </div>
                    ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-6 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        {scheduledRooms.length > 0 || scheduledPosts.length > 0 ? (
          renderCalendar()
        ) : (
          <div className="text-center py-20 bg-gray-800/50 rounded-lg border border-gray-700">
            <div className="inline-block p-4 bg-gray-800 rounded-full mb-4 text-gray-500">
                <ScheduledIcon />
            </div>
            <h2 className="text-xl font-bold text-gray-300">Nothing on the calendar</h2>
            <p className="text-gray-400 mt-2">There are no rooms or posts scheduled for later.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduledView;