import React from 'react';
import { Notification } from '../types';
import { BellIcon } from './Icons';

interface NotificationsViewProps {
  notifications: Notification[];
  onNotificationClick: (notification: Notification) => void;
  onBack: () => void;
}

const NotificationsView: React.FC<NotificationsViewProps> = ({ notifications, onNotificationClick, onBack }) => {

  const unreadNotifications = notifications.filter(n => !n.isRead);

  return (
    <div className="p-4 md:p-6 animate-fade-in">
      <div className="max-w-2xl mx-auto">
         <header className="mb-6">
            <button onClick={onBack} className="text-indigo-400 hover:text-indigo-300 font-semibold text-sm flex items-center space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Back</span>
            </button>
        </header>

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Notifications</h1>
           {unreadNotifications.length > 0 && (
              <button onClick={() => unreadNotifications.forEach(onNotificationClick)} className="text-sm font-semibold text-indigo-400 hover:text-indigo-300">
                  Mark all as read
              </button>
           )}
        </div>
        
        <div className="space-y-2">
          {notifications.length > 0 ? (
            notifications.map(notif => (
              <button
                key={notif.id}
                onClick={() => onNotificationClick(notif)}
                className={`w-full flex items-start p-4 rounded-lg transition-colors relative text-left ${notif.isRead ? 'bg-gray-800/30 hover:bg-gray-800/60' : 'bg-indigo-900/20 hover:bg-indigo-900/40'}`}
              >
                {!notif.isRead && <span className="absolute top-1/2 -translate-y-1/2 left-3 w-2 h-2 bg-indigo-500 rounded-full"></span>}
                <div className={!notif.isRead ? 'ml-7' : 'ml-2'}>
                  <p className={`text-sm ${notif.isRead ? 'text-gray-400' : 'text-white'}`}>{notif.text}</p>
                  <p className="text-xs text-gray-500 mt-1">{notif.createdAt.toLocaleString()}</p>
                </div>
              </button>
            ))
          ) : (
              <div className="text-center py-20 bg-gray-800/50 rounded-lg">
                  <BellIcon />
                  <p className="mt-4 text-gray-400">You have no notifications yet.</p>
              </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsView;