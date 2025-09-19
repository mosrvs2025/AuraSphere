import React from 'react';
import { Notification } from '../types';
import { BellIcon } from './Icons';

interface NotificationsViewProps {
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
}

const NotificationsView: React.FC<NotificationsViewProps> = ({ notifications, setNotifications }) => {

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const hasUnread = notifications.some(n => !n.isRead);

  return (
    <div className="p-4 md:p-6 animate-fade-in">
      <header className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white tracking-tight">Notifications</h1>
        {hasUnread && (
            <button onClick={markAllAsRead} className="text-sm font-semibold text-indigo-400 hover:text-indigo-300">
                Mark all as read
            </button>
        )}
      </header>
      <div className="max-w-2xl mx-auto space-y-2">
        {notifications.length > 0 ? (
          notifications.map(notif => (
            <div 
              key={notif.id}
              className={`flex items-start p-4 rounded-lg transition-colors relative ${notif.isRead ? 'bg-gray-800/30' : 'bg-indigo-900/20'}`}
            >
              {!notif.isRead && <span className="absolute top-4 left-2 w-2 h-2 bg-indigo-500 rounded-full"></span>}
              <div className="ml-5">
                 <p className={`text-sm ${notif.isRead ? 'text-gray-400' : 'text-white'}`}>{notif.text}</p>
                 <p className="text-xs text-gray-500 mt-1">{notif.createdAt.toLocaleString()}</p>
              </div>
            </div>
          ))
        ) : (
            <div className="text-center py-20 bg-gray-800/50 rounded-lg">
                <BellIcon />
                <p className="mt-4 text-gray-400">You have no notifications yet.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsView;